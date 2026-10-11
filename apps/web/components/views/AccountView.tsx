"use client";

import React from 'react';
import { WebUser } from '@/types';
import { ShieldCheck, Droplet, Download, RefreshCw, LogOut, CheckCircle2, User } from 'lucide-react';

interface AccountViewProps {
  user: WebUser;
  onLogout: () => void;
  onNavigateTab: (tab: any) => void;
  onToast: (msg: string) => void;
}

export function AccountView({ user, onLogout, onNavigateTab, onToast }: AccountViewProps) {
  const isPro = user.plan?.includes('Pro');

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-8">
      {/* User Header Capsule */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-[#1E293B] bg-[#0C141F]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center text-white text-xl font-bold font-space shadow-lg">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white font-space">{user.name}</h1>
              {user.role === 'admin' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 border border-purple-500/40 text-purple-300 font-semibold">
                  OWNER / ADMIN
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <button
              onClick={() => onNavigateTab('admin')}
              className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-all cursor-pointer"
            >
              Open Owner Dashboard ↗
            </button>
          )}

          <button
            onClick={() => {
              onLogout();
              onToast('Signed out of your account.');
              onNavigateTab('landing');
            }}
            className="px-4 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Subscription & Biometrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan & License Card */}
        <div className="glass-card p-6 rounded-2xl border border-[#1E293B] bg-[#0C141F]/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider">Active License</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              isPro ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
            }`}>
              {isPro ? '✓ Pro Lifetime (₹899)' : 'Free Tier'}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white font-space">
              {isPro ? 'Lifetime Ownership Unlocked' : 'Local Free Mode'}
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              {isPro 
                ? 'Your desktop widget synchronizes biometrics and hydration logs across all machines automatically.' 
                : 'Upgrade to Pro Lifetime (₹899) anytime to unlock cross-device cloud sync and the full character suite.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141C27] border border-[#1E293B] flex items-center justify-between text-xs">
            <span className="text-slate-400">Cloud Sync Status</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {isPro ? 'Active & Synced' : 'Ready (Local)'}
            </span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('pricing')}
              className="w-full py-2.5 rounded-full border border-[#1E293B] text-slate-300 text-xs font-medium hover:border-[#38BDF8] hover:text-[#38BDF8] transition-all cursor-pointer"
            >
              {isPro ? 'View License Details' : 'Upgrade to Pro Lifetime (₹899) ↗'}
            </button>
          </div>
        </div>

        {/* Onboarding Health Biometrics */}
        <div className="glass-card p-6 rounded-2xl border border-[#1E293B] bg-[#0C141F]/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider">Health Biometrics</span>
            <Droplet className="w-4 h-4 text-[#38BDF8]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#141C27] border border-[#1E293B]">
              <span className="text-[11px] text-slate-400 block">Weight</span>
              <span className="text-base font-bold text-white font-mono">{user.onboarding?.weight || 70} kg</span>
            </div>

            <div className="p-3 rounded-xl bg-[#141C27] border border-[#1E293B]">
              <span className="text-[11px] text-slate-400 block">Height</span>
              <span className="text-base font-bold text-white font-mono">{user.onboarding?.height || 170} cm</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#141C27] border border-[#1E293B]">
            <span className="text-[11px] text-slate-400 block">Health &amp; Activity Condition</span>
            <span className="text-sm font-semibold text-white">{user.onboarding?.medicalInfo || 'Normal Healthy'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#38BDF8] font-mono uppercase block">Daily Water Target</span>
              <span className="text-xs text-slate-400">Calculated biometrics</span>
            </div>
            <span className="text-xl font-bold text-white font-mono">
              {(user.onboarding?.dailyGoal || 2450).toLocaleString()} ml
            </span>
          </div>
        </div>
      </div>

      {/* Desktop App Link Capsule */}
      <div className="glass-card p-6 rounded-2xl border border-[#1E293B] bg-[#0C141F] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white text-base font-space">Windows 11 Desktop Companion</h4>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with this account inside the desktop app settings to link your daily intake seamlessly.
          </p>
        </div>
        <a
          href="https://github.com/srikode-dev/Water-Buddy/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#070F19] text-xs font-bold hover:bg-slate-200 transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download for Windows</span>
        </a>
      </div>
    </div>
  );
}

export default AccountView;
