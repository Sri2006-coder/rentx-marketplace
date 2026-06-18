'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Scale } from 'lucide-react';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/admin/disputes');
      setDisputes(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleStatusChange = async (disputeId: string, status: string, resolution?: string) => {
    try {
      await api.put(`/admin/disputes/${disputeId}/status`, { status, resolution });
      fetchDisputes();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="text-white/50">Loading disputes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Scale className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Dispute Resolution Center</h1>
          <p className="text-white/60 text-sm">Manage and resolve platform conflicts</p>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-black/20 text-white/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">Booking ID</th>
              <th className="px-6 py-4 font-medium">Filed By</th>
              <th className="px-6 py-4 font-medium">Against</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-white/40">No disputes found.</td>
              </tr>
            ) : disputes.map((d) => (
              <tr key={d.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{d.bookingId}</td>
                <td className="px-6 py-4">
                  {d.filer?.firstName} {d.filer?.lastName}
                </td>
                <td className="px-6 py-4">
                  {d.against?.firstName} {d.against?.lastName}
                </td>
                <td className="px-6 py-4 max-w-xs truncate">{d.description}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {d.status === 'OPEN' && (
                      <Button size="sm" onClick={() => handleStatusChange(d.id, 'UNDER_REVIEW')}>Review</Button>
                    )}
                    {d.status === 'UNDER_REVIEW' && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange(d.id, 'RESOLVED', 'Refunded 50% to renter')}>Resolve Case</Button>
                    )}
                    {d.status === 'RESOLVED' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(d.id, 'CLOSED')}>Close</Button>
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
