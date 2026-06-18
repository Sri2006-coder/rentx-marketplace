import React from 'react';

type Status = 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'ACTIVE' | 'RETURNED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'APPROVED':
      case 'CONFIRMED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'ACTIVE':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'RETURNED':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'CANCELLED':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${getBadgeStyle()}`}>
      {status}
    </span>
  );
}
