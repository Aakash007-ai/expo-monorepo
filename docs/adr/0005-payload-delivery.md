# ADR-0005 — Payload delivery: real local HTTP server

Status: **Accepted**

## Context
The assessment permits "a local JSON file, embedded server, or hosted
endpoint." PERF.md requires a *JSON fetch/parse time vs view-build time*
breakdown, and the recording requires a live-edit beat (change JSON → page
changes, no client code).

## Decision
A **tiny local HTTP server** (Express or json-server) serves `landing.json`
(one route, e.g. `GET /page/home`). The app fetches it at startup, measures
fetch+parse, then renders.

## Consequences
- The fetch/parse perf number is real and honest (bundled JSON would report
  ~0 and look like metric-gaming).
- Live-edit beat: edit the served JSON, reload the app, page changes.
- Server lives in `mock-server/`, ~30 lines, no persistence.

## Alternatives rejected
- Bundled JSON file parsed at startup — zero moving parts but no real fetch
  cost and a weaker live-edit story.
