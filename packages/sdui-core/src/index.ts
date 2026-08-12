/**
 * @cars24/sdui-core — generic Server-Driven UI engine.
 *
 * This package owns the JSON tree-walker, component registry, action
 * dispatcher, reactive state store, fallback, and React provider. It must
 * remain domain-agnostic — no Cars24, no landing-page, no screen-specific
 * imports anywhere in this file or its neighbors.
 */

// Engine version + schema version
export { SDUI_CORE_VERSION } from './types';
export type {
  SDUIPage,
  SDUINode,
  SDUIAction,
  SDUIState,
  SDUIVisibleIf,
  SDUIComponentInjectedProps,
  SDUIContextValue,
  SDUIComponent,
  ActionHandlerOptions,
  SDUIProps,
} from './types';

// Reactive state store
export {
  createStateStore,
  type StateStore,
  type Listener,
} from './StateStore';

// Component registry
export {
  registerComponent,
  getComponent,
  hasComponent,
  resetComponentRegistry,
  listRegisteredTypes,
} from './ComponentRegistry';

// Action dispatcher
export {
  createActionDispatcher,
  compareVersions,
  type ActionDispatcher,
  type ActionDispatcherOptions,
} from './ActionDispatcher';

// Fallback for unknown types
export {
  FallbackComponent,
  type FallbackMode,
  type FallbackComponentProps,
} from './FallbackComponent';

// Parser / validator
export {
  parsePage,
  validatePage,
  evaluateVisibleIf,
  type ParseResult,
} from './parser';

// React integration
export {
  SDUIProvider,
  useSDUI,
  useSDUIState,
  type SDUIProviderProps,
} from './context';

// Recursive renderer
export { SDUIRenderer, type SDUIRendererProps } from './SDUIRenderer';
