'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, ShieldCheck, Package, 
  CalendarDays, CreditCard, Scale, AlertTriangle, 
  List, LogOut, Loader2
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (pathname === '/admin/login') {
        if (user?.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          setAuthChecked(true);
        }
      } else {
        if (!user || user.role !== 'ADMIN') {
          router.push('/admin/login');
        } else {
          setAuthChecked(true);
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#050505]">{children}</div>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Verifications', href: '/admin/verifications', icon: ShieldCheck },
    { name: 'Items', href: '/admin/items', icon: Package },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Disputes', href: '/admin/disputes', icon: Scale },
    { name: 'Fraud Alerts', href: '/admin/fraud', icon: AlertTriangle },
    { name: 'Audit Logs', href: '/admin/audit', icon: List },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans selection:bg-primary-500/30">
      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 bg-white/5 border-r border-white/10 backdrop-blur-xl z-50 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="font-bold text-white text-lg">X</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">RentX Admin</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/10 via-[#050505] to-[#050505]">
        {children}
      </main>
    </div>
  );
}
