import * as vscode from "vscode";
import { SLOW_TESTS_ENABLED } from "./Config";
import { delay } from "./Delay";

/**
 * Give a label a section of code within the test case, in order to give more
 * helpful logs about the test run.
 */
export async function step<A>(
  label: string,
  body: () => Promise<A>
): Promise<A> {
  console.log(`BEGIN STEP: ${label}`);

  /* istanbul ignore if */
  if (SLOW_TESTS_ENABLED) {
    await showStepDialog(label);
  }

  const result = await body();

  /* istanbul ignore if */
  if (SLOW_TESTS_ENABLED) {
    await delay(2000);
  }

  console.log(`END STEP: ${label}`);
  return result;
}

/* istanbul ignore next */
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
