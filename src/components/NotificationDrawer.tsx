import React from 'react';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  ArrowRight, 
  Sparkles,
  Inbox
} from 'lucide-react';
import type { AppNotification } from '../types';
import { ApiService } from '../api';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onNotificationClick: (notif: AppNotification) => void;
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'booking_new':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'worker_accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'payment_reminder':
        return <DollarSign className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Live Activity & Alerts</h3>
              <p className="text-[11px] text-slate-400">Click any notification to open booking</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-blue-300 hover:text-white transition-colors"
              >
                Mark read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Inbox className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No new notifications</p>
              <p className="text-[11px] text-slate-400">
                You'll be alerted instantly for new bookings, confirmations & platform updates.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onNotificationClick(notif)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                  notif.isRead 
                    ? 'bg-white border-slate-200 hover:border-slate-300' 
                    : 'bg-blue-50/80 border-blue-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    notif.isRead ? 'bg-slate-100' : 'bg-white shadow-xs'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs truncate ${notif.isRead ? 'font-semibold text-slate-800' : 'font-bold text-blue-950'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    {notif.targetBookingId && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-blue-600">
                        <span>Open Booking Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
