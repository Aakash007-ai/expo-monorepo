import { registerComponent, getComponent, hasComponent, resetComponentRegistry, listRegisteredTypes } from './ComponentRegistry';
import React from 'react';

beforeEach(() => {
  resetComponentRegistry();
});

const Dummy = () => null;

describe('ComponentRegistry', () => {
  test('registerComponent and getComponent round-trips', () => {
    registerComponent('BUTTON', Dummy);
    expect(getComponent('BUTTON')).toBe(Dummy);
  });

  test('hasComponent returns true/false correctly', () => {
    expect(hasComponent('X')).toBe(false);
    registerComponent('X', Dummy);
    expect(hasComponent('X')).toBe(true);
  });

  test('getComponent returns null for unknown type', () => {
    expect(getComponent('UNKNOWN')).toBeNull();
  });

  test('registerComponent throws on non-string type', () => {
    expect(() => registerComponent('', Dummy)).toThrow('non-empty string');
  });

  test('overwriting a registration logs a warning', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    registerComponent('T', Dummy);
    registerComponent('T', Dummy);
    expect(warn).toHaveBeenCalledWith('[sdui] overwriting component registration for "T"');
    warn.mockRestore();
  });

  test('resetComponentRegistry clears all registrations', () => {
    registerComponent('A', Dummy);
    registerComponent('B', Dummy);
    resetComponentRegistry();
    expect(hasComponent('A')).toBe(false);
    expect(hasComponent('B')).toBe(false);
  });

  test('listRegisteredTypes returns all registered types', () => {
    registerComponent('X', Dummy);
    registerComponent('Y', Dummy);
    expect(listRegisteredTypes()).toContain('X');
    expect(listRegisteredTypes()).toContain('Y');
  });
});
