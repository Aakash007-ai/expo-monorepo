# Project Status — Cars24 SDUI Assignment

> Living tracker for the Cars24 Mobile Engineer SDUI assignment.
> Updated after each completed phase/subtask.

---

## Badge

**Phase:** 2 of 12 (Core SDUI engine complete; landing-page components next)  
**Build Health:** 🟡 Engine builds, host app not wired yet  
**Last Updated:** 2026-08-05  
**Commit:** see `git log --oneline -5`

---

## What We're Building

A **Server-Driven UI (SDUI)** system in React Native + TypeScript that renders the Cars24 home/landing page entirely from JSON payloads. The core architecture is a generic renderer engine (`sdui-core`) that maps JSON component types to native views, routes all interactions through a single action dispatcher, and gracefully degrades on unknown component types.

**Target screen:** Cars24 Home/Landing Page — 8 distinct widget sections:

1. Header & Sticky Top Bar (location dropdown, search bar, category chips)
2. Promotional Banner / Category Grid ("Buy car")
3. Value-Prop Services Grid ("Sell your car")
4. Circular Service Options ("Get loans")
5. Verification & Utility Cards ("Car check services")
6. Product Horizontal Rail ("Used cars you'll love")
7. Personal Vehicle Management Hub ("Manage your vehicle")
8. Location / Offline Showrooms

**Complexity bar met:** 8 > 5 distinct section types ✓ horizontal rail ✓ vertical grid ✓ SDUI-driven interaction ✓

---

## Architecture

```
JSON Payload (from mock-server)
        ↓
SDUI Parser (validates + normalizes)
        ↓
Component Registry (type string → React component)
        ↓
Recursive Renderer (builds component tree)
        ↓
UI (React Native Views)
```

**Key components:**
- **Component Registry** — maps server `type` strings to RN components via `registerComponent(type, Component)`
- **Action Dispatcher** — single place handling all interactions: `SET_STATE`, `NAVIGATE`, `OPEN_BOTTOM_SHEET`, `TOGGLE_WISHLIST`
- **State Store** — page-level reactive store, initialized from JSON, bound to components via `stateBinding`
- **Fallback Component** — renders neutral placeholder for unknown types, logs warning, never crashes

**Key ADR decisions:**
- ADR-0001: Build scope = all 8 sections
- ADR-0002: Category chips = flagship SDUI flow — **Superseded by ADR-0006**
- ADR-0003: Server-push values → state store (pre-loaded content variants)
- ADR-0004: Expo (managed workflow) for fast Windows setup
- ADR-0005: Real local HTTP server for payload delivery (honest perf measurement)
- ADR-0006: Restore tenure/EMI + bottom sheet (per assignment recording checklist)

---

## Phase Tracker

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 0 | Setup & Repo Scaffolding | ✅ Complete | Monorepo, Expo app, `.gitignore` |
| 1 | Design JSON Schema | ✅ Complete | `schema/SCHEMA_DESIGN.md` + 5 ADRs |
| 2 | Build Core Renderer Engine | 🔴 Not Started | `packages/sdui-core/src/index.ts` is stub |
| 3 | Landing Page Components + JSON | 🔴 Not Started | No components, no landing.json |
| 4 | Unknown Component Fallback Demo | 🔴 Not Started | No demo JSON |
| 5 | Static Version (Hardcoded) | 🔴 Not Started | No static-version/ |
| 6 | Benchmark & PERF.md | 🔴 Not Started | Missing |
| 7 | Coverage Analysis & COVERAGE.md | 🔴 Not Started | Missing |
| 8 | Versioning Story | 🟡 Planned | README references versioning |
| 9 | README.md | 🟡 Planned | Root README exists but needs updates |
| 10 | AI_WORKFLOW.md | 🔴 Not Started | Missing |
| 11 | Screen Recording | 🔴 Not Started | 3-5 min video |
| 12 | Final Pass | 🔴 Not Started | Pre-submission review |

---

## Subtask Breakdown

