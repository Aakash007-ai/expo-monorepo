# ADR-0003 — Action/state contract: server-push values into a page state store

Status: **Accepted**

## Context
The dispatcher must express "chip selection changes content" purely in JSON.
The rubric's failure mode is *"a renderer hardcoded to this one page wearing a
JSON costume"* — i.e., client logic deciding what chips exist or what content
they map to. The contract must make behavior live in the payload.

## Decision
**Server-push value model over a page-level state store.**

- The page payload declares initial `state` and **pre-loads content variants**
  for each state-driven component (no network round-trip per interaction).
- Actions are `{ type, ... }`. The workhorse is:
  `{ "type": "SET_STATE", "key": "selectedCategory", "value": "used_cars" }`.
- The dispatcher is **generic**: it writes `value` to the store under `key`
  and notifies subscribers. It has zero knowledge of categories, screens, or
  business rules.
- A component binds props to a state key (`stateBinding`); when that key
  changes, it re-renders with the JSON content it was given.
- Other action types: `NAVIGATE`, `OPEN_URL`, `TOGGLE_WISHLIST`
  (targets a store key, e.g. a wishlist set).

## Consequences
- Fully data-driven behavior: the client renders what the payload defines and
  knows nothing about this page's domain.
- A different, unseen screen renders with zero client logic — only new
  component registrations for genuinely new component types.
- Honest trade-off: content-swap does not hit the server per tap (variants are
  pre-loaded, selection is state-driven). This is the standard production SDUI
  pattern — no interaction latency. A server round-trip per action remains a
  documented stretch, not the default.

## Alternatives rejected
- Template placeholders in props (`{tenure}`) with client-side substitution —
  more client logic, costumes the schema.
- Intent→reducer (`UPDATE_EMI` handled by a client reducer) — the behavior
  would live in client code, not JSON.
