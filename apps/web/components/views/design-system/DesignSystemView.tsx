"use client";

import React, { useState } from 'react';
import { Copy, Check, Droplets, Waves, Database, Lock, Monitor, IndianRupee, Download, Radio } from 'lucide-react';
import { playBasaltDrop } from '@/utils/audio';

interface DesignSystemViewProps {
  onToast: (msg: string) => void;
}

export const DesignSystemView: React.FC<DesignSystemViewProps> = ({ onToast }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [testSlider, setTestSlider] = useState(74);

  const colors = [
    { name: 'Obsidian Base', hex: '#070f19', desc: 'Deep canvas background', bg: 'bg-[#070f19]' },
    { name: 'Abyssal Slate', hex: '#0c141f', desc: 'Primary card & container', bg: 'bg-[#0c141f]' },
    { name: 'Mineral Low', hex: '#141c27', desc: 'Hover & elevated surfaces', bg: 'bg-[#141c27]' },
    { name: 'Slate 800', hex: '#1e293b', desc: 'Input fills & pill groups', bg: 'bg-[#1e293b]' },
    { name: 'Crystal Aqua', hex: '#38bdf8', desc: 'Primary accent & active state', bg: 'bg-[#38bdf8]' },
    { name: 'Pure White', hex: '#ffffff', desc: 'Primary CTA pill & high contrast', bg: 'bg-[#ffffff]' },
  ];

  const handleCopyColor = (hex: string, name: string) => {
    playBasaltDrop();
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    onToast(`Copied ${name} (${hex})`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const icons = [
    { title: 'Water Droplet', role: 'Brand / Hydrate', icon: <Droplets className="w-5 h-5 text-[#38bdf8]" /> },
    { title: 'Acoustic Wave', role: 'Soundscapes', icon: <Waves className="w-5 h-5 text-[#38bdf8]" /> },
    { title: 'SQLite Vault', role: 'Local Ledger', icon: <Database className="w-5 h-5 text-[#38bdf8]" /> },
    { title: 'Zero Cloud Lock', role: 'Security', icon: <Lock className="w-5 h-5 text-[#38bdf8]" /> },
    { title: 'Tray Engine', role: 'Win32 Hook', icon: <Monitor className="w-5 h-5 text-[#38bdf8]" /> },
    { title: 'INR Currency', role: 'Honest Pricing', icon: <span className="font-bold text-lg text-[#38bdf8]">₹</span> },
    { title: 'Download .exe', role: 'Installer', icon: <Download className="w-5 h-5 text-[#38bdf8]" /> },
    { title: 'Live Telemetry', role: 'Latency / Sync', icon: <Radio className="w-5 h-5 text-[#38bdf8]" /> },
  ];

  return (
    <div className="space-y-16 pb-24 pt-4 max-w-7xl mx-auto">
      {/* Intro Banner */}
      <section className="border border-white/10 rounded-2xl p-8 sm:p-10 bg-gradient-to-r from-[#0c141f] to-[#070f19] relative overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <p className="text-xs font-mono text-[#38bdf8] uppercase tracking-[0.22em] font-medium">
            BRAND FOUNDATION & COMPONENT ARCHITECTURE
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
            Design System & Reusable Elements
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed">
            The unified mineral design specification for Water Buddy. Engineered for atmospheric stillness, high accessibility, and tactile desktop ergonomics across web, Windows tray telemetry, and client touchpoints.
          </p>
        </div>
      </section>

      {/* 01 COLOR PALETTE TOKENS */}
      <section id="colors" className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#38bdf8] font-mono text-sm">01 /</span> Color Palette Tokens
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Dark mineral abyssal surfaces calibrated with luminous crystal aqua accents.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">HEX / RGBA Tokens</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => handleCopyColor(c.hex, c.name)}
              className="bg-[#0c141f] border border-white/10 rounded-xl p-3.5 space-y-3 text-left hover:border-[#38bdf8]/40 transition-all group focus:outline-none"
            >
              <div
                className={`h-20 rounded-lg w-full border border-white/5 transition-transform group-hover:scale-[1.02] ${c.bg} ${
                  c.hex === '#38bdf8' ? 'shadow-[0_0_15px_rgba(56,189,248,0.4)]' : ''
                }`}
              ></div>
              <div>
                <div className="text-sm font-medium text-white flex items-center justify-between">
                  <span>{c.name}</span>
                  {copiedColor === c.hex ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="text-xs font-mono text-[#38bdf8] font-medium">{c.hex}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-light leading-tight">{c.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 02 TYPOGRAPHY SCALE */}
      <section id="typography" className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#38bdf8] font-mono text-sm">02 /</span> Typography & Hierarchies
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Space Grotesk (Editorial Headers) + JetBrains Mono (Telemetry) + Plus Jakarta Sans.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Scale Spec</span>
        </div>

        <div className="bg-[#0c141f] border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden shadow-xl">
          {/* Display H1 */}
          <div className="p-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div className="w-56 shrink-0">
              <span className="text-xs font-mono text-[#38bdf8]">Display Hero / H1</span>
              <div className="text-xs text-slate-500">font-semibold • 48px/56px</div>
            </div>
            <div className="grow">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
                Hydration, <span className="italic font-light text-slate-300">distilled</span> to silence.
              </h1>
            </div>
          </div>

          {/* Section Header H2 */}
          <div className="p-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div className="w-56 shrink-0">
              <span className="text-xs font-mono text-[#38bdf8]">Section Header / H2</span>
              <div className="text-xs text-slate-500">font-semibold • 28px/36px</div>
            </div>
            <div className="grow">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                Transparent ownership in INR (₹).
              </h2>
            </div>
          </div>

          {/* Feature Heading H3 */}
          <div className="p-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div className="w-56 shrink-0">
              <span className="text-xs font-mono text-[#38bdf8]">Feature Heading / H3</span>
              <div className="text-xs text-slate-500">font-medium • 20px/28px</div>
            </div>
            <div className="grow">
              <h3 className="text-xl font-medium tracking-tight text-white">
                Windows Tray Kernel Architecture
              </h3>
            </div>
          </div>

          {/* Body Editorial */}
          <div className="p-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div className="w-56 shrink-0">
              <span className="text-xs font-mono text-[#38bdf8]">Body Editorial</span>
              <div className="text-xs text-slate-500">font-normal • 15px/24px</div>
            </div>
            <div className="grow">
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
                A silent Windows taskbar companion crafted for prolonged creative deep work. Mindful intervals, adaptive biological pacing, zero notification noise.
              </p>
            </div>
          </div>

          {/* Telemetry Mono */}
          <div className="p-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div className="w-56 shrink-0">
              <span className="text-xs font-mono text-[#38bdf8]">Telemetry Mono</span>
              <div className="text-xs text-slate-500">font-mono • 12px/16px</div>
            </div>
            <div className="grow">
              <span className="font-mono text-xs text-[#38bdf8] bg-[#38bdf8]/10 px-2.5 py-1 rounded border border-[#38bdf8]/20">
                CREATE TABLE biometrics_log (timestamp_utc INTEGER, stillness_vector_ms REAL);
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 03 ICONOGRAPHY LIBRARY */}
      <section id="icons" className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#38bdf8] font-mono text-sm">03 /</span> Iconography Suite (SVG Vector Marks)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              24x24 and 20x20 crisp hairline icons used across navigation, metrics, and cards.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">24px Stroke Grid</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {icons.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0c141f] border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2.5 hover:border-[#38bdf8]/40 transition-all group shadow-md"
            >
              <div className="w-10 h-10 rounded-lg bg-[#38bdf8]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="text-xs text-slate-200 font-medium">{item.title}</span>
              <span className="text-[10px] font-mono text-slate-500">{item.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 04 INTERACTIVE UI ELEMENTS & COMPONENTS */}
      <section id="components" className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#38bdf8] font-mono text-sm">04 /</span> Core Interactive Components
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Reusable navigation pills, buttons, data metric cards, sliders, and form inputs.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Live Component Gallery</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COMPONENT A: Floating Header Capsule */}
          <div className="bg-[#0c141f] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#38bdf8] uppercase">Floating Header Capsule</span>
              <span className="text-[10px] font-mono text-slate-500">Primary Nav</span>
            </div>
            <p className="text-xs text-slate-400">
              The centerpiece frosted glass capsule navigation used across all application screens.
            </p>

            <div className="p-4 rounded-xl bg-[#070f19] border border-white/5 flex justify-center overflow-x-auto">
              <div className="frosted-pill px-4 py-2 rounded-full flex items-center gap-3 text-xs shadow-xl">
                <div className="flex items-center gap-2 pr-3 border-r border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]"></span>
                  <span className="font-medium text-white">Water Buddy</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span className="px-2.5 py-1 rounded-full text-white bg-white/10 font-medium">Architecture</span>
                  <span className="px-2.5 py-1 rounded-full hover:text-white">Pricing</span>
                  <span className="px-2.5 py-1 rounded-full hover:text-white">Contact</span>
                </div>
                <div className="pl-2 border-l border-white/10 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">INR • WIN 11</span>
                  <button className="bg-white text-[#070f19] font-medium px-2.5 py-1 rounded-full text-[11px]">
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* COMPONENT B: Action Buttons & CTAs */}
          <div className="bg-[#0c141f] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#38bdf8] uppercase">Button Hierarchy</span>
              <span className="text-[10px] font-mono text-slate-500">Primary / Secondary / Ghost</span>
            </div>
            <p className="text-xs text-slate-400">
              Stateful button styles supporting tactile clicks, hover glows, and icon pairings.
            </p>

            <div className="p-4 rounded-xl bg-[#070f19] border border-white/5 flex flex-wrap items-center gap-3">
              <button className="px-5 py-2.5 rounded-full bg-white text-[#070f19] font-semibold text-xs hover:bg-slate-200 transition-all shadow-md flex items-center gap-2 active:scale-95">
                <Download className="w-3.5 h-3.5" />
                Download for Windows 11
              </button>

              <button className="px-5 py-2.5 rounded-full bg-[#38bdf8] text-[#070f19] font-semibold text-xs hover:bg-white transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] active:scale-95">
                Transmit Dispatch ↗
              </button>

              <button className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10 transition-all active:scale-95">
                Inspect Whitepaper
              </button>
            </div>
          </div>

          {/* COMPONENT C: Input Array & Range Slider */}
          <div className="bg-[#0c141f] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#38bdf8] uppercase">Input Array & Range Slider</span>
              <span className="text-[10px] font-mono text-slate-500">Biometric Calibrator</span>
            </div>
            <p className="text-xs text-slate-400">
              Dynamic slider component used in mass calculations and pacing recalculation.
            </p>

            <div className="p-4 rounded-xl bg-[#070f19] border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Subject Body Mass</span>
                <span className="font-mono text-[#38bdf8] font-bold text-sm">{testSlider} kg</span>
              </div>
              <input
                type="range"
                min="45"
                max="120"
                value={testSlider}
                onChange={(e) => setTestSlider(parseInt(e.target.value, 10))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>45 kg</span>
                <span>80 kg</span>
                <span>120 kg</span>
              </div>
            </div>
          </div>

          {/* COMPONENT D: Mini Tray Companion Preview Card */}
          <div className="bg-[#0c141f] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#38bdf8] uppercase">Mini Tray Companion Widget</span>
              <span className="text-[10px] font-mono text-slate-500">Win32 HUD Card</span>
            </div>
            <p className="text-xs text-slate-400">
              The signature dark frosted circular intake monitor embedded in the Windows tray.
            </p>

            <div className="p-4 rounded-xl bg-[#070f19] border border-white/5 flex items-center justify-between gap-5">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#38bdf8]"
                    strokeDasharray="74, 100"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-bold text-white font-mono leading-none">1,850</span>
                  <span className="text-[8px] text-slate-400 leading-tight">/ 2.5 L</span>
                </div>
              </div>

              <div className="grow space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs text-slate-200 font-medium">Interval in 24 mins</span>
                </div>
                <div className="text-[11px] text-slate-400 font-light">Steady metabolic absorption state</div>
                <div className="flex gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white font-mono border border-white/5">+150ml</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white font-mono border border-white/5">+250ml</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specification Footnote Bar */}
      <footer className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-3">
        <span>WATER BUDDY SPECIFICATION</span>
        <span className="text-[#38bdf8]">• Production Ready Tokens •</span>
        <span>Desaturated Mineral Slate + Crystal Blue</span>
      </footer>
    </div>
  );
};
