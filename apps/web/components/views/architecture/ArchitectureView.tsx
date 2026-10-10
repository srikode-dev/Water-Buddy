"use client";

import React, { useState } from 'react';
import { BiometricState } from '@/types';
import { playIcelandicChime, playBasaltDrop, playSingingBowl } from '@/utils/audio';
import { Copy, Check, Volume2, Shield, HardDrive, Cpu, Terminal, Activity, ArrowRight } from 'lucide-react';

interface ArchitectureViewProps {
  onTriggerDownload: () => void;
  onTriggerCheckout: () => void;
  onToast: (msg: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  onTriggerDownload,
  onTriggerCheckout,
  onToast,
}) => {
  // Biometric sliders
  const [biometrics, setBiometrics] = useState<BiometricState>({
    massKg: 74,
    terminalHours: 7.5,
    temperatureC: 23.5,
    humidityPct: 48,
  });

  const [copiedSql, setCopiedSql] = useState(false);
  const [activeCurveNode, setActiveCurveNode] = useState<number | null>(null);

  // Dynamic Algorithmic Synthesis calculation
  // Vdaily = (M * 35) + Σ(ΔT * qtemp) + (Dfocus * 82) - (RH * 0.12)
  const tempDelta = Math.max(0, biometrics.temperatureC - 20);
  const tempBonus = tempDelta * 45;
  const focusBonus = biometrics.terminalHours * 82;
  const humidityReduction = biometrics.humidityPct * 1.5;
  const rawDemand = (biometrics.massKg * 35) + tempBonus + focusBonus - humidityReduction;
  const dailyPhysiologicalDemand = Math.round(rawDemand);
  const intervalPulse = Math.round(dailyPhysiologicalDemand / (biometrics.terminalHours * 3.2));
  const intervalMinutes = Math.max(18, Math.round(52 - (biometrics.terminalHours * 1.8)));

  const sqlSchema = `CREATE TABLE biometrics_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp_utc INTEGER NOT NULL,
  stillness_vector_ms REAL DEFAULT 0.0,
  ambient_temp_c REAL NOT NULL,
  metabolic_demand_ml INTEGER,
  chime_attenuation_db REAL
);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    onToast('SQLite schema copied to clipboard');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const curveNodes = [
    { label: '0h (Base Calibration)', ml: Math.round(dailyPhysiologicalDemand * 0.12), pos: '10%' },
    { label: '2h (Cognitive Ramp)', ml: Math.round(dailyPhysiologicalDemand * 0.35), pos: '32%' },
    { label: '4h (Metabolic Midpoint)', ml: Math.round(dailyPhysiologicalDemand * 0.58), pos: '55%' },
    { label: '6h (Stillness Peak)', ml: Math.round(dailyPhysiologicalDemand * 0.82), pos: '76%' },
    { label: '8h (Evening Equilibrium)', ml: dailyPhysiologicalDemand, pos: '95%' },
  ];

  return (
    <div className="space-y-16 pb-20 pt-4">
      {/* 1. Header & Runtime Specs */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.22em] text-[#38bdf8] uppercase">
            <span>01 —— SYSTEM ARCHITECTURE & BIOMETRICS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-normal text-white tracking-tight leading-tight">
            Engineered for stillness. <br />
            <span className="text-slate-400">Calibrated to biology.</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
            A technical exploration of how Water Buddy measures stillness, ambient temperature, and metabolic hydration demands without waking noisy OS notification subsystems.
          </p>
        </div>

        {/* Runtime Engine Specs Block */}
        <div className="bg-[#0c141f] border border-white/10 rounded-xl p-5 font-mono text-xs space-y-3 shrink-0 lg:w-80 shadow-xl">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">RUNTIME ENGINE</span>
            <span className="text-white font-medium">Native C++20 / Win32</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">MEMORY ALLOCATION</span>
            <span className="text-[#38bdf8] font-medium">14.2 MB Steady State</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">TELEMETRY LEAKAGE</span>
            <span className="text-emerald-400 font-medium">0.00 KB (Zero Outbound)</span>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Metric Engine: Algorithmic Hydration Synthesis */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
              DYNAMIC METRIC ENGINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1">
              Algorithmic Hydration Synthesis
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md font-light">
            Continuous coefficient rebalancing based on metabolic mass, cognitive stillness duration, and thermal atmospheric sensors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Biometric Input Array */}
          <div className="lg:col-span-5 bg-[#0c141f] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                BIOMETRIC INPUT ARRAY
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20">
                REAL-TIME BIOPARSE
              </span>
            </div>

            <div className="space-y-5">
              {/* Slider 1: Mass */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Subject Mass (kg)</span>
                  <span className="text-[#38bdf8] font-semibold">{biometrics.massKg} kg</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="120"
                  value={biometrics.massKg}
                  onChange={(e) =>
                    setBiometrics({ ...biometrics, massKg: parseInt(e.target.value, 10) })
                  }
                  className="w-full"
                />
              </div>

              {/* Slider 2: Sedentary Terminal Window */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Sedentary Terminal Window</span>
                  <span className="text-[#38bdf8] font-semibold">{biometrics.terminalHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  step="0.5"
                  value={biometrics.terminalHours}
                  onChange={(e) =>
                    setBiometrics({ ...biometrics, terminalHours: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Slider 3: Temperature */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Microclimate Temperature</span>
                  <span className="text-[#38bdf8] font-semibold">{biometrics.temperatureC} °C</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="35"
                  step="0.5"
                  value={biometrics.temperatureC}
                  onChange={(e) =>
                    setBiometrics({ ...biometrics, temperatureC: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Slider 4: Humidity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Ambient Humidity (RH)</span>
                  <span className="text-[#38bdf8] font-semibold">{biometrics.humidityPct} %</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={biometrics.humidityPct}
                  onChange={(e) =>
                    setBiometrics({ ...biometrics, humidityPct: parseInt(e.target.value, 10) })
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Formula Primitive Code Box */}
            <div className="bg-[#070f19] p-3.5 rounded-xl border border-white/5 font-mono text-[11px] text-slate-400 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
                FORMULA PRIMITIVE
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                V<sub>daily</sub> = (M × 35ml) + Σ(ΔT × q<sub>temp</sub>) + (D<sub>focus</sub> × 82ml) - (RH × 0.12)
              </p>
            </div>
          </div>

          {/* Right: Physiological Demand & Isotonic Curve */}
          <div className="lg:col-span-7 bg-[#0c141f] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  ESTIMATED DAILY PHYSIOLOGICAL DEMAND
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-normal text-white font-mono tracking-tight tabular-nums">
                    {dailyPhysiologicalDemand.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-400">ML / DIURNAL CYCLE</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse"></span>
                <span>
                  Interval Pulse: <strong className="text-white">{intervalPulse} ml / {intervalMinutes} min</strong>
                </span>
              </div>
            </div>

            {/* Focus Timeline Curve Graphic */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>FOCUS TIMELINE: 8-HOUR RETENTION COHORT</span>
                <span className="text-[#38bdf8] text-[11px]">ISOTONIC CURVE △</span>
              </div>

              {/* Interactive SVG Curve */}
              <div className="relative h-44 w-full bg-[#070f19] rounded-xl border border-white/5 p-3 flex flex-col justify-end overflow-hidden">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                  <div className="border-b border-dashed border-white/20 w-full"></div>
                  <div className="border-b border-dashed border-white/20 w-full"></div>
                  <div className="border-b border-dashed border-white/20 w-full"></div>
                </div>

                <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Fill Area */}
                  <path
                    d="M 20 140 Q 120 120, 200 65 T 380 45 T 480 50 L 480 150 L 20 150 Z"
                    fill="url(#areaGradient)"
                  />
                  {/* Stroke Line */}
                  <path
                    d="M 20 140 Q 120 120, 200 65 T 380 45 T 480 50"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Interactive Milestone Nodes */}
                  <circle cx="50" cy="135" r="4.5" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="160" cy="95" r="4.5" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="280" cy="58" r="4.5" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="390" cy="48" r="4.5" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="475" cy="50" r="4.5" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
                </svg>

                {/* Milestone Node Labels */}
                <div className="grid grid-cols-5 text-[9px] sm:text-[10px] font-mono text-slate-400 pt-2 border-t border-white/5">
                  <span className="text-left">0h (Base Calibration)</span>
                  <span className="text-center">2h (Cognitive Ramp)</span>
                  <span className="text-center">4h (Metabolic Midpoint)</span>
                  <span className="text-center">6h (Stillness Peak)</span>
                  <span className="text-right">8h (Evening Equilibrium)</span>
                </div>
              </div>
            </div>

            {/* 3 Metrics Footer */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">CELLULAR DIFFUSION</span>
                <span className="text-white font-medium">94.8% Opt. Rate</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">VASODILATION INDEX</span>
                <span className="text-emerald-400 font-medium">1.04 Steady</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">SENSOR SYNC LATENCY</span>
                <span className="text-[#38bdf8] font-medium">0.038ms Native</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Storage & Privacy Sovereignty + Subsystem Metrics */}
      <section className="space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
            STORAGE & PRIVACY SOVEREIGNTY
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1">
            Local SQLite Relational Schema
          </h2>
          <p className="text-sm text-slate-300 font-light mt-1 leading-relaxed">
            Every sip, posture change, and microclimate adjustment is recorded in an encrypted, single-file SQLite database located exclusively in <code className="text-[#38bdf8] font-mono">%APPDATA%/WaterBuddy/vault.db</code>. No remote telemetry endpoints are ever resolved.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* SQL Editor Block */}
          <div className="lg:col-span-7 bg-[#0c141f] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-mono text-slate-400">
                SQL TABLE: telemetry_snapshots
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  WAL MODE ENABLED
                </span>
                <button
                  onClick={copySqlToClipboard}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy schema SQL"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <pre className="p-4 bg-[#070f19] rounded-xl text-xs font-mono text-slate-300 overflow-x-auto my-4 border border-white/5 leading-relaxed">
              <code>{sqlSchema}</code>
            </pre>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
              <span>Disk Read Penalty: &lt;0.002ms</span>
              <span className="text-emerald-400">Zero Cloud Sync Demanded</span>
            </div>
          </div>

          {/* Subsystem Metrics Card */}
          <div className="lg:col-span-5 bg-[#0c141f] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
                <span className="text-xs font-mono text-slate-400 uppercase">SUBSYSTEM METRICS</span>
              </div>
              <span className="text-xs font-mono text-slate-400">SYS.DIAG.v2.4.9</span>
            </div>

            <div className="space-y-4 my-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    NETWORK SOCKETS OPENED
                  </span>
                  <span className="text-2xl font-bold font-mono text-white">0</span>
                </div>
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    ACTIVE MEMORY WORKING SET
                  </span>
                  <span className="text-2xl font-bold font-mono text-white">14.18 <span className="text-sm font-normal text-slate-400">MB</span></span>
                </div>
                <Cpu className="w-5 h-5 text-[#38bdf8]" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    DISK FOOTPRINT (BINARY + DB)
                  </span>
                  <span className="text-2xl font-bold font-mono text-white">8.40 <span className="text-sm font-normal text-slate-400">MB</span></span>
                </div>
                <HardDrive className="w-5 h-5 text-slate-300" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
              <span>IPC WAKE INTERVAL</span>
              <span className="text-white font-medium">60,000 ms (Passive Poll)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Subsurface Engineering: Windows Tray Kernel Architecture */}
      <section className="space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
            SUBSURFACE ENGINEERING
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1">
            Windows Tray Kernel Architecture
          </h2>
          <p className="text-sm text-slate-300 font-light mt-1">
            Built strictly for 64-bit Windows environments. Deploys without Electron, Chromium runtimes, or background garbage collectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1 */}
          <div className="bg-[#0c141f] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-xl hover:border-white/20 transition-all">
            <div className="space-y-3">
              <span className="text-xs font-mono text-[#38bdf8] uppercase">MODULE 01</span>
              <h3 className="text-lg font-medium text-white">Low-Power Win32 Event Loop</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Intercepts system wake events and keyboard stillness vectors via lightweight raw input hooks. Consumes &lt;0.01% CPU average by yielding cycles to Windows NT scheduler.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
              <div>HOOK: WH_KEYBOARD_LL / RAWINPUT</div>
              <div className="text-emerald-400 font-medium">Thread Idle State: 99.98%</div>
            </div>
          </div>

          {/* Module 2 (Sound Chimes with interactive trigger!) */}
          <div className="bg-[#0c141f] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-xl hover:border-white/20 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#38bdf8] uppercase">MODULE 02</span>
                <span className="text-[10px] font-mono text-emerald-400">AUDIO PROBE</span>
              </div>
              <h3 className="text-lg font-medium text-white">Ambient Micro-Chimes</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                24-bit lossless acoustic tone synthesis triggered on calculated biological milestones. Emits zero aggressive popups or visual desktop clutter to respect focus states.
              </p>
              {/* Interactive Audio Preview Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={playBasaltDrop}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-[#38bdf8]/20 text-[11px] font-mono text-[#38bdf8] flex items-center gap-1 border border-white/5"
                >
                  <Volume2 className="w-3 h-3" /> Basalt Drop
                </button>
                <button
                  onClick={playIcelandicChime}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-[#38bdf8]/20 text-[11px] font-mono text-[#38bdf8] flex items-center gap-1 border border-white/5"
                >
                  <Volume2 className="w-3 h-3" /> Icelandic (432Hz)
                </button>
                <button
                  onClick={playSingingBowl}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-[#38bdf8]/20 text-[11px] font-mono text-[#38bdf8] flex items-center gap-1 border border-white/5"
                >
                  <Volume2 className="w-3 h-3" /> Singing Bowl
                </button>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
              <div>AUDIO: DirectSound / WASAPI Pure</div>
              <div className="text-white">Freq Range: 432Hz - 864Hz Pure Sine</div>
            </div>
          </div>

          {/* Module 3 */}
          <div className="bg-[#0c141f] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-xl hover:border-white/20 transition-all">
            <div className="space-y-3">
              <span className="text-xs font-mono text-[#38bdf8] uppercase">MODULE 03</span>
              <h3 className="text-lg font-medium text-white">Local-First Ledger</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Complete historical timeline preserved on NVMe/SSD storage. Features optional ChaCha20-Poly1305 encrypted local archiving with zero outbound network calls required.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
              <div>PERSISTENCE: Zero-Cloud Mandate</div>
              <div className="text-white">Encryption: AES-GCM / Hardware TPM</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Technical Audit: Benchmark Evaluation Matrix */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
              TECHNICAL AUDIT
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1">
              Benchmark Evaluation
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md font-light">
            Comparative system footprint analysis measured under steady-state Windows 11 Enterprise workstations.
          </p>
        </div>

        <div className="overflow-x-auto bg-[#0c141f] border border-white/10 rounded-2xl shadow-xl">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase tracking-wider bg-white/[0.02]">
                <th className="py-4 px-6">METRIC SPECIFICATION</th>
                <th className="py-4 px-6 text-[#38bdf8] font-semibold bg-[#38bdf8]/5">WATER BUDDY CORE V2.4</th>
                <th className="py-4 px-6">BROWSER EXTENSIONS</th>
                <th className="py-4 px-6">MOBILE APP REMINDERS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-light">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6 font-medium text-white">
                  CPU Impact (Idle / Tick)
                  <span className="block text-[10px] text-slate-400 font-mono">Observed cycle overhead</span>
                </td>
                <td className="py-4 px-6 text-emerald-400 font-mono font-medium bg-[#38bdf8]/5">
                  &lt; 0.01% Win32 Yield
                </td>
                <td className="py-4 px-6 font-mono text-slate-400">1.8% - 4.2% (V8 Engine Wake)</td>
                <td className="py-4 px-6 font-mono text-slate-400">N/A (External Phone Device)</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6 font-medium text-white">
                  Attention Friction & Noise
                  <span className="block text-[10px] text-slate-400 font-mono">Interruption vector</span>
                </td>
                <td className="py-4 px-6 text-white font-medium bg-[#38bdf8]/5">
                  Acoustic Chime Only (Zero UI Popups)
                </td>
                <td className="py-4 px-6 text-slate-400">OS Toast & Desktop Banners</td>
                <td className="py-4 px-6 text-slate-400">Haptic Vibration & Push Badges</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6 font-medium text-white">
                  Privacy & Data Residency
                  <span className="block text-[10px] text-slate-400 font-mono">Outbound telemetry protocol</span>
                </td>
                <td className="py-4 px-6 text-emerald-400 font-mono font-medium bg-[#38bdf8]/5">
                  100% Local SQLite (0 Outbound Calls)
                </td>
                <td className="py-4 px-6 text-slate-400">Google Chrome Storage / Cloud Sync</td>
                <td className="py-4 px-6 text-slate-400">Firebase Analytics / 3rd-Party Ad ID</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6 font-medium text-white">
                  Resident Memory Set (RAM)
                  <span className="block text-[10px] text-slate-400 font-mono">Peak memory utilization</span>
                </td>
                <td className="py-4 px-6 text-white font-mono font-medium bg-[#38bdf8]/5">
                  14.2 MB Steady State
                </td>
                <td className="py-4 px-6 font-mono text-slate-400">180 MB - 320 MB per tab worker</td>
                <td className="py-4 px-6 font-mono text-slate-400">45 MB - 90 MB background process</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6 font-medium text-white">
                  Licensing & Pricing
                  <span className="block text-[10px] text-slate-400 font-mono">Ownership framework</span>
                </td>
                <td className="py-4 px-6 text-[#38bdf8] font-mono font-medium bg-[#38bdf8]/5">
                  INR 1,999 (Perpetual Studio Edition)
                </td>
                <td className="py-4 px-6 font-mono text-slate-400">Ad-Supported or INR 299/mo Sub</td>
                <td className="py-4 px-6 font-mono text-slate-400">INR 499 – 1,299 Annual Subscription</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Verification & Action Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#0c141f] border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Binary SHA-256 Verified: 8f94d1b74c0a821...</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToast('Architectural Whitepaper opened: "Zero-Interrupt Pacing in Modern OSes" (PDF)')}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
            >
              INSPECT ARCHITECTURE WHITEPAPER
            </button>
            <button
              onClick={onTriggerDownload}
              className="px-4 py-2 rounded-lg bg-white text-[#070f19] hover:bg-[#38bdf8] font-semibold transition-all shadow-md"
            >
              DEPLOY WIN32 BINARY (FREE)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
