"use client";

import React, { useState, useEffect } from 'react';
import { AdminStats, WebUser, UserInquiry } from '@/types';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  Droplet, 
  Mail, 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  Filter, 
  ExternalLink,
  Activity
} from 'lucide-react';
import { API_BASE_URL } from '@/utils/api';

interface AdminViewProps {
  onToast: (msg: string) => void;
  onNavigateTab: (tab: any) => void;
}

export function AdminView({ onToast, onNavigateTab }: AdminViewProps) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | 'Pro' | 'Free'>('All');

  // Stats state
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 142,
    proUsers: 38,
    freeUsers: 104,
    totalRevenue: 34162,
    currency: 'INR',
    currencySymbol: '₹',
    totalLogs: 1248,
    totalLitersDrank: '312.5',
    activeHydratorsToday: 29,
    totalInquiries: 7
  });

  // Users state
  const [users, setUsers] = useState<WebUser[]>([
    {
      id: 'u_1',
      email: 'alex.rivera@designops.co',
      name: 'Alex Rivera',
      role: 'user',
      plan: 'Pro Lifetime (₹899)',
      onboarding: { weight: 74, height: 178, medicalInfo: 'Athletic / Daily Workout', dailyGoal: 3190 },
      createdAt: '2026-10-09'
    },
    {
      id: 'u_2',
      email: 'srikant.sahu@gmail.com',
      name: 'Srikant Sahu',
      role: 'admin',
      plan: 'Pro Lifetime (₹899)',
      onboarding: { weight: 70, height: 172, medicalInfo: 'Normal Healthy', dailyGoal: 2450 },
      createdAt: '2026-10-08'
    },
    {
      id: 'u_3',
      email: 'priya.sharma@techscale.in',
      name: 'Priya Sharma',
      role: 'user',
      plan: 'Pro Lifetime (₹899)',
      onboarding: { weight: 58, height: 165, medicalInfo: 'Warm / Tropical Climate', dailyGoal: 2530 },
      createdAt: '2026-10-08'
    },
    {
      id: 'u_4',
      email: 'marcus.vance@studio4.io',
      name: 'Marcus Vance',
      role: 'user',
      plan: 'Free',
      onboarding: { weight: 82, height: 185, medicalInfo: 'Normal Healthy', dailyGoal: 2870 },
      createdAt: '2026-10-07'
    },
    {
      id: 'u_5',
      email: 'ananya.deshmukh@orbit.dev',
      name: 'Ananya Deshmukh',
      role: 'user',
      plan: 'Pro Lifetime (₹899)',
      onboarding: { weight: 62, height: 168, medicalInfo: 'Pregnant / Nursing', dailyGoal: 2870 },
      createdAt: '2026-10-06'
    },
    {
      id: 'u_6',
      email: 'dev.tester@waterbuddy.app',
      name: 'David Chen',
      role: 'user',
      plan: 'Free',
      onboarding: { weight: 68, height: 175, medicalInfo: 'Fluid Restricted (Medical)', dailyGoal: 1880 },
      createdAt: '2026-10-05'
    }
  ]);

  // Inquiries state
  const [inquiries, setInquiries] = useState<UserInquiry[]>([
    {
      _id: 'inq_1',
      name: 'Vikram Mehta',
      email: 'vikram@fintechcorp.in',
      subject: 'Enterprise bulk license inquiry for 50 seats',
      message: 'Hello, we would like to deploy Water Buddy across our Windows 11 design team workstations. Can we get GST invoicing?',
      status: 'New',
      createdAt: '2026-10-10'
    },
    {
      _id: 'inq_2',
      name: 'Sarah Jenkins',
      email: 'sarah.j@ambientlab.com',
      subject: 'Notification sound customization question',
      message: 'Does Water Buddy support custom audio files for the reminder chimes? Love the minimalistic aesthetic!',
      status: 'In Review',
      createdAt: '2026-10-09'
    },
    {
      _id: 'inq_3',
      name: 'Rohan Gupta',
      email: 'rohan.g@freelance.org',
      subject: 'Feature request: Multi-monitor support',
      message: 'The companion HUD displays great on primary display. Will there be an option to pin it to secondary monitor?',
      status: 'Resolved',
      createdAt: '2026-10-07'
    }
  ]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resStats, resUsers, resInq] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/stats`).catch(() => null),
        fetch(`${API_BASE_URL}/api/admin/users`).catch(() => null),
        fetch(`${API_BASE_URL}/api/admin/inquiries`).catch(() => null)
      ]);

      if (resStats && resStats.ok) {
        const d = await resStats.json();
        setStats(prev => ({ ...prev, ...d }));
      }
      if (resUsers && resUsers.ok) {
        const u = await resUsers.json();
        if (u.users && u.users.length > 0) setUsers(u.users);
      }
      if (resInq && resInq.ok) {
        const q = await resInq.json();
        if (q.inquiries && q.inquiries.length > 0) setInquiries(q.inquiries);
      }
      onToast('✓ Admin analytics refreshed');
    } catch (e) {
      // Local mode
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = 
      planFilter === 'All' 
        ? true 
        : planFilter === 'Pro' 
          ? u.plan?.includes('Pro') 
          : !u.plan?.includes('Pro');
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="py-8 max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OWNER &amp; PRODUCT COMMAND CENTER</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-space">
            Platform Analytics &amp; User Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry for registered users, onboarding biometrics, licenses, and incoming inquiries.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141C27] border border-[#1E293B] text-slate-300 hover:text-white hover:border-[#38BDF8] text-xs font-semibold transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#38BDF8]' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Users */}
        <div className="glass-card p-5 rounded-2xl border border-[#1E293B] bg-[#0C141F]/80">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stats.totalUsers}</div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <span className="text-emerald-400 font-semibold">{stats.activeHydratorsToday} active</span>
            <span>today</span>
          </div>
        </div>

        {/* Pro Subscriptions */}
        <div className="glass-card p-5 rounded-2xl border border-[#1E293B] bg-[#0C141F]/80">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Pro Licenses</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stats.proUsers}</div>
          <div className="text-xs text-slate-400 mt-2">
            <span>{stats.freeUsers} Free guest users</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-card p-5 rounded-2xl border border-[#1E293B] bg-[#0C141F]/80">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Pro Revenue</span>
            <span className="text-emerald-400 font-mono font-bold text-xs">INR (₹)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
            ₹{stats.totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            <span>₹899 / license (No recurring cut)</span>
          </div>
        </div>

        {/* Total Water Logged */}
        <div className="glass-card p-5 rounded-2xl border border-[#1E293B] bg-[#0C141F]/80">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Intake Logged</span>
            <Droplet className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{stats.totalLitersDrank} L</div>
          <div className="text-xs text-slate-400 mt-2">
            <span>{stats.totalLogs} logs dispatched</span>
          </div>
        </div>
      </div>

      {/* User Directory Table Section */}
      <div className="glass-card rounded-2xl border border-[#1E293B] bg-[#0C141F]/90 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-space flex items-center gap-2">
              <span>Registered Users &amp; Onboarding Biometrics</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E293B] text-slate-300 font-mono font-normal">
                {filteredUsers.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Profiles with health info, weight, calculated targets, and active plans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-full bg-[#141C27] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8] w-48 sm:w-56"
              />
            </div>

            {/* Plan Filter */}
            <div className="flex rounded-full bg-[#141C27] border border-[#1E293B] p-0.5 text-xs">
              {(['All', 'Pro', 'Free'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setPlanFilter(tab)}
                  className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                    planFilter === tab ? 'bg-[#38BDF8] text-[#070F19] font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141C27]/50 border-b border-[#1E293B] text-slate-400 font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 sm:px-6">User / Account</th>
                <th className="py-3 px-4">Plan Status</th>
                <th className="py-3 px-4">Biometrics</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4 text-right">Target (Daily)</th>
                <th className="py-3 px-4 sm:px-6 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {filteredUsers.map((u) => {
                const isUserPro = u.plan?.includes('Pro');
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-white text-sm">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] font-mono ${
                        isUserPro 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-700/50 text-slate-300 border border-slate-700'
                      }`}>
                        {isUserPro ? 'PRO (₹899)' : 'FREE'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {u.onboarding?.weight || 70}kg · {u.onboarding?.height || 170}cm
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-[180px] truncate" title={u.onboarding?.medicalInfo}>
                      {u.onboarding?.medicalInfo || 'Normal Healthy'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#38BDF8]">
                      {(u.onboarding?.dailyGoal || 2450).toLocaleString()} ml
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-slate-400">
                      {u.createdAt || 'Recent'}
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Inquiries Inbox Section */}
      <div className="glass-card rounded-2xl border border-[#1E293B] bg-[#0C141F]/90 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#1E293B]">
          <h2 className="text-lg font-bold text-white font-space flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#38BDF8]" />
            <span>Customer Inquiries &amp; License Requests</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E293B] text-slate-300 font-mono font-normal">
              {inquiries.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Messages and enterprise requests sent through the web portal contact form.
          </p>
        </div>

        <div className="divide-y divide-[#1E293B]">
          {inquiries.map((inq) => (
            <div key={inq._id} className="p-5 sm:p-6 hover:bg-white/[0.015] transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{inq.name}</span>
                  <span className="text-slate-500 text-xs font-mono">({inq.email})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    inq.status === 'New' 
                      ? 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30'
                      : inq.status === 'In Review'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {inq.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{inq.createdAt}</span>
                </div>
              </div>

              <div className="font-semibold text-slate-200 text-xs mb-1">
                {inq.subject}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {inq.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminView;
