'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Package } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';

export default function AdminItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await api.get('/admin/items');
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleStatusChange = async (itemId: string, status: string) => {
    try {
      await api.put(`/admin/items/${itemId}/status`, { status });
      fetchItems();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="text-white/50">Loading items...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-8 h-8 text-purple-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Item Management</h1>
          <p className="text-white/60 text-sm">Monitor platform listings</p>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-black/20 text-white/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">Item</th>
              <th className="px-6 py-4 font-medium">Owner</th>
              <th className="px-6 py-4 font-medium">Pricing</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/40">No items found.</td>
              </tr>
            ) : items.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{item.title}</div>
                  <div className="text-xs text-white/40">{item.category} &bull; {item.city}</div>
                </td>
                <td className="px-6 py-4">
                  {item.owner?.firstName} {item.owner?.lastName}
                </td>
                <td className="px-6 py-4">
                  <div className="text-white">₹{item.dailyRate}/day</div>
                  <div className="text-xs text-white/40">Deposit: ₹{item.securityDeposit}</div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {item.status === 'ACTIVE' && (
                      <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10" onClick={() => handleStatusChange(item.id, 'HIDDEN')}>Hide</Button>
                    )}
                    {item.status === 'HIDDEN' && (
                      <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleStatusChange(item.id, 'ACTIVE')}>Restore</Button>
                    )}
                    {item.status !== 'INACTIVE' && (
                      <Button size="sm" variant="destructive" onClick={() => handleStatusChange(item.id, 'INACTIVE')}>Remove</Button>
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
