'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';

export default function AdminFraudPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      // Filter only Medium or High risk users
      const suspicious = res.data.data.filter((u: any) => u.fraud?.riskLevel === 'HIGH' || u.fraud?.riskLevel === 'MEDIUM');
      // Sort by score
      suspicious.sort((a: any, b: any) => b.fraud.score - a.fraud.score);
      setUsers(suspicious);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="text-white/50">Loading fraud alerts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-8 h-8 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud Monitoring</h1>
          <p className="text-white/60 text-sm">Automated risk detection and flags</p>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-black/20 text-white/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Risk Level</th>
              <th className="px-6 py-4 font-medium">Fraud Score</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                  <ShieldAlert className="w-12 h-12 text-white/20 mx-auto mb-2" />
                  No suspicious users detected.
                </td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{u.firstName} {u.lastName}</div>
                  <div className="text-xs text-white/40">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    u.fraud?.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {u.fraud?.riskLevel}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-white">
                  {u.fraud?.score}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-6 py-4">
                  <Button size="sm" variant="destructive" disabled={u.status === 'SUSPENDED'}>
                    {u.status === 'SUSPENDED' ? 'Suspended' : 'Suspend Account'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
