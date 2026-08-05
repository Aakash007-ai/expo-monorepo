# Implementation Plan — Cars24 SDUI Assignment

> Detailed build roadmap derived from the 12-phase execution plan and PROJECT_STATUS.md.
> Each phase has: goal, dependencies, deliverables, build steps, verification, and time estimate.

**Status:** Planning complete, ready for implementation  
**Current Phase:** Phase 0-1 complete, Phase 2 next  
**Last Updated:** 2026-08-05  
**Architecture:** Clean Architecture (Repository → Use-Case → Presentation)  
**Key Interaction:** Tenure selector + EMI update + bottom sheet (per assignment demo checklist)

---

## Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Components    │  │   Screens       │  │   View Models   │ │
│  │   (UI only)     │  │   (routing)     │  │   (hooks)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Use Cases     │  │   Entities      │  │   Repository    │ │
│  │   (business)    │  │   (types)       │  │   Interfaces    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Repository    │  │   Data Sources  │  │   SDUI Engine   │ │
│  │   Impl          │  │   (mock API)    │  │   (core pkg)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure (Clean Architecture)

```
apps/mobile/src/
├── app/                      # Expo Router screens (presentation)
│   ├── _layout.tsx           # Root layout with SDUIProvider
│   ├── index.tsx             # SDUI landing page
│   └── static.tsx            # Hardcoded comparison version
│
├── components/               # UI components (presentation layer)
│   ├── ui/                   # Generic reusable components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Chip.tsx
│   │   ├── BottomSheet.tsx
│   │   └── ...
│   └── sections/             # SDUI-registered section components
│       ├── HeaderBar.tsx
│       ├── ChipRail.tsx
│       ├── BannerRail.tsx
│       ├── ProductRail.tsx
│       ├── TenureSelector.tsx
│       └── ...
│
├── domain/                   # Business logic layer
│   ├── entities/             # Type definitions
│   │   ├── SDUIPage.ts
│   │   ├── SDUINode.ts
│   │   ├── SDUIAction.ts
│   │   └── ...
│   ├── usecases/             # Business logic / orchestration
│   │   ├── FetchPageUseCase.ts
│   │   ├── DispatchActionUseCase.ts
│   │   ├── UpdateStateUseCase.ts
│   │   └── ...
│   └── repositories/         # Repository interfaces
│       └── IPageRepository.ts
│
├── data/                     # Data layer
│   ├── repositories/         # Repository implementations
│   │   └── PageRepository.ts
│   └── datasources/          # Data sources
│       └── MockApiDataSource.ts
│
├── core/                     # App-level core (wires sdui-core)
│   ├── registry.ts           # Component registration
│   ├── navigation.ts         # Navigation service
│   └── linking.ts            # Deep linking service
│
└── sdui/                     # SDUI integration layer
    ├── SDUIProvider.tsx      # Context + state
    ├── useSDUI.ts            # Hook for components
    └── renderer.tsx          # Recursive renderer

packages/sdui-core/src/       # Generic SDUI engine (domain-agnostic)
├── types.ts                  # Schema types
├── StateStore.ts             # Reactive state store
├── ComponentRegistry.ts      # Type → component map
├── ActionDispatcher.ts       # Action routing
├── FallbackComponent.tsx     # Unknown type handling
├── parser.ts                 # JSON validation
└── index.ts                  # Exports
```

### Data Flow Diagram

```
┌──────────────┐     GET /page/home      ┌─────────────────┐
│   Mock API   │ ──────────────────────► │  PageRepository │
│  (localhost) │                          │   (data layer)  │
└──────────────┘                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ FetchPageUseCase│
                                          │  (domain layer) │
                                          └────────┬────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SDUI ENGINE                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Parser    │───►│ StateStore  │───►│  Renderer   │         │
│  │ (validate)  │    │  (reactive) │    │ (recursive) │         │
│  └─────────────┘    └──────┬──────┘    └──────┬──────┘         │
│                            │                   │                │
│                            ▼                   ▼                │
│                     ┌─────────────┐    ┌─────────────┐         │
│                     │ Dispatcher  │◄───│  Registry   │         │
│                     │  (actions)  │    │ (type→comp) │         │
│                     └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │   Components    │
                                          │  (sections/*)   │
                                          └─────────────────┘
```

