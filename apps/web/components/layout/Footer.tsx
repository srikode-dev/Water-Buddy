"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { ActiveTab } from "@/types";
import { Droplet, Heart } from "lucide-react";

export interface FooterProps {
  onNavigateTab?: (tab: ActiveTab) => void;
}

export function Footer({ onNavigateTab }: FooterProps) {
  return (
    <footer className="border-t border-white/10 py-12 bg-[#070F19] text-xs text-slate-400 mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0C141F] border border-white/10 flex items-center justify-center">
              <Droplet className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight text-sm">Water Buddy</span>
              <span className="text-[11px] text-slate-500 font-mono block">Atmospheric Windows Desktop Companion</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {onNavigateTab && (
              <>
                <button
                  onClick={() => onNavigateTab("landing")}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Overview
                </button>
                <button
                  onClick={() => onNavigateTab("architecture")}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
                <button
                  onClick={() => onNavigateTab("pricing")}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Pricing
                </button>
                <button
                  onClick={() => onNavigateTab("contact")}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Contact
                </button>
                <button
                  onClick={() => onNavigateTab("design-system")}
                  className="text-slate-500 hover:text-[#38BDF8] transition-colors cursor-pointer"
                >
                  Design System Kit
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <Badge variant="emerald" pulse>
              Live Release
            </Badge>
            <span className="text-slate-300">Windows 10 & 11 Certified</span>
          </div>

          <div className="font-mono text-slate-500 flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
            <span>for healthy desk focus</span>
          </div>

          <div className="text-slate-500">
            © 2026 Water Buddy. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
