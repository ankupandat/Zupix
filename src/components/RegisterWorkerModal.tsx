import React, { useState } from 'react';
import { 
  X, 
  Briefcase, 
  User, 
  Phone, 
  MapPin, 
  Award, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle,
  Crosshair,
  Loader2,
  Globe2,
  Navigation,
  CheckCircle2,
  Globe
} from 'lucide-react';
import type { WorkerProfile, ServiceCategory, User as AppUser } from '../types';
import { ApiService } from '../api';
import { detectCurrentLocation } from '../utils/location';
import { 
  SUPPORTED_COUNTRIES, 
  CountryOption, 
  getSavedCountry, 
  setSavedCountryCode 
} from '../utils/countries';

interface RegisterWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onRegisterSuccess: (worker: WorkerProfile) => void;
  onOpenAuth: () => void;
}

const CATEGORIES: ServiceCategory[] = [
  'Doctor / General Physician',
  'Plumbing',
  'Electrical',
  'AC & Refrigeration',
  'Salon & Makeup',
  'Carpentry',
  'Cleaning & Pest Control',
  'Home Painting',
  'Appliance Repair'
];

export const RegisterWorkerModal: React.FC<RegisterWorkerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRegisterSuccess,
  onOpenAuth
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(getSavedCountry());
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    category: 'Plumbing' as ServiceCategory,
    experienceYears: 3,
    hourlyRate: 0,
    fixedPrice: 0,
    pincode: currentUser?.pincode || selectedCountry.popularLocations[0]?.pincode || '110001',
    address: currentUser?.address || '',
    serviceAreaRange: 'local' as 'local' | 'citywide',
    bio: '',
    isEmergencyReady: true,
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    specialization: '',
    clinicExperience: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsMsg, setGpsMsg] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCountryChange = (c: CountryOption) => {
    setSelectedCountry(c);
    setSavedCountryCode(c.code);
    if (c.popularLocations.length > 0) {
      setFormData(prev => ({
        ...prev,
        pincode: c.popularLocations[0].pincode,
        address: `${c.popularLocations[0].name}, ${c.name}`
      }));
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsDetectingGps(true);
    setGpsMsg(null);
    const res = await detectCurrentLocation();
    setIsDetectingGps(false);
    if (res.success && res.pincode) {
      const pin = res.pincode;
      setFormData(prev => ({
        ...prev,
        pincode: pin,
        address: res.area ? `${res.area}, ${res.city}` : prev.address
      }));
      setGpsMsg(`Auto-filled: ${res.area || res.city} (${pin})`);
      setTimeout(() => setGpsMsg(null), 3500);
    } else {
      setError(res.error || 'GPS detection failed. Enter postal code manually.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.pincode.trim() || !formData.bio.trim()) {
      setError('Please fill in all required fields including your bio and service area postal code.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newProfile = await ApiService.registerWorker({
        userId: currentUser.id,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        category: formData.category,
        experienceYears: Number(formData.experienceYears) || 1,
        hourlyRate: 0,
        fixedPrice: 0,
        pincode: formData.pincode.trim(),
        address: formData.address.trim() || `${selectedCountry.name} Service Zone`,
        serviceAreaRange: formData.serviceAreaRange,
        bio: formData.bio.trim(),
        isAvailable: true,
        isEmergencyReady: formData.isEmergencyReady,
        avatar: formData.avatar,
        specialization: formData.specialization,
        clinicExperience: formData.clinicExperience
      });

      // Switch current user role to worker as well
      const updatedUser: AppUser = {
        ...currentUser,
        role: 'worker',
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        pincode: formData.pincode.trim()
      };
      await ApiService.setCurrentUser(updatedUser);

      onRegisterSuccess(newProfile);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to register service provider profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Join Zupix Pro Partner Network</h3>
              <p className="text-xs text-blue-200">100% Free Listing • 0% Commission • Keep 100% Earnings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* 100% Free Direct Phone Agreement Notice */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-2.5 text-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">100% Free Partner Guarantee:</span>
              <p className="text-slate-600 leading-relaxed">
                Zero app fees. All job details and rates are negotiated directly between you and the customer via phone call.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold">
              {error}
            </div>
          )}

          {gpsMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold">
              📍 {gpsMsg}
            </div>
          )}

          {/* Country Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Country (देश चुनें) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const found = SUPPORTED_COUNTRIES.find(c => c.code === e.target.value);
                  if (found) handleCountryChange(found);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.dialCode}) - {c.postalCodeLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Direct Mobile ({selectedCountry.dialCode}) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-600 shrink-0">
                  {selectedCountry.dialCode}
                </span>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="Direct phone number"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Primary Profession / Service Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min={1}
                max={45}
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  {selectedCountry.postalCodeLabel} <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isDetectingGps}
                  className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                >
                  {isDetectingGps ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Crosshair className="w-2.5 h-2.5" />}
                  <span>GPS Fill</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder={`e.g. ${selectedCountry.popularLocations[0]?.pincode || 'Postal Code'}`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* SERVICE PROVIDER AREA RANGE SETUP TOGGLE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Service Area Range (सेवा क्षेत्र दायरा) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, serviceAreaRange: 'local' })}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  formData.serviceAreaRange === 'local'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Navigation className={`w-4 h-4 mt-0.5 shrink-0 ${formData.serviceAreaRange === 'local' ? 'text-blue-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-extrabold text-xs">Only Local Area</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Nearby locality (~5 km radius)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, serviceAreaRange: 'citywide' })}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  formData.serviceAreaRange === 'citywide'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm ring-1 ring-indigo-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Globe2 className={`w-4 h-4 mt-0.5 shrink-0 ${formData.serviceAreaRange === 'citywide' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-extrabold text-xs">All Areas / City Wide</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Entire city coverage & outer hubs</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Professional Bio & Expertise Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="e.g. Licensed practitioner with 8+ years expertise in diagnostics, patient care, or home installations."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Clinic / Workshop / Base Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Sector 12, Main Central Market"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Emergency 24x7 Checkbox */}
          <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="emergencyReady"
              checked={formData.isEmergencyReady}
              onChange={(e) => setFormData({ ...formData, isEmergencyReady: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="emergencyReady" className="text-xs font-bold text-slate-800 cursor-pointer">
              I am available for 24x7 Emergency SOS direct calls in my area
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Register & Go Live on Zupix (Free)</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
