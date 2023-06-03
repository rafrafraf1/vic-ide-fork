import type * as vscode from "vscode";
import {
  activateDiagnosticsService,
  createDiagnosticsService,
} from "./VicLanguageFeatures/VicDiagnostics";
import { activateVicCompletionItemProvider } from "./VicLanguageFeatures/VicCompletionItemProvider";
import { activateVicDocumentHighlightProvider } from "./VicLanguageFeatures/VicDocumentHighlightProvider";
import { activateVicHoverProvider } from "./VicLanguageFeatures/VicHoverProvider";
import { activateVicSimulator } from "./VicSimulator/VicSimulator";

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
  activateVicSimulator(context, diagnosticsService);
}

// This method is called when your extension is deactivated
export function deactivate(): void {
  // TODO ...
}
