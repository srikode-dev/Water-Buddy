"use client";

import React, { useState, useEffect } from 'react';
import { WebUser, AdminStats, UserInquiry } from '@/types';
import {
  Users,
  CreditCard,
  Droplet,
  Mail,
  Search,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  DollarSign
} from 'lucide-react';

interface AdminConsoleProps {
  user: WebUser;
  activeSection: string;
  onToast: (msg: string) => void;
  onNavigateTab: (tab: any) => void;
}

export function AdminConsole({ user, activeSection, onToast, onNavigateTab }: AdminConsoleProps) {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    proUsers: 0,
    freeUsers: 0,
    totalRevenue: 0,
    currency: 'INR',
    currencySymbol: '₹',
    totalLogs: 0,
    totalLitersDrank: '0.0',
    activeHydratorsToday: 0,
    totalInquiries: 0
  });

  const [users, setUsers] = useState<WebUser[]>([]);
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<'All' | 'Pro' | 'Free'>('All');
  const [loading, setLoading] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(true);

  useEffect(() => {
    fetchBackendData();
  }, []);

  const fetchBackendData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, inqRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/stats'),
        fetch('http://localhost:5000/api/admin/users'),
        fetch('http://localhost:5000/api/admin/inquiries')
      ]);

      if (sRes.ok) {
        const sData = await sRes.json();
        setStats(sData);
      }
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData.users || []);
      }
      if (inqRes.ok) {
        const inqData = await inqRes.json();
        setInquiries(inqData.inquiries || []);
      }
    } catch (e) {
      console.warn('Failed to fetch real data from backend', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan =
      filterPlan === 'All'
        ? true
        : filterPlan === 'Pro'
        ? u.plan?.includes('Pro')
        : u.plan === 'Free';
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-8">
      {/* SECTION: OVERVIEW */}
      {(activeSection === 'overview' || !activeSection) && (
        <div className="space-y-8">
          {/* Top Welcome Banner */}
          <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase tracking-wider mb-1">
                <span>👑 Owner Control Center</span>
                <span>•</span>
                <span className="text-emerald-400">Live Server Status: Active</span>
              </div>
              <h1 className="text-2xl font-bold text-white font-heading">
                Platform Performance & Analytics
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Overview of user hydration activity, perpetual licenses, and support requests.
              </p>
            </div>
            <button
              onClick={fetchBackendData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141C27] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-white/5 text-xs font-mono transition-all cursor-pointer w-fit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
          </div>

          {/* 4 KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Registered Users */}
            <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-5 hover:border-[#38BDF8]/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider">Total Users</span>
                <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white font-heading">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 mt-2 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{stats.proUsers} Pro Lifetime • {stats.freeUsers} Free</span>
              </div>
            </div>

            {/* 2. Total License Revenue */}
            <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-5 hover:border-[#38BDF8]/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider">License Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white font-heading">
                ₹{stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-2 font-mono">
                ₹899 one-time perpetual license
              </div>
            </div>

            {/* 3. Active Hydrators Today */}
            <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-5 hover:border-[#38BDF8]/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider">Active Today</span>
                <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
                  <Droplet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white font-heading">
                {stats.activeHydratorsToday}
              </div>
              <div className="text-xs text-slate-400 mt-2 font-mono">
                Logged water in last 24 hours
              </div>
            </div>

            {/* 4. Total Liters Drank */}
            <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-5 hover:border-[#38BDF8]/40 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider">Total Water Logged</span>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white font-heading">
                {stats.totalLitersDrank} L
              </div>
              <div className="text-xs text-slate-400 mt-2 font-mono">
                Across {stats.totalLogs.toLocaleString()} recorded sips
              </div>
            </div>
          </div>

          {/* Today's Hydration Activity Hourly Chart */}
          <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Hourly Water Intake Activity (Today)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aggregate volume logged across all active hydrators through the workday.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                <span>Intake Curve (ml)</span>
              </div>
            </div>

            {/* SVG Hourly Activity Curve */}
            <div className="w-full h-48 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="adminChartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal grid lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="#1E293B" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="800" y2="80" stroke="#1E293B" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="800" y2="120" stroke="#1E293B" strokeDasharray="4 4" />

                {/* Area fill */}
                <polygon
                  fill="url(#adminChartFill)"
                  points="0,150 50,130 120,105 200,70 280,85 360,50 440,65 520,35 600,60 680,45 750,75 800,150"
                />
                {/* Stroke line */}
                <polyline
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  points="0,150 50,130 120,105 200,70 280,85 360,50 440,65 520,35 600,60 680,45 750,75 800,150"
                />
              </svg>

              {/* X-Axis Time Labels */}
              <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-3">
                <span>9:00 AM</span>
                <span>10:30 AM</span>
                <span>12:00 PM</span>
                <span>1:30 PM</span>
                <span>3:00 PM</span>
                <span>4:30 PM</span>
                <span>6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Preview Split: Recent Users + Recent Inquiries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Registered Users */}
            <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white font-heading">
                  Recent Hydrators
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {users.length} registered
                </span>
              </div>
              <div className="space-y-2.5">
                {users.slice(0, 4).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#141C27] border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-bold text-xs font-mono">
                        {u.name ? u.name[0] : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {u.plan}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Goal: {u.onboarding?.dailyGoal || 2500} ml
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Inquiries */}
            <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white font-heading">
                  Customer Messages
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {inquiries.length} inquiries
                </span>
              </div>
              <div className="space-y-2.5">
                {inquiries.slice(0, 3).map((inq, idx) => (
                  <div
                    key={inq._id || idx}
                    className="p-3 rounded-xl bg-[#141C27] border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{inq.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{inq.createdAt}</span>
                    </div>
                    <div className="text-xs text-[#38BDF8] font-medium">{inq.subject}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{inq.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: USERS */}
      {activeSection === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white font-heading">
                Registered Users Directory
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Manage registered accounts, daily hydration goals, and plans.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user or email..."
                  className="bg-[#141C27] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#38BDF8] outline-none font-mono"
                />
              </div>
              {/* Plan Filter */}
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value as any)}
                className="bg-[#141C27] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono cursor-pointer"
              >
                <option value="All">All Plans</option>
                <option value="Pro">Pro Lifetime</option>
                <option value="Free">Free Starter</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141C27] border-b border-[#1E293B] text-slate-400 font-mono uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Daily Water Goal</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#141C27]/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center font-bold text-[11px] font-mono">
                          {u.name ? u.name[0] : 'U'}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{u.email}</td>
                      <td className="py-3 px-4 text-sky-400 font-mono font-bold">
                        {u.onboarding?.dailyGoal || 2500} ml / day
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                          u.plan?.includes('Pro')
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{u.createdAt || '2026-10-09'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                            : 'bg-white/5 text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: INQUIRIES */}
      {activeSection === 'inquiries' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Customer Support Inquiries
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Messages received from website contact and enterprise inquiries.
            </p>
          </div>

          <div className="space-y-4">
            {inquiries.map((inq, idx) => (
              <div
                key={inq._id || idx}
                className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-5 hover:border-[#38BDF8]/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{inq.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{inq.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">{inq.createdAt}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                      inq.status === 'Resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {inq.status}
                    </span>
                  </div>
                </div>

                <div className="bg-[#141C27] rounded-xl p-3 border border-white/5">
                  <div className="text-xs font-bold text-[#38BDF8] mb-1">{inq.subject}</div>
                  <div className="text-xs text-slate-300 leading-relaxed">{inq.message}</div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <a
                    href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#38BDF8] text-[#070F19] text-xs font-bold hover:bg-sky-300 transition-all cursor-pointer"
                  >
                    <span>Reply via Email</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: PRICING */}
      {activeSection === 'pricing' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Pricing & License Configuration
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Configure product license price, GST breakdown, and perks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Box */}
            <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider">
                    Product License
                  </div>
                  <h3 className="text-xl font-bold text-white font-heading mt-0.5">
                    Pro Lifetime License
                  </h3>
                </div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  ₹899
                </div>
              </div>

              {/* GST Toggle */}
              <div className="p-4 rounded-xl bg-[#141C27] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Include 18% GST Calculation</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Standard commercial invoice breakdown for India
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGstEnabled(!gstEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    gstEnabled ? 'bg-[#38BDF8]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      gstEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2 text-xs font-mono text-slate-300 border-t border-white/5 pt-4">
                <div className="flex justify-between">
                  <span>Base License (Perpetual):</span>
                  <span>₹899.00</span>
                </div>
                {gstEnabled && (
                  <div className="flex justify-between text-slate-400">
                    <span>GST @ 18% (CGST 9% + SGST 9%):</span>
                    <span>₹161.82</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-white/5">
                  <span>Total Payable:</span>
                  <span className="text-[#38BDF8]">
                    {gstEnabled ? '₹1,060.82' : '₹899.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Included Features Checklist */}
            <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white font-heading">
                Included with Pro Lifetime License
              </h3>
              <div className="space-y-3">
                {[
                  'Windows 11 Native Taskbar Tray Companion Widget',
                  'Unlimited Adaptive Biometric Goal Calculations',
                  'Gentle Icelandic Sound Chimes Notification Engine',
                  'Offline Local SQLite Vault with zero data tracking',
                  'Lifetime updates & free future feature releases',
                  'Full cross-device web portal synchronization'
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
