/**
 * Schema types for the SDUI engine.
 *
 * Everything here is screen-agnostic. The engine treats a page as a tree of
 * `SDUINode`s, each identified by a `type` string that the host app's
 * `ComponentRegistry` resolves to a React component. Actions flow through the
 * `ActionDispatcher`; persistent state lives in a `StateStore`.
 */

import type { ComponentType, ReactNode } from 'react';

/** Engine's supported schema version. Bump on breaking changes. */
export const SDUI_CORE_VERSION = '0.1.0';

/** Free-form prop bag supplied by SDUI JSON. */
export type SDUIProps = Record<string, unknown>;

/** What we ship in the registry. */
export type SDUIComponent<P = SDUIProps> = ComponentType<P>;

/** State is a flat map of arbitrary values keyed by string. */
export type SDUIState = Record<string, unknown>;

/** Conditional rendering predicate evaluated against current state. */
export type SDUIVisibleIf =
  | { equals: [string, unknown] }
  | { notEquals: [string, unknown] }
  | { exists: string }
  | { truthy: string }
  | { falsy: string };

/** Action JSON interpreted by the centralized dispatcher. */
export type SDUIAction =
  | { type: 'SET_STATE'; key: string; value: unknown }
  | { type: 'TOGGLE_WISHLIST'; itemId: string; key?: string }
  | { type: 'NAVIGATE'; route: string; params?: Record<string, unknown> }
  | { type: 'OPEN_URL'; url: string }
  | { type: 'OPEN_BOTTOM_SHEET'; target: string; props?: Record<string, unknown> }
  | { type: 'CLOSE_BOTTOM_SHEET'; target?: string }
  | { type: 'NOOP' }
  | { type: string; [k: string]: unknown };

/** Minimal StateStore shape exposed through React context. */
export interface SDUIStateStore {
  getState: () => SDUIState;
  getValue: (key: string) => unknown;
  setState: (key: string, value: unknown) => void;
  subscribe: (key: string, listener: (value: unknown, prev: unknown) => void) => () => void;
  toggleInSet: (key: string, itemId: string) => void;
}

/** Props the renderer injects into every registered component. */
export interface SDUIComponentInjectedProps {
  stateBinding?: string;
  dispatch?: (action: SDUIAction) => void;
  onPress?: () => void;
  children?: ReactNode;
  nodeId?: string;
}

/** A single component node in the page tree. */
export interface SDUINode {
  id?: string;
  type: string;
  props?: SDUIProps;
  children?: SDUINode[];
  action?: SDUIAction;
  visibleIf?: SDUIVisibleIf;
  stateBinding?: string;
}

/** Top-level page payload returned by the server. */
export interface SDUIPage {
  schemaVersion: string;
  minClientVersion?: string;
  pageId: string;
  initialState?: SDUIState;
  sections: SDUINode[];
}

/** Options the host app wires into the dispatcher at boot. */
export interface ActionHandlerOptions {
  navigate: (route: string, params?: Record<string, unknown>) => void;
  openUrl: (url: string) => void;
  openBottomSheet: (target: string, props?: Record<string, unknown>) => void;
  closeBottomSheet: (target?: string) => void;
}

/** Shape of the SDUI context returned by `useSDUI()`. */
export interface SDUIContextValue {
  page: SDUIPage;
  state: SDUIState;
  dispatch: (action: SDUIAction) => void;
  getComponent: (type: string) => SDUIComponent | null;
  stateStore: SDUIStateStore;
}
