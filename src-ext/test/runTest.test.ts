import * as glob from "glob";
import * as path from "path";
import {
  COVERAGE_REQUESTED,
  resetCodeCoverageDirectory,
  writeCodeCoverageReport,
} from "./CodeCoverage";
import { TESTS_TIMEOUT } from "./Config";
import { runTests } from "@vscode/test-electron";

/**
 * The version of VS Code that we test against.
 */
const VSCODE_VERSION = "1.78.2";

const testFiles = new glob.GlobSync("**/**.test.ts", {
  cwd: path.resolve(__dirname, "../../../src-ext/test/suite/"),
}).found;

describe("Vic IDE Extension Test Suite", () => {
  // Add an extra margin to the timeout, because the tests themselves have a
  // timeout mechanism that we would like to give a chance to fully complete.
  jest.setTimeout(TESTS_TIMEOUT + 10000);

  beforeAll(() => {
    if (COVERAGE_REQUESTED) {
      resetCodeCoverageDirectory();
    }
  });

  afterAll(async (): Promise<void> => {
    if (COVERAGE_REQUESTED) {
      await writeCodeCoverageReport();
    }
  });

  for (const testFile of testFiles) {
    // eslint-disable-next-line jest/valid-title
    test(testFile, async () => {
      // The folder containing the Extension Manifest package.json
      // Passed to `--extensionDevelopmentPath`
      const extensionDevelopmentPath = path.resolve(__dirname, "../../../");

      const jsFile = `${testFile.substring(0, testFile.length - 3)}.js`;

      // The path to test runner
      // Passed to --extensionTestsPath
      const extensionTestsPath = path.resolve(__dirname, "suite", jsFile);

      // Download VS Code, unzip it and run the integration test
      await runTests({
        extensionDevelopmentPath,
        extensionTestsPath,
        version: VSCODE_VERSION,
      });
    });
  }
});
