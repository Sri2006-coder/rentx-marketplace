'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function AdminVerificationsPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = async () => {
    try {
      const res = await api.get('/admin/verifications');
      setProfiles(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      await api.put(`/admin/verifications/${userId}/${action}`);
      fetchVerifications();
    } catch (err) {
      alert('Failed to process verification');
    }
  };

  if (loading) return <div className="text-white/50">Loading verifications...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-8 h-8 text-emerald-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Verification Management</h1>
          <p className="text-white/60 text-sm">Review identity documents and AI match scores</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {profiles.length === 0 ? (
          <div className="text-white/40 col-span-2">No pending verifications found.</div>
        ) : profiles.map((p) => (
          <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col">
            <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white">{p.user?.firstName} {p.user?.lastName}</h3>
                <p className="text-xs text-white/50">{p.user?.email}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                p.aadhaarStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                p.aadhaarStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {p.aadhaarStatus}
              </div>
            </div>
            
            <div className="p-4 grid grid-cols-2 gap-4 flex-1">
              <div className="space-y-2">
                <p className="text-xs font-medium text-white/60 text-center">Aadhaar Document</p>
                <div className="relative aspect-[16/9] w-full bg-black/40 rounded-xl overflow-hidden border border-white/5">
                  {p.aadhaarUrl ? (
                    <Image unoptimized src={p.aadhaarUrl} alt="Aadhaar" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white/30">Missing</div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-white/60 text-center">Live Selfie</p>
                <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto bg-black/40 rounded-xl overflow-hidden border border-white/5">
                  {p.selfieUrl ? (
                    <Image unoptimized src={p.selfieUrl} alt="Selfie" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white/30">Missing</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-black/10">
              <div className="flex flex-col mb-4 bg-black/20 p-2 rounded-lg border border-white/5">
                <span className="text-xs text-white/60 mb-1">OCR Extracted Text Snippet:</span>
                <span className="text-[10px] text-white/80 font-mono break-words line-clamp-3">
                  {p.ocrText ? p.ocrText : 'No OCR data'}
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-white/60">AI Face Match Score:</span>
                <span className={`font-bold ${p.faceMatchScore > 80 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {p.faceMatchScore ? `${p.faceMatchScore.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleAction(p.userId, 'approve')} 
                  disabled={p.aadhaarStatus === 'VERIFIED'}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Approve Verification
                </Button>
                <Button 
                  onClick={() => handleAction(p.userId, 'reject')} 
                  disabled={p.aadhaarStatus === 'REJECTED'}
                  variant="destructive" 
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
