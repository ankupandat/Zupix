import React from 'react';
import { 
  Home, 
  Receipt, 
  Briefcase, 
  User, 
  Sparkles,
  PlusCircle
} from 'lucide-react';
import type { User as AppUser } from '../types';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUser: AppUser | null;
  unreadNotifsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  unreadNotifsCount
}) => {
  const isWorker = currentUser?.role === 'worker';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg sm:hidden">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        
        {isWorker ? (
          <>
            {/* 1. Dedicated Provider Dashboard */}
            <button
              onClick={() => onTabChange('worker_dashboard')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeTab === 'worker_dashboard' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Dashboard</span>
            </button>

            {/* 2. Customer Search View (to see how customers see listings) */}
            <button
              onClick={() => onTabChange('home')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeTab === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Search</span>
            </button>

            {/* 3. Jobs History */}
            <button
              onClick={() => onTabChange('bookings')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeTab === 'bookings' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Jobs</span>
            </button>

            {/* 4. Profile */}
            <button
              onClick={() => onTabChange('profile')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeTab === 'profile' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Profile</span>
            </button>
          </>
        ) : (
          <>
            {/* Customer Mode - Strict Separation without Partner Clutter */}
            {/* Explore / Home */}
            <button
              onClick={() => onTabChange('home')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeTab === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Explore</span>
            </button>

            {/* My Bookings History */}
            <button
              onClick={() => onTabChange('bookings')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeTab === 'bookings' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Bookings</span>
            </button>

            {/* Profile */}
            <button
              onClick={() => onTabChange('profile')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeTab === 'profile' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Profile</span>
            </button>
          </>
        )}

      </div>
    </nav>
  );
};