### Tenure/EMI Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCT_RAIL COMPONENT                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Car Card                                                │   │
│  │  ┌─────────────┐  Price: ₹3.86 lakh                      │   │
│  │  │  Car Image  │  EMI: ₹6,819/m*  ←── updated by state   │   │
│  │  └─────────────┘                                         │   │
│  │                                                          │   │
│  │  [12 months] [24 months] [36 months]  ← TenureSelector  │   │
│  │       │                                                  │   │
│  │       │ TAP                                              │   │
│  │       ▼                                                  │   │
│  │  ┌─────────────────────────────────────────────────────┐│   │
│  │  │ Action: {                                           ││   │
│  │  │   type: "SET_STATE",                                ││   │
│  │  │   key: "selectedTenure",                            ││   │
│  │  │   value: "24"                                       ││   │
│  │  │ }                                                   ││   │
│  │  └─────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STATE STORE                                │
│  state.selectedTenure = "24"                                   │
│  state.emiByTenure = { "12": 13638, "24": 6819, "36": 4546 }   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EMI DISPLAY (reactive)                        │
│  Reads state.selectedTenure → looks up emiByTenure → re-renders│
│  EMI: ₹6,819/m*                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BOTTOM SHEET ACTION                           │
│  Action: { type: "OPEN_BOTTOM_SHEET", target: "tenure_sheet" } │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Bottom Sheet Content                                    │   │
│  │  • Detailed EMI breakdown                                │   │
│  │  • Interest rate info                                    │   │
│  │  • Down payment options                                  │   │
│  │  [Close]                                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Screen-to-Section Mapping

| Screen Section | Component Type | State Bindings | Actions |
|----------------|----------------|----------------|---------|
| 1. Header/Location/Search | `HEADER_BAR` | — | `OPEN_LOCATION_PICKER`, `NAVIGATE` |
| 2. Category Chips | `CHIP_RAIL` | `selectedCategory` | `SET_STATE` |
| 3. Promo Banners | `BANNER_RAIL` | — | `NAVIGATE`, `OPEN_URL` |
| 4. Value-Prop Grid | `VALUE_PROP_GRID` | — | `NAVIGATE` |
| 5. Loans Circular Rail | `CIRCULAR_RAIL` | — | `NAVIGATE` |
| 6. Car-Check Grid | `METRIC_GRID` | — | `NAVIGATE` |
| 7. Product Rail | `PRODUCT_RAIL` | `selectedCategory`, `selectedTenure` | `SET_STATE`, `TOGGLE_WISHLIST`, `OPEN_BOTTOM_SHEET` |
| 8. Vehicle Manager | `VEHICLE_MANAGER` | — | `NAVIGATE`, `OPEN_BOTTOM_SHEET` |
| 9. Showrooms | `SHOWROOM_RAIL` | — | `NAVIGATE`, `OPEN_URL` |

### Assignment Demo Checklist Mapping

| Assignment Requirement | Implementation Location | Phase |
|------------------------|------------------------|-------|
| Page rendering from JSON | `SDUIRenderer` + `mock-server/landing.json` | Phase 3 |
| Tenure selector + EMI update | `TenureSelector` component + `SET_STATE` action | Phase 3.5.7 |
| Bottom sheet working | `BottomSheet` component + `OPEN_BOTTOM_SHEET` action | Phase 3.6 |
| Unknown-component fallback | `FallbackComponent` + demo JSON variant | Phase 4 |
| Live JSON edit → UI change | Mock server hot-reload + app refresh | Phase 11 |

---

## Quick Reference

