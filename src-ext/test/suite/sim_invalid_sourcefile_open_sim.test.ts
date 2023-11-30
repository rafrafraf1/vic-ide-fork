import "../infra/test_bootstrap";

import * as assert from "assert";

import * as vscode from "vscode";

import { getSimulatorManager } from "../../extension";
import { vicOpenSimulatorCommand } from "../../ExtManifest";
import {
  simulatorGetSourceFile,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulatorDebug";
import { testCase } from "../infra/TestCase";
import { step } from "../infra/TestSteps";

export const run = testCase(async (): Promise<void> => {
  await step("Open Text Document", async () => {
    const textDocument = await vscode.workspace.openTextDocument({
      content: "Plain Text File",
    });
    await vscode.window.showTextDocument(textDocument);
  });

  const simulatorManager = await step("Open Simulator", async () => {
    await vscode.commands.executeCommand(vicOpenSimulatorCommand);
    const simulatorManager = getSimulatorManager();
    await waitForSimulatorReady(simulatorManager);
    return simulatorManager;
  });

  const sourceFile = await step("Get Source File", async () => {
    return await simulatorGetSourceFile(simulatorManager);
  });

  assert.deepStrictEqual<typeof sourceFile>(sourceFile, {
    filename: "Untitled-1",
    info: {
      kind: "InvalidSourceFile",
      languageId: "plaintext",
    },
  });
});
