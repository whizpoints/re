import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import prisma from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev-only');

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://e.whizpoint.app';

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=google_denied`);
  }

  try {
    // Exchange code for tokens
    const redirectUri = `${appUrl}/api/auth/callback/google`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error('Google token exchange failed:', tokenData);
      return NextResponse.redirect(`${appUrl}/auth/login?error=google_token_failed`);
    }

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userInfoRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${appUrl}/auth/login?error=google_no_email`);
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (user) {
      // Existing user — link Google ID if not already linked, and mark verified
      if (!user.google_id) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            google_id: googleUser.id,
            is_email_verified: true,
          },
        });
      }
    } else {
      // New user — create with Google data, no password, already verified
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split('@')[0],
          google_id: googleUser.id,
          is_email_verified: true,
        },
      });

      // Send welcome email to new Google user
      try {
        await sendWelcomeEmail(user.email, user.name);
      } catch (welcomeError) {
        console.error('[GOOGLE AUTH] Failed to send welcome email:', welcomeError);
      }
    }

    // Generate JWT
    const token = await new SignJWT({ sub: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Redirect to a client page that stores the token
    const redirectUrl = new URL('/auth/google-callback', appUrl);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('name', user.name);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(`${appUrl}/auth/login?error=google_failed`);
  }
}
