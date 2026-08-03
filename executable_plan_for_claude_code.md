# Execution Plan — Cars24 SDUI Assignment (for Claude Code)

This is a working plan to hand to Claude Code, phase by phase. Paste each
phase as a prompt in order (or run them as one long session, checking in
between phases). Read `00_ASSIGNMENT_BRIEF.md` first — it's the source of
truth for requirements; this file is just the "how to execute it" plan.

**Before you start:** pick your stack and your screen. Everything below
assumes **React Native/TypeScript** and the **Cars24 home/landing page** —
swap freely if you choose Android/Kotlin or iOS/Swift instead, the phases
still apply.

---

## Phase 0 — Setup & Repo Scaffolding

Prompt for Claude Code:

```
Set up a new git repo for a React Native + TypeScript SDUI project.
Create this structure:

/sdui-core         → the renderer engine (component registry, JSON parser,
                      action dispatcher) — must be reusable/exportable,
                      not tangled with screen-specific code
/schema             → JSON schema definitions + example payloads
/screens/landing    → the SDUI JSON for the chosen (landing) screen
/static-version     → hardcoded native implementation of the same screen,
                      for the perf comparison
/mock-server        → local JSON server (json-server or simple express)
docs/
  README.md
  PERF.md
  COVERAGE.md
  AI_WORKFLOW.md

Initialize git, commit scaffolding as an initial commit with a real message
(not "initial commit"). Set up ESLint/Prettier and a basic CI-less test
runner (Jest) since we'll want unit tests on the schema parser.
```

Checklist:
- [ ] Repo initialized, `.gitignore` sensible for RN
- [ ] Folder structure above exists
- [ ] Commit history starts meaningfully (this itself is graded)

---

## Phase 1 — Design the JSON Schema (the heart of the assignment)

Do this thinking *before* heavy code generation — the schema is 30% of the
grade and rushing it shows.

Prompt for Claude Code:

```
Before writing renderer code, design the SDUI JSON schema. Write it out in
/schema/SCHEMA_DESIGN.md as a design doc covering:

1. Top-level page structure (page metadata, list of sections)
2. Section/component shape: { type, id, props, children?, action? }
3. How styling overrides work (inline style props vs design tokens)
4. How actions are expressed (tap → navigate, tap → open sheet,
   selection → update sibling component state) — needs a clear event/
   action contract, not ad-hoc per-component logic
5. How conditionals work (e.g. show banner only if a flag is true)
6. Versioning strategy: how would an old client safely ignore fields/
   components it doesn't understand from a newer schema version? Include
   a "schemaVersion" or "minClientVersion" concept.
7. Explicitly list which of these Cars24 landing-page patterns the schema
   can express: search/header bar, promo banner carousel, category chips
   (tab-like selectable), horizontal car card rail, vertical grid/list,
   value-prop strip, footer CTA, tenure/EMI selector with dependent
   content update.

Do not write renderer code yet. Just the schema + rationale. I want to
review this before we build against it.
```

Review this yourself (or with Claude) before proceeding — this is the
single highest-leverage checkpoint in the whole project. A bad schema here
costs you generalization (Part 3) and interaction support later.

Checklist:
- [ ] Schema handles at least 5 distinct section types
- [ ] Schema has a first-class **action** concept, not per-component hacks
- [ ] Schema has an explicit **versioning field**
- [ ] Schema has a way to express **conditional rendering**

---

## Phase 2 — Build the Core Renderer Engine

Prompt for Claude Code:

```
Implement /sdui-core based on /schema/SCHEMA_DESIGN.md:

1. A component registry: a map of type string -> React Native component,
   with a clean `registerComponent(type, Component)` API.
2. A recursive JSON-to-tree renderer that walks the page JSON and mounts
   the registered component for each node, passing props/children through.
3. An action dispatcher: a single place that interprets action JSON
   (navigate, openSheet, updateState, callback) and wires it to
   component-level onPress/onSelect handlers. Selection-driven UI updates
   (e.g. tenure selector -> EMI recompute) must flow through this, not
   local hacks.
4. Unknown component fallback: if `type` isn't in the registry, render a
   neutral placeholder component (configurable — invisible, debug box, or
   "content unavailable" card) and log a warning, but NEVER throw/crash.
   Write a unit test that feeds an unknown type and asserts no crash +
   correct fallback render.
5. Basic conditional rendering support per the schema (e.g. `visibleIf`).

Write unit tests for the registry, the renderer's tree-walk, the action
dispatcher, and the fallback path. Keep this package free of any
landing-page-specific assumptions — it should be able to render a
completely different screen's JSON with zero code changes, only new
component registrations for new types.
```

