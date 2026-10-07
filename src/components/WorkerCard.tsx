import React from 'react';
import { 
  Star, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  Award,
  Sparkles,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import type { WorkerProfile } from '../types';

interface WorkerCardProps {
  worker: WorkerProfile;
  onBook: (worker: WorkerProfile) => void;
  onDirectCall?: (worker: WorkerProfile) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onBook, onDirectCall }) => {
  const handleCallClick = () => {
    if (onDirectCall) {
      onDirectCall(worker);
    } else {
      onBook(worker);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      
      <div>
        {/* Top Info */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <img
              src={worker.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
              alt={worker.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:scale-105 transition-transform"
            />
            {worker.isEmergencyReady ? (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ring-2 ring-white" title="24x7 Emergency Ready">
                ⚡
              </span>
            ) : (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ring-2 ring-white" title="Face Verified">
                ✓
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                {worker.name}
              </h3>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-md">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            </div>

            <p className="text-xs font-semibold text-blue-600 mt-0.5 truncate">
              {worker.category}
            </p>

            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{worker.rating || 5.0}</span>
                <span className="text-slate-400 font-normal">({worker.reviewCount || 0})</span>
              </div>
              <span>•</span>
              <span>{worker.experienceYears || 1}+ yrs exp</span>
            </div>

            {/* Service Area Range Badge */}
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              {worker.serviceAreaRange === 'citywide' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-md">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                  City-Wide Service
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold rounded-md">
                  <MapPin className="w-2.5 h-2.5 text-slate-500" />
                  Local Area (~5km)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {worker.bio && (
          <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {worker.bio}
          </p>
        )}

        {/* Location & Pincode */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">Area: <strong className="text-slate-800">{worker.pincode}</strong> ({worker.address || 'Servicing Nearby'})</span>
        </div>
      </div>

      {/* Free Direct Phone Agreement & Prominent Direct Call Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-emerald-600 font-bold block">100% Free Call</span>
          <span className="text-xs font-black text-slate-800">
            Phone Agreement
          </span>
        </div>

        {/* Large Prominent Direct Call Button */}
        <button
          onClick={handleCallClick}
          className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Phone className="w-4 h-4 animate-pulse" />
          <span>Direct Call</span>
        </button>
      </div>

    </div>
  );
};
