# ADR-0006 — Supersede ADR-0002: Restore tenure/EMI + bottom sheet

Status: **Accepted**

Supersedes: ADR-0002

## Context

ADR-0002 explicitly cut EMI/tenure/bottom-sheet:

> "EMI / tenure / bottom sheet is cut."

However, the assignment's recording checklist explicitly requires:

- Tenure selector working
- EMI update flow
- Bottom sheet demo

The user confirmed in session that these must be implemented to satisfy the assignment requirements.

## Decision

**ADR-0002 is superseded.** The new flagship interaction set:

1. **Category chips** — `CHIP_RAIL` dispatches `SET_STATE { key: "selectedCategory", value: "..." }` → `PRODUCT_RAIL` content swaps via `contentByCategory[selectedCategory]`.

2. **Tenure selector** — `TenureSelector` dispatches `SET_STATE { key: "selectedTenure", value: "24" }` → EMI display re-renders from `emiByTenure[selectedTenure]`.

3. **Bottom sheet** — `OPEN_BOTTOM_SHEET { target: "tenure_sheet" }` action opens a bottom sheet component. The sheet content is looked up from `state.bottomSheets[target]`.

4. **Wishlist toggle** — `TOGGLE_WISHLIST { itemId }` toggles item in `state.wishlist` array.

## Action Contract Additions

The schema (`schema/SCHEMA_DESIGN.md`) must be updated to include:

| Action Type | Shape | Effect |
|---|---|---|
| `OPEN_BOTTOM_SHEET` | `{ type, target }` | Opens bottom sheet identified by `target` from `state.bottomSheets`. |
| `CLOSE_BOTTOM_SHEET` | `{ type }` | Closes any open bottom sheet. |

### State Shape for Bottom Sheet

```json
{
  "state": {
    "bottomSheet": {
      "activeId": null
    },
    "bottomSheets": {
      "tenure_sheet": {
        "title": "EMI Details",
        "content": [ ...nodes... ]
      }
    }
  }
}
```

## Consequences

- Recording checklist is fully satisfied.
- ADR-0002's "no EMI/tenure/bottom-sheet" decision is reversed.
- Implementation complexity increases modestly (one more component type, two more actions).
- The action dispatcher remains generic — no Cars24-specific logic.

## Alternatives Considered

- Keep ADR-0002, skip tenure/EMI — rejected because it fails the assignment's explicit recording requirements.
- Edit ADR-0002 directly — rejected per ADR README: "accepted ADRs are immutable, later changes should be new ADRs."

## Related

- ADR-0002 (superseded)
- ADR-0003 (action/state contract)
- `schema/SCHEMA_DESIGN.md` (to be updated with bottom-sheet actions)
