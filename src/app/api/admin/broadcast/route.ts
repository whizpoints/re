import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { sendCustomHtmlEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
    if (dbUser?.email !== 'admin@whizpoint.app') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { subject, html, recipients, broadcastAll, wrapInTemplate = true } = body;

    if (!subject || !html) {
      return NextResponse.json({ error: 'Subject and HTML content are required' }, { status: 400 });
    }

    let targetEmails: string[] = [];

    if (broadcastAll) {
      const allUsers = await prisma.user.findMany({
        select: { email: true },
      });
      targetEmails = allUsers.map((u) => u.email).filter(Boolean);
    } else if (Array.isArray(recipients) && recipients.length > 0) {
      targetEmails = recipients.map((r: string) => r.trim()).filter((r: string) => r.length > 0 && r.includes('@'));
    } else if (typeof recipients === 'string') {
      targetEmails = recipients
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0 && r.includes('@'));
    }

    if (targetEmails.length === 0) {
      return NextResponse.json({ error: 'No valid recipient email addresses specified' }, { status: 400 });
    }

    // Deduplicate emails
    targetEmails = Array.from(new Set(targetEmails));

    const sentEmails: string[] = [];
    const failedEmails: { email: string; error: string }[] = [];

    for (const email of targetEmails) {
      try {
        const result = await sendCustomHtmlEmail({
          to: email,
          subject,
          html,
          wrapInBrandedTemplate: wrapInTemplate,
        });

        if (result) {
          sentEmails.push(email);
        } else {
          failedEmails.push({ email, error: 'Brevo SMTP dispatch returned null' });
        }
      } catch (err: any) {
        failedEmails.push({ email, error: err?.message || 'Send failed' });
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: sentEmails.length,
      failedCount: failedEmails.length,
      sentEmails,
      failedEmails,
    });
  } catch (error: any) {
    console.error('Error sending broadcast email:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
