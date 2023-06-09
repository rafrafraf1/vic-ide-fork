import "../test_bootstrap"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

import * as assert from "assert";
import * as vscode from "vscode";
import {
  simulatorGetState,
  simulatorSetCpuRegisters,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulator";
import { getSimulatorManager } from "../../extension";
import { testCaseWithWindowReloads } from "../infra/TestCaseWithWindowReloads";
import { vicOpenSimulatorCommand } from "../../ExtManifest";

export const run = testCaseWithWindowReloads(
  async (reloadWindow) => {
    await vscode.commands.executeCommand(vicOpenSimulatorCommand);
    const simulatorManager = getSimulatorManager();
    await waitForSimulatorReady(simulatorManager);

    await simulatorSetCpuRegisters(simulatorManager, {
      kind: "SetCpuRegisters",
      instructionRegister: 1,
      dataRegister: 1,
      programCounter: 1,
    });

    return await reloadWindow();
  },
  async () => {
    const simulatorManager = getSimulatorManager();
    await waitForSimulatorReady(simulatorManager);

    const state = await simulatorGetState(simulatorManager);
    assert.deepStrictEqual(
      [
        state.hardwareState.computer.instructionRegister,
        state.hardwareState.computer.dataRegister,
        state.hardwareState.computer.programCounter,
      ],
      [1, 1, 1]
    );
  }
);
