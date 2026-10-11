"use client";

import React, { useState } from 'react';
import { ActiveTab, WebUser } from '@/types';
import { Volume2, VolumeX, Download, Droplet, User, ShieldCheck } from 'lucide-react';
import { setAudioMuted, getAudioMuted } from '@/utils/audio';
import { LiveClockTimezone } from '@/components/features/telemetry/LiveClockTimezone';

export interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onDownloadClick: () => void;
  onAudioToggled?: (muted: boolean) => void;
  currentUser?: WebUser | null;
}

export function Navigation({
  activeTab,
  onTabChange,
  onDownloadClick,
  onAudioToggled,
  currentUser
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
    <header className="fixed top-3.5 sm:top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      {/* Single Unified Frosted Capsule */}
      <div className="frosted-pill pl-4 pr-3.5 sm:pl-5 sm:pr-4 h-12 rounded-full flex items-center justify-between gap-3 sm:gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto border border-white/10 max-w-5xl w-full">
        {/* Brand Logo */}
        <button
          onClick={() => onTabChange('landing')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center group-hover:border-[#38BDF8] transition-colors">
            <Droplet className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
          <span className="font-heading font-bold text-white tracking-tight text-sm">
            Water Buddy
          </span>
          <span className="hidden sm:inline-block text-[9px] text-[#38BDF8] font-mono bg-[#38BDF8]/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            Win 11
          </span>
        </button>

        {/* Tab Switcher */}
        <nav className="hidden md:flex items-center gap-1 text-xs text-slate-300 font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer text-xs ${
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

        {/* Right Controls: Telemetry Clock, Audio, Auth & Download */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Integrated Minimal Telemetry Clock */}
          <LiveClockTimezone variant="minimal" />

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none cursor-pointer shrink-0"
            aria-label="Toggle Sound"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />}
          </button>

          {/* Auth Button */}
          {currentUser ? (
            <button
              onClick={() => onTabChange('portal')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                activeTab === 'portal'
                  ? 'bg-[#38BDF8] text-[#070F19]'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="hidden xs:inline max-w-[80px] truncate">{currentUser.name?.split(' ')[0]}</span>
              {currentUser.role === 'admin' && (
                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono border border-purple-500/30">
                  Admin
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => onTabChange('auth')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                activeTab === 'auth'
                  ? 'bg-[#38BDF8] text-[#070F19] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Sign In</span>
            </button>
          )}

          {/* Download CTA */}
          <button
            onClick={onDownloadClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#070F19] font-bold text-xs hover:bg-slate-200 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navigation;
