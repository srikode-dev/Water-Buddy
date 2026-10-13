"use client";

import React, { useState } from 'react';
import { WebUser } from '@/types';
import { Droplet, Sparkles, Check, ArrowRight, ArrowLeft, Sliders, Bell } from 'lucide-react';
import { playIcelandicChime, playBasaltDrop } from '@/utils/audio';
import { API_BASE_URL } from '@/utils/api';

interface WebOnboardingViewProps {
  user: WebUser;
  onFinish: (updatedUser: WebUser) => void;
  onToast: (msg: string) => void;
}

export function WebOnboardingView({ user, onFinish, onToast }: WebOnboardingViewProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Biometrics
  const [weight, setWeight] = useState(user.onboarding?.weight || 70);
  const [height, setHeight] = useState(user.onboarding?.height || 170);
  const [medicalInfo, setMedicalInfo] = useState(user.onboarding?.medicalInfo || 'Normal Healthy');

  // Step 2: Reminders & Volume
  const [intervalMin, setIntervalMin] = useState(user.onboarding?.reminderInterval || 45);
  const [cupVolume, setCupVolume] = useState(250);

  // Step 3: Theme & Placement
  const [notificationTheme, setNotificationTheme] = useState(user.onboarding?.notificationTheme || 'oceanic');
  const [notificationPosition, setNotificationPosition] = useState(user.onboarding?.notificationPosition || 'bottom-right');

  // Dynamic Goal Formula
  const getOffset = (cond: string) => {
    switch (cond) {
      case 'Athletic / Daily Workout': return 600;
      case 'Warm / Tropical Climate': return 500;
      case 'Pregnant / Nursing': return 700;
      case 'Fluid Restricted (Medical)': return -500;
      default: return 0;
    }
  };

  const calculateTarget = () => {
    let base = Math.round(weight * 35);
    const offset = getOffset(medicalInfo);
    if (medicalInfo === 'Fluid Restricted (Medical)') {
      return Math.max(1500, base + offset);
    }
    return base + offset;
  };

  const computedGoal = calculateTarget();

  const handleComplete = async () => {
    setLoading(true);
    playIcelandicChime();

    const updatedUser: WebUser = {
      ...user,
      onboarding: {
        weight,
        height,
        medicalInfo,
        dailyGoal: computedGoal,
        reminderInterval: intervalMin,
        notificationTheme,
        notificationPosition
      }
    };

    try {
      const token = localStorage.getItem('wb_auth_token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            weight,
            height,
            medicalInfo,
            dailyGoal: computedGoal,
            reminderInterval: intervalMin,
            notificationTheme,
            notificationPosition
          })
        });
      }
    } catch (e) {
      console.warn('Profile sync fallback', e);
    }

    localStorage.setItem('wb_user', JSON.stringify(updatedUser));
    onToast('🎉 Hydration profile calibrated! Welcome to your personal portal.');
    onFinish(updatedUser);
    setLoading(false);
  };

  return (
    <div className="py-6 sm:py-10 max-w-2xl mx-auto">
      {/* Onboarding Box */}
      <div className="bg-[#0C141F] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#38BDF8]/10 blur-[100px] pointer-events-none" />

        {/* Wizard Progress Bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-[#38BDF8] text-[#070F19]' : 'bg-white/10 text-slate-400'
            }`}>
              1
            </span>
            <span className={step >= 1 ? 'text-white font-semibold' : 'text-slate-500'}>
              Biometrics
            </span>
          </div>
          <div className="h-0.5 w-12 bg-white/10" />

          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? 'bg-[#38BDF8] text-[#070F19]' : 'bg-white/10 text-slate-400'
            }`}>
              2
            </span>
            <span className={step >= 2 ? 'text-white font-semibold' : 'text-slate-500'}>
              Reminders
            </span>
          </div>
          <div className="h-0.5 w-12 bg-white/10" />

          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-[#38BDF8] text-[#070F19]' : 'bg-white/10 text-slate-400'
            }`}>
              3
            </span>
            <span className={step >= 3 ? 'text-white font-semibold' : 'text-slate-500'}>
              Preferences
            </span>
          </div>
        </div>

        {/* STEP 1: Health & Biometrics */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                STEP 1 OF 3
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-space mt-1">
                Your Health &amp; Biometrics
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                We calculate your daily water intake using clinical guidelines based on your body weight and routine.
              </p>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weight */}
              <div className="bg-[#070F19] p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-slate-200">Body Weight</label>
                  <div className="flex items-center gap-1 font-mono text-sm font-bold text-[#38BDF8] bg-[#141C27] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="number"
                      min="35"
                      max="160"
                      value={weight}
                      onChange={(e) => setWeight(Math.max(30, Math.min(180, Number(e.target.value) || 70)))}
                      className="w-12 bg-transparent text-right text-[#38BDF8] outline-none"
                    />
                    <span>kg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="40"
                  max="140"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#38BDF8]"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>40 kg</span>
                  <span>70 kg</span>
                  <span>140 kg</span>
                </div>
              </div>

              {/* Height */}
              <div className="bg-[#070F19] p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-slate-200">Height</label>
                  <div className="flex items-center gap-1 font-mono text-sm font-bold text-[#38BDF8] bg-[#141C27] px-2.5 py-1 rounded-lg border border-white/10">
                    <input
                      type="number"
                      min="120"
                      max="220"
                      value={height}
                      onChange={(e) => setHeight(Math.max(100, Math.min(230, Number(e.target.value) || 170)))}
                      className="w-12 bg-transparent text-right text-[#38BDF8] outline-none"
                    />
                    <span>cm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="130"
                  max="210"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#38BDF8]"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>130 cm</span>
                  <span>170 cm</span>
                  <span>210 cm</span>
                </div>
              </div>
            </div>

            {/* Medical Tier */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">
                Health &amp; Routine Condition
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'Normal Healthy', label: 'Normal Healthy', sub: 'Standard routine (35ml/kg)' },
                  { id: 'Athletic / Daily Workout', label: 'Athletic / Daily Workout', sub: '+600 ml compensation' },
                  { id: 'Warm / Tropical Climate', label: 'Warm / Tropical Climate', sub: '+500 ml climate offset' },
                  { id: 'Pregnant / Nursing', label: 'Pregnant / Nursing', sub: '+700 ml hydration bonus' },
                  { id: 'Fluid Restricted (Medical)', label: 'Fluid Restricted (Medical)', sub: '-500 ml clinical threshold' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setMedicalInfo(tier.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      medicalInfo === tier.id
                        ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-white shadow-md'
                        : 'bg-[#070F19]/40 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-semibold">{tier.label}</div>
                    <div className="text-[10px] text-slate-500">{tier.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Computed Target Banner */}
            <div className="bg-[#141C27] border border-[#38BDF8]/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#38BDF8] font-bold block">
                  Auto-Calculated Daily Goal
                </span>
                <span className="text-xs text-slate-300 mt-0.5 block">
                  {weight}kg × 35ml {getOffset(medicalInfo) !== 0 ? `+ ${getOffset(medicalInfo)}ml condition offset` : ''}
                </span>
              </div>
              <div className="text-3xl font-bold font-mono text-white text-right">
                {computedGoal.toLocaleString()} <span className="text-xs font-normal text-slate-400">ml / day</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { playBasaltDrop(); setStep(2); }}
              className="w-full py-3.5 rounded-full bg-[#38BDF8] text-[#070F19] text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Next: Set Reminders ➔</span>
            </button>
          </div>
        )}

        {/* STEP 2: Reminders & Cup Volume */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                STEP 2 OF 3
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-space mt-1">
                Reminders &amp; Preferred Cup Size
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Choose how often you want gentle desk nudges and what volume you usually drink.
              </p>
            </div>

            {/* Reminder Interval */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">
                Reminder Frequency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { value: 20, label: '20 min', sub: 'Frequent' },
                  { value: 30, label: '30 min', sub: 'Active' },
                  { value: 45, label: '45 min', sub: 'Recommended' },
                  { value: 60, label: '60 min', sub: 'Hourly' },
                  { value: 90, label: '90 min', sub: 'Relaxed' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIntervalMin(opt.value)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      intervalMin === opt.value
                        ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-white shadow-md'
                        : 'bg-[#070F19]/50 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-sm font-bold font-mono text-white">{opt.label}</div>
                    <div className="text-[10px] text-slate-500">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cup Volume */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">
                Standard Cup / Glass Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { val: 100, label: '100 ml', icon: '🥛', desc: 'Small Cup' },
                  { val: 150, label: '150 ml', icon: '☕', desc: 'Regular Cup' },
                  { val: 250, label: '250 ml', icon: '🧊', desc: 'Large Glass' },
                  { val: 500, label: '500 ml', icon: '🍶', desc: 'Water Bottle' },
                ].map((cup) => (
                  <button
                    key={cup.val}
                    type="button"
                    onClick={() => setCupVolume(cup.val)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      cupVolume === cup.val
                        ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-white shadow-md'
                        : 'bg-[#070F19]/50 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xl mb-1">{cup.icon}</div>
                    <div className="text-xs font-bold font-mono text-white">{cup.label}</div>
                    <div className="text-[10px] text-slate-500">{cup.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-6 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                ⬅ Back
              </button>
              <button
                type="button"
                onClick={() => { playBasaltDrop(); setStep(3); }}
                className="flex-1 py-3 px-6 rounded-full bg-[#38BDF8] text-[#070F19] text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Next: Themes &amp; Placement ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Notification Style & Review */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                STEP 3 OF 3
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-space mt-1">
                Notification Style &amp; Review
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Customize how Water Buddy appears on your desktop screen.
              </p>
            </div>

            {/* Themes */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">
                Visual Glow Theme
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'oceanic', label: 'Oceanic Aqua', color: '#38BDF8', desc: 'Crystal Aqua glow' },
                  { id: 'emerald', label: 'Cyber Emerald', color: '#34D399', desc: 'Vibrant Green glow' },
                  { id: 'obsidian', label: 'Midnight Obsidian', color: '#FFFFFF', desc: 'Deep Monochrome' },
                  { id: 'neon', label: 'Neon Twilight', color: '#C084FC', desc: 'Violet & Cyan' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setNotificationTheme(th.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      notificationTheme === th.id
                        ? 'bg-white/15 border-white text-white shadow-lg'
                        : 'bg-[#070F19]/50 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: th.color, boxShadow: `0 0 10px ${th.color}` }}
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{th.label}</div>
                      <div className="text-[10px] text-slate-500">{th.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">
                Screen Corner Placement
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'bottom-right', label: 'Bottom Right ↘' },
                  { id: 'bottom-left', label: 'Bottom Left ↙' },
                  { id: 'top-right', label: 'Top Right ↗' },
                  { id: 'bottom-center', label: 'Bottom Center ⬇' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setNotificationPosition(pos.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-mono ${
                      notificationPosition === pos.id
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                        : 'bg-[#070F19]/50 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Final Summary Card */}
            <div className="bg-[#070F19] rounded-2xl p-4 border border-white/10 space-y-2 text-xs font-mono">
              <div className="text-[#38BDF8] font-bold uppercase text-[10px]">Your Calibrated Plan:</div>
              <div className="flex justify-between text-slate-300">
                <span>Account:</span>
                <span className="text-white font-bold">{user.email}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Active Tier:</span>
                <span className="text-emerald-400 font-bold">{user.plan}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Daily Water Goal:</span>
                <span className="text-[#38BDF8] font-bold">{computedGoal.toLocaleString()} ml / day</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Reminders:</span>
                <span className="text-white">Every {intervalMin} min ({cupVolume} ml per sip)</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-6 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                ⬅ Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleComplete}
                className="flex-1 py-3.5 px-6 rounded-full bg-white text-[#070F19] hover:bg-slate-200 text-xs font-bold uppercase tracking-wider transition-all shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Saving Profile...' : '✓ Complete Setup & Open Portal ➔'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebOnboardingView;
