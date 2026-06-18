'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Users, ShieldCheck, Package, CalendarDays, CreditCard, Scale, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/admin/dashboard/metrics');
        setMetrics(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="animate-pulse text-white/50">Loading dashboard data...</div>;
  }

  const statCards = [
    { title: 'Total Users', value: metrics?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Verified Users', value: metrics?.verifiedUsers || 0, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Active Listings', value: metrics?.activeListings || 0, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Active Rentals', value: metrics?.activeRentals || 0, icon: CalendarDays, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Completed Rentals', value: metrics?.completedRentals || 0, icon: CalendarDays, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Revenue', value: `₹${metrics?.totalRevenue || 0}`, icon: CreditCard, color: 'text-primary-500', bg: 'bg-primary-500/10' },
    { title: 'Pending Payments', value: metrics?.pendingPayments || 0, icon: CreditCard, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { title: 'Open Disputes', value: metrics?.openDisputes || 0, icon: Scale, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: 'Pending Verifications', value: metrics?.pendingVerifications || 0, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-white/60">Real-time metrics and system health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl h-80">
          <CardContent className="p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-white mb-4">Growth Trend</h3>
            <div className="flex-1 border border-white/5 rounded-xl bg-black/20 flex items-center justify-center text-white/30">
              [Chart Integration Pending]
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl h-80">
          <CardContent className="p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-white mb-4">Revenue Analytics</h3>
            <div className="flex-1 border border-white/5 rounded-xl bg-black/20 flex items-center justify-center text-white/30">
              [Chart Integration Pending]
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
