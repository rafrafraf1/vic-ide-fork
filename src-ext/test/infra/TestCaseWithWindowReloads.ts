import * as vscode from "vscode";
import { PersistentState } from "./TestPersistence";
import { delay } from "../Delay";
import { testCase } from "../TestCase";

export class ReloadWindow {
  protected dummy = undefined;
}

export function testCaseWithWindowReloads(
  step1: (reloadWindow: () => Promise<ReloadWindow>) => Promise<ReloadWindow>,
  step2: () => Promise<void>
): () => Promise<void>;
export function testCaseWithWindowReloads(
  step1: (reloadWindow: () => Promise<ReloadWindow>) => Promise<ReloadWindow>,
  step2: (reloadWindow: () => Promise<ReloadWindow>) => Promise<ReloadWindow>,
  step3: () => Promise<void>
): () => Promise<void>;
export function testCaseWithWindowReloads(
  step1: (reloadWindow: () => Promise<ReloadWindow>) => Promise<ReloadWindow>,
  step2: (reloadWindow: () => Promise<ReloadWindow>) => Promise<ReloadWindow>,
  step3: (reloadWindow: () => Promise<ReloadWindow>) => Promise<ReloadWindow>,
  step4: () => Promise<void>
): () => Promise<void>;

export function testCaseWithWindowReloads(
  ...steps: ((reloadWindow: () => Promise<ReloadWindow>) => Promise<unknown>)[]
): () => Promise<void> {
  return testCase(async () => {
    const persistentState = new PersistentState<TestStep>({ step: 0 });
    const currentStep = persistentState.get();
    const step = steps[currentStep.step];
    if (step === undefined) {
      throw new Error(`Invalid step: ${currentStep.step}`);
    }

    await step(reloadWindowSentinal);

    persistentState.set({ step: currentStep.step + 1 });

    if (currentStep.step < steps.length - 1) {
      // This delay is needed so that VS Code WebviewPanels will have enough
      // time to persist their internal state. (When the Webview code calls
      // `vscode.setState`).
      //
      // I couldn't figure out any way to deterministically know when the
      // state has been finished being persisted.
      await delay(200);

      await vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
  });
}

async function reloadWindowSentinal(): Promise<ReloadWindow> {
  return await Promise.resolve(new ReloadWindow());
}

interface TestStep {
  step: number;
}
