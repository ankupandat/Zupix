import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Star, 
  ArrowRight,
  Sparkles,
  Filter,
  DollarSign,
  Receipt,
  UserCheck,
  Check
} from 'lucide-react';
import type { Booking, User as AppUser } from '../types';
import { ApiService } from '../api';

interface MyBookingsViewProps {
  bookings: Booking[];
  currentUser: AppUser | null;
  onRefresh: () => void;
  onOpenAuth: () => void;
  onNavigateToHome: () => void;
  selectedBookingId?: string | null;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  currentUser,
  onRefresh,
  onOpenAuth,
  onNavigateToHome,
  selectedBookingId
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
          <Receipt className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Track Your Bookings & Logs</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6">
          Log in with your phone or Google account to view your past services, live status updates, and bookings.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
        >
          Sign In to View Bookings
        </button>
      </div>
    );
  }

  const isWorker = currentUser.role === 'worker';

  // Filter bookings based on user role and filter tab
  const filteredBookings = bookings.filter((b) => {
    if (filter === 'pending') return b.status === 'pending_worker';
    if (filter === 'confirmed') return b.status === 'confirmed' || b.status === 'in_progress';
    if (filter === 'completed') return b.status === 'completed' || b.status === 'cancelled';
    return true;
  });

  const handleWorkerAccept = async (bookingId: string) => {
    setIsSubmitting(true);
    try {
      await ApiService.workerAcceptBooking(bookingId, 'FREE_ACCEPTED');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await ApiService.updateBookingStatus(bookingId, 'completed');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingBooking) return;
    try {
      await ApiService.updateBookingStatus(ratingBooking.id, 'completed', ratingScore, ratingFeedback);
      setRatingBooking(null);
      setRatingFeedback('');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending_worker':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            {isWorker ? 'Pending Acceptance' : 'Specialist Reviewing'}
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Confirmed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3 h-3 text-blue-600 animate-spin" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" />
            Booking History & Activity Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track active service schedules, verified specialists, and past bookings. 100% Free with 0% Commission.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'confirmed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'completed' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filter === 'all'
              ? "You haven't placed or received any service bookings yet."
              : `There are no bookings under the '${filter}' filter.`}
          </p>
          <button
            onClick={onNavigateToHome}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            Explore Services & Book
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isHighlighted = selectedBookingId === booking.id;
            return (
              <div
                key={booking.id}
                id={`booking-${booking.id}`}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                  isHighlighted 
                    ? 'border-2 border-blue-500 ring-4 ring-blue-100' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-100">
                      {booking.category.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{booking.category}</h3>
                        <span className="text-[11px] font-mono text-slate-400">#{booking.id.slice(-6)}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {isWorker ? `Customer: ${booking.customerName}` : `Specialist: ${booking.workerName}`}
                      </p>
                    </div>
                  </div>

                  <div>{getStatusBadge(booking.status)}</div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 py-3 text-xs text-slate-600 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{booking.scheduledDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{booking.scheduledTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{booking.customerAddress} ({booking.customerPincode})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {isWorker ? `Customer: +91 ${booking.customerPhone}` : `Pro: +91 ${booking.workerPhone}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-emerald-700 font-bold">100% Free Booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Direct Fee: <strong className="text-slate-900">₹{booking.estimatedCost}</strong></span>
                  </div>
                </div>

                {/* Issue Description */}
                {booking.issueDescription && (
                  <div className="py-2.5 text-xs text-slate-600 bg-slate-50 px-3 rounded-xl mt-2 border border-slate-100">
                    <strong className="text-slate-800">Issue Notes: </strong>
                    {booking.issueDescription}
                  </div>
                )}

                {/* Action Controls */}
                <div className="mt-4 pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Payable directly to pro upon job completion.
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Worker Action: Accept Job */}
                    {isWorker && booking.status === 'pending_worker' && (
                      <button
                        onClick={() => handleWorkerAccept(booking.id)}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept & Confirm
                      </button>
                    )}

                    {/* Pro Action: Mark Completed */}
                    {isWorker && (booking.status === 'confirmed' || booking.status === 'in_progress') && (
                      <button
                        onClick={() => handleCompleteBooking(booking.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Completed
                      </button>
                    )}

                    {/* Customer Action: Review/Rate if completed & not yet rated */}
                    {!isWorker && booking.status === 'completed' && !booking.rating && (
                      <button
                        onClick={() => setRatingBooking(booking)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        Rate Specialist
                      </button>
                    )}

                    {/* Show rating if already given */}
                    {booking.rating && (
                      <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Rated {booking.rating} / 5</span>
                      </div>
                    )}

                    <a
                      href={`tel:${isWorker ? booking.customerPhone : booking.workerPhone}`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Direct Call
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal for Customers */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Rate {ratingBooking.workerName}</h3>
            <p className="text-xs text-slate-500">
              How was your service experience for {ratingBooking.category}?
            </p>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="p-1.5 text-2xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= ratingScore
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Feedback / Review</label>
                <textarea
                  rows={3}
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="e.g. Excellent service, arrived on time and resolved issue perfectly!"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRatingBooking(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
