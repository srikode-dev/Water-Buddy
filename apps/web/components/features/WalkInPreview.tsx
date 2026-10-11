"use client";

import React, { useState } from "react";
import { playIcelandicChime, playBasaltDrop } from "@/utils/audio";
import { Droplet, X, Sparkles, Volume2, Check } from "lucide-react";

export interface WalkInPreviewProps {
  onLogWater?: (amount: number, label: string) => void;
  onToast?: (msg: string) => void;
}

export function WalkInPreview({ onLogWater, onToast }: WalkInPreviewProps) {
  const [activeTheme, setActiveTheme] = useState<'oceanic' | 'emerald' | 'obsidian' | 'neon'>('oceanic');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'bottom-center'>('bottom-right');
  const [isOpen, setIsOpen] = useState(true);
  const [recentAction, setRecentAction] = useState<string | null>(null);

  const handleSip = (amount: number, type: 'water' | 'coffee' | 'tea') => {
    playBasaltDrop();
    const label = type === 'coffee' ? '☕ Coffee (+75ml net)' : type === 'tea' ? '🍵 Tea (+120ml net)' : `💧 Water (+${amount}ml)`;
    setRecentAction(`✓ Logged ${amount}ml`);
    if (onLogWater) onLogWater(amount, label);
    if (onToast) onToast(`+${amount}ml logged! Notification smoothly acknowledged.`);

    setTimeout(() => {
      setRecentAction(null);
    }, 2500);
  };

  const handleTriggerTest = () => {
    setIsOpen(true);
    playIcelandicChime();
    if (onToast) onToast("Notification triggered on your simulated desktop!");
  };

  const themeColors = {
    oceanic: {
      color: '#38BDF8',
      label: 'Oceanic Aqua',
      glow: '0 0 20px rgba(56, 189, 248, 0.35)',
      gradient: 'from-[#38BDF8] to-[#0284C7]'
    },
    emerald: {
      color: '#34D399',
      label: 'Cyber Emerald',
      glow: '0 0 20px rgba(52, 211, 153, 0.35)',
      gradient: 'from-[#34D399] to-[#059669]'
    },
    obsidian: {
      color: '#FFFFFF',
      label: 'Midnight Obsidian',
      glow: '0 0 20px rgba(255, 255, 255, 0.25)',
      gradient: 'from-[#FFFFFF] to-[#94A3B8]'
    },
    neon: {
      color: '#C084FC',
      label: 'Neon Twilight',
      glow: '0 0 20px rgba(192, 132, 252, 0.35)',
      gradient: 'from-[#C084FC] to-[#38BDF8]'
    }
  };

  // Position alignment styling inside simulated desktop frame
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 items-end justify-end',
    'bottom-left': 'bottom-4 left-4 items-end justify-start',
    'top-right': 'top-10 right-4 items-start justify-end',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-end justify-center'
  };

  return (
    <div className="frosted-glass rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
            DESKTOP NOTIFICATION WIDGET
          </span>
          <h3 className="text-xl font-semibold text-white mt-1">
            See the floating reminder widget in action
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            This is the exact non-intrusive floating pill that appears on your Windows desktop at your set interval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerTest}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#38BDF8] text-[#070F19] hover:bg-white transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trigger Popup</span>
          </button>
        </div>
      </div>

      {/* Control bar: Choose Theme and Choose Corner Position */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#070F19]/60 p-4 rounded-2xl border border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-2">Visual Theme:</span>
          {(['oceanic', 'emerald', 'obsidian', 'neon'] as const).map((th) => (
            <button
              key={th}
              onClick={() => setActiveTheme(th)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeTheme === th
                  ? 'bg-white/15 text-white border border-white/20 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: themeColors[th].color, boxShadow: `0 0 8px ${themeColors[th].color}` }}
              />
              <span>{themeColors[th].label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-2">Screen Position:</span>
          {(
            [
              { id: 'bottom-right', label: 'Bottom Right ↘' },
              { id: 'bottom-left', label: 'Bottom Left ↙' },
              { id: 'top-right', label: 'Top Right ↗' },
              { id: 'bottom-center', label: 'Bottom Center ⬇' },
            ] as const
          ).map((pos) => (
            <button
              key={pos.id}
              onClick={() => setPosition(pos.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                position === pos.id
                  ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Desktop Workspace Frame */}
      <div className="relative h-72 sm:h-80 w-full rounded-2xl bg-[#050B13] border border-white/10 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
        {/* Desktop Header */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-white/5 pb-2">
          <span>Windows 11 Desktop (Simulated Workspace)</span>
          <span className="text-[#34D399] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            Non-intrusive floating HUD
          </span>
        </div>

        {/* Mock background editor lines */}
        <div className="space-y-2 opacity-25 max-w-sm pointer-events-none my-auto">
          <div className="h-2.5 w-48 bg-slate-700 rounded" />
          <div className="h-2.5 w-72 bg-slate-800 rounded" />
          <div className="h-2.5 w-36 bg-slate-700 rounded" />
          <div className="h-2.5 w-56 bg-slate-800 rounded" />
        </div>

        {/* Actual Floating Notification Widget in selected position */}
        {isOpen && (
          <div className={`absolute ${positionClasses[position]} z-20 animate-in fade-in zoom-in-95 duration-300`}>
            <div
              className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-3 flex items-center gap-3.5 shadow-2xl backdrop-blur-xl"
              style={{
                boxShadow: themeColors[activeTheme].glow,
                borderColor: themeColors[activeTheme].color + '40',
                width: 'min(440px, 90vw)'
              }}
            >
              {/* Circular Progress Ring with Droplet */}
              <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="19"
                    className="stroke-[#141C27]"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="19"
                    stroke={themeColors[activeTheme].color}
                    strokeWidth="4"
                    strokeDasharray="120"
                    strokeDashoffset="35"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Droplet
                    className="w-5 h-5 transition-colors"
                    style={{ color: themeColors[activeTheme].color }}
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grow min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-semibold text-sm leading-tight">Drink Water</h4>
                  {recentAction && (
                    <span className="text-[10px] text-[#34D399] font-mono animate-in fade-in">
                      {recentAction}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-0.5 leading-tight truncate">
                  Take a sip (250 ml) to stay energized
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleSip(250, 'water')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer shadow-md active:scale-95"
                  style={{
                    backgroundColor: themeColors[activeTheme].color,
                    color: '#070F19'
                  }}
                >
                  +250ml
                </button>

                <button
                  onClick={() => handleSip(150, 'coffee')}
                  title="Log Coffee"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs cursor-pointer border border-white/5"
                >
                  ☕
                </button>

                <button
                  onClick={() => handleSip(150, 'tea')}
                  title="Log Tea"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs cursor-pointer border border-white/5"
                >
                  🍵
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onToast) onToast("Notification dismissed. Next reminder in 45m.");
                  }}
                  title="Dismiss"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Windows Taskbar bottom strip */}
        <div className="h-6 w-full bg-[#070F19] border-t border-white/5 flex items-center justify-between px-3 text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-sky-400">❖</span>
            <span>Windows 11</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Water Buddy Running quietly</span>
            <span>ENG</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalkInPreview;
