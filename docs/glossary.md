# Glossary

Live document — grows as the grilling session settles terminology.

| Term | Meaning |
|---|---|
| **SDUI** | Server-Driven UI. Server sends JSON; client renders the page. Layout/content changes ship by editing JSON, not app releases. |
| **Component registry** | Server names a component `type`; client maps that string to a native view component. |
| **Action** | An interactive intent expressed in JSON (navigate, open sheet, update state, toggle). Wired through one dispatcher, never local `onPress` hacks. |
| **Fallback component** | Rendered when the client receives a `type` it doesn't know; must degrade gracefully, never crash. |
| **TTR** | Time To Render: cold open → page fully rendered above the fold. |
| **TTI** | Time To Interactive: cold open → page scrollable and tappable. |
| **Coverage** | % of a *new* unseen screen that would render with JSON-only changes vs. needing new client code. |
| **Static version** | Hardcoded native clone of the chosen screen; the perf baseline to benchmark SDUI against. |
| **State store** | Page-level reactive store, initialized from JSON `state`. Actions write to it; bound components re-render. |
| **SET_STATE** | Action shape `{type:"SET_STATE", key, value}` — writes a value into the store. The generic workhorse of the action contract. |
| **stateBinding** | A component's declaration that it reads a store key and re-renders when it changes. |
| **TOGGLE_WISHLIST** | Action toggling membership of a store key (e.g., a wishlist set keyed by product id). |
