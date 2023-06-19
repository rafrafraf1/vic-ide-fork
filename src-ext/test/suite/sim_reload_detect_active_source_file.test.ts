import "../infra/test_bootstrap"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

import * as assert from "assert";
import * as vscode from "vscode";
import {
  simulatorGetSourceFile,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulatorDebug";
import { vicLanguageId, vicOpenSimulatorCommand } from "../../ExtManifest";
import { getSimulatorManager } from "../../extension";
import { step } from "../infra/TestSteps";
import { testCaseWithWindowReloads } from "../infra/TestCaseWithWindowReloads";

export const run = testCaseWithWindowReloads(
  async (reloadWindow) => {
    await step("Open Simulator", async () => {
      await vscode.commands.executeCommand(vicOpenSimulatorCommand);
      const simulatorManager = getSimulatorManager();
      await waitForSimulatorReady(simulatorManager);
      return simulatorManager;
    });

    await step("Open Text Document", async () => {
      const textDocument = await vscode.workspace.openTextDocument({
        language: vicLanguageId,
        content: "// Test file",
      });
      await vscode.window.showTextDocument(textDocument);
    });

    return await reloadWindow();
  },
  async () => {
    const simulatorManager = await step(
      "Navigate back to Simulator",
      async () => {
        await vscode.commands.executeCommand("workbench.action.previousEditor");
        const simulatorManager = getSimulatorManager();
        await waitForSimulatorReady(simulatorManager);
        return simulatorManager;
      }
    );

    const sourceFile = await step("Get Source File", async () => {
      return await simulatorGetSourceFile(simulatorManager);
    });

    assert.deepStrictEqual<typeof sourceFile>(sourceFile, {
      filename: "Untitled-1",
      info: {
        id: "untitled:Untitled-1",
        kind: "ValidSourceFile",
        hasErrors: false,
      },
    });
  }
);
