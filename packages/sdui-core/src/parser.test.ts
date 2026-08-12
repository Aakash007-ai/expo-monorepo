import { parsePage, validatePage, evaluateVisibleIf } from './parser';
import { SDUI_CORE_VERSION } from './types';

describe('evaluateVisibleIf', () => {
  test('returns true when predicate absent', () => {
    expect(evaluateVisibleIf(undefined, {})).toBe(true);
  });

  test('equals predicate', () => {
    expect(evaluateVisibleIf({ equals: ['k', 'v'] }, { k: 'v' })).toBe(true);
    expect(evaluateVisibleIf({ equals: ['k', 'v'] }, { k: 'x' })).toBe(false);
  });

  test('notEquals predicate', () => {
    expect(evaluateVisibleIf({ notEquals: ['k', 'v'] }, { k: 'x' })).toBe(true);
    expect(evaluateVisibleIf({ notEquals: ['k', 'v'] }, { k: 'v' })).toBe(false);
  });

  test('exists predicate', () => {
    expect(evaluateVisibleIf({ exists: 'k' }, { k: 1 })).toBe(true);
    expect(evaluateVisibleIf({ exists: 'k' }, {})).toBe(false);
  });

  test('truthy predicate', () => {
    expect(evaluateVisibleIf({ truthy: 'k' }, { k: 1 })).toBe(true);
    expect(evaluateVisibleIf({ truthy: 'k' }, { k: 0 })).toBe(false);
  });

  test('falsy predicate', () => {
    expect(evaluateVisibleIf({ falsy: 'k' }, { k: 0 })).toBe(true);
    expect(evaluateVisibleIf({ falsy: 'k' }, { k: 1 })).toBe(false);
  });
});

describe('validatePage', () => {
  test('valid page has no errors', () => {
    const page = {
      schemaVersion: SDUI_CORE_VERSION,
      pageId: 'p1',
      sections: [{ type: 'X' }],
    };
    expect(validatePage(page)).toEqual([]);
  });

  test('missing schemaVersion errors', () => {
    const errors = validatePage({ pageId: 'p', sections: [] });
    expect(errors).toContain('schemaVersion must be a string');
  });

  test('missing pageId errors', () => {
    const errors = validatePage({ schemaVersion: '0.1.0', sections: [] });
    expect(errors).toContain('pageId must be a string');
  });

  test('missing sections errors', () => {
    const errors = validatePage({ schemaVersion: '0.1.0', pageId: 'p' });
    expect(errors.some((e) => e.includes('sections'))).toBe(true);
  });

  test('section without type errors', () => {
    const errors = validatePage({
      schemaVersion: '0.1.0',
      pageId: 'p',
      sections: [{ id: 'x' }],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  test('root not an object returns root error', () => {
    expect(validatePage(null).length).toBeGreaterThan(0);
  });
});

describe('parsePage', () => {
  test('returns null when not an object', () => {
    expect(parsePage(null)).toBeNull();
  });

  test('happy path', () => {
    const result = parsePage({
      schemaVersion: SDUI_CORE_VERSION,
      pageId: 'p1',
      sections: [{ type: 'A' }],
      initialState: { foo: 'bar' },
    });
    expect(result?.page.pageId).toBe('p1');
    expect(result?.page.sections).toHaveLength(1);
    expect(result?.page.initialState).toEqual({ foo: 'bar' });
  });

  test('newer schema produces a warning but still renders', () => {
    const result = parsePage({
      schemaVersion: '99.0.0',
      pageId: 'p1',
      sections: [],
    });
    expect(result).not.toBeNull();
    expect(result!.warnings.length).toBeGreaterThan(0);
  });

  test('minClientVersion gate: too-new requirement rejects', () => {
    expect(
      parsePage({
        schemaVersion: SDUI_CORE_VERSION,
        pageId: 'p1',
        sections: [],
        minClientVersion: '99.0.0',
      }),
    ).toBeNull();
  });

  test('missing initialState gets empty default', () => {
    const r = parsePage({
      schemaVersion: SDUI_CORE_VERSION,
      pageId: 'p1',
      sections: [],
    });
    expect(r?.page.initialState).toEqual({});
  });
});
