import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyViewerToken } from '@/lib/viewer-token';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const pageStr = url.searchParams.get('page');

    if (!token || pageStr === null) {
      return new NextResponse('Missing authentication token or page index', { status: 400 });
    }

    // Verify cryptographic viewer session
    const verified = await verifyViewerToken(token);
    if (!verified || verified.docId !== id) {
      return new NextResponse('Unauthorized or expired session', { status: 401 });
    }

    const pageIndex = parseInt(pageStr, 10);
    if (isNaN(pageIndex) || pageIndex < 0) {
      return new NextResponse('Invalid page parameter', { status: 400 });
    }

    // Fetch document from database
    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        pages: true,
        visibility: true,
      },
    });

    if (!document) {
      return new NextResponse('Publication not found', { status: 404 });
    }

    const pages = document.pages as string[] | null;
    if (!pages || !pages[pageIndex]) {
      return new NextResponse('Page index not found', { status: 404 });
    }

    const targetUrl = pages[pageIndex];

    // Handle data:image base64 if present
    if (targetUrl.startsWith('data:image/')) {
      const parts = targetUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const buffer = Buffer.from(parts[1], 'base64');

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Content-Disposition': 'inline; filename="slice.bin"',
          'X-Content-Type-Options': 'nosniff',
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      });
    }

    // Otherwise stream from secure upstream storage (Cloudflare R2 / S3)
    const upstreamResponse = await fetch(targetUrl, {
      headers: {
        'Accept': 'image/*',
      },
    });

    if (!upstreamResponse.ok) {
      return new NextResponse('Failed to retrieve upstream slice', { status: 502 });
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const contentType = upstreamResponse.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Content-Disposition': 'inline; filename="slice.bin"',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  } catch (error) {
    console.error('[PAGE RENDER PROXY ERROR]:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
