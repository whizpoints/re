const fs = require('fs');
let content = fs.readFileSync('src/components/styled-qr.tsx', 'utf-8');

// Change width/height options internally to high-res (2000)
content = content.replace(
  "width: width,",
  "width: 2000,"
);
content = content.replace(
  "height: width,",
  "height: 2000,"
);
content = content.replace(
  "type: 'svg',",
  "type: 'canvas',"
);

// Scale it down visually
content = content.replace(
  "className=\"overflow-hidden rounded-xl bg-white shadow-xl flex items-center justify-center p-2\"",
  "className=\"overflow-hidden rounded-xl bg-white shadow-xl flex items-center justify-center p-2 [&>canvas]:w-full [&>canvas]:max-w-[300px] [&>canvas]:h-auto\""
);

fs.writeFileSync('src/components/styled-qr.tsx', content);

let modal = fs.readFileSync('src/components/qr-generator-modal.tsx', 'utf-8');
const oldDownload = `  const downloadQR = () => {
    const svg = document.querySelector('.qr-container svg') as SVGSVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`QR-\${documentTitle.replace(/\\s+/g, '-')}.svg\`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };`;

const newDownload = `  const downloadQR = () => {
    const canvas = document.querySelector('.qr-container canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`QR-\${documentTitle.replace(/\\s+/g, '-')}-HQ.png\`;
      a.click();
    }
  };`;

modal = modal.replace(oldDownload, newDownload);
fs.writeFileSync('src/components/qr-generator-modal.tsx', modal);
