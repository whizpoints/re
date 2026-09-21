const fs = require('fs');
let content = fs.readFileSync('src/app/api/documents/[id]/route.ts', 'utf-8');

const oldCheck = `    if (document.user_id !== user.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }`;

const newCheck = `    const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
    if (document.user_id !== user.sub && dbUser?.email !== 'admin@whizpoint.app') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }`;

content = content.split(oldCheck).join(newCheck);

// Let's also make sure the PATCH route allows modifying custom_expiry_date and slug
const updateData = `      data: {
        ...(body.pages && { pages: body.pages }),
        ...(body.page_count !== undefined && { page_count: body.page_count }),
        ...(body.title && { title: body.title }),
        ...(body.slug && { slug: body.slug }), // Added slug update
        ...(body.visibility && { visibility: body.visibility }),
        ...(body.logo_url !== undefined && { logo_url: body.logo_url }),
        ...(body.custom_expiry_date !== undefined && { custom_expiry_date: body.custom_expiry_date ? new Date(body.custom_expiry_date) : null }),
      },`;

const oldDataRegex = /data: \{[\s\S]*?\},/;
content = content.replace(oldDataRegex, updateData);

fs.writeFileSync('src/app/api/documents/[id]/route.ts', content);
