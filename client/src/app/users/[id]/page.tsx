'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/ui/RatingStars';
import { Shield, User as UserIcon, Calendar, ArrowLeft, Star, ThumbsUp, CalendarRange, CheckCircle2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function UserReputationPage() {
  const { id } = useParams();
  const router = useRouter();

  // Basic User Info (fetched as part of reputation or fallback)
  const [userInfo, setUserInfo] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);
  const [reviewsData, setReviewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Pagination and Sorting states
  const [sort, setSort] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const fetchReputation = async () => {
    try {
      const repRes = await api.get(`/users/${id}/reputation`);
      setReputation(repRes.data.data);
      
      // Fallback user info from reputation payload
      // In a real app we might fetch user info by ID, here we can also get user details from the database queries
      // If we don't have user info endpoint, we can build a simple user info fallback
      try {
        const userRes = await api.get(`/auth/me`);
        if (userRes.data?.data?.user?.id === id) {
          setUserInfo(userRes.data.data.user);
        }
      } catch (err) {
        // Suppress auth/me error if not logged in
      }
    } catch (err) {
      console.error('Failed to fetch reputation', err);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const reviewsRes = await api.get(`/users/${id}/reviews?page=${page}&limit=${limit}&sort=${sort}`);
      setReviewsData(reviewsRes.data.data.reviews);
      setTotalPages(reviewsRes.data.data.meta.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchReputation();
      await fetchReviews();
      setLoading(false);
    };
    if (id) loadInitial();
  }, [id]);

  useEffect(() => {
    if (id) fetchReviews();
  }, [page, sort]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!reputation) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-3xl font-bold mb-2">User not found</h1>
        <p className="text-muted-foreground">The profile details could not be retrieved.</p>
        <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Fallback name if auth/me is not this user
  const displayName = userInfo 
    ? `${userInfo.firstName} ${userInfo.lastName}` 
    : `User Profile`;

  const trustProfile = reputation.trustProfile;
  const ownerRep = reputation.ownerReputation;
  const renterRep = reputation.renterReputation;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero Header Card */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl h-full flex flex-col justify-center py-8">
            <CardContent className="text-center space-y-4">
              <div className="relative w-28 h-28 mx-auto bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/40">
                <UserIcon className="w-14 h-14 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">{displayName}</h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4" /> Member since 2026
                </p>
              </div>

              {/* Extensible Future Trust Badges */}
              <div className="pt-2 flex flex-wrap gap-2 justify-center">
                {trustProfile.verifiedBadge && (
                  <span className="bg-primary/20 border border-primary/40 text-primary text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 fill-primary/30" /> Verified Badge
                  </span>
                )}
                {trustProfile.aadhaarStatus === 'VERIFIED' && (
                  <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-xs px-2.5 py-1 rounded-full font-semibold">
                    Aadhaar Verified
                  </span>
                )}
                {trustProfile.panStatus === 'VERIFIED' && (
                  <span className="bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs px-2.5 py-1 rounded-full font-semibold">
                    PAN Verified
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Extensible Trust Score Indicator */}
        <div className="md:col-span-2">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Extensible Trust Score
              </CardTitle>
              <CardDescription>Reputation rating based on verified credentials and history.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center rounded-full bg-black/40 border border-white/10 shadow-2xl">
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-white">{trustProfile.trustScore}</span>
                    <span className="text-xs text-muted-foreground block">/ 100</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-white">Trust Profile Level</span>
                    <span className="text-primary font-bold">{trustProfile.trustScore >= 80 ? 'Excellent' : trustProfile.trustScore >= 50 ? 'Good' : 'Standard'}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-purple-400 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${trustProfile.trustScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This user starts with a trust score of 0. Trust scores increase through verification (Aadhaar, PAN, email, phone) and positive rental reviews.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Email Verification</div>
                  <div className="text-xs font-semibold text-green-400">✓ Verified (+15)</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Phone Verification</div>
                  <div className="text-xs font-semibold text-yellow-500/80">Pending (Future)</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Identity Verification</div>
                  <div className="text-xs font-semibold text-yellow-500/80">Pending (Future)</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Trust Score Level</div>
                  <div className="text-xs font-semibold text-primary">{trustProfile.trustScore} Pts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Owner & Renter Reputation Tabs */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        
        {/* Owner Reputation Card */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Owner Reputation
            </CardTitle>
            <CardDescription>Stats for listing items and leasing equipment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-white flex justify-center items-center gap-1">
                  {ownerRep.averageRating > 0 ? ownerRep.averageRating : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Average Rating</div>
              </div>
              <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-white">{ownerRep.reviewCount}</div>
                <div className="text-xs text-muted-foreground mt-1">Reviews Received</div>
              </div>
              <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-white">{ownerRep.totalRentalsCompleted}</div>
                <div className="text-xs text-muted-foreground mt-1">Rentals Completed</div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-white/5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Response Rate:</span>
                <span className="font-semibold text-white">{ownerRep.responseRate} (Fast response)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Identity Status:</span>
                <span className="font-semibold text-white">{ownerRep.verifiedStatus}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Average Stars:</span>
                <RatingStars rating={ownerRep.averageRating} starClassName="w-3.5 h-3.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Renter Reputation Card */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-primary" /> Renter Reputation
            </CardTitle>
            <CardDescription>Stats for renting gear from other owners.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 bg-black/20 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                <div className="text-xl font-bold text-white">{renterRep.averageRating > 0 ? renterRep.averageRating : 'N/A'}</div>
                <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">Avg Rating</div>
              </div>
              <div className="p-2.5 bg-black/20 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                <div className="text-xl font-bold text-white">{renterRep.reviewCount}</div>
                <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">Reviews</div>
              </div>
              <div className="p-2.5 bg-black/20 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                <div className="text-xl font-bold text-white">{renterRep.rentalsCompleted}</div>
                <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">Completed</div>
              </div>
              <div className="p-2.5 bg-black/20 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                <div className="text-xl font-bold text-white">{renterRep.successfulReturns}</div>
                <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">Returns</div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-white/5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Successful Returns rate:</span>
                <span className="font-semibold text-green-400">
                  {renterRep.rentalsCompleted > 0 
                    ? `${Math.round((renterRep.successfulReturns / renterRep.rentalsCompleted) * 100)}%` 
                    : '100%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Average Stars:</span>
                <RatingStars rating={renterRep.averageRating} starClassName="w-3.5 h-3.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Received List */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold">Feedback & Reviews Received</CardTitle>
            <CardDescription>Browse verified customer and owner feedback.</CardDescription>
          </div>
          
          {/* Sorting Control */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as any);
                setPage(1);
              }}
              className="bg-black/40 border border-white/15 text-sm rounded-md px-2.5 py-1 text-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="newest">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {reviewsLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reviewsData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No reviews received yet.</div>
          ) : (
            <div className="space-y-4">
              {reviewsData.map((review) => (
                <div key={review.id} className="p-5 bg-black/20 border border-white/5 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </h4>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>Verified Booking</span>
                          {review.item && (
                            <>
                              <span>•</span>
                              <span className="text-primary hover:underline cursor-pointer" onClick={() => router.push(`/items/${review.item.id}`)}>
                                {review.item.title}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <RatingStars rating={review.rating} starClassName="w-3.5 h-3.5" />
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 leading-relaxed pl-12 whitespace-pre-wrap">
                    "{review.comment}"
                  </p>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
