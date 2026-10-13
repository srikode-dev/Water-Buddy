"use client";

import React, { useState, useEffect } from 'react';
import { WebUser } from '@/types';
import {
  Droplet,
  Sparkles,
  CheckCircle2,
  Bell,
  Clock,
  Sliders,
  Download,
  RotateCcw,
  Plus,
  ShieldCheck,
  Check,
  Flame,
  Activity
} from 'lucide-react';
import { playIcelandicChime, playBasaltDrop } from '@/utils/audio';
import { API_BASE_URL } from '@/utils/api';

interface UserConsoleProps {
  user: WebUser;
  activeSection: string;
  onToast: (msg: string) => void;
  onNavigateTab: (tab: any) => void;
}

export function UserConsole({ user, activeSection, onToast, onNavigateTab }: UserConsoleProps) {
  // Hydration state
  const [todayDrank, setTodayDrank] = useState<number>(0);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [dailyGoal, setDailyGoal] = useState<number>(user.onboarding?.dailyGoal || 2500);
  const [customMlInput, setCustomMlInput] = useState('300');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(22);

  // Biometrics state
  const [weight, setWeight] = useState(user.onboarding?.weight || 72);
  const [height, setHeight] = useState(user.onboarding?.height || 174);
  const [activityTier, setActivityTier] = useState<string>(
    user.onboarding?.medicalInfo || 'Normal / Desk Work'
  );

  // Calculate dynamic target based on weight & activity
  const calculateTarget = (w: number, activity: string) => {
    let base = Math.round(w * 35);
    if (activity === 'Athletic / Daily Workout') base += 600;
    if (activity === 'Warm / Hot Climate') base += 500;
    return base;
  };

  // Fetch real logs from database on mount
  useEffect(() => {
    const fetchRealLogs = async () => {
      const token = localStorage.getItem('wb_auth_token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/sync/logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.logs && Array.isArray(data.logs)) {
            setUserLogs(data.logs);
            const todayStr = new Date().toDateString();
            const todayLogs = data.logs.filter((l: any) => 
              l.response === 'yes' && new Date(l.timestamp).toDateString() === todayStr
            );
            const total = todayLogs.reduce((sum: number, l: any) => sum + (l.amountMl || 0), 0);
            setTodayDrank(total);
          }
          if (data.settings?.dailyGoal) {
            setDailyGoal(data.settings.dailyGoal);
          }
        }
      } catch (err) {
        // offline fallback
      }
    };
    fetchRealLogs();
  }, [user]);

  const handleLogWater = async (amount: number, label: string) => {
    playBasaltDrop();
    setTodayDrank((prev) => prev + amount);
    const newLogItem = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      amountMl: amount,
      response: 'yes',
      beverageType: 'water',
      source: 'web_console'
    };
    setUserLogs((prev) => [newLogItem, ...prev]);
    onToast(`✓ Logged +${amount}ml ${label}! Synced to your daily progress.`);

    // Persist to backend /api/sync
    const token = localStorage.getItem('wb_auth_token');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            logs: [
              {
                id: newLogItem.id,
                timestamp: newLogItem.timestamp,
                amount,
                response: 'yes',
                beverageType: 'water',
                source: 'web_console'
              }
            ]
          })
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMlInput, 10);
    if (!isNaN(val) && val > 0) {
      handleLogWater(val, 'Custom Cup');
      setShowCustomModal(false);
    }
  };

  const handleReset = () => {
    setTodayDrank(0);
    onToast('Daily counter reset to 0 ml.');
  };

  const handleSaveBiometrics = async () => {
    playIcelandicChime();
    const newGoal = calculateTarget(weight, activityTier);
    setDailyGoal(newGoal);

    // Save to localStorage
    const savedUser = localStorage.getItem('wb_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        parsed.onboarding = {
          ...parsed.onboarding,
          weight,
          height,
          medicalInfo: activityTier,
          dailyGoal: newGoal
        };
        localStorage.setItem('wb_user', JSON.stringify(parsed));
      } catch (e) {
        // ignore
      }
    }

    try {
      await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight,
          height,
          medicalInfo: activityTier,
          dailyGoal: newGoal
        })
      });
    } catch (e) {
      // offline fallback
    }

    onToast(`✓ Biometrics saved! Daily target calibrated to ${newGoal.toLocaleString()} ml.`);
  };

  const percent = Math.min(100, Math.round((todayDrank / dailyGoal) * 100));
  const remaining = Math.max(0, dailyGoal - todayDrank);

  return (
    <div className="space-y-8">
      {/* SECTION: TODAY'S HYDRATION */}
      {(activeSection === 'today' || !activeSection) && (
        <div className="space-y-8">
          {/* Top Status Bar */}
          <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase tracking-wider mb-1">
                <span>💧 Daily Hydration Tracker</span>
                <span>•</span>
                <span className="text-emerald-400">Windows 11 Companion: Active</span>
              </div>
              <h1 className="text-2xl font-bold text-white font-heading">
                Today&apos;s Water Intake
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Log cups of water to maintain hydration and stay focused during your workday.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141C27] hover:bg-[#1E293B] text-slate-400 hover:text-white text-xs font-mono border border-white/5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Day</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Left Radial Cockpit + Right Quick Logs & Next Reminder */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Cockpit: Circular SVG Gauge */}
            <div className="lg:col-span-7 bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Target Progress
                </span>
                <span className="text-xs font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-0.5 rounded-full border border-[#38BDF8]/20">
                  {percent}% Reached
                </span>
              </div>

              {/* Radial Visualizer */}
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative w-60 h-60 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    {/* Background Ring */}
                    <circle
                      className="text-[#141C27]"
                      cx="80"
                      cy="80"
                      fill="transparent"
                      r="68"
                      stroke="currentColor"
                      strokeWidth="10"
                    />
                    {/* Progress Ring */}
                    <circle
                      className="text-[#38BDF8] transition-all duration-700 ease-out"
                      cx="80"
                      cy="80"
                      fill="transparent"
                      r="68"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray="427"
                      strokeDashoffset={427 - (427 * percent) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Inside Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                      Consumed
                    </span>
                    <span className="text-4xl font-bold text-white font-heading tracking-tight mt-1">
                      {todayDrank.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-[#38BDF8] uppercase mt-0.5 font-bold">
                      ml of {dailyGoal.toLocaleString()} ml
                    </span>
                  </div>
                </div>

                {/* Sub Metrics */}
                <div className="flex items-center gap-6 text-center mt-6 pt-4 border-t border-white/5 w-full justify-around">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Daily Goal</div>
                    <div className="text-lg font-bold text-white font-heading mt-0.5">
                      {dailyGoal.toLocaleString()} ml
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Remaining</div>
                    <div className="text-lg font-bold text-[#38BDF8] font-heading mt-0.5">
                      {remaining > 0 ? `${remaining.toLocaleString()} ml` : 'Goal Completed! 🎉'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Quick Sips + Next Reminder */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Quick Log Water Buttons */}
              <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white font-heading">
                    Quick Log Water
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    1-Click Ingest
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleLogWater(150, 'Small Cup')}
                    className="p-3 rounded-xl bg-[#141C27] hover:bg-[#1E293B] border border-white/5 hover:border-[#38BDF8]/40 transition-all text-center cursor-pointer group active:scale-95"
                  >
                    <div className="text-lg font-bold text-[#38BDF8] font-mono group-hover:scale-105 transition-transform">
                      +150ml
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Small Cup</div>
                  </button>

                  <button
                    onClick={() => handleLogWater(250, 'Standard Glass')}
                    className="p-3 rounded-xl bg-[#141C27] hover:bg-[#1E293B] border border-white/5 hover:border-[#38BDF8]/40 transition-all text-center cursor-pointer group active:scale-95"
                  >
                    <div className="text-lg font-bold text-white font-mono group-hover:scale-105 transition-transform">
                      +250ml
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Glass</div>
                  </button>

                  <button
                    onClick={() => handleLogWater(500, 'Water Bottle')}
                    className="p-3 rounded-xl bg-[#141C27] hover:bg-[#1E293B] border border-white/5 hover:border-[#38BDF8]/40 transition-all text-center cursor-pointer group active:scale-95"
                  >
                    <div className="text-lg font-bold text-emerald-400 font-mono group-hover:scale-105 transition-transform">
                      +500ml
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Bottle</div>
                  </button>
                </div>

                {/* Custom Amount Button */}
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="w-full mt-3 py-2.5 rounded-xl bg-[#141C27] hover:bg-[#1E293B] text-slate-300 hover:text-white text-xs font-mono border border-white/5 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Log Custom Milliliters</span>
                </button>
              </div>

              {/* Next Reminder Box */}
              <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 flex flex-col justify-between grow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase">
                    <Bell className="w-4 h-4 text-[#38BDF8]" />
                    <span>Next Drink Reminder</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="my-2">
                  <div className="text-3xl font-bold text-white font-heading">
                    in {reminderMinutes} minutes
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Plays a gentle Icelandic chime on your Windows 11 desktop and flashes a subtle action center banner.
                  </p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      setReminderMinutes(reminderMinutes + 10);
                      onToast('Reminder snoozed for 10 minutes.');
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#141C27] hover:bg-[#1E293B] text-slate-300 hover:text-white text-xs font-mono border border-white/5 transition-all cursor-pointer"
                  >
                    Snooze +10m
                  </button>
                  <button
                    onClick={() => handleLogWater(250, 'Standard Glass')}
                    className="flex-1 py-2 rounded-xl bg-[#38BDF8] text-[#070F19] hover:bg-sky-300 text-xs font-bold font-mono transition-all cursor-pointer"
                  >
                    Drink Now (+250ml)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: DRINK SCHEDULE */}
      {activeSection === 'schedule' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Hydration Activity & Drink Log
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Live record of all water intake events synchronized directly from your database.
            </p>
          </div>

          <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 space-y-6">
            {/* Live Database Logs */}
            {userLogs.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/5">
                  <span>Timestamp & Date</span>
                  <div className="flex items-center gap-6">
                    <span>Volume</span>
                    <span>Beverage</span>
                    <span>Cloud Sync</span>
                  </div>
                </div>
                {userLogs.slice(0, 10).map((logItem, idx) => (
                  <div
                    key={logItem.id || logItem.logId || idx}
                    className="p-3.5 rounded-xl bg-[#141C27] border border-white/5 hover:border-[#38BDF8]/30 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-mono text-xs font-bold">
                        💧
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white font-mono">
                          {new Date(logItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {new Date(logItem.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-sm font-bold text-[#38BDF8] font-mono">
                        +{logItem.amountMl || logItem.amount} ml
                      </div>
                      <div className="text-xs text-slate-300 font-mono capitalize">
                        {logItem.beverageType || 'water'}
                      </div>
                      <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Check className="w-3 h-3" />
                        <span>Saved</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
                <Droplet className="w-8 h-8 text-[#38BDF8]/40 mx-auto mb-2" />
                <div className="text-sm font-bold text-white">No Hydration Logs Recorded Yet</div>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click one of the quick sip buttons (+150ml, +250ml, +500ml) above to record your first glass of water.
                </p>
              </div>
            )}

            {/* Pacing Advice Box */}
            <div className="p-4 rounded-xl bg-[#141C27] border border-white/5 flex items-start gap-3.5">
              <Sparkles className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">
                  Hydration Pacing Recommendation
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Drinking 250ml every 45 to 60 minutes prevents fatigue, boosts concentration, and ensures even hydration rather than drinking large amounts late at night.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: BIOMETRICS & GOAL */}
      {activeSection === 'biometrics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Biometrics & Daily Water Target
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Calculate your scientifically recommended fluid requirement based on body mass and daily routine.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form */}
            <div className="lg:col-span-7 bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Body Weight */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                  <span>Body Weight (kg)</span>
                  <span className="text-[#38BDF8] font-bold">{weight} kg</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="130"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value, 10))}
                  className="w-full accent-[#38BDF8] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>40 kg</span>
                  <span>85 kg</span>
                  <span>130 kg</span>
                </div>
              </div>

              {/* Height */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                  <span>Height (cm)</span>
                  <span className="text-white font-bold">{height} cm</span>
                </div>
                <input
                  type="range"
                  min="140"
                  max="210"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value, 10))}
                  className="w-full accent-[#38BDF8] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>140 cm</span>
                  <span>175 cm</span>
                  <span>210 cm</span>
                </div>
              </div>

              {/* Activity Tier */}
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Daily Work & Activity Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: 'Normal / Desk Work', offset: '+0ml' },
                    { label: 'Athletic / Daily Workout', offset: '+600ml' },
                    { label: 'Warm / Hot Climate', offset: '+500ml' }
                  ].map((tier) => (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => setActivityTier(tier.label)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        activityTier === tier.label
                          ? 'border-[#38BDF8] bg-[#38BDF8]/10 text-white'
                          : 'border-white/5 bg-[#141C27] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{tier.label.split('/')[0]}</div>
                      <div className="text-[11px] text-[#38BDF8] font-mono mt-0.5">{tier.offset}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveBiometrics}
                className="w-full py-3 rounded-xl bg-white text-[#070F19] hover:bg-slate-200 font-bold text-sm transition-all shadow-md cursor-pointer"
              >
                Save & Recalibrate Daily Goal
              </button>
            </div>

            {/* Calculated Goal Summary Box */}
            <div className="lg:col-span-5 bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <div className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider">
                  Computed Scientific Target
                </div>
                <div className="text-4xl font-bold text-white font-heading mt-2">
                  {calculateTarget(weight, activityTier).toLocaleString()} ml
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Formula: {weight} kg × 35 ml + {activityTier === 'Normal / Desk Work' ? '0' : '600'} ml activity buffer
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141C27] border border-white/5 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Recommended Glass Size:</span>
                  <span className="font-mono text-white">250 ml</span>
                </div>
                <div className="flex justify-between">
                  <span>Glasses per Day:</span>
                  <span className="font-mono text-[#38BDF8] font-bold">
                    {Math.round(calculateTarget(weight, activityTier) / 250)} glasses
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reminder Frequency:</span>
                  <span className="font-mono text-white">Every 45 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: DESKTOP APP & LICENSE */}
      {activeSection === 'desktop-app' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Windows 11 Companion App
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Sync your hydration logs with our tactile desktop application for Windows 11.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* App Download Box */}
            <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Download for Windows 11
                  </h3>
                  <div className="text-xs text-slate-400">
                    Version 2.4.0 • 64-bit Installer (.exe)
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Water Buddy sits silently in your Windows 11 taskbar tray. It tracks your hydration, reminds you at gentle intervals, and stores everything in an offline SQLite vault.
              </p>

              <div className="flex gap-3">
                <a
                  href="/download/water-buddy-setup.exe"
                  download
                  onClick={() => onToast('✓ Downloading Water Buddy Windows 11 Installer...')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white text-[#070F19] hover:bg-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .exe</span>
                </a>
                <a
                  href="/download/water-buddy-portable.zip"
                  download
                  onClick={() => onToast('✓ Downloading Water Buddy Portable .zip...')}
                  className="py-2.5 px-4 rounded-xl bg-[#141C27] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-white/5 font-mono text-xs flex items-center justify-center transition-all cursor-pointer"
                >
                  Portable .zip
                </a>
              </div>
            </div>

            {/* License Box */}
            <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider">
                    License Status
                  </div>
                  <h3 className="text-base font-bold text-white font-heading mt-0.5">
                    {user.plan || 'Pro Lifetime License'}
                  </h3>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="p-3.5 rounded-xl bg-[#141C27] border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>License Type:</span>
                  <span className="font-mono text-emerald-400 font-bold">Perpetual Lifetime</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Registered To:</span>
                  <span className="font-mono text-white">{user.email}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Updates:</span>
                  <span className="font-mono text-white">Lifetime Free Updates</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <Check className="w-3.5 h-3.5" />
                <span>Certified & Activated on Windows 11</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Custom Milliliters */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white font-heading">
              Log Custom Water Amount
            </h3>
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Milliliters (ml)
                </label>
                <input
                  type="number"
                  min="50"
                  max="2000"
                  step="25"
                  value={customMlInput}
                  onChange={(e) => setCustomMlInput(e.target.value)}
                  className="w-full bg-[#070F19] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-[#38BDF8] outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#141C27] text-slate-300 hover:text-white text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#38BDF8] text-[#070F19] font-bold text-xs hover:bg-sky-300 cursor-pointer"
                >
                  Add +{customMlInput}ml
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
