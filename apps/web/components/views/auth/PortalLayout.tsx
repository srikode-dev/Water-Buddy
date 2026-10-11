"use client";

import React from 'react';
import { WebUser } from '@/types';
import {
  Droplet,
  LayoutDashboard,
  Users,
  Mail,
  CreditCard,
  Calendar,
  Sliders,
  Download,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { LiveClockTimezone } from '@/components/features/telemetry/LiveClockTimezone';

interface PortalLayoutProps {
  user: WebUser;
  activeSection: string;
  onSelectSection: (section: string) => void;
  onLogout: () => void;
  onNavigateTab: (tab: any) => void;
  children: React.ReactNode;
}

export function PortalLayout({
  user,
  activeSection,
  onSelectSection,
  onLogout,
  onNavigateTab,
  children
}: PortalLayoutProps) {
  const isOwner = user.role === 'admin';

  // Navigation Items for Owner Admin
  const ownerNavItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'Registered Users', icon: <Users className="w-4 h-4" /> },
    { id: 'inquiries', label: 'Customer Inquiries', icon: <Mail className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing & Licenses', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'personal-hydration', label: 'My Personal Intake', icon: <Droplet className="w-4 h-4" /> }
  ];

  // Navigation Items for Standard User (NO ADMIN ACCESS)
  const userNavItems = [
    { id: 'today', label: "Today's Water", icon: <Droplet className="w-4 h-4" /> },
    { id: 'schedule', label: 'Drink Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'biometrics', label: 'Biometrics & Goal', icon: <Sliders className="w-4 h-4" /> },
    { id: 'desktop-app', label: 'Windows 11 App', icon: <Download className="w-4 h-4" /> }
  ];

  const currentNav = isOwner ? ownerNavItems : userNavItems;

  return (
    <div className="min-h-screen w-full bg-[#070F19] text-[#DBE3F3] font-sans antialiased flex">
      {/* ======================================================== */}
      {/* 1. FIXED LEFT SIDEBAR (w-64) */}
      {/* ======================================================== */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0C141F] border-r border-[#1E293B] z-50 flex flex-col justify-between p-5 select-none">
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-xl bg-[#38BDF8] flex items-center justify-center text-[#070F19] shadow-lg shadow-[#38BDF8]/20">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="font-bold text-white tracking-tight font-heading text-sm">
                WATER BUDDY
              </div>
              <div className="text-[11px] font-mono text-[#38BDF8] uppercase tracking-wider">
                {isOwner ? 'Owner Console' : 'Hydration Desk'}
              </div>
            </div>
          </div>

          {/* Role Status Capsule (NO SWITCHER TAB!) */}
          <div className="px-3 py-2 rounded-xl bg-[#141C27] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOwner ? 'bg-purple-400' : 'bg-emerald-400'} animate-pulse`} />
              <span className="text-xs font-mono font-bold text-white">
                {isOwner ? 'Owner / Admin' : 'Personal Hydration'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {isOwner ? 'Full Access' : user.plan?.includes('Pro') ? 'Pro' : 'Free'}
            </span>
          </div>

          {/* Navigation Menu (Role specific) */}
          <div className="flex flex-col gap-1">
            <span className="px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {isOwner ? 'Management Navigation' : 'Hydration Menu'}
            </span>
            <nav className="flex flex-col gap-1 mt-1">
              {currentNav.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectSection(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#38BDF8] text-[#070F19] font-bold shadow-md shadow-[#38BDF8]/15'
                        : 'text-slate-400 hover:text-white hover:bg-[#141C27]'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>Windows 11 Tray:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between text-xs px-1 pt-1">
            <button
              onClick={() => onNavigateTab('landing')}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer text-xs"
            >
              <span>Landing Site</span>
              <ExternalLink className="w-3 h-3 text-[#38BDF8]" />
            </button>
            <button
              onClick={onLogout}
              className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer text-xs"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN APPLICATION WORKSPACE (pl-64) */}
      {/* ======================================================== */}
      <div className="pl-64 w-full flex flex-col min-h-screen">
        {/* Single Simple Header (fixed top) */}
        <header className="fixed top-0 left-64 right-0 h-16 bg-[#0C141F]/95 backdrop-blur-xl z-40 flex items-center justify-between px-8 border-b border-[#1E293B]">
          {/* Left Title / Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-slate-400 uppercase">
              <span className="text-white font-bold">Water Buddy</span>
              <span className="mx-2 text-slate-600">/</span>
              <span className="text-[#38BDF8]">
                {currentNav.find((n) => n.id === activeSection)?.label || (isOwner ? 'Overview' : "Today's Water")}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141C27] border border-white/5 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Desktop Sync Active</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Live Clock & Timezone */}
            <LiveClockTimezone />

            {/* Profile Avatar Capsule */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/5">
              <div className="w-8 h-8 rounded-full bg-[#38BDF8] flex items-center justify-center text-[#070F19] font-bold font-mono text-xs shadow-md">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] font-mono text-slate-400 leading-tight">
                  {isOwner ? 'Administrator' : user.plan}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="pt-20 px-6 sm:px-8 pb-12 grow max-w-7xl w-full">
          {children}
        </main>

        {/* Single Simple Footer */}
        <footer className="border-t border-[#1E293B] py-4 px-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-2 bg-[#0C141F]">
          <div className="flex items-center gap-2">
            <Droplet className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Water Buddy Desktop Hydration Companion • Windows 11 Certified</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => onNavigateTab('landing')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Landing Page
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigateTab('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Support & FAQ
            </button>
            <span>•</span>
            <button
              onClick={onLogout}
              className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
