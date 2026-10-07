import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  Bell, 
  MapPin, 
  User, 
  Sparkles, 
  Briefcase, 
  Search, 
  PhoneCall, 
  Menu, 
  ShieldCheck, 
  Zap,
  Globe
} from 'lucide-react';
import type { User as AppUser, AppNotification } from '../types';
import { LiveAppIcon } from './LiveAppIcon';
import { SUPPORTED_LANGUAGES, LanguageCode, setSavedLanguage } from '../utils/i18n';

interface HeaderProps {
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
  onOpenEmergency: () => void;
  onOpenRegisterWorker: () => void;
  unreadNotifsCount: number;
  currentPincode: string;
  onPincodeChange: (pincode: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  lang?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onOpenNotifications,
  onOpenAdmin,
  onOpenEmergency,
  onOpenRegisterWorker,
  unreadNotifsCount,
  currentPincode,
  onPincodeChange,
  activeTab,
  onTabChange,
  lang = 'en-GB',
  onLanguageChange
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hidden admin trigger: 3 rapid clicks or 1.5s long press on logo
  const handleLogoClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        onOpenAdmin();
        return 0;
      }
      return next;
    });

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1200);
  };

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      onOpenAdmin();
    }, 1500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo with Hidden Admin Long Press & Live Animated Icon */}
          <div 
            onClick={handleLogoClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            className="flex items-center gap-3 cursor-pointer select-none group"
            title="Zupix - Triple-click or Long-press for Admin Console"
          >
            <div className="relative group-hover:scale-105 transition-transform">
              <LiveAppIcon size="sm" showLiveBadge={false} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800 bg-clip-text text-transparent block leading-tight">
                ZUPIX
              </span>
              <p className="text-[10px] text-slate-500 font-semibold leading-none mt-0.5">
                Verified Pros & Doctors
              </p>
            </div>
          </div>

          {/* Location / Pincode Quick Filter */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 rounded-xl border border-slate-200 text-xs">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-500 font-medium">Location Pincode:</span>
            <input
              type="text"
              value={currentPincode}
              onChange={(e) => onPincodeChange(e.target.value)}
              placeholder="e.g. 110001"
              maxLength={6}
              className="w-20 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold">{currentLangObj.nativeName}</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fade-in space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Select Language
                  </p>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setSavedLanguage(l.code);
                        if (onLanguageChange) onLanguageChange(l.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        lang === l.code
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-semibold">{l.nativeName}</span>
                      <span className="text-[11px] opacity-80 font-normal">{l.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Join as Pro Partner */}
            {currentUser?.role !== 'worker' && (
              <button
                onClick={onOpenRegisterWorker}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Join as Pro Partner</span>
              </button>
            )}

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Notifications & Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* User / Sign In Button */}
            {currentUser ? (
              <button
                onClick={() => onTabChange('profile')}
                className="flex items-center gap-2 p-1.5 pr-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              >
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-7 h-7 rounded-lg object-cover border border-blue-500/40 shrink-0" 
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[90px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-blue-600 font-semibold capitalize leading-none">
                    {currentUser.role}
                  </p>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
              >
                Sign In
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

