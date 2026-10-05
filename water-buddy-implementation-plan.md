# Water Buddy: Desktop Hydration Widget
### Step-by-Step Implementation Plan (MERN + Electron)

---

## 1. Vision

An animated human character walks across your desktop with a water bottle at fixed intervals (30 / 45 min, configurable), asks "Did you drink water?" in a tooltip, and reacts to your answer:

- **Yes** → character runs off happily; intake is added to today's total.
- **No** → character runs off angry/sad; a "missed" event is logged.

A settings screen controls the character, message style, frequency, and daily goal. A dashboard shows progress and history.

---

## 2. The Key Architecture Decision

**A pure MERN web app cannot draw on your desktop.** Browsers can't render outside their window. To get a character walking over other apps, we wrap React in **Electron**, which lets you create transparent, frameless, always-on-top windows.

| Layer | Technology | Role |
|---|---|---|
| Desktop shell | **Electron** | Transparent overlay window, system tray, auto-start, native timers |
| UI | **React** (Vite) | Settings screen, dashboard, overlay character + tooltip |
| Animation | **Sprite sheets** (CSS/Canvas) or **Lottie / Rive** | Walk, happy-run, angry-run, idle |
| Backend | **Node + Express** | Auth, settings sync, logs, stats |
| Database | **MongoDB** (Atlas) | Users, settings, water logs |
| Local storage | **electron-store** | Offline cache + queue of unsynced logs |

**Offline-first:** the widget must work without internet. It reads settings from local storage and syncs to the backend when online.

---

## 3. System Architecture

```
┌───────────────────────── Electron App ─────────────────────────┐
│                                                                │
│  Main Process (Node)                                           │
│   ├─ Scheduler (setInterval / node-schedule)                   │
│   ├─ Window manager (settings window + overlay window)         │
│   ├─ Tray icon + menu (Pause, Settings, Quit)                  │
│   ├─ electron-store (local settings + log queue)               │
│   └─ Sync service → REST API                                   │
│                                                                │
│  Renderer 1: Settings / Dashboard (React)                      │
│  Renderer 2: Overlay (React, transparent, click-through)       │
│                                                                │
└───────────────────────────────┬────────────────────────────────┘
                                │ HTTPS (JWT)
                      ┌─────────▼─────────┐
                      │ Express REST API  │
                      └─────────┬─────────┘
                                │
                      ┌─────────▼─────────┐
                      │     MongoDB       │
                      └───────────────────┘
```

---

## 4. Core Mechanics (How the Tricky Parts Work)

### 4.1 Overlay window
Create a `BrowserWindow` with:
```js
new BrowserWindow({
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  skipTaskbar: true,
  hasShadow: false,
  focusable: false,          // doesn't steal focus from your work
  width: screenWidth,
  height: 300,               // a strip along the bottom of the screen
  x: 0,
  y: screenHeight - 300,
  webPreferences: { preload: 'preload.js', contextIsolation: true }
});
overlay.setAlwaysOnTop(true, 'screen-saver');
overlay.setIgnoreMouseEvents(true, { forward: true }); // click-through by default
```

### 4.2 Click-through, but clickable character
The overlay is click-through so it never blocks your work. When the mouse hovers over the character/tooltip, the renderer sends an IPC message to turn click-through **off**; when the mouse leaves, it turns it back **on**.

### 4.3 Walking animation
- Overlay renders the character with CSS `transform: translateX()` driven by `requestAnimationFrame`, while the sprite sheet cycles walk frames.
- State machine: `hidden → walking-in → asking → (happy-run | angry-run) → hidden`.
- Direction randomly left→right or right→left; flip sprite with `scaleX(-1)`.

### 4.4 Scheduler
- Lives in the **main process** (not the renderer) so it survives window changes.
- On tick: send `show-reminder` IPC to overlay.
- Handle edge cases: **snooze**, **pause**, **do-not-disturb hours** (e.g., 10pm–8am), **system sleep/resume** (reset timer on resume), **fullscreen apps** (optional: skip if a game/presentation is fullscreen).

