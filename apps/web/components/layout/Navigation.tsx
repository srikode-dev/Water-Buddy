"use client";

import React, { useState } from 'react';
import { ActiveTab } from '@/types';
import { Volume2, VolumeX, Download, Droplet } from 'lucide-react';
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
    { id: 'landing', label: 'Overview' },
    { id: 'architecture', label: 'How It Works' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-3 sm:px-4">
      <div className="frosted-pill px-4 sm:px-6 py-2.5 rounded-full flex items-center justify-between gap-3 sm:gap-6 shadow-2xl pointer-events-auto border border-white/10 max-w-3xl w-full">
        {/* Brand Logo */}
        <button
          onClick={() => onTabChange('landing')}
          className="flex items-center gap-2 text-left group shrink-0 focus:outline-none cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-[#0C141F] border border-white/10 flex items-center justify-center group-hover:border-[#38BDF8] transition-colors">
            <Droplet className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">
            Water Buddy
          </span>
          <span className="hidden sm:inline-block text-[10px] text-[#38BDF8] font-mono bg-[#38BDF8]/10 px-2 py-0.5 rounded-full border border-[#38BDF8]/20 font-bold">
            Windows
          </span>
        </button>

        {/* Tab Switcher */}
        <nav className="flex items-center gap-1 text-xs text-slate-300 font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-white bg-white/15 font-semibold shadow-sm'
                    : 'hover:text-white hover:bg-white/5 text-slate-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls & Download */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleSound}
            title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle Sound"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#38BDF8]" />}
          </button>

          <button
            onClick={onDownloadClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#070f19] font-semibold text-xs hover:bg-slate-200 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Download</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navigation;
