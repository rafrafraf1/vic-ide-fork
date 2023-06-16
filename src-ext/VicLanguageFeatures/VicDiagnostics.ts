import * as vscode from "vscode";
import type { SrcError } from "../../src/common/SrcError";
import { assertNever } from "assert-never";
import { compileVicProgram } from "../../src/common/VicLangFullCompiler";
import { vicLanguageId } from "../ExtManifest";

export interface DiagnosticsService {
  readonly diagnosticCollection: vscode.DiagnosticCollection;
  observer: DiagnosticsObserver | undefined;
}

export interface DiagnosticsObserver {
  onTextDocumentHasErrors: (uri: vscode.Uri, hasErrors: boolean) => void;
}

export function createDiagnosticsService(): DiagnosticsService {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection(vicLanguageId);

  return {
    diagnosticCollection: diagnosticCollection,
    observer: undefined,
  };
}

export function activateDiagnosticsService(
  context: vscode.ExtensionContext,
  service: DiagnosticsService
): void {
  context.subscriptions.push(service.diagnosticCollection);

  for (const textDocument of vscode.workspace.textDocuments) {
    updateDiagnostics(service, textDocument);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(
      (textDocument: vscode.TextDocument) => {
        updateDiagnostics(service, textDocument);
      }
    )
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(
      (e: vscode.TextDocumentChangeEvent) => {
        updateDiagnostics(service, e.document);
      }
    )
  );
}

function updateDiagnostics(
  service: DiagnosticsService,
  textDocument: vscode.TextDocument
): void {
  if (textDocument.languageId !== vicLanguageId) {
    return;
  }

  const source = textDocument.getText();
  const result = compileVicProgram(source);

  switch (result.program.kind) {
    case "Ok":
      service.diagnosticCollection.set(textDocument.uri, undefined);
      break;
    case "Error": {
      const errors: SrcError[] = result.program.error;
      const diagnostics = errors.map(convertSrcErrorToDiagnostic);
      service.diagnosticCollection.set(textDocument.uri, diagnostics);
      break;
    }
    /* istanbul ignore next */
    default:
      assertNever(result.program);
  }

  if (service.observer !== undefined) {
    const hasErrors = result.program.kind === "Error";
    service.observer.onTextDocumentHasErrors(textDocument.uri, hasErrors);
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

/**
 * @returns true if the source file located at uri contains any Vic
 * parse/compile errors.
 */
export function getTextDocumentHasErrors(
  diagnosticsService: DiagnosticsService,
  uri: vscode.Uri
): boolean {
  const diags = diagnosticsService.diagnosticCollection.get(uri);
  if (diags === undefined) {
    return false;
  }

  // This assumes that we only use diagnostics with severity "Error":
  return diags.length > 0;
}
