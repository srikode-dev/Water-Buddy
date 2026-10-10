"use client";

import React, { useState } from "react";
import { playIcelandicChime, playBasaltDrop } from "@/utils/audio";
import { Sparkles, Play, Check, RotateCcw } from "lucide-react";

export interface WalkInPreviewProps {
  onLogWater?: (amount: number, label: string) => void;
  onToast?: (msg: string) => void;
}

export function WalkInPreview({ onLogWater, onToast }: WalkInPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSipped, setHasSipped] = useState(false);

  const startWalkIn = () => {
    setIsPlaying(true);
    setHasSipped(false);
    playIcelandicChime();
    if (onToast) onToast("Buddy is walking in! See how it appears on your screen.");
  };

  const handleSip = (amount: number) => {
    playBasaltDrop();
    setHasSipped(true);
    if (onLogWater) onLogWater(amount, "Walk-In Sip");
    if (onToast) onToast(`+${amount}ml logged! Buddy waves goodbye 👋`);

    // Walk away after 2 seconds
    setTimeout(() => {
      setIsPlaying(false);
    }, 1800);
  };

  return (
    <div className="frosted-glass rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
            LIVE DEMONSTRATION
          </span>
          <h3 className="text-xl font-semibold text-white mt-1">
            See the walking companion in action
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            This is an interactive simulation of how your buddy strolls across your screen at your set interval.
          </p>
        </div>

        <button
          onClick={startWalkIn}
          disabled={isPlaying}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            isPlaying
              ? "bg-white/10 text-slate-400 cursor-not-allowed"
              : "bg-[#38BDF8] text-[#070F19] hover:bg-white shadow-lg active:scale-95"
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isPlaying ? "Walking in..." : "Preview Walk-In"}</span>
        </button>
      </div>

      {/* Simulated Desktop Window Frame */}
      <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-[#050B13] border border-white/10 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
        {/* Mock Desktop Background Header */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-white/5 pb-2">
          <span>Simulated Desktop Workspace</span>
          <span className="text-[#34D399]">Click-through active</span>
        </div>

        {/* Center Mock App content (e.g. mock code/document) */}
        <div className="space-y-2 opacity-35 max-w-sm pointer-events-none">
          <div className="h-3 w-48 bg-slate-700 rounded" />
          <div className="h-3 w-64 bg-slate-800 rounded" />
          <div className="h-3 w-36 bg-slate-750 rounded" />
          <div className="h-3 w-52 bg-slate-800 rounded" />
        </div>

        {/* Bottom Screen Edge with Buddy Animation */}
        <div className="relative w-full h-24 flex items-end">
          {isPlaying ? (
            <div className="absolute left-6 sm:left-12 bottom-0 flex items-end gap-3 animate-in slide-in-from-left duration-700">
              {/* Walking Animated Droplet Character */}
              <div className="relative group cursor-pointer">
                {/* Droplet Body */}
                <div className="w-16 h-18 bg-gradient-to-b from-[#38BDF8] to-sky-600 rounded-[50%_50%_45%_45%] shadow-[0_0_20px_rgba(56,189,248,0.5)] flex flex-col items-center justify-center p-2 border-2 border-white/80 animate-bounce">
                  {/* Eyes */}
                  <div className="flex gap-2.5 mt-2">
                    <div className="w-2 h-2.5 rounded-full bg-[#070F19] animate-pulse" />
                    <div className="w-2 h-2.5 rounded-full bg-[#070F19] animate-pulse" />
                  </div>
                  {/* Smile */}
                  <div className="w-3 h-1.5 border-b-2 border-[#070F19] rounded-full mt-1" />
                </div>
                {/* Shadow */}
                <div className="w-12 h-2 bg-black/50 rounded-full mx-auto blur-[2px] mt-1" />
              </div>

              {/* Speech Bubble */}
              <div className="bg-[#0C141F] border border-white/20 rounded-2xl p-3 shadow-2xl space-y-2 max-w-xs animate-in zoom-in-95">
                <div className="text-xs text-white font-medium">
                  {hasSipped ? (
                    <span className="text-[#34D399] flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Nice sip! Feeling refreshed!
                    </span>
                  ) : (
                    "Did you drink water? Take a quick sip!"
                  )}
                </div>

                {!hasSipped ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSip(150)}
                      className="px-2.5 py-1 rounded-lg bg-[#38BDF8] text-[#070F19] text-[11px] font-bold font-mono hover:bg-white transition-all cursor-pointer"
                    >
                      +150ml
                    </button>
                    <button
                      onClick={() => handleSip(250)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold font-mono transition-all cursor-pointer"
                    >
                      +250ml
                    </button>
                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        if (onToast) onToast("Buddy stepped away. Next reminder soon!");
                      }}
                      className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      Skip
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-[#38BDF8]">
                    Stepping away now 👋 See you in 45m!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full text-center pb-2">
              <span className="text-xs font-mono text-slate-500">
                Click &ldquo;Preview Walk-In&rdquo; above to watch your buddy appear
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalkInPreview;
