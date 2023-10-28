import "./code_coverage_init"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

import type * as vscode from "vscode";
import {
  type SimulatorManager,
  activateVicSimulator,
  createSimulatorManager,
} from "./VicSimulator/VicSimulator";
import {
  activateDiagnosticsService,
  createDiagnosticsService,
} from "./VicLanguageFeatures/VicDiagnostics";
import { activateVicCompletionItemProvider } from "./VicLanguageFeatures/VicCompletionItemProvider";
import { activateVicDebugAdapter } from "./VicLanguageFeatures/VicDebugAdapter";
import { activateVicDocumentHighlightProvider } from "./VicLanguageFeatures/VicDocumentHighlightProvider";
import { activateVicHoverProvider } from "./VicLanguageFeatures/VicHoverProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vic-ide" is now active!');

  // Vic Language features:
  const diagnosticsService = createDiagnosticsService();
  activateDiagnosticsService(context, diagnosticsService);
  activateVicHoverProvider(context);
  activateVicCompletionItemProvider(context);
  activateVicDocumentHighlightProvider(context);

  // Vic Simulator:
  const simulatorManager = createSimulatorManager(diagnosticsService);
  activateVicSimulator(context, simulatorManager);

  // Vic Debug event hook:
  activateVicDebugAdapter(context, simulatorManager);

  globalSimulatorManager = simulatorManager;
}

/**
 * Should be used only in tests.
 */
let globalSimulatorManager: SimulatorManager | null = null;

/**
 * Should be used only in tests.
 */
export function getSimulatorManager(): SimulatorManager {
  if (globalSimulatorManager === null) {
    throw new Error("Extension not activated");
  }
  return globalSimulatorManager;
}

// This method is called when your extension is deactivated
export function deactivate(): void {
  // TODO ...
}
