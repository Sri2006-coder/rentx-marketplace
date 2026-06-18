'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { RatingStars } from '@/components/ui/RatingStars';
import { WishlistButton } from '@/components/ui/WishlistButton';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const { wishlistedItemIds } = useWishlist();

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setItems(res.data.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user, wishlistedItemIds]); // Re-fetch or filter if global wishlist changes

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-red-500/20 p-3 rounded-full text-red-500">
          <Heart className="w-6 h-6" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Wishlist</h1>
          <p className="text-muted-foreground">Saved items you are interested in renting later</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 max-w-2xl mx-auto">
          <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">No saved items yet</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Keep track of gear you love by clicking the heart icon on any item.
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/search">Browse Marketplace</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((wishlistItem) => {
            const item = wishlistItem.item;
            // Ensure we don't render removed items if optimistic update fired
            if (!wishlistedItemIds.has(item.id)) return null;

            return (
              <Link key={wishlistItem.wishlistId} href={`/items/${item.id}`}>
                <Card className="bg-white/5 border-white/10 overflow-hidden hover:border-primary/50 transition-colors group h-full flex flex-col cursor-pointer">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
                    {item.images && item.images.length > 0 ? (
                      <Image 
                        unoptimized
                        src={item.images[0].imageUrl} 
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No Image</div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium border border-white/10 capitalize">
                      {item.condition}
                    </div>
                    <div className="absolute top-2 left-2">
                      <WishlistButton itemId={item.id} />
                    </div>
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold line-clamp-1 flex-1 pr-2">{item.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20 shrink-0">
                        <RatingStars rating={item.averageRating} starClassName="w-3 h-3" />
                        <span className="font-semibold">{item.averageRating > 0 ? item.averageRating.toFixed(1) : 'New'}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.city}
                    </div>
                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        <span className="text-lg font-bold">${item.dailyRate}</span>
                        <span className="text-xs text-muted-foreground">/day</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
