'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { List } from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit');
      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <div className="text-white/50">Loading audit logs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <List className="w-8 h-8 text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">System Audit Logs</h1>
          <p className="text-white/60 text-sm">Track all critical actions across the platform</p>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-black/20 text-white/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">Action</th>
              <th className="px-6 py-4 font-medium">Entity Type</th>
              <th className="px-6 py-4 font-medium">Entity ID</th>
              <th className="px-6 py-4 font-medium">Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/40">No audit logs found.</td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-white/40">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-white/10 text-white font-mono text-xs">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4">{log.entityType}</td>
                <td className="px-6 py-4 font-mono text-xs truncate max-w-[120px]">{log.entityId}</td>
                <td className="px-6 py-4">
                  {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'SYSTEM'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
