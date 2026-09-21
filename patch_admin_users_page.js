const fs = require('fs');
let content = fs.readFileSync('src/app/admin/users/page.tsx', 'utf-8');

// Add toast import
if (!content.includes('react-hot-toast')) {
  content = content.replace(
    "import { Shield, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';",
    "import { Shield, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';\nimport { toast } from 'react-hot-toast';"
  );
}

// Add state for updating plan
content = content.replace(
  "  const [loading, setLoading] = useState(true);",
  `  const [loading, setLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);`
);

// Add handlePlanChange function
const fn = `
  const handlePlanChange = async (userId: string, newPlan: string) => {
    setUpdatingPlan(userId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ userId, plan: newPlan })
      });
      if (!res.ok) throw new Error('Failed to update plan');
      
      setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
      toast.success(\`User plan updated to \${newPlan}\`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user plan');
    } finally {
      setUpdatingPlan(null);
    }
  };

  if (loading) {
`;

content = content.replace("  if (loading) {", fn);

// Update table cell for plan
const oldCell = `<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">\n                      {user.plan}\n                    </span>`;
const newCell = `<select 
                      value={user.plan}
                      disabled={updatingPlan === user.id}
                      onChange={(e) => handlePlanChange(user.id, e.target.value)}
                      className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <option value="FREE">FREE</option>
                      <option value="BASIC">BASIC</option>
                      <option value="PRO">PRO</option>
                    </select>`;

content = content.replace(oldCell, newCell);

fs.writeFileSync('src/app/admin/users/page.tsx', content);
