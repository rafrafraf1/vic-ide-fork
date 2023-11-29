import "../infra/test_bootstrap"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

import * as assert from "assert";
import * as vscode from "vscode";
import {
  simulatorGetState,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulatorDebug";
import { delay } from "../infra/Delay";
import { getSimulatorManager } from "../../extension";
import { step } from "../infra/TestSteps";
import { testCase } from "../infra/TestCase";
import { vicOpenSimulatorCommand } from "../../ExtManifest";

export const run = testCase(async (): Promise<void> => {
  const simulatorManager = await step("Open Simulator", async () => {
    await vscode.commands.executeCommand(vicOpenSimulatorCommand);
    return getSimulatorManager();
  });

  // This test is checks that the `waitForSimulatorReady` function still works
  // even if the Simulator is already ready when the function is called. So we
  // need to sleep now to give enough time for the Simulator to be ready,
  // before we call `waitForSimulatorReady`.

  await step("Sleep", async () => {
    // I've checked and it seems to take about 300ms on average for the
    // Simulator to be ready, so we take more than a 10x safety margin.
    await delay(5000);
  });

  await step("waitForSimulatorReady", async () => {
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
    [0, 0, 0],
  );
});
