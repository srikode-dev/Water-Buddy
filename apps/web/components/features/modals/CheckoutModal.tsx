"use client";

import React, { useState } from 'react';
import { playIcelandicChime } from '@/utils/audio';
import { X, Check, ShieldCheck, QrCode, CreditCard, Landmark, Copy } from 'lucide-react';

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onToast }) => {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isCompleted, setIsCompleted] = useState(false);
  const [purchasedKey, setPurchasedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    playIcelandicChime();
    const chars = '0123456789ABCDEF';
    const randChunk = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const key = `WB24-${randChunk()}-${randChunk()}-${randChunk()}-PRO`;
    setPurchasedKey(key);
    setIsCompleted(true);
    onToast('Payment verified via Razorpay! Lifetime token issued.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0c141f] border border-white/20 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 text-slate-200">
        <button
          onClick={onClose}
          aria-label="Close checkout"
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <>
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                RAZORPAY 256-BIT TLS GATEWAY
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Acquire Studio Pro Lifetime
              </h3>
              <p className="text-xs text-slate-400">
                Single workstation perpetual ownership with automated Indian GST invoice.
              </p>
            </div>

            <div className="bg-[#070f19] border border-white/5 rounded-xl p-4 flex justify-between items-center font-mono">
              <div>
                <span className="text-xs text-slate-400">Total Payable:</span>
                <div className="text-2xl font-bold text-white">₹1,999 <span className="text-xs font-normal text-slate-400">INR</span></div>
              </div>
              <span className="text-[10px] text-emerald-400 px-2 py-1 bg-emerald-400/10 rounded border border-emerald-400/20">
                GST (18%) Included
              </span>
            </div>

            {/* Payment Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMethod('upi')}
                className={`py-2 rounded-lg text-xs font-mono transition-all border flex flex-col items-center gap-1 ${
                  method === 'upi'
                    ? 'bg-white/15 text-white border-white/20'
                    : 'bg-white/[0.03] text-slate-400 border-white/5'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#38bdf8]" />
                <span>UPI / QR</span>
              </button>
              <button
                onClick={() => setMethod('card')}
                className={`py-2 rounded-lg text-xs font-mono transition-all border flex flex-col items-center gap-1 ${
                  method === 'card'
                    ? 'bg-white/15 text-white border-white/20'
                    : 'bg-white/[0.03] text-slate-400 border-white/5'
                }`}
              >
                <CreditCard className="w-4 h-4 text-slate-300" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setMethod('netbanking')}
                className={`py-2 rounded-lg text-xs font-mono transition-all border flex flex-col items-center gap-1 ${
                  method === 'netbanking'
                    ? 'bg-white/15 text-white border-white/20'
                    : 'bg-white/[0.03] text-slate-400 border-white/5'
                }`}
              >
                <Landmark className="w-4 h-4 text-slate-300" />
                <span>NetBanking</span>
              </button>
            </div>

            {/* Method UI */}
            {method === 'upi' && (
              <div className="p-4 rounded-xl bg-[#070f19] border border-white/5 flex flex-col items-center gap-3 text-center">
                <div className="w-36 h-36 bg-white rounded-lg p-2 flex items-center justify-center shadow-lg">
                  <svg className="w-full h-full text-[#070f19]" viewBox="0 0 100 100">
                    <rect x="10" y="10" width="25" height="25" fill="currentColor" />
                    <rect x="15" y="15" width="15" height="15" fill="white" />
                    <rect x="65" y="10" width="25" height="25" fill="currentColor" />
                    <rect x="70" y="15" width="15" height="15" fill="white" />
                    <rect x="10" y="65" width="25" height="25" fill="currentColor" />
                    <rect x="15" y="70" width="15" height="15" fill="white" />
                    <rect x="42" y="15" width="16" height="16" fill="currentColor" />
                    <rect x="42" y="42" width="16" height="16" fill="currentColor" />
                    <rect x="68" y="42" width="16" height="16" fill="currentColor" />
                    <rect x="15" y="42" width="16" height="16" fill="currentColor" />
                    <rect x="42" y="68" width="16" height="16" fill="currentColor" />
                    <rect x="68" y="68" width="16" height="16" fill="currentColor" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-white font-medium">Scan using GPay, PhonePe, Paytm, or BHIM</div>
                  <div className="text-[11px] font-mono text-slate-400">VPA: waterbuddy@razorpay</div>
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase block mb-1">Card Number</label>
                  <input
                    type="text"
                    defaultValue="4111 •••• •••• 9214"
                    className="w-full px-3 py-2 rounded-lg bg-[#070f19] border border-white/10 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] uppercase block mb-1">Expiry</label>
                    <input
                      type="text"
                      defaultValue="08 / 29"
                      className="w-full px-3 py-2 rounded-lg bg-[#070f19] border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] uppercase block mb-1">CVV</label>
                    <input
                      type="password"
                      defaultValue="•••"
                      className="w-full px-3 py-2 rounded-lg bg-[#070f19] border border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="space-y-2 font-mono text-xs">
                <span className="text-slate-400 text-[10px] uppercase block">Select Preferred Bank:</span>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                    <button
                      key={bank}
                      onClick={() => onToast(`Selected ${bank}`)}
                      className="p-2.5 rounded-lg bg-[#070f19] border border-white/10 text-slate-300 hover:text-white hover:border-[#38bdf8] text-left transition-colors"
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSimulatePayment}
              className="w-full py-3.5 rounded-xl bg-[#38bdf8] text-[#070f19] font-bold text-xs uppercase tracking-wider hover:bg-white active:scale-95 transition-all shadow-lg shadow-[#38bdf8]/20 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Simulate Verified Payment (₹1,999)</span>
            </button>
          </>
        ) : (
          /* Payment Success State */
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 mx-auto flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-medium">
                TRANSACTION COMPLETE • LICENSURE GRANTED
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Welcome to Water Buddy Studio Pro
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto font-light leading-relaxed">
                Your cryptographic token is ready. Paste this into your Windows Tray Companion to unlock full telemetry and acoustic sound packs.
              </p>
            </div>

            <div className="p-4 bg-[#070f19] border border-[#38bdf8]/30 rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">OFFLINE ACTIVATION TOKEN:</span>
              <div className="font-mono text-sm sm:text-base text-[#38bdf8] font-bold select-all tracking-wider">
                {purchasedKey}
              </div>
              <button
                onClick={() => {
                  if (purchasedKey) {
                    navigator.clipboard.writeText(purchasedKey);
                    onToast('License key copied to clipboard!');
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Token</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-white text-[#070f19] font-semibold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors"
            >
              Done & Return to Companion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
