import { assertNever } from "assert-never";
import * as vscode from "vscode";

import type { SrcError } from "../../src/common/SrcError";
import { parseVicBin } from "../../src/common/VicBinParser";
import { compileVicProgram } from "../../src/common/VicLangFullCompiler";
import { vicAsmLanguageId, vicBinLanguageId } from "../ExtManifest";

const vicDiagnosticsName = "vic";

export interface DiagnosticsService {
  readonly diagnosticCollection: vscode.DiagnosticCollection;
  observer: DiagnosticsObserver | undefined;
}

export interface DiagnosticsObserver {
  onTextDocumentHasErrors: (uri: vscode.Uri, hasErrors: boolean) => void;
}

export function createDiagnosticsService(): DiagnosticsService {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection(vicDiagnosticsName);

  return {
    diagnosticCollection: diagnosticCollection,
    observer: undefined,
  };
}

export function activateDiagnosticsService(
  context: vscode.ExtensionContext,
  service: DiagnosticsService,
): void {
  context.subscriptions.push(service.diagnosticCollection);

  for (const textDocument of vscode.workspace.textDocuments) {
    updateDiagnostics(service, textDocument);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(
      (textDocument: vscode.TextDocument) => {
        updateDiagnostics(service, textDocument);
      },
    ),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(
      (e: vscode.TextDocumentChangeEvent) => {
        updateDiagnostics(service, e.document);
      },
    ),
  );
}

function updateDiagnostics(
  service: DiagnosticsService,
  textDocument: vscode.TextDocument,
): void {
  const errors = getTextDocumentErrors(textDocument);

  if (errors.length === 0) {
    service.diagnosticCollection.set(textDocument.uri, undefined);
  } else {
    const diagnostics = errors.map(convertSrcErrorToDiagnostic);
    service.diagnosticCollection.set(textDocument.uri, diagnostics);
  }

  const hasErrors = errors.length > 0;

  if (service.observer !== undefined) {
    service.observer.onTextDocumentHasErrors(textDocument.uri, hasErrors);
  }
}

function getTextDocumentErrors(textDocument: vscode.TextDocument): SrcError[] {
  if (textDocument.languageId === vicAsmLanguageId) {
    const source = textDocument.getText();
    const result = compileVicProgram(source);
    switch (result.program.kind) {
      case "Ok":
        return [];
      case "Error":
        return result.program.error;
      /* istanbul ignore next */
      default:
        assertNever(result.program);
    }
  } else if (textDocument.languageId === vicBinLanguageId) {
    const source = textDocument.getText();
    const result = parseVicBin(source);
    switch (result.kind) {
      case "Ok":
        return [];
      case "Error":
        return result.error;
      /* istanbul ignore next */
      default:
        assertNever(result);
    }
  } else {
    return [];
  }
}

function convertSrcErrorToDiagnostic(error: SrcError): vscode.Diagnostic {
  const range = new vscode.Range(
    error.srcLoc.line,
    error.srcLoc.startCol,
    error.srcLoc.line,
    error.srcLoc.endCol,
  );

  const diagnostic = new vscode.Diagnostic(
    range,
    error.message,
    vscode.DiagnosticSeverity.Error,
  );
  diagnostic.source = vicDiagnosticsName;

  return diagnostic;
}

/**
 * @returns true if the source file located at uri contains any Vic
 * parse/compile errors.
 */
export function getTextDocumentHasErrors(
  diagnosticsService: DiagnosticsService,
  uri: vscode.Uri,
): boolean {
  const diags = diagnosticsService.diagnosticCollection.get(uri);
  if (diags === undefined) {
    return false;
  }

  // This assumes that we only use diagnostics with severity "Error":
  return diags.length > 0;
}