### 4.5 Daily goal calculation
Common baseline formula (a general guideline, not medical advice):

```
baseGoal (ml) = weightKg × 35
+ 500 ml if activityLevel = moderate
+ 1000 ml if activityLevel = high
+ 300–500 ml if climate = hot
```
Alternatively, the user types a **manual goal**. Always allow override. Show a small note: "General estimate, not medical advice."

### 4.6 "Yes" = how much water?
The sip size is **auto-calculated** from your daily goal and your reminder schedule, so the reminders add up to the goal by the end of the day. The user can switch to a **manual sip size** (e.g., a 250 ml glass) in settings.

**Auto formula:**
```
awakeMinutes      = minutes between quiet-hours end and quiet-hours start
remindersPerDay   = floor(awakeMinutes / intervalMin)
baseSipMl         = dailyGoalMl / remindersPerDay
sipMl             = clamp(roundTo(baseSipMl, 25), 100, 500)
```

Example: goal 2450 ml, awake 8:00–22:00 (840 min), interval 45 min → 18 reminders → 136 ml → rounded to **150 ml** per "Yes".

**Adaptive sip (recommended):** recompute at each reminder so you can catch up or relax during the day:
```
remainingGoalMl   = dailyGoalMl − consumedTodayMl
remainingReminders = floor(minutesUntilQuietHours / intervalMin)
sipMl             = clamp(roundTo(remainingGoalMl / max(remainingReminders, 1), 25), 100, 500)
```
If you answer "No" or miss reminders, the next sip grows slightly. If you're ahead of goal, it shrinks (down to the 100 ml minimum). Once the goal is reached, reminders can stop or switch to a light "goal done!" message.

**Tooltip:** shows the calculated amount on the button, e.g. `Yes (150 ml)` and `No`. Optional extra buttons for `Yes (250 ml)` / `Yes (500 ml)` let the user log a different amount when they actually drank more.

The formula lives in `packages/shared` next to the goal calculator, so the desktop app and server use identical logic. Like the goal, this is a general estimate, not medical advice.

---

## 5. Data Models (MongoDB / Mongoose)

**User**
```js
{ email, passwordHash, name, createdAt }
```

**Profile**
```js
{ userId, weightKg, heightCm, age, gender, activityLevel, climate,
  goalMode: 'auto' | 'manual', manualGoalMl, computedGoalMl }
```

**WidgetSettings**
```js
{ userId, characterId, messageStyle: 'friendly'|'funny'|'strict'|'custom',
  customMessages: [String], intervalMin: 30|45|60|custom,
  sipMode: 'auto'|'manual', manualSipMl: 250, quietHours: { start, end }, soundOn, 
  walkSpeed, spawnSide: 'left'|'right'|'random', launchOnStartup }
```

**WaterLog**
```js
{ userId, timestamp, amountMl, response: 'yes'|'no'|'snoozed'|'ignored',
  source: 'reminder'|'manual' }
```

**Character** (static catalog, could be a JSON file at first)
```js
{ id, name, spriteSheets: { walk, happy, angry, idle }, frameSize, fps }
```

---

## 6. REST API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT |
| GET/PUT | `/api/profile` | Health profile; recompute goal on update |
| GET/PUT | `/api/settings` | Widget settings |
| POST | `/api/logs` | Add a log (supports batch for offline sync) |
| GET | `/api/logs?date=` | Logs for a day/range |
| GET | `/api/stats/today` | Total, goal, % complete |
| GET | `/api/stats/weekly` | 7-day chart data |
| GET | `/api/characters` | Character catalog |

Validation with **Zod/Joi**, auth with **JWT**, rate limiting with **express-rate-limit**.

---

## 7. Folder Structure (Monorepo)

