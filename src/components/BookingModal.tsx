import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import type { WorkerProfile, User as AppUser, Booking } from '../types';
import { ApiService } from '../api';

interface BookingModalProps {
  isOpen: boolean;
  worker: WorkerProfile | null;
  currentUser: AppUser | null;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  onOpenAuth: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  worker,
  currentUser,
  onClose,
  onBookingSuccess,
  onOpenAuth
}) => {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    pincode: currentUser?.pincode || worker?.pincode || '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00 AM - 12:00 PM',
    issueDescription: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !worker) return null;

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage('Please fill in your name, contact number, and service address.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const newBooking = await ApiService.createBooking({
        customerId: currentUser.id,
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerAddress: formData.address.trim(),
        customerPincode: formData.pincode || worker.pincode,
        workerId: worker.id,
        workerName: worker.name,
        workerPhone: worker.phone,
        category: worker.category,
        issueDescription: formData.issueDescription || `Standard ${worker.category} consultation & service`,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        estimatedCost: worker.fixedPrice || worker.hourlyRate || 350,
        customerUtr: 'FREE_BOOKING'
      });

      onBookingSuccess(newBooking);
    } catch (err) {
      console.error('Booking failed:', err);
      setErrorMessage('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={worker.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
                alt={worker.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/30 shadow-md"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-lg leading-tight">{worker.name}</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold rounded-full">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-blue-200">{worker.category} • Area: {worker.pincode}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 100% Free Booking Banner & Direct Agreement */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white/10 rounded-xl border border-white/15 text-xs gap-2">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Free Platform Booking</span>
            </div>
            <span className="text-slate-200 text-xs">
              Fee Agreement: <strong className="text-amber-300">Negotiated Direct on Call</strong>
            </span>
          </div>
        </div>

        {/* Dedicated Instruction Box for Location and Phone Agreement */}
        <div className="mx-5 mt-4 p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Confirm charges and exact location directly over a phone call</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            If the specialist reaches an incorrect location, use direct phone calls to guide each other to the correct spot.
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleDetailsSubmit} className="p-5 pt-3 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Complete Service Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House/Flat No, Street, Landmark, City"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Time Slot <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <select
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="Urgent (Within 45 mins)">⚡ Urgent (Within 45 mins)</option>
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Describe Problem or Service Needed
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={2}
                value={formData.issueDescription}
                onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                placeholder="e.g. Tap leaking in kitchen, AC cooling issue, General health consultation..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Placing Free Booking...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Send Booking Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

