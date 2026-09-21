const fs = require('fs');

function patchToParallel(filePath, isUpdate = false) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Find the sequential upload loop
  const loopStart = "      // Upload sequentially to avoid network bottleneck and ensure UI updates";
  const loopEnd = "        completed++;\n      }";
  
  if (!content.includes(loopStart)) return;

  const startIndex = content.indexOf(loopStart);
  const endIndex = content.indexOf(loopEnd) + loopEnd.length;
  
  const oldLoop = content.substring(startIndex, endIndex);

  const slugVar = isUpdate ? "targetId" : "slug";
  const authHeader = `headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },`;
  const folderArg = isUpdate ? `\`documents/update-\${${slugVar}}\`` : `\`documents/\${${slugVar}}\``;

  const newLoop = `      // Parallel upload for maximum speed with progress tracking
      const uploadPromises = extractedPages.map(async (base64, index) => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            ${authHeader}
            body: JSON.stringify({ image: base64, folder: ${folderArg} })
          });
          const data = await res.json();
          if (data.url) {
            finalPageUrls[index] = data.url;
          }
        } catch (e) {
          console.error(\`Failed to upload page \${index + 1}\`, e);
        } finally {
          completed++;
          ${isUpdate ? `setUpdateProgress(\`Uploading page \${completed} of \${extractedPages.length}...\`);` : `setUploadProgressText(\`Uploading page \${completed} of \${extractedPages.length}...\`);\n          setPublishProgress(Math.floor((completed / extractedPages.length) * 8));`}
        }
      });
      await Promise.all(uploadPromises);`;

  content = content.replace(oldLoop, newLoop);
  fs.writeFileSync(filePath, content);
}

patchToParallel('src/app/admin/upload/page.tsx', false);
patchToParallel('src/app/admin/page.tsx', true);
