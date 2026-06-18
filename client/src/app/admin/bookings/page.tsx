'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CalendarDays } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to administratively cancel this booking?')) return;
    try {
      await api.put(`/admin/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  if (loading) return <div className="text-white/50">Loading bookings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Booking Management</h1>
          <p className="text-white/60 text-sm">Monitor platform rental activity</p>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-black/20 text-white/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">Booking ID</th>
              <th className="px-6 py-4 font-medium">Item</th>
              <th className="px-6 py-4 font-medium">Renter</th>
              <th className="px-6 py-4 font-medium">Value</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-white/40">No bookings found.</td>
              </tr>
            ) : bookings.map((b) => (
              <tr key={b.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{b.id}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{b.item?.title}</div>
                  <div className="text-xs text-white/40">
                    {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {b.renter?.firstName} {b.renter?.lastName}
                </td>
                <td className="px-6 py-4 text-white font-medium">
                  ₹{Number(b.totalPrice).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={b.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {['PENDING', 'APPROVED', 'CONFIRMED', 'ACTIVE'].includes(b.status) && (
                      <Button size="sm" variant="destructive" onClick={() => handleCancel(b.id)}>Cancel</Button>
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
