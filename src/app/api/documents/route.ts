import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { sendDocumentPublishedEmail, sendDocumentUploadFailedEmail } from '@/lib/email';
import { getRequestBaseUrl } from '@/lib/url';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: { user_id: user.sub },
      select: {
        id: true,
        title: true,
        slug: true,
        visibility: true,
        custom_expiry_date: true,
        page_count: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug, visibility, customExpiryDate, logo_url, pages } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    // Check if slug is taken
    const existing = await prisma.document.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug is already in use' }, { status: 400 });
    }

    const { uploadBase64ToR2 } = await import('@/lib/s3');

    // Upload pages to R2 in parallel
    let docPages: string[] = [];
    if (pages && Array.isArray(pages)) {
      const uploadPromises = pages.map(async (pageStr, index) => {
        if (pageStr.startsWith('data:image')) {
          return uploadBase64ToR2(pageStr, `documents/${slug}`);
        }
        return pageStr;
      });
      docPages = await Promise.all(uploadPromises);
    } else {
      docPages.push('https://placehold.co/600x800/png');
    }

    // Upload logo to R2
    let finalLogoUrl = null;
    if (logo_url && logo_url.startsWith('data:image')) {
      finalLogoUrl = await uploadBase64ToR2(logo_url, `logos/${slug}`);
    } else {
      finalLogoUrl = logo_url || null;
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
    if (!dbUser?.is_email_verified) {
      return NextResponse.json({ error: 'Please verify your email to upload documents' }, { status: 403 });
    }

    let finalExpiryDate = customExpiryDate ? new Date(customExpiryDate) : null;
    if (dbUser.plan === 'FREE' && dbUser.email !== 'admin@whizpoint.app') {
      const maxExpiry = new Date();
      maxExpiry.setDate(maxExpiry.getDate() + 5);
      
      if (!finalExpiryDate || finalExpiryDate > maxExpiry) {
        finalExpiryDate = maxExpiry; // Enforce 5 days limit
      }
    }

    const document = await prisma.document.create({
      data: {
        user_id: user.sub,
        title,
        slug,
        visibility: visibility || 'Public',
        custom_expiry_date: finalExpiryDate,
        logo_url: finalLogoUrl,
        page_count: docPages.length,
        pages: docPages,
      },
    });

    // Send publication confirmation & marketing email to author
    try {
      const baseUrl = getRequestBaseUrl(req);
      await sendDocumentPublishedEmail({
        to: dbUser.email,
        name: dbUser.name,
        title: document.title,
        slug: document.slug,
        pageCount: document.page_count,
        isBooklet: body.format === 'a3-booklet' || docPages.length >= 4,
        baseUrl,
      });
    } catch (emailErr) {
      console.error('[DOCUMENTS API] Failed to send publication email:', emailErr);
    }

    return NextResponse.json({ message: 'Document created successfully', document }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
