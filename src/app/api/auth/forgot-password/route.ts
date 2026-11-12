import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

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
      // Don't leak whether user exists or not for security
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { status: 200 });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires,
      },
    });

    // Determine base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://e.whizpoint.app';
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, resetLink);

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