```
water-buddy/
├─ apps/
│  ├─ desktop/                 # Electron + React
│  │  ├─ electron/
│  │  │  ├─ main.js
│  │  │  ├─ preload.js
│  │  │  ├─ scheduler.js
│  │  │  ├─ windows.js
│  │  │  ├─ tray.js
│  │  │  └─ sync.js
│  │  └─ src/
│  │     ├─ overlay/           # character + tooltip
│  │     ├─ settings/          # settings screens
│  │     ├─ dashboard/         # charts
│  │     └─ shared/
│  └─ server/                  # Express API
│     ├─ models/
│     ├─ routes/
│     ├─ controllers/
│     ├─ middleware/
│     └─ utils/goalCalculator.js
├─ packages/shared/            # shared constants + goal formula
└─ package.json (workspaces)
```

---

## 8. Implementation Phases

### Phase 0: Setup (½ day)
1. Create monorepo with npm workspaces.
2. Scaffold React + Vite inside `apps/desktop`; add Electron + `electron-builder`.
3. Scaffold Express server; connect MongoDB Atlas.
4. ESLint, Prettier, `.env` handling, Git repo.

**Done when:** an Electron window opens showing a React page, and the server returns `/health`.

---

### Phase 1: Overlay + Character (2–3 days) ⭐ the "wow" part
1. Create the transparent, always-on-top overlay window (§4.1).
2. Build the click-through toggle with hover detection (§4.2).
3. Create a placeholder character (a simple sprite sheet).
4. Implement the state machine: walk in → pause → tooltip → exit.
5. Add a dev-only "Trigger now" button/shortcut.

**Done when:** pressing a hotkey makes the character walk across the screen over any app.

---

### Phase 2: Tooltip + Yes/No Reactions (1–2 days)
1. Build a speech-bubble tooltip component that follows the character.
2. Add Yes / No buttons, with the calculated sip shown on the Yes button (+ optional alternative amounts).
3. **Yes** → switch to happy-run animation, exit to the opposite side.
4. **No** → switch to angry/sad-run animation, exit to the opposite side.
5. Auto-timeout: if no click in ~30s, treat as `ignored` and exit politely.
6. Send the response to the main process via IPC.

**Done when:** both reaction paths animate correctly and emit an event.

---

### Phase 3: Scheduler + Local Storage (1–2 days)
1. Build the scheduler in the main process using the configured interval.
2. Persist settings and logs locally with `electron-store`.
3. Implement pause/resume/snooze, quiet hours, and sleep/resume handling.
4. Add the system tray: Pause 1h, Trigger now, Open settings, Quit.
5. Add launch-on-startup (`app.setLoginItemSettings`).

**Done when:** the widget runs by itself every N minutes and survives reboot.

---

### Phase 4: Settings Screen (2 days)
1. Tabs: **Character**, **Messages**, **Schedule**, **Goal**, **General**.
2. **Character:** grid of characters with a live animated preview.
3. **Messages:** style presets + custom message list; preview in a bubble.
4. **Schedule:** interval (30/45/60/custom), quiet hours, spawn side, speed.
5. **Goal:** weight/height/age/activity/climate form → live computed goal; or manual goal toggle. Add a **sip size** toggle (Auto / Manual) with a live preview, e.g. "18 reminders × 150 ml".
6. Settings changes apply instantly to the scheduler and overlay (via IPC).

**Done when:** every setting visibly changes widget behavior without restart.

---

### Phase 5: Goal Logic + Dashboard (2 days)
1. Implement `goalCalculator` in `packages/shared` (used by client + server).
2. Implement `sipCalculator` in `packages/shared` (auto + adaptive modes, §4.6). "Yes" adds the calculated sip (or the manual sip) to today's total (local first).
3. Dashboard: today's progress ring, ml consumed / goal, streak, weekly bar chart (Recharts).
4. Manual "+ add water" button and undo last entry.
5. Daily reset at midnight (local timezone aware).

**Done when:** answering Yes updates the ring and weekly chart correctly.

---

### Phase 6: Backend + Sync (2–3 days)
1. Auth (register/login, JWT, bcrypt) and a login screen in the app.
2. Build Profile, Settings, Logs, and Stats endpoints (§6).
3. Offline queue: store unsynced logs locally, batch-POST when online, dedupe with client-generated IDs.
4. Conflict rule: last-write-wins for settings, append-only for logs.
5. Optional later: a web dashboard reusing the same React components.

