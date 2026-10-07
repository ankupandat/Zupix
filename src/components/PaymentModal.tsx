import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Smartphone,
  ExternalLink,
  Lock
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number; // 20 or 50
  paymentType: 'customer_token' | 'worker_commission';
  title?: string;
  subtitle?: string;
  bookingDetails?: {
    category?: string;
    proName?: string;
    customerName?: string;
    date?: string;
  };
  onPaymentSuccess: (utr: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  paymentType,
  title,
  subtitle,
  bookingDetails,
  onPaymentSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const UPI_ID = '9306315807@fam';
  const PHONE_NUMBER = '9306315807';
  const PAYEE_NAME = 'ZUPIX Pro Network';
  const NOTE = paymentType === 'customer_token' ? 'ZUPIX-Token-Fee' : 'ZUPIX-Worker-Commission';

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(NOTE)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr.trim()) {
      setError('Please enter the 12-digit UTR / UPI Reference Number from your payment receipt.');
      return;
    }

    if (utr.trim().length < 6) {
      setError('Please enter a valid Transaction Reference / UTR number.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      setIsSubmitting(false);
      onPaymentSuccess(utr.trim());
      setUtr('');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {title || (paymentType === 'customer_token' ? 'Mandatory Token Fee' : 'Platform Commission Fee')}
                </h3>
                <p className="text-xs text-blue-200">
                  {subtitle || 'Direct Manual UPI Payment & Verification'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount Badge */}
          <div className="mt-4 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-200">
              {paymentType === 'customer_token' ? 'Customer Platform Token' : 'Worker Job Confirmation Fee'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-amber-300">₹{amount}</span>
              <span className="text-xs text-slate-300">INR</span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* STRICT MANDATORY WARNING SYSTEM */}
          <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Strict Warning Mandate</p>
              <p className="text-xs font-semibold leading-relaxed mt-0.5">
                This fee is mandatory. If you do not pay this fee, your account will be permanently banned/blocked.
              </p>
            </div>
          </div>

          {bookingDetails && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
              {bookingDetails.category && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800">{bookingDetails.category}</span>
                </div>
              )}
              {bookingDetails.proName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialist:</span>
                  <span className="font-semibold text-slate-800">{bookingDetails.proName}</span>
                </div>
              )}
              {bookingDetails.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-800">{bookingDetails.customerName}</span>
                </div>
              )}
            </div>
          )}

          {/* QR Code Scanner Layout */}
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-blue-50/40 rounded-2xl border border-blue-100">
            <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              Scan QR Code with any UPI App
            </p>
            
            <div className="p-3 bg-white rounded-xl shadow-md border-2 border-blue-200">
              <QRCodeSVG
                value={upiUrl}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-500">
              <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200">GPay</span>
              <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200">PhonePe</span>
              <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200">Paytm</span>
              <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200">FamPay</span>
            </div>
          </div>

          {/* UPI ID Copy Box */}
          <div className="p-3 bg-slate-100/90 rounded-xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500 mb-1 flex justify-between">
              <span>Official FamePay UPI ID</span>
              <span>Mobile: {PHONE_NUMBER}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-bold text-blue-900 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex-1 truncate select-all">
                {UPI_ID}
              </code>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Direct Pay Link for Mobile */}
          <a
            href={upiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Open in UPI App (Pay ₹{amount})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Verification Form */}
          <form onSubmit={handleConfirmPayment} className="pt-2 border-t border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter 12-Digit UTR / Transaction ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={utr}
                onChange={(e) => {
                  setUtr(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. 423578912345 or UPI Ref"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              />
              {error && (
                <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Verify & Confirm ₹{amount} Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400">
            Manual verification enabled. All receipts are logged with Zupix Admin.
          </p>
        </div>

      </div>
    </div>
  );
};