### Phase 0 — Setup & Repo Scaffolding ✅
- [x] Initialize git repo with `.gitignore`
- [x] Create monorepo structure (`apps/`, `packages/`, `docs/`, `schema/`)
- [x] Wire workspaces in root `package.json`
- [x] Set up Expo app (`apps/mobile`)
- [x] Set up `sdui-core` package
- [x] Initial commit with real message

### Phase 1 — Design JSON Schema ✅
- [x] Write `schema/SCHEMA_DESIGN.md`
- [x] Design top-level page structure
- [x] Design component/section shape (`{ type, id, props, children?, action? }`)
- [x] Design action contract
- [x] Design conditional rendering (`visibleIf`)
- [x] Design versioning strategy
- [x] Map landing-page patterns to schema
- [x] Write ADRs (5 accepted)

### Phase 2 — Build Core Renderer Engine 🔴
- [ ] Implement ComponentRegistry (`registerComponent`, `getComponent`)
- [ ] Implement recursive JSON-to-tree renderer
- [ ] Implement ActionDispatcher (SET_STATE, NAVIGATE, OPEN_BOTTOM_SHEET, etc.)
- [ ] Implement FallbackComponent (unknown type handling)
- [ ] Implement StateStore (page-level reactive store)
- [ ] Implement SDUIProvider + useSDUI context
- [ ] Write unit tests (registry, dispatcher, fallback, tree-walk)
- [ ] Ensure zero landing-page-specific logic in sdui-core

### Phase 3 — Landing Page Components + JSON 🔴
- [ ] Register components for all 9 section types (8 visual sections)
- [ ] Create `mock-server/landing.json` with real data + tenure/EMI state
- [ ] Build Header/search bar component
- [ ] Build Promo banner carousel component
- [ ] Build Category chips (selectable, SDUI-driven)
- [ ] Build Horizontal car card rail with TenureSelector
- [ ] Build Vertical car listing grid/list
- [ ] Build Value-prop strip
- [ ] Build Footer CTA
- [ ] Build BottomSheet component (reusable, dispatcher-controlled)
- [ ] Implement category chip → content update flow (SET_STATE)
- [ ] Implement tenure selector → EMI update flow (SET_STATE)
- [ ] Implement bottom sheet open/close (OPEN_BOTTOM_SHEET / CLOSE_BOTTOM_SHEET)
- [ ] Verify page renders correctly from JSON

### Phase 4 — Unknown Component Fallback Demo 🔴
- [ ] Create `landing-with-unknown-type.json` demo variant
- [ ] Wire dev toggle to load demo variant
- [ ] Verify graceful degradation on device
- [ ] Ensure fallback is visually clear for recording

### Phase 5 — Static Version 🔴
- [ ] Build hardcoded version of same 8 sections
- [ ] Ensure visual/functional equivalence to SDUI version
- [ ] Make buildable in release config alongside SDUI

### Phase 6 — Benchmark & PERF.md 🔴
- [ ] Measure TTR, TTI, full page time (SDUI + Static)
- [ ] Measure JSON fetch/parse vs view-build split
- [ ] Measure scroll perf / dropped frames
- [ ] Run 5+ cold-start runs per version, report median + range
- [ ] Write `docs/PERF.md` with device, methodology, numbers, overhead %
- [ ] Document measure→optimize→re-measure loop

### Phase 7 — Coverage Analysis & COVERAGE.md 🔴
- [ ] Document full component registry
- [ ] List structural patterns the schema supports
- [ ] Write honest coverage % estimate
- [ ] Name concrete gaps (maps, video, complex forms)

### Phase 8 — Versioning Story 🔴
- [ ] Add versioning section to README
- [ ] (Bonus) Implement minimal version gate

### Phase 9 — README.md 🔴
- [ ] Update setup instructions
- [ ] Add architecture overview
- [ ] Document schema design rationale
- [ ] Add versioning story
- [ ] Write trade-offs section (what was cut, why)

### Phase 10 — AI_WORKFLOW.md 🔴
- [ ] Document tool stack (Claude Code, model, context files)
- [ ] Append after each phase: prompt, output, rejections
- [ ] Write 3 real prompt→outcome stories
- [ ] Write 1 real AI failure story
- [ ] State verification strategy

