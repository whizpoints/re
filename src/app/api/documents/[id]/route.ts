import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
    if (document.user_id !== user.sub && dbUser?.email !== 'admin@whizpoint.app') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Document deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
    if (document.user_id !== user.sub && dbUser?.email !== 'admin@whizpoint.app') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update document
    const updatedDocument = await prisma.document.update({
      where: { id },
            data: {
        ...(body.pages && { pages: body.pages }),
        ...(body.page_count !== undefined && { page_count: body.page_count }),
        ...(body.title && { title: body.title }),
        ...(body.slug && { slug: body.slug }), // Added slug update
        ...(body.visibility && { visibility: body.visibility }),
        ...(body.logo_url !== undefined && { logo_url: body.logo_url }),
        ...(body.custom_expiry_date !== undefined && { custom_expiry_date: body.custom_expiry_date ? new Date(body.custom_expiry_date) : null }),
      },
    });

    return NextResponse.json({ document: updatedDocument }, { status: 200 });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
