import type * as vscode from "vscode";
import { activateVicCompletionItemProvider } from "./VicCompletionItemProvider";
import { activateVicDiagnostics } from "./VicDiagnostics";
import { activateVicDocumentHighlightProvider } from "./VicDocumentHighlightProvider";
import { activateVicHoverProvider } from "./VicHoverProvider";
import { activateVicSimulator } from "./VicSimulator";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vic-ide" is now active!');

  // Vic Language features:
  activateVicDiagnostics(context);
  activateVicHoverProvider(context);
  activateVicCompletionItemProvider(context);
  activateVicDocumentHighlightProvider(context);

  // Vic Simulator:
  activateVicSimulator(context);
}

// This method is called when your extension is deactivated
export function deactivate(): void {
  // TODO ...
}