| Phase | Goal | Status | Est. Time |
|-------|------|--------|-----------|
| 0 | Repo scaffold + tooling | ✅ Done | — |
| 1 | JSON schema design | ✅ Done | — |
| 2 | Core SDUI engine | 🔴 Next | 3-4h |
| 3 | Landing page components + JSON | 🔴 Pending | 4-5h |
| 4 | Unknown component fallback demo | 🔴 Pending | 30min |
| 5 | Static version (hardcoded) | 🔴 Pending | 2h |
| 6 | Benchmark + PERF.md | 🔴 Pending | 1-2h |
| 7 | Coverage + COVERAGE.md | 🔴 Pending | 45min |
| 8 | Versioning story in README | 🔴 Pending | 30min |
| 9 | README updates | 🔴 Pending | 30min |
| 10 | AI_WORKFLOW.md | 🔴 Pending | 30min |
| 11 | Screen recording | 🔴 Pending | 1h |
| 12 | Final pass | 🔴 Pending | 30min |

**Total estimated build time:** 13-16 hours

---

## Phase 0 — Repo Scaffolding ✅ COMPLETE

**Goal:** Initialize monorepo with workspaces, Expo app, sdui-core package, and tooling.

**Dependencies:** None

**Deliverables:**
- [x] Git repo initialized with `.gitignore`
- [x] Monorepo structure (`apps/`, `packages/`, `docs/`, `schema/`)
- [x] Root `package.json` with workspaces
- [x] `apps/mobile` — Expo SDK57 app skeleton
- [x] `packages/sdui-core` — package scaffold
- [x] Initial commit: `440ed66`

**Verification:**
- `npm install` succeeds
- `npm start` fails (entry files deleted — expected blocker)
- `npm run typecheck` passes on existing code

---

## Phase 1 — JSON Schema Design ✅ COMPLETE

**Goal:** Design the SDUI JSON schema before writing engine code.

**Dependencies:** Phase 0

**Deliverables:**
- [x] `schema/SCHEMA_DESIGN.md` — comprehensive schema design
- [x] Top-level page structure defined
- [x] Component node shape defined
- [x] Action contract defined (SET_STATE, TOGGLE_WISHLIST, NAVIGATE, OPEN_URL, NOOP)
- [x] State/store design defined
- [x] Versioning strategy defined
- [x] Conditional rendering (`visibleIf`) defined
- [x] Styling contract defined
- [x] 8 landing-page sections mapped to schema types
- [x] Known gaps documented
- [x] ADRs 0001-0005 written and accepted
- [x] Glossary written

**Verification:**
- Schema design reviewed against assignment requirements
- ADRs linked from PROJECT_STATUS.md

---

## Phase 2 — Core SDUI Engine

**Goal:** Implement the generic renderer engine in `packages/sdui-core`.

**Dependencies:** Phase 1 (schema design)

**Deliverables:**
- [ ] TypeScript types for schema (`types.ts`)
- [ ] StateStore implementation (`StateStore.ts`)
- [ ] ComponentRegistry implementation (`ComponentRegistry.ts`)
- [ ] ActionDispatcher implementation (`ActionDispatcher.ts`)
- [ ] FallbackComponent implementation (`FallbackComponent.tsx`)
- [ ] Recursive renderer (`SDUIRenderer.tsx`)
- [ ] SDUIProvider + useSDUI context (`context.tsx`)
- [ ] Parser/validator (`parser.ts`)
- [ ] Main export (`index.ts`)
- [ ] Unit tests for each module
- [ ] Jest + @testing-library/react-native configured

**Build Steps:**

### 2.1 Set up test infrastructure (30min)
1. Add Jest dependencies to `packages/sdui-core/package.json`:
   - `jest`
   - `@testing-library/react-native`
   - `@testing-library/jest-native`
   - `react-test-renderer`
2. Create `jest.config.js` in `packages/sdui-core/`
3. Add `"test": "jest"` script
4. Verify with a placeholder test

### 2.2 Implement TypeScript types (30min)
File: `packages/sdui-core/src/types.ts`

Export interfaces:
- `SDUIPage` — top-level page payload
- `SDUINode` — component node (id, type, props, children, action, visibleIf, stateBinding)
- `SDUIAction` — union of action types
- `SDUIState` — page state (record of values)
- `SDUIProps` — component props (generic)
- `SDUIContextValue` — context shape

### 2.3 Implement StateStore (30min)
File: `packages/sdui-core/src/StateStore.ts`

