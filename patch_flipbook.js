const fs = require('fs');
let content = fs.readFileSync('src/components/flipbook-viewer.tsx', 'utf-8');
content = content.replace(
  '<div className="fixed inset-0 bg-slate-900 flex flex-col overflow-hidden">',
  '<div className="fixed inset-0 bg-slate-900 flex flex-col overflow-hidden select-none" onContextMenu={(e) => e.preventDefault()}>'
);

content = content.replace(
  /draggable=\{false\}/g,
  'draggable={false} onContextMenu={(e) => e.preventDefault()}'
);
content = content.replace(
  /className="w-full h-auto bg-white shadow-2xl rounded-sm"/g,
  'className="w-full h-auto bg-white shadow-2xl rounded-sm select-none pointer-events-none" draggable={false} onContextMenu={(e) => e.preventDefault()}'
);
fs.writeFileSync('src/components/flipbook-viewer.tsx', content);
