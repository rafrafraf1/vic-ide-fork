import * as vscode from "vscode";
import { getHighlights } from "../../src/common/VicLangSrcAnalysis";
import { parseVicProgram } from "../../src/common/VicLangParser";
import { vicAsmLanguageId } from "../ExtManifest";

export function activateVicDocumentHighlightProvider(
  context: vscode.ExtensionContext
): void {
  context.subscriptions.push(
    vscode.languages.registerDocumentHighlightProvider(
      vicAsmLanguageId,
      new VicDocumentHighlightProvider()
    )
  );
}

class VicDocumentHighlightProvider implements vscode.DocumentHighlightProvider {
  provideDocumentHighlights(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentHighlight[]> {
    const source = document.getText();
    const parsedProgram = parseVicProgram(source);

    const highlights = getHighlights(parsedProgram.statements, {
      line: position.line,
      column: position.character,
    });

    return highlights.map<vscode.DocumentHighlight>(
      (srcLoc) =>
        new vscode.DocumentHighlight(
          new vscode.Range(
            srcLoc.line,
            srcLoc.startCol,
            srcLoc.line,
            srcLoc.endCol
          )
        )
    );
  }
}
