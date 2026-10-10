"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";

export function Footer() {
  return (
    <footer className="border-t border-[#1E293B] py-10 bg-[#070F19] text-xs text-[#64748B] mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" pulse>
            Operational
          </Badge>
          <span className="text-[#CBD5E1]">Windows 11 Certified Companion</span>
        </div>

        <div className="font-mono text-[11px] text-[#94A3B8]">
          Water Buddy v2.4 · Oceanic Abyssal Editorial
        </div>

        <div className="text-[11px]">
          © 2026 Water Buddy Technologies. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
