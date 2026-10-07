import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  PhoneCall, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Wrench, 
  Stethoscope, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Briefcase,
  User,
  HeartHandshake,
  Globe,
  MapPin,
  Code2
} from 'lucide-react';
import { LiveAppIcon } from './LiveAppIcon';
import { LanguageCode, t, SUPPORTED_LANGUAGES, setSavedLanguage } from '../utils/i18n';
import { SUPPORTED_COUNTRIES, CountryOption, getSavedCountry, setSavedCountryCode } from '../utils/countries';

interface OnboardingCarouselProps {
  onSelectLogin: () => void;
  onSelectSignUp: (role?: 'customer' | 'worker') => void;
  lang?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}

interface SlideData {
  id: number;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  gradient: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    badge: '100% Free Platform',
    title: 'Instant Access to Verified Local',
    highlight: 'Doctors & Specialists',
    description: 'Find trusted electricians, plumbers, physicians, salon experts, and home technicians right in your area with zero platform fees.',
    icon: Stethoscope,
    features: ['Direct Phone Contact', '100% Free for Everyone', 'Instant Area Matching'],
    gradient: 'from-blue-600 to-indigo-700'
  },
  {
    id: 2,
    badge: 'Direct Phone & Location Guidance',
    title: 'Direct Call & Real-Time',
    highlight: 'Location & Fee Confirmation',
    description: 'Confirm charges and exact location directly over a phone call with the provider. If reached an incorrect location, use direct phone calls to guide each other to the correct spot.',
    icon: PhoneCall,
    features: ['Confirm Rates on Phone', 'Live Voice Navigation Guidance', 'Zero Platform Charges'],
    gradient: 'from-indigo-600 to-violet-700'
  },
  {
    id: 3,
    badge: 'Empowering Local Experts',
    title: 'Grow Your Service Business as a',
    highlight: 'Verified Pro Partner',
    description: 'Join thousands of electricians, doctors, and craftsmen receiving direct customer calls in your area every day with 0% commission.',
    icon: Briefcase,
    features: ['100% Free Pro Listings', 'Keep 100% of Your Earnings', 'Full Schedule Control'],
    gradient: 'from-teal-600 to-emerald-700'
  },
  {
    id: 4,
    badge: 'Safe & Secure',
    title: 'Fast, Verified & Safe for',
    highlight: 'Every Household',
    description: 'Secure OTP-verified accounts with one-account-per-device integrity, genuine customer reviews, and verified specialist identity.',
    icon: ShieldCheck,
    features: ['Real-Time Phone OTP', 'Identity Verified Profiles', 'One-Tap Quick Support'],
    gradient: 'from-blue-700 via-indigo-800 to-slate-900'
  }
];

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  onSelectLogin,
  onSelectSignUp,
  lang = 'en-GB',
  onLanguageChange
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAuthChoice, setShowAuthChoice] = useState(false);
  const [showRoleChoice, setShowRoleChoice] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(getSavedCountry());

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = SUPPORTED_COUNTRIES.find(c => c.code === e.target.value);
    if (found) {
      setSelectedCountry(found);
      setSavedCountryCode(found.code);
    }
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as LanguageCode;
    setSavedLanguage(newLang);
    if (onLanguageChange) onLanguageChange(newLang);
  };

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setShowAuthChoice(true);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleGetStarted = () => {
    setShowAuthChoice(true);
  };

  const handleSignUpClick = () => {
    setShowRoleChoice(true);
  };

  const handleRoleSelected = (role: 'customer' | 'worker') => {
    onSelectSignUp(role);
  };

  const activeSlide = SLIDES[currentSlide];
  const IconComponent = activeSlide.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-white relative overflow-hidden">
      
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar with Country & Language Selector */}
      <div className="relative z-10 p-4 sm:p-6 flex flex-wrap items-center justify-between max-w-xl w-full mx-auto gap-3">
        <div className="flex items-center gap-2.5">
          <LiveAppIcon size="sm" showLiveBadge={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-200 bg-clip-text text-transparent">
                ZUPIX
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] rounded-full">
                100% FREE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Verified Pros & Doctors
            </p>
          </div>
        </div>

        {/* Country & Language Quick Selectors */}
        <div className="flex items-center gap-2">
          {/* Country selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedCountry.code}
              onChange={handleCountryChange}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.code} ({c.dialCode})
                </option>
              ))}
            </select>
          </div>

          {/* Language selector */}
          <select
            value={lang}
            onChange={handleLangChange}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                {l.nativeName}
              </option>
            ))}
          </select>

          {/* Skip button directly to Auth */}
          {!showAuthChoice && (
            <button
              type="button"
              onClick={() => setShowAuthChoice(true)}
              className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-xl w-full mx-auto px-6 py-2">
        
        {/* VIEW 1: Role Selection Screen */}
        {showRoleChoice ? (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-full">
                Step 1 of 2 • Account Type
              </span>
              <h2 className="text-2xl font-black text-white">
                How will you use Zupix?
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select your account type to personalize your experience. Both customer and service provider accounts are 100% free.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Option */}
              <button
                type="button"
                onClick={() => handleRoleSelected('customer')}
                className="p-5 rounded-2xl border-2 border-slate-700/80 bg-slate-800/60 hover:bg-blue-600/15 hover:border-blue-500 text-left transition-all group flex flex-col justify-between gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-white text-base">I am a Customer</h3>
                    <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Looking to hire verified doctors, electricians, plumbers, and home specialists.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free Forever
                </div>
              </button>

              {/* Service Professional Option */}
              <button
                type="button"
                onClick={() => handleRoleSelected('worker')}
                className="p-5 rounded-2xl border-2 border-slate-700/80 bg-slate-800/60 hover:bg-emerald-600/15 hover:border-emerald-500 text-left transition-all group flex flex-col justify-between gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-white text-base">Service Professional</h3>
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Doctor, electrician, plumber, beautician, or technician wanting direct customer calls.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 0% Commission • Keep 100%
                </div>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowRoleChoice(false)}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                ← Back to Login / Sign Up
              </button>
            </div>
          </div>
        ) : showAuthChoice ? (
          /* VIEW 2: Login vs Sign Up Selection */
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                <HeartHandshake className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Welcome to Zupix
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your direct, commission-free platform for verified local services and consultations in <strong className="text-white">{selectedCountry.name}</strong>.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Sign Up Button (Starts Role Query) */}
              <button
                type="button"
                onClick={handleSignUpClick}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Create New Account (Sign Up)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Login Button (Directs to Phone OTP / Existing User Auth) */}
              <button
                type="button"
                onClick={onSelectLogin}
                className="w-full py-3.5 px-6 bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold rounded-2xl text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>I already have an account (Login)</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowAuthChoice(false)}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                ← Back to Intro Slides
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 3: 4-Slide Interactive Carousel */
          <div className="space-y-6">
            
            {/* Visual Icon / Illustration Card */}
            <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800 p-7 sm:p-8 text-center space-y-4 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[11px] font-bold text-blue-200">
                  {activeSlide.badge}
                </span>
              </div>

              {/* Central Glowing Icon */}
              <div className="relative py-3">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br ${activeSlide.gradient} flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 ring-4 ring-white/10 animate-in fade-in zoom-in duration-300`}>
                  <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>

              {/* Slide Content */}
              <div className="space-y-2">
                <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                  {activeSlide.title}{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    {activeSlide.highlight}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  {activeSlide.description}
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                {activeSlide.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-xl text-[11px] font-bold text-slate-300 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation Dots & Control Bar */}
            <div className="flex items-center justify-between gap-4 pt-2">
              
              {/* Prev Button */}
              <button
                type="button"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`p-3 rounded-xl border border-slate-800 transition-all ${
                  currentSlide === 0 
                    ? 'opacity-30 cursor-not-allowed bg-slate-900 text-slate-600' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white hover:scale-105'
                }`}
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Carousel Dots */}
              <div className="flex items-center gap-2">
                {SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`transition-all rounded-full ${
                      currentSlide === idx
                        ? 'w-8 h-2.5 bg-blue-500'
                        : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next / Get Started Action Button */}
              {currentSlide === SLIDES.length - 1 ? (
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextSlide}
                  className="p-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs border border-blue-500 shadow-md shadow-blue-600/20 flex items-center justify-center hover:scale-105 transition-all"
                  title="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Footer Branding with Developer Credit */}
      <div className="relative z-10 p-4 text-center text-slate-400 text-xs max-w-xl mx-auto w-full space-y-1">
        <div className="font-extrabold text-slate-200">
          Developed by Anku Pandit
        </div>
        <div className="text-[11px] text-slate-500">
          Zupix • 100% Free Direct Phone Call & Service Network
        </div>
      </div>

    </div>
  );
};
