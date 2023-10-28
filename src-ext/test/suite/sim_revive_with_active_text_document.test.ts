import "../infra/test_bootstrap"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

import * as assert from "assert";
import * as vscode from "vscode";
import {
  simulatorGetSourceFile,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulatorDebug";
import { vicAsmLanguageId, vicOpenSimulatorCommand } from "../../ExtManifest";
import { getSimulatorManager } from "../../extension";
import { step } from "../infra/TestSteps";
import { testCase } from "../infra/TestCase";

export const run = testCase(async (): Promise<void> => {
  const simulatorManager = await step("Open Simulator", async () => {
    await vscode.commands.executeCommand(vicOpenSimulatorCommand);
    const simulatorManager = getSimulatorManager();
    await waitForSimulatorReady(simulatorManager);
    return simulatorManager;
  });

  await step("Open Text Document", async () => {
    const textDocument = await vscode.workspace.openTextDocument({
      language: vicAsmLanguageId,
      content: "// Test file",
    });
    await vscode.window.showTextDocument(textDocument);
  });

  await step("Navigate back to Simulator", async () => {
    await vscode.commands.executeCommand("workbench.action.previousEditor");
    await waitForSimulatorReady(simulatorManager);
  });

  const sourceFile = await step("Get Source File", async () => {
    return await simulatorGetSourceFile(simulatorManager);
  });

  assert.deepStrictEqual<typeof sourceFile>(sourceFile, {
    filename: "Untitled-1",
    info: {
      kind: "ValidSourceFile",
      id: "untitled:Untitled-1",
      hasErrors: false,
    },
  });
});
