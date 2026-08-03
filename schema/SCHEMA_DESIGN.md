# JSON Schema Design

**Status:** Design (Phase 1 of the execution plan — the highest-leverage checkpoint).
**Authored against:** `cars24_mobile_assessment.md` (the assessment), `spec.md` (the 8-section home-page component list), ADRs 0001–0003.

This document defines the JSON payload format that the SDUI engine consumes. The schema is the heart of the assignment — a reviewer should be able to read this and judge whether they'd adopt it.

---

## 1. Design Goals

1. **Behavior in the payload, not the client.** The client renders what the JSON says and knows nothing about screens or business rules. A different, unseen screen renders with zero client logic — only new component registrations for genuinely new component types.
2. **Generalize beyond the landing page.** The schema must express lists, grids, rails, conditionals, actions, and styling overrides — not just the 8 sections of the home page.
3. **Degrade gracefully on unknowns.** Unknown component types, unknown action types, and unknown fields must never crash the app.
4. **Versionable.** Old app versions must tolerate newer payloads (forward-compatibility).

---

## 2. Top-Level Structure

A page payload:

```json
{
  "schemaVersion": "1.0.0",
  "minClientVersion": "1.0.0",
  "pageId": "home_screen",
  "state": {
    "selectedCategory": "all",
    "wishlist": []
  },
  "sections": [
    { "id": "header", "type": "HEADER_BAR", "props": { ... } },
    { "id": "chips", "type": "CHIP_RAIL", "props": { ... } },
    { "id": "car_rail", "type": "PRODUCT_RAIL", "props": { ... }, "visibleIf": { ... } }
  ]
}
```

| Field | Type | Purpose |
|---|---|---|
| `schemaVersion` | string (semver) | Payload format version. Parser rejects mismatches above its supported version. |
| `minClientVersion` | string (semver) | Minimum client version required to render this payload. Older clients show a "please update" state. |
| `pageId` | string | Identifies the page (for analytics, navigation). |
| `state` | object | Initial page-level state. The dispatcher writes to this; bound components re-render. |
| `sections` | array | Ordered list of section nodes. Each is a component node (see §3). |

---

## 3. Section / Component Node

Every node in `sections` (and nested `children`) shares one shape:

```json
{
  "id": "car_rail",
  "type": "PRODUCT_RAIL",
  "props": { ... },
  "children": [ ... ],
  "action": { ... },
  "visibleIf": { ... },
  "stateBinding": "selectedCategory"
}
```

| Field | Type | Required | Purpose |
|---|---|---|---|
| `id` | string | yes | Stable node identity (for state binding, analytics). |
| `type` | string | yes | Server component identifier. The registry maps this to a React component. Unknown types hit the fallback. |
| `props` | object | no | Component-specific props (data, config). Passed through to the registered component. |
| `children` | array | no | Nested nodes (for composites like grids containing cards). |
| `action` | object | no | Action fired on tap of this node (see §5). |
| `visibleIf` | object | no | Conditional rendering predicate (see §6). Absent = always visible. |
| `stateBinding` | string | no | Declares this node reads a state key; re-renders when it changes. |

---

## 4. Styling Contract

**Decision:** minimal design tokens + whitelisted JSON style overrides.

```json
{
  "props": {
    "style": {
      "paddingVertical": 12,
      "backgroundColor": "transparent"
    }
  }
}
```

- The engine exposes a fixed set of RN style keys (numeric/`ColorString` only — no function values, no `eval`).
- Design tokens (colors, spacing, typography) live in the app's `constants/theme.ts`, referenced by token name in JSON: `"backgroundColor": "$surface"`.
- Components may declare their own internal styles; JSON overrides are merged on top.
- **Why:** lets the server tweak spacing/colors without a release, but blocks arbitrary code execution and keeps the COVERAGE.md claim honest ("styling overrides are supported").

---

## 5. Actions

Actions are `{ type, ... }`. The dispatcher is generic — it routes by type, writes to the state store, and notifies subscribers. It has zero knowledge of screens.

### Action types

| Type | Shape | Effect |
|---|---|---|
| `SET_STATE` | `{type, key, value}` | Write `value` to store under `key`. Bound components re-render. **The workhorse.** |
| `TOGGLE_WISHLIST` | `{type, itemId}` | Toggle `itemId` in the `wishlist` store key. |
| `NAVIGATE` | `{type, route, params?}` | Navigate to a named route (expo-router). |
| `OPEN_URL` | `{type, url}` | Open an external URL (Linking). |
| `NOOP` | `{type}` | Explicit no-op (for non-interactive elements). |

Unknown action types are logged and ignored — never crash.

### The flagship interaction (category chips)

Per [ADR-0002](../docs/adr/0002-interactions-chips.md) and [ADR-0003](../docs/adr/0003-action-state-contract.md):

