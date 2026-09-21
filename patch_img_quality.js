const fs = require('fs');

let uploadContent = fs.readFileSync('src/app/admin/upload/page.tsx', 'utf-8');
uploadContent = uploadContent.replace(
  "const scale = 1000 / unscaledViewport.width;",
  "const scale = 3200 / unscaledViewport.width; // Super crisp 1600px per page"
);
uploadContent = uploadContent.replace(
  /toDataURL\('image\/webp',\s*0\.8\)/g,
  "toDataURL('image/jpeg', 0.95)"
);
fs.writeFileSync('src/app/admin/upload/page.tsx', uploadContent);

let adminContent = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');
adminContent = adminContent.replace(
  "const scale = 1000 / unscaledViewport.width;",
  "const scale = 1600 / unscaledViewport.width; // Super crisp 1600px"
);
adminContent = adminContent.replace(
  "toDataURL('image/jpeg', 0.8)",
  "toDataURL('image/jpeg', 0.95)"
);
fs.writeFileSync('src/app/admin/page.tsx', adminContent);
