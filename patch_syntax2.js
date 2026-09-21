const fs = require('fs');

let viewerContent = fs.readFileSync('src/components/flipbook-viewer.tsx', 'utf-8');
viewerContent = viewerContent.replace(
  /draggable=\{false\} onContextMenu=\{\(e\) => e.preventDefault\(\)\} draggable=\{false\}/g,
  'draggable={false} onContextMenu={(e) => e.preventDefault()}'
);
// Also just clean any other exact duplicates of draggable
viewerContent = viewerContent.replace(
  /draggable=\{false\}[\s]+draggable=\{false\}/g,
  'draggable={false}'
);

fs.writeFileSync('src/components/flipbook-viewer.tsx', viewerContent);
