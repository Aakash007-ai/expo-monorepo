# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The **Cars24 Server-Driven UI (SDUI) take-home assignment**: build an SDUI system in React Native + TypeScript that renders the Cars24 home/landing page entirely from a JSON payload. **No source code or `package.json` exists yet** — the repo is in the planning stage. It holds the assignment brief, a tech-lead spec, and a phased execution plan. The first task here is scaffolding per Phase 0 of the execution plan. The repo is not yet a git repo either — git init is part of Phase 0.

### Source-of-truth documents (read these before writing code)

- `cars24_mobile_assessment.md` — **THE assignment.** Requirements, complexity bar, the "your system must handle" list (component registry, actions, unknown-component fallback, versioning), grading rubric. **This is the source of truth.**
- `spec.md` — the home-page **component list** the user provided: the real Cars24 home screen's **8 widget sections** (header/search, category chips, promo rails, value-prop grids, loans, car-check grid, product rail with car listings + EMI, vehicle management hub, showrooms) plus a JSON schema blueprint. Reference for building landing components and realistic data.
- `executable_plan_for_claude_code.md` — the 12-phase build roadmap (Phase 0 scaffold → Phase 12 final pass). Reference for "how to build it," not source of truth.
- `assignment_brief.md` — clean-formatted copy of the same brief (same content as `cars24_mobile_assessment.md`); reference only.
- `CARS24_MOBILE_ENGINEER_SDUI_ASSIGNMENT.pdf` — the original assignment PDF; reference only.

## Decisions already made

- **Platform:** React Native + TypeScript, built deeply (single stack; a second platform is bonus, not baseline).
- **Screen:** the Cars24 home/landing page (chosen because it clears the complexity bar: 5+ distinct section types, a horizontal rail, a vertical grid, SDUI-driven interactions).
- **Intended layout** (from the plan; not yet created): `sdui-core/` = generic renderer engine, `schema/` = schema design + example payloads, `screens/landing/` = landing page JSON, `static-version/` = hardcoded native clone for the perf baseline, `mock-server/` = local JSON server, `docs/` = README, PERF, COVERAGE, AI_WORKFLOW.
- **Deliverables:** `README.md`, `PERF.md`, `COVERAGE.md`, `AI_WORKFLOW.md` (the plan places these under `docs/`), a GitHub repo with meaningful commit history, and a 3–5 min screen recording.

## Architecture to build against

`JSON payload → SDUI parser → component registry → view builder → UI renderer`, with a fallback renderer and a centralized action dispatcher off to the side.

- **Component registry** — a map of server type string → RN component with a clean `registerComponent(type, Component)` API.
- **Recursive JSON→tree renderer** — walks page JSON, mounts the registered component per node, passes props/children through.
- **Centralized action dispatcher** — the single place that interprets action JSON (`NAVIGATE`, `OPEN_BOTTOM_SHEET`, `UPDATE_STATE`, `TOGGLE_WISHLIST`, etc.) and wires it to component handlers. Category-chip selection changing content, the tenure→EMI recompute, and bottom-sheet opens must flow through this dispatcher — never local per-component logic.
- **Unknown component fallback** — when `type` isn't in the registry, render a neutral placeholder (or hide the section), log a warning, and **never throw/crash**. Unit-test this path.
- **Conditional rendering** via schema (e.g. a `visibleIf` flag).
- **Versioning** — a schema-level `schemaVersion`/`minClientVersion`; old clients must tolerate unknown fields/components from newer payloads.

## Hard project rules

- `sdui-core` must stay generic — **zero landing-page-specific logic** in the renderer. A different screen's JSON must render with zero code changes, only new component registrations.
- Every interactive element must go through the central action dispatcher, not scattered `onPress` hacks.
- Unknown component types must **never** crash the app — always degrade gracefully.
- After every meaningful change, append a short entry to `docs/AI_WORKFLOW.md`: the prompt used, what was produced, and what was rejected/changed and why. Write it incrementally through the build, not reconstructed at the end. (The assignment weights AI collaboration at 30% and reads these stories.)
- Perf numbers in `PERF.md` must be honest even when unflattering: multiple cold-start runs per version, median + range, stated device and methodology, and a real measure→optimize→re-measure loop.
- Commit after each completed phase with a descriptive message — commit history is part of the grade.

## Development commands

There is no source yet, so there are no runnable build/lint/test commands. Phase 0 of the execution plan specifies the scaffold: a React Native + TypeScript app, Jest as the test runner (with unit tests planned for the schema parser, registry, renderer tree-walk, action dispatcher, and fallback path), ESLint/Prettier, a sensible `.gitignore`, and an initial commit with a real message. Once scaffolded, follow that phase for the toolchain.

## How it's evaluated

30% architecture/solution quality, 30% AI collaboration, 20% generalization (coverage), 10% performance rigor, 10% ownership/judgment. A schema reviewers would actually adopt, honest overhead numbers, and a working fallback + JSON-edit live demo carry the most weight. What fails: a renderer hardcoded to one page "wearing a JSON costume," perf claims with no methodology, and "the AI wrote that part."

## Project skills

Skills are installed under `.claude/skills/` (gstack suite: `spec`, `plan-eng-review`, `review`, `ship`, `qa`, `benchmark`, `investigate`, `document-generate`, etc.) and `.agents/skills/` (`grill-with-docs`). Invoke via `/skill-name`; `spec` and `plan-eng-review` map directly onto the schema-design and review phases of this assignment.
