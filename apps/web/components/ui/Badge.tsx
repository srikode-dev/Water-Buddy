"use client";

import React from "react";

export type BadgeVariant = "default" | "emerald" | "aqua" | "muted";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  pulse = false,
  children,
  className = "",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#141C27] border-[#1E293B] text-[#CBD5E1]",
    emerald: "bg-[#141C27] border-emerald-500/20 text-[#34D399]",
    aqua: "bg-[#141C27] border-sky-500/20 text-[#38BDF8]",
    muted: "bg-[#0C141F] border-[#1E293B] text-[#94A3B8]",
  };

  const dotColors = {
    default: "bg-[#94A3B8]",
    emerald: "bg-[#34D399]",
    aqua: "bg-[#38BDF8]",
    muted: "bg-[#64748B]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-medium shadow-inner ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {pulse && (
        <span
          className={`h-1.5 w-1.5 rounded-full animate-pulse ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
