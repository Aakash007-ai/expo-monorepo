# @cars24/mobile

**The SDUI client.** An Expo app that renders the Cars24 home page from JSON payloads using `@cars24/sdui-core`. Built for the Cars24 Mobile Engineer SDUI assignment.

**What it does:** fetches a JSON payload from a local HTTP server, parses it with the SDUI engine, and renders the screen. Category chips swap content via JSON (not client logic), demonstrating real server-driven UI.

---

## Quick Start

### 1. Install dependencies (from monorepo root)

```bash
npm install
```

### 2. Start the mock server

```bash
npm run server
```

This serves `mock-server/landing.json` on `http://localhost:4000`.

### 3. Run the app

```bash
npm start
```

Expo prints a QR code. Scan it with **Expo Go** (iOS/Android) to see the app on your phone. No emulator setup required.

---

## Project Structure

```
apps/mobile/
├── src/
│   ├── app/                 # File-based routing (expo-router)
│   │   ├── _layout.tsx      # Tab layout (splash screen, theme provider)
│   │   ├── index.tsx        # Home screen (the SDUI renderer)
│   │   └── explore.tsx      # Explore tab (template placeholder)
│   ├── components/          # App-specific UI components
│   │   ├── animated-icon.tsx
│   │   ├── app-tabs.tsx
│   │   ├── hint-row.tsx
│   │   └── themed-text.tsx
│   ├── constants/
│   │   └── theme.ts         # Design tokens (spacing, colors, typography)
│   └── hooks/               # Custom hooks (color scheme, theme)
├── assets/                  # Images, icons
├── scripts/
│   └── reset-project.js     # Reset to blank state (Expo template utility)
├── app.json                 # Expo config (name, slug, orientation, icons)
├── package.json             # @cars24/mobile
└── tsconfig.json            # TypeScript config (strict, bundler resolution)
```

---

## Tech Stack

- **Expo SDK 57** — React 19.2, React Native 0.86, TypeScript 6
- **expo-router** — File-based routing (`src/app/` directory)
- **@cars24/sdui-core** — Generic SDUI engine (workspace dependency)

---

## How to Add a New Screen

1. Create a new file in `src/app/` (e.g., `src/app/details.tsx`).
2. Export a default React component.
3. Expo-router auto-generates a route for it.

For SDUI-driven screens, the component fetches a JSON payload and passes it to `<SDUIProvider />` from `@cars24/sdui-core`.

---

## How to Add a New Component Type

1. Create the component in `src/components/` (e.g., `CarCard.tsx`).
2. Register it with the SDUI engine's `ComponentRegistry`:

```tsx
import { ComponentRegistry } from '@cars24/sdui-core';
import { CarCard } from './components/CarCard';

const registry = new ComponentRegistry();
registry.register('CAR_CARD', CarCard);
```

3. The engine will mount `<CarCard />` whenever the JSON payload contains `{ "type": "CAR_CARD" }`.

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` | Run on Android (Expo) |
| `npm run ios` | Run on iOS (Expo, macOS only) |
| `npm run web` | Run in the browser |
| `npm run lint` | Lint with ESLint (Expo) |
| `npm run reset-project` | Reset to blank state (moves starter code to `example/`) |

---

## Performance Benchmarking

The assignment requires a `PERF.md` comparing the SDUI version against a static hardcoded clone. Both versions will be measured on the same device (release build) for:

- **TTR** (Time to Render) — first paint.
- **TTI** (Time to Interactive) — user can tap.
- **Full page time** — all sections visible.
- **JSON parse vs view build** — breakdown of SDUI overhead.
- **Scroll jank** — frames dropped during scroll.

The static clone lives in `src/screens/static/` (when built).

---

## Related

- [Root README](../../README.md) — Monorepo overview.
- [ADR-0002: Interactions](../../docs/adr/0002-interactions-chips.md) — How the chip interaction works.
- [ADR-0005: Payload delivery](../../docs/adr/0005-payload-delivery.md) — Why we use a real HTTP server.
