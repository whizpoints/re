const fs = require('fs');

let content = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

// Change component name
content = content.replace("export default function AdminDashboard()", "export default function AdminDocumentsPage()");

// Change API endpoint
content = content.replace("fetch('/api/documents'", "fetch('/api/admin/documents'");

// Add user interface property
content = content.replace(
  "  page_count: number;\n}",
  "  page_count: number;\n  user?: { email: string };\n}"
);

// Update headings
content = content.replace(
  '<h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>',
  '<h1 className="text-3xl font-bold text-slate-900">Global Documents Management</h1>'
);
content = content.replace(
  '<p className="text-slate-500 mt-2">Manage your flipbooks and generate QR codes.</p>',
  '<p className="text-slate-500 mt-2">Manage all documents, update PDF files, view users, and delete content globally.</p>'
);

// Remove the top stats grid
const gridStart = content.indexOf('<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">');
if (gridStart !== -1) {
  const nextSection = content.indexOf('{/* Header & Search */}', gridStart);
  if (nextSection !== -1) {
    content = content.substring(0, gridStart) + content.substring(nextSection);
  }
}

// Add Owner column header
content = content.replace(
  '<th className="py-4 px-6 font-medium">Document</th>',
  '<th className="py-4 px-6 font-medium">Document</th>\n                  <th className="py-4 px-6 font-medium">Owner</th>'
);

// Add Owner column cell
content = content.replace(
  '                      <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">\n                        <Link href={`/${doc.slug}`}',
  '                      <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">{doc.user?.email}</td>\n                      <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">\n                        <Link href={`/${doc.slug}`}'
);

fs.writeFileSync('src/app/admin/documents/page.tsx', content);
