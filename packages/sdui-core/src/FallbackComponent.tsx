/**
 * Fallback for unknown component types.
 *
 * Hard project rule: the renderer must NEVER throw on a node whose `type` is
 * not in the registry. Instead it mounts this component, logs once per
 * unknown type, and keeps rendering the rest of the page.
 *
 * The core package deliberately avoids importing React Native primitives.
 * That keeps the engine generic and lets the host app decide how visible
 * placeholders should be rendered. By default, the fallback is hidden.
 */

import React, { useRef } from 'react';
import type { SDUIComponentInjectedProps } from './types';

export type FallbackMode = 'hidden' | 'placeholder' | 'debug';

export interface FallbackComponentProps extends SDUIComponentInjectedProps {
  type: string;
  mode?: FallbackMode;
  id?: string;
}

const loggedTypes = new Set<string>();

function logOnce(type: string, id?: string): void {
  if (loggedTypes.has(type)) return;
  loggedTypes.add(type);
  // eslint-disable-next-line no-console
  console.warn(
    `[sdui] unknown component type "${type}"` +
      (id ? ` (node id: ${id})` : '') +
      ' — rendering fallback',
  );
}

/** Visible modes use string host nodes to avoid coupling core to RN imports. */
function createDebugElement(type: string, id?: string): React.ReactElement {
  return React.createElement(
    'sdui-fallback',
    { testID: `sdui-fallback-${type}`, 'data-node-id': id },
    `Unknown component: ${type}`,
  );
}

export function FallbackComponent(
  props: FallbackComponentProps,
): React.ReactElement | null {
  const { type, mode = 'hidden', id, nodeId } = props;
  const lastLogged = useRef<string | null>(null);

  if (lastLogged.current !== type) {
    logOnce(type, id ?? nodeId);
    lastLogged.current = type;
  }

  if (mode === 'hidden') return null;
  return createDebugElement(type, id ?? nodeId);
}
