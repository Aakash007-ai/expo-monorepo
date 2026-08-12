/**
 * Jest setup — silence noisy logs from the engine's intentional
 * `console.warn` calls during fallback / unknown-action tests. Tests
 * assert on these where needed via spy/mock, but the global quiet mode
 * keeps test output readable.
 */

const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  // Suppress the engine's own warnings during tests; tests spy on these
  // when they want to assert them.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (console as any).warn = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (console as any).error = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
