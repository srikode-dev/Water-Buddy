"use client";

import React, { useState } from "react";
import { Button } from "@/components/Button";
import { THEME_COLORS } from "@/theme/tokens";

export default function Home() {
  // Biometric Calibrator state
  const [weight, setWeight] = useState(72);
  const [activity, setActivity] = useState<"sedentary" | "moderate" | "high">("moderate");

  // Companion HUD state
  const [consumedMl, setConsumedMl] = useState(1850);
  const goalMl = Math.round(weight * 35 + (activity === "moderate" ? 500 : activity === "high" ? 1000 : 0));
  const progressPercent = Math.min(100, Math.round((consumedMl / goalMl) * 100));

  const handleQuickLog = (amount: number) => {
    setConsumedMl((prev) => Math.min(goalMl + 1000, prev + amount));
  };

  return (
    <div className="relative min-h-screen bg-[#070F19] text-white selection:bg-[#38BDF8] selection:text-[#070F19] font-sans antialiased">
      {/* Background ambient radial glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute top-1/3 -left-40 h-[450px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-10 right-0 h-[500px] w-[600px] rounded-full bg-sky-600/10 blur-[150px]" />
      </div>

      {/* FLOATING CAPSULE NAVIGATION */}
      <header className="fixed top-6 left-1/2 z-50 -translate-x-1/2 w-[92%] max-w-5xl">
        <nav className="flex items-center justify-between rounded-full border border-[#1E293B]/80 bg-[#0C141F]/80 px-4 py-2.5 backdrop-blur-xl shadow-2xl shadow-black/40">
          {/* Brand */}
          <div className="flex items-center gap-3 pl-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E293B] border border-sky-400/30 text-[#38BDF8]">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <span className="font-heading text-base font-semibold tracking-tight text-white">
              Water Buddy
            </span>
            <span className="hidden sm:inline-flex rounded-full bg-[#141C27] border border-[#1E293B] px-2.5 py-0.5 text-[11px] font-mono font-medium text-[#38BDF8]">
              v2.4
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-[#94A3B8]">
            <a
              href="#architecture"
              className="rounded-full px-3.5 py-1.5 transition-colors hover:text-white hover:bg-[#141C27]"
            >
              Architecture
            </a>
            <a
              href="#calibrator"
              className="rounded-full px-3.5 py-1.5 transition-colors hover:text-white hover:bg-[#141C27]"
            >
              Calibrator
            </a>
            <a
              href="#companion"
              className="rounded-full px-3.5 py-1.5 transition-colors hover:text-white hover:bg-[#141C27]"
            >
              Companion HUD
            </a>
            <a
              href="#pricing"
              className="rounded-full px-3.5 py-1.5 transition-colors hover:text-white hover:bg-[#141C27]"
            >
              Pricing (₹)
            </a>
          </div>

          {/* Nav CTA */}
          <div className="flex items-center gap-2">
            <a href="#download">
              <Button variant="primary" className="!px-4 !py-2 !text-xs sm:!text-sm">
                Download for Windows
              </Button>
            </a>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="mx-auto max-w-5xl px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1E293B] bg-[#0C141F] px-4 py-1.5 text-xs font-mono text-[#CBD5E1] shadow-inner mb-8">
            <span className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-[#38BDF8] font-semibold">PRODUCTION TOKENS</span>
            <span className="text-[#64748B]">|</span>
            <span>OCEANIC ABYSSAL EDITORIAL</span>
          </div>

          {/* Main Title */}
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.1] mb-6">
            Hydration, distilled <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#CBD5E1] to-[#38BDF8]">
              to silence.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#94A3B8] leading-relaxed mb-10">
            The unified mineral design specification for Water Buddy. Engineered for atmospheric stillness,
            high accessibility, and tactile desktop ergonomics across web, Windows tray telemetry, and client touchpoints.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="primary"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              Download for Windows 11
            </Button>
            <Button variant="ghost">
              Inspect Whitepaper
            </Button>
          </div>

          {/* Micro Telemetry Pills */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
              <span>Native Win32 Hook</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
              <span>&lt; 24MB Memory Footprint</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
              <span>Zero-Telemetry Local Vault</span>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGN SYSTEM TOKEN SWATCHES */}
      <section className="py-12 border-y border-[#1E293B]/60 bg-[#0C141F]/40 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <p className="font-mono text-xs text-[#38BDF8] uppercase tracking-wider">Foundation Palette</p>
              <h2 className="font-heading text-xl font-semibold text-white">Extracted Design System Tokens</h2>
            </div>
            <span className="font-mono text-xs text-[#64748B]">Source: docs/Water Buddy - Design System & UI Kit.svg</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: "Obsidian Base", hex: THEME_COLORS.background, label: "Canvas" },
              { name: "Abyssal Slate", hex: THEME_COLORS.surface, label: "Surface" },
              { name: "Mineral Low", hex: THEME_COLORS.surfaceElevated, label: "Elevated" },
              { name: "Slate 800", hex: THEME_COLORS.border, label: "Border" },
              { name: "Crystal Aqua", hex: THEME_COLORS.accent, label: "Accent", isLight: true },
              { name: "Accent Emerald", hex: THEME_COLORS.accentEmerald, label: "Status", isLight: true },
            ].map((swatch) => (
              <div
                key={swatch.hex}
                className="group rounded-xl border border-[#1E293B] bg-[#0C141F] p-3 transition-all hover:border-[#38BDF8]/50"
              >
                <div
                  className="h-12 w-full rounded-lg border border-white/5 mb-2.5 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: swatch.hex }}
                />
                <div className="text-xs font-semibold text-white">{swatch.name}</div>
                <div className="flex items-center justify-between mt-1 font-mono text-[11px] text-[#94A3B8]">
                  <span>{swatch.hex}</span>
                  <span className="text-[#64748B]">{swatch.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE UI KIT COMPONENTS SHOWCASE */}
      <section id="companion" className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-[#1E293B] px-3.5 py-1 font-mono text-xs font-medium text-[#38BDF8] mb-3">
              TACTILE UI KIT &amp; WIDGETS
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-white">
              Live Components &amp; Desktop Telemetry
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto mt-2">
              Preview of the Win32 HUD companion and the adaptive biometric calibrator extracted directly from the design system.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* COMPONENT 1: WIN32 TRAY COMPANION HUD CARD */}
            <div className="relative rounded-2xl border border-[#1E293B] bg-[#0C141F] p-6 sm:p-8 shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 mb-6">
                <div>
                  <span className="font-mono text-xs text-[#38BDF8] uppercase tracking-wider">HUD PREVIEW</span>
                  <h3 className="font-heading text-lg font-semibold text-white">Tray Companion Widget</h3>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-[#141C27] border border-[#1E293B] px-3 py-1 font-mono text-xs text-[#34D399]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
                  Active Session
                </div>
              </div>

              {/* Progress Ring Card */}
              <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
                {/* SVG Circular Progress Ring */}
                <div className="relative flex items-center justify-center h-36 w-36 shrink-0">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-[#1E293B]"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-[#38BDF8] transition-all duration-500 ease-out"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercent / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="font-heading text-2xl font-bold text-white">{progressPercent}%</span>
                    <span className="font-mono text-[10px] text-[#94A3B8]">INTAKE</span>
                  </div>
                </div>

                {/* Telemetry Stats */}
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <div className="font-mono text-xs text-[#64748B]">DAILY VOLUME</div>
                    <div className="font-heading text-2xl font-semibold text-white">
                      {consumedMl.toLocaleString()}{" "}
                      <span className="text-sm font-normal text-[#94A3B8]">/ {goalMl.toLocaleString()} ml</span>
                    </div>
                  </div>
                  <div className="text-xs text-[#CBD5E1] bg-[#141C27] rounded-lg p-2.5 border border-[#1E293B]">
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#94A3B8]">
                      <span>NEXT INTERVAL</span>
                      <span className="text-[#38BDF8] font-medium">18m remaining</span>
                    </div>
                    <div className="mt-1 text-[11px] text-[#64748B]">
                      Character: "Alex" (Gentle Nudge Mode)
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Log Buttons */}
              <div className="mt-6 pt-5 border-t border-[#1E293B] flex items-center justify-between">
                <span className="font-mono text-xs text-[#94A3B8]">Log Telemetry:</span>
                <div className="flex items-center gap-2">
                  <Button variant="quickLog" onClick={() => handleQuickLog(150)}>
                    +150ml
                  </Button>
                  <Button variant="quickLog" onClick={() => handleQuickLog(250)}>
                    +250ml
                  </Button>
                  <Button variant="quickLog" onClick={() => handleQuickLog(500)}>
                    +500ml
                  </Button>
                </div>
              </div>
            </div>

            {/* COMPONENT 2: BIOMETRIC CALIBRATOR RANGE SLIDER */}
            <div id="calibrator" className="relative rounded-2xl border border-[#1E293B] bg-[#0C141F] p-6 sm:p-8 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 mb-6">
                <div>
                  <span className="font-mono text-xs text-[#38BDF8] uppercase tracking-wider">DYNAMIC ENGINE</span>
                  <h3 className="font-heading text-lg font-semibold text-white">Biometric Calibrator</h3>
                </div>
                <span className="rounded-full bg-[#1E293B] px-3 py-1 font-mono text-xs text-[#CBD5E1]">
                  Formula v2.4
                </span>
              </div>

              {/* Weight Slider */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#CBD5E1]">Body Mass</label>
                  <span className="font-mono text-sm font-semibold text-[#38BDF8]">{weight} kg</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="120"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
                />
                <div className="flex justify-between font-mono text-[10px] text-[#64748B]">
                  <span>45 kg</span>
                  <span>72 kg (Baseline)</span>
                  <span>120 kg</span>
                </div>
              </div>

              {/* Activity Level Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#CBD5E1] mb-2.5">Activity Intensity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["sedentary", "moderate", "high"] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setActivity(tier)}
                      className={`rounded-lg py-2 px-3 text-xs font-medium transition-all capitalize ${
                        activity === tier
                          ? "bg-[#38BDF8] text-[#070F19] font-semibold shadow-md"
                          : "bg-[#141C27] border border-[#1E293B] text-[#94A3B8] hover:text-white"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Computed Outputs */}
              <div className="rounded-xl bg-[#070F19] border border-[#1E293B] p-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="font-mono text-[11px] text-[#64748B]">DAILY TARGET</div>
                  <div className="font-heading text-xl font-bold text-white mt-0.5">
                    {goalMl.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-[#94A3B8]">ml / day</span>
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-[#64748B]">ADAPTIVE SIP</div>
                  <div className="font-heading text-xl font-bold text-[#38BDF8] mt-0.5">
                    {Math.round(goalMl / 16)}{" "}
                    <span className="text-xs font-normal text-[#94A3B8]">ml / interval</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE & FEATURE CARDS */}
      <section id="architecture" className="py-20 border-t border-[#1E293B]/60 bg-[#0C141F]/30">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <span className="font-mono text-xs text-[#38BDF8] uppercase tracking-wider">SYSTEM PILLARS</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-white mt-1">
              Engineered for Stillness
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Windows Tray Kernel Architecture",
                tag: "WIN32 NATIVE",
                desc: "Sub-24MB memory footprint written with native Win32 message loop integration. Never hogs CPU cycles or interferes with high-framerate workflows.",
              },
              {
                title: "Zero-Telemetry Stance",
                tag: "CRYPTOGRAPHIC VAULT",
                desc: "Every sip log, biometric parameter, and reminder history remains strictly local. No cloud tracking, analytics beacons, or third-party pings.",
              },
              {
                title: "Adaptive Sip Engine",
                tag: "MATHEMATICAL DOSAGE",
                desc: "Reminders dynamically adjust dose size based on remaining hours and unacknowledged prompts, keeping you on track without panic drinking.",
              },
              {
                title: "Ambient Character Animations",
                tag: "FOCUS GUARANTEE",
                desc: "Transparent desktop animations glide past quietly without stealing keyboard focus or disrupting fullscreen development sessions.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#1E293B] bg-[#0C141F] p-6 hover:border-[#38BDF8]/50 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-[#141C27] border border-[#1E293B] px-2.5 py-0.5 font-mono text-[10px] text-[#38BDF8]">
                    {feature.tag}
                  </span>
                  <span className="text-[#64748B] font-mono text-xs">0{i + 1}</span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-3xl border border-[#1E293B] bg-gradient-to-b from-[#0C141F] to-[#070F19] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#141C27] border border-[#1E293B] px-3.5 py-1 font-mono text-xs text-[#38BDF8] mb-6">
              LIFETIME LICENSE · ZERO SUBSCRIPTION
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-white mb-3">
              Transparent Ownership in INR (₹)
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] max-w-lg mx-auto mb-8">
              Pay once, keep forever. Free updates, full sprite catalog, and zero recurring monthly fees.
            </p>

            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="font-heading text-5xl sm:text-6xl font-bold text-white">₹899</span>
              <span className="font-mono text-sm text-[#64748B]">one-time payment</span>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto mb-8 font-sans text-sm text-[#CBD5E1]">
              {[
                "Windows 11 Certified Installer",
                "Full Character & Sprite Catalog",
                "Encrypted Local SQLite Vault",
                "Lifetime Kernel & Engine Updates",
                "Instant Offline Operation",
                "Direct Developer Dispatch",
              ].map((perk, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#34D399] font-bold">✓</span>
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <div id="download">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                }
              >
                Transmit Dispatch ↗
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER STATUS CAPSULE */}
      <footer className="border-t border-[#1E293B] py-10 bg-[#070F19]">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#34D399]" />
            <span className="text-[#CBD5E1]">All systems operational · Windows 11 Certified</span>
          </div>

          <div className="font-mono">
            Water Buddy v2.4 · Design System &amp; UI Kit
          </div>

          <div>
            © 2026 Water Buddy. Oceanic Abyssal Editorial.
          </div>
        </div>
      </footer>
    </div>
  );
}
