import React from 'react';
import { Zap, ShieldCheck, Sparkles, Activity } from 'lucide-react';

interface LiveAppIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showLiveBadge?: boolean;
  className?: string;
  interactive?: boolean;
}

export const LiveAppIcon: React.FC<LiveAppIconProps> = ({
  size = 'md',
  showLiveBadge = true,
  className = '',
  interactive = false
}) => {
  // Dimension and scale mappings
  const sizeConfig = {
    sm: {
      container: 'w-9 h-9',
      core: 'w-9 h-9 rounded-xl',
      icon: 'w-4 h-4',
      spark: 'w-2.5 h-2.5',
      badgeText: 'text-[8px] px-1 py-0.2',
      dot: 'w-1.5 h-1.5',
      radar: 'w-12 h-12 -inset-1.5'
    },
    md: {
      container: 'w-11 h-11',
      core: 'w-11 h-11 rounded-2xl',
      icon: 'w-5 h-5',
      spark: 'w-3 h-3',
      badgeText: 'text-[9px] px-1.5 py-0.5',
      dot: 'w-1.5 h-1.5',
      radar: 'w-16 h-16 -inset-2.5'
    },
    lg: {
      container: 'w-16 h-16',
      core: 'w-16 h-16 rounded-3xl',
      icon: 'w-8 h-8',
      spark: 'w-4 h-4',
      badgeText: 'text-[10px] px-2 py-0.5',
      dot: 'w-2 h-2',
      radar: 'w-24 h-24 -inset-4'
    },
    xl: {
      container: 'w-24 h-24',
      core: 'w-24 h-24 rounded-3xl',
      icon: 'w-12 h-12',
      spark: 'w-6 h-6',
      badgeText: 'text-xs px-2.5 py-1',
      dot: 'w-2.5 h-2.5',
      radar: 'w-36 h-36 -inset-6'
    },
    hero: {
      container: 'w-28 h-28 sm:w-32 sm:h-32',
      core: 'w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] sm:rounded-[32px]',
      icon: 'w-14 h-14 sm:w-16 sm:h-16',
      spark: 'w-7 h-7 sm:w-8 sm:h-8',
      badgeText: 'text-xs font-black px-3 py-1',
      dot: 'w-2.5 h-2.5',
      radar: 'w-44 h-44 sm:w-52 sm:h-52 -inset-8 sm:-inset-10'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${config.container} ${className}`}>
      
      {/* 1. Radar Pulse Ripple Rings (Constant Smooth Motion) */}
      <div 
        className={`absolute ${config.radar} rounded-full border border-cyan-400/40 bg-cyan-400/10 pointer-events-none animate-radar-wave-1`}
        aria-hidden="true"
      />
      <div 
        className={`absolute ${config.radar} rounded-full border border-blue-500/30 bg-blue-500/5 pointer-events-none animate-radar-wave-2`}
        aria-hidden="true"
      />

      {/* 2. Rotating Orbital Particles Ring */}
      <div className="absolute inset-[-4px] pointer-events-none animate-orbit-spin">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400 opacity-60 shadow-[0_0_6px_#60a5fa]" />
      </div>

      <div className="absolute inset-[-6px] pointer-events-none animate-orbit-spin-reverse opacity-70">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-indigo-300 shadow-[0_0_6px_#a5b4fc]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
      </div>

      {/* 3. Main Glassmorphic Animated Icon Core */}
      <div 
        className={`relative z-10 ${config.core} bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-blue-600/30 animate-icon-float flex items-center justify-center overflow-hidden border border-white/30 backdrop-blur-md transition-transform duration-300 ${
          interactive ? 'hover:scale-110 active:scale-95' : ''
        }`}
      >
        {/* Inner Glossy Glass Specular Reflection */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-black/20 pointer-events-none" />
        
        {/* Radial Center Core Energy */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.4),transparent_60%)] pointer-events-none" />

        {/* Central Animated Lightning & Verified Core */}
        <div className="relative z-10 flex items-center justify-center text-white animate-bolt-spark">
          <Zap className={`${config.icon} fill-white stroke-[2.2] text-cyan-200 drop-shadow-[0_2px_10px_rgba(6,182,212,0.8)]`} />
          
          {/* Subtle Sparkle Particle Accent */}
          <Sparkles className={`absolute -top-1 -right-1 text-yellow-300 ${config.spark} animate-pulse drop-shadow-[0_0_6px_#fde047]`} />
        </div>

        {/* Diagonal Light Sweep Sheen */}
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/25 to-transparent rotate-45 pointer-events-none animate-pulse opacity-60" />
      </div>

      {/* 4. Live Status Pill Badge */}
      {showLiveBadge && (
        <div className={`absolute -bottom-2 z-20 bg-slate-900/90 text-white rounded-full border border-emerald-400/50 shadow-md shadow-emerald-500/20 flex items-center gap-1 font-bold uppercase tracking-wider backdrop-blur-md ${config.badgeText}`}>
          <span className={`rounded-full bg-emerald-400 animate-ping opacity-80 ${config.dot}`} />
          <span className={`rounded-full bg-emerald-400 absolute ${config.dot}`} />
          <span className="text-emerald-300 ml-2 font-mono">LIVE</span>
        </div>
      )}

    </div>
  );
};
