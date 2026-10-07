import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  AlertTriangle, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Activity,
  ArrowRight
} from 'lucide-react';
import type { ServiceCategory, User as AppUser, EmergencyRequest } from '../types';
import { ApiService } from '../api';
import { t, LanguageCode } from '../utils/i18n';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  lang?: LanguageCode;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  lang = 'en-GB'
}) => {
  const [category, setCategory] = useState<ServiceCategory>('Plumbing');
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    pincode: currentUser?.pincode || '',
    notes: ''
  });

  const [isDispatched, setIsDispatched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<EmergencyRequest | null>(null);

  if (!isOpen) return null;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const req = await ApiService.createEmergencyRequest({
        customerId: currentUser?.id || `GUEST-${Date.now()}`,
        customerName: formData.name || 'Urgent Customer',
        customerPhone: formData.phone || '',
        serviceNeeded: `Emergency ${category} SOS Dispatch (100% Free Broadcast)`,
        category: category,
        pincode: formData.pincode,
        address: formData.address || 'Live Location',
        notes: formData.notes
      });

      setCreatedRequest(req);
      setIsDispatched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-rose-500 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white animate-pulse">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg">24x7 Urgent Support</h3>
                <span className="px-2 py-0.5 bg-emerald-400 text-emerald-950 text-[10px] font-black rounded-md uppercase">
                  100% Free
                </span>
              </div>
              <p className="text-xs text-rose-100">Priority local broadcast with direct calling</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-rose-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {isDispatched ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">Urgent Request Broadcasted!</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Alert dispatched to verified {category} specialists in area {formData.pincode}.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1 text-left font-medium">
              <p>• Request Ref: <strong>{createdRequest?.id}</strong></p>
              <p>• Service: <strong>{category}</strong></p>
              <p>• Platform Fee: <strong className="text-emerald-600">₹0 (100% Free)</strong></p>
              <p>• Direct Helpline: <strong>+91 9306315807</strong></p>
            </div>

            <div className="flex gap-2">
              <a
                href="tel:9306315807"
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call Helpline</span>
              </a>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBroadcast} className="p-5 space-y-4">
            
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Free Priority Service Broadcast • Zero Token Money</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Service Needed <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white"
              >
                <option value="Doctor / General Physician">🩺 Medical / Doctor Emergency</option>
                <option value="Plumbing">🚰 Plumbing (Leak / Burst)</option>
                <option value="Electrical">⚡ Electrical (Sparks / Power Cut)</option>
                <option value="AC & Refrigeration">❄️ Cooling Breakdown</option>
                <option value="Carpentry">🚪 Lock Jam / Door Repair</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit Phone"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House, Street, Area"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pincode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="6-digit"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Urgent Situation Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Describe what needs immediate attention..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:bg-white resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    <span>Broadcast Urgent Request (Free)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
