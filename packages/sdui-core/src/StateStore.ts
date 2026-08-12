/**
 * Minimal reactive store for SDUI page state.
 *
 * Why hand-rolled instead of pulling Zustand/Jotai:
 *   - The store's contract is tiny (get/set/subscribe/toggleInSet) and lives
 *     inside one generic package — zero business logic.
 *   - Per-key subscriptions let the renderer skip re-renders on unrelated
 *     state changes. A product-rail that watches `selectedCategory` shouldn't
 *     re-render when `wishlist` changes.
 *   - No external dep keeps `sdui-core` portable and the perf baseline honest.
 */

import type { SDUIState } from './types';

export type Listener = (value: unknown, prev: unknown) => void;

export interface StateStore {
  /** Internal: which page this store belongs to. Used to reset on page swap. */
  pageId?: string;
  /** Read the entire state object (snapshot — do not mutate). */
  getState: () => SDUIState;
  /** Read a single key. */
  getValue: (key: string) => unknown;
  /** Set a single key. Triggers subscribers. */
  setState: (key: string, value: unknown) => void;
  /** Subscribe to a specific key. Returns an unsubscribe function. */
  subscribe: (key: string, listener: Listener) => () => void;
  /** Toggle membership of `itemId` in the array stored at `key`. */
  toggleInSet: (key: string, itemId: string) => void;
}

export function createStateStore(initial: SDUIState = {}): StateStore {
  const state: SDUIState = { ...initial };
  const listeners = new Map<string, Set<Listener>>();

  function emit(key: string, value: unknown, prev: unknown): void {
    const set = listeners.get(key);
    if (!set || set.size === 0) return;
    for (const fn of set) {
      try {
        fn(value, prev);
      } catch (err) {
        // Never let a bad listener break the store.
        // eslint-disable-next-line no-console
        console.warn('[sdui] subscriber threw for key', key, err);
      }
    }
  }

  const store: StateStore = {
    getState: () => ({ ...state }),
    getValue: (key) => state[key],
    setState: (key, value) => {
      const prev = state[key];
      if (Object.is(prev, value)) return;
      state[key] = value;
      emit(key, value, prev);
    },
    subscribe: (key, listener) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(listener);
      return () => {
        set!.delete(listener);
        if (set!.size === 0) listeners.delete(key);
      };
    },
    toggleInSet: (key, itemId) => {
      const current = state[key];
      const list: unknown[] = Array.isArray(current) ? [...current] : [];
      const idx = list.indexOf(itemId);
      if (idx === -1) {
        list.push(itemId);
      } else {
        list.splice(idx, 1);
      }
      const prev = state[key];
      state[key] = list;
      emit(key, list, prev);
    },
  };
  return store;
}