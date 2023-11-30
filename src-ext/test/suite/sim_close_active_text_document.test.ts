import "../infra/test_bootstrap";

import * as assert from "assert";

import * as vscode from "vscode";

import { getSimulatorManager } from "../../extension";
import { vicAsmLanguageId, vicOpenSimulatorCommand } from "../../ExtManifest";
import {
  simulatorGetSourceFile,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulatorDebug";
import { testCase } from "../infra/TestCase";
import { step } from "../infra/TestSteps";

export const run = testCase(async (): Promise<void> => {
  await step("Open Text Document", async () => {
    const textDocument = await vscode.workspace.openTextDocument({
      language: vicAsmLanguageId,
      content: "// Test file",
    });
    await vscode.window.showTextDocument(textDocument);
  });

  const simulatorManager = await step("Open Simulator", async () => {
    await vscode.commands.executeCommand(vicOpenSimulatorCommand);
    const simulatorManager = getSimulatorManager();
    await waitForSimulatorReady(simulatorManager);
    return simulatorManager;
  });

  const sourceFile1 = await step("Get Source File 1", async () => {
    return await simulatorGetSourceFile(simulatorManager);
  });

  assert.deepStrictEqual<typeof sourceFile1>(sourceFile1, {
    filename: "Untitled-1",
    info: {
      kind: "ValidSourceFile",
      id: "untitled:Untitled-1",
      hasErrors: false,
    },
  });

  await step("Switch back to Text Document", async () => {
    await vscode.commands.executeCommand("workbench.action.previousEditor");
    await waitForSimulatorReady(simulatorManager);
  });

  await step("Close current editor", async () => {
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  const sourceFile2 = await step("Get Source File 2", async () => {
    return await simulatorGetSourceFile(simulatorManager);
  });

  assert.deepStrictEqual<typeof sourceFile2>(sourceFile2, null);
});
