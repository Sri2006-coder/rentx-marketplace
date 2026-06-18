'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BookingTimeline } from '@/components/ui/BookingTimeline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Shield, User as UserIcon, Star } from 'lucide-react';
import Image from 'next/image';
import { RatingStars } from '@/components/ui/RatingStars';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Damage assessment state
  const [damageReport, setDamageReport] = useState<string>('NONE');
  const [showDamageAssessment, setShowDamageAssessment] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  const updateStatus = async (status: string, extraData?: any) => {
    setActionLoading(true);
    try {
      await api.put(`/bookings/${id}/status`, { status, ...extraData });
      await fetchBooking();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitLoading(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await api.post('/reviews', {
        bookingId: booking.id,
        rating,
        comment,
      });
      setReviewSuccess('Your review has been submitted successfully!');
      setComment('');
      setRating(5);
      await fetchBooking();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-3xl font-bold mb-2">Booking not found</h1>
        <p className="text-muted-foreground">This booking may have been removed.</p>
      </div>
    );
  }

  const isOwner = user?.id === booking.item.ownerId;
  const isRenter = user?.id === booking.renterId;
  
  // Find review submitted by this user
  const userReview = booking.reviews?.find((r: any) => r.reviewerId === user?.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Booking Details</h1>
          <div className="text-muted-foreground">ID: {booking.id}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={booking.status} />
          {booking.status === 'PENDING' && (
            <div className="text-sm text-yellow-500 font-medium">Awaiting Owner Approval</div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {isOwner && booking.status === 'PENDING' && (
              <>
                <Button onClick={() => updateStatus('APPROVED')} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">Approve Request</Button>
                <Button onClick={() => updateStatus('REJECTED')} disabled={actionLoading} variant="destructive">Reject</Button>
              </>
            )}
            {isRenter && booking.status === 'APPROVED' && (
              <Button onClick={() => router.push(`/payments/${booking.id}`)} className="bg-primary-600 hover:bg-primary-700">
                <Shield className="w-4 h-4 mr-2" /> Pay Now
              </Button>
            )}
            {isOwner && booking.status === 'CONFIRMED' && (
              <Button onClick={() => updateStatus('ACTIVE')} disabled={actionLoading}>Mark as Picked Up (Active)</Button>
            )}
            {isRenter && booking.status === 'ACTIVE' && (
              <Button onClick={() => updateStatus('RETURNED')} disabled={actionLoading}>Mark as Returned</Button>
            )}
            {isOwner && booking.status === 'RETURNED' && !showDamageAssessment && (
              <Button onClick={() => setShowDamageAssessment(true)} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700">Confirm Return & Complete</Button>
            )}
            {isRenter && booking.status === 'PENDING' && (
              <Button onClick={() => updateStatus('CANCELLED')} disabled={actionLoading} variant="destructive">Cancel Request</Button>
            )}
          </div>

          {/* Damage Assessment Flow */}
          {showDamageAssessment && (
            <Card className="bg-white/5 border border-primary/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Damage Assessment</h3>
                <p className="text-white/60 mb-4 text-sm">Please assess the condition of the returned item. If no damage is reported, the security deposit will be fully refunded to the renter.</p>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button 
                      variant={damageReport === 'NONE' ? 'default' : 'outline'}
                      onClick={() => setDamageReport('NONE')}
                      className={damageReport === 'NONE' ? 'bg-green-600' : ''}
                    >
                      No Damage
                    </Button>
                    <Button 
                      variant={damageReport === 'MINOR' ? 'default' : 'outline'}
                      onClick={() => setDamageReport('MINOR')}
                      className={damageReport === 'MINOR' ? 'bg-yellow-600' : ''}
                    >
                      Minor Damage
                    </Button>
                    <Button 
                      variant={damageReport === 'MAJOR' ? 'default' : 'outline'}
                      onClick={() => setDamageReport('MAJOR')}
                      className={damageReport === 'MAJOR' ? 'bg-red-600' : ''}
                    >
                      Major Damage
                    </Button>
                  </div>
                  
                  {damageReport !== 'NONE' && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      This booking will be flagged for manual review by RentX admins to assess security deposit deductions.
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <Button 
                      onClick={() => {
                        setShowDamageAssessment(false);
                        updateStatus('COMPLETED', { damageReport });
                      }} 
                      disabled={actionLoading} 
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Submit & Complete
                    </Button>
                    <Button variant="ghost" onClick={() => setShowDamageAssessment(false)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leave Review Section (Completed bookings only) */}
          {booking.status === 'COMPLETED' && (
            <Card className="bg-white/5 border border-primary/20 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  {userReview ? 'Your Submitted Review' : 'Leave a Review'}
                </h2>

                {userReview ? (
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Submitted on {format(new Date(userReview.createdAt), 'MMM d, yyyy')}
                      </div>
                      <RatingStars rating={userReview.rating} starClassName="w-4 h-4" />
                    </div>
                    <p className="text-sm text-gray-300 italic whitespace-pre-wrap">
                      "{userReview.comment}"
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {reviewSuccess && (
                      <div className="p-3 bg-green-500/20 text-green-400 text-sm rounded-lg border border-green-500/30">
                        {reviewSuccess}
                      </div>
                    )}
                    {reviewError && (
                      <div className="p-3 bg-red-500/20 text-red-400 text-sm rounded-lg border border-red-500/30">
                        {reviewError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground block">
                        {isRenter ? 'Rate the item and owner experience:' : 'Rate the renter behavior:'}
                      </label>
                      <RatingStars 
                        rating={rating} 
                        interactive={true} 
                        onChange={setRating} 
                        starClassName="w-7 h-7" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="comment" className="text-sm font-semibold text-muted-foreground">
                        Comment
                      </label>
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={isRenter ? "Describe your experience renting this item. Was it in good condition? Was the owner helpful?" : "Describe your experience with this renter. Were they punctual? Did they return the item in good condition?"}
                        required
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary h-28 resize-none text-white placeholder-white/30"
                      />
                    </div>

                    <Button type="submit" disabled={reviewSubmitLoading} className="w-full sm:w-auto">
                      {reviewSubmitLoading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Booking Timeline</h2>
              <BookingTimeline timeline={booking.timeline} />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Item Information</h2>
              <div className="flex gap-4">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-black/20 shrink-0">
                  {booking.item.images && booking.item.images.length > 0 ? (
                    <Image unoptimized src={booking.item.images[0].imageUrl} alt="Item" fill className="object-cover" />
                  ) : null}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{booking.item.title}</h3>
                  <div className="text-muted-foreground text-sm flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4" /> {booking.item.city}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/items/${booking.item.id}`)}>
                    View Listing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" /> Rental Period
                </h3>
                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                  <div className="text-sm text-muted-foreground mb-1">Start Date</div>
                  <div className="font-medium">{format(new Date(booking.startDate), 'MMMM d, yyyy')}</div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 border border-white/5 mt-2">
                  <div className="text-sm text-muted-foreground mb-1">End Date</div>
                  <div className="font-medium">{format(new Date(booking.endDate), 'MMMM d, yyyy')}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Cost Breakdown
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Rate</span>
                    <span>${booking.item.dailyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Deposit</span>
                    <span>${booking.item.securityDeposit}</span>
                  </div>
                  <hr className="border-white/10 my-2" />
                  <div className="flex justify-between font-bold text-lg text-primary">
                    <span>Total Cost</span>
                    <span>${booking.totalPrice}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" /> 
                {isOwner ? 'Renter Information' : 'Owner Information'}
              </h3>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    {isOwner ? `${booking.renter.firstName} ${booking.renter.lastName}` : `${booking.item.owner.firstName} ${booking.item.owner.lastName}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isOwner ? booking.renter.email : booking.item.owner.email}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
