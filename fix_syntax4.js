const fs = require('fs');
let lines = fs.readFileSync('src/components/flipbook-viewer.tsx', 'utf-8').split('\n');
const out = [];
let skipNext = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('draggable={false} onContextMenu={(e) => e.preventDefault()}') && lines[i].includes('className="w-full h-auto')) {
     out.push(lines[i]);
     skipNext = true;
     continue;
  }
  if (skipNext && lines[i].includes('draggable={false} onContextMenu={(e) => e.preventDefault()}')) {
     skipNext = false;
     continue; // Skip the duplicated line
  }
  skipNext = false;
  out.push(lines[i]);
}
fs.writeFileSync('src/components/flipbook-viewer.tsx', out.join('\n'));
