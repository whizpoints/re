const fs = require('fs');

let adminContent = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

const regex = /for\s*\(let\s+i\s*=\s*1;\s*i\s*<=\s*numPages;\s*i\+\+\)\s*\{[\s\S]*?extractedPages\.push.*?;\s*\}\s*\}/;

const newLoop = `      const N = numPages * 2;
      extractedPages.length = N;
      extractedPages.fill('');

      for (let i = 0; i < numPages; i++) {
        setUpdateProgress(\`Extracting spread \${i + 1} of \${numPages}...\`);
        const page = await pdf.getPage(i + 1);
        
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const scale = 3200 / unscaledViewport.width; // Super crisp 1600px per page
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          
          const halfWidth = canvas.width / 2;
          const height = canvas.height;
          
          const leftCanvas = document.createElement('canvas');
          leftCanvas.width = halfWidth;
          leftCanvas.height = height;
          leftCanvas.getContext('2d')?.drawImage(canvas, 0, 0, halfWidth, height, 0, 0, halfWidth, height);
          
          const rightCanvas = document.createElement('canvas');
          rightCanvas.width = halfWidth;
          rightCanvas.height = height;
          rightCanvas.getContext('2d')?.drawImage(canvas, halfWidth, 0, halfWidth, height, 0, 0, halfWidth, height);
          
          const leftData = leftCanvas.toDataURL('image/jpeg', 0.95);
          const rightData = rightCanvas.toDataURL('image/jpeg', 0.95);

          if (i % 2 === 0) {
            extractedPages[N - i - 1] = leftData;
            extractedPages[i] = rightData;
          } else {
            extractedPages[i] = leftData;
            extractedPages[N - i - 1] = rightData;
          }
        }
      }`;

adminContent = adminContent.replace(regex, newLoop);
fs.writeFileSync('src/app/admin/page.tsx', adminContent);
