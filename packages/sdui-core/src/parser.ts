/**
 * Parser / validator for SDUI payloads.
 *
 * The engine is forgiving on purpose: a page should still load even if a
 * non-critical field is malformed, because the alternative is "white screen,
 * no explanation." Two layers of checks live here:
 *
 *   1. Strict structural validation — used by tests and CI to catch
 *      author-time bugs in payloads.
 *   2. Lenient normalization (`parsePage`) — used at runtime; bad fields
 *      fall back to safe defaults and the page still renders whatever it
 *      can.
 *
 * The version gates (`schemaVersion` <= supported, `minClientVersion` <=
 * client) live here so the caller can decide what to do (refuse, warn, or
 * silently render partial).
 */

import { SDUI_CORE_VERSION, type SDUIPage, type SDUINode } from './types';

export interface ParseResult {
  page: SDUIPage;
  warnings: string[];
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * Lightweight semantic-version compare (same approach as the one in
 * ActionDispatcher — duplicated here to avoid an import cycle).
 */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.');
  const pb = b.split('.');
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = Number(pa[i] ?? 0);
    const nb = Number(pb[i] ?? 0);
    if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
    const sa = String(pa[i] ?? '');
    const sb = String(pb[i] ?? '');
    if (sa !== sb) return sa < sb ? -1 : 1;
  }
  return 0;
}

/**
 * Evaluate a `visibleIf` predicate against the current state. Returns `true`
 * when the predicate is absent (default-visible).
 */
export function evaluateVisibleIf(
  predicate: SDUINode['visibleIf'],
  state: Record<string, unknown>,
): boolean {
  if (!predicate) return true;
  if ('equals' in predicate) {
    const [key, value] = predicate.equals;
    return Object.is(state[key], value);
  }
  if ('notEquals' in predicate) {
    const [key, value] = predicate.notEquals;
    return !Object.is(state[key], value);
  }
  if ('exists' in predicate) {
    return predicate.exists in state;
  }
  if ('truthy' in predicate) {
    return Boolean(state[predicate.truthy]);
  }
  if ('falsy' in predicate) {
    return !state[predicate.falsy];
  }
  return true;
}

/**
 * Strict structural validator. Returns an array of human-readable error
 * strings; empty array means the payload looks well-formed.
 */
export function validatePage(input: unknown): string[] {
  const errors: string[] = [];
  if (!isObject(input)) {
    errors.push('root must be an object');
    return errors;
  }
  if (typeof input.schemaVersion !== 'string') {
    errors.push('schemaVersion must be a string');
  }
  if (typeof input.pageId !== 'string') {
    errors.push('pageId must be a string');
  }
  if (!Array.isArray(input.sections)) {
    errors.push('sections must be an array');
  } else {
    input.sections.forEach((n, i) => {
      const node = n as Record<string, unknown>;
      if (!isObject(node)) {
        errors.push(`sections[${i}] is not an object`);
        return;
      }
      if (typeof node.type !== 'string' || node.type.length === 0) {
        errors.push(`sections[${i}].type must be a non-empty string`);
      }
    });
  }
  return errors;
}

/**
 * Normalize an arbitrary JSON payload into a usable `SDUIPage`. Returns
 * `null` only when the payload is so broken that nothing can render
 * (missing `pageId` or `sections` array). All other issues are reported
 * as warnings and the engine renders whatever it can.
 */
export function parsePage(input: unknown): ParseResult | null {
  if (!isObject(input)) return null;

  const warnings: string[] = [];

  // Schema version gate — if the server targets a NEWER schema than we
  // understand, we may still try to render what we recognize. We don't
  // refuse outright: missing components degrade gracefully.
  const schemaVersion = asString(input.schemaVersion, SDUI_CORE_VERSION);
  const schemaSupported =
    compareVersions(schemaVersion, SDUI_CORE_VERSION) <= 0;
  if (!schemaSupported) {
    warnings.push(
      `schemaVersion ${schemaVersion} is newer than supported ${SDUI_CORE_VERSION}; rendering best-effort`,
    );
  }

  // minClientVersion gate — older clients should refuse the page.
  const minClientVersion = asString(input.minClientVersion);
  if (minClientVersion) {
    if (compareVersions(minClientVersion, SDUI_CORE_VERSION) > 0) {
      // Caller will see `page === null` and can show an upgrade prompt.
      return null;
    }
  }

  const pageId = asString(input.pageId);
  if (!pageId) {
    warnings.push('pageId missing — using empty fallback');
  }
  const sections = asArray<SDUINode>(input.sections);
  const initialState = isObject(input.initialState)
    ? { ...(input.initialState as Record<string, unknown>) }
    : {};

  return {
    page: {
      schemaVersion,
      pageId,
      sections,
      initialState,
      ...(minClientVersion ? { minClientVersion } : {}),
    },
    warnings,
  };
}
