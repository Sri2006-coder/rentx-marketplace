'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, Edit, Trash2, CalendarRange, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

import { RatingStars } from '@/components/ui/RatingStars';
import { Star, MessageSquare } from 'lucide-react';

export default function MyListingsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reputation, setReputation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [itemsRes, bookingsRes, repRes] = await Promise.all([
          api.get(`/items?ownerId=${user.id}`),
          api.get('/bookings/owner'),
          api.get(`/users/${user.id}/reputation`)
        ]);
        setItems(itemsRes.data.data.items);
        setBookings(bookingsRes.data.data);
        setReputation(repRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/items/${id}`);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const metrics = {
    activeListings: items.length,
    totalRequests: bookings.length,
    pendingApproval: bookings.filter(b => b.status === 'PENDING').length,
    activeRentals: bookings.filter(b => b.status === 'ACTIVE').length,
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Listings</h1>
            <p className="text-muted-foreground mt-1">Manage your items and incoming requests</p>
          </div>
          <Link href="/items/create" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Create New Listing
          </Link>
        </div>

        {/* Owner Dashboard Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> {metrics.activeListings}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-purple-500" /> {metrics.totalRequests}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" /> {metrics.pendingApproval}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {metrics.activeRentals}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Active Items */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Active Items</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mb-4 text-white/20" />
                    <p>You don't have any active listings yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-black/20 border border-white/5 items-center">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                          {item.images && item.images.length > 0 ? (
                            <Image unoptimized src={item.images[0].imageUrl} alt={item.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">No Img</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold line-clamp-1"><Link href={`/items/${item.id}`} className="hover:text-primary transition-colors">{item.title}</Link></h3>
                          <p className="text-sm text-muted-foreground mt-1">${item.dailyRate} / day</p>
                          <div className="mt-2 text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded w-max">Active</div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Link href={`/items/${item.id}/edit`} className="flex-1 sm:flex-none flex items-center justify-center p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(item.id)} className="flex-1 sm:flex-none flex items-center justify-center p-2 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Incoming Requests & Reputation Analytics */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Incoming Requests</CardTitle>
                <CardDescription>Rentals & requests for your items</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <CalendarRange className="w-8 h-8 mb-4 text-white/20" />
                    <p className="text-sm">No incoming requests yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map(booking => (
                      <Link href={`/bookings/${booking.id}`} key={booking.id} className="block p-4 rounded-xl bg-black/20 border border-white/5 hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm line-clamp-1">{booking.item.title}</h4>
                          <StatusBadge status={booking.status} />
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d')}
                        </div>
                        <div className="text-xs font-medium text-primary">
                          From: {booking.renter.firstName} {booking.renter.lastName}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {reputation && (
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Reputation & Reviews
                  </CardTitle>
                  <CardDescription>Track client ratings & distribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stats Summary */}
                  <div className="flex justify-between items-center p-4 rounded-xl bg-black/20 border border-white/5">
                    <div>
                      <div className="text-3xl font-extrabold text-white">
                        {reputation.ownerReputation.averageRating > 0 ? reputation.ownerReputation.averageRating.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Average Owner Rating</div>
                    </div>
                    <div className="text-right">
                      <RatingStars rating={reputation.ownerReputation.averageRating} starClassName="w-4 h-4" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {reputation.ownerReputation.reviewCount} total reviews
                      </div>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground">Rating Distribution</h4>
                    {Object.entries(reputation.ownerReputation.ratingDistribution)
                      .reverse()
                      .map(([star, count]) => {
                        const total = reputation.ownerReputation.reviewCount || 1;
                        const pct = Math.round((Number(count) / total) * 100);
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-right">{star}</span>
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />
                            <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-primary h-1.5 rounded-full" 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                            <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                          </div>
                        );
                      })}
                  </div>

                  {/* Latest Feedback List */}
                  {reputation.latestReviews.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" /> Latest Feedback
                      </h4>
                      <div className="space-y-2.5">
                        {reputation.latestReviews.map((rev: any) => (
                          <div key={rev.id} className="p-3 bg-black/30 border border-white/5 rounded-lg space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <RatingStars rating={rev.rating} starClassName="w-2.5 h-2.5" />
                              <span className="text-muted-foreground">
                                {format(new Date(rev.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 italic line-clamp-2">
                              "{rev.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
