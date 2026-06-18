'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

import { api } from '@/lib/api';

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/payments`);
        if (res.data.success) {
          setPayments(res.data.payments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-white/70">Loading payment history...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <CreditCard className="w-8 h-8 mr-3 text-primary-500" />
          Payment History
        </h1>
        <p className="text-white/60">View all your past transactions and security deposits.</p>
      </div>

      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <CreditCard className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Transactions Yet</h3>
            <p className="text-white/60">Your payment history will appear here once you rent an item.</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-start space-x-4 mb-4 md:mb-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  payment.paymentStatus === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                  payment.paymentStatus === 'REFUNDED' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {payment.paymentStatus === 'FAILED' ? <XCircle className="w-6 h-6" /> :
                   payment.paymentStatus === 'REFUNDED' ? <RefreshCw className="w-6 h-6" /> :
                   <ArrowUpRight className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{payment.booking.item.title}</h3>
                  <div className="flex items-center text-sm text-white/50 space-x-2 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-mono text-xs opacity-70">TXN: {payment.transactionId || 'Pending'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end w-full md:w-auto justify-between md:justify-center">
                <div className="text-right">
                  <div className="text-lg font-bold text-white">₹{Number(payment.totalAmount)}</div>
                  <div className="text-xs text-white/50">Incl. ₹{Number(payment.securityDeposit)} deposit</div>
                </div>
                <div className="mt-2 flex space-x-2">
                  <StatusBadge status={payment.paymentStatus} type="booking" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

