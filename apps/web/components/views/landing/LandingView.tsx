"use client";

import React, { useState } from 'react';
import { ActiveTab, WorkspaceRoutine } from '@/types';
import { TrayCompanion } from '@/components/features/tray-companion';
import { TextManifesto } from '@/components/features/TextManifesto';
import { WalkInPreview } from '@/components/features/WalkInPreview';
import { Download, Monitor, ShieldCheck, Zap, Heart, CheckCircle2, Sliders, ArrowDown, Sparkles } from 'lucide-react';
import { playBasaltDrop } from '@/utils/audio';

export interface LandingViewProps {
  currentIntake: number;
  dailyGoal: number;
  onLogWater: (amount: number, label: string) => void;
  onResetIntake: () => void;
  onUpdateGoal: (goal: number) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onTriggerDownload: () => void;
  onTriggerCheckout: () => void;
  onToast: (msg: string) => void;
}

export function LandingView({
  currentIntake,
  dailyGoal,
  onLogWater,
  onResetIntake,
  onUpdateGoal,
  onNavigateTab,
  onTriggerDownload,
  onTriggerCheckout,
  onToast,
}: LandingViewProps) {
  // Goal calculator state
  const [weightKg, setWeightKg] = useState(70);
  const [routine, setRoutine] = useState<WorkspaceRoutine>('desk');

  const getExertionBonus = (r: WorkspaceRoutine) => {
    switch (r) {
      case 'moderate':
        return 400;
      case 'athletic':
        return 800;
      case 'desk':
      default:
        return 0;
    }
  };

  const calculatedGoal = Math.round(((weightKg * 35) + getExertionBonus(routine)) / 50) * 50;
  const glasses = Math.round(calculatedGoal / 250);

  const handleApplyGoal = () => {
    playBasaltDrop();
    onUpdateGoal(calculatedGoal);
    onToast(`Daily water target updated to ${calculatedGoal.toLocaleString()} ml!`);
  };

  const scrollToDemo = () => {
    const el = document.getElementById('interactive-demo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-24 sm:space-y-32 pb-16">
      {/* Ambient background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#38bdf8]/15 via-slate-800/5 to-transparent blur-[140px] opacity-70" />
        <div className="absolute top-[40%] -left-48 w-[500px] h-[500px] bg-cyan-950/20 blur-[130px] rounded-full" />
        <div className="absolute top-[75%] -right-48 w-[600px] h-[600px] bg-sky-950/15 blur-[160px] rounded-full" />
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative z-10 w-full pt-8 md:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Headline & Explanation */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-[#0C141F]/80 px-3.5 py-1 text-xs font-mono text-[#38BDF8] w-fit shadow-inner">
              <span className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
              <span>WINDOWS 10 & 11 APP</span>
              <span className="text-slate-600">•</span>
              <span>LIGHTWEIGHT &lt;25MB RAM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight leading-[1.12]">
              The desktop buddy that reminds you to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-[#34D399]">
                drink water.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
              A friendly character walks quietly across your screen while you work, study, or game. 
              Gentle walk-in reminders, one-click logging from your Windows tray, and zero annoying popups.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onTriggerDownload}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-[#070F19] text-sm font-semibold tracking-wide hover:bg-slate-200 active:scale-95 transition-all shadow-xl hover:scale-105 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download for Windows (.exe)</span>
              </button>

              <button
                onClick={scrollToDemo}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/10 bg-[#0C141F]/60 text-slate-300 hover:text-white hover:border-[#38BDF8] text-sm font-medium transition-all cursor-pointer"
              >
                <span>Try Live Demo</span>
                <ArrowDown className="w-4 h-4 text-[#38BDF8]" />
              </button>
            </div>

            {/* Trust bullet points */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 pt-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                <span>Never steals typing focus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                <span>100% Offline & Private</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                <span>No account required</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Tray Widget Simulator */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full">
              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0C141F] border border-sky-400/20 text-[11px] font-mono text-[#38BDF8]">
                  <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                  <span>IN-BROWSER INTERACTIVE PREVIEW</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Try logging water right now to see how the desktop flow works:
                </p>
              </div>

              <TrayCompanion
                currentIntake={currentIntake}
                dailyGoal={dailyGoal}
                onLogWater={onLogWater}
                onReset={onResetIntake}
                onUpdateGoal={onUpdateGoal}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. REALFOOD.GOV INSPIRED SCROLL-REVEALED MANIFESTO */}
      <TextManifesto />

      {/* 3. LIVE INTERACTIVE WALK-IN SIMULATOR */}
      <section className="relative z-10 w-full">
        <WalkInPreview onLogWater={onLogWater} onToast={onToast} />
      </section>

      {/* 4. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="relative z-10 w-full" id="how-it-works">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
            SIMPLE & EFFECTIVE
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mt-2">
            How Water Buddy works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Built for people who spend long hours at a computer and forget to stay hydrated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Pick Your Goal & Interval",
              desc: "Enter your body weight or set a custom goal (like 2.5 Liters). Pick how often you want reminders, such as every 30 or 45 minutes.",
              icon: <Sliders className="w-5 h-5 text-[#38BDF8]" />,
            },
            {
              step: "02",
              title: "A Cute Character Walks In",
              desc: "At your set interval, an animated buddy strolls across the bottom of your screen and asks: 'Did you drink water?'. It never steals your typing focus.",
              icon: <Heart className="w-5 h-5 text-[#38BDF8]" />,
            },
            {
              step: "03",
              title: "One-Click Logging",
              desc: "Click 'Yes' (+150ml or +250ml) or 'No'. Your buddy reacts with cheerful animations, your daily tray progress ring fills up, and you stay healthy.",
              icon: <Zap className="w-5 h-5 text-[#38BDF8]" />,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="frosted-glass rounded-2xl p-7 flex flex-col justify-between border border-white/10 hover:border-[#38BDF8]/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-10 w-10 rounded-xl bg-[#141C27] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="font-mono text-2xl font-bold text-slate-600 group-hover:text-[#38BDF8] transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. INTERACTIVE DAILY GOAL CALCULATOR */}
      <section className="relative z-10 w-full" id="interactive-demo">
        <div className="frosted-glass rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Calculator Form */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                  DAILY WATER CALCULATOR
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
                  Find your recommended water goal
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Calculate the ideal daily intake for your body weight and daily desk routine.
                </p>
              </div>

              {/* Weight Slider */}
              <div className="space-y-3 bg-[#070F19]/60 p-5 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-200">Your Body Weight</label>
                  <span className="font-mono text-base font-bold text-[#38BDF8] bg-[#141C27] px-3 py-1 rounded-lg border border-white/10">
                    {weightKg} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="130"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>40 kg</span>
                  <span>70 kg (Average)</span>
                  <span>130 kg</span>
                </div>
              </div>

              {/* Activity Tier */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Daily Desk Routine
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'desk', label: 'Desk / Sedentary', sub: 'Standard work' },
                    { id: 'moderate', label: 'Moderate', sub: '+400ml offset' },
                    { id: 'athletic', label: 'Active / Workout', sub: '+800ml offset' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setRoutine(tier.id as WorkspaceRoutine)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        routine === tier.id
                          ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-white shadow-md'
                          : 'bg-[#070F19]/40 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-semibold">{tier.label}</div>
                      <div className="text-[10px] text-slate-500">{tier.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleApplyGoal}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#38BDF8] text-[#070F19] text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-lg cursor-pointer"
              >
                Apply Target to Live Preview ({calculatedGoal.toLocaleString()} ml)
              </button>
            </div>

            {/* Right: Recommendation Display Card */}
            <div className="lg:col-span-5 bg-[#070F19]/80 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-2xl">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase block">RECOMMENDED TARGET</span>
                <div className="text-4xl sm:text-5xl font-bold text-white font-mono mt-1">
                  {calculatedGoal.toLocaleString()} <span className="text-base font-normal text-slate-400">ml / day</span>
                </div>
                <div className="text-xs text-[#38BDF8] mt-2 font-mono">
                  ≈ {glasses} glasses (250ml each)
                </div>
              </div>

              <div className="space-y-3 border-t border-white/10 pt-4 text-xs text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pacing Schedule:</span>
                  <span className="text-white font-semibold">Every 45 Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Sips per Day:</span>
                  <span className="text-white font-semibold">{Math.round(calculatedGoal / 150)} Reminders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Suggested Sip Size:</span>
                  <span className="text-[#34D399] font-semibold">150ml - 250ml</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                *General health guideline. You can manually adjust your target anytime in settings.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FEATURES */}
      <section className="relative z-10 w-full" id="features">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
            KEY FEATURES
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mt-2">
            Built specifically for Windows
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Unlike heavy web apps or phone alerts you ignore, Water Buddy stays politely at your desk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Walks Over Any App",
              desc: "Transparent desktop window lets your buddy walk over code editors, browsers, or games without taking focus away from your typing.",
              tag: "NON-INTRUSIVE",
              icon: <Monitor className="w-5 h-5 text-[#38BDF8]" />,
            },
            {
              title: "System Tray Quick Log",
              desc: "Log +150ml, +250ml, or check your daily progress ring with a single click right from the Windows taskbar tray icon.",
              tag: "1-CLICK ACCESS",
              icon: <Zap className="w-5 h-5 text-[#38BDF8]" />,
            },
            {
              title: "Smart Adaptive Sips",
              desc: "Behind on your goal? Water Buddy automatically recalculates your sip size so you can catch up comfortably before your workday ends.",
              tag: "AUTO PACING",
              icon: <Sliders className="w-5 h-5 text-[#38BDF8]" />,
            },
            {
              title: "100% Offline & Private",
              desc: "All your water logs and settings stay encrypted locally on your computer. No sign-up, no analytics, no cloud trackers.",
              tag: "LOCAL FIRST",
              icon: <ShieldCheck className="w-5 h-5 text-[#34D399]" />,
            },
            {
              title: "Uses Under 25MB RAM",
              desc: "Super optimized desktop background utility. Uses virtually zero CPU and sleeps automatically when you're away from your PC.",
              tag: "LIGHTWEIGHT",
              icon: <CheckCircle2 className="w-5 h-5 text-[#38BDF8]" />,
            },
            {
              title: "Quiet Hours & Fullscreen Sleep",
              desc: "Set quiet hours for evening and bedtime. Automatically suspends reminders when you're watching movies or presenting fullscreen.",
              tag: "DO NOT DISTURB",
              icon: <Heart className="w-5 h-5 text-[#34D399]" />,
            },
          ].map((f, i) => (
            <div
              key={i}
              className="frosted-glass rounded-2xl p-6 border border-white/10 hover:border-[#38BDF8]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-9 w-9 rounded-lg bg-[#141C27] border border-white/10 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. DOWNLOAD CTA SECTION */}
      <section className="relative z-10 w-full" id="download">
        <div className="frosted-glass rounded-3xl p-10 md:p-14 text-center flex flex-col items-center gap-6 border border-white/10 relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#38BDF8]/15 blur-[100px] pointer-events-none" />

          <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-semibold">
            GET STARTED IN 10 SECONDS
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-semibold tracking-tight max-w-xl">
            Start staying hydrated while you work.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-lg">
            Download the installer for Windows 10 or 11. No accounts, no sign-ups, and free to try.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={onTriggerDownload}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[#070F19] hover:bg-slate-200 text-sm font-semibold tracking-wide transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download for Windows (.exe)</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
            <span>Windows 10 / 11 (64-bit)</span>
            <span className="text-slate-600">•</span>
            <span>14.2 MB Installer</span>
            <span className="text-slate-600">•</span>
            <span>SHA-256 Verified</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingView;
