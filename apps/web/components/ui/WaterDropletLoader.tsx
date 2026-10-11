"use client";

import React, { useState, useEffect, useRef } from "react";

interface WaterDropletLoaderProps {
  message?: string;
  subMessage?: string;
  progress?: number;
  isTransition?: boolean;
  isExiting?: boolean;
}

export function WaterDropletLoader({
  message = "Synchronizing Hydration Core...",
  subMessage = "Authenticating atmospheric telemetry",
  progress,
  isTransition = false,
  isExiting = false,
}: WaterDropletLoaderProps) {
  const [internalProgress, setInternalProgress] = useState(progress !== undefined ? progress : 15);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (progress !== undefined) {
      setInternalProgress(progress);
      return;
    }

    const startTime = performance.now();
    const duration = isTransition ? 420 : 750; // Snappy for tab switching, immersive for initial load
    const startProgress = isTransition ? 25 : 10;
    const targetProgress = 100;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(1, elapsed / duration);

      // Ease out cubic for silky fluid feel
      const ease = 1 - Math.pow(1 - t, 3);
      const current = Math.round(startProgress + (targetProgress - startProgress) * ease);
      setInternalProgress(current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [progress, isTransition]);

  // SVG Teardrop Path
  const dropletPath = "M 50 8 C 50 8 92 65 92 94 A 42 42 0 1 1 8 94 C 8 65 50 8 50 8 Z";

  // Liquid level (Y coordinate from bottom up: 136 to 12)
  const fillY = 136 - (1.24 * internalProgress);

  return (
    <div
      className={`fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#070F19]/95 backdrop-blur-xl select-none transition-all duration-300 ease-out ${
        isExiting ? "opacity-0 pointer-events-none scale-98" : "opacity-100 scale-100"
      }`}
    >
      {/* Background radial gradient glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#38BDF8]/15 blur-[120px] pointer-events-none animate-pulse" />

      {/* Main Droplet Vessel */}
      <div className="relative w-36 h-48 sm:w-40 sm:h-52 flex items-center justify-center">
        <svg
          viewBox="0 0 100 140"
          className="w-full h-full filter drop-shadow-[0_0_28px_rgba(56,189,248,0.45)]"
        >
          <defs>
            {/* Droplet Outline ClipPath */}
            <clipPath id="dropletMask">
              <path d={dropletPath} />
            </clipPath>

            {/* Liquid Vertical Gradient */}
            <linearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7BD1FA" />
              <stop offset="45%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Surface Foam Light Gradient */}
            <linearGradient id="foamGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#BAE6FD" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Droplet Glass Outer Body (Abyssal Slate) */}
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
              className="transition-all duration-75 ease-linear"
            />

            {/* Continuous SVG Animated Wave 1 */}
            <path
              d={`M -40 ${fillY} Q -15 ${fillY - 4} 10 ${fillY} T 60 ${fillY} T 110 ${fillY} T 160 ${fillY} L 160 140 L -40 140 Z`}
              fill="#38BDF8"
              opacity="0.75"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0,0"
                to="-50,0"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </path>

            {/* Continuous SVG Animated Wave 2 (Opposite Phase & Faster) */}
            <path
              d={`M -40 ${fillY + 2} Q -15 ${fillY - 2} 10 ${fillY + 2} T 60 ${fillY + 2} T 110 ${fillY + 2} T 160 ${fillY + 2} L 160 140 L -40 140 Z`}
              fill="url(#foamGradient)"
              opacity="0.85"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                from="-50,0"
                to="0,0"
                dur="3.2s"
                repeatCount="indefinite"
              />
            </path>

            {/* Rising Shimmer Bubbles */}
            <circle cx="35" cy={Math.min(130, fillY + 24)} r="2" fill="#FFFFFF" opacity="0.6">
              <animate attributeName="cy" values={`${fillY + 45};${fillY + 8}`} dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.8;0" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="65" cy={Math.min(130, fillY + 32)} r="2.5" fill="#FFFFFF" opacity="0.5">
              <animate attributeName="cy" values={`${fillY + 50};${fillY + 12}`} dur="2.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.7;0" dur="2.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy={Math.min(130, fillY + 18)} r="1.5" fill="#FFFFFF" opacity="0.7">
              <animate attributeName="cy" values={`${fillY + 35};${fillY + 5}`} dur="1.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.9;0" dur="1.4s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Glowing Outer Glass Rim */}
          <path
            d={dropletPath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeOpacity="0.65"
          />

          {/* Left Specular Glare (Glass Refraction highlight) */}
          <path
            d="M 44 24 C 28 48 20 72 20 95 C 20 80 25 55 42 28 Z"
            fill="#FFFFFF"
            opacity="0.22"
          />
        </svg>

        {/* Live Percent Badge in Center */}
        <div className="absolute bottom-11 inset-x-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-xs font-bold text-white tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
            {internalProgress}%
          </span>
        </div>
      </div>

      {/* Label and Status */}
      <div className="mt-6 flex flex-col items-center gap-1.5 text-center px-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
          <span className="font-heading text-sm font-bold tracking-wider text-white uppercase">
            WATER BUDDY
          </span>
        </div>
        <p className="font-mono text-xs text-[#38BDF8] tracking-wide max-w-sm">
          {message}
        </p>
        <span className="font-mono text-[11px] text-slate-500 max-w-xs">
          {subMessage}
        </span>
      </div>
    </div>
  );
}

export default WaterDropletLoader;