Checklist:
- [ ] Renderer has no landing-page-specific logic baked in
- [ ] Action dispatcher is centralized, not scattered onPress hacks
- [ ] Unknown-component fallback is tested and provably non-crashing
- [ ] Unit tests pass

---

## Phase 3 — Build the Landing Page Components + JSON

Prompt for Claude Code:

```
Using /sdui-core, implement and register the components needed for the
Cars24 landing page (reference the real app for layout/content — use
realistic hardcoded car listings, prices, banners, category names).

Required section types (>= 5 distinct, real content):
- Header/search bar
- Promo banner carousel (horizontal)
- Category chips (selectable, SDUI-driven — selecting a chip changes
  which car rail/content is shown, via the action dispatcher, not
  hardcoded state)
- Horizontal car card rail
- Vertical car listing grid/list
- Value-prop strip (e.g. "0 down payment", "5-day money back")
- Footer CTA

Write the corresponding page JSON in /screens/landing/landing.json (or
serve it from /mock-server). Include one clearly interactive,
SDUI-driven flow end to end: category chip tap -> content updates purely
because the action + new JSON slice says so.

Also implement the tenure/EMI selector interaction mentioned in the brief:
selecting a tenure updates the displayed EMI, driven by an SDUI action,
not a hardcoded calculation wired outside the schema.

Run the app, confirm the full page renders correctly from JSON only.
```

Checklist:
- [ ] 5+ visually distinct section types present and populated with real-feeling data
- [ ] At least one horizontal rail + one vertical list/grid
- [ ] Category chip interaction is genuinely SDUI-action-driven
- [ ] Tenure selector → EMI update works, and a bottom sheet opens as described in the brief
- [ ] Page renders correctly end to end from the JSON file

---

## Phase 4 — Unknown Component Fallback Demo

Prompt for Claude Code:

```
Add a deliberate demo case: include a component type in a JSON variant
(e.g. /screens/landing/landing-with-unknown-type.json) that the registry
does NOT know about. Wire a way to load this variant (dev toggle or
separate JSON file) and confirm on-device/simulator that the page renders
everything else normally and gracefully skips/placeholders the unknown
type, with no crash. This needs to be shown clearly in the screen
recording later.
```

Checklist:
- [ ] A demo JSON with an intentionally unknown component type exists
- [ ] App loads it and does not crash
- [ ] Fallback is visually clear enough to show on camera

---

## Phase 5 — Build the Static (Hardcoded) Comparison Version

Prompt for Claude Code:

```
Build /static-version: the exact same landing page, hardcoded natively
(no JSON parsing, no registry indirection) — visually and functionally
identical to the SDUI version. This is the perf baseline. Keep it in the
same app as a second entry point/screen so it can be benchmarked under
identical conditions (same device, same release build).
```

Checklist:
- [ ] Static version is visually/functionally equivalent to the SDUI version
- [ ] Buildable in a release configuration alongside the SDUI version

---

## Phase 6 — Benchmark & Write PERF.md

Prompt for Claude Code:

```
Help me benchmark both versions in release builds on [DEVICE NAME]. For
each version measure: TTR (cold open -> above-the-fold fully rendered),
TTI (cold open -> scrollable/tappable), full page render time, and for
the SDUI version specifically the JSON fetch/parse time vs view-build
time split. Also capture scroll perf / dropped frames while scrolling
the full page (use RN's perf monitor / Flipper / Android GPU profiler /
Xcode Instruments as appropriate).

Take at least 5 cold-start runs per version, report median and range, not
a single cherry-picked number. Then write docs/PERF.md with: device used,
exact methodology/tooling, raw numbers table (static vs SDUI), computed
overhead % for each metric, and a section on what you tried to optimize
after seeing initial numbers (e.g. memoizing component lookups, avoiding
JSON re-parsing, list virtualization, image lazy loading) — including
things that did NOT help, stated honestly.
```

Checklist:
- [ ] Real device/simulator, release build, stated explicitly
- [ ] Multiple runs, median reported, not one-off numbers
- [ ] Honest overhead % even if it's not flattering
- [ ] At least one real measure → optimize → re-measure loop documented

---

## Phase 7 — Coverage Analysis & COVERAGE.md

Prompt for Claude Code:

```
Write docs/COVERAGE.md:
1. List the full component registry (every registered type + props it
   accepts).
2. List the structural patterns the schema supports (lists, grids,
   carousels, conditionals, actions/selection-driven updates, style
   overrides, nesting).
3. Give an honest estimate: "Given a new, unseen Cars24 screen, roughly
   X% of it would render with JSON-only changes; patterns like [Y, Z]
   would need new client-side components."
4. Name concrete Cars24 screens/patterns you did NOT build support for
   (e.g. maps, video players, complex forms, multi-step wizards) and
   flag them as the likely gaps for the live "new screen" test.
```

