'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Shield, Calendar as CalendarIcon, User as UserIcon, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, differenceInDays } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { RatingStars } from '@/components/ui/RatingStars';
import { WishlistButton } from '@/components/ui/WishlistButton';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Booking State
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [availability, setAvailability] = useState<{blocks: any[], bookings: any[]}>({ blocks: [], bookings: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Owner Reputation & Reviews States
  const [ownerReputation, setOwnerReputation] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsSort, setReviewsSort] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const reviewsLimit = 5;

  const fetchItemAndAvailability = async () => {
    try {
      const res = await api.get(`/items/${id}`);
      setItem(res.data.data);

      // Fetch availability
      const availRes = await api.get(`/items/${id}/availability`);
      setAvailability(availRes.data.data);

      // Fetch owner reputation
      const ownerId = res.data.data.ownerId;
      const repRes = await api.get(`/users/${ownerId}/reputation`);
      setOwnerReputation(repRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemReviews = async () => {
    setReviewsLoading(true);
    try {
      const reviewsRes = await api.get(
        `/items/${id}/reviews?page=${reviewsPage}&limit=${reviewsLimit}&sort=${reviewsSort}`
      );
      setReviews(reviewsRes.data.data.reviews);
      setReviewsTotalPages(reviewsRes.data.data.meta.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchItemAndAvailability();
  }, [id]);

  useEffect(() => {
    if (id) fetchItemReviews();
  }, [id, reviewsPage, reviewsSort]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-3xl font-bold mb-2">Item not found</h1>
        <p className="text-muted-foreground">This item may have been removed or is currently unavailable.</p>
      </div>
    );
  }

  // Calculate Disabled Dates
  const disabledDates = [
    { before: new Date() }, // Cannot book in the past
    // Map blocks
    ...availability.blocks.map(b => ({
      from: new Date(b.blockedFrom),
      to: new Date(b.blockedTo)
    })),
    // Map active bookings
    ...availability.bookings.map(b => ({
      from: new Date(b.startDate),
      to: new Date(b.endDate)
    }))
  ];

  // Calculate costs
  let diffDays = 0;
  if (dateRange?.from && dateRange?.to) {
    diffDays = Math.abs(differenceInDays(dateRange.to, dateRange.from)) + 1;
  } else if (dateRange?.from) {
    diffDays = 1;
  }
  const rentalCost = diffDays * Number(item.dailyRate);
  const totalCost = rentalCost + Number(item.securityDeposit);

  const handleRequestRental = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.id === item.ownerId) {
      setError('You cannot book your own item.');
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      setError('Please select a start and end date.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await api.post('/bookings', {
        itemId: item.id,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      });
      router.push('/my-rentals');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request rental.');
      setIsSubmitting(false);
    }
  };

  const handleMessageOwner = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.id === item.ownerId) {
      setError('You cannot message yourself.');
      return;
    }

    try {
      const res = await api.post('/chat/conversations', {
        ownerId: item.ownerId,
        renterId: user.id,
        itemId: item.id
      });
      router.push(`/messages/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start conversation.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        
        {/* Left Column: Images & Details */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-black/20 border border-white/10">
              {item.images && item.images.length > 0 ? (
                <Image 
                  unoptimized
                  src={item.images[activeImage].imageUrl} 
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No Image Available</div>
              )}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10 capitalize">
                {item.category}
              </div>
            </div>
            
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {item.images.map((img: any, idx: number) => (
                  <button 
                    key={img.id}
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-primary' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                  >
                    <Image unoptimized src={img.imageUrl} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-3">Description</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {item.description}
              </p>
            </div>

            <hr className="border-white/10" />

            {/* Owner Profile Card */}
            <div>
              <h3 className="text-xl font-bold mb-4">Owner Information</h3>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                    {item.owner.profileImage ? (
                      <img src={item.owner.profileImage} alt={item.owner.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <div>
                    <Link href={`/users/${item.ownerId}`} className="font-bold text-lg text-white hover:text-primary transition-colors flex items-center gap-2">
                      {item.owner.firstName} {item.owner.lastName}
                      {ownerReputation?.ownerReputation.verifiedBadge && <VerifiedBadge />}
                    </Link>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-primary" /> 
                      {ownerReputation?.ownerReputation.verifiedStatus || 'Identity Verified'}
                    </div>
                  </div>
                </div>

                {/* Owner Stats Summary */}
                {ownerReputation && (
                  <div className="flex gap-4 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 text-xs w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none">
                      <div className="text-muted-foreground">Owner Rating</div>
                      <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                        <RatingStars rating={ownerReputation.ownerReputation.averageRating} starClassName="w-3 h-3" />
                        <span>{ownerReputation.ownerReputation.averageRating > 0 ? ownerReputation.ownerReputation.averageRating : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex-1 sm:flex-none">
                      <div className="text-muted-foreground">Reviews</div>
                      <div className="font-bold text-white mt-0.5">{ownerReputation.ownerReputation.reviewCount} received</div>
                    </div>
                    <div className="flex-1 sm:flex-none">
                      <div className="text-muted-foreground">Rentals</div>
                      <div className="font-bold text-white mt-0.5">{ownerReputation.ownerReputation.totalRentalsCompleted} completed</div>
                    </div>
                  </div>
                )}
              </div>
              {user && user.id !== item.ownerId && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={handleMessageOwner}>
                    <MessageSquare className="w-4 h-4 mr-2" /> Message Owner
                  </Button>
                </div>
              )}
            </div>

            <hr className="border-white/10" />

            {/* Item Reviews Section */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold">Reviews for this Item</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={item.averageRating} starClassName="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold text-white">
                      {item.averageRating > 0 ? `${item.averageRating} out of 5` : 'No reviews yet'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({item.reviewCount} total)
                    </span>
                  </div>
                </div>

                {/* Sort selector */}
                {reviews.length > 0 && (
                  <select
                    value={reviewsSort}
                    onChange={(e) => {
                      setReviewsSort(e.target.value as any);
                      setReviewsPage(1);
                    }}
                    className="bg-black/40 border border-white/15 text-xs rounded-md px-2.5 py-1 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="newest">Most Recent</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                )}
              </div>

              {reviewsLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-6 bg-white/5 rounded-xl border border-white/5 text-center text-muted-foreground text-sm">
                  This item has not been reviewed yet. Only verified renters can submit reviews.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-black/25 border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-white">
                              {rev.reviewer.firstName} {rev.reviewer.lastName}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {format(new Date(rev.createdAt), 'MMMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <RatingStars rating={rev.rating} starClassName="w-3 h-3" />
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap pl-10">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}

                  {/* Reviews Pagination */}
                  {reviewsTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={reviewsPage === 1}
                        onClick={() => setReviewsPage(p => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Page {reviewsPage} of {reviewsTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={reviewsPage === reviewsTotalPages}
                        onClick={() => setReviewsPage(p => Math.min(reviewsTotalPages, p + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="flex justify-between items-start gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{item.title}</h1>
              <WishlistButton itemId={item.id} variant="button" />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 bg-primary/20 text-primary px-2 py-1 rounded-md">
                <RatingStars rating={item.averageRating} starClassName="w-3.5 h-3.5" />
                <span className="font-semibold text-white ml-1">{item.averageRating > 0 ? item.averageRating.toFixed(1) : 'New'}</span>
                {item.reviewCount > 0 && <span className="text-xs text-muted-foreground ml-0.5">({item.reviewCount})</span>}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {item.city}
              </span>
              <span className="capitalize px-2 py-1 bg-white/10 rounded-md border border-white/10">
                Condition: {item.condition}
              </span>
            </div>
          </div>

          <Card className="bg-white/5 border-white/10 backdrop-blur-md sticky top-24">
            <CardContent className="p-6">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <div className="text-4xl font-bold">${item.dailyRate}</div>
                  <div className="text-muted-foreground">per day</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold flex items-center justify-end gap-1">
                    <Shield className="w-4 h-4 text-primary" /> ${item.securityDeposit}
                  </div>
                  <div className="text-xs text-muted-foreground">Refundable deposit</div>
                </div>
              </div>

              {/* Calendar */}
              <div className="border border-white/10 bg-black/20 rounded-xl p-4 mb-6 flex justify-center custom-calendar">
                <style>{`
                  .custom-calendar .rdp { --rdp-cell-size: 40px; margin: 0; }
                  .custom-calendar .rdp-day_selected { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); font-weight: bold; }
                  .custom-calendar .rdp-day_selected:hover { background-color: hsl(var(--primary)/0.8); }
                  .custom-calendar .rdp-day_today { color: hsl(var(--primary)); }
                `}</style>
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={disabledDates}
                  numberOfMonths={1}
                />
              </div>

              {/* Cost Calculation */}
              {diffDays > 0 && (
                <div className="space-y-3 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between text-muted-foreground">
                    <span>${item.dailyRate} x {diffDays} days</span>
                    <span>${rentalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Security Deposit</span>
                    <span>${Number(item.securityDeposit).toFixed(2)}</span>
                  </div>
                  <hr className="border-white/10" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Cost</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {error && <div className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-lg">{error}</div>}

              <Button 
                size="lg" 
                className="w-full text-lg h-14"
                disabled={isSubmitting || !dateRange?.from || !dateRange?.to}
                onClick={handleRequestRental}
              >
                {isSubmitting ? 'Requesting...' : 'Request Rental'}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <CalendarIcon className="w-3 h-3" /> You won't be charged until approved
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
