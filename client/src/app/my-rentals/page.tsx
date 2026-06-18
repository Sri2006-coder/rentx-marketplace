'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarRange, Activity, CheckCircle2, Clock, Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RatingStars } from '@/components/ui/RatingStars';

export default function MyRentalsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [reputation, setReputation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      if (!user) return;
      try {
        const [rentalsRes, repRes] = await Promise.all([
          api.get('/bookings/renter'),
          api.get(`/users/${user.id}/reputation`)
        ]);
        setBookings(rentalsRes.data.data);
        setReputation(repRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const metrics = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    active: bookings.filter(b => b.status === 'ACTIVE').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">My Rentals</h1>
      
      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-primary" /> {metrics.total}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" /> {metrics.pending}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> {metrics.active}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {metrics.completed}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Rental History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Rental History</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-white/10 rounded-xl bg-white/5">
              You haven't requested any rentals yet.
              <div className="mt-4">
                <Link href="/search" className="text-primary hover:underline">Browse the Marketplace</Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((booking) => (
                <Link href={`/bookings/${booking.id}`} key={booking.id}>
                  <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur-md hover:border-primary/50 transition-colors h-full flex flex-col cursor-pointer">
                    <div className="relative h-48 w-full bg-black/40">
                      {booking.item.images && booking.item.images.length > 0 ? (
                        <Image 
                          unoptimized
                          src={booking.item.images[0].imageUrl} 
                          alt={booking.item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No Image</div>
                      )}
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-1 truncate">{booking.item.title}</h3>
                      <div className="text-sm text-muted-foreground mb-4">
                        {format(new Date(booking.startDate), 'MMM d, yyyy')} - {format(new Date(booking.endDate), 'MMM d, yyyy')}
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Cost</span>
                        <span className="font-bold text-lg text-primary">${booking.totalPrice}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Renter Reputation & Feedback */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Reputation</h2>
          {reputation && (
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-primary" /> Renter Reputation
                </CardTitle>
                <CardDescription>Track your ratings & stats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Summary */}
                <div className="flex justify-between items-center p-4 rounded-xl bg-black/20 border border-white/5">
                  <div>
                    <div className="text-3xl font-extrabold text-white">
                      {reputation.renterReputation.averageRating > 0 ? reputation.renterReputation.averageRating.toFixed(1) : '0.0'}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Average Renter Rating</div>
                  </div>
                  <div className="text-right">
                    <RatingStars rating={reputation.renterReputation.averageRating} starClassName="w-4 h-4" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {reputation.renterReputation.reviewCount} reviews received
                    </div>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="space-y-3 text-sm p-4 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed rentals:</span>
                    <span className="font-bold text-white">{reputation.renterReputation.rentalsCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Successful returns:</span>
                    <span className="font-bold text-green-400">{reputation.renterReputation.successfulReturns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Returns rate:</span>
                    <span className="font-bold text-primary">
                      {reputation.renterReputation.rentalsCompleted > 0
                        ? `${Math.round((reputation.renterReputation.successfulReturns / reputation.renterReputation.rentalsCompleted) * 100)}%`
                        : '100%'}
                    </span>
                  </div>
                </div>

                {/* Extensible trust score indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">My Trust Score</span>
                    <span className="text-primary">{reputation.trustProfile.trustScore} / 100</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${reputation.trustProfile.trustScore}%` }} 
                    />
                  </div>
                </div>

                {/* Recent Renter Feedback */}
                {reputation.latestReviews.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" /> Recent Feedback
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
  );
}
