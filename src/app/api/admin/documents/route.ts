import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
    
    // Only allow admin@whizpoint.app to access this
    if (dbUser?.email !== 'admin@whizpoint.app') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const documents = await prisma.document.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        visibility: true,
        custom_expiry_date: true,
        page_count: true,
        created_at: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
