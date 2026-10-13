"use client";

import React, { useState, useEffect } from 'react';
import { ProformaData, FeatureItem, PricingConfig } from '@/types';
import { playIcelandicChime, playBasaltDrop } from '@/utils/audio';
import { Check, ChevronDown, ChevronUp, Download, Sparkles, Key, ShieldCheck, FileText, ArrowRight, Lock, Layers } from 'lucide-react';
import { API_BASE_URL } from '@/utils/api';

const DEFAULT_PRICING_FEATURES: FeatureItem[] = [
  {
    id: "tray_companion",
    name: "Windows 11 Tray Companion HUD",
    description: "Silent taskbar companion with real-time circular progress gauge and intake display.",
    includedInFree: true,
    includedInPro: true,
    category: "Core Ergonomics"
  },
  {
    id: "biometrics_goal",
    name: "Scientific Biometric Target Calibrator",
    description: "Calculates personalized daily hydration requirements based on mass, height, and activity tier.",
    includedInFree: true,
    includedInPro: true,
    category: "Core Ergonomics"
  },
  {
    id: "offline_sqlite_vault",
    name: "100% Offline Local SQLite Storage",
    description: "Stores logs and streaks entirely on your local machine with zero external network tracking.",
    includedInFree: true,
    includedInPro: true,
    category: "Privacy & Storage"
  },
  {
    id: "standard_reminder_cycles",
    name: "Standard Periodic Reminder Cycles",
    description: "Flexible desk hydration prompts with standard audio chime tones.",
    includedInFree: true,
    includedInPro: true,
    category: "Core Ergonomics"
  },
  {
    id: "adaptive_sip_pacing",
    name: "Adaptive Dynamic Sip Pacing",
    description: "Dynamically scales suggested intake volumes throughout the day based on remaining goal hours.",
    includedInFree: true,
    includedInPro: true,
    category: "Smart Hydration"
  },
  {
    id: "custom_icelandic_chimes",
    name: "Icelandic Chime Sound Library",
    description: "Gentle acoustic mineral chimes and customizable desktop reminder audio themes.",
    includedInFree: true,
    includedInPro: true,
    category: "Audio & Ambiance"
  },
  {
    id: "quiet_hours_dnd",
    name: "Do Not Disturb & Game Mode Suppressor",
    description: "Automatically silences prompts during focus sessions, calendar meetings, and full-screen games.",
    includedInFree: true,
    includedInPro: true,
    category: "Smart Hydration"
  },
  {
    id: "cloud_multi_device_sync",
    name: "Cross-Device Cloud Synchronization",
    description: "Real-time sync of hydration logs and preferences across multiple laptops and web dashboards.",
    includedInFree: true,
    includedInPro: true,
    category: "Cloud & Sync"
  },
  {
    id: "perpetual_analytics_history",
    name: "Perpetual History & Weekly Analytics",
    description: "Historical water logs with hourly aggregate intake curves and streak milestones.",
    includedInFree: true,
    includedInPro: true,
    category: "Cloud & Sync"
  },
  {
    id: "data_export_csv",
    name: "CSV & JSON Telemetry Data Export",
    description: "Export comprehensive hydration records for spreadsheet analysis and medical records.",
    includedInFree: true,
    includedInPro: true,
    category: "Privacy & Storage"
  },
  {
    id: "whatsapp_bot_reminders",
    name: "WhatsApp Bot Reminders & Chat Intake Logging",
    description: "Personal AI hydration bot sending timely WhatsApp prompts with 1-click message logging.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  },
  {
    id: "health_apps_sync",
    name: "Apple Health & Google Health Connect Sync",
    description: "Automated background sync of water intake telemetry with Apple Health & Google Health Connect.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  },
  {
    id: "exclusive_mobile_app",
    name: "Exclusive Mobile Companion App (iOS & Android)",
    description: "Exclusive access to the upcoming native companion smartphone app with lock-screen widgets.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  },
  {
    id: "priority_cloud_api",
    name: "Priority Cloud Webhooks & Integrations API",
    description: "Developer webhook triggers, custom integration endpoints, and zero-latency priority cloud pipelines.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  }
];

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
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState<string>('All');

  // Dynamic Pricing state from backend
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    price: 89,
    planName: 'Pro Supporter Plan',
    editionName: 'WhatsApp & Cloud Edition',
    freePlanName: 'Community Edition (All Desktop Features)',
    billingInterval: 'month',
    currency: 'INR',
    currencySymbol: '₹',
    gstPercent: 18,
    features: DEFAULT_PRICING_FEATURES
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/pricing`)
      .then((r) => r.json())
      .then((data) => {
        if (data.pricing) {
          let feats = data.pricing.features || [];
          if (!Array.isArray(feats) || feats.length === 0 || typeof feats[0] === 'string') {
            feats = DEFAULT_PRICING_FEATURES;
          }
          setPricingConfig({
            ...data.pricing,
            freePlanName: data.pricing.freePlanName || 'Community Edition (All Desktop Features)',
            billingInterval: data.pricing.billingInterval || 'month',
            features: feats
          });
        }
      })
      .catch(() => {});
  }, []);

  // Agency seat pricing calculations
  const unitPrice = pricingConfig.price;
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
      q: 'How does the Community Free vs Pro Supporter plan work?',
      a: 'The Community Free Edition includes 100% of all current desktop features forever at zero cost (tray companion, Icelandic acoustic chimes, dynamic sip pacing, local SQLite vault, analytics, CSV export). The Pro Supporter subscription (₹89 / month) powers cloud server infrastructure and unlocks upcoming integrations: personal WhatsApp reminder bot with 1-tap chat logging, Apple Health & Google Health Connect sync, and the native smartphone companion apps.',
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
    <div className="space-y-16 pb-20 pt-3 sm:pt-4 max-w-5xl mx-auto">
      {/* 1. Header & Switcher */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
          CLEAR & HONEST PRICING
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          All desktop tools free forever.
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Enjoy every core desk companion feature at zero cost. Upgrade to Pro for ₹{pricingConfig.price}/{pricingConfig.billingInterval || 'month'} to fund future cloud infrastructure and unlock WhatsApp bot reminders, mobile apps, and health ecosystem sync.
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
        <div className="space-y-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Card 1: Free Forever */}
            <div className="frosted-glass rounded-3xl p-8 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all">
              <div className="space-y-6">
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="text-slate-400 uppercase tracking-wider">FREE TIER</span>
                  <span className="text-[#34D399] font-medium">100% Active Perks</span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {pricingConfig.freePlanName || 'Community Edition'}
                  </h3>
                  <div className="flex items-baseline gap-1 pt-1 font-mono">
                    <span className="text-4xl sm:text-5xl font-bold text-white">₹0</span>
                    <span className="text-xs text-slate-400">/ Free Forever</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Everything you need to build a healthy hydration habit at your desk with local offline security and zero subscriptions.
                </p>

                {/* Only Features Allowed for Free */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <div className="text-[11px] font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                    Included in Community Edition:
                  </div>
                  <ul className="space-y-3 text-xs text-slate-300">
                    {pricingConfig.features
                      .filter((f) => f.includedInFree)
                      .map((feat) => (
                        <li key={feat.id} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-white block">{feat.name}</span>
                            <span className="text-[11px] text-slate-400 leading-snug block mt-0.5">
                              {feat.description}
                            </span>
                          </div>
                        </li>
                      ))}
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

            {/* Card 2: Pro Supporter (Highlighted) */}
            <div className="frosted-glass rounded-3xl p-8 flex flex-col justify-between border-2 border-[#38BDF8]/50 shadow-[0_0_40px_rgba(56,189,248,0.15)] relative">
              <div className="absolute -top-3 right-6 bg-[#38BDF8] text-[#070F19] text-[10px] font-bold font-mono px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                POPULAR · {pricingConfig.billingInterval?.toUpperCase() || 'MONTHLY'}
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="text-[#38BDF8] uppercase tracking-wider font-semibold">PRO SUPPORTER PLAN</span>
                  <span className="text-slate-400">Future Cloud Ecosystem</span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {pricingConfig.editionName || 'WhatsApp & Cloud Edition'}
                  </h3>
                  <div className="flex items-baseline gap-1 pt-1 font-mono">
                    <span className="text-4xl sm:text-5xl font-bold text-white">
                      {pricingConfig.currencySymbol || '₹'}{pricingConfig.price}
                    </span>
                    <span className="text-xs text-slate-400">/ {pricingConfig.billingInterval || 'month'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Support active development and get exclusive access to upcoming cloud infrastructure: WhatsApp reminder bot, Apple/Google health sync, and the native mobile companion app.
                </p>

                {/* Only Features Allowed for Pro */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <div className="text-[11px] font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                    Included in Pro Supporter Edition:
                  </div>
                  <ul className="space-y-3 text-xs text-slate-300">
                    {pricingConfig.features
                      .filter((f) => f.includedInPro)
                      .map((feat) => (
                        <li key={feat.id} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
                              <span>{feat.name}</span>
                              {!feat.includedInFree && (
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-400/10 text-sky-300 border border-sky-400/30 font-bold uppercase tracking-wider">
                                  Upcoming Pro Integration
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 leading-snug block mt-0.5">
                              {feat.description}
                            </span>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={onTriggerCheckout}
                  className="w-full py-3.5 rounded-full bg-[#38BDF8] text-[#070F19] text-xs font-bold uppercase tracking-wider hover:bg-white active:scale-95 transition-all shadow-lg shadow-[#38BDF8]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Join Pro Supporter ({pricingConfig.currencySymbol || '₹'}{pricingConfig.price} / {pricingConfig.billingInterval || 'month'})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Comprehensive Feature Matrix Comparison Table */}
          <div className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                    DETAILED SPECIFICATIONS
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    OWNER CONFIGURED MATRIX
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                  Compare Editions & Capabilities
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Every feature clearly explained. See exactly what is permitted in Community vs Supporter Edition.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  'All',
                  'Core Ergonomics',
                  'Smart Hydration',
                  'Privacy & Storage',
                  'Audio & Ambiance',
                  'Cloud & Sync',
                  'Future Cloud Integrations'
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMatrixCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                      matrixCategoryFilter === cat
                        ? 'bg-[#38BDF8] text-[#070F19] font-bold shadow-md shadow-[#38BDF8]/20'
                        : 'bg-[#0C141F] text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="frosted-glass rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 px-6 py-4 bg-[#141C27]/90 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <div className="col-span-6">Capability & Functional Description</div>
                <div className="col-span-3 text-center">
                  {pricingConfig.freePlanName || 'Community Free'} (₹0)
                </div>
                <div className="col-span-3 text-center text-[#38BDF8] font-semibold">
                  {pricingConfig.editionName || 'Supporter Pro'} ({pricingConfig.currencySymbol || '₹'}{pricingConfig.price}/{pricingConfig.billingInterval || 'month'})
                </div>
              </div>

              {/* Matrix Rows */}
              {pricingConfig.features
                .filter(
                  (f) =>
                    matrixCategoryFilter === 'All' || f.category === matrixCategoryFilter
                )
                .map((feature) => (
                  <div
                    key={feature.id}
                    className="p-5 md:px-6 md:py-4.5 grid grid-cols-1 md:grid-cols-12 items-center gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Feature Details */}
                    <div className="md:col-span-6 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white font-heading">
                          {feature.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                          {feature.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Community Free Status */}
                    <div className="md:col-span-3 flex items-center md:justify-center">
                      <span className="md:hidden text-xs text-slate-400 font-mono mr-2">
                        Community Free:
                      </span>
                      {feature.includedInFree ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>Included</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5 text-xs font-mono">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Pro Supporter</span>
                        </span>
                      )}
                    </div>

                    {/* Pro Supporter Status */}
                    <div className="md:col-span-3 flex items-center md:justify-center">
                      <span className="md:hidden text-xs text-[#38BDF8] font-mono mr-2">
                        Supporter Pro:
                      </span>
                      {feature.includedInPro ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 text-[#38BDF8] border border-sky-500/30 text-xs font-mono font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {feature.category === 'Future Cloud Integrations' || !feature.includedInFree
                              ? 'Included (Upcoming)'
                              : 'Included'}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      )}
                    </div>
                  </div>
                ))}
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
