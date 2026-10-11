"use client";

import React, { useState, useEffect } from 'react';
import { WebUser, AdminStats, UserInquiry, PricingConfig, FeatureItem } from '@/types';
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
  DollarSign,
  Plus,
  Trash2,
  Save,
  Check,
  Lock,
  Unlock,
  Sliders,
  RotateCcw,
  CheckSquare,
  Square,
  Layers,
  Filter,
  Info
} from 'lucide-react';

const DEFAULT_ADMIN_FEATURES: FeatureItem[] = [
  {
    id: "tray_companion",
    name: "Windows 11 Tray Companion HUD",
    description: "Silent taskbar companion with real-time circular progress gauge and intake display.",
    includedInFree: true,
    includedInPro: true,
    category: "Core Ergonomics"
  },
  {
    id: "biometrics_goal",
    name: "Scientific Biometric Target Calibrator",
    description: "Calculates personalized daily hydration requirements based on mass, height, and activity tier.",
    includedInFree: true,
    includedInPro: true,
    category: "Core Ergonomics"
  },
  {
    id: "offline_sqlite_vault",
    name: "100% Offline Local SQLite Storage",
    description: "Stores logs and streaks entirely on your local machine with zero external network tracking.",
    includedInFree: true,
    includedInPro: true,
    category: "Privacy & Storage"
  },
  {
    id: "standard_reminder_cycles",
    name: "Standard Periodic Reminder Cycles",
    description: "Flexible desk hydration prompts with standard audio chime tones.",
    includedInFree: true,
    includedInPro: true,
    category: "Core Ergonomics"
  },
  {
    id: "adaptive_sip_pacing",
    name: "Adaptive Dynamic Sip Pacing",
    description: "Dynamically scales suggested intake volumes throughout the day based on remaining goal hours.",
    includedInFree: true,
    includedInPro: true,
    category: "Smart Hydration"
  },
  {
    id: "custom_icelandic_chimes",
    name: "Icelandic Chime Sound Library",
    description: "Gentle acoustic mineral chimes and customizable desktop reminder audio themes.",
    includedInFree: true,
    includedInPro: true,
    category: "Audio & Ambiance"
  },
  {
    id: "quiet_hours_dnd",
    name: "Do Not Disturb & Game Mode Suppressor",
    description: "Automatically silences prompts during focus sessions, calendar meetings, and full-screen games.",
    includedInFree: true,
    includedInPro: true,
    category: "Smart Hydration"
  },
  {
    id: "cloud_multi_device_sync",
    name: "Cross-Device Cloud Synchronization",
    description: "Real-time sync of hydration logs and preferences across multiple laptops and web dashboards.",
    includedInFree: true,
    includedInPro: true,
    category: "Cloud & Sync"
  },
  {
    id: "perpetual_analytics_history",
    name: "Perpetual History & Weekly Analytics",
    description: "Historical water logs with hourly aggregate intake curves and streak milestones.",
    includedInFree: true,
    includedInPro: true,
    category: "Cloud & Sync"
  },
  {
    id: "data_export_csv",
    name: "CSV & JSON Telemetry Data Export",
    description: "Export comprehensive hydration records for spreadsheet analysis and medical records.",
    includedInFree: true,
    includedInPro: true,
    category: "Privacy & Storage"
  },
  {
    id: "whatsapp_bot_reminders",
    name: "WhatsApp Bot Reminders & Chat Intake Logging",
    description: "Personal AI hydration bot sending timely WhatsApp prompts with 1-click message logging.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  },
  {
    id: "health_apps_sync",
    name: "Apple Health & Google Health Connect Sync",
    description: "Automated background sync of water intake telemetry with Apple Health & Google Health Connect.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  },
  {
    id: "exclusive_mobile_app",
    name: "Exclusive Mobile Companion App (iOS & Android)",
    description: "Exclusive access to the upcoming native companion smartphone app with lock-screen widgets.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  },
  {
    id: "priority_cloud_api",
    name: "Priority Cloud Webhooks & Integrations API",
    description: "Developer webhook triggers, custom integration endpoints, and zero-latency priority cloud pipelines.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  }
];

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
    totalInquiries: 0,
    hourlyActivity: [
      { label: '9:00 AM', volume: 0 },
      { label: '10:30 AM', volume: 0 },
      { label: '12:00 PM', volume: 0 },
      { label: '1:30 PM', volume: 0 },
      { label: '3:00 PM', volume: 0 },
      { label: '4:30 PM', volume: 0 },
      { label: '6:00 PM', volume: 0 }
    ]
  });

  const [users, setUsers] = useState<WebUser[]>([]);
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);

  // Real Customizable Pricing state from backend
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    planName: 'Pro Supporter Plan',
    editionName: 'WhatsApp & Cloud Edition',
    freePlanName: 'Community Edition (All Desktop Features)',
    price: 89,
    billingInterval: 'month',
    currency: 'INR',
    currencySymbol: '₹',
    gstPercent: 18,
    features: DEFAULT_ADMIN_FEATURES
  });

  const [featureCategoryFilter, setFeatureCategoryFilter] = useState<string>('All');
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');
  const [newFeatureCategory, setNewFeatureCategory] = useState('Smart Hydration');
  const [newFeatureInFree, setNewFeatureInFree] = useState(false);
  const [newFeatureInPro, setNewFeatureInPro] = useState(true);
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<'All' | 'Pro' | 'Free'>('All');
  const [loading, setLoading] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(true);

  useEffect(() => {
    fetchBackendData();
    fetchPricingConfig();
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

  const fetchPricingConfig = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/pricing');
      if (res.ok) {
        const data = await res.json();
        if (data.pricing) {
          let feats = data.pricing.features || [];
          if (!Array.isArray(feats) || feats.length === 0 || typeof feats[0] === 'string') {
            feats = DEFAULT_ADMIN_FEATURES;
          }
          setPricingConfig({
            ...data.pricing,
            freePlanName: data.pricing.freePlanName || 'Community Edition',
            features: feats
          });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch pricing config', e);
    }
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingConfig)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pricing) setPricingConfig(data.pricing);
        onToast('✓ Feature matrix and pricing saved! Changes are now live on the pricing page and API guards.');
        fetchBackendData(); // Recalculate live license revenue KPI
      } else {
        onToast('Failed to save pricing configuration');
      }
    } catch (e) {
      onToast('Error connecting to backend pricing endpoint');
    } finally {
      setSavingPricing(false);
    }
  };

  const handleToggleFeatureFree = (featureId: string) => {
    setPricingConfig((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === featureId ? { ...f, includedInFree: !f.includedInFree } : f
      )
    }));
  };

  const handleToggleFeaturePro = (featureId: string) => {
    setPricingConfig((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === featureId ? { ...f, includedInPro: !f.includedInPro } : f
      )
    }));
  };

  const handleRemoveFeatureById = (featureId: string) => {
    setPricingConfig((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== featureId)
    }));
    onToast('Feature removed from matrix. Click "Save Entitlements Matrix" to persist.');
  };

  const handleResetDefaultFeatures = async () => {
    if (!window.confirm('Reset all feature entitlements to factory defaults?')) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/pricing/reset-defaults', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.pricing) setPricingConfig(data.pricing);
        onToast('✓ Feature catalog restored to factory defaults!');
      }
    } catch (e) {
      onToast('Failed to reset features');
    }
  };

  const handleAddNewFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) {
      onToast('Please provide a feature name');
      return;
    }
    const slug = newFeatureName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const exists = pricingConfig.features.some((f) => f.id === slug);
    if (exists) {
      onToast('A feature with this identifier or name already exists in the catalog.');
      return;
    }

    const newFeature: FeatureItem = {
      id: slug,
      name: newFeatureName.trim(),
      description: newFeatureDesc.trim() || `${newFeatureName.trim()} capability.`,
      category: newFeatureCategory,
      includedInFree: newFeatureInFree,
      includedInPro: newFeatureInPro
    };

    setPricingConfig((prev) => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));

    setNewFeatureName('');
    setNewFeatureDesc('');
    setNewFeatureInFree(false);
    setNewFeatureInPro(true);
    setShowAddFeatureModal(false);
    onToast(`✓ Added "${newFeature.name}" to draft matrix. Click "Save Entitlements Matrix" to persist.`);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan =
      filterPlan === 'All'
        ? true
        : filterPlan === 'Pro'
        ? u.plan?.toLowerCase().includes('pro')
        : !u.plan?.toLowerCase().includes('pro');
    return matchesSearch && matchesPlan;
  });

  // Calculate dynamic SVG curve points from backend hourly activity
  const maxVol = Math.max(1, ...(stats.hourlyActivity?.map((h) => h.volume) || [1000]));
  const chartPoints = (stats.hourlyActivity || []).map((h, i) => {
    const totalSlots = Math.max(1, (stats.hourlyActivity?.length || 7) - 1);
    const x = Math.round((i / totalSlots) * 800);
    const y = Math.round(145 - (h.volume / maxVol) * 115);
    return `${x},${y}`;
  });
  const pointsString = chartPoints.join(' ');
  const polygonPoints = `0,150 ${pointsString} 800,150`;

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
                <span className="text-emerald-400">Live Database Connected</span>
              </div>
              <h1 className="text-2xl font-bold text-white font-heading">
                Platform Performance & Analytics
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-time metrics for registered hydrators, perpetual licenses, and support messages.
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
                {stats.currencySymbol || '₹'}{stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-2 font-mono">
                {stats.currencySymbol || '₹'}{pricingConfig.price} one-time perpetual license
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

          {/* Today's Hydration Activity Hourly Chart (Real Database Aggregate) */}
          <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Hourly Water Intake Activity (Today)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aggregate intake volume logged across all hydrators from the MongoDB database.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                <span>Volume Drank (ml)</span>
              </div>
            </div>

            {/* Real SVG Hourly Activity Curve */}
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
                <polygon fill="url(#adminChartFill)" points={polygonPoints} />
                {/* Stroke line */}
                <polyline
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  points={pointsString}
                />
              </svg>

              {/* X-Axis Time Labels from Backend */}
              <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-3">
                {stats.hourlyActivity?.map((slot, idx) => (
                  <span key={idx}>{slot.label}</span>
                ))}
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
                {users.slice(0, 4).map((u, idx) => (
                  <div
                    key={u.id || u._id || `user-ov-${idx}`}
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
                  Customer Messages & Inquiries
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {inquiries.length} inquiries
                </span>
              </div>
              <div className="space-y-2.5">
                {inquiries.slice(0, 3).map((inq, idx) => (
                  <div
                    key={inq._id || inq.id || `inq-ov-${idx}`}
                    className="p-3 rounded-xl bg-[#141C27] border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{inq.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Today'}
                      </span>
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
                  {filteredUsers.map((u, idx) => (
                    <tr
                      key={u.id || u._id || `user-${idx}`}
                      className="hover:bg-[#141C27]/50 transition-colors"
                    >
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
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                            u.plan?.toLowerCase().includes('pro')
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {u.plan}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white font-heading">
                Customer Support Inquiries
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Live inquiries submitted via the public contact form and enterprise requests.
              </p>
            </div>
            <button
              onClick={fetchBackendData}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141C27] hover:bg-[#1E293B] text-slate-300 text-xs font-mono border border-white/5 cursor-pointer w-fit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Messages</span>
            </button>
          </div>

          <div className="space-y-4">
            {inquiries.length > 0 ? (
              inquiries.map((inq, idx) => (
                <div
                  key={inq._id || inq.id || `inq-${idx}`}
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
                      <span className="text-xs text-slate-500 font-mono">
                        {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'Just now'}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                          inq.status === 'Resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {inq.status || 'New'}
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
              ))
            ) : (
              <div className="p-8 text-center bg-[#0C141F] border border-dashed border-white/10 rounded-2xl">
                <Mail className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <div className="text-sm font-bold text-white">No inquiries yet</div>
                <p className="text-xs text-slate-400 mt-1">
                  Messages submitted through the public Contact page will appear right here in real time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION: PRICING & FEATURE CUSTOMIZATION */}
      {activeSection === 'pricing' && (
        <div className="space-y-8">
          {/* Header & KPI Summary */}
          <div className="bg-[#0C141F] border border-[#1E293B] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                    OWNER CONTROL PANEL
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    LIVE PRODUCTION ENFORCEMENT
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
                  Pricing & Feature Entitlements Matrix
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Total Owner control over perk availability. Independently toggle which capabilities and APIs are granted to 
                  <strong className="text-emerald-400 font-medium"> Free users</strong> versus <strong className="text-[#38BDF8] font-medium">Pro paid holders</strong>. Changes persist to MongoDB and guard APIs, Electron desktop app, and public pricing cards live.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetDefaultFeatures}
                  className="px-3.5 py-2.5 rounded-xl bg-[#141C27] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-white/10 text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer"
                  title="Restore factory default feature catalog"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFeatureModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#38BDF8]" />
                  <span>Add Feature / API</span>
                </button>
                <button
                  type="button"
                  onClick={handleSavePricing}
                  disabled={savingPricing}
                  className="px-5 py-2.5 rounded-xl bg-[#38BDF8] text-[#070F19] hover:bg-sky-300 active:scale-95 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#38BDF8]/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingPricing ? 'Saving Matrix...' : 'Save Entitlements Matrix'}</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
              <div className="p-3.5 rounded-2xl bg-[#141C27]/80 border border-white/5">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Total Catalog Perks</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {pricingConfig.features.length}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141C27]/80 border border-white/5">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Community (Free) Perks</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  {pricingConfig.features.filter((f) => f.includedInFree).length} Active
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141C27]/80 border border-white/5">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Pro Supporter Perks</div>
                <div className="text-xl font-bold font-mono text-[#38BDF8] mt-0.5">
                  {pricingConfig.features.filter((f) => f.includedInPro).length} Active
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#141C27]/80 border border-white/5">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Pro-Exclusive Only</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                  {pricingConfig.features.filter((f) => f.includedInPro && !f.includedInFree).length} Paywalled
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Tier Setup Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Plan Tier Labels */}
            <div className="lg:col-span-6 bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                  Tier Names & Product Branding
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">
                    Free Plan Title
                  </label>
                  <input
                    type="text"
                    value={pricingConfig.freePlanName || 'Community Edition'}
                    onChange={(e) =>
                      setPricingConfig((prev) => ({ ...prev, freePlanName: e.target.value }))
                    }
                    className="w-full bg-[#141C27] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#38BDF8] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">
                    Pro Plan Title
                  </label>
                  <input
                    type="text"
                    value={pricingConfig.planName}
                    onChange={(e) =>
                      setPricingConfig((prev) => ({ ...prev, planName: e.target.value }))
                    }
                    className="w-full bg-[#141C27] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#38BDF8] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Pro Edition Marketing Label
                </label>
                <input
                  type="text"
                  value={pricingConfig.editionName}
                  onChange={(e) =>
                    setPricingConfig((prev) => ({ ...prev, editionName: e.target.value }))
                  }
                  className="w-full bg-[#141C27] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#38BDF8] outline-none font-mono"
                />
              </div>
            </div>

            {/* License Fee & GST Breakdown */}
            <div className="lg:col-span-6 bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                  Pro Plan Pricing & Frequency
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">
                    Pro Fee (INR ₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2 text-slate-400 font-mono text-sm font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="99999"
                      step="10"
                      value={pricingConfig.price}
                      onChange={(e) =>
                        setPricingConfig((prev) => ({
                          ...prev,
                          price: parseInt(e.target.value, 10) || 0
                        }))
                      }
                      className="w-full bg-[#141C27] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:border-[#38BDF8] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">
                    Billing Interval
                  </label>
                  <select
                    value={pricingConfig.billingInterval || 'month'}
                    onChange={(e) =>
                      setPricingConfig((prev) => ({
                        ...prev,
                        billingInterval: e.target.value
                      }))
                    }
                    className="w-full bg-[#141C27] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#38BDF8] outline-none font-mono"
                  >
                    <option value="month">Monthly (/ month)</option>
                    <option value="year">Yearly (/ year)</option>
                    <option value="one-time">One-Time (Lifetime)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141C27] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">18% GST Calculation</div>
                  <div className="text-[10px] text-slate-400">CGST 9% + SGST 9% tax breakdown</div>
                </div>
                <button
                  type="button"
                  onClick={() => setGstEnabled(!gstEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    gstEnabled ? 'bg-[#38BDF8]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                      gstEnabled ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-300 border-t border-white/5 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Pro Fee:</span>
                  <span>₹{pricingConfig.price.toFixed(2)} / {pricingConfig.billingInterval || 'month'}</span>
                </div>
                {gstEnabled && (
                  <div className="flex justify-between text-slate-400">
                    <span>18% GST (Input Tax Credit):</span>
                    <span>₹{(pricingConfig.price * 0.18).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white pt-1 border-t border-white/5">
                  <span>Consumer Checkout Total:</span>
                  <span className="text-[#38BDF8]">
                    ₹
                    {gstEnabled
                      ? (pricingConfig.price * 1.18).toFixed(2)
                      : pricingConfig.price.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-400">/ {pricingConfig.billingInterval || 'month'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Matrix Category Navigation & Quick Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-base font-bold text-white font-heading">
                  Feature Entitlements Matrix
                </h3>
                <span className="text-xs font-mono text-slate-400 ml-1">
                  ({pricingConfig.features.length} configured items)
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  'All',
                  'Core Ergonomics',
                  'Smart Hydration',
                  'Privacy & Storage',
                  'Audio & Ambiance',
                  'Cloud & Sync',
                  'Future Cloud Integrations'
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFeatureCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                      featureCategoryFilter === cat
                        ? 'bg-[#38BDF8] text-[#070F19] font-bold shadow-md shadow-[#38BDF8]/20'
                        : 'bg-[#0C141F] text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Table & Card List */}
            <div className="bg-[#0C141F] border border-[#1E293B] rounded-3xl overflow-hidden divide-y divide-white/5">
              {/* Matrix Table Header */}
              <div className="hidden md:grid grid-cols-12 px-6 py-4 bg-[#141C27]/90 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <div className="col-span-6">Feature Capability & Human-Readable Sentence</div>
                <div className="col-span-2 text-center">Community Free Tier</div>
                <div className="col-span-2 text-center">Pro Lifetime Tier</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Matrix Rows */}
              {pricingConfig.features
                .filter(
                  (f) =>
                    featureCategoryFilter === 'All' || f.category === featureCategoryFilter
                )
                .map((feature) => (
                  <div
                    key={feature.id}
                    className="p-5 md:px-6 md:py-4.5 grid grid-cols-1 md:grid-cols-12 items-center gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Feature Details */}
                    <div className="md:col-span-6 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white font-heading">
                          {feature.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                          {feature.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          #{feature.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Free Tier Switch */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatureFree(feature.id)}
                        className={`w-full max-w-[140px] py-1.5 px-3 rounded-full text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          feature.includedInFree
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
                        }`}
                        title={
                          feature.includedInFree
                            ? 'Click to disable for Free users'
                            : 'Click to enable for Free users'
                        }
                      >
                        {feature.includedInFree ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Free: Active</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Free: Locked</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Pro Tier Switch */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeaturePro(feature.id)}
                        className={`w-full max-w-[140px] py-1.5 px-3 rounded-full text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          feature.includedInPro
                            ? 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
                        }`}
                        title={
                          feature.includedInPro
                            ? 'Click to disable for Pro users'
                            : 'Click to enable for Pro users'
                        }
                      >
                        {feature.includedInPro ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                            <span>Pro: Active</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Pro: Locked</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveFeatureById(feature.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove perk from matrix"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Modal / Form to Add New Perk */}
          {showAddFeatureModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0C141F] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                      NEW CAPABILITY
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddFeatureModal(false)}
                      className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-white font-heading mt-1">
                    Add Feature or API to Catalog
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Define human-readable names and sentences. Configure whether this capability is included in Free or Pro tiers.
                  </p>
                </div>

                <form onSubmit={handleAddNewFeature} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Feature / API Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newFeatureName}
                      onChange={(e) => setNewFeatureName(e.target.value)}
                      placeholder="e.g. Apple Health & Google Fit Sync"
                      className="w-full bg-[#141C27] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#38BDF8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Descriptive Human-Readable Sentence *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={newFeatureDesc}
                      onChange={(e) => setNewFeatureDesc(e.target.value)}
                      placeholder="e.g. Automatically synchronizes hourly hydration telemetry with external mobile health aggregators."
                      className="w-full bg-[#141C27] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-[#38BDF8] outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Category
                    </label>
                    <select
                      value={newFeatureCategory}
                      onChange={(e) => setNewFeatureCategory(e.target.value)}
                      className="w-full bg-[#141C27] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#38BDF8] outline-none font-mono"
                    >
                      <option value="Core Ergonomics">Core Ergonomics</option>
                      <option value="Smart Hydration">Smart Hydration</option>
                      <option value="Privacy & Storage">Privacy & Storage</option>
                      <option value="Audio & Ambiance">Audio & Ambiance</option>
                      <option value="Cloud & Sync">Cloud & Sync</option>
                      <option value="Future Cloud Integrations">Future Cloud Integrations</option>
                      <option value="API & Integrations">API & Integrations</option>
                    </select>
                  </div>

                  {/* Initial Entitlement Checkboxes */}
                  <div className="pt-2 border-t border-white/5 space-y-3">
                    <span className="block text-xs font-mono text-slate-400">
                      Initial Tier Entitlements:
                    </span>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                        <input
                          type="checkbox"
                          checked={newFeatureInFree}
                          onChange={(e) => setNewFeatureInFree(e.target.checked)}
                          className="w-4 h-4 rounded accent-[#34D399] cursor-pointer"
                        />
                        <span>Included in Free Tier</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                        <input
                          type="checkbox"
                          checked={newFeatureInPro}
                          onChange={(e) => setNewFeatureInPro(e.target.checked)}
                          className="w-4 h-4 rounded accent-[#38BDF8] cursor-pointer"
                        />
                        <span>Included in Pro Tier</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowAddFeatureModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#070F19] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-[#38BDF8]/20 transition-all"
                    >
                      Add Perk to Matrix
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="sticky bottom-6 z-20 bg-[#0C141F]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-300">
                Matrix changes will immediately reconfigure client restrictions and the public pricing comparison page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSavePricing}
              disabled={savingPricing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#38BDF8] text-[#070F19] hover:bg-sky-300 active:scale-95 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#38BDF8]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingPricing ? 'Saving to Database...' : 'Save Entitlements Matrix'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminConsole;
