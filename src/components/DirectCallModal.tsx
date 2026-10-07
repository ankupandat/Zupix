import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  ShieldCheck, 
  AlertTriangle, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ShieldAlert,
  Flame
} from 'lucide-react';
import type { WorkerProfile, User as AppUser } from '../types';
import { t, LanguageCode } from '../utils/i18n';

interface DirectCallModalProps {
  isOpen: boolean;
  worker: WorkerProfile | null;
  currentUser: AppUser | null;
  onClose: () => void;
  lang?: LanguageCode;
  isEmergencyActive?: boolean;
}

export const DirectCallModal: React.FC<DirectCallModalProps> = ({
  isOpen,
  worker,
  currentUser,
  onClose,
  lang = 'en-GB',
  isEmergencyActive = false
}) => {
  const [faceConfirmed, setFaceConfirmed] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);

  if (!isOpen || !worker) return null;

  const handleCall = () => {
    setCallInitiated(true);
    // Trigger direct native phone call protocol
    window.location.href = `tel:${worker.phone}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {t('directCall', lang)} • {worker.category}
              </h3>
              <p className="text-[11px] text-blue-200">
                Direct verified phone connection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          
          {/* Professional Profile Spotlight */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={worker.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
                alt={worker.name}
                className="w-18 h-18 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 ring-2 ring-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-black text-slate-900 text-base leading-tight truncate">
                  {worker.name}
                </h4>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md">
                  Verified Face ID
                </span>
              </div>

              <p className="text-xs font-bold text-blue-600 truncate">
                {worker.category}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1 font-bold text-slate-900">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{worker.rating || 5.0}</span>
                  <span className="text-slate-400 font-normal">({worker.reviewCount || 0})</span>
                </div>
                <span>•</span>
                <span>{worker.experienceYears || 2}+ yrs exp</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Pincode: <strong>{worker.pincode}</strong> ({worker.address || 'Servicing Area'})</span>
              </div>
            </div>
          </div>

          {/* MANDATORY FRONT-FACING SAFETY DISCLAIMER */}
          <div className="p-3.5 bg-amber-50 border-2 border-amber-300/80 rounded-2xl flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-black text-amber-950 uppercase tracking-wide">
                {t('safetyWarning', lang)}
              </p>
              <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                "{t('frontDisclaimer', lang)}"
              </p>
            </div>
          </div>

          {/* DEDICATED CALL & LOCATION CONFIRMATION INSTRUCTION */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{t('confirmChargesTitle', lang)}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {t('confirmChargesDesc', lang)}
            </p>

            {/* Wrong location guidance reminder */}
            <div className="pt-2 border-t border-blue-200/80 flex items-start gap-2 text-[11px] text-blue-800">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>{t('locationGuidanceDesc', lang)}</span>
            </div>
          </div>

          {/* Zero Platform Fee Guarantee Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Free Direct Calling • 0% Platform Fee</span>
            </div>
            {worker.isEmergencyReady && (
              <span className="px-2 py-0.5 bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-bold rounded-lg flex items-center gap-1">
                ⚡ 24x7 Ready
              </span>
            )}
          </div>

          {/* Large Prominent Direct Call Button */}
          <div className="pt-2 space-y-2">
            <a
              href={`tel:${worker.phone}`}
              onClick={handleCall}
              id="direct-call-now-btn"
              className="w-full py-4 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center animate-bounce">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block leading-tight text-sm font-extrabold">{t('callNow', lang)} ({worker.phone})</span>
                <span className="block text-[11px] font-normal text-emerald-100">Tap to dial directly from your device</span>
              </div>
            </a>

            {callInitiated && (
              <p className="text-xs text-center text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 animate-fade-in">
                Connecting call to {worker.name}... Please verify their identity face upon arrival.
              </p>
            )}
          </div>

          <p className="text-[11px] text-center text-slate-400">
            Direct connection is 100% free. Service charges are negotiated directly between you and the specialist over the call.
          </p>

        </div>

      </div>
    </div>
  );
};
