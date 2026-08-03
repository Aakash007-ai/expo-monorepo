# ADR-0002 — Interactions: category chips are the flagship SDUI flow

Status: **Accepted**

## Context
The assessment's recording checklist names *"the tenure selector + bottom
sheet working"* as a required beat, and gives the tenure→EMI recompute as its
canonical example of JSON-driven actions. But the home page component list
contains no tenure selector. The user explicitly decided: **no EMI, no bottom
sheet, no tenure — skip it.** The category chips must instead demonstrate real
SDUI: content changes because JSON says so, never client-side logic.

## Decision
- **Flagship interaction:** the category-chip rail. Chips render from JSON and
  dispatch `SET_STATE` actions (ADR-0003); tapping a chip swaps the product
  rail's content purely via the state store. The client holds zero knowledge
  of which categories exist or what they map to.
- **Secondary data-driven action:** wishlist heart toggle (`TOGGLE_WISHLIST`)
  on product cards, also state-driven.
- **EMI / tenure / bottom sheet is cut.** The deviation from the assessment's
  recording checklist is written into README trade-offs so it can be defended
  in the debrief.

## Consequences
- Recording shows chips → content-swap as the interactive beat. The tenure
  beat is absent by choice; documented, not hidden.
- The action dispatcher is demonstrated end-to-end (tap → action → state →
  re-render), which is what the 30% architecture bucket really scores.
- Cheaper than the EMI flow: no new widget, no computation semantics — one
  generic action type and a data-bound rail.

## Alternatives rejected
- Car-card EMI → bottom-sheet tenure selector — rejected by the user (also
  viable, but more surface).
- Tenure kept to satisfy the recording checklist — rejected by the user.
