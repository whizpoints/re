const fs = require('fs');

let uploadContent = fs.readFileSync('src/app/admin/upload/page.tsx', 'utf-8');
uploadContent = uploadContent.replace(
  "headers: { 'Content-Type': 'application/json'  },",
  "headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },"
);
fs.writeFileSync('src/app/admin/upload/page.tsx', uploadContent);