API:
- `createStateStore(initialState: SDUIState)`
- `getState(): SDUIState`
- `setState(key: string, value: any): void`
- `subscribe(key: string, callback: (value: any) => void): () => void`
- `toggleInSet(key: string, itemId: string): void` — for wishlist

Implementation: Use React's `useSyncExternalStore` or a minimal Zustand-like store. Keep it dependency-light.

### 2.4 Implement ComponentRegistry (20min)
File: `packages/sdui-core/src/ComponentRegistry.ts`

API:
- `registerComponent(type: string, component: React.ComponentType<any>): void`
- `getComponent(type: string): React.ComponentType<any> | null`
- `hasComponent(type: string): boolean`

### 2.5 Implement ActionDispatcher (40min)
File: `packages/sdui-core/src/ActionDispatcher.ts`

API:
- `createActionDispatcher(options: { stateStore, navigate, openUrl })`
- `dispatch(action: SDUIAction): void`

Action handlers:
- `SET_STATE` → `stateStore.setState(action.key, action.value)`
- `TOGGLE_WISHLIST` → `stateStore.toggleInSet('wishlist', action.itemId)`
- `NAVIGATE` → `options.navigate(action.route, action.params)`
- `OPEN_URL` → `options.openUrl(action.url)`
- `NOOP` → no-op
- Unknown → log warning, no crash

### 2.6 Implement FallbackComponent (20min)
File: `packages/sdui-core/src/FallbackComponent.tsx`

Props:
- `type: string` — the unknown type
- `id?: string`
- `mode?: 'hidden' | 'placeholder' | 'debug'`

Behavior:
- Render `null` by default (hidden)
- Log warning: `Unknown component type: ${type}`
- Optionally render a debug placeholder (dev mode)

### 2.7 Implement Recursive Renderer (1h)
File: `packages/sdui-core/src/SDUIRenderer.tsx`

API:
- `SDUIRenderer({ page, registry, stateStore, dispatcher })`

Logic:
1. For each node in `page.sections`:
   - Check `visibleIf` → skip if false
   - Look up component in registry
   - If not found → render FallbackComponent
   - If found → render component with props, passing:
     - `node.props`
     - `children` (recursive render)
     - `dispatch` bound to node's `action` (if any)
   - If `stateBinding` → subscribe to store, re-render on change

### 2.8 Implement SDUIProvider + useSDUI (20min)
File: `packages/sdui-core/src/context.tsx`

API:
- `SDUIProvider({ children, page, registry, navigate, openUrl })`
- `useSDUI()` → returns `{ state, dispatch, page }`

### 2.9 Implement Parser/Validator (20min)
File: `packages/sdui-core/src/parser.ts`

API:
- `parsePage(json: unknown): SDUIPage | null`
- `validatePage(page: SDUIPage): boolean`

Validation:
- Check required fields (`schemaVersion`, `pageId`, `sections`)
- Check `schemaVersion` <= supported version
- Normalize: fill in defaults for optional fields

### 2.10 Export all modules (10min)
File: `packages/sdui-core/src/index.ts`

Export:
- Types
- StateStore
- ComponentRegistry
- ActionDispatcher
- FallbackComponent
- SDUIRenderer
- SDUIProvider, useSDUI
- parser
- SDUI_CORE_VERSION

### 2.11 Write unit tests (1h)
Files: `packages/sdui-core/src/**/*.test.ts`

Test coverage:
- `StateStore.test.ts` — setState, subscribe, toggleInSet
- `ComponentRegistry.test.ts` — register, get, has
- `ActionDispatcher.test.ts` — each action type, unknown action
- `SDUIRenderer.test.ts` — render known/unknown components, visibleIf
- `FallbackComponent.test.ts` — no crash, logs warning
- `parser.test.ts` — parse valid/invalid payloads

**Verification:**
- `npm run test --workspace @cars24/sdui-core` passes
- `npm run typecheck --workspace @cars24/sdui-core` passes
- All exports accessible from `@cars24/sdui-core`

**Time Estimate:** 3-4 hours

---

## Phase 3 — Landing Page Components + JSON

**Goal:** Register all 8 section components and build the landing page JSON payload.

