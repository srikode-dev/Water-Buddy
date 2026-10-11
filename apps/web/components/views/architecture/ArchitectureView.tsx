"use client";

import React, { useState } from 'react';
import { WalkInPreview } from '@/components/features/WalkInPreview';
import { Monitor, Heart, Sliders, ShieldCheck, Zap, Download, Sparkles, Volume2, Clock } from 'lucide-react';
import { playIcelandicChime } from '@/utils/audio';

export interface ArchitectureViewProps {
  onTriggerDownload: () => void;
  onTriggerCheckout: () => void;
  onToast: (msg: string) => void;
}

export function ArchitectureView({
  onTriggerDownload,
  onTriggerCheckout,
  onToast,
}: ArchitectureViewProps) {
  const [dailyGoal, setDailyGoal] = useState(2400);
  const [consumed, setConsumed] = useState(800);
  const [hoursLeft, setHoursLeft] = useState(6);

  // Friendly calculation
  const remainingGoal = Math.max(0, dailyGoal - consumed);
  const remindersRemaining = Math.max(1, Math.floor((hoursLeft * 60) / 45));
  const suggestedSip = Math.max(100, Math.min(450, Math.round(remainingGoal / remindersRemaining / 25) * 25));

  const testSound = () => {
    playIcelandicChime();
    onToast("Playing gentle reminder chime 🎵");
  };

  return (
    <div className="space-y-16 pb-20 pt-3 sm:pt-4 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-[#0C141F]/80 px-3.5 py-1 text-xs font-mono text-[#38BDF8] shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>HOW IT WORKS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          Hydration that fits into your workday.
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          No loud phone alarms, no pushy popup banners. Just a friendly little desktop buddy 
          that makes staying healthy feel completely effortless.
        </p>
      </div>

      {/* 2. Live Interactive Walk-In Preview */}
      <WalkInPreview onToast={onToast} />

      {/* 3. The 4 Simple Foundations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            step: "01",
            title: "Lives quietly in your Windows tray",
            desc: "Water Buddy sits quietly in your taskbar system tray. It takes up virtually zero computer memory (under 25MB RAM) and never clutters your screen with open windows.",
            icon: <Monitor className="w-5 h-5 text-[#38BDF8]" />,
            tag: "LIGHTWEIGHT & SILENT",
          },
          {
            step: "02",
            title: "Never interrupts your typing or games",
            desc: "When it's time for a reminder, your buddy strolls gently across the bottom edge of your screen. Because it is completely click-through, you can keep coding, writing, or playing games without losing focus.",
            icon: <Zap className="w-5 h-5 text-[#34D399]" />,
            tag: "ZERO FOCUS STEALING",
          },
          {
            step: "03",
            title: "1-second effortless logging",
            desc: "Click '+150ml' or '+250ml' right from your buddy or the taskbar tray icon. Your progress ring fills up, your companion smiles, and you go straight back to work without opening a single app.",
            icon: <Heart className="w-5 h-5 text-[#38BDF8]" />,
            tag: "ONE-CLICK HABIT",
          },
          {
            step: "04",
            title: "100% Private on your PC",
            desc: "Your daily streaks and water history are stored securely on your own computer. No online accounts, no sign-ups, no internet connection required, and zero cloud tracking.",
            icon: <ShieldCheck className="w-5 h-5 text-[#34D399]" />,
            tag: "100% OFFLINE & PRIVATE",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="frosted-glass rounded-2xl p-7 border border-white/10 hover:border-[#38BDF8]/40 transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-[#141C27] border border-white/10 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-[11px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-0.5 rounded-full border border-[#38BDF8]/20 font-bold">
                {item.tag}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Desktop Companion Core Engine Architecture */}
      <div className="frosted-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
              DESKTOP COMPANION ARCHITECTURE
            </span>
            <h3 className="text-xl font-semibold text-white mt-1">
              Engineered for Windows 11 &amp; zero desktop distractions
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Water Buddy operates as a native Win32 background service with transparent floating overlays and offline-first encryption.
            </p>
          </div>

          <button
            onClick={testSound}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-all shrink-0 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Test Chime Sound</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#070F19]/60 p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="text-xs font-mono text-[#38BDF8] font-bold">01 · FLOATING HUD POPUP</div>
            <h4 className="text-white text-sm font-semibold">Customizable Themes &amp; Position</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              4 distinct visual themes (Oceanic, Emerald, Obsidian, Neon) positioned in any of the 4 screen corners (above clock, bottom-left, top-right, or bottom-center).
            </p>
          </div>

          <div className="bg-[#070F19]/60 p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="text-xs font-mono text-[#34D399] font-bold">02 · SYSTEM TRAY COMPANION</div>
            <h4 className="text-white text-sm font-semibold">One-Click Taskbar Menu</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quietly sits in your Windows system tray. Access today's progress ring, log +150ml, +250ml, coffee, or tea in a single click without opening bulky windows.
            </p>
          </div>

          <div className="bg-[#070F19]/60 p-5 rounded-2xl border border-white/5 space-y-2">
            <div className="text-xs font-mono text-purple-400 font-bold">03 · OFFLINE FIRST &amp; PRO SYNC</div>
            <h4 className="text-white text-sm font-semibold">Private Local Storage + Cloud Hub</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track 100% offline in Guest Mode without ever creating an account. Upgrade to Pro Lifetime (₹899) anytime to backup and sync across devices.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Download Callout */}
      <div className="frosted-glass rounded-3xl p-8 sm:p-10 border border-white/10 text-center space-y-4">
        <h3 className="text-2xl font-semibold text-white">
          Ready to experience peaceful hydration?
        </h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Download the installer for Windows 10 and 11. It takes less than 10 seconds to set up.
        </p>
        <div className="pt-2">
          <button
            onClick={onTriggerDownload}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-[#070F19] text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download for Windows (.exe)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ArchitectureView;
