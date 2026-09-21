const fs = require('fs');

let viewerContent = fs.readFileSync('src/components/flipbook-viewer.tsx', 'utf-8');

const targetStr = `className="w-full h-auto bg-white shadow-2xl rounded-sm select-none pointer-events-none" draggable={false} onContextMenu={(e) => e.preventDefault()}
                    draggable={false} onContextMenu={(e) => e.preventDefault()}`;

const replacementStr = `className="w-full h-auto bg-white shadow-2xl rounded-sm select-none pointer-events-none" draggable={false} onContextMenu={(e) => e.preventDefault()}`;

viewerContent = viewerContent.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/flipbook-viewer.tsx', viewerContent);
