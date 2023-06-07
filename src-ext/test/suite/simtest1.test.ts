import * as assert from "assert";
import * as vscode from "vscode";
import {
  simulatorGetState,
  simulatorSetCpuRegisters,
  waitForSimulatorReady,
} from "../../VicSimulator/VicSimulator";
import { vicLanguageId, vicOpenSimulatorCommand } from "../../ExtManifest";
import { getSimulatorManager } from "../../extension";
import { testCase } from "../TestCase";
import { waitForTextDocumentToOpen } from "../VSCodeHelpers";

export const run = testCase(async (): Promise<void> => {
  const textDocument = await vscode.workspace.openTextDocument({
    language: vicLanguageId,
    content: "// Test file",
  });
  await waitForTextDocumentToOpen(textDocument);
  await vscode.commands.executeCommand(vicOpenSimulatorCommand);
  const simulatorManager = getSimulatorManager();
  await waitForSimulatorReady(simulatorManager);
  await simulatorSetCpuRegisters(simulatorManager, {
    kind: "SetCpuRegisters",
    instructionRegister: 1,
    dataRegister: 1,
    programCounter: 1,
  });
  const state = await simulatorGetState(simulatorManager);

  assert.deepStrictEqual(
    [
      state.hardwareState.computer.instructionRegister,
      state.hardwareState.computer.dataRegister,
      state.hardwareState.computer.programCounter,
    ],
    [1, 1, 1]
  );
});
