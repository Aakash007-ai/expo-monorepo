# @cars24/sdui-core

**Generic server-driven UI engine.** Consumes a JSON page payload and renders it into React components. Holds zero screen-specific logic — the engine walks the JSON, mounts registered components, and routes all interactivity through a single action dispatcher.

**Why it matters:** the "surprise screen" test. Given an unseen JSON payload, the system should render gracefully (fallback UI for unknown component types, no crashes) and require only new component registrations — zero client logic changes.

---

## Design Principles

From [ADR-0003](../../docs/adr/0003-action-state-contract.md):

1. **Server-push values into a page-level state store.** The engine writes action values into a reactive store; bound components re-render. The dispatcher has zero knowledge of screens or business rules.
2. **Actions are `{ type, ... }`.** The workhorse is `SET_STATE` (`{type, key, value}`). Other types: `NAVIGATE`, `OPEN_URL`, `TOGGLE_WISHLIST`.
3. **Components bind props to state keys.** A component declares `stateBinding: "selectedCategory"`; when that key changes, it re-renders with the JSON content it was given.
4. **Pre-loaded content variants.** No network round-trip per interaction — the payload pre-loads content for each state-driven component, and selection is state-driven.

---

## Public API Surface (Planned)

The engine will export:

- **Schema types** — `Page`, `Section`, `ComponentProps`, `Action`, `State` (TypeScript interfaces).
- **`SDUIParser`** — Validates and normalizes a JSON payload.
- **`ComponentRegistry`** — Maps type strings to React components. Apps register their screen-specific widgets here.
- **`ActionDispatcher`** — Routes actions (`SET_STATE`, `NAVIGATE`, etc.) to the appropriate handler.
- **`StateStore`** — Page-level reactive store, initialized from JSON `state`. Actions write to it; bound components subscribe.
- **`FallbackComponent`** — Renders "Content unavailable" for unknown component types. Never crashes.
- **`SDUIProvider`** — React context that wires the parser, registry, dispatcher, and state store together.
- **`useSDUI`** — Hook that returns the renderer instance (for app-level orchestration).

---

## Integration Contract (planned API)

> The engine is not yet implemented (Phase 2 of the execution plan). The API below is the design target from [SCHEMA_DESIGN.md](../../schema/SCHEMA_DESIGN.md). Snippets are illustrative, not runnable yet.

Apps will consume `@cars24/sdui-core` as a workspace dependency:

```json
{
  "dependencies": {
    "@cars24/sdui-core": "*"
  }
}
```

And register their screen-specific components:

```tsx
import { SDUIProvider, ComponentRegistry } from '@cars24/sdui-core';
import { CategoryChipRail } from './components/CategoryChipRail';

const registry = new ComponentRegistry();
registry.register('CHIP_RAIL', CategoryChipRail);

export default function App({ payload }) {
  return <SDUIProvider registry={registry} payload={payload} />;
}
```

The engine renders the payload. The app knows nothing about the JSON structure — only how to render the component types it registered.

---

## Versioning

The engine follows semantic versioning:

- **0.x.x** — Pre-1.0 (assessment phase). API may change.
- **1.0.0** — Stable API (registry, dispatcher, parser, state store).
- **2.0.0** — Breaking changes (new action types, schema changes).

Schema versioning (the JSON payload format) is separate from engine versioning. The parser checks `schemaVersion` in the payload and rejects mismatched versions.

---

## Related

- [ADR-0003: Action/state contract](../../docs/adr/0003-action-state-contract.md) — The design decision that shaped this engine.
- [ADR-0002: Interactions](../../docs/adr/0002-interactions-chips.md) — How the flagship chip interaction uses this engine.
- [`docs/glossary.md`](../../docs/glossary.md) — SDUI vocabulary.
