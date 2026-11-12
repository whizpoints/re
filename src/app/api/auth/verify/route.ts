import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import prisma from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';
import { getRequestBaseUrl } from '@/lib/url';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev-only');

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing verification token' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { verification_token: token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        is_email_verified: true,
        verification_token: null,
      },
    });

    // Send Welcome email once user is successfully verified
    try {
      const baseUrl = getRequestBaseUrl(req);
      await sendWelcomeEmail(updatedUser.email, updatedUser.name, baseUrl);
    } catch (welcomeError) {
      console.error('[VERIFY] Error sending welcome email:', welcomeError);
    }

    // Generate JWT so user is immediately logged in upon email verification
    const authToken = await new SignJWT({ sub: updatedUser.id, email: updatedUser.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    return NextResponse.json(
      {
        message: 'Email verified successfully',
        token: authToken,
        user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
