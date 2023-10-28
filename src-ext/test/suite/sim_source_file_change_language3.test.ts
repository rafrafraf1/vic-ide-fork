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
  const textDocument = await step("Open Text Document", async () => {
    const textDocument = await vscode.workspace.openTextDocument({
      content: "// Test file",
      language: vicAsmLanguageId,
    });
    await vscode.window.showTextDocument(textDocument);
    return textDocument;
  });

  const simulatorManager = await step("Open Simulator", async () => {
    await vscode.commands.executeCommand(vicOpenSimulatorCommand);
    const simulatorManager = getSimulatorManager();
    await waitForSimulatorReady(simulatorManager);
    return simulatorManager;
  });

  await step("Switch back to Text Document", async () => {
    await vscode.commands.executeCommand("workbench.action.previousEditor");
    await waitForSimulatorReady(simulatorManager);
  });

  await step("Switch Text Document language to Plain Text", async () => {
    await vscode.languages.setTextDocumentLanguage(textDocument, "plaintext");
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
