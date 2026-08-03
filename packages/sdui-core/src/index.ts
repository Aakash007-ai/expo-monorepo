/**
 * @cars24/sdui-core
 *
 * Generic Server-Driven UI engine. Consumed by any app; holds zero
 * screen-specific logic. The renderer walks a JSON page payload and mounts
 * registered components, routing all interactivity through a single action
 * dispatcher and falling back gracefully on unknown component types.
 *
 * Engine surface (built out in the SDUI build phase):
 *   - Schema types        (page, section, props, action, state)
 *   - SDUI parser          (validate + normalize a payload)
 *   - ComponentRegistry    (type string -> React component)
 *   - ActionDispatcher     (SET_STATE / NAVIGATE / OPEN_URL / TOGGLE_WISHLIST)
 *   - StateStore           (page-level reactive store, initialized from JSON)
 *   - FallbackComponent    (never crash on unknown types)
 *   - SDUIProvider / useSDUI (renderer root + context)
 */

export const SDUI_CORE_VERSION = '0.1.0';
