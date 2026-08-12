import { createStateStore } from './StateStore';

describe('StateStore', () => {
  test('returns initial state via getState', () => {
    const store = createStateStore({ count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  test('getValue reads a single key', () => {
    const store = createStateStore({ name: 'a' });
    expect(store.getValue('name')).toBe('a');
    expect(store.getValue('missing')).toBeUndefined();
  });

  test('setState writes a value and notifies subscribers', () => {
    const store = createStateStore({ x: 1 });
    const listener = jest.fn();
    store.subscribe('x', listener);
    store.setState('x', 2);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(2, 1);
    expect(store.getValue('x')).toBe(2);
  });

  test('setState with identical value does not notify', () => {
    const store = createStateStore({ x: 1 });
    const listener = jest.fn();
    store.subscribe('x', listener);
    store.setState('x', 1);
    expect(listener).not.toHaveBeenCalled();
  });

  test('subscribe returns an unsubscribe function', () => {
    const store = createStateStore({ y: 0 });
    const listener = jest.fn();
    const unsub = store.subscribe('y', listener);
    store.setState('y', 1);
    expect(listener).toHaveBeenCalledTimes(1);
    unsub();
    store.setState('y', 2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('subscribers are isolated per key', () => {
    const store = createStateStore({ a: 1, b: 2 });
    const aListener = jest.fn();
    const bListener = jest.fn();
    store.subscribe('a', aListener);
    store.subscribe('b', bListener);
    store.setState('a', 10);
    expect(aListener).toHaveBeenCalledTimes(1);
    expect(bListener).not.toHaveBeenCalled();
  });

  test('toggleInSet adds an itemId when absent', () => {
    const store = createStateStore({ wishlist: [] });
    store.toggleInSet('wishlist', 'car-1');
    expect(store.getValue('wishlist')).toEqual(['car-1']);
  });

  test('toggleInSet removes an itemId when present', () => {
    const store = createStateStore({ wishlist: ['car-1', 'car-2'] });
    store.toggleInSet('wishlist', 'car-1');
    expect(store.getValue('wishlist')).toEqual(['car-2']);
  });

  test('toggleInSet creates a list when key did not exist', () => {
    const store = createStateStore({});
    store.toggleInSet('wishlist', 'car-1');
    expect(store.getValue('wishlist')).toEqual(['car-1']);
  });

  test('subscriber that throws does not break the store', () => {
    const store = createStateStore({ x: 0 });
    store.subscribe('x', () => {
      throw new Error('boom');
    });
    const goodListener = jest.fn();
    store.subscribe('x', goodListener);
    store.setState('x', 1);
    expect(goodListener).toHaveBeenCalled();
  });
});
