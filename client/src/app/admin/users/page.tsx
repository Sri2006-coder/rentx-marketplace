'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, action: 'suspend' | 'activate') => {
    try {
      await api.put(`/admin/users/${userId}/${action}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="text-white/50">Loading users...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">User Management</h1>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-black/20 text-white/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Trust Score</th>
              <th className="px-6 py-4 font-medium">Fraud Risk</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{u.firstName} {u.lastName}</div>
                  <div className="text-xs text-white/40">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-primary-400">{u.trustProfile?.trustScore || 0}</div>
                  {u.trustProfile?.verifiedBadge && <span className="text-xs text-emerald-500">Verified</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    u.fraud?.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                    u.fraud?.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {u.fraud?.riskLevel || 'LOW'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={u.status || 'ACTIVE'} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {u.status === 'SUSPENDED' ? (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(u.id, 'activate')} className="text-emerald-400 border-emerald-500/30">Activate</Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => handleStatusChange(u.id, 'suspend')}>Suspend</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
