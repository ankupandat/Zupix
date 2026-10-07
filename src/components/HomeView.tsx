import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Stethoscope, 
  Wrench, 
  Zap, 
  Wind, 
  Scissors, 
  Hammer, 
  SprayCan, 
  Paintbrush, 
  ShieldCheck, 
  PhoneCall, 
  PlusCircle, 
  Briefcase, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  Flame, 
  CheckCircle2, 
  Navigation,
  Crosshair,
  Loader2,
  X,
  Compass,
  Globe,
  Car
} from 'lucide-react';
import type { WorkerProfile, ServiceCategory } from '../types';
import { WorkerCard } from './WorkerCard';
import { t, LanguageCode } from '../utils/i18n';
import { 
  getSmartSearchSuggestions, 
  detectCurrentLocation, 
  POPULAR_LOCATIONS, 
  searchGlobalPlaces, 
  LocationSuggestion 
} from '../utils/location';

interface HomeViewProps {
  workers: WorkerProfile[];
  onBookWorker: (worker: WorkerProfile) => void;
  onDirectCall?: (worker: WorkerProfile) => void;
  onOpenRegisterWorker: () => void;
  onOpenEmergency: () => void;
  selectedCategory: ServiceCategory | 'All';
  onSelectCategory: (cat: ServiceCategory | 'All') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pincodeFilter: string;
  onPincodeFilterChange: (pincode: string) => void;
  lang?: LanguageCode;
}

const CATEGORIES: { name: ServiceCategory | 'All'; labelKey: string; defaultLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'All', labelKey: 'allServices', defaultLabel: 'All Services', icon: Sparkles },
  { name: 'Doctor / General Physician', labelKey: 'doctors', defaultLabel: 'Doctors', icon: Stethoscope },
  { name: 'Plumbing', labelKey: 'plumbers', defaultLabel: 'Plumbers', icon: Wrench },
  { name: 'Electrical', labelKey: 'electricians', defaultLabel: 'Electricians', icon: Zap },
  { name: 'Mechanic / Vehicle Repair', labelKey: 'mechanic', defaultLabel: 'Mechanic', icon: Car },
  { name: 'AC & Refrigeration', labelKey: 'acRepair', defaultLabel: 'AC Repair', icon: Wind },
  { name: 'Salon & Makeup', labelKey: 'salon', defaultLabel: 'Salon / Beauty', icon: Scissors },
  { name: 'Carpentry', labelKey: 'carpenters', defaultLabel: 'Carpenters', icon: Hammer },
  { name: 'Cleaning & Pest Control', labelKey: 'cleaning', defaultLabel: 'Cleaning', icon: SprayCan },
  { name: 'Home Painting', labelKey: 'painters', defaultLabel: 'Painters', icon: Paintbrush },
];

