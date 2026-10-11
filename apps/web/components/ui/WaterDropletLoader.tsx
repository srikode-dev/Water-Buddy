"use client";

import React, { useState, useEffect } from "react";

interface WaterDropletLoaderProps {
  message?: string;
  subMessage?: string;
  progress?: number; // Optional 0 to 100
}

export function WaterDropletLoader({
  message = "Synchronizing Hydration Core...",
  subMessage = "Authenticating atmospheric telemetry",
  progress
}: WaterDropletLoaderProps) {
  // If no static progress is provided, animate smoothly from 15 to 90%
  const [internalProgress, setInternalProgress] = useState(progress !== undefined ? progress : 25);

  useEffect(() => {
    if (progress !== undefined) {
      setInternalProgress(progress);
      return;
    }
    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 95) return 20;
        return prev + 5;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [progress]);

  // SVG Teardrop Path
  const dropletPath = "M 50 8 C 50 8 92 65 92 94 A 42 42 0 1 1 8 94 C 8 65 50 8 50 8 Z";

  // Liquid level (Y coordinate from bottom up: 136 to 10)
  const fillY = 136 - (1.26 * internalProgress);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070F19] select-none">
      {/* Background radial gradient glow */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[#38BDF8]/10 blur-[100px] pointer-events-none" />

      {/* Main Droplet Vessel */}
      <div className="relative w-36 h-48 flex items-center justify-center">
        <svg
          viewBox="0 0 100 140"
          className="w-full h-full filter drop-shadow-[0_0_24px_rgba(56,189,248,0.4)]"
        >
          <defs>
            {/* Droplet Outline ClipPath */}
            <clipPath id="dropletMask">
              <path d={dropletPath} />
            </clipPath>

            {/* Liquid Vertical Gradient */}
            <linearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7BD1FA" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Surface Foam Light Gradient */}
            <linearGradient id="foamGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#BAE6FD" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Droplet Glass Outer Body (Dark Abyssal Mineral) */}
          <path
            d={dropletPath}
            fill="#0C141F"
            stroke="#1E293B"
            strokeWidth="3.5"
          />

          {/* Liquid Filled Area Inside Mask */}
          <g clipPath="url(#dropletMask)">
            {/* Rising Water Mass */}
            <rect
              x="0"
              y={fillY}
              width="100"
              height="140"
              fill="url(#liquidGradient)"
              className="transition-all duration-300 ease-out"
            />

            {/* Liquid Surface Animated Waves */}
            <path
              d={`M -20 ${fillY} Q 5 ${fillY - 4} 30 ${fillY} T 80 ${fillY} T 130 ${fillY} L 130 140 L -20 140 Z`}
              fill="#38BDF8"
              opacity="0.75"
              className="animate-pulse"
            />
            <path
              d={`M -20 ${fillY + 2} Q 15 ${fillY - 2} 45 ${fillY + 2} T 95 ${fillY + 2} L 130 140 L -20 140 Z`}
              fill="url(#foamGradient)"
            />

            {/* Rising Micro-Bubbles */}
            <circle cx="35" cy={fillY + 20} r="2" fill="#FFFFFF" opacity="0.6" className="animate-ping" />
            <circle cx="65" cy={fillY + 35} r="2.5" fill="#FFFFFF" opacity="0.5" />
            <circle cx="50" cy={fillY + 50} r="1.5" fill="#FFFFFF" opacity="0.7" />
          </g>

          {/* Glowing Outer Glass Rim */}
          <path
            d={dropletPath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeOpacity="0.6"
          />

          {/* Left Specular Glare (Glass Refraction highlight) */}
          <path
            d="M 44 24 C 28 48 20 72 20 95 C 20 80 25 55 42 28 Z"
            fill="#FFFFFF"
            opacity="0.25"
          />
        </svg>

        {/* Live Percent Overlay in Center */}
        <div className="absolute bottom-10 inset-x-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-xs font-bold text-white tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {internalProgress}%
          </span>
        </div>
      </div>

      {/* Label and Status */}
      <div className="mt-6 flex flex-col items-center gap-1.5 text-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
          <span className="font-heading text-sm font-bold tracking-wider text-white uppercase">
            WATER BUDDY
          </span>
        </div>
        <p className="font-mono text-xs text-[#38BDF8] tracking-wide">
          {message}
        </p>
        <span className="font-mono text-[11px] text-slate-500">
          {subMessage}
        </span>
      </div>
    </div>
  );
}
