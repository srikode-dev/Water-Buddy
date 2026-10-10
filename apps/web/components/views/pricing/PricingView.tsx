"use client";

import React, { useState } from 'react';
import { ProformaData } from '@/types';
import { playIcelandicChime, playBasaltDrop } from '@/utils/audio';
import { Check, ChevronDown, ChevronUp, Download, Sparkles, Key, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

export interface PricingViewProps {
  onTriggerDownload: () => void;
  onTriggerCheckout: () => void;
  onOpenProformaModal: (data: ProformaData) => void;
  onToast: (msg: string) => void;
}

export function PricingView({
  onTriggerDownload,
  onTriggerCheckout,
  onOpenProformaModal,
  onToast,
}: PricingViewProps) {
  const [billingMode, setBillingMode] = useState<'solo' | 'agency'>('solo');
  const [seats, setSeats] = useState(10);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [generatedLicense, setGeneratedLicense] = useState<string | null>(null);

  // Agency seat pricing calculations
  const unitPrice = 899;
  let discountPct = 0;
  if (seats >= 50) discountPct = 25;
  else if (seats >= 20) discountPct = 20;
  else if (seats >= 10) discountPct = 15;

  const baseCost = seats * unitPrice;
  const discountAmount = Math.round((baseCost * discountPct) / 100);
  const subtotal = baseCost - discountAmount;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gstAmount;

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleGenerateSampleKey = () => {
    playBasaltDrop();
    const chars = '0123456789ABCDEF';
    const randChunk = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const key = `WB24-${randChunk()}-${randChunk()}-${randChunk()}-PRO`;
    setGeneratedLicense(key);
    onToast(`Offline License Key Generated: ${key}`);
  };

  const handleOpenProforma = () => {
    const data: ProformaData = {
      companyName: 'Your Company / Studio Pvt Ltd',
      gstin: '29AABCB1234F1Z8',
      address: 'Bengaluru, Karnataka, India',
      seats,
      unitPrice,
      discountPct,
      subtotal,
      gstAmount,
      total: totalAmount,
      invoiceNumber: `INV-WB-${Date.now().toString().slice(-6)}`,
      invoiceDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    onOpenProformaModal(data);
  };

  const faqs = [
    {
      q: 'Does Water Buddy interrupt my typing or fullscreen games?',
      a: 'No! The overlay character is completely click-through until hovered. It never steals window focus, minimizes your game, or stops your keyboard input.',
    },
    {
      q: 'Does it work offline without an internet connection?',
      a: 'Yes, 100% offline. All settings, logs, and streaks are stored locally on your PC. No online account or internet required.',
    },
    {
      q: 'Is there a recurring monthly subscription?',
      a: 'No. The Free edition is free forever. The Pro edition is a simple one-time lifetime license (₹899). Pay once and keep it forever with all future updates.',
    },
    {
      q: 'What is your refund policy?',
      a: 'We offer a 30-day money-back guarantee. If you don’t find Water Buddy helpful, send a quick message and we will issue a full refund immediately.',
    },
    {
      q: 'Can I get a GST tax invoice for my studio or business?',
      a: 'Yes! Corporate checkouts include automated 18% GST input credit invoices with our registered GSTIN and SAC code.',
    },
  ];

  return (
    <div className="space-y-16 pb-20 pt-6 max-w-5xl mx-auto">
      {/* 1. Header & Switcher */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
          CLEAR & HONEST PRICING
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          Pay once, own forever.
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          No subscriptions, no sneaky renewals. Use the free version forever, or unlock all characters with a lifetime license.
        </p>

        {/* Solo vs Team Switcher */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <div className="inline-flex p-1 rounded-full bg-[#0C141F] border border-white/10 shadow-lg">
            <button
              onClick={() => setBillingMode('solo')}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer ${
                billingMode === 'solo'
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              INDIVIDUAL (SOLO)
            </button>
            <button
              onClick={() => setBillingMode('agency')}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer ${
                billingMode === 'agency'
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TEAM / STUDIO (GST INVOICE)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Solo Pricing Cards */}
      {billingMode === 'solo' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Card 1: Free Forever */}
          <div className="frosted-glass rounded-3xl p-8 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-6">
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className="text-slate-400 uppercase tracking-wider">FREE TIER</span>
                <span className="text-[#34D399] font-medium">Standard Release</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Community Edition</h3>
                <div className="flex items-baseline gap-1 pt-1 font-mono">
                  <span className="text-4xl sm:text-5xl font-bold text-white">₹0</span>
                  <span className="text-xs text-slate-400">/ Free Forever</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Everything you need to build a healthy hydration habit at your desk.
              </p>

              <div className="pt-2 border-t border-white/5 space-y-3">
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Windows 10 / 11 system tray widget</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Standard walking character companion</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>30, 45, or 60 minute reminder intervals</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Local progress tracking & streak counter</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>100% offline & zero cloud trackers</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={onTriggerDownload}
                className="w-full py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Download Free (.exe)</span>
                <Download className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Card 2: Lifetime Pro (Highlighted) */}
          <div className="frosted-glass rounded-3xl p-8 flex flex-col justify-between border-2 border-[#38BDF8]/50 shadow-[0_0_40px_rgba(56,189,248,0.15)] relative">
            <div className="absolute -top-3 right-6 bg-[#38BDF8] text-[#070F19] text-[10px] font-bold font-mono px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
              POPULAR · ONE-TIME
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className="text-[#38BDF8] uppercase tracking-wider font-semibold">LIFETIME LICENSE</span>
                <span className="text-slate-400">All Updates Included</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Supporter Edition</h3>
                <div className="flex items-baseline gap-1 pt-1 font-mono">
                  <span className="text-4xl sm:text-5xl font-bold text-white">₹899</span>
                  <span className="text-xs text-slate-400">/ One-Time Payment</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Pay once, own it forever. Unlocks the full character catalog and custom sound chimes.
              </p>

              <div className="pt-2 border-t border-white/5 space-y-3">
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    <span><strong>All character buddies & sprite packs</strong> unlocked</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    <span>Gentle chime acoustic sound packs</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    <span>Adaptive reminder pacing (recalculates sips)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    <span>Do Not Disturb & bedtime quiet hours</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    <span>Lifetime updates with zero subscription fees</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={onTriggerCheckout}
                className="w-full py-3.5 rounded-full bg-[#38BDF8] text-[#070F19] text-xs font-bold uppercase tracking-wider hover:bg-white active:scale-95 transition-all shadow-lg shadow-[#38BDF8]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Lifetime License (₹899)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Team / Agency Multi-Seat Console */
        <div className="frosted-glass rounded-3xl p-8 sm:p-10 border border-white/10 max-w-3xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
              MULTI-SEAT DEPLOYMENT
            </span>
            <h3 className="text-2xl font-bold text-white mt-1">
              Equip your entire dev team or design studio
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              Bulk volume licenses with formal Indian GST input credit tax invoice.
            </p>
          </div>

          <div className="space-y-4 bg-[#070F19]/60 p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-200">Number of Team Seats</label>
              <span className="font-mono text-lg font-bold text-[#38BDF8] bg-[#141C27] px-4 py-1 rounded-lg border border-white/10">
                {seats} Workstations
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>5 Seats</span>
              <span>20 Seats (20% off)</span>
              <span>50+ Seats (25% off)</span>
            </div>
          </div>

          <div className="bg-[#070F19]/80 p-6 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Base Rate ({seats} × ₹{unitPrice}):</span>
              <span>₹{baseCost.toLocaleString()}</span>
            </div>
            {discountPct > 0 && (
              <div className="flex justify-between text-[#34D399]">
                <span>Volume Discount ({discountPct}%):</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>18% GST (Input Tax Credit):</span>
              <span>+₹{gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-white/10">
              <span>Total Invoice Amount:</span>
              <span className="text-[#38BDF8]">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleOpenProforma}
              className="flex-1 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Formal GST Invoice</span>
            </button>
            <button
              onClick={onTriggerCheckout}
              className="flex-1 py-3.5 rounded-full bg-[#38BDF8] text-[#070F19] text-xs font-bold uppercase tracking-wider hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Instant Team Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto space-y-6 pt-10 border-t border-white/10">
        <div className="text-center mb-8">
          <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
            COMMON QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="frosted-glass rounded-2xl border border-white/10 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer"
              >
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                {expandedFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-[#38BDF8] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {expandedFaq === i && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PricingView;
