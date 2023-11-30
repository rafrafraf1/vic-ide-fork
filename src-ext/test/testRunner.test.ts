import * as path from "path";

import { runTests } from "@vscode/test-electron";
import * as glob from "glob";

import { ENABLE_COVERAGE_ENV_VAR } from "../code_coverage_support";
import {
  resetCodeCoverageDirectory,
  writeCodeCoverageReport,
} from "./infra/CodeCoverage";
import { TESTS_TIMEOUT } from "./infra/Config";
import { withPersistentStateAvailable } from "./infra/TestPersistence";

/**
 * The version of VS Code that we test against.
 */
const VSCODE_VERSION = "1.78.2";

const testFiles = new glob.GlobSync("**/**.test.ts", {
  cwd: path.resolve(__dirname, "../../../src-ext/test/suite/"),
}).found;

const COVERAGE_REQUESTED: boolean =
  process.env["COVERAGE"] !== undefined && process.env["COVERAGE"] !== "0";

describe("Vic IDE Extension Test Suite", () => {
  // Add an extra margin to the timeout, because the tests themselves have a
  // timeout mechanism that we would like to give a chance to fully complete.
  jest.setTimeout(TESTS_TIMEOUT + 10000);

  if (COVERAGE_REQUESTED) {
    beforeAll(() => {
      resetCodeCoverageDirectory();
    });

    afterAll(async (): Promise<void> => {
      await writeCodeCoverageReport();
    });
  }

  for (const testFile of testFiles) {
    // eslint-disable-next-line jest/valid-title
    test(testFile, async () => {
      // Output a banner so the test can be identified:
      console.log(
        [
          "--------------------------------------------------------------",
          `--- ${testFile}`,
          "--------------------------------------------------------------",
        ].join("\n"),
      );

      // The folder containing the Extension Manifest package.json
      // Passed to `--extensionDevelopmentPath`
      const extensionDevelopmentPath = path.resolve(__dirname, "../../../");

      const jsFile = `${testFile.substring(0, testFile.length - 3)}.js`;

      // The path to test runner
      // Passed to --extensionTestsPath
      const extensionTestsPath = path.resolve(__dirname, "suite", jsFile);

      await withPersistentStateAvailable(
        async (stateVarName, stateVarValue) => {
          // Download VS Code, unzip it and run the integration test
          try {
            await runTests({
              extensionDevelopmentPath,
              extensionTestsPath,
              version: VSCODE_VERSION,
              extensionTestsEnv: {
                ...(COVERAGE_REQUESTED
                  ? { [ENABLE_COVERAGE_ENV_VAR]: "1" }
                  : {}),
                [stateVarName]: stateVarValue,
              },
            });
          } catch {
            throw new Error(
              `Test "${testFile}" failed. See above for the test output, which should contain the error.`,
            );
          }
        },
      );
    });
  }
});
