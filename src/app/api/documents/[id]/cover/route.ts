import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Support lookup by UUID or by document slug
    const document = await prisma.document.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      select: {
        id: true,
        pages: true,
        title: true,
      },
    });

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    const pages = document.pages as string[] | null;
    if (!pages || pages.length === 0 || !pages[0]) {
      return new NextResponse('Cover not found', { status: 404 });
    }

    const coverUrl = pages[0];

    // If base64
    if (coverUrl.startsWith('data:image/')) {
      const parts = coverUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const buffer = Buffer.from(parts[1], 'base64');

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          'Content-Disposition': 'inline; filename="cover.jpg"',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // Stream from secure storage
    const upstreamResponse = await fetch(coverUrl, {
      headers: {
        Accept: 'image/*',
      },
    });

    if (!upstreamResponse.ok) {
      return new NextResponse('Failed to retrieve cover', { status: 502 });
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const contentType = upstreamResponse.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'Content-Disposition': 'inline; filename="cover.jpg"',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[COVER PROXY ERROR]:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
