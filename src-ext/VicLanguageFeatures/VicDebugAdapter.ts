import * as vscode from "vscode";
import {
  type SimulatorManager,
  compileTextDocument,
  webviewPostMessage,
} from "../VicSimulator/VicSimulator";
import { assertNever } from "assert-never";
import { vicOpenSimulatorCommand } from "../ExtManifest";

export function activateVicDebugAdapter(
  context: vscode.ExtensionContext,
  simulatorManager: SimulatorManager,
): void {
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider(
      "vic",
      new Provider(simulatorManager),
    ),
  );
}

export class Provider implements vscode.DebugConfigurationProvider {
  constructor(private simulatorManager: SimulatorManager) {
    // Empty
  }

  async resolveDebugConfiguration?(
    folder: vscode.WorkspaceFolder | undefined,
    debugConfiguration: vscode.DebugConfiguration,
    token?: vscode.CancellationToken,
  ): Promise<vscode.DebugConfiguration | undefined> {
    let compiledProgram: number[] | null = null;

    if (vscode.window.activeTextEditor !== undefined) {
      const activeDocument = vscode.window.activeTextEditor.document;

      const compileResult = compileTextDocument(activeDocument);
      switch (compileResult.kind) {
        case "Ok":
          compiledProgram = compileResult.value;
          break;
        case "Error":
          break;
        /* istanbul ignore next */
        default:
          return assertNever(compileResult);
      }
    }

    await vscode.commands.executeCommand(vicOpenSimulatorCommand);

    if (compiledProgram !== null) {
      webviewPostMessage(this.simulatorManager, {
        kind: "LoadProgram",
        program: compiledProgram,
      });
    }

    return undefined;
  }
}
