import "../test_bootstrap"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

import * as assert from "assert";
import * as vscode from "vscode";
import {
  simulatorGetState,
  simulatorSetCpuRegisters,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulator";
import { getSimulatorManager } from "../../extension";
import { step } from "../infra/TestSteps";
import { testCase } from "../TestCase";
import { vicOpenSimulatorCommand } from "../../ExtManifest";

export const run = testCase(async (): Promise<void> => {
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

  await step("Close Simulator", async () => {
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  await step("Open Simulator", async () => {
    await vscode.commands.executeCommand(vicOpenSimulatorCommand);
    await waitForSimulatorReady(simulatorManager);
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
    [1, 1, 1]
  );
});
