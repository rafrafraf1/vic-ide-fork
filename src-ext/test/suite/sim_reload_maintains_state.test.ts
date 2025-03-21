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
import { testCaseWithWindowReloads } from "../infra/TestCaseWithWindowReloads";
import { step } from "../infra/TestSteps";

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

    return await reloadWindow();
  },
  async () => {
    const simulatorManager = getSimulatorManager();
    await waitForSimulatorReady(simulatorManager);

    const state = await step("Get State", async () => {
      return await simulatorGetState(simulatorManager);
    });

    assert.deepStrictEqual(
      [
        state.simulatorState.hardwareState.computer.instructionRegister,
        state.simulatorState.hardwareState.computer.dataRegister,
        state.simulatorState.hardwareState.computer.programCounter,
      ],
      [1, 1, 1],
    );
  },
);
