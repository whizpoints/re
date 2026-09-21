const fs = require('fs');
let content = fs.readFileSync('src/app/api/admin/users/route.ts', 'utf-8');

const patchCode = `
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
`;

content += patchCode;
fs.writeFileSync('src/app/api/admin/users/route.ts', content);
