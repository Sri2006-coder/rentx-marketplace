'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type WishlistContextType = {
  wishlistedItemIds: Set<string>;
  wishlistCount: number;
  isLoading: boolean;
  toggleWishlist: (itemId: string) => Promise<void>;
  isWishlisted: (itemId: string) => boolean;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistedItemIds, setWishlistedItemIds] = useState<Set<string>>(new Set());
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistedItemIds(new Set());
      setWishlistCount(0);
      return;
    }

    try {
      const res = await api.get('/wishlist?limit=100');
      const ids = new Set<string>(
        res.data.data.items.map((w: any) => w.item.id)
      );
      setWishlistedItemIds(ids);
      setWishlistCount(res.data.data.meta.total);
    } catch (error) {
      // Silently fail — user might not be authenticated
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (itemId: string) => {
    if (!user) return;

    const currentlyWishlisted = wishlistedItemIds.has(itemId);

    // Optimistic update
    setWishlistedItemIds((prev) => {
      const next = new Set(prev);
      if (currentlyWishlisted) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
    setWishlistCount((prev) => (currentlyWishlisted ? prev - 1 : prev + 1));

    try {
      if (currentlyWishlisted) {
        await api.delete(`/wishlist/${itemId}`);
      } else {
        await api.post('/wishlist', { itemId });
      }
    } catch (error) {
      // Revert optimistic update on failure
      setWishlistedItemIds((prev) => {
        const next = new Set(prev);
        if (currentlyWishlisted) {
          next.add(itemId);
        } else {
          next.delete(itemId);
        }
        return next;
      });
      setWishlistCount((prev) => (currentlyWishlisted ? prev + 1 : prev - 1));
    }
  }, [user, wishlistedItemIds]);

  const isWishlisted = useCallback(
    (itemId: string) => wishlistedItemIds.has(itemId),
    [wishlistedItemIds]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistedItemIds,
        wishlistCount,
        isLoading,
        toggleWishlist,
        isWishlisted,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
