'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      // The Layout will catch the login and redirect if role === ADMIN
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505]">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/20 mx-auto mb-6 transform -rotate-12 transition-transform hover:rotate-0 duration-300">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-white/50 text-sm">Sign in with your administrator credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-white/20"
                  placeholder="admin@rentx.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-white/80">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-white/20"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-6 text-base font-semibold shadow-xl shadow-primary-500/20">
            {loading ? 'Authenticating...' : 'Secure Login'}
          </Button>
          
          <div className="text-center pt-4">
            <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
              &larr; Return to Marketplace
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