export const HomeView: React.FC<HomeViewProps> = ({
  workers,
  onBookWorker,
  onDirectCall,
  onOpenRegisterWorker,
  onOpenEmergency,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  pincodeFilter,
  onPincodeFilterChange,
  lang = 'en-GB'
}) => {
  const [isEmergencyFilterActive, setIsEmergencyFilterActive] = useState(false);
  const [isSearchingFocus, setIsSearchingFocus] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Global Geocoding state
  const [globalPlaces, setGlobalPlaces] = useState<LocationSuggestion[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchingFocus(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Places Autocomplete Search with Debounce
  useEffect(() => {
    const query = searchQuery || pincodeFilter;
    if (!query || query.trim().length < 2) {
      setGlobalPlaces([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingGlobal(true);
      try {
        const results = await searchGlobalPlaces(query);
        setGlobalPlaces(results);
      } catch (err) {
        console.warn('Global places lookup failed:', err);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, pincodeFilter]);

  // Instagram-style smart suggestions calculation combined with global results
  const searchSuggestions = getSmartSearchSuggestions(
    searchQuery || pincodeFilter,
    workers.map(w => ({ name: w.name, category: w.category, pincode: w.pincode, rating: w.rating || 5 })),
    globalPlaces
  );

  // GPS Geolocation Handler
  const handleUseCurrentLocation = async () => {
    setIsDetectingGps(true);
    setGpsFeedback(null);

    const result = await detectCurrentLocation();
    setIsDetectingGps(false);

    if (result.success && result.pincode) {
      onPincodeFilterChange(result.pincode);
      if (result.area) {
        onSearchChange(result.area);
      }
      setGpsFeedback({
        message: `📍 ${t('locationDetected', lang)}: ${result.area || result.city} (${result.pincode})`,
        type: 'success'
      });
      setIsSearchingFocus(false);
      setTimeout(() => setGpsFeedback(null), 4500);
    } else {
      setGpsFeedback({
        message: result.error || 'Could not detect location. Please enter pincode.',
        type: 'error'
      });
      setTimeout(() => setGpsFeedback(null), 4500);
    }
  };

  // Filter workers based on search query, area pincode, and emergency toggle
  const displayWorkers = workers.filter((w) => {
    if (isEmergencyFilterActive && !w.isEmergencyReady) {
      return false;
    }
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchSearch = (
        w.name.toLowerCase().includes(query) ||
        w.category.toLowerCase().includes(query) ||
        w.bio?.toLowerCase().includes(query) ||
        w.pincode.includes(query)
      );
      if (!matchSearch) return false;
    }

    if (pincodeFilter && pincodeFilter.trim().length >= 3) {
      const pin = pincodeFilter.trim();
      const matchExact = w.pincode.startsWith(pin);
      // If worker has City-Wide service, allow them to show for the region
      if (!matchExact && w.serviceAreaRange !== 'citywide') {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-7">
      
      {/* 1. Hero Banner with Smart Instagram-Style Area Search & GPS */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-semibold text-blue-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zupix 100% Background Verified Local Services</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t('heroTitle', lang)}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            {t('heroSubtitle', lang)}
          </p>

          {/* Area-Based Search with GPS and Instagram-Style Auto-Complete */}
          <div ref={searchContainerRef} className="relative pt-2 space-y-2 max-w-xl">
            
            {/* GPS Notification Pill if triggered */}
            {gpsFeedback && (
              <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-md transition-all ${
                gpsFeedback.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
              }`}>
                <span>{gpsFeedback.message}</span>
                <button onClick={() => setGpsFeedback(null)} className="p-0.5 hover:opacity-75">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Main Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchingFocus(true)}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setIsSearchingFocus(true);
                  }}
                  placeholder={t('searchPlaceholder', lang)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Area Pincode Input */}
              <div className="relative w-full sm:w-44">
                <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-blue-600" />
                <input
                  type="text"
                  value={pincodeFilter}
                  onFocus={() => setIsSearchingFocus(true)}
                  onChange={(e) => {
                    onPincodeFilterChange(e.target.value.replace(/\D/g, ''));
                    setIsSearchingFocus(true);
                  }}
                  placeholder="Pincode"
                  maxLength={6}
                  className="w-full pl-8 pr-3 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
                />
              </div>

              {/* GPS "Use My Current Location" Button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingGps}
                title={t('useCurrentLocation', lang)}
                className="px-3.5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75"
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span className="hidden sm:inline font-bold">Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4 text-slate-950 animate-pulse" />
                    <span className="font-bold text-xs">GPS</span>
                  </>
                )}
              </button>
            </div>

            {/* INSTAGRAM-STYLE AUTO-COMPLETE DROPDOWN POPOVER */}
            {isSearchingFocus && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                
                {/* 1. GPS Quick Action Row */}
                <div className="p-2.5 bg-blue-50/70 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isDetectingGps}
                    className="w-full flex items-center gap-2.5 px-3 py-2 bg-white hover:bg-blue-100/70 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 transition-all text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      {isDetectingGps ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-blue-900 leading-tight">
                        {isDetectingGps ? t('detectingLocation', lang) : t('useCurrentLocation', lang)}
                      </div>
                      <div className="text-[10px] text-blue-600 font-medium truncate">
                        Auto-detect your pincode & nearby verified doctors / pros
                      </div>
                    </div>
                  </button>
                </div>

                {/* 2. Suggested Locations / Global Places & Areas */}
                {searchSuggestions.locations.length > 0 && (
                  <div className="p-2">
                    <div className="px-2.5 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-500" />
                        <span>Global & Local Places</span>
                      </div>
                      {isSearchingGlobal && (
                        <span className="flex items-center gap-1 text-[10px] text-blue-500 font-bold lowercase">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>searching...</span>
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {searchSuggestions.locations.map((loc) => {
                        const isGlobal = loc.type === 'global_place' || Boolean(loc.country);
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => {
                              if (loc.pincode && loc.pincode !== '00000') {
                                onPincodeFilterChange(loc.pincode);
                              }
                              onSearchChange(loc.name);
                              setIsSearchingFocus(false);
                            }}
                            className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center justify-between text-left transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isGlobal 
                                  ? 'bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white' 
                                  : 'bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600'
                              }`}>
                                {isGlobal ? <Globe className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {loc.name}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {loc.city ? `${loc.city}, ` : ''}{loc.state ? `${loc.state}, ` : ''}{loc.country || ''} {loc.landmark ? `• ${loc.landmark}` : ''}
                                </div>
                              </div>
                            </div>
                            {loc.pincode && loc.pincode !== '00000' && (
                              <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2 py-0.5 rounded-md transition-colors shrink-0 ml-2">
                                {loc.pincode}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Suggested Categories & Services */}
                {searchSuggestions.services.length > 0 && (
                  <div className="p-2 bg-slate-50/50">
                    <div className="px-2.5 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{t('suggestedServices', lang)}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                      {searchSuggestions.services.map((srv, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            onSelectCategory(srv.category as ServiceCategory);
                            onSearchChange(srv.title);
                            setIsSearchingFocus(false);
                          }}
                          className="px-2.5 py-2 rounded-xl hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200 flex items-center gap-2 text-left transition-all group"
                        >
                          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <Sparkles className="w-3 h-3" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                              {srv.title}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate">Verified Specialists</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Matching Registered Specialists */}
                {searchSuggestions.specialists.length > 0 && (
                  <div className="p-2">
                    <div className="px-2.5 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>{t('verifiedSpecialists', lang)}</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchSuggestions.specialists.map((worker, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            onSearchChange(worker.name);
                            setIsSearchingFocus(false);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {worker.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 truncate">{worker.name}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5 font-medium">({worker.category})</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">Pincode: {worker.pincode}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Quick Area Filter Shortcuts */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-slate-300">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-cyan-400" /> Quick Hubs:
            </span>
            {POPULAR_LOCATIONS.slice(0, 6).map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => {
                  onPincodeFilterChange(area.pincode);
                  onSearchChange(area.name);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  pincodeFilter === area.pincode
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15'
                }`}
              >
                {area.name} ({area.pincode})
              </button>
            ))}
          </div>
        </div>

        {/* Decorative Neon Ring */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Categories Horizontal Scroll / Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">{t('allServices', lang)}</h2>
          <span className="text-xs text-slate-500 font-medium">9 Specialist Categories</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            const label = t(cat.labelKey, lang) || cat.defaultLabel;
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-102'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-blue-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold leading-tight line-clamp-1">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Real Specialists Grid or Strict Empty State */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {selectedCategory === 'All' ? 'Verified Specialists Near You' : `${selectedCategory} Experts`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {displayWorkers.length} registered service providers in area {pincodeFilter || 'All Areas'}
            </p>
          </div>

          <button
            onClick={onOpenRegisterWorker}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('joinAsPro', lang)}</span>
          </button>
        </div>

        {/* STRICT GUARDRAIL: When zero profiles exist, display real empty state without injecting dummy data */}
        {displayWorkers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Briefcase className="w-8 h-8" />
            </div>
            
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                {t('noWorkersFound', lang)}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We are actively onboarding verified plumbers, electricians, doctors, and beauty specialists. Be the first professional to list your services in pincode {pincodeFilter || 'your locality'}!
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenRegisterWorker}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('registerNow', lang)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onBook={onBookWorker}
                onDirectCall={onDirectCall}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
