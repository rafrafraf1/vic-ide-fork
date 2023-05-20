import * as vscode from "vscode";
import { parseVicProgram } from "../src/common/VicLangParser";
import { vicLanguageId } from "./VicLanguage";

export function activateVicDiagnostics(context: vscode.ExtensionContext): void {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection(vicLanguageId);
  context.subscriptions.push(diagnosticCollection);

  for (const textDocument of vscode.workspace.textDocuments) {
    updateDiagnostics(diagnosticCollection, textDocument);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(
      (textDocument: vscode.TextDocument) => {
        updateDiagnostics(diagnosticCollection, textDocument);
      }
    )
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(
      (e: vscode.TextDocumentChangeEvent) => {
        updateDiagnostics(diagnosticCollection, e.document);
      }
    )
  );
}

function updateDiagnostics(
  diagnosticCollection: vscode.DiagnosticCollection,
  textDocument: vscode.TextDocument
): void {
  if (textDocument.languageId !== vicLanguageId) {
    return;
  }

  const source = textDocument.getText();
  const parsedProgram = parseVicProgram(source);
  if (parsedProgram.errors.length === 0) {
    diagnosticCollection.set(textDocument.uri, undefined);
    return;
  }

  const diagnostics = parsedProgram.errors.map<vscode.Diagnostic>((error) => ({
    range: new vscode.Range(
      error.srcLoc.line,
      error.srcLoc.startCol,
      error.srcLoc.line,
      error.srcLoc.endCol
    ),
    message: error.message,
    severity: vscode.DiagnosticSeverity.Error,
    source: vicLanguageId,
  }));

  diagnosticCollection.set(textDocument.uri, diagnostics);
}