```json
{
  "id": "chips",
  "type": "CHIP_RAIL",
  "props": {
    "chips": [
      { "id": "all", "label": "All", "action": { "type": "SET_STATE", "key": "selectedCategory", "value": "all" } },
      { "id": "used", "label": "Buy used car", "action": { "type": "SET_STATE", "key": "selectedCategory", "value": "used" } },
      { "id": "premium", "label": "Premium", "action": { "type": "SET_STATE", "key": "selectedCategory", "value": "premium" } }
    ],
    "selectedKey": "selectedCategory"
  }
},
{
  "id": "car_rail",
  "type": "PRODUCT_RAIL",
  "stateBinding": "selectedCategory",
  "props": {
    "title": "Used cars you'll love",
    "activeKey": "selectedCategory",
    "contentByCategory": {
      "all": [ "…car objects…" ],
      "used": [ "…different cars…" ],
      "premium": [ "…premium cars…" ]
    },
    "wishlistKey": "wishlist"
  }
}
```

Flow: tap "Premium" → dispatcher runs `SET_STATE {key:"selectedCategory", value:"premium"}` → store updates → `PRODUCT_RAIL` (bound to `selectedCategory`) re-renders with `contentByCategory.premium`. The client holds zero knowledge of category names or chip→list mappings.

**Honest caveat (goes in COVERAGE.md):** variants are pre-loaded; selection is state-driven, not a network round-trip per tap. This is the standard production SDUI pattern. A server-fetch-per-action remains a documented stretch.

---

## 6. Conditional Rendering

`visibleIf` evaluates a predicate against the state store:

```json
{
  "visibleIf": { "stateKey": "selectedCategory", "equals": "premium" }
}
```

| Operator | Meaning |
|---|---|
| `equals` | Strict equality. |
| `in` | Value is in an array. |
| `notEquals` | Strict inequality. |

Absent `visibleIf` = always render. The evaluator is generic and lives in the engine.

---

## 7. Versioning Strategy

Two layers:

1. **`schemaVersion`** (payload format). The parser knows its supported version. If the payload's `schemaVersion` is **higher** than supported, the parser rejects with a "please update" state (forward-incompatibility, by design — a newer payload may use fields the old client can't render safely). If **lower or equal**, render normally.
2. **`minClientVersion`** (client requirement). If the payload declares a `minClientVersion` above the client's version, show a graceful "update available" state instead of rendering broken UI.

### Forward-compatibility (old client, new payload)

- **Unknown fields:** the parser ignores fields it doesn't recognize (permissive on the prop level).
- **Unknown component types:** the fallback renders "Content unavailable" (per ADR-0002). Never crash.
- **Unknown action types:** logged and ignored. Never crash.

This lets the server ship new components to new clients while old clients degrade gracefully — the core SDUI value proposition.

---

## 8. Landing-Page Patterns This Schema Expresses

Mapped to `spec.md`'s 8 sections:

| spec.md section | Schema `type` | Expressible? |
|---|---|---|
| 1. Header / location / search | `HEADER_BAR` | ✅ |
| 1. Category icon rail | `CHIP_RAIL` (selectable, state-driven) | ✅ |
| 2. Promo banner rail | `BANNER_RAIL` (horizontal) | ✅ |
| 3. Value-prop grid | `VALUE_PROP_GRID` | ✅ |
| 4. Loans circular rail | `CIRCULAR_RAIL` | ✅ |
| 5. Car-check grid (2×3) | `METRIC_GRID` | ✅ |
| 6. Product rail (car cards, EMI, wishlist) | `PRODUCT_RAIL` + `CAR_CARD` child + `TOGGLE_WISHLIST` | ✅ |
| 7. Vehicle management hub | `VEHICLE_MANAGER` + child chips | ✅ |
| 8. Showrooms | `SHOWROOM_CARD` rail | ✅ |

All 8 expressible with registered components + the action/state contract. No section requires client-side logic beyond its own component implementation.

---

## 9. What's NOT in the Schema (Known Gaps)

Honest gaps for the COVERAGE.md claim:

- **Maps** (`MAP_VIEW`) — not built; would need a native module.
- **Video players** (`VIDEO_PLAYER`) — not built.
- **Complex forms** (multi-step wizards, validation) — `FORM` + `FORM_FIELD` types are stretch, not baseline.
- **Server-fetch-per-action** — variants are pre-loaded; a live round-trip is documented stretch.
- **Animation timelines** — `ENTER_ANIMATION` is stretch.

These go in COVERAGE.md as "patterns that need new client code."

---

## 10. Open Questions (for review before Phase 2)

1. **Should `state` support nested keys** (e.g., `{"ui": {"selectedCategory": "all"}}`)? Current design: flat keys only. Simpler, but less expressive for complex screens.
2. **Should `contentByCategory` be a generic `contentByKey` pattern**, or is per-component data shape fine? Current: per-component (the `PRODUCT_RAIL` knows its shape). Trade-off: more generic = more reuse, less type-safety.
3. **Telemetry on fallback** — should the engine emit a structured event when an unknown type is hit? (Yes for production; maybe overkill for the assignment.)

---

## Related

- [ADR-0001: Build scope](../docs/adr/0001-build-scope.md)
- [ADR-0002: Interactions](../docs/adr/0002-interactions-chips.md)
- [ADR-0003: Action/state contract](../docs/adr/0003-action-state-contract.md)
- [`docs/glossary.md`](../docs/glossary.md)
