# Cars24 SDUI Monorepo

A reusable **server-driven UI (SDUI)** foundation: an Expo mobile app that renders screens from JSON payloads, plus a generic renderer engine. Built for the Cars24 Mobile Engineer SDUI assignment, structured as a monorepo so future teams can adopt the SDUI engine, extend it, or use the repo as a reference for their own SDUI systems.

**What's inside:**
- `apps/mobile` — Expo app (SDK 57, React 19.2, TypeScript) that renders the Cars24 home page from JSON.
- `packages/sdui-core` — Generic SDUI engine: JSON parser, component registry, action dispatcher, unknown-component fallback. Free of any screen-specific logic.
- `docs/adr/` — Architecture Decision Records (what we decided and why).
- `docs/glossary.md` — Shared vocabulary for SDUI concepts.

---

## Quick Start

### 1. Install dependencies

From the monorepo root:

```bash
npm install
```

This installs and hoists deps for all workspaces (`apps/mobile`, `packages/sdui-core`).

### 2. Run the mock server (once built)

The SDUI engine fetches a JSON payload from a local HTTP server (not a bundled file — see [ADR-0005](docs/adr/0005-payload-delivery.md)).

```bash
npm run server
```

This will serve `mock-server/landing.json` on `http://localhost:4000`. Edit the JSON, reload the app, and the screen changes — no client code. The mock server is built in a later phase.

### 3. Run the app

In a second terminal:

```bash
npm start
```

Expo prints a QR code. Scan it with **Expo Go** (iOS/Android) to see the app on your phone. No emulator setup required.

---

## Project Structure

```
cars24_ai_react_antive/
├── apps/
│   └── mobile/              # Expo app (the SDUI client)
│       ├── src/app/         # File-based routing (expo-router)
│       ├── src/components/  # App-specific UI components
│       ├── package.json     # @cars24/mobile
│       └── app.json         # Expo config
├── packages/
│   └── sdui-core/           # Generic SDUI engine
│       ├── src/             # Registry, dispatcher, parser, state store
│       ├── package.json     # @cars24/sdui-core
│       └── tsconfig.json
├── mock-server/             # Local HTTP server for JSON payloads
├── docs/
│   ├── adr/                 # Architecture Decision Records
│   │   ├── README.md        # ADR index
│   │   └── 0001-*.md        # Individual decisions
│   └── glossary.md          # SDUI vocabulary
├── schema/                  # JSON schema design (when engine is built)
├── package.json             # Root workspace config
├── CLAUDE.md                # AI agent context
└── spec.md                  # Home-page component list (8 sections)
```

---

## Architecture Decisions

The JSON schema design (the heart of the assignment) is in [`schema/SCHEMA_DESIGN.md`](schema/SCHEMA_DESIGN.md). Key design choices are recorded as ADRs in `docs/adr/`:

- **[ADR-0001](docs/adr/0001-build-scope.md)** — Build scope: render the full Cars24 home page (8 sections) from JSON.
- **[ADR-0002](docs/adr/0002-interactions-chips.md)** — Flagship interaction: category chips swap content via JSON, not client logic.
- **[ADR-0003](docs/adr/0003-action-state-contract.md)** — Action/state contract: server-push values into a page-level state store.
- **[ADR-0004](docs/adr/0004-platform-expo.md)** — Platform: Expo (managed workflow) for fast Windows setup.
- **[ADR-0005](docs/adr/0005-payload-delivery.md)** — Payload delivery: real local HTTP server (not bundled JSON).

---

## Assessment Context

This repo is built for the **Cars24 Mobile Engineer SDUI Assignment** (see [`cars24_mobile_assessment.md`](cars24_mobile_assessment.md)). The assignment requires:

- An SDUI engine that renders screens from JSON (no client logic per screen).
- A static hardcoded clone for performance benchmarking.
- Documentation: `README.md`, `PERF.md`, `COVERAGE.md`, `AI_WORKFLOW.md`.
- A 3–5 minute screen recording showing the system in action.

The "surprise screen" test: given an unseen JSON payload with unknown component types, the system should render gracefully (fallback UI, no crash) and require only new component registrations — zero client logic changes.

---

## Scripts

| Command | Description |
|---|---|
| `npm install` | Install all workspace deps (hoisted) |
| `npm start` | Start the Expo dev server (`apps/mobile`) |
| `npm run android` | Run the app on Android (Expo) |
| `npm run typecheck` | Typecheck all workspaces |
| `npm run test` | Run tests across workspaces |
| `npm run server` | Start the mock JSON server (when built) |

---

## License

UNLICENSED — internal to Cars24 assessment context.
