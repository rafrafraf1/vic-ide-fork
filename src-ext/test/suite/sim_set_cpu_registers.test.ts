import "../infra/test_bootstrap";

import * as assert from "assert";

import * as vscode from "vscode";

import { getSimulatorManager } from "../../extension";
import { vicOpenSimulatorCommand } from "../../ExtManifest";
import {
  simulatorGetState,
  simulatorSetCpuRegisters,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulatorDebug";
import { testCase } from "../infra/TestCase";
import { step } from "../infra/TestSteps";

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
});
