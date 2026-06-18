'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, CreditCard, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initPayment = async () => {
      if (!user) return;
      try {
        const res = await api.post(`/payments/create`, { bookingId: params.bookingId });
        const data = res.data;
        
        if (data.success) {
          setPayment(data.payment);
          // Fetch booking details for summary
          const bRes = await api.get(`/bookings/${params.bookingId}`);
          if (bRes.data.success) {
            setBooking(bRes.data.data);
          }
        } else {
          setError(data.message || 'Failed to initialize payment');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    if (user && params.bookingId) {
      initPayment();
    }
  }, [params.bookingId, user]);

  const handleMockPayment = async (type: 'success' | 'failure') => {
    setProcessing(true);
    setError('');
    try {
      const res = await api.post(`/payments/${type}`, { paymentId: payment.id });
      const data = res.data;
      if (data.success) {
        setPayment(data.payment);
        if (type === 'success') {
          setTimeout(() => router.push('/my-rentals'), 2000);
        }
      } else {
        setError(data.message || 'Payment simulation failed');
      }
    } catch (err: any) {
        setError(err.response?.data?.message || 'Network error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-white/70">Loading payment details...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
  if (!booking || !payment) return <div className="p-8 text-center text-white/70">Payment not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <CreditCard className="w-8 h-8 mr-3 text-primary-500" />
          Secure Checkout
        </h1>
        <p className="text-white/60">Complete your payment to confirm the rental.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-semibold text-white mb-4">Booking Summary</h2>
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-white/10">
            <div className="w-16 h-16 rounded-xl bg-white/10 flex-shrink-0"></div>
            <div>
              <h3 className="text-lg font-medium text-white">{booking.item.title}</h3>
              <p className="text-sm text-white/60">
                {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-white/80">
              <span>Rental Cost</span>
              <span>₹{Number(payment.amount)}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span className="flex items-center">
                Security Deposit
                <Shield className="w-4 h-4 ml-2 text-yellow-500" />
              </span>
              <span>₹{Number(payment.securityDeposit)}</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between text-white font-semibold text-lg">
              <span>Total Payable</span>
              <span className="text-primary-400">₹{Number(payment.totalAmount)}</span>
            </div>
          </div>

          <div className="mt-6 bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 flex items-start">
            <Shield className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-primary-200">
              Your security deposit will be securely held in Escrow and automatically refunded when the item is safely returned.
            </p>
          </div>
        </div>

        {/* Payment Gateway Mock */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Mock Gateway Integration</h2>
          
          {payment.paymentStatus === 'PAID' || payment.paymentStatus === 'ESCROW_HELD' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Payment Successful!</h3>
              <p className="text-white/60 text-sm mb-6">Your transaction ID: {payment.transactionId}</p>
              <Button onClick={() => router.push('/my-rentals')} className="w-full">View My Rentals</Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-white/60 mb-4">
                  This is a test environment. Choose an outcome to simulate the payment gateway behavior. The backend is configured to accept future Stripe/Razorpay payloads seamlessly.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleMockPayment('success')} 
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {processing ? 'Processing...' : 'Simulate Payment Success'}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleMockPayment('failure')} 
                    disabled={processing}
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Simulate Payment Failure
                  </Button>
                </div>
              </div>

              {payment.paymentStatus === 'FAILED' && (
                <div className="flex items-center text-red-400 bg-red-500/10 p-3 rounded-lg text-sm">
                  <XCircle className="w-4 h-4 mr-2" />
                  Last payment attempt failed. You can try again.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
