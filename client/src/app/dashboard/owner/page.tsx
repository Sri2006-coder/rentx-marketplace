import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockItems } from '@/lib/mockData';
import { Package, DollarSign, Users, Activity, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OwnerDashboard() {
  const myItems = mockItems; // Assuming owner owns all mock items for preview
  const totalEarnings = 12450;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your listings, bookings, and earnings.</p>
        </div>
        <Link href="/items/create">
          <Button>Create Listing</Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-green-500 mt-1">+14% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myItems.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md h-full">
            <CardHeader>
              <CardTitle>Recent Booking Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0">
                      <img src={myItems[0].images[0]} alt="item" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-1">{myItems[0].title}</h4>
                      <p className="text-xs text-muted-foreground">Requested by Sarah M. • Oct 12 - Oct 15</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 border-green-500/20 text-green-500 hover:bg-green-500/10">Approve</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-destructive">Decline</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Listings */}
        <div>
          <Card className="bg-white/5 border-white/10 backdrop-blur-md h-full">
            <CardHeader>
              <CardTitle>Top Listings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-16 h-12 bg-muted rounded-md overflow-hidden shrink-0">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">${item.dailyRate}/day</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
