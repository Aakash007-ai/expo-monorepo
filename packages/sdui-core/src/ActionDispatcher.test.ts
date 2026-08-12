import { createActionDispatcher, compareVersions } from './ActionDispatcher';
import { createStateStore } from './StateStore';

function makeDispatcher() {
  const stateStore = createStateStore({ wishlist: [] });
  const navigate = jest.fn();
  const openUrl = jest.fn();
  const openBottomSheet = jest.fn();
  const closeBottomSheet = jest.fn();
  const dispatcher = createActionDispatcher({
    stateStore,
    navigate,
    openUrl,
    openBottomSheet,
    closeBottomSheet,
  });
  return { dispatcher, stateStore, navigate, openUrl, openBottomSheet, closeBottomSheet };
}

describe('ActionDispatcher', () => {
  test('SET_STATE updates the store', () => {
    const { dispatcher, stateStore } = makeDispatcher();
    dispatcher.dispatch({ type: 'SET_STATE', key: 'selectedCategory', value: 'sedan' });
    expect(stateStore.getValue('selectedCategory')).toBe('sedan');
  });

  test('NAVIGATE calls navigate handler', () => {
    const { dispatcher, navigate } = makeDispatcher();
    dispatcher.dispatch({ type: 'NAVIGATE', route: '/details', params: { id: 1 } });
    expect(navigate).toHaveBeenCalledWith('/details', { id: 1 });
  });

  test('OPEN_URL calls openUrl handler', () => {
    const { dispatcher, openUrl } = makeDispatcher();
    dispatcher.dispatch({ type: 'OPEN_URL', url: 'https://example.com' });
    expect(openUrl).toHaveBeenCalledWith('https://example.com');
  });

  test('OPEN_BOTTOM_SHEET calls openBottomSheet', () => {
    const { dispatcher, openBottomSheet } = makeDispatcher();
    dispatcher.dispatch({ type: 'OPEN_BOTTOM_SHEET', target: 'tenure_sheet', props: { emi: 500 } });
    expect(openBottomSheet).toHaveBeenCalledWith('tenure_sheet', { emi: 500 });
  });

  test('CLOSE_BOTTOM_SHEET calls closeBottomSheet', () => {
    const { dispatcher, closeBottomSheet } = makeDispatcher();
    dispatcher.dispatch({ type: 'CLOSE_BOTTOM_SHEET', target: 'tenure_sheet' });
    expect(closeBottomSheet).toHaveBeenCalledWith('tenure_sheet');
  });

  test('TOGGLE_WISHLIST toggles item in store', () => {
    const { dispatcher, stateStore } = makeDispatcher();
    dispatcher.dispatch({ type: 'TOGGLE_WISHLIST', itemId: 'car-1' });
    expect(stateStore.getValue('wishlist')).toEqual(['car-1']);
    dispatcher.dispatch({ type: 'TOGGLE_WISHLIST', itemId: 'car-1' });
    expect(stateStore.getValue('wishlist')).toEqual([]);
  });

  test('TOGGLE_WISHLIST uses custom key', () => {
    const { dispatcher, stateStore } = makeDispatcher();
    dispatcher.dispatch({ type: 'TOGGLE_WISHLIST', itemId: 'car-1', key: 'favs' });
    expect(stateStore.getValue('favs')).toEqual(['car-1']);
  });

  test('NOOP does not crash', () => {
    const { dispatcher } = makeDispatcher();
    expect(() => dispatcher.dispatch({ type: 'NOOP' })).not.toThrow();
  });

  test('unknown action logs warning', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { dispatcher } = makeDispatcher();
    dispatcher.dispatch({ type: 'FUTURE_ACTION_X' });
    expect(warn).toHaveBeenCalledWith('[sdui] unknown action type "FUTURE_ACTION_X" — ignored');
    warn.mockRestore();
  });

  test('null/undefined action is tolerated', () => {
    const { dispatcher } = makeDispatcher();
    expect(() => dispatcher.dispatch(null as any)).not.toThrow();
    expect(() => dispatcher.dispatch(undefined as any)).not.toThrow();
  });
});

describe('compareVersions', () => {
  test('returns negative when a < b', () => {
    expect(compareVersions('0.1.0', '0.2.0')).toBeLessThan(0);
  });
  test('returns zero when equal', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
  });
  test('returns positive when a > b', () => {
    expect(compareVersions('0.2.0', '0.1.0')).toBeGreaterThan(0);
  });
});
