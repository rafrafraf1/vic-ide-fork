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

  const sourceFile1 = await step("Get Source File", async () => {
    return await simulatorGetSourceFile(simulatorManager);
  });

  assert.deepStrictEqual<typeof sourceFile1>(sourceFile1, {
    filename: "Untitled-1",
    info: {
      id: "untitled:Untitled-1",
      kind: "ValidSourceFile",
      hasErrors: false,
    },
  });

  const textEditor = vscode.window.visibleTextEditors[0];
  if (textEditor === undefined) {
    throw new Error("TextEditor not found");
  }

  await step("Edit Text (introduce error)", async () => {
    await textEditor.edit((editBuilder): void => {
      editBuilder.insert(new vscode.Position(3, 0), "BAD\n");
    });
  });

  const sourceFile2 = await step("Get Source File", async () => {
    return await simulatorGetSourceFile(simulatorManager);
  });

  assert.deepStrictEqual<typeof sourceFile2>(sourceFile2, {
    filename: "Untitled-1",
    info: {
      kind: "ValidSourceFile",
      id: "untitled:Untitled-1",
      hasErrors: true,
    },
  });

  await step("Edit Text (fix error)", async () => {
    await textEditor.edit((editBuilder): void => {
      editBuilder.delete(
        new vscode.Range(new vscode.Position(3, 0), new vscode.Position(3, 3)),
      );
    });
  });

  const sourceFile3 = await step("Get Source File", async () => {
    return await simulatorGetSourceFile(simulatorManager);
  });

  assert.deepStrictEqual<typeof sourceFile3>(sourceFile3, {
    filename: "Untitled-1",
    info: {
      kind: "ValidSourceFile",
      id: "untitled:Untitled-1",
      hasErrors: false,
    },
  });
});