**Dependencies:** Phase 2 (core engine)

**Deliverables:**
- [ ] `apps/mobile/src/app/_layout.tsx` — root layout with SDUIProvider
- [ ] `apps/mobile/src/app/index.tsx` — entry that fetches JSON
- [ ] `apps/mobile/src/components/` — all 8 section components
- [ ] `apps/mobile/src/registry.ts` — component registration
- [ ] `mock-server/landing.json` — full landing page payload
- [ ] `mock-server/server.js` — Express server
- [ ] Category chip → product rail interaction working end-to-end

**Build Steps:**

### 3.1 Create mock server (30min)
1. Create `mock-server/` directory
2. Add `package.json` with `express` dependency
3. Create `server.js`:
   - `GET /page/home` → serve `landing.json`
   - `GET /page/home-unknown` → serve `landing-with-unknown.json` (Phase 4)
4. Add `"server": "node mock-server/server.js"` to root `package.json`

### 3.2 Create landing.json payload (1h)
File: `mock-server/landing.json`

Sections:
1. `HEADER_BAR` — location dropdown, search bar, category chips
2. `BANNER_RAIL` — promo banners (horizontal)
3. `VALUE_PROP_GRID` — "Sell your car" grid
4. `CIRCULAR_RAIL` — "Get loans" circular badges
5. `METRIC_GRID` — "Car check services" 2x3 grid
6. `PRODUCT_RAIL` — "Used cars you'll love" with category-driven content
7. `VEHICLE_MANAGER` — "Manage your vehicle" hub
8. `SHOWROOM_CARD` rail — showrooms

State:
- `selectedCategory: "all"`
- `wishlist: []`

Use real-feeling data from `spec.md`.

### 3.3 Implement component registration (15min)
File: `apps/mobile/src/registry.ts`

```typescript
import { registerComponent } from '@cars24/sdui-core';
import HeaderBar from './components/HeaderBar';
import ChipRail from './components/ChipRail';
import BannerRail from './components/BannerRail';
import ValuePropGrid from './components/ValuePropGrid';
import CircularRail from './components/CircularRail';
import MetricGrid from './components/MetricGrid';
import ProductRail from './components/ProductRail';
import VehicleManager from './components/VehicleManager';
import ShowroomCard from './components/ShowroomCard';

export function registerAllComponents() {
  registerComponent('HEADER_BAR', HeaderBar);
  registerComponent('CHIP_RAIL', ChipRail);
  registerComponent('BANNER_RAIL', BannerRail);
  registerComponent('VALUE_PROP_GRID', ValuePropGrid);
  registerComponent('CIRCULAR_RAIL', CircularRail);
  registerComponent('METRIC_GRID', MetricGrid);
  registerComponent('PRODUCT_RAIL', ProductRail);
  registerComponent('VEHICLE_MANAGER', VehicleManager);
  registerComponent('SHOWROOM_CARD', ShowroomCard);
}
```

### 3.4 Implement entry files (30min)
File: `apps/mobile/src/app/_layout.tsx`
- Wrap with SDUIProvider
- Pass navigation and linking handlers

File: `apps/mobile/src/app/index.tsx`
- Fetch JSON from `http://localhost:4000/page/home`
- Pass to SDUIRenderer

### 3.5 Implement 8 section components (2h)

#### 3.5.1 HeaderBar (20min)
Props:
- `location: { label, action }`
- `searchBar: { placeholder, action }`
- `chips: Chip[]` (category icon rail)

Render:
- Location dropdown (triggers action)
- Search bar (triggers action)
- Horizontal scroll of chips (each triggers its own action)

#### 3.5.2 ChipRail (15min)
Props:
- `chips: Chip[]` (each with id, label, action)
- `selectedKey: string` — state key for selection

Behavior:
- Read `state[selectedKey]` to highlight selected chip
- On tap → dispatch chip's action

#### 3.5.3 BannerRail (15min)
Props:
- `banners: Banner[]` (each with imageUrl, action)

Render:
- Horizontal ScrollView with images
- On tap → dispatch action

#### 3.5.4 ValuePropGrid (15min)
Props:
- `cards: Card[]` (each with label, icon, action)

