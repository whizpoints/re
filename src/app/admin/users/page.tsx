'use client';

import { useEffect, useState } from 'react';
import { Shield, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  is_email_verified: boolean;
  plan: string;
  created_at: string;
  _count: {
    documents: number;
  };
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          setUsers(data.users);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);


  const handlePlanChange = async (userId: string, newPlan: string) => {
    setUpdatingPlan(userId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, plan: newPlan })
      });
      if (!res.ok) throw new Error('Failed to update plan');
      
      setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
      toast.success(`User plan updated to ${newPlan}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user plan');
    } finally {
      setUpdatingPlan(null);
    }
  };

  if (loading) {

    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-slate-200 rounded"></div><div className="h-4 bg-slate-200 rounded w-5/6"></div></div></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Users Management</h1>
        <p className="text-slate-500 mt-2">View and manage all registered users on the platform.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Plan</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Verified</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Documents</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.name} {user.email === 'admin@whizpoint.app' && <Shield className="inline w-3 h-3 text-blue-600 ml-1" />}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.plan}
                      disabled={updatingPlan === user.id}
                      onChange={(e) => handlePlanChange(user.id, e.target.value)}
                      className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <option value="FREE">FREE</option>
                      <option value="BASIC">BASIC</option>
                      <option value="PRO">PRO</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_email_verified ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium">{user._count.documents}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
