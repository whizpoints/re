const fs = require('fs');

function patchFile(filePath, isUpdate = false) {
  let content = fs.readFileSync(filePath, 'utf-8');

  const uploadRegex = /const uploadPromises = extractedPages\.map\([\s\S]*?await Promise\.all\(uploadPromises\);/;
  
  const slugVar = isUpdate ? "targetId" : "slug";
  const authHeader = isUpdate ? `, 'Authorization': \\\`Bearer \${token}\\\`` : ``;
  const folderArg = isUpdate ? `\`documents/update-\${${slugVar}}\`` : `\`documents/\${${slugVar}}\``;

  const newUpload = `      // Upload sequentially to avoid network bottleneck and ensure UI updates
      for (let index = 0; index < extractedPages.length; index++) {
        const base64 = extractedPages[index];
        ${isUpdate ? `setUpdateProgress(\`Uploading page \${index + 1} of \${extractedPages.length}...\`);` : `setUploadProgressText(\`Uploading page \${index + 1} of \${extractedPages.length}...\`);\n        setPublishProgress(Math.floor((index / extractedPages.length) * 8));`}
        
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' ${authHeader} },
            body: JSON.stringify({ image: base64, folder: ${folderArg} })
          });
          const data = await res.json();
          if (data.url) {
            finalPageUrls[index] = data.url;
          }
        } catch (e) {
          console.error(\`Failed to upload page \${index + 1}\`, e);
        }
        completed++;
      }`;

  content = content.replace(uploadRegex, newUpload);
  fs.writeFileSync(filePath, content);
}

patchFile('src/app/admin/upload/page.tsx', false);
patchFile('src/app/admin/page.tsx', true);
