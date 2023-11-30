import * as vscode from "vscode";

import { formatVicBinLine } from "../../src/common/VicBinFormatter";
import { formatVicLine } from "../../src/common/VicLangFormatter";
import { vicAsmLanguageId, vicBinLanguageId } from "../ExtManifest";

export function activateVicFormatter(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      [vicAsmLanguageId, vicBinLanguageId],
      new Provider(),
    ),
  );
}

export class Provider implements vscode.DocumentRangeFormattingEditProvider {
  provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    range: vscode.Range,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    const [startLine, endLine] = getStartAndEndLines(range);

    let changes: ChangedLine[];
    if (document.languageId === vicBinLanguageId) {
      changes = formatLines(document, startLine, endLine, formatVicBinLine);
    } else if (document.languageId === vicAsmLanguageId) {
      const formatter = (line: string): string => formatVicLine(line, options);
      changes = formatLines(document, startLine, endLine, formatter);
    } else {
      return undefined;
    }

    return changes.map((change) => changedLineEdit(document, change));
  }
}

function getStartAndEndLines(range: vscode.Range): [number, number] {
  const startLine = range.start.line;
  let endLine = range.end.line;
  if (range.end.character > 0) {
    endLine += 1;
  }
  if (endLine < startLine) {
    endLine = startLine;
  }

  return [startLine, endLine];
}

interface ChangedLine {
  lineNumber: number;
  newText: string;
}

function formatLines(
  document: vscode.TextDocument,
  startLine: number,
  endLine: number,
  lineFormatter: (line: string) => string,
): ChangedLine[] {
  const changes: ChangedLine[] = [];
  for (let i = startLine; i < endLine; i++) {
    const line = document.lineAt(i);
    const newText = lineFormatter(line.text);
    if (newText !== line.text) {
      changes.push({
        lineNumber: i,
        newText: newText,
      });
    }
  }
  return changes;
}

function changedLineEdit(
  document: vscode.TextDocument,
  changedLine: ChangedLine,
): vscode.TextEdit {
  const endCol = document.lineAt(changedLine.lineNumber).text.length;
  return vscode.TextEdit.replace(
    new vscode.Range(changedLine.lineNumber, 0, changedLine.lineNumber, endCol),
    changedLine.newText,
  );
}