**Done when:** logs and settings sync across two machines.

---

### Phase 7: Polish (2–3 days)
1. Real character art, smooth easing, shadows, footstep sound (optional).
2. Multiple characters and per-character reactions.
3. Smart reminders: if you're ahead of goal, reduce frequency; if behind late in the day, nudge more.
4. Streaks, badges, and a small celebration animation when the goal is hit.
5. Multi-monitor support (choose which screen).
6. Accessibility: keyboard shortcut to answer (Y / N), reduced-motion option.

---

### Phase 8: Package + Release (1–2 days)
1. Build installers with `electron-builder` (Windows `.exe`/NSIS first).
2. Auto-update via `electron-updater` (GitHub Releases).
3. Deploy the API (Render / DigitalOcean) and MongoDB Atlas.
4. Crash logging (Sentry) and a basic landing page.

---

## 9. Timeline Summary

| Phase | Focus | Est. time |
|---|---|---|
| 0 | Setup | 0.5 day |
| 1 | Overlay + character | 2–3 days |
| 2 | Tooltip + reactions | 1–2 days |
| 3 | Scheduler + local storage | 1–2 days |
| 4 | Settings screen | 2 days |
| 5 | Goal logic + dashboard | 2 days |
| 6 | Backend + sync | 2–3 days |
| 7 | Polish | 2–3 days |
| 8 | Release | 1–2 days |
| **Total** | **MVP to release** | **~2–3 weeks** |

**MVP shortcut:** Phases 0–5 give a fully working local widget (no backend) in about 8–10 days. Add the backend after you love the feel of it.

---

## 10. Animation & Art Options

| Option | Pros | Cons |
|---|---|---|
| **Sprite sheets (PNG)** | Simple, full control, tiny code | Need frames for every action |
| **Lottie (JSON)** | Vector, crisp, many free assets | Limited interactivity |
| **Rive** | State machines built in (walk/happy/angry), very smooth | Learning curve |
| **Spine / DragonBones** | Skeletal animation, best for rich characters | Heavier setup |

**Recommendation:** start with **sprite sheets** for the MVP; move to **Rive** if you want smooth state transitions. For free assets, check itch.io, OpenGameArt, and LottieFiles (check licenses).

---

## 11. Risks & Gotchas

| Risk | Mitigation |
|---|---|
| Transparent window flicker / black background on some GPUs | Test early; disable hardware acceleration only if needed |
| Overlay blocks clicks on other apps | Use `setIgnoreMouseEvents(true, {forward:true})` and toggle on hover |
| Annoying users | Quiet hours, snooze, "pause 1 hour", reduced-motion mode |
| Timer drift / sleep | Recompute next fire time from timestamps, not by chaining `setInterval` |
| Fullscreen games/videos | Optional detection to skip or delay reminders |
| Health formula misuse | Label as a general estimate; allow manual goal override |
| macOS/Linux differences | Target Windows first; test others later |

---

## 12. Testing Checklist

- [ ] Character appears over browser, IDE, and fullscreen video
- [ ] Clicking elsewhere is never blocked by the overlay
- [ ] Yes and No paths both animate and log correctly
- [ ] Interval change takes effect immediately
- [ ] Quiet hours respected; snooze and pause work
- [ ] Laptop sleep/wake doesn't double-fire reminders
- [ ] Offline logs sync with no duplicates
- [ ] Midnight rollover resets the day correctly
- [ ] Multi-monitor placement works
- [ ] Installer installs, auto-starts, and updates

---

## 13. Suggested Next Steps

1. Decide the **name** (Water Buddy is a placeholder).
2. Pick the **animation approach** (sprite sheets recommended).
3. Confirm **Windows-first**.
4. Start **Phase 0 + Phase 1**: get a character walking across your screen. That moment sets the tone for the whole project.

---

## 14. Future Ideas

- Mobile companion app syncing the same account
- Other reminders (stretch, eye rest, posture) using the same character engine
- Character shop / unlockables for hitting streaks
- Team leaderboards
- Integration with smart bottles
- Sound packs and voice lines
