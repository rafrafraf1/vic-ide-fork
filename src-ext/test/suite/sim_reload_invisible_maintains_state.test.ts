import "../infra/test_bootstrap"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

import * as assert from "assert";
import * as vscode from "vscode";
import {
  simulatorGetState,
  simulatorSetCpuRegisters,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulatorDebug";
import { vicAsmLanguageId, vicOpenSimulatorCommand } from "../../ExtManifest";
import { getSimulatorManager } from "../../extension";
import { step } from "../infra/TestSteps";
import { testCaseWithWindowReloads } from "../infra/TestCaseWithWindowReloads";

export const run = testCaseWithWindowReloads(
  async (reloadWindow) => {
    const simulatorManager = await step("Open Simulator", async () => {
      await vscode.commands.executeCommand(vicOpenSimulatorCommand);
      const simulatorManager = getSimulatorManager();
      await waitForSimulatorReady(simulatorManager);
      return simulatorManager;
    });

    await step("Set CPU Registers", async () => {
      await simulatorSetCpuRegisters(simulatorManager, {
        kind: "SetCpuRegisters",
        instructionRegister: 1,
        dataRegister: 1,
        programCounter: 1,
      });
    });

    await step("Open Text Document", async () => {
      const textDocument = await vscode.workspace.openTextDocument({
        language: vicAsmLanguageId,
        content: "// Test file",
      });
      await vscode.window.showTextDocument(textDocument);
    });

    return await reloadWindow();
  },
  async () => {
    const simulatorManager = await step("Open Simulator", async () => {
      await vscode.commands.executeCommand(vicOpenSimulatorCommand);
      const simulatorManager = getSimulatorManager();
      await waitForSimulatorReady(simulatorManager);
      return simulatorManager;
    });

    const state = await step("Get State", async () => {
      return await simulatorGetState(simulatorManager);
    });

    assert.deepStrictEqual(
      [
        state.hardwareState.computer.instructionRegister,
        state.hardwareState.computer.dataRegister,
        state.hardwareState.computer.programCounter,
      ],
      [1, 1, 1],
    );
  },
);
