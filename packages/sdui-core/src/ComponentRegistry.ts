/**
 * Maps server-defined `type` strings to React components.
 *
 * The registry is the ONLY place that bridges JSON to React. A host app
 * (e.g. `apps/mobile/src/registry.ts`) calls `registerComponent('HEADER_BAR',
 * HeaderBar)` at boot; the renderer then resolves incoming node `type`s
 * against this map.
 *
 * Implementation notes:
 *   - Module-level singleton — there's one registry per app boot. Test code
 *     can call `resetComponentRegistry()` to start fresh.
 *   - Insertion order is preserved on iteration so fallback heuristics can
 *     show a sensible "first 3 registered components" debug list later.
 */

import type { SDUIComponent } from './types';

const registry = new Map<string, SDUIComponent>();

export function registerComponent(
  type: string,
  component: SDUIComponent,
): void {
  if (!type || typeof type !== 'string') {
    throw new Error('[sdui] registerComponent: type must be a non-empty string');
  }
  if (registry.has(type)) {
    // eslint-disable-next-line no-console
    console.warn(`[sdui] overwriting component registration for "${type}"`);
  }
  registry.set(type, component);
}

export function getComponent(type: string): SDUIComponent | null {
  return registry.get(type) ?? null;
}

export function hasComponent(type: string): boolean {
  return registry.has(type);
}

/** For tests and any hot-reload that needs a clean slate. */
export function resetComponentRegistry(): void {
  registry.clear();
}

/** Read-only view of the registered types (used by debug overlays / docs). */
export function listRegisteredTypes(): string[] {
  return Array.from(registry.keys());
}
