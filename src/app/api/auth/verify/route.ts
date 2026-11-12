import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';
import { getRequestBaseUrl } from '@/lib/url';

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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_email_verified: true,
        verification_token: null,
      },
    });

    // Send Welcome email once user is successfully verified
    try {
      const baseUrl = getRequestBaseUrl(req);
      await sendWelcomeEmail(user.email, user.name, baseUrl);
    } catch (welcomeError) {
      console.error('[VERIFY] Error sending welcome email:', welcomeError);
    }

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
