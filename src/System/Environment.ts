/**
 * Will be `false` when running as a VS Code extension. Otherwise will be
 * true.
 */
export const IS_DEMO_ENVIRONMENT =
  process.env.NODE_ENV !== "test" && !("acquireVsCodeApi" in window);