Checklist:
- [ ] Registry is fully documented
- [ ] Coverage % claim is specific and justified, not a vibe
- [ ] Known gaps are named honestly, not hidden

---

## Phase 8 — Versioning Story (README section)

Prompt for Claude Code:

```
Add a "Versioning Story" section to README.md explaining how an old app
build safely handles a newer server payload: schemaVersion negotiation,
unknown-field tolerance, unknown-component fallback (already built),
and what a minimum-supported-schema-version check would look like
server-side. Implementation is optional/bonus — a clear, credible design
is enough — but if there's time, add a minimal version gate as a stretch.
```

Checklist:
- [ ] README has a clear versioning section
- [ ] (Bonus, if time allows) a minimal implemented version check

---

## Phase 9 — README.md (pull it all together)

Prompt for Claude Code:

```
Write the top-level README.md: setup instructions (how to run the app,
how to run the mock server), architecture overview (diagram in words is
fine), why the landing page was chosen, schema design rationale (link to
/schema/SCHEMA_DESIGN.md), the versioning story, and a trade-offs section
— what was cut given the timebox and why, stated explicitly rather than
hidden.
```

Checklist:
- [ ] Setup instructions actually work from a clean clone
- [ ] Trade-offs are explicit, not implied

---

## Phase 10 — AI_WORKFLOW.md (do this as you go, not at the end)

This one is best written incrementally through the whole build, not
reconstructed from memory afterward. After each phase, prompt Claude Code:

```
Append to docs/AI_WORKFLOW.md: the prompt I just gave you (verbatim),
a summary of what you produced, and — critically — what I rejected,
edited, or asked you to redo, and why. Be specific, not generic.
```

By the end you need:
- [ ] Tool stack described (Claude Code, model used, any context/rules files like this plan or a `CLAUDE.md`)
- [ ] The actual context/rules files included in the repo (e.g. this execution plan, or a project `CLAUDE.md`)
- [ ] **Three real prompt→outcome stories** with genuine rejections/rewrites
- [ ] **One real AI failure** (schema, perf, or platform-API misstep) and how it was caught — don't manufacture a soft one; if a real one happened during Phases 1–9, document it precisely
- [ ] A stated verification strategy (tests, manual device checks, code review passes)

---

## Phase 11 — Screen Recording (3–5 min)

Script to follow, in order:

1. Page rendering fully from JSON (cold open on the SDUI version)
2. Category chip / tenure selector interaction + EMI update + bottom sheet
3. Unknown-component fallback demo (load the variant JSON, show no crash)
4. **Live edit**: change a value in the JSON (e.g. a banner title or a new
   category), re-run/hot-reload, show the page changing with **zero
   client code touched**

Checklist:
- [ ] All four beats present, in a coherent 3–5 min cut
- [ ] Live-edit moment is unambiguous — show the JSON diff on screen briefly

---

## Phase 12 — Final Pass Before Submission

Prompt for Claude Code:

```
Do a final pass: confirm README, PERF.md, COVERAGE.md, and AI_WORKFLOW.md
are all present and internally consistent (e.g. numbers in README match
PERF.md, registry list in COVERAGE.md matches actual code). Check git log
tells a coherent story of the build order above. Flag anything that looks
rushed or contradictory before I submit.
```

Final checklist (maps to their rubric):
- [ ] Architecture & solution quality — schema, actions, fallback, versioning all present and clean (30%)
- [ ] AI collaboration — AI_WORKFLOW.md has real rejected-output stories and a real failure (30%)
- [ ] Generalization — COVERAGE.md has an honest, specific % claim (20%)
- [ ] Performance rigor — PERF.md has real methodology and a measure→optimize loop (10%)
- [ ] Ownership & judgment — can explain every line, trade-offs documented, scoped to the timebox (10%)

---

## Optional: a `CLAUDE.md` you can drop in the repo root

If you want Claude Code to have persistent project rules across the whole
session instead of re-explaining constraints every prompt, save this as
`CLAUDE.md` in the repo root before Phase 0:

```markdown
# Project rules for Claude Code

- This is the Cars24 SDUI take-home assignment. Full brief: 00_ASSIGNMENT_BRIEF.md.
- Primary stack: React Native + TypeScript (adjust if different).
- /sdui-core must stay generic — no landing-page-specific logic in the renderer.
- Every interactive element must go through the central action dispatcher,
  not local onPress hacks.
- Unknown component types must NEVER crash the app — always fall back gracefully.
- After every meaningful change, append a short entry to docs/AI_WORKFLOW.md:
  the prompt used, what was produced, what I rejected/changed and why.
- Prefer honest, unflattering measurements in PERF.md over polished-sounding
  but unverified numbers.
- Commit after each completed phase with a descriptive message — commit
  history is part of the grade.
```
