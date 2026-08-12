/**
 * Central action dispatcher.
 *
 * Every interactive element in an SDUI page eventually fires an action JSON
 * blob. The dispatcher is the single place that interprets those blobs and
 * routes them to host-app handlers (state store, navigation, bottom sheets,
 * external URLs, wishlist toggle, etc.).
 *
 * Why this exists:
 *   - Components stay declarative ("fire this action on tap") and never
 *     reach into navigation or state directly.
 *   - The host app can swap any handler (e.g. swap React Navigation for
 *     expo-router) without touching component code.
 *   - Unknown action types log a warning and do nothing — never throw.
 */

import type {
  ActionHandlerOptions,
  SDUIAction,
} from './types';
import type { StateStore } from './StateStore';

export interface ActionDispatcherOptions extends ActionHandlerOptions {
  stateStore: StateStore;
}

export interface ActionDispatcher {
  dispatch: (action: SDUIAction | undefined | null) => void;
}

/**
 * Compare two semantic versions (`"0.1.0"` vs `"0.2.0"`). Returns negative /
 * zero / positive so `a < b` works directly. Non-numeric suffixes are
 * compared lexicographically as a tie-breaker. This is good enough for the
 * SDUI engine's `minClientVersion` check; it does not need to handle SemVer
 * pre-release tags beyond that.
 */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.');
  const pb = b.split('.');
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = Number(pa[i] ?? 0);
    const nb = Number(pb[i] ?? 0);
    if (!Number.isNaN(na) && !Number.isNaN(nb) && (na !== nb)) {
      return na - nb;
    }
    const sa = String(pa[i] ?? '');
    const sb = String(pb[i] ?? '');
    if (sa !== sb) return sa < sb ? -1 : 1;
  }
  return 0;
}

export function createActionDispatcher(
  opts: ActionDispatcherOptions,
): ActionDispatcher {
  const { stateStore, navigate, openUrl, openBottomSheet, closeBottomSheet } =
    opts;

  function dispatch(action: SDUIAction | undefined | null): void {
    if (!action || typeof action !== 'object' || !('type' in action)) {
      return; // tolerate null/undefined/no-action gracefully
    }
    const { type } = action;
    try {
      switch (type) {
        case 'SET_STATE': {
          const { key, value } = action as Extract<SDUIAction, { type: 'SET_STATE' }>;
          stateStore.setState(key, value);
          return;
        }
        case 'TOGGLE_WISHLIST': {
          const { itemId, key } = action as Extract<SDUIAction, { type: 'TOGGLE_WISHLIST' }>;
          stateStore.toggleInSet(key ?? 'wishlist', itemId);
          return;
        }
        case 'NAVIGATE': {
          const { route, params } = action as Extract<SDUIAction, { type: 'NAVIGATE' }>;
          navigate(route, params);
          return;
        }
        case 'OPEN_URL': {
          const { url } = action as Extract<SDUIAction, { type: 'OPEN_URL' }>;
          openUrl(url);
          return;
        }
        case 'OPEN_BOTTOM_SHEET': {
          const { target, props } = action as Extract<SDUIAction, { type: 'OPEN_BOTTOM_SHEET' }>;
          openBottomSheet(target, props);
          return;
        }
        case 'CLOSE_BOTTOM_SHEET': {
          const { target } = action as Extract<SDUIAction, { type: 'CLOSE_BOTTOM_SHEET' }>;
          closeBottomSheet(target);
          return;
        }
        case 'NOOP':
          return;
        default: {
          // eslint-disable-next-line no-console
          console.warn(`[sdui] unknown action type "${type}" — ignored`);
        }
      }
    } catch (err) {
      // A buggy handler must never crash the page.
      // eslint-disable-next-line no-console
      console.error('[sdui] action handler threw', err);
    }
  }

  return { dispatch };
}

export { compareVersions };