Render:
- 2-column grid
- On tap → dispatch action

#### 3.5.5 CircularRail (15min)
Props:
- `items: CircularItem[]` (each with label, imageUrl, action)

Render:
- Horizontal scroll of circular badges

#### 3.5.6 MetricGrid (15min)
Props:
- `cards: MetricCard[]` (each with label, icon, action)

Render:
- 2x3 grid

#### 3.5.7 ProductRail (30min)
Props:
- `title: string`
- `activeKey: string` — state key to read
- `contentByCategory: Record<string, CarCard[]>`
- `wishlistKey: string`

Behavior:
- Read `state[activeKey]` to get current category
- Render `contentByCategory[category]`
- Each car card has wishlist toggle → `TOGGLE_WISHLIST` action

#### 3.5.8 VehicleManager (20min)
Props:
- `vehicleNumber: string`
- `carImageUrl: string`
- `cards: VehicleCard[]` (insurance, FASTag, challan)
- `utilityGrid: UtilityItem[]`

#### 3.5.9 ShowroomCard (10min)
Props:
- `showrooms: Showroom[]` (each with imageUrl, name, distance, status, actions)

### 3.6 Wire up state-driven interaction (30min)
- ChipRail dispatches `SET_STATE { key: "selectedCategory", value: "..." }`
- ProductRail reads `state.selectedCategory` and re-renders
- Test end-to-end: tap chip → rail updates

**Verification:**
- `npm run server` starts mock server
- `npm start` loads app
- All 8 sections render from JSON
- Category chip → product rail interaction works
- Wishlist toggle works

**Time Estimate:** 4-5 hours

---

## Phase 4 — Unknown Component Fallback Demo

**Goal:** Demonstrate graceful degradation when server sends an unknown component type.

**Dependencies:** Phase 3

**Deliverables:**
- [ ] `mock-server/landing-with-unknown.json` — variant with unknown type
- [ ] Dev toggle or separate route to load variant
- [ ] Fallback renders without crash

**Build Steps:**

### 4.1 Create variant JSON (10min)
Copy `landing.json` to `landing-with-unknown.json`

Add a section with unknown type:
```json
{
  "id": "experimental_section",
  "type": "FUTURE_WIDGET_V2",
  "props": { "data": "test" }
}
```

### 4.2 Wire variant loading (10min)
Option A: Add route `GET /page/home-unknown` to mock server
Option B: Add dev toggle in app to load alternate URL

### 4.3 Verify fallback (10min)
- Load variant
- Confirm: page renders, unknown section shows fallback (hidden or placeholder)
- No crash, warning logged

**Verification:**
- App loads variant without crash
- FallbackComponent logs warning
- All other sections render normally

**Time Estimate:** 30 minutes

---

## Phase 5 — Static Version (Hardcoded)

**Goal:** Build a hardcoded native version of the same landing page for performance comparison.

**Dependencies:** Phase 3

**Deliverables:**
- [ ] `apps/mobile/src/app/static.tsx` — static version route
- [ ] All 8 sections hardcoded (no JSON, no registry, no dispatcher)
- [ ] Visually equivalent to SDUI version

**Build Steps:**

### 5.1 Create static route (10min)
File: `apps/mobile/src/app/static.tsx`

### 5.2 Copy and hardcode components (1h 20min)
- Copy all 8 components
- Remove all SDUI wiring (props, dispatch, state)
- Hardcode all data inline
- Same visual styling

### 5.3 Ensure visual equivalence (30min)
- Compare side-by-side with SDUI version
- Adjust spacing, colors, fonts to match

**Verification:**
- Navigate to `/static` route
- Page renders identically to SDUI version
- No JSON fetch, no registry lookup

**Time Estimate:** 2 hours

---

## Phase 6 — Benchmark + PERF.md

**Goal:** Measure SDUI vs Static performance and document results.

**Dependencies:** Phase 5

**Deliverables:**
- [ ] `docs/PERF.md` — performance report
- [ ] Measurements: TTR, TTI, full page time, JSON parse time, scroll FPS
- [ ] Overhead percentage calculated
- [ ] Optimization attempts documented

