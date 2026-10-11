"use client";

import React, { useState } from 'react';
import { WebUser } from '@/types';
import { Droplet, Sparkles, CheckCircle2, User, Lock, Mail } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: WebUser, token: string) => void;
  onNavigateTab: (tab: any) => void;
  onToast: (msg: string) => void;
  onStartOnboarding?: (user: WebUser) => void;
}

export function AuthView({ onLoginSuccess, onNavigateTab, onToast, onStartOnboarding }: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [plan, setPlan] = useState<'Free' | 'Pro Lifetime (₹899)'>('Pro Lifetime (₹899)');

  const fillQuickCredentials = (role: 'owner' | 'user') => {
    if (role === 'owner') {
      setEmail('srikant.owner@gmail.com');
      setPassword('qwertywsx');
      setMode('login');
    } else {
      setEmail('srikant.user@gmail.com');
      setPassword('qwertywsx');
      setMode('login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (mode === 'register' && !name) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const bodyData = mode === 'register' ? {
        email,
        password,
        name,
        plan,
        onboarding: {
          weight: 70,
          height: 170,
          medicalInfo: 'Normal Healthy',
          dailyGoal: 2450,
          reminderInterval: 45,
          notificationTheme: 'oceanic',
          notificationPosition: 'bottom-right'
        }
      } : { email, password };

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('wb_auth_token', data.token);
        localStorage.setItem('wb_user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);

        if (mode === 'register') {
          onToast('✓ Account created! Opening setup...');
          if (onStartOnboarding) {
            onStartOnboarding(data.user);
          } else {
            onNavigateTab('onboarding');
          }
        } else {
          onToast('✓ Welcome back to Water Buddy!');
          onNavigateTab('portal');
        }
      } else {
        setErrorMsg(data.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      console.error('Auth request error:', err);
      setErrorMsg('Could not connect to authentication server (http://localhost:5000). Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 sm:py-6 max-w-lg mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-xs font-mono mb-3">
          <Droplet className="w-3.5 h-3.5 fill-current" />
          <span>WATER BUDDY ACCOUNT</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight font-heading">
          {mode === 'register' ? 'Create Your Account' : 'Sign In to Water Buddy'}
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
          {mode === 'register'
            ? 'Set up your daily hydration targets, sync with Windows 11, and manage your license.'
            : 'Access your hydration dashboard, reminders, and account details.'}
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-[#0C141F] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8]/10 blur-3xl pointer-events-none" />

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#070F19] p-1 rounded-xl border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#38BDF8] text-[#070F19] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-[#38BDF8] text-[#070F19] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            ⚠ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Srikant Sahu"
                  className="w-full bg-[#070F19] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-[#38BDF8] outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#070F19] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-[#38BDF8] outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070F19] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-[#38BDF8] outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                Select Your Plan
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlan('Pro Lifetime (₹899)')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    plan === 'Pro Lifetime (₹899)'
                      ? 'border-[#38BDF8] bg-[#38BDF8]/10 text-white'
                      : 'border-white/10 bg-[#070F19] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Pro Lifetime</div>
                  <div className="text-[11px] text-[#38BDF8] mt-0.5 font-mono">₹899 one-time</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan('Free')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    plan === 'Free'
                      ? 'border-[#38BDF8] bg-[#38BDF8]/10 text-white'
                      : 'border-white/10 bg-[#070F19] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Free Starter</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">₹0 forever</div>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-white text-[#070F19] hover:bg-slate-200 font-bold text-sm transition-all shadow-lg cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Processing...' : (mode === 'register' ? 'Create Account & Continue' : 'Sign In')}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 pt-5 border-t border-white/5">
          <div className="text-xs text-slate-400 font-mono mb-2 text-center uppercase tracking-wider">
            Quick Fill Test Logins:
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillQuickCredentials('owner')}
              className="flex-1 py-1.5 px-2 bg-[#141C27] hover:bg-[#1E293B] text-xs text-[#38BDF8] rounded-lg border border-white/5 transition-all cursor-pointer"
            >
              👑 Owner / Admin
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('user')}
              className="flex-1 py-1.5 px-2 bg-[#141C27] hover:bg-[#1E293B] text-xs text-slate-300 rounded-lg border border-white/5 transition-all cursor-pointer"
            >
              💧 Regular User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
