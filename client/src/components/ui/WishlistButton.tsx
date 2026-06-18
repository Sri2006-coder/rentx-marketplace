'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type WishlistButtonProps = {
  itemId: string;
  variant?: 'icon' | 'button';
  className?: string;
};

export function WishlistButton({ itemId, variant = 'icon', className = '' }: WishlistButtonProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const wishlisted = isWishlisted(itemId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    setIsAnimating(true);
    await toggleWishlist(itemId);
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
          wishlisted
            ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
            : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'
        } ${className}`}
      >
        <Heart
          className={`w-4 h-4 transition-transform duration-300 ${
            isAnimating ? 'scale-125' : 'scale-100'
          }`}
          fill={wishlisted ? 'currentColor' : 'none'}
        />
        <span className="text-sm font-medium">
          {wishlisted ? 'Saved' : 'Save'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-200 ${
        wishlisted
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : 'bg-black/50 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/70'
      } ${className}`}
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`w-4 h-4 transition-transform duration-300 ${
          isAnimating ? 'scale-125' : 'scale-100'
        }`}
        fill={wishlisted ? 'currentColor' : 'none'}
      />
    </button>
  );
}
