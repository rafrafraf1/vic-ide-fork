import "../infra/test_bootstrap"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

import * as assert from "assert";
import * as vscode from "vscode";
import {
  simulatorDoShowErrorsClick,
  simulatorGetSourceFile,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulatorDebug";
import { vicLanguageId, vicOpenSimulatorCommand } from "../../ExtManifest";
import { getSimulatorManager } from "../../extension";
import { simulatorTabTitle } from "../../VicSimulator/VicSimulator";
import { step } from "../infra/TestSteps";
import { tabGroupView } from "../infra/VSCodeHelpers";
import { testCase } from "../infra/TestCase";

export const run = testCase(async (): Promise<void> => {
  await step("Open Text Document (with error)", async () => {
    const textDocument = await vscode.workspace.openTextDocument({
      language: vicLanguageId,
      content: ["// Test file", "READ", "WRITEx", "STOP"].join("\n"),
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
    id: "untitled:Untitled-1",
    filename: "Untitled-1",
    info: {
      kind: "ValidSourceFile",
      hasErrors: true,
    },
  });

  await step("Show Errors", async () => {
    await simulatorDoShowErrorsClick(simulatorManager);
  });

  if (vscode.window.activeTextEditor === undefined) {
    throw new Error("No activeTextEditor");
  }

  const activeTextEditorUri =
    vscode.window.activeTextEditor.document.uri.toString();

  assert.deepStrictEqual<typeof activeTextEditorUri>(
    activeTextEditorUri,
    "untitled:Untitled-1"
  );

  const tabGroups = vscode.window.tabGroups.all.map(tabGroupView);

  assert.deepStrictEqual<typeof tabGroups>(tabGroups, [
    {
      viewColumn: 1,
      isActive: true,
      tabs: [
        {
          isActive: true,
          label: "// Test file",
        },
      ],
    },
    {
      viewColumn: 2,
      isActive: false,
      tabs: [
        {
          isActive: true,
          label: simulatorTabTitle,
        },
      ],
    },
  ]);
});
