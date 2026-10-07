import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Briefcase, 
  LogOut, 
  Lock, 
  Receipt, 
  AlertTriangle, 
  Heart, 
  Globe, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  HelpCircle, 
  PhoneCall,
  CheckCircle2,
  Code2
} from 'lucide-react';
import type { User as AppUser, WorkerProfile } from '../types';
import { ApiService } from '../api';
import { 
  SUPPORTED_LANGUAGES, 
  LanguageCode, 
  t, 
  setSavedLanguage 
} from '../utils/i18n';
import { 
  SUPPORTED_COUNTRIES, 
  CountryOption, 
  getSavedCountry, 
  setSavedCountryCode 
} from '../utils/countries';

interface ProfileViewProps {
  currentUser: AppUser | null;
  workerProfile: WorkerProfile | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onSwitchRole?: (role: AppUser['role']) => void;
  onOpenRegisterWorker?: () => void;
  onNavigateToBookings: () => void;
  lang?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onCountryChange?: (country: CountryOption) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  workerProfile,
  onLogout,
  onOpenAuth,
  onOpenAdmin,
  onSwitchRole,
  onOpenRegisterWorker,
  onNavigateToBookings,
  lang = 'en-GB',
  onLanguageChange,
  onCountryChange
}) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(getSavedCountry());

  const handleCountrySelect = (c: CountryOption) => {
    setSavedCountryCode(c.code);
    setSelectedCountry(c);
    if (onCountryChange) onCountryChange(c);
  };

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Zupix Profile</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Sign in to view your profile settings, emergency security protocols, and booking history.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {currentUser.avatar ? (
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md shrink-0">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
            {currentUser.name.charAt(0)}
          </div>
        )}

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-black text-slate-900">{currentUser.name}</h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full capitalize">
              {currentUser.role} Account
            </span>
          </div>

          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <Phone className="w-3.5 h-3.5" />
            <span>{currentUser.phone}</span>
          </p>

          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Postal Code: {currentUser.pincode || 'Not Set'}</span>
          </p>
        </div>

        <button
          onClick={onLogout}
          className="p-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('signOut', lang)}</span>
        </button>
      </div>

      {/* Country Selection Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">{t('country', lang)} / Global Region</h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Active: <strong className="text-indigo-600">{selectedCountry.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUPPORTED_COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => handleCountrySelect(c)}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                selectedCountry.code === c.code
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div>
                <div>{c.name}</div>
                <div className={`text-[10px] font-mono ${selectedCountry.code === c.code ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {c.dialCode}
                </div>
              </div>
              {selectedCountry.code === c.code && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">{t('language', lang)} / Language Preferences</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUPPORTED_LANGUAGES.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                setSavedLanguage(item.code);
                if (onLanguageChange) onLanguageChange(item.code);
              }}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                lang === item.code
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div>
                <div>{item.nativeName}</div>
                <div className={`text-[10px] font-normal ${lang === item.code ? 'text-blue-100' : 'text-slate-400'}`}>
                  {item.name}
                </div>
              </div>
              {lang === item.code && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
            </button>
          ))}
        </div>
      </div>


      {/* 3. DETAILED SETTINGS DISCLAIMER & TERMS & CONDITIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          onClick={() => setIsTermsOpen(!isTermsOpen)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Legal Terms, Conditions & Safety Disclaimer
              </h3>
              <p className="text-xs text-slate-500">
                Doorstep verification protocol, platform liability & fee policies
              </p>
            </div>
          </div>
          {isTermsOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {isTermsOpen && (
          <div className="p-5 pt-0 border-t border-slate-100 space-y-4 text-xs text-slate-600 leading-relaxed">
            
            <div className="p-3.5 bg-amber-50 border border-amber-300/80 rounded-xl text-amber-950">
              <p className="font-bold mb-1">MANDATORY USER WARNING:</p>
              <p>"{t('frontDisclaimer', lang)}"</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">1. Facial Verification & Doorstep Identity Protocol</h4>
              <p>
                Every service professional registered on Zupix possesses a verified profile photograph. Customers are strictly mandated to match the arriving technician or doctor's face with their profile image displayed in the Zupix application before permitting entrance into private premises.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">2. Direct Phone Agreement & Location Guidance Policy</h4>
              <p>
                All service fees, charges, and rates are strictly negotiated directly over the phone between the customer and the service provider. Zupix charges ₹0 app fees. If a provider or customer reaches an incorrect location, use direct phone calls to guide each other to the correct spot.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">3. Platform Intermediary & Limitation of Liability</h4>
              <p>
                Zupix operates purely as a digital technology intermediary facilitating direct contact between independent local technicians/doctors and consumers. Zupix does not employ service providers directly and assumes no civil or criminal liability for doorstep safety, personal conduct, property damage, or private negotiations conducted between the parties.
              </p>
            </div>

          </div>
        )}
      </div>

      {/* 100% Free Platform & Developer Credit Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">100% Free Direct Service Network</h3>
              <p className="text-xs text-emerald-300">0% Commission • Zero Platform Fees</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-[10px] rounded-full">
            FREE FOREVER
          </span>
        </div>

        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Direct Calls & Bookings:</span>
            <span className="font-bold text-emerald-300">100% Free (₹0)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Specialist Commission:</span>
            <span className="font-bold text-emerald-300">0% (Keep 100% of income)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Fee Agreement Method:</span>
            <span className="font-bold text-amber-300">Direct Phone Call</span>
          </div>
        </div>

        {/* Developer Official Credit Banner */}
        <div className="p-3 bg-blue-950/70 rounded-xl border border-blue-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Code2 className="w-4 h-4" />
            <span className="text-slate-200">Lead Creator & Software Architect:</span>
          </div>
          <span className="font-extrabold text-white bg-blue-600/40 px-2.5 py-1 rounded-lg border border-blue-400/30">
            Developed by Anku Pandit
          </span>
        </div>
      </div>

      {/* Admin Secret Console Trigger */}
      <div className="pt-2 text-center">
        <button
          onClick={onOpenAdmin}
          className="text-xs text-slate-400 hover:text-slate-700 font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Launch Master Admin Console</span>
        </button>
      </div>

    </div>
  );
};
