'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categories, mockItems } from '@/lib/mockData';
import { Search, Star, Filter } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filters
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Keywords..." className="pl-9 bg-white/5 border-white/10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="space-y-2 mt-2">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    <input type="checkbox" className="rounded border-white/20 bg-black/20 accent-primary" />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <Label>Price Range (/day)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input placeholder="Min" type="number" className="bg-white/5 border-white/10" />
                <span className="text-muted-foreground">-</span>
                <Input placeholder="Max" type="number" className="bg-white/5 border-white/10" />
              </div>
            </div>
          </div>
        </div>
        <Button className="w-full">Apply Filters</Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Available Items</h1>
          <span className="text-sm text-muted-foreground">{mockItems.length} results</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockItems.map((item) => (
            <Link href={`/items/${item.id}`} key={item.id}>
              <Card className="group overflow-hidden bg-card border-white/5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 flex flex-col h-full">
                <div className="aspect-[4/3] relative overflow-hidden bg-muted shrink-0">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {item.rating}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wider">{item.category}</div>
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <div className="mt-auto">
                    <p className="text-sm text-muted-foreground mb-4">{item.city}, {item.state}</p>
                    <div className="font-bold text-lg">
                      ${item.dailyRate} <span className="text-sm font-normal text-muted-foreground">/ day</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
