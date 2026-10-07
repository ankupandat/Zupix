import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Camera, 
  Upload, 
  MapPin, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Briefcase, 
  UserCheck,
  AlertCircle,
  X,
  Image as ImageIcon,
  Crosshair,
  Loader2,
  Compass,
  Globe,
  CheckCircle2,
  Stethoscope,
  Wrench,
  Zap,
  Wind,
  Scissors,
  Hammer,
  SprayCan,
  Paintbrush
} from 'lucide-react';
import { LiveAppIcon } from './LiveAppIcon';
import { ApiService } from '../api';
import type { User as AppUser, UserRole, ServiceCategory } from '../types';
import { 
  detectCurrentLocation, 
  getSmartSearchSuggestions, 
  searchGlobalPlaces, 
  LocationSuggestion 
} from '../utils/location';
import { getOrCreateDeviceId } from '../utils/device';
import { 
  SUPPORTED_COUNTRIES, 
  CountryOption, 
  getSavedCountry, 
  setSavedCountryCode 
} from '../utils/countries';

interface ProfileSetupViewProps {
  initialData: Partial<AppUser>;
  onComplete: (user: AppUser) => void;
  onCancel: () => void;
}

// Preset HD Avatars for quick selection
const PRESET_AVATARS = [
  { label: 'Customer (Male)', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
  { label: 'Customer (Female)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { label: 'Doctor / Physician', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80' },
  { label: 'Technician / Pro', url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80' },
  { label: 'Electrician Pro', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { label: 'Beauty Expert', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
];

const SPECIALIST_TRADES: { category: ServiceCategory; icon: any; title: string }[] = [
  { category: 'Doctor / General Physician', icon: Stethoscope, title: 'Doctor / General Physician' },
  { category: 'Plumbing', icon: Wrench, title: 'Plumbing Specialist' },
  { category: 'Electrical', icon: Zap, title: 'Electrician Pro' },
  { category: 'AC & Refrigeration', icon: Wind, title: 'AC & Appliance Tech' },
  { category: 'Salon & Makeup', icon: Scissors, title: 'Salon & Beauty Expert' },
  { category: 'Carpentry', icon: Hammer, title: 'Carpenter Pro' },
  { category: 'Cleaning & Pest Control', icon: SprayCan, title: 'Cleaning & Pest Control' },
  { category: 'Home Painting', icon: Paintbrush, title: 'Home Painter' },
];

export const ProfileSetupView: React.FC<ProfileSetupViewProps> = ({
  initialData,
  onComplete,
  onCancel
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(getSavedCountry());
  const [name, setName] = useState(initialData.name || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [pincode, setPincode] = useState(initialData.pincode || selectedCountry.popularLocations[0]?.pincode || '');
  const [address, setAddress] = useState(initialData.address || '');
  const [role, setRole] = useState<UserRole>(initialData.role || 'customer');
  const [avatar, setAvatar] = useState(initialData.avatar || PRESET_AVATARS[0].url);
  
  // Specialist specific state
  const [category, setCategory] = useState<ServiceCategory>('Plumbing');
  const [experienceYears, setExperienceYears] = useState(3);
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');

  // Global search suggestions state
  const [globalSuggestions, setGlobalSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [isLocalityFocused, setIsLocalityFocused] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  // Success Confirmation Screen for Service Provider
  const [isRegistrationDone, setIsRegistrationDone] = useState(false);
  const [savedUserData, setSavedUserData] = useState<AppUser | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const localityContainerRef = useRef<HTMLDivElement | null>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (localityContainerRef.current && !localityContainerRef.current.contains(e.target as Node)) {
        setIsLocalityFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Geocoding Autocomplete Debouncer
  useEffect(() => {
    if (!address || address.trim().length < 2) {
      setGlobalSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingGlobal(true);
      try {
        const results = await searchGlobalPlaces(address);
        setGlobalSuggestions(results);
      } catch (e) {
        console.warn('Global places search failed:', e);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [address]);

  // Merge static smart search with live global suggestions
  const smartSuggestions = getSmartSearchSuggestions(address || pincode, [], globalSuggestions);
  const combinedLocations = [
    ...globalSuggestions,
    ...smartSuggestions.locations.filter(loc => !globalSuggestions.some(g => g.name === loc.name))
  ].slice(0, 8);

  const handleCountryChange = (c: CountryOption) => {
    setSelectedCountry(c);
    setSavedCountryCode(c.code);
    if (c.popularLocations.length > 0) {
      setPincode(c.popularLocations[0].pincode);
      setAddress(`${c.popularLocations[0].name}, ${c.name}`);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsDetectingGps(true);
    setGpsFeedback(null);
    setError('');

    const result = await detectCurrentLocation();
    setIsDetectingGps(false);

    if (result.success && result.pincode) {
      setPincode(result.pincode);
      if (result.area) {
        setAddress(`${result.area}, ${result.city}`);
      } else if (result.city) {
        setAddress(result.city);
      }
      setGpsFeedback(`📍 Auto-filled: ${result.area || result.city} (${result.pincode})`);
      setIsLocalityFocused(false);
      setTimeout(() => setGpsFeedback(null), 4000);
    } else {
      setError(result.error || 'Could not detect location. Please enter postal code manually.');
    }
  };

  const handleSelectLocation = (loc: LocationSuggestion) => {
    if (loc.pincode && loc.pincode !== '00000') {
      setPincode(loc.pincode);
    }
    const fullText = loc.formattedAddress || `${loc.name}, ${loc.city}${loc.state ? `, ${loc.state}` : ''}`;
    setAddress(fullText);
    setIsLocalityFocused(false);
  };

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setError('');
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    // 1. Validation Checks
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      setError('Please enter a valid direct contact number.');
      return;
    }

    if (!pincode.trim()) {
      setError(`Please enter a valid ${selectedCountry.postalCodeLabel}.`);
      return;
    }

    const deviceId = getOrCreateDeviceId();
    setIsSubmitting(true);
    setError('');

    const safetyTimer = setTimeout(() => {
      setIsSubmitting(false);
    }, 4500);

    try {
      // Restriction & Ban Verification
      const restrictionCheck = await ApiService.validateAccountRestriction(cleanPhone, deviceId, initialData.id);
      if (!restrictionCheck.allowed) {
        clearTimeout(safetyTimer);
        setIsSubmitting(false);
        setError(restrictionCheck.message || 'Account registration restricted by security policy.');
        return;
      }

      const updatedUser: AppUser = {
        id: initialData.id || `USR-${cleanPhone}`,
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        role: role,
        pincode: pincode.trim(),
        address: address.trim() || undefined,
        avatar: avatar || PRESET_AVATARS[0].url,
        deviceId: deviceId,
        createdAt: initialData.createdAt || new Date().toISOString(),
        isProfileComplete: true
      };

      // 2. Persist User Object
      await ApiService.setCurrentUser(updatedUser);

      // 3. If Service Provider / Worker: Register WorkerProfile permanently
      if (role === 'worker') {
        const workerBio = bio.trim() || `Verified ${category} specialist serving ${address.trim() || pincode.trim()} with ${experienceYears} years of expertise. Direct free calling available.`;
        await ApiService.registerWorker({
          userId: updatedUser.id,
          name: updatedUser.name,
          phone: updatedUser.phone,
          category: category,
          experienceYears: Number(experienceYears) || 1,
          hourlyRate: 0,
          fixedPrice: 0,
          pincode: updatedUser.pincode || '110001',
          address: updatedUser.address || `${selectedCountry.name} Zone`,
          serviceAreaRange: 'citywide',
          bio: workerBio,
          isAvailable: true,
          isEmergencyReady: true,
          avatar: updatedUser.avatar || PRESET_AVATARS[0].url,
          specialization: specialization.trim() || undefined
        });
      }

      clearTimeout(safetyTimer);
      setIsSubmitting(false);
      setSavedUserData(updatedUser);

      if (role === 'worker') {
        // Show the confirmed success screen
        setIsRegistrationDone(true);
      } else {
        // Customer proceeds directly with zero further forms
        onComplete(updatedUser);
      }
    } catch (err: any) {
      clearTimeout(safetyTimer);
      console.error('Account Creation Handshake Failed:', err);
      setError(err?.message || 'Error: Could not create account, please try again');
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN FOR SPECIALIST / WORKER
  if (isRegistrationDone && savedUserData) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center py-8 px-4 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg bg-slate-950/90 border border-emerald-500/40 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Glowing Verification Checkmark */}
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Done! Your account is ready. Wait for bookings
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              Your verified profile is live on Zupix. Direct calls and booking requests from customers in your area will ring straight to your phone with <strong>0% platform commission</strong>.
            </p>
          </div>

          {/* Specialist Summary Card */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Specialist Name:</span>
              <span className="font-bold text-white text-sm">{savedUserData.name}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Direct Contact:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">+{savedUserData.phone}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Trade & Category:</span>
              <span className="font-bold text-blue-400">{category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Service Area:</span>
              <span className="font-bold text-slate-200 truncate max-w-[220px]">
                {address || pincode} ({pincode})
              </span>
            </div>
          </div>

          <button
            onClick={() => onComplete(savedUserData)}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Enter Pro Dashboard</span>
            <ArrowRight className="w-4 h-4 text-emerald-200" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-y-auto selection:bg-blue-600 selection:text-white py-6 px-4">
      
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="relative z-10 w-full max-w-lg mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LiveAppIcon size="sm" showLiveBadge={false} />
          <div>
            <h2 className="font-extrabold text-lg text-white">Complete Profile</h2>
            <p className="text-xs text-blue-300">Step 2 of 2 • One-time permanent setup</p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
        >
          Change Account
        </button>
      </div>

      {/* Main Profile Setup Card */}
      <div className="relative z-10 w-full max-w-lg mx-auto bg-slate-950/85 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Error notice */}
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-200 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Account Mode Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Choose Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  role === 'customer'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <UserCheck className={`w-5 h-5 mt-0.5 shrink-0 ${role === 'customer' ? 'text-blue-400' : 'text-slate-500'}`} />
                <div>
                  <p className="font-extrabold text-xs text-white">I Need Services</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Find doctors, plumbers & pros</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('worker')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  role === 'worker'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Briefcase className={`w-5 h-5 mt-0.5 shrink-0 ${role === 'worker' ? 'text-blue-400' : 'text-slate-500'}`} />
                <div>
                  <p className="font-extrabold text-xs text-white">I Am a Specialist</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Get direct calls for free</p>
                </div>
              </button>
            </div>
          </div>

          {/* Specialist Trade Selection (if Specialist role selected) */}
          {role === 'worker' && (
            <div className="p-4 bg-slate-900/90 border border-blue-500/30 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider">
                Select Your Trade / Profession <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALIST_TRADES.map((trade) => {
                  const Icon = trade.icon;
                  const isSelected = category === trade.category;
                  return (
                    <button
                      key={trade.category}
                      type="button"
                      onClick={() => setCategory(trade.category)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 text-xs'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs truncate">{trade.title}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Specialization (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. MBBS / Geyser Specialist"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Country Selection */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Country (देश चुनें) <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedCountry.code}
              onChange={(e) => {
                const found = SUPPORTED_COUNTRIES.find(c => c.code === e.target.value);
                if (found) handleCountryChange(found);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.dialCode}) - {c.postalCodeLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Profile Photo Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Profile Photo <span className="text-rose-400">*</span>
            </label>

            <div className="flex items-center gap-4 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md shadow-blue-500/20 shrink-0">
                <img
                  src={avatar}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-xs font-medium text-slate-300 leading-tight">
                  Upload photo or select a verified avatar
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Avatar Presets Gallery */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Or choose verified avatar:</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((p, idx) => {
                  const isSelected = avatar === p.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(p.url)}
                      className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        isSelected ? 'border-emerald-400 scale-105 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/50' : 'border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Full Name & Direct Contact Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Kumar / Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Direct Contact ({selectedCountry.dialCode}) <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-300 shrink-0">
                  {selectedCountry.dialCode}
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Direct Phone Number"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Area Location with Google Maps-Grade Global Search & GPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Service Area Location (Global Search) <span className="text-rose-400">*</span>
              </label>

              {/* GPS "Use My Current Location" button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingGps}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                    <span>Use My Current Location</span>
                  </>
                )}
              </button>
            </div>

            {gpsFeedback && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{gpsFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  {selectedCountry.postalCodeLabel} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-blue-400" />
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder={`e.g. ${selectedCountry.popularLocations[0]?.pincode || 'Postal Code'}`}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div ref={localityContainerRef} className="sm:col-span-2 relative">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  City / Area / Street / Global Region
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onFocus={() => setIsLocalityFocused(true)}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setIsLocalityFocused(true);
                    }}
                    placeholder="Search any city or area worldwide (e.g. Dubai, London, Connaught Place)..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  />
                  {isSearchingGlobal && (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin absolute right-2.5 top-3" />
                  )}
                </div>

                {/* Global Autocomplete Dropdown */}
                {isLocalityFocused && combinedLocations.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-800">
                    {combinedLocations.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{loc.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {loc.city ? `${loc.city}, ` : ''}{loc.state ? `${loc.state}, ` : ''}{loc.country || ''}
                            </div>
                          </div>
                        </div>
                        {loc.pincode && loc.pincode !== '00000' && (
                          <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60 shrink-0 ml-2">
                            {loc.pincode}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Create New Account Submit Button */}
          <div className="pt-3">
            <button
              id="create-account-btn"
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Creating Account & Connecting...</span>
                </div>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  <span className="tracking-wide">
                    {role === 'worker' ? 'Register Specialist Profile' : 'Save Profile & Enter'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-cyan-200" />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Saves verified credentials and launches your live dashboard
            </p>
          </div>

        </form>

      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-2 text-slate-500 text-[11px]">
        Zupix Global • 100% Free & Transparent Platform
      </div>

    </div>
  );
};
