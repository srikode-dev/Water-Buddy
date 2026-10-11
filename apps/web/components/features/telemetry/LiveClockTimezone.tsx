"use client";

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

interface LiveClockTimezoneProps {
  variant?: 'pill' | 'minimal';
}

export function LiveClockTimezone({ variant = 'pill' }: LiveClockTimezoneProps) {
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [timeZone, setTimeZone] = useState<string>('');

  const [shortTimeStr, setShortTimeStr] = useState<string>('');

  useEffect(() => {
    setMounted(true);

    const updateClock = () => {
      const now = new Date();
      
      // Local time formatted with seconds
      const formattedTime = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      // Compact local time (no seconds) for header
      const compactTime = now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // Local date formatted nicely
      const formattedDate = now.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      // Detected browser timezone
      let tz = 'Local';
      try {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      } catch (e) {
        tz = 'Local';
      }

      setTimeStr(formattedTime);
      setShortTimeStr(compactTime);
      setDateStr(formattedDate);
      setTimeZone(tz);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    if (variant === 'minimal') return null;
    return (
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Loading...</span>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div 
        className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] font-mono text-slate-300 hover:border-white/10 transition-colors select-none shrink-0"
        title={`${dateStr} • Detected Location: ${timeZone}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="font-semibold text-white tracking-tight">{shortTimeStr}</span>
        <span className="text-slate-500 text-[10px] hidden 2xl:inline">·</span>
        <span className="text-[#38BDF8] text-[10px] truncate max-w-[85px] hidden 2xl:inline">{timeZone}</span>
      </div>
    );
  }

  return (
    <div 
      className="hidden md:flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-[#0C141F]/80 backdrop-blur-md border border-[#1E293B] text-[11px] font-mono text-slate-300 shadow-inner"
      title={`Live location clock detected in ${timeZone}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>

      <span className="font-semibold text-white tracking-tight">{timeStr}</span>
      <span className="text-slate-500">·</span>
      <span className="text-slate-400">{dateStr}</span>
      <span className="text-slate-500">·</span>
      <span className="text-[#38BDF8] flex items-center gap-1 font-medium">
        <Globe className="w-3 h-3 text-[#38BDF8]" />
        {timeZone}
      </span>
    </div>
  );
}

export default LiveClockTimezone;
