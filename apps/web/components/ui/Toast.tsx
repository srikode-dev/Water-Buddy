"use client";

import React from "react";

export interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transform transition-all duration-300 frosted-pill px-5 py-3 rounded-2xl border border-[#38bdf8]/30 text-xs shadow-2xl flex items-center gap-3 animate-bounce">
      <span className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
      <span className="text-white font-medium">{message}</span>
    </div>
  );
}

export default Toast;
