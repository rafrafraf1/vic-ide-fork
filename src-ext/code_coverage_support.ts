import * as path from "path";

import type { Config, NYC } from "nyc";

/**
 * The directory that nyc will use to store the intermediate coverage json
 * files.
 */
export const NYC_TEMP_DIRECTORY = path.resolve(
  __dirname,
  "..",
  "..",
  ".nyc_output",
);

export const ENABLE_COVERAGE_ENV_VAR = "VIC_IDE_TEST_ENABLE_COVERAGE";

/**
 * Call this to initialize the code coverage system (nyc).
 *
 * nyc hooks into the Node.Js module loading mechanism (require), so you must
 * call this before importing any modules that you want code coverage for.
 *
 * You can only call this function once.
 */
export function initCodeCoverage(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  if ((global as any).vicIdeInitCodeCoverageCalled as boolean) {
    throw new Error("initCodeCoverage called multiple times");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (global as any).vicIdeInitCodeCoverageCalled = true;

  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const NYC = require("nyc") as unknown;

  const config: Config = {
    tempDirectory: NYC_TEMP_DIRECTORY,
    cache: false,
    exclude: [
      // This prevents these files from being instrumented. Without this
      // exclusion, we get lots of warning messages when the test runs:
      "**/.vscode-test/**",

      // The files in here have a separate test suite. Including them in this
      // coverage report can be misleading:
      "**/src/common/**",
    ],
    hookRequire: true,
    hookRunInContext: true,
    hookRunInThisContext: true,
    sourceMap: true,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
  const nyc = new (NYC as any)(config) as NYC;

  nyc.wrap();
}
