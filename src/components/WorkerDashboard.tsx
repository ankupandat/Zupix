import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  Star, 
  User, 
  AlertTriangle,
  RefreshCw,
  Power,
  Sparkles,
  Globe2,
  Navigation,
  Check,
  CheckCheck
} from 'lucide-react';
import type { WorkerProfile, Booking, User as AppUser } from '../types';
import { ApiService } from '../api';

interface WorkerDashboardProps {
  workerProfile: WorkerProfile | null;
  bookings: Booking[];
  currentUser: AppUser | null;
  onRefresh: () => void;
  onOpenRegister: () => void;
  onNavigateToSetup?: () => void;
  onNavigateToSearch?: () => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  workerProfile,
  bookings,
  currentUser,
  onRefresh,
  onOpenRegister,
  onNavigateToSetup,
  onNavigateToSearch
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);

  // Auto-recover/sync worker profile if current user has worker role
  useEffect(() => {
    if (!workerProfile && currentUser && currentUser.role === 'worker' && !isAutoCreating) {
      setIsAutoCreating(true);
      ApiService.registerWorker({
        userId: currentUser.id,
        name: currentUser.name || 'Verified Specialist',
        phone: currentUser.phone || '9876543210',
        category: 'Doctor / General Physician',
        experienceYears: 4,
        hourlyRate: 0,
        fixedPrice: 0,
        pincode: currentUser.pincode || '134102',
        address: currentUser.address || 'Local Service Zone',
        serviceAreaRange: 'citywide',
        bio: `Verified Specialist serving ${currentUser.pincode || '134102'}. Direct calling available.`,
        isAvailable: true,
        isEmergencyReady: true,
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
      }).then(() => {
        onRefresh();
      }).catch(err => {
        console.warn('Auto sync profile:', err);
      }).finally(() => {
        setIsAutoCreating(false);
      });
    }
  }, [workerProfile, currentUser]);

  if (!workerProfile) {
    if (isAutoCreating || currentUser?.role === 'worker') {
      return (
        <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-lg">Synchronizing Your Verified Pro Profile...</h3>
          <p className="text-xs text-slate-500">Connecting your direct phone line and local service zone</p>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
          <Briefcase className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Become a Zupix Service Partner</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          List your plumbing, electrical, medical, carpentry or salon services to receive instant local bookings. 100% Free with 0% Commission.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          {onNavigateToSetup ? (
            <button
              onClick={onNavigateToSetup}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              Open Provider Setup (/provider-setup)
            </button>
          ) : (
            <button
              onClick={onOpenRegister}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              Register as Specialist Now
            </button>
          )}
        </div>
      </div>
    );
  }

  // Filter pending jobs for this worker
  const pendingRequests = bookings.filter(b => b.status === 'pending_worker' && (b.workerId === workerProfile.id || b.workerPhone === workerProfile.phone));
  const activeJobs = bookings.filter(b => (b.status === 'confirmed' || b.status === 'in_progress') && (b.workerId === workerProfile.id || b.workerPhone === workerProfile.phone));
  const completedJobs = bookings.filter(b => b.status === 'completed' && (b.workerId === workerProfile.id || b.workerPhone === workerProfile.phone));

  const handleAcceptBooking = async (bookingId: string) => {
    setProcessingBookingId(bookingId);
    try {
      await ApiService.workerAcceptBooking(bookingId, 'FREE_ACCEPTED');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    setProcessingBookingId(bookingId);
    try {
      await ApiService.updateBookingStatus(bookingId, 'completed');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleToggleAreaRange = async () => {
    setIsUpdatingStatus(true);
    const newRange = workerProfile.serviceAreaRange === 'citywide' ? 'local' : 'citywide';
    try {
      await ApiService.updateWorkerProfile({
        ...workerProfile,
        serviceAreaRange: newRange
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleAvailability = async () => {
    setIsUpdatingStatus(true);
    try {
      await ApiService.updateWorkerProfile({
        ...workerProfile,
        isAvailable: !workerProfile.isAvailable
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      
      {/* Blocked Alert Banner if locked by Admin */}
      {workerProfile.isBlocked && (
        <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-md flex items-start gap-3 animate-pulse">
          <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wide">Account Status: Locked / Blocked</h3>
            <p className="text-xs text-rose-100 mt-0.5 leading-relaxed">
              Your service provider profile has been locked by Zupix Admin. You will not appear in search results until manually re-activated by administration.
            </p>
            {workerProfile.warningMessage && (
              <p className="mt-2 text-xs bg-rose-700/80 p-2 rounded-lg font-mono">
                Admin Note: {workerProfile.warningMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 1. DEDICATED PROVIDER DASHBOARD BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            
            {/* Status Badge: "🟢 Your Profile is Live in Pincode 134102" */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 rounded-full text-xs font-bold text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>🟢 Your Profile is Live in Pincode {workerProfile.pincode || currentUser?.pincode || '134102'}</span>
            </div>

            {/* Header: "Welcome, [Provider Name] - [Selected Trade/Category]" */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {workerProfile.name} - {workerProfile.category}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct Calling: <strong className="text-white font-mono">+91 {workerProfile.phone}</strong></span>
              </span>
              <span>•</span>
              <span>Experience: <strong className="text-white">{workerProfile.experienceYears} Years</strong></span>
              <span>•</span>
              <span className="capitalize">{workerProfile.serviceAreaRange === 'citywide' ? 'Citywide Service' : `Pincode ${workerProfile.pincode}`}</span>
            </div>
          </div>

          {/* Quick Actions: Availability Toggle ("Online for Direct Calls" / "Offline") & Setup Link */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {onNavigateToSetup && (
              <button
                type="button"
                onClick={onNavigateToSetup}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                title="Update category, phone or location"
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-300" />
                <span>Update Trade</span>
              </button>
            )}

            {/* Availability Toggle */}
            <button
              type="button"
              onClick={handleToggleAvailability}
              disabled={isUpdatingStatus || workerProfile.isBlocked}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-md ${
                workerProfile.isAvailable
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black ring-2 ring-emerald-300/50'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{workerProfile.isAvailable ? 'Online for Direct Calls' : 'Offline'}</span>
            </button>
          </div>
        </div>

        {/* Notice Box: "Customers in your area can now call you directly! 0% commission fees." */}
        <div className="bg-blue-600/20 border border-blue-400/30 rounded-2xl p-4 flex items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/30 text-blue-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm">
                Customers in your area can now call you directly! 0% commission fees.
              </p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Every booking and call goes straight to your mobile phone. You keep 100% of all payments.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-300 shrink-0 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-400/25">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>0% Platform Fees</span>
          </div>
        </div>
      </div>

      {/* Specialist Details & Quick Coverage Toggles */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={workerProfile.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
            alt={workerProfile.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-base">{workerProfile.name}</span>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                {workerProfile.category}
              </span>
              {workerProfile.isEmergencyReady && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                  ⚡ 24x7 SOS Ready
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Pincode: {workerProfile.pincode} • Base: {workerProfile.address}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleToggleAreaRange}
            disabled={isUpdatingStatus}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="Toggle coverage range"
          >
            {workerProfile.serviceAreaRange === 'citywide' ? (
              <>
                <Globe2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Coverage: Citywide</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Coverage: Local Pincode Only</span>
              </>
            )}
          </button>

          {onNavigateToSearch && (
            <button
              onClick={onNavigateToSearch}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors"
            >
              View Search View
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Pending Requests</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingRequests.length}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Free instant accept</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Active Jobs</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{activeJobs.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Confirmed & in progress</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Completed Jobs</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{workerProfile.completedJobs || completedJobs.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Total jobs finished</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Client Rating</div>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>{workerProfile.rating || 5.0}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">({workerProfile.reviewCount || 0} reviews)</div>
        </div>
      </div>

      {/* Pending Bookings (100% Free Instant Accept) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>Incoming Booking Requests ({pendingRequests.length})</span>
          </h3>
          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free & Zero Commission
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No pending booking requests right now. Keep your status online to receive local alerts.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-5 rounded-3xl border-2 border-blue-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {booking.customerName} • {booking.category}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Date: {booking.scheduledDate} ({booking.scheduledTime})
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg">
                    Direct Request
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                  <div>
                    <strong className="text-slate-800">Address: </strong>
                    {booking.customerAddress} ({booking.customerPincode})
                  </div>
                  <div>
                    <strong className="text-slate-800">Customer Phone: </strong>
                    <a href={`tel:${booking.customerPhone}`} className="text-blue-600 font-bold hover:underline">
                      +91 {booking.customerPhone}
                    </a>
                  </div>
                  {booking.issueDescription && (
                    <div>
                      <strong className="text-slate-800">Issue: </strong>
                      {booking.issueDescription}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-600">
                    Fee Agreement: <strong className="text-slate-900 font-bold">Negotiated Direct on Call</strong>
                  </span>

                  <button
                    onClick={() => handleAcceptBooking(booking.id)}
                    disabled={processingBookingId === booking.id}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 transition-all hover:scale-102 disabled:opacity-75"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{processingBookingId === booking.id ? 'Accepting...' : 'Accept & Confirm Job'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-blue-600" />
            <span>Active & In-Progress Jobs ({activeJobs.length})</span>
          </h3>

          <div className="space-y-3">
            {activeJobs.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {booking.customerName} • {booking.category}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Date: {booking.scheduledDate} ({booking.scheduledTime})
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                    Confirmed
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                  <p><strong className="text-slate-800">Address: </strong>{booking.customerAddress}</p>
                  <p>
                    <strong className="text-slate-800">Direct Customer Phone: </strong>
                    <a href={`tel:${booking.customerPhone}`} className="text-blue-600 font-bold hover:underline">
                      {booking.customerPhone}
                    </a>
                  </p>
                  <p className="text-[11px] text-slate-500 pt-1">
                    💡 If reached an incorrect location, call customer to guide each other to the right door.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-600">
                    Payment: <strong className="text-slate-900 font-bold">Direct Phone Agreement</strong>
                  </span>

                  <button
                    onClick={() => handleCompleteBooking(booking.id)}
                    disabled={processingBookingId === booking.id}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Job Completed</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
