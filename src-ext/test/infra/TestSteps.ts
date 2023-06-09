import * as vscode from "vscode";
import { delay } from "../Delay";

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
 * Give a label a section of code within the test case, in order to give more
 * helpful logs about the test run.
 */
export async function step<A>(
  label: string,
  body: () => Promise<A>
): Promise<A> {
  console.log(`BEGIN STEP: ${label}`);

  if (SLOW_TESTS_ENABLED) {
    await showStepDialog(label);
  }

  const result = await body();

  if (SLOW_TESTS_ENABLED) {
    await delay(2000);
  }

  console.log(`END STEP: ${label}`);
  return result;
}

export async function showStepDialog(label: string): Promise<void> {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `STEP: ${label}`,
      cancellable: false,
    },
    async (progress) => {
      const step = 5;
      for (let i = 0; i < 100; i += step) {
        progress.report({
          increment: step,
        });
        await delay(100);
      }
    }
  );
}
