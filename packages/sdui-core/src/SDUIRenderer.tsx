/**
 * Recursive JSON-to-tree renderer.
 *
 * For each section in `page.sections`:
 *   1. Evaluate `visibleIf` against the current state store → skip if false.
 *   2. Look up the component by `type` in the registry.
 *      - Miss → mount `FallbackComponent` (never throw).
 *   3. Pass `node.props`, the recursive `children`, and an injected
 *      `dispatch` callback bound to `node.action` (if any) so the component
 *      can stay declarative.
 *
 * Subscription strategy: a component that cares about a specific state key
 * should subscribe via `useSDUIState(key)`. The renderer itself does NOT
 * re-render on every state change — only on prop changes to the page tree
 * itself. This keeps the perf baseline honest.
 */

import React, { useCallback, useMemo } from 'react';
import { useSDUI } from './context';
import { evaluateVisibleIf } from './parser';
import { FallbackComponent } from './FallbackComponent';
import type {
  SDUIComponentInjectedProps,
  SDUIAction,
  SDUINode,
  SDUIProps,
} from './types';

export interface SDUIRendererProps {
  Wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  fallbackMode?: 'hidden' | 'placeholder' | 'debug';
  testIdPrefix?: string;
}

/** Internal props every rendered component receives. */
function buildInjectedProps(
  node: SDUINode,
  dispatch: (action: SDUIAction) => void,
): SDUIComponentInjectedProps {
  const injected: SDUIComponentInjectedProps = {
    nodeId: node.id,
  };
  if (node.action) {
    const action: SDUIAction = node.action;
    injected.dispatch = dispatch;
    injected.onPress = () => dispatch(action);
  }
  if (node.stateBinding) {
    injected.stateBinding = node.stateBinding;
  }
  return injected;
}

/**
 * Render a single node and recursively render its children. Kept as a
 * separate component so React can bail out of re-rendering siblings when
 * one node's state changes.
 */
const NodeRenderer = React.memo(function NodeRenderer({
  node,
  fallbackMode,
  testIdPrefix,
}: {
  node: SDUINode;
  fallbackMode: 'hidden' | 'placeholder' | 'debug';
  testIdPrefix?: string;
}): React.ReactElement | null {
  const { getComponent, dispatch, stateStore } = useSDUI();

  const visibilityKeys = useMemo(
    () => collectPredicateKeys(node.visibleIf),
    [node.visibleIf],
  );
  const state = stateStore.getState();
  const matched = useMemo(
    () => evaluateVisibleIf(node.visibleIf, state),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node.visibleIf, state, ...visibilityKeys.map((k) => state[k])],
  );
  if (!matched) return null;

  const Component = getComponent(node.type);

  // Unknown component → fallback, never throw.
  if (!Component) {
    return (
      <FallbackComponent
        type={node.type}
        id={node.id}
        nodeId={node.id}
        mode={fallbackMode}
      />
    );
  }

  const props: SDUIProps = {
    ...(node.props ?? {}),
    ...buildInjectedProps(node, dispatch),
    ...(testIdPrefix ? { testID: `${testIdPrefix}-${node.id ?? node.type}` } : {}),
  };

  return (
    <Component {...props}>
      {node.children?.map((child, i) => (
        <NodeRenderer
          key={child.id ?? `${node.id ?? node.type}-${i}`}
          node={child}
          fallbackMode={fallbackMode}
          {...(testIdPrefix ? { testIdPrefix } : {})}
        />
      ))}
    </Component>
  );
});

/** Pull out the keys a `visibleIf` predicate references so we can re-evaluate. */
function collectPredicateKeys(predicate: SDUINode['visibleIf']): string[] {
  if (!predicate) return [];
  if ('equals' in predicate) return [predicate.equals[0]];
  if ('notEquals' in predicate) return [predicate.notEquals[0]];
  if ('exists' in predicate) return [predicate.exists];
  if ('truthy' in predicate) return [predicate.truthy];
  if ('falsy' in predicate) return [predicate.falsy];
  return [];
}

export function SDUIRenderer(
  props: SDUIRendererProps,
): React.ReactElement | null {
  const { page } = useSDUI();
  const Wrapper = props.Wrapper ?? React.Fragment;
  const fallbackMode = props.fallbackMode ?? 'hidden';
  const testIdPrefix = props.testIdPrefix;

  const sections = page.sections;

  const renderSections = useCallback(() => {
    return sections.map((node, i) => (
      <NodeRenderer
        key={node.id ?? `section-${i}`}
        node={node}
        fallbackMode={fallbackMode}
        {...(testIdPrefix ? { testIdPrefix } : {})}
      />
    ));
  }, [sections, fallbackMode, testIdPrefix]);

  return <Wrapper>{renderSections()}</Wrapper>;
}