/**
 * React Context that wires together a parsed page, the registry, the state
 * store, and the action dispatcher.
 *
 * Host apps mount <SDUIProvider> once near the root, pass in the loaded
 * page plus the action handlers, and child components read state / dispatch
 * via useSDUI() or subscribe to a specific key via useSDUIState().
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import type { ActionHandlerOptions, SDUIContextValue, SDUIPage } from './types';
import { createStateStore, type StateStore } from './StateStore';
import { createActionDispatcher, type ActionDispatcher } from './ActionDispatcher';
import { getComponent } from './ComponentRegistry';

const SDUIContext = createContext<SDUIContextValue | null>(null);

export interface SDUIProviderProps extends ActionHandlerOptions {
  page: SDUIPage;
  children: React.ReactNode;
}

/**
 * Subscribe a component to a specific state key. The component re-renders
 * only when that key's value changes (per-key subscription in StateStore).
 */
export function useSDUIState<T = unknown>(key: string): T {
  const ctx = useSDUI();
  return useSyncExternalStore(
    (onChange) => ctx.stateStore.subscribe(key, () => onChange()),
    () => ctx.stateStore.getValue(key) as T,
    () => ctx.stateStore.getValue(key) as T,
  );
}

export function SDUIProvider(props: SDUIProviderProps): React.ReactElement {
  const {
    page,
    navigate,
    openUrl,
    openBottomSheet,
    closeBottomSheet,
    children,
  } = props;

  const pageId = page.pageId;
  const storeRef = useRef<StateStore | null>(null);
  const dispatcherRef = useRef<ActionDispatcher | null>(null);

  // Reset the store when the page identity changes; reuse it otherwise.
  if (!storeRef.current || storeRef.current.pageId !== pageId) {
    storeRef.current = createStateStore(page.initialState ?? {});
    (storeRef.current as StateStore & { pageId?: string }).pageId = pageId;
  }

  if (!dispatcherRef.current) {
    dispatcherRef.current = createActionDispatcher({
      stateStore: storeRef.current!,
      navigate,
      openUrl,
      openBottomSheet,
      closeBottomSheet,
    });
  }

  // Keep the dispatcher pointing at the latest handler closures.
  const handlersRef = useRef({ navigate, openUrl, openBottomSheet, closeBottomSheet });
  handlersRef.current = { navigate, openUrl, openBottomSheet, closeBottomSheet };
  useEffect(() => {
    dispatcherRef.current = createActionDispatcher({
      stateStore: storeRef.current!,
      navigate: handlersRef.current.navigate,
      openUrl: handlersRef.current.openUrl,
      openBottomSheet: handlersRef.current.openBottomSheet,
      closeBottomSheet: handlersRef.current.closeBottomSheet,
    });
  }, [navigate, openUrl, openBottomSheet, closeBottomSheet]);

  const value = useMemo<SDUIContextValue>(
    () => ({
      page,
      state: storeRef.current!.getState(),
      dispatch: dispatcherRef.current!.dispatch,
      getComponent,
      stateStore: storeRef.current!,
    }),
    [page],
  );

  return <SDUIContext.Provider value={value}>{children}</SDUIContext.Provider>;
}

export function useSDUI(): SDUIContextValue {
  const ctx = useContext(SDUIContext);
  if (!ctx) {
    throw new Error('[sdui] useSDUI must be used inside <SDUIProvider>');
  }
  return ctx;
}