**Build Steps:**

### 6.1 Set up measurement tools (20min)
- Use React Native Profiler
- Use `performance.now()` for timing
- Use Flipper or RN Perf Monitor for FPS

### 6.2 Measure SDUI version (30min)
- 5 cold-start runs
- Record: TTR, TTI, full page time, JSON fetch+parse time

### 6.3 Measure Static version (20min)
- 5 cold-start runs
- Record: TTR, TTI, full page time

### 6.4 Measure scroll performance (20min)
- Scroll full page
- Record dropped frames / FPS

### 6.5 Write PERF.md (30min)
Sections:
- Device used
- Methodology
- Raw numbers table
- Overhead percentage
- Optimization attempts (what worked, what didn't)

**Verification:**
- PERF.md present
- Numbers are honest (median + range)
- At least one measure→optimize→re-measure loop attempted

**Time Estimate:** 1-2 hours

---

## Phase 7 — Coverage + COVERAGE.md

**Goal:** Document the registry's expressive coverage honestly.

**Dependencies:** Phase 3

**Deliverables:**
- [ ] `docs/COVERAGE.md`
- [ ] Full component registry listed
- [ ] Structural patterns documented
- [ ] Honest coverage percentage
- [ ] Known gaps named

**Build Steps:**

### 7.1 Document registry (15min)
List all registered types and their props.

### 7.2 Document patterns (15min)
List supported patterns:
- Horizontal rails
- Vertical grids
- Conditionals
- State-driven content
- Actions
- Styling overrides
- Nesting

### 7.3 Estimate coverage (10min)
Given a new Cars24 screen, estimate what % renders with JSON-only changes.

### 7.4 Name gaps (5min)
List patterns NOT supported:
- Maps
- Video players
- Complex forms
- Multi-step wizards

**Verification:**
- COVERAGE.md present
- Coverage % is specific and justified
- Gaps are named honestly

**Time Estimate:** 45 minutes

---

## Phase 8 — Versioning Story

**Goal:** Add versioning section to README explaining forward/backward compatibility.

**Dependencies:** Phase 1

**Deliverables:**
- [ ] Versioning section in README.md
- [ ] (Bonus) Minimal version gate implementation

**Build Steps:**

### 8.1 Write versioning section (20min)
Explain:
- `schemaVersion` check
- `minClientVersion` check
- Unknown field tolerance
- Unknown component fallback

### 8.2 (Bonus) Implement version gate (10min)
In parser, check `minClientVersion` and show "update available" state if required.

**Verification:**
- README has versioning section
- (Bonus) Version check works

**Time Estimate:** 30 minutes

---

## Phase 9 — README Updates

**Goal:** Update README with final architecture, setup, and trade-offs.

**Dependencies:** Phases 2-8

**Deliverables:**
- [ ] Updated `README.md`
- [ ] Setup instructions verified
- [ ] Architecture overview
- [ ] Schema design rationale
- [ ] Trade-offs section

**Build Steps:**

### 9.1 Verify setup instructions (15min)
- Test from clean clone
- Ensure `npm install`, `npm run server`, `npm start` work

### 9.2 Write architecture section (10min)
Diagram and explain the SDUI flow.

### 9.3 Link schema design (5min)
Point to `schema/SCHEMA_DESIGN.md`.

### 9.4 Write trade-offs section (10min)
What was cut:
- EMI/tenure selector (per ADR-0002)
- Server-fetch-per-action
- Maps, video, complex forms

**Verification:**
- README accurately reflects project
- Setup instructions work

**Time Estimate:** 30 minutes

---

## Phase 10 — AI_WORKFLOW.md

**Goal:** Document the AI collaboration process incrementally.

**Dependencies:** All phases (written incrementally)

**Deliverables:**
- [ ] `docs/AI_WORKFLOW.md`
- [ ] Tool stack described
- [ ] Context files listed
- [ ] 3 real prompt→outcome stories
- [ ] 1 real AI failure story
- [ ] Verification strategy

**Build Steps:**

### 10.1 Append after each phase (ongoing)
After each phase, append:
- Prompt used (verbatim)
- What was produced
- What was rejected/changed and why

### 10.2 Document tool stack (10min)
List: Claude Code, model, context files.

### 10.3 Write failure story (20min)
Document a real AI misstep and how it was caught.

**Verification:**
- AI_WORKFLOW.md present
- Contains real rejection stories
- Contains real failure story

**Time Estimate:** 30 minutes (incremental)

---

## Phase 11 — Screen Recording

**Goal:** Produce 3-5 minute video demonstrating the system.

**Dependencies:** Phases 3, 4

**Deliverables:**
- [ ] 3-5 minute screen recording
- [ ] 4 beats: cold open, chip interaction, fallback demo, live edit

**Build Steps:**

### 11.1 Record cold open (30min)
- Kill app
- Open app
- Show page rendering from JSON

### 11.2 Record chip interaction (15min)
- Tap category chip
- Show product rail update

### 11.3 Record fallback demo (15min)
- Load unknown-type variant
- Show graceful degradation

### 11.4 Record live edit (30min)
- Change JSON (e.g., banner title)
- Reload app
- Show page change without client code

### 11.5 Edit and export (30min)
- Combine into 3-5 minute cut
- Add brief annotations if needed

**Verification:**
- Recording is 3-5 minutes
- All 4 beats present

**Time Estimate:** 1 hour

---

## Phase 12 — Final Pass

**Goal:** Verify all deliverables present and consistent.

**Dependencies:** Phases 1-11

**Deliverables:**
- [ ] All docs present
- [ ] Git log coherent
- [ ] No contradictions

**Build Steps:**

### 12.1 Check deliverables (15min)
- README.md ✓
- PERF.md ✓
- COVERAGE.md ✓
- AI_WORKFLOW.md ✓
- Screen recording ✓

### 12.2 Check git log (10min)
- Commits tell coherent story
- One commit per phase

### 12.3 Check consistency (5min)
- Numbers in README match PERF.md
- Registry in COVERAGE.md matches code

**Verification:**
- All rubric items addressed
- Ready for submission

**Time Estimate:** 30 minutes

---

## Dependency Graph

```
Phase 0 (scaffold) ──► Phase 1 (schema) ──► Phase 2 (engine)
                                                │
                                                ▼
                                         Phase 3 (components)
                                                │
                          ┌─────────────────────┼─────────────────────┐
                          ▼                     ▼                     ▼
                   Phase 4 (fallback)    Phase 5 (static)    Phase 7 (coverage)
                          │                     │
                          └──────────┬──────────┘
                                     ▼
                              Phase 6 (benchmark)
                                     │
                                     ▼
                              Phase 8 (versioning)
                                     │
                                     ▼
                              Phase 9 (README)
                                     │
                                     ▼
                             Phase 10 (AI_WORKFLOW)
                                     │
                                     ▼
                             Phase 11 (recording)
                                     │
                                     ▼
                             Phase 12 (final pass)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| App won't run (entry files deleted) | Phase 3.4 creates fresh entry files |
| No test infrastructure | Phase 2.1 sets up Jest |
| SDUI engine too complex | Keep it minimal: registry, dispatcher, renderer, store |
| Performance overhead too high | Phase 6 documents honest numbers + optimization attempts |
| Timebox pressure | Cut sections per ADR-0002; document trade-offs in README |

---

## Success Criteria (from Assignment Rubric)

| Dimension | Weight | Evidence |
|-----------|--------|----------|
| Architecture & solution quality | 30% | Clean schema, working interactions, graceful fallback, honest versioning |
| AI collaboration | 30% | AI_WORKFLOW.md with real rejections and failure story |
| Generalization (coverage) | 20% | Honest COVERAGE.md with specific % |
| Performance rigor | 10% | Honest PERF.md with measure→optimize loop |
| Ownership & judgment | 10% | Explains every line, trade-offs documented |

---

## Next Actions

1. **User reviews this plan** — confirm it covers all assignment requirements
2. **Start Phase 2** — implement core SDUI engine
3. **Increment AI_WORKFLOW.md** — document each phase as we go

---

*Last updated: 2026-08-05*