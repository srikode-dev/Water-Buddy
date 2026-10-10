# Water Buddy — Monorepo Architecture & Design System Guidelines

> **Mandatory Visual & Component Source of Truth**:  
> [`docs/Water Buddy - Design System & UI Kit.svg`](file:///c:/REACT/Water-Buddy/docs/Water%20Buddy%20-%20Design%20System%20%26%20UI%20Kit.svg)  
> Web Theme Tokens: [`apps/web/theme/design-system.json`](file:///c:/REACT/Water-Buddy/apps/web/theme/design-system.json)  
> TypeScript Theme Constants: [`apps/web/theme/tokens.ts`](file:///c:/REACT/Water-Buddy/apps/web/theme/tokens.ts)

All web, desktop (Electron), and client interfaces **MUST** strictly follow the visual identity, color palette, typography hierarchy, button states, and component architecture defined herein.

---

## 1. Design Identity: Oceanic Abyssal Editorial

- **Descriptor**: Oceanic Abyssal Editorial
- **Atmosphere**: Silent, mineral depth, high accessibility, tactile desktop ergonomics.
- **Canvas Base**: `#070F19` (Obsidian Base)
- **Cards & Surfaces**: `#0C141F` (Abyssal Slate), `#141C27` (Mineral Low)
- **Borders & Dividers**: `#1E293B` (Slate 800), `#334155` / `#475569`
- **Primary Interactive Accent**: `#38BDF8` (Crystal Aqua)
- **Telemetry / Status**: `#34D399` (Accent Emerald)
- **Typography Colors**: `#FFFFFF` (Primary Text / White), `#CBD5E1` (Secondary), `#94A3B8` (Muted), `#64748B` (Subtle)

---

## 2. Typography Rules

1. **Headings & Display**: `Space Grotesk` (weights 500, 600, 700)
2. **Body & UI Controls**: `Plus Jakarta Sans` (weights 400, 500, 600)
3. **Telemetry & Monospace**: `JetBrains Mono` (weights 400, 500, 600)

---

## 3. Button Hierarchy (Strictly Follow According to SVG)

| Variant | Background | Text Color | Shape | Usage & Example |
| :--- | :--- | :--- | :--- | :--- |
| **Primary CTA** | `#FFFFFF` (Pure White) | `#070F19` (Obsidian Base) | `rounded-full` (pill) | Main action, e.g. *"Download for Windows 11"* with download icon |
| **Secondary Action** | `#38BDF8` (Crystal Aqua) | `#070F19` (Obsidian Base) | `rounded-full` (pill) | Vibrant action, e.g. *"Transmit Dispatch ↗"* with external arrow |
| **Ghost / Outline** | `transparent` or `#0C141F`/60 (border `#1E293B`) | `#FFFFFF` (hover `#38BDF8`) | `rounded-full` (pill) | Tertiary action, e.g. *"Inspect Whitepaper"* |
| **Quick Log Pill** | `#1E293B` (border `rgba(56,189,248,0.2)`) | `#38BDF8` | `rounded-full` | Intake logging, e.g. `+150ml`, `+250ml`, `+500ml` (mono) |

---

## 4. UI Components Architecture

- **Floating Navigation Capsule**: Centered pill with backdrop blur (`12px`), brand droplet icon, nav links, and compact primary button.
- **Hero Section**: Badge (`🟢 PRODUCTION TOKENS | OCEANIC ABYSSAL EDITORIAL`), display heading *"Hydration, distilled to silence."*, dual CTAs.
- **Win32 Tray Companion HUD**: Circular SVG progress gauge (`#38BDF8`), intake volume readout (`1,850 / 2,500 ml`), session state, and quick log pills.
- **Biometric Calibrator**: Range slider (`45kg`–`120kg`), activity tiers, real-time formula computation of daily goal and adaptive sip volume.
- **Feature Pillars Grid**: 4 cards with monospace index badges and subtle hover ring.
- **Pricing Card**: Transparent INR (`₹899`) lifetime license, emerald checks (`#34D399`), and secondary CTA button.
- **Footer Status Capsule**: Heartbeat status pill (`🟢 Windows 11 Certified`).
