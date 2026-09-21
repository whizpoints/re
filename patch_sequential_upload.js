const fs = require('fs');

function patchFile(filePath, isUpdate = false) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // We'll replace the block that starts with `const uploadPromises = extractedPages.map` and ends with `await Promise.all(uploadPromises);`
  
  const uploadRegex = /const uploadPromises = extractedPages\.map\([\s\S]*?await Promise\.all\(uploadPromises\);/;
  
  const newUpload = `      // Upload sequentially to avoid network bottleneck and ensure UI updates
      for (let index = 0; index < extractedPages.length; index++) {
        const base64 = extractedPages[index];
        ${isUpdate ? `setUpdateProgress(\`Uploading page \${index + 1} of \${extractedPages.length}...\`);` : `setUploadProgressText(\`Uploading page \${index + 1} of \${extractedPages.length}...\`);\n        setProgressMsg(\`Uploading page \${index + 1} of \${extractedPages.length}...\`);`}
        
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' ${isUpdate ? `, 'Authorization': \\\`Bearer \${token}\\\`` : ''} },
            body: JSON.stringify({ file: base64, path: \`documents/\${isUpdate ? doc.slug : slug}/page-\${index + 1}\` })
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
  
  // Also fix the text state update bug in upload/page.tsx
  // setUploadProgressText shouldn't be missed.
  if (!isUpdate) {
     content = content.replace("setUploadProgressText('Uploading pages...');", "");
  }

  fs.writeFileSync(filePath, content);
}

patchFile('src/app/admin/upload/page.tsx', false);
patchFile('src/app/admin/page.tsx', true);
