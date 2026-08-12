/**
 * Jest config for @cars24/sdui-core.
 *
 * We use ts-jest for the engine's own TS sources and rely on RN's built-in
 * jest preset for the few components that render React Native views
 * (FallbackComponent, SDUIRenderer).
 */
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@testing-library)/)',
  ],
  // We don't need the heavy RN setup for purely-logical modules
  // (types, StateStore, ActionDispatcher, parser). The FallbackComponent
  // and renderer tests are written so they don't need a real RN runtime.
  setupFiles: ['<rootDir>/jest.setup.js'],
};
