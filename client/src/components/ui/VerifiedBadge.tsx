import { ShieldCheck } from 'lucide-react';

export function VerifiedBadge({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`inline-flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 text-xs font-semibold ${className}`}
      title="Verified User (Identity Confirmed)"
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>Verified</span>
    </div>
  );
}
