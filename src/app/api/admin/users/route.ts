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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        is_email_verified: true,
        plan: true,
        created_at: true,
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
    if (dbUser?.email !== 'admin@whizpoint.app') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, plan } = await req.json();
    if (!userId || !plan) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { plan }
    });

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating user plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
