import * as vscode from "vscode";
import type { SrcError } from "../src/common/SrcError";
import { assertNever } from "assert-never";
import { compileVicProgram } from "../src/common/VicLangFullCompiler";
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
  const result = compileVicProgram(source);

  switch (result.program.kind) {
    case "Ok":
      diagnosticCollection.set(textDocument.uri, undefined);
      break;
    case "Error": {
      const errors: SrcError[] = result.program.error;
      const diagnostics = errors.map(convertSrcErrorToDiagnostic);
      diagnosticCollection.set(textDocument.uri, diagnostics);
      break;
    }
    default:
      assertNever(result.program);
  }
}

function convertSrcErrorToDiagnostic(error: SrcError): vscode.Diagnostic {
  const range = new vscode.Range(
    error.srcLoc.line,
    error.srcLoc.startCol,
    error.srcLoc.line,
    error.srcLoc.endCol
  );

  const diagnostic = new vscode.Diagnostic(
    range,
    error.message,
    vscode.DiagnosticSeverity.Error
  );
  diagnostic.source = vicLanguageId;

  return diagnostic;
}
