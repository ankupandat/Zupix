import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  Heart, 
  Globe, 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  ExternalLink,
  Code2
} from 'lucide-react';
import { 
  SUPPORTED_COUNTRIES, 
  CountryOption, 
  getSavedCountry, 
  setSavedCountryCode 
} from '../utils/countries';
import { t, LanguageCode } from '../utils/i18n';

interface FooterProps {
  lang?: LanguageCode;
  onCountryChange?: (country: CountryOption) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang = 'en-GB', onCountryChange }) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(getSavedCountry());
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const handleSelectCountry = (country: CountryOption) => {
    setSavedCountryCode(country.code);
    setSelectedCountry(country);
    setIsCountryDropdownOpen(false);
    if (onCountryChange) {
      onCountryChange(country);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-10 pb-24 sm:pb-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Top Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-800/80">
          
          {/* Card 1: 100% Free & Zero Fees */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>100% Free Platform • 0% Commission</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zupix is completely free for all customers and local service specialists. No booking charges, no deposits, and no platform fees ever.
            </p>
          </div>

          {/* Card 2: Direct Call & Location Guidance */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2.5 text-blue-400 font-bold text-sm">
              <PhoneCall className="w-5 h-5 text-blue-400" />
              <span>Direct Call & Location Confirmation</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Confirm charges and exact location directly over a phone call with the provider. If reached an incorrect spot, use direct calls to guide each other to the right door.
            </p>
          </div>

          {/* Card 3: Global Country Support */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-sm">
                <Globe className="w-5 h-5 text-indigo-400" />
                <span>Global Location Filter</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {selectedCountry.name} ({selectedCountry.dialCode})
              </span>
            </div>
            
            {/* Country Selector Button */}
            <div className="relative pt-1">
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-xs font-bold text-white border border-slate-700 flex items-center justify-between transition-colors"
              >
                <span>🌍 {selectedCountry.name} ({selectedCountry.code})</span>
                <span className="text-xs text-slate-400">Change Country</span>
              </button>

              {isCountryDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-0 right-0 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Select Your Country
                  </div>
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        selectedCountry.code === c.code
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="font-mono text-[11px] opacity-75">{c.dialCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Safety & Protocol Notice */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-400">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-200 uppercase tracking-wide text-[11px]">
              Doorstep Verification & Safety Protocol
            </p>
            <p className="leading-relaxed">
              Always match the arriving service specialist's face with their profile photo inside the Zupix application before permitting entry. Direct calls connect you directly to independent professionals.
            </p>
          </div>
        </div>

        {/* Bottom Branding & Developer Credit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-sm tracking-tight">ZUPIX</span>
            <span>•</span>
            <span>Verified Local Doctors & Specialists</span>
          </div>

          {/* OFFICIAL DEVELOPER CREDIT */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/40 rounded-xl text-xs text-slate-200 shadow-xs">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Developed by <strong className="text-white font-extrabold tracking-wide">Anku Pandit</strong></span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            © {new Date().getFullYear()} Zupix Network. 100% Free Service Platform.
          </div>

        </div>

      </div>
    </footer>
  );
};
