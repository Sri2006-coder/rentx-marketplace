'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { RatingStars } from '@/components/ui/RatingStars';
import { WishlistButton } from '@/components/ui/WishlistButton';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      
      const res = await api.get(`/items?${params.toString()}`);
      setItems(res.data.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Find the perfect gear for your next project</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for cameras, drones..." 
            className="pl-9 bg-black/20 border-white/10"
          />
        </div>
        <div>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="">All Categories</option>
            <option value="cameras">Cameras</option>
            <option value="drones">Drones</option>
            <option value="gaming">Gaming</option>
            <option value="audio">Audio</option>
          </select>
        </div>
        <div>
          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        <div className="md:col-span-4 flex justify-end">
          <Button type="submit">Apply Filters</Button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No items found</h2>
          <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link key={item.id} href={`/items/${item.id}`}>
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
                    <div className="text-xs text-muted-foreground">
                      Dep: ${item.securityDeposit}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
