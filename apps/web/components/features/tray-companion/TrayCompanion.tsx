"use client";

import React, { useState, useEffect } from 'react';
import { playBasaltDrop } from '@/utils/audio';
import { RotateCcw, Plus, Sparkles, Check } from 'lucide-react';

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
  const [minutesRemaining, setMinutesRemaining] = useState(24);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
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
      handleQuickLog(val, 'Custom Vol');
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
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="frosted-glass rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-auto shadow-2xl relative overflow-hidden border border-white/10 select-none">
      {/* Ambient background glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#38bdf8]/15 blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-3">
        <span className="text-slate-400">WIN32 TRAY COMPANION</span>
        <span className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/10 font-medium">
          {timeString || '12:00 PM'}
        </span>
      </div>

      {/* Progress Ring HUD */}
      <div className="flex flex-col items-center justify-center my-6 relative">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-[#141f2e]"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-[#38bdf8] transition-all duration-700 ease-out"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold tracking-tight text-white font-mono">
              {percent}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
              Optimal
            </span>
          </div>
        </div>

        {/* Volume status */}
        <div className="mt-3 text-center">
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {currentIntake.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {dailyGoal.toLocaleString()} ml
            </span>
          </div>

          {editingGoal ? (
            <form onSubmit={handleSaveGoal} className="flex items-center gap-1.5 mt-2 justify-center">
              <input
                type="number"
                min="500"
                max="6000"
                step="50"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="w-20 bg-[#070f19] border border-[#38bdf8] rounded px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none"
              />
              <button
                type="submit"
                className="p-1 rounded bg-[#38bdf8] text-[#070f19] hover:bg-sky-400"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setGoalInput(String(dailyGoal));
                setEditingGoal(true);
              }}
              className="text-[11px] text-slate-400 hover:text-[#38bdf8] underline decoration-dotted mt-1 transition-colors block mx-auto"
            >
              Calibrate Goal
            </button>
          )}
        </div>
      </div>

      {/* Interval Nudge Box */}
      <div className="bg-[#070f19]/70 border border-white/5 rounded-2xl p-3.5 mb-5 flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">NEXT AMBIENT NUDGE</span>
          <span className="text-[#38bdf8] font-semibold text-sm">
            {minutesRemaining}m {String(secondsRemaining).padStart(2, '0')}s
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 text-[10px] block">INTERVAL</span>
          <span className="text-slate-300">45 Min Pacing</span>
        </div>
      </div>

      {/* Quick Sip Log Actions */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
          Log Intake:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickLog(150, 'Mineral Sip')}
            className="frosted-pill py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:border-[#38bdf8] hover:bg-[#38bdf8]/10 transition-all font-mono"
          >
            +150ml
          </button>
          <button
            onClick={() => handleQuickLog(250, 'Standard Glass')}
            className="frosted-pill py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:border-[#38bdf8] hover:bg-[#38bdf8]/10 transition-all font-mono"
          >
            +250ml
          </button>
          <button
            onClick={() => handleQuickLog(500, 'Carafe Flask')}
            className="frosted-pill py-2 rounded-xl text-xs font-semibold text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#070f19] border border-[#38bdf8]/30 transition-all font-mono"
          >
            +500ml
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setShowCustomModal(true)}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3 text-[#38bdf8]" /> Custom amount
          </button>

          {onReset && (
            <button
              onClick={() => {
                if (window.confirm('Reset current intake to 0 ml?')) {
                  onReset();
                }
              }}
              className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
              title="Reset daily intake"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Custom Amount Sub-Modal */}
      {showCustomModal && (
        <div className="absolute inset-0 bg-[#070f19]/95 backdrop-blur-md flex flex-col justify-center p-6 z-20 animate-in fade-in">
          <h4 className="text-sm font-semibold text-white mb-2">Log Custom Intake</h4>
          <p className="text-xs text-slate-400 mb-4">
            Enter the exact volume in milliliters consumed:
          </p>
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <input
              type="number"
              min="10"
              max="2000"
              step="10"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              className="w-full bg-[#0c141f] border border-white/20 rounded-xl px-4 py-2.5 text-white font-mono text-center focus:outline-none focus:border-[#38bdf8]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="flex-1 py-2 rounded-xl text-xs text-slate-400 bg-white/5 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#38bdf8] text-[#070f19] hover:bg-sky-400 shadow-md"
              >
                Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TrayCompanion;
