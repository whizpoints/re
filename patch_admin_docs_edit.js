const fs = require('fs');

let content = fs.readFileSync('src/app/admin/documents/page.tsx', 'utf-8');

// Add edit states
content = content.replace(
  "  const updateTargetRef = React.useRef<string | null>(null);",
  `  const updateTargetRef = React.useRef<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editSlug, setEditSlug] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openEdit = (doc: Document) => {
    setEditingDoc(doc);
    setEditSlug(doc.slug);
    setEditExpiry(doc.custom_expiry_date ? new Date(doc.custom_expiry_date).toISOString().split('T')[0] : '');
  };

  const handleSaveEdit = async () => {
    if (!editingDoc) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(\`/api/documents/\${editingDoc.id}\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({
          slug: editSlug,
          custom_expiry_date: editExpiry ? new Date(editExpiry).toISOString() : null
        })
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Document updated successfully!');
      setEditingDoc(null);
      fetchDocuments();
    } catch (e) {
      toast.error('Failed to update document');
    } finally {
      setIsSaving(false);
    }
  };`
);

// Add edit button
content = content.replace(
  '                          <button \n                            onClick={() => handleUpdateClick(doc.id)}',
  `                          <button 
                            onClick={() => openEdit(doc)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                            title="Edit Document"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleUpdateClick(doc.id)}`
);

// Add modal JSX
const modalJsx = `
      {editingDoc && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Edit Document</h3>
              <button onClick={() => setEditingDoc(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                <input type="text" value={editSlug} onChange={e => setEditSlug(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date (Leave blank for Never)</label>
                <input type="date" value={editExpiry} onChange={e => setEditExpiry(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <button onClick={handleSaveEdit} disabled={isSaving} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  "      {qrDoc && (",
  modalJsx + "\n      {qrDoc && ("
);

fs.writeFileSync('src/app/admin/documents/page.tsx', content);
