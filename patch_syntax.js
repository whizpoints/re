const fs = require('fs');

// Fix admin/page.tsx syntax error
let adminContent = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');
adminContent = adminContent.replace(
  "'Authorization': \\`Bearer ${token}\\`",
  "'Authorization': `Bearer ${token}`"
);
fs.writeFileSync('src/app/admin/page.tsx', adminContent);

// Fix flipbook-viewer.tsx duplication
let viewerContent = fs.readFileSync('src/components/flipbook-viewer.tsx', 'utf-8');
viewerContent = viewerContent.replace(
  'draggable={false} onContextMenu={(e) => e.preventDefault()}\n                    draggable={false} onContextMenu={(e) => e.preventDefault()}',
  'draggable={false} onContextMenu={(e) => e.preventDefault()}'
);
fs.writeFileSync('src/components/flipbook-viewer.tsx', viewerContent);
