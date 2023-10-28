import "../infra/test_bootstrap"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

import * as assert from "assert";
import * as vscode from "vscode";
import {
  simulatorDoLoadSourceFileClick,
  simulatorGetSourceFile,
  simulatorGetState,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulatorDebug";
import { vicAsmLanguageId, vicOpenSimulatorCommand } from "../../ExtManifest";
import { getSimulatorManager } from "../../extension";
import { step } from "../infra/TestSteps";
import { testCase } from "../infra/TestCase";

export const run = testCase(async (): Promise<void> => {
  await step("Open Text Document", async () => {
    const textDocument = await vscode.workspace.openTextDocument({
      language: vicAsmLanguageId,
      content: ["// Test file", "READ", "WRITE", "STOP"].join("\n"),
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
      kind: "ValidSourceFile",
      id: "untitled:Untitled-1",
      hasErrors: false,
    },
  });

  await step("Load Source File", async () => {
    await simulatorDoLoadSourceFileClick(simulatorManager);
  });

  const state = await step("Get State", async () => {
    return await simulatorGetState(simulatorManager);
  });

  assert.deepStrictEqual(
    state.hardwareState.computer.memory.slice(0, 3),
    [800, 900, 0]
  );
});
