"use client";

import React, { useState } from 'react';
import { ActiveTab, WorkspaceRoutine } from '@/types';
import { TrayCompanion } from '@/components/features/tray-companion';
import { Download, ArrowUpRight, Cpu, Sliders, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { playBasaltDrop } from '@/utils/audio';

interface LandingViewProps {
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

export const LandingView: React.FC<LandingViewProps> = ({
  currentIntake,
  dailyGoal,
  onLogWater,
  onResetIntake,
  onUpdateGoal,
  onNavigateTab,
  onTriggerDownload,
  onTriggerCheckout,
  onToast,
}) => {
  // Calibration Engine state
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

  // Clinical baseline formula: (weight * 35ml) + exertion bonus, rounded to nearest 50ml
  const calculatedGoal = Math.round(((weightKg * 35) + getExertionBonus(routine)) / 50) * 50;
  const glasses = Math.round(calculatedGoal / 250);

  const getPacingIntervalText = () => {
    if (routine === 'athletic') return 'Every 35 minutes (High Activity)';
    if (routine === 'moderate') return 'Every 42 minutes';
    return 'Every 48 minutes';
  };

  const handleApplyGoal = () => {
    playBasaltDrop();
    onUpdateGoal(calculatedGoal);
    onToast(`Tray Companion daily goal updated to ${calculatedGoal.toLocaleString()} ml!`);
  };

  return (
    <div className="space-y-32 md:space-y-40 pb-16">
      {/* Atmospheric Mineral Light Cones */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#38bdf8]/10 via-slate-800/5 to-transparent blur-[140px] opacity-70"></div>
        <div className="absolute top-[40%] -left-48 w-[500px] h-[500px] bg-cyan-950/20 blur-[130px] rounded-full"></div>
        <div className="absolute top-[75%] -right-48 w-[600px] h-[600px] bg-sky-950/15 blur-[160px] rounded-full"></div>
      </div>

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative z-10 w-full pt-6 md:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Poetic Editorial Copy */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#38bdf8]/90">
              <span>STUDIO UTILITY</span>
              <span className="text-white/20">—</span>
              <span>EDITION 2025.1</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal text-white tracking-[-0.035em] leading-[1.05]">
              Hydration, <br />
              <span className="text-slate-400 italic font-light">distilled</span> to silence.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-xl">
              A silent Windows taskbar companion crafted for prolonged creative deep work. Mindful intervals, adaptive biological pacing, zero notification noise.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onTriggerDownload}
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#38bdf8] text-[#070f19] text-sm font-semibold tracking-wide hover:bg-white active:scale-95 transition-all shadow-[0_4px_24px_rgba(56,189,248,0.3)] hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                <span>Download for Windows 10 / 11</span>
              </button>

              <button
                onClick={() => onNavigateTab('architecture')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#dbe3f3] border border-white/10 text-sm font-normal tracking-wide transition-colors"
              >
                <span>Scientific Metric</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 pt-3 text-xs font-mono text-slate-400">
              <span>14 MB Lightweight</span>
              <span className="text-slate-600">•</span>
              <span>₹0 Free Tier</span>
              <span className="text-slate-600">•</span>
              <span>Pure Mineral Dark UI</span>
            </div>
          </div>

          {/* Right: Ultra-Sleek Mineral Glass Windows 11 Tray Widget */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <TrayCompanion
              currentIntake={currentIntake}
              dailyGoal={dailyGoal}
              onLogWater={onLogWater}
              onReset={onResetIntake}
              onUpdateGoal={onUpdateGoal}
            />
          </div>
        </div>
      </section>

      {/* 2. MINIMALIST 3-PILLAR EXPERIENCE */}
      <section className="relative z-10 w-full" id="experience">
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.22em] text-slate-400 mb-10">
          <span>01</span>
          <span className="w-8 h-[1px] bg-white/10"></span>
          <span>THE ARCHITECTURE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Pillar 1 */}
          <div className="frosted-glass-subtle rounded-2xl p-8 flex flex-col justify-between hover:border-white/15 transition-all duration-300 group">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs text-[#38bdf8]/80 font-medium">01 / PACING</span>
              <h3 className="text-xl text-white font-normal tracking-tight">Adaptive biological intervals.</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Water Buddy listens for mouse and keyboard stillness. If you step away from the desk or get locked in a meeting, reminders recalibrate silently.
              </p>
            </div>
            <div className="pt-8 text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#38bdf8]">sensors</span>
              <span>Zero notification spam</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="frosted-glass-subtle rounded-2xl p-8 flex flex-col justify-between hover:border-white/15 transition-all duration-300 group">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs text-[#38bdf8]/80 font-medium">02 / INTERFACE</span>
              <h3 className="text-xl text-white font-normal tracking-tight">Volcanic slate aesthetics.</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Docked on the Windows 11 system tray. Deep basalt dark mode designed to blend seamlessly beside your visual code editor, Figma, or terminal.
              </p>
            </div>
            <div className="pt-8 text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#38bdf8]">dock_to_bottom</span>
              <span>Taskbar native footprint</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="frosted-glass-subtle rounded-2xl p-8 flex flex-col justify-between hover:border-white/15 transition-all duration-300 group">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs text-[#38bdf8]/80 font-medium">03 / TELEMETRY</span>
              <h3 className="text-xl text-white font-normal tracking-tight">Multi-device cloud ledger.</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                One-click Google authentication. Keep full weekly hydration telemetry securely synced with upcoming mobile applications and wearables.
              </p>
            </div>
            <div className="pt-8 text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#38bdf8]">cloud_done</span>
              <span>Google Cloud infrastructure</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. REFINED HYDRATION METRIC / CALIBRATOR */}
      <section className="relative z-10 w-full" id="metrics">
        <div className="frosted-glass rounded-2xl p-8 md:p-12 border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Explanation & Sliders */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.22em] text-slate-400">
                <span>02</span>
                <span className="w-8 h-[1px] bg-white/10"></span>
                <span>CALIBRATION ENGINE</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-normal text-white tracking-tight">
                Calculated to your bodily mass.
              </h2>

              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Standard 2-liter generalizations ignore human physiology. Adjust your mass and exertion to observe your scientific baseline.
              </p>

              {/* Slider: Weight */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400 uppercase tracking-wider">Body Weight</span>
                  <span className="text-white text-sm font-semibold">{weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="120"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>45 kg</span>
                  <span>80 kg</span>
                  <span>120 kg</span>
                </div>
              </div>

              {/* Exertion Switcher */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Workspace Routine</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoutine('desk')}
                    className={`py-2 px-3 rounded-lg text-xs font-mono text-center transition-all border ${
                      routine === 'desk'
                        ? 'bg-white/10 text-white border-white/20 shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/5'
                    }`}
                  >
                    Desk Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoutine('moderate')}
                    className={`py-2 px-3 rounded-lg text-xs font-mono text-center transition-all border ${
                      routine === 'moderate'
                        ? 'bg-white/10 text-white border-white/20 shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/5'
                    }`}
                  >
                    Moderate
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoutine('athletic')}
                    className={`py-2 px-3 rounded-lg text-xs font-mono text-center transition-all border ${
                      routine === 'athletic'
                        ? 'bg-white/10 text-white border-white/20 shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/5'
                    }`}
                  >
                    Athletic
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Output Card */}
            <div className="lg:col-span-5 bg-[#141c27]/90 rounded-xl p-8 border border-white/5 flex flex-col justify-between gap-6 text-center sm:text-left shadow-xl">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#38bdf8]/90 font-medium">
                  Tailored Daily Goal
                </span>
                <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-2">
                  <span className="font-display text-5xl md:text-6xl text-white font-normal tracking-tight tabular-nums">
                    {calculatedGoal.toLocaleString()}
                  </span>
                  <span className="font-mono text-sm text-slate-400">ml / day</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 font-light">
                  Equivalent to {glasses} glasses across an 8-hour workday.
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Pacing Interval</span>
                  <span className="text-white font-medium">{getPacingIntervalText()}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Telemetry Precision</span>
                  <span className="text-emerald-400 font-medium">99.4% Clinical Fit</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyGoal}
                className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-[#38bdf8] text-white hover:text-[#070f19] text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/10 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply to Tray Companion</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CLEAN INR PRICING (HONEST INVESTMENT) */}
      <section className="relative z-10 w-full" id="pricing">
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.22em] text-slate-400">
            <span>03</span>
            <span className="w-8 h-[1px] bg-white/10"></span>
            <span>HONEST INVESTMENT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl text-white font-normal tracking-tight">Transparent pricing in INR (₹).</h2>
          <p className="text-sm text-slate-300 font-light max-w-md">
            No hidden fees, no subscriptions required if you prefer owning your software outright.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Tier 1: Free Starter */}
          <div className="frosted-glass-subtle rounded-2xl p-8 md:p-10 flex flex-col justify-between border border-white/5 hover:border-white/10 transition-all">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Starter Edition</span>
                <span className="text-xs font-mono text-slate-400">Local Only</span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="font-display text-4xl sm:text-5xl text-white font-normal">₹0</span>
                <span className="font-mono text-xs text-slate-400">/ forever</span>
              </div>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                Essential background hydration companion for single-workstation users.
              </p>
              <ul className="flex flex-col gap-3 pt-4 text-xs font-sans text-slate-300 font-light border-t border-white/5">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  <span>Windows 10 / 11 system tray widget</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  <span>Preset 30 to 90 min gentle interval chimes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  <span>7-day local intake memory cache</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <button
                onClick={onTriggerDownload}
                className="w-full py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 text-xs font-mono uppercase tracking-wider flex items-center justify-center transition-colors"
              >
                Download .exe Free
              </button>
            </div>
          </div>

          {/* Tier 2: Pro & Lifetime */}
          <div className="frosted-glass rounded-2xl p-8 md:p-10 flex flex-col justify-between border border-[#38bdf8]/30 relative shadow-2xl">
            <div className="absolute -top-3 right-8 px-3 py-0.5 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[10px] font-mono text-[#38bdf8] uppercase tracking-wider font-semibold">
              LIFETIME OPTION
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-mono uppercase tracking-wider text-[#38bdf8] font-medium">Buddy Studio Pro</span>
                <span className="text-xs font-mono text-[#38bdf8]/80">Full Telemetry</span>
              </div>
              <div className="flex items-baseline gap-2 my-2">
                <span className="font-display text-4xl sm:text-5xl text-white font-normal">₹199</span>
                <span className="font-mono text-xs text-slate-400">/ month or <strong>₹1,999</strong> once</span>
              </div>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                Google Cloud backup, continuous habit streaks, dynamic mass calibration, and priority mobile beta access.
              </p>
              <ul className="flex flex-col gap-3 pt-4 text-xs font-sans text-slate-300 font-light border-t border-white/5">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
                  <span>End-to-end Google Account Cloud Telemetry</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
                  <span>Biological formula sync & dynamic pacing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
                  <span>Mineral Basalt & Studio sound pack presets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
                  <span>Early priority invite for iOS & Android Companion</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <button
                type="button"
                onClick={onTriggerCheckout}
                className="w-full py-3.5 rounded-full bg-[#38bdf8] text-[#070f19] font-display text-xs font-semibold uppercase tracking-wider hover:bg-white active:scale-95 transition-all shadow-lg shadow-[#38bdf8]/20"
              >
                Get Lifetime Access (₹1,999)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DIRECT WINDOWS TRAY INSTALLER (CTA) */}
      <section className="relative z-10 w-full" id="download">
        <div className="frosted-glass rounded-3xl p-10 md:p-16 text-center flex flex-col items-center gap-6 border border-white/10 relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#38bdf8]/10 blur-[100px] pointer-events-none"></div>

          <span className="text-xs font-mono uppercase tracking-[0.22em] text-[#38bdf8]/90 font-medium">
            DIRECT WINDOWS TRAY INSTALLER
          </span>

          <h2 className="text-4xl sm:text-5xl md:text-6xl text-white font-normal tracking-[-0.035em] max-w-2xl leading-tight">
            Bring mindful pacing to your desk today.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-light max-w-lg">
            No signups required to start. Installs as a lightweight background service in under ten seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={onTriggerDownload}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[#070f19] hover:bg-[#38bdf8] text-sm font-semibold tracking-wide transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download for Windows (.exe)</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-2">
            <span>Version 1.4.2</span>
            <span className="text-slate-600">•</span>
            <span>SHA-256 Verified</span>
            <span className="text-slate-600">•</span>
            <span>Offline Capable</span>
          </div>
        </div>
      </section>

      {/* 6. EDITORIAL FOOTER */}
      <footer className="relative z-10 border-t border-white/5 bg-[#0c141f]/50 pt-16 pb-12 -mx-4 md:-mx-8 px-4 md:px-8 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]"></div>
              <span className="font-semibold text-sm text-white tracking-tight">Water Buddy</span>
              <span className="text-xs font-mono text-slate-400 ml-2">Natural Mineral Studio Edition</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-slate-400">
              <button onClick={() => onNavigateTab('architecture')} className="hover:text-white transition-colors">
                Architecture
              </button>
              <button onClick={() => onNavigateTab('architecture')} className="hover:text-white transition-colors">
                Metric
              </button>
              <button onClick={() => onNavigateTab('pricing')} className="hover:text-white transition-colors">
                Pricing (INR)
              </button>
              <button onClick={() => onNavigateTab('contact')} className="hover:text-white transition-colors">
                Contact
              </button>
              <button onClick={() => onNavigateTab('design-system')} className="hover:text-white transition-colors">
                UI Kit
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-500 border-t border-white/5 pt-8">
            <div>© 2025 Water Buddy Technologies. All rights reserved.</div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Systems Operational • Google Telemetry Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
