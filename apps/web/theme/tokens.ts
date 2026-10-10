import designSystemJson from "./design-system.json";

export const DESIGN_SYSTEM = designSystemJson;

export const THEME_COLORS = {
  // Base canvases
  background: "#070F19", // Obsidian Base
  surface: "#0C141F",    // Abyssal Slate
  surfaceElevated: "#141C27", // Mineral Low

  // Borders and dividers
  border: "#1E293B",     // Slate 800
  borderSubtle: "#334155", // Slate 700
  borderMuted: "#475569",  // Slate 600

  // Accents & status
  accent: "#38BDF8",     // Crystal Aqua
  accentEmerald: "#34D399", // Accent Emerald (Telemetry/Status)

  // Typography colors
  textPrimary: "#FFFFFF",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  textSubtle: "#64748B",
} as const;

export const TYPOGRAPHY = {
  fonts: {
    heading: "var(--font-heading, 'Space Grotesk', sans-serif)",
    sans: "var(--font-sans, 'Plus Jakarta Sans', sans-serif)",
    mono: "var(--font-mono, 'JetBrains Mono', monospace)",
  },
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

export const BUTTON_VARIANTS = {
  primary: {
    background: "#FFFFFF",
    color: "#070F19",
    hoverBackground: "#F1F5F9",
    borderRadius: "9999px",
    padding: "0.75rem 1.5rem",
    fontWeight: "600",
    fontSize: "0.9375rem",
    className:
      "inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-[#070F19] transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5 cursor-pointer",
  },
  secondary: {
    background: "#38BDF8",
    color: "#070F19",
    hoverBackground: "#0EA5E9",
    borderRadius: "9999px",
    padding: "0.75rem 1.5rem",
    fontWeight: "600",
    fontSize: "0.9375rem",
    className:
      "inline-flex items-center justify-center gap-2 rounded-full bg-[#38BDF8] px-6 py-3.5 text-[15px] font-semibold text-[#070F19] transition-all hover:bg-[#0EA5E9] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
  },
  ghost: {
    background: "transparent",
    color: "#FFFFFF",
    border: "1px solid #1E293B",
    borderRadius: "9999px",
    className:
      "inline-flex items-center justify-center gap-2 rounded-full border border-[#1E293B] bg-[#0C141F]/60 px-6 py-3.5 text-[15px] font-medium text-white transition-all hover:border-[#38BDF8] hover:bg-[#141C27] hover:text-[#38BDF8] cursor-pointer",
  },
  quickLog: {
    background: "#1E293B",
    color: "#38BDF8",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    borderRadius: "9999px",
    className:
      "inline-flex items-center justify-center rounded-full border border-sky-400/20 bg-[#1E293B] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#38BDF8] transition-all hover:bg-[#38BDF8] hover:text-[#070F19] cursor-pointer",
  },
} as const;
