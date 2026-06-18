'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CreditCard } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/admin/payments');
      setPayments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) return <div className="text-white/50">Loading payments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-8 h-8 text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Monitoring</h1>
          <p className="text-white/60 text-sm">Monitor platform revenue and escrow</p>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-black/20 text-white/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">Transaction ID</th>
              <th className="px-6 py-4 font-medium">Renter</th>
              <th className="px-6 py-4 font-medium">Rental Fee</th>
              <th className="px-6 py-4 font-medium">Deposit Escrow</th>
              <th className="px-6 py-4 font-medium">Total Paid</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-white/40">No payments found.</td>
              </tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{p.transactionId || 'PENDING'}</td>
                <td className="px-6 py-4">
                  {p.renter?.firstName} {p.renter?.lastName}
                </td>
                <td className="px-6 py-4">₹{Number(p.amount).toFixed(2)}</td>
                <td className="px-6 py-4 text-yellow-500">₹{Number(p.securityDeposit).toFixed(2)}</td>
                <td className="px-6 py-4 font-bold text-white">₹{Number(p.totalAmount).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={p.paymentStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
