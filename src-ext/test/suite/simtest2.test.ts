import "../test_bootstrap"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

import * as assert from "assert";
import * as vscode from "vscode";
import {
  simulatorGetState,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulator";
import { getSimulatorManager } from "../../extension";
import { testCase } from "../TestCase";
import { vicOpenSimulatorCommand } from "../../ExtManifest";

export const run = testCase(async (): Promise<void> => {
  await vscode.commands.executeCommand(vicOpenSimulatorCommand);
  const simulatorManager = getSimulatorManager();
  await waitForSimulatorReady(simulatorManager);
  const state = await simulatorGetState(simulatorManager);

  assert.deepStrictEqual(
    [
      state.hardwareState.computer.instructionRegister,
      state.hardwareState.computer.dataRegister,
      state.hardwareState.computer.programCounter,
    ],
    [0, 0, 0]
  );
});
