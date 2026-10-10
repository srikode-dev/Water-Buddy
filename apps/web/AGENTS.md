<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Water Buddy — Design System & UI Kit Specification

> **Mandatory Visual & Component Source of Truth**:  
> [`docs/Water Buddy - Design System & UI Kit.svg`](file:///c:/REACT/Water-Buddy/docs/Water%20Buddy%20-%20Design%20System%20%26%20UI%20Kit.svg)  
> Machine-readable tokens: [`apps/web/theme/design-system.json`](file:///c:/REACT/Water-Buddy/apps/web/theme/design-system.json)  
> TypeScript tokens: [`apps/web/theme/tokens.ts`](file:///c:/REACT/Water-Buddy/apps/web/theme/tokens.ts)

All web and desktop client interfaces **MUST** strictly follow the visual identity, color palette, typography hierarchy, button states, and component architecture defined herein.

---

## 1. Design Philosophy & Mood

- **Descriptor**: Oceanic Abyssal Editorial
- **Atmosphere**: Silent, mineral depth, high accessibility, tactile desktop ergonomics.
- **Core Aesthetic**: Deep obsidian backgrounds (`#070F19`), glassmorphic abyssal containers (`#0C141F`), subtle slate boundary rings (`#1E293B`), energized with crystalline aqua highlights (`#38BDF8`) and telemetry emerald (`#34D399`).

---

## 2. Color Palette Tokens

| Token Role | Name | Hex Code | Usage & Semantic Rule |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | Obsidian Base | `#070F19` | Main canvas background across all pages and views (`bg-[#070F19]`) |
| **Primary Surface** | Abyssal Slate | `#0C141F` | Cards, modal containers, and floating capsule navigation |
| **Elevated Surface** | Mineral Low | `#141C27` | Hover states, elevated cards, interactive pressed states |
| **Primary Border** | Slate 800 | `#1E293B` | Outer component boundaries, pill outlines, input borders |
| **Subtle Border** | Slate 700 / 600 | `#334155` / `#475569` | Internal hairline dividers and inactive states |
| **Primary Accent** | Crystal Aqua | `#38BDF8` | Interactive active elements, focus rings, secondary buttons, typography highlights |
| **Status / Heartbeat** | Accent Emerald | `#34D399` | Operational indicator (`🟢`), streak achievements, active session badges |
| **Text: High Contrast**| Pure White | `#FFFFFF` | Primary headers, high-contrast labels, Primary CTA button background |
| **Text: Secondary** | Slate 300 | `#CBD5E1` | Body copy, readable descriptions, pill label text |
| **Text: Muted** | Slate 400 | `#94A3B8` | Subtitles, secondary captions, metadata labels |
| **Text: Subtle** | Slate 500 | `#64748B` | Micro-telemetry timestamps, version tags, footer copy |

---

## 3. Typography Hierarchy

Three distinct font families are configured via `next/font/google` in `app/layout.tsx`:

1. **Headings & Display**: `Space Grotesk` (`var(--font-heading)`)
   - **Hero H1**: `48px`–`64px` / line-height `1.1`, font-weight `600`, letter-spacing `-0.03em`
   - **Section H2**: `28px`–`36px` / line-height `1.2`, font-weight `600`
   - **Card / Feature H3**: `20px`–`24px` / line-height `1.3`, font-weight `600`
2. **Body & Controls**: `Plus Jakarta Sans` (`var(--font-sans)`)
   - **Body Regular**: `15px` / `24px`, font-weight `400`
   - **Body Medium / Labels**: `14px` / `20px`, font-weight `500` or `600`
   - **Button Typography**: `15px`, font-weight `600`
3. **Telemetry & Monospace**: `JetBrains Mono` (`var(--font-mono)`)
   - **Telemetry Metric**: `12px` / `16px`, font-weight `500`, uppercase/letter-spaced
   - **HUD Readouts & Pill Badges**: `11px`–`13px`, font-weight `600`

---

## 4. Button Specification (Strictly Follow According to SVG)

Every button variant has dedicated visual rules:

### A. Primary CTA Button
- **Background**: `#FFFFFF` (Pure White)
- **Text Color**: `#070F19` (Obsidian Base, font-weight `600`)
- **Border Radius**: `rounded-full` (`9999px` pill)
- **Padding**: `px-6 py-3.5` (compact: `px-4 py-2`)
- **Hover State**: `hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]`
- **Icon**: Download icon prefix (e.g. `Download for Windows 11`)
- **Tailwind**: `bg-white text-[#070F19] rounded-full px-6 py-3.5 font-semibold text-[15px] hover:bg-slate-100 transition-all`

### B. Secondary Action Button
- **Background**: `#38BDF8` (Crystal Aqua)
- **Text Color**: `#070F19` (Obsidian Base, font-weight `600`)
- **Border Radius**: `rounded-full` (`9999px` pill)
- **Padding**: `px-6 py-3.5`
- **Hover State**: `hover:bg-[#0ea5e9] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)]`
- **Icon**: External link suffix (`↗`)
- **Tailwind**: `bg-[#38BDF8] text-[#070F19] rounded-full px-6 py-3.5 font-semibold text-[15px] hover:bg-[#0ea5e9] transition-all`

### C. Ghost / Tertiary Button
- **Background**: `transparent` or `rgba(12, 20, 31, 0.6)`
- **Border**: `1px solid #1E293B`
- **Text Color**: `#FFFFFF`
- **Border Radius**: `rounded-full` (`9999px` pill)
- **Hover State**: `hover:border-[#38BDF8] hover:text-[#38BDF8] hover:bg-[#141C27]`
- **Tailwind**: `border border-[#1E293B] bg-[#0C141F]/60 text-white rounded-full px-6 py-3.5 font-medium text-[15px] hover:border-[#38BDF8] hover:text-[#38BDF8] hover:bg-[#141C27] transition-all`

### D. Quick Log Telemetry Button
- **Background**: `#1E293B` (Slate 800)
- **Border**: `1px solid rgba(56, 189, 248, 0.2)`
- **Text Color**: `#38BDF8` (Crystal Aqua)
- **Font**: `JetBrains Mono`, `12px`, font-weight `600`
- **Border Radius**: `rounded-full`
- **Hover State**: `hover:bg-[#38BDF8] hover:text-[#070F19]`
- **Labels**: `+150ml`, `+250ml`, `+500ml`

---

## 5. Landing Page UI & Component Architecture

1. **Floating Navigation Capsule**:
   - Fixed top-centered pill container with `backdrop-blur-xl`, `#0C141F`/80 background, and `#1E293B` border.
   - Contains Water Buddy droplet mark, version badge (`v2.4`), navigation anchors, and compact Primary CTA button.
2. **Hero Section**:
   - Status badge: `🟢 PRODUCTION TOKENS | OCEANIC ABYSSAL EDITORIAL`.
   - Headline: *"Hydration, distilled to silence."*
   - Subtitle: *"The unified mineral design specification for Water Buddy. Engineered for atmospheric stillness, high accessibility, and tactile desktop ergonomics across web, Windows tray telemetry, and client touchpoints."*
   - Dual actions: Primary CTA (`Download for Windows 11`) + Ghost CTA (`Inspect Whitepaper`).
   - Micro telemetry indicators: Win32 Hook, < 24MB RAM, Zero-Telemetry Local Vault.
3. **Win32 Tray Companion HUD Widget**:
   - Visual preview of desktop tray companion.
   - SVG Circular Progress Ring (`#38BDF8` stroke, `#1E293B` track) displaying real-time intake percentage.
   - Live intake tracker (`1,850 / 2,500 ml`), session state (`Active Session 🟢`), remaining interval (`18m remaining`).
   - Interactive quick log pill buttons (`+150ml`, `+250ml`, `+500ml`).
4. **Biometric Calibrator**:
   - Dynamic formula slider (`45kg` to `120kg`) with real-time recalculation of daily intake (`weightKg * 35 + activityOffset`).
   - Activity intensity selector (Sedentary, Moderate, High Athletic).
   - Instant calculation of adaptive sip dosage per reminder interval.
5. **System Pillars & Feature Grid**:
   - 4-card grid: Windows Tray Kernel Architecture, Zero-Telemetry Stance, Biometric Adaptive Sip Engine, Atmospheric Mineral Presence.
   - Hairline borders (`#1E293B`), hover highlight (`#38BDF8`/50), monospace index stamps (`01`–`04`).
6. **Pricing Card**:
   - Header: *"Transparent Ownership in INR (₹)"*.
   - Flat lifetime license (`₹899`), zero subscriptions, lifetime engine updates.
   - Emerald checklist (`✓ #34D399`) and Secondary Action Button (`Transmit Dispatch ↗`).
7. **Footer Status Capsule**:
   - Heartbeat badge: `🟢 All systems operational · Windows 11 Certified`.
   - Copyright and v2.4 build tag.

---

## 6. Development Rules for Agents

- **Always** import tokens from `@/theme/tokens` or utilize CSS custom properties `--color-background`, `--color-surface`, `--color-border`, `--color-accent`.
- **Never** use generic bright blues, reds, or purples. All accents must strictly use Crystal Aqua (`#38BDF8`) or Emerald (`#34D399`).
- **Never** create square or semi-rounded primary buttons; all primary action buttons are full pills (`rounded-full`).
- **Always** ensure buttons have high contrast: Primary button must have `#FFFFFF` background with `#070F19` text.
