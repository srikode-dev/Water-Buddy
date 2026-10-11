"use client";

import React, { useState, useEffect } from 'react';
import { playBasaltDrop } from '@/utils/audio';
import { Droplet, RotateCcw, Plus, Check, Sliders } from 'lucide-react';

export interface TrayCompanionProps {
  currentIntake: number;
  dailyGoal: number;
  onLogWater: (amount: number, label: string) => void;
  onReset?: () => void;
  onUpdateGoal?: (goal: number) => void;
}

export const TrayCompanion: React.FC<TrayCompanionProps> = ({
  currentIntake,
  dailyGoal,
  onLogWater,
  onReset,
  onUpdateGoal,
}) => {
  const [timeString, setTimeString] = useState('');
  const [minutesRemaining, setMinutesRemaining] = useState(38);
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customVal, setCustomVal] = useState('200');
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(dailyGoal));

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Interval timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prevSec) => {
        if (prevSec > 0) return prevSec - 1;
        setMinutesRemaining((prevMin) => (prevMin > 0 ? prevMin - 1 : 45));
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickLog = (amount: number, label: string) => {
    playBasaltDrop();
    onLogWater(amount, label);
    setMinutesRemaining(45);
    setSecondsRemaining(0);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customVal, 10);
    if (!isNaN(val) && val > 0) {
      handleQuickLog(val, 'Custom Sip');
      setShowCustomModal(false);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(goalInput, 10);
    if (!isNaN(parsed) && parsed > 500 && onUpdateGoal) {
      onUpdateGoal(parsed);
      setEditingGoal(false);
    }
  };

  const percent = Math.min(100, Math.round((currentIntake / (dailyGoal || 2800)) * 100));
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-[#0C141F] border border-[#1E293B] rounded-3xl p-6 sm:p-7 max-w-sm w-full mx-auto shadow-2xl relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center">
            <Droplet className="w-3 h-3 text-[#38BDF8]" />
          </div>
          <span className="text-white font-semibold text-xs tracking-tight">WIDGET MENU</span>
        </div>
        <span className="text-slate-400 bg-white/5 px-2 py-0.5 rounded text-[11px] font-mono border border-white/5">
          {timeString || '12:00 PM'}
        </span>
      </div>

      {/* Progress Ring HUD */}
      <div className="flex flex-col items-center justify-center my-5 relative">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-[#141C27]"
              strokeWidth="9"
              fill="transparent"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-[#38bdf8] transition-all duration-700 ease-out"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono">
              {percent}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              {percent >= 100 ? 'Goal Reached!' : 'Daily Intake'}
            </span>
          </div>
        </div>

        {/* Volume status */}
        <div className="mt-3 text-center">
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {currentIntake.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-400">
              / {dailyGoal.toLocaleString()} ml
            </span>
          </div>

          {!editingGoal ? (
            <button
              onClick={() => setEditingGoal(true)}
              className="text-[11px] text-[#38bdf8] hover:underline mt-1 font-mono cursor-pointer"
            >
              Change daily target
            </button>
          ) : (
            <form onSubmit={handleSaveGoal} className="flex items-center gap-1.5 mt-2 justify-center">
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="w-20 bg-[#070F19] text-white px-2 py-1 rounded text-xs font-mono border border-white/20 text-center"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-[#38bdf8] text-[#070F19] rounded text-[11px] font-bold"
              >
                Save
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Next reminder countdown card */}
      <div className="bg-[#070F19]/80 rounded-2xl p-3 border border-white/5 flex items-center justify-between text-xs font-mono mb-4">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            NEXT REMINDER IN
          </span>
          <span className="text-sm font-bold text-[#38BDF8]">
            {minutesRemaining}m {secondsRemaining.toString().padStart(2, '0')}s
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            INTERVAL
          </span>
          <span className="text-slate-300 font-semibold">Every 45 Min</span>
        </div>
      </div>

      {/* Quick drink pills */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
          One-Click Quick Drink:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickLog(150, 'Cup (+150ml)')}
            className="py-2 px-1 rounded-xl bg-white/5 hover:bg-[#38BDF8]/20 border border-white/10 hover:border-[#38BDF8]/40 text-xs font-mono text-white transition-all font-bold cursor-pointer"
          >
            +150ml
          </button>
          <button
            onClick={() => handleQuickLog(250, 'Glass (+250ml)')}
            className="py-2 px-1 rounded-xl bg-[#38BDF8]/15 hover:bg-[#38BDF8]/30 border border-[#38BDF8]/40 text-xs font-mono text-[#38BDF8] transition-all font-bold cursor-pointer"
          >
            +250ml
          </button>
          <button
            onClick={() => handleQuickLog(500, 'Bottle (+500ml)')}
            className="py-2 px-1 rounded-xl bg-white/5 hover:bg-[#38BDF8]/20 border border-white/10 hover:border-[#38BDF8]/40 text-xs font-mono text-white transition-all font-bold cursor-pointer"
          >
            +500ml
          </button>
        </div>

        {/* Beverage row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => handleQuickLog(150, '☕ Coffee')}
            className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>☕</span>
            <span className="font-mono text-[11px]">+☕ Coffee</span>
          </button>
          <button
            onClick={() => handleQuickLog(150, '🍵 Tea')}
            className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🍵</span>
            <span className="font-mono text-[11px]">+🍵 Tea</span>
          </button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-[11px] font-mono text-slate-400">
        <button
          onClick={() => setShowCustomModal(true)}
          className="text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Custom ml</span>
        </button>

        {onReset && (
          <button
            onClick={onReset}
            className="text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Custom Volume Modal */}
      {showCustomModal && (
        <div className="absolute inset-0 bg-[#0C141F]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 animate-in fade-in">
          <h4 className="text-sm font-semibold text-white mb-2 font-mono">Custom Water Amount</h4>
          <form onSubmit={handleCustomSubmit} className="w-full space-y-3">
            <input
              type="number"
              min="50"
              max="2000"
              step="50"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              className="w-full bg-[#070F19] border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-center text-lg focus:border-[#38BDF8] outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#38BDF8] text-[#070F19] text-xs font-mono font-bold cursor-pointer"
              >
                Add ml
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TrayCompanion;
