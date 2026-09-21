const fs = require('fs');

function patchUploadSpeedAndQuality(filePath, isUpdate) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Change 0.95 quality back to 0.85 (massive size reduction, keeping 1600px resolution)
  content = content.replace(/toDataURL\('image\/jpeg',\s*0\.95\)/g, "toDataURL('image/jpeg', 0.85)");
  content = content.replace(/toDataURL\('image\/webp',\s*0\.95\)/g, "toDataURL('image/jpeg', 0.85)");

  // 2. Implement Batched Uploading (Concurrency = 3)
  const slugVar = isUpdate ? "targetId" : "slug";
  const authHeader = `headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },`;
  const folderArg = isUpdate ? `\`documents/update-\${${slugVar}}\`` : `\`documents/\${${slugVar}}\``;

  const oldUpload = /const uploadPromises = extractedPages\.map\([\s\S]*?await Promise\.all\(uploadPromises\);/;

  const newUpload = `      // Batched uploading (3 at a time) for balance between speed and UI progress feedback
      const concurrency = 3;
      for (let i = 0; i < extractedPages.length; i += concurrency) {
        const batch = extractedPages.slice(i, i + concurrency);
        
        await Promise.all(batch.map(async (base64, batchIndex) => {
          const actualIndex = i + batchIndex;
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              ${authHeader}
              body: JSON.stringify({ image: base64, folder: ${folderArg} })
            });
            const data = await res.json();
            if (data.url) {
              finalPageUrls[actualIndex] = data.url;
            }
          } catch (e) {
            console.error(\`Failed to upload page \${actualIndex + 1}\`, e);
          } finally {
            completed++;
            ${isUpdate ? `setUpdateProgress(\`Uploading page \${completed} of \${extractedPages.length}...\`);` : `setUploadProgressText(\`Uploading page \${completed} of \${extractedPages.length}...\`);\n            setPublishProgress(Math.floor((completed / extractedPages.length) * 8));`}
          }
        }));
      }`;

  content = content.replace(oldUpload, newUpload);
  fs.writeFileSync(filePath, content);
}

patchUploadSpeedAndQuality('src/app/admin/upload/page.tsx', false);
patchUploadSpeedAndQuality('src/app/admin/page.tsx', true);
