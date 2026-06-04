import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockItems } from '@/lib/mockData';
import { Calendar, Package, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RenterDashboard() {
  const activeRentals = mockItems.slice(1, 2);
  const pastRentals = mockItems.slice(2, 4);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Renter Dashboard</h1>
          <p className="text-muted-foreground">Manage your rentals, history, and wishlist.</p>
        </div>
        <Link href="/search">
          <Button>Find Gear</Button>
        </Link>
      </div>

      <div className="space-y-8">
        {/* Active Rentals */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Active Rentals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRentals.map((item) => (
              <Card key={item.id} className="bg-white/5 border-primary/30 backdrop-blur-md shadow-lg shadow-primary/5">
                <CardContent className="p-4 flex gap-4">
                  <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden shrink-0">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Owner: David L.</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-md font-medium border border-green-500/20">
                        Return Tomorrow
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Past Rentals */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-muted-foreground" /> Past Rentals
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {pastRentals.map((item) => (
              <Card key={item.id} className="bg-white/5 border-white/10 backdrop-blur-md opacity-80">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">Rented Oct 1 - Oct 4</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Completed</span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary">Leave a Review</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
