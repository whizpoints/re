import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { getRequestBaseUrl } from '@/lib/url';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons, just return success
      return NextResponse.json({ message: 'Verification email sent' }, { status: 200 });
    }

    if (user.is_email_verified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verification_token: token,
      },
    });

    // Send email using dynamic request URL (supports Cloudflare tunnel, localhost, and prod)
    const baseUrl = getRequestBaseUrl(req);
    const verificationUrl = `${baseUrl}/auth/verify?token=${token}`;
    await sendVerificationEmail(email, user.name, verificationUrl, baseUrl);

    return NextResponse.json({ message: 'Verification email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
