import * as NYC from "nyc";
import * as mkdirp from "make-dir";
import * as path from "path";
import * as rimraf from "rimraf";
import { NYC_TEMP_DIRECTORY } from "../code_coverage_support";

// Technique for getting code coverage adapted from:
// <https://frenya.net/blog/vscode-extension-code-coverage-nyc>
//
// These links may also may be useful:
// <https://gitlab.com/gitlab-org/gitlab-vscode-extension/-/issues/224>
// <https://github.com/pedroterzero/nyc-mocha-vscode-extension/blob/11ebd7f939adb99e2ee3f2dadbf112b92482ec57/src/test/suite/index-coverage.ts>

/**
 * Will be true if the COVERAGE environment variable is set.
 */
export const COVERAGE_REQUESTED: boolean =
  process.env["COVERAGE"] !== undefined && process.env["COVERAGE"] !== "0";

/**
 * Call this before running any tests.
 */
export function resetCodeCoverageDirectory(): void {
  // Clear the .nyc_output directory where the tests store their coverage
  // data. This is needed to delete all leftover files from previous runs.
  rimraf.sync(NYC_TEMP_DIRECTORY);

  // Re-create the .nyc_output directory structure.
  //
  // See:
  // <https://github.com/istanbuljs/nyc/blob/ab7c53b2f340b458789a746dff2abd3e2e4790c3/index.js#L343>
  mkdirp.sync(NYC_TEMP_DIRECTORY);
  mkdirp.sync(path.resolve(NYC_TEMP_DIRECTORY, "processinfo"));
}

/**
 * Call this after all tests have completed.
 *
 * It will print a summary, and write the HTML report to the default
 * "coverage" directory.
 */
export async function writeCodeCoverageReport(): Promise<void> {
  // Run the equivalent of:
  //
  //     $ nyc report --reporter=text --reporter=lcov
  //
  // By default, it looks in the .nyc_output directory, and will create a
  // merged report from all the .json files.

  const nyc = new NYC({
    reporter: ["text", "lcov"],
  });
  await nyc.report();

  rimraf.sync(NYC_TEMP_DIRECTORY);
}
