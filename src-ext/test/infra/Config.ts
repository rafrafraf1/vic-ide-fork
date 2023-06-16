/**
 * Set this environment variable in your shell to slow down the tests, so that
 * you can see them running live. Useful for seeing what is happening during
 * the test.
 */
export const SLOW_TESTS_ENV_VAR = "SLOW_TESTS";

export const SLOW_TESTS_ENABLED: boolean =
  process.env[SLOW_TESTS_ENV_VAR] !== undefined &&
  process.env[SLOW_TESTS_ENV_VAR] !== "0";

/**
 * Each test can take a few seconds to run, because it opens up a new VS Code
 * window, and manipulates the UI.
 */
export const TESTS_TIMEOUT = SLOW_TESTS_ENABLED
  ? /* istanbul ignore next */ 120000
  : 30000;
