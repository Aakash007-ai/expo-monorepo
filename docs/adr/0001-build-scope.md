# ADR-0001 — Build scope: the Cars24 home page per the component list

Status: **Accepted**

## Context
The assessment (`cars24_mobile_assessment.md`) requires replicating a real
Cars24 screen via SDUI, meeting a complexity bar of 5+ distinct section
types, a horizontal rail, a vertical grid, and an SDUI-driven interaction.
The user provided `spec.md` as the home-page **component list** — the concrete
inventory of what the screen contains (8 sections).

## Decision
Render the Cars24 home page per the 8-section component list, entirely from
JSON: header/location/search, category chips, promo rail, value-prop grid,
loans rail, car-check grid, product rail, vehicle-manager hub, showrooms.

Every section ships as a **registered SDUI component**. Build order and demo
depth can vary, but the architecture covers the full list — a section never
degrades the system, only its own polish.

## Consequences
- Broad renderer surface — good for the COVERAGE.md claim (the "surprise
  screen" test).
- Wide sections (vehicle manager, showrooms) carry data-model weight; they
  are build-later, cut-safe with written trade-off notes if the timebox bites.
- The complexity bar is cleared by construction (8 > 5 sections).

## Alternatives rejected
- Minimal 5-section build to just clear the bar — rejected: the user wants the
  component list rendered, and it's the same schema either way.