### Phase 11 — Screen Recording 🔴
- [ ] Record cold-open SDUI rendering
- [ ] Record category chip interaction
- [ ] Record tenure selector + EMI update
- [ ] Record bottom sheet open
- [ ] Record unknown-component fallback demo
- [ ] Record live JSON edit → UI change
- [ ] Edit to 3-5 min coherent cut

### Phase 12 — Final Pass 🔴
- [ ] Verify all docs present and consistent
- [ ] Verify git log tells coherent story
- [ ] Flag anything rushed or contradictory

---

## Achieved vs. Remaining

### ✅ Achieved (Documentation & Scaffolding Only)

**Repository Setup:**
- Monorepo scaffold with workspaces (`apps/mobile`, `packages/sdui-core`)
- Expo SDK57 + React 19.2 + TypeScript 6.0 project structure
- `.gitignore`, root `package.json` with workspace wiring

**Schema & Architecture Design:**
- Comprehensive JSON schema design (`schema/SCHEMA_DESIGN.md` — 243 lines)
- 6 Architecture Decision Records (ADRs 0001–0006)
- Glossary of SDUI terms (`docs/glossary.md`)
- Implementation plan with clean architecture (`docs/IMPLEMENTATION_PLAN.md` — 39KB)
- Project status tracker (`docs/PROJECT_STATUS.md`)

**Root Documentation:**
- Root `README.md` with architecture overview
- `CLAUDE.md` for AI agent context

### 🔴 Remaining (All Implementation)

**Core SDUI Engine (Phase 2):**
- `packages/sdui-core/src/index.ts` is a stub — needs full implementation
- No schema types (`types.ts`)
- No component registry (`ComponentRegistry.ts`)
- No renderer (`SDUIRenderer.tsx`)
- No action dispatcher (`ActionDispatcher.ts`)
- No state store (`StateStore.ts`)
- No fallback component (`FallbackComponent.tsx`)
- No parser (`parser.ts`)
- No visibleIf evaluator (`visibleIf.ts`)
- No context/provider (`SDUIProvider.tsx`, `useSDUI.ts`)
- No unit tests

**App + Components (Phase 3):**
- `apps/mobile/src/app/` directory does not exist
- No route files (`_layout.tsx`, `index.tsx`, `static.tsx`)
- No UI components (`components/ui/`)
- No section components (`components/sections/`)
- No domain layer (`domain/`)
- No data layer (`data/`)
- No core adapters (`core/registry.ts`, `core/navigation.ts`)
- No mock server (`mock-server/`)
- No JSON payload (`landing.json`)

**Testing + Benchmarking (Phases 4-6):**
- No unknown-component fallback demo
- No static version
- No performance instrumentation
- No `docs/PERF.md`

**Documentation (Phases 7-10):**
- No `docs/COVERAGE.md`
- No `docs/AI_WORKFLOW.md`
- README needs trade-offs section update (tenure/EMI restored)

**Final (Phases 11-12):**
- No screen recording
- No final pass review

---

## Deliverables Checklist

| Deliverable | Path | Status |
|-------------|------|--------|
| README.md | `README.md` (root) | ✅ Exists, needs updates |
| PERF.md | `docs/PERF.md` | 🔴 Missing |
| COVERAGE.md | `docs/COVERAGE.md` | 🔴 Missing |
| AI_WORKFLOW.md | `docs/AI_WORKFLOW.md` | 🔴 Missing |
| Screen Recording | (local file) | 🔴 Missing |

---

## Current Blocker

The Expo app won't run. Entry files were deleted from the template:
- `apps/mobile/src/app/_layout.tsx` — DELETED
- `apps/mobile/src/app/index.tsx` — DELETED
- All template components (`components/`, `hooks/`, `constants/`) — DELETED

**To unblock Phase 2:** Either restore these from git or write fresh entry points that use the sdui-core renderer once it's built.

---

*Last updated: 2026-08-05*
*Commit: 440ed66 chore: scaffold monorepo + generate project documentation*