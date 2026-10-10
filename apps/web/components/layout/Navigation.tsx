"use client";

import React, { useState } from 'react';
import { ActiveTab } from '@/types';
import { Volume2, VolumeX, Download } from 'lucide-react';
import { setAudioMuted, getAudioMuted } from '@/utils/audio';

export interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onDownloadClick: () => void;
  onAudioToggled?: (muted: boolean) => void;
}

export function Navigation({
  activeTab,
  onTabChange,
  onDownloadClick,
  onAudioToggled,
}: NavigationProps) {
  const [muted, setMuted] = useState(getAudioMuted());

  const toggleSound = () => {
    const nextMuted = !muted;
    setAudioMuted(nextMuted);
    setMuted(nextMuted);
    if (onAudioToggled) onAudioToggled(nextMuted);
  };

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'landing', label: 'Landing' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'pricing', label: 'Pricing (₹)' },
    { id: 'contact', label: 'Contact' },
    { id: 'design-system', label: 'UI Kit' },
  ];

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <div className="frosted-pill px-4 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center justify-between gap-3 sm:gap-6 md:gap-8 shadow-2xl pointer-events-auto border border-white/10 max-w-4xl w-full">
        {/* Brand Logo */}
        <button
          onClick={() => onTabChange('landing')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8] group-hover:scale-125 transition-transform" />
          <span className="font-semibold text-white tracking-tight text-sm">
            Water Buddy{' '}
            <span className="text-[10px] text-slate-400 font-mono font-normal">v2.4</span>
          </span>
        </button>

        {/* Interactive Router Switcher */}
        <nav className="flex items-center gap-1 text-xs text-slate-400 font-medium overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-white/15 font-medium shadow-sm'
                    : 'hover:text-white hover:bg-white/5 text-slate-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls & CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleSound}
            title={muted ? 'Unmute atmospheric sounds' : 'Mute atmospheric sounds'}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Toggle Sound"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#38bdf8]" />}
          </button>

          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            INR • WIN 11
          </span>

          <button
            onClick={onDownloadClick}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-white text-[#070f19] font-semibold text-xs hover:bg-slate-200 active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
            <span>.exe</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navigation;
