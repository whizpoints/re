import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { getRequestBaseUrl } from '@/lib/url';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const verification_token = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        verification_token,
      },
    });

    const baseUrl = getRequestBaseUrl(req);
    const verifyLink = `${baseUrl}/auth/verify?token=${verification_token}`;
    
    // Await email dispatch so serverless execution context does not terminate before SMTP completes
    try {
      await sendVerificationEmail(email, name, verifyLink, baseUrl);
    } catch (emailError) {
      console.error('[SIGNUP] Error sending verification email:', emailError);
    }

    return NextResponse.json(
      { message: 'User created successfully. Please check your email to verify your account.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
