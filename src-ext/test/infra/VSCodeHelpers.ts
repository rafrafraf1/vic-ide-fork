import * as vscode from "vscode";

/**
 * Call this after calling `vscode.workspace.openTextDocument` to wait for the
 * document to actually finish opening.
 */
export async function waitForTextDocumentToOpen(
  textDocument: vscode.TextDocument
): Promise<void> {
  await new Promise<void>((resolve) => {
    const eventRegistration = vscode.window.onDidChangeActiveTextEditor((e) => {
      if (e !== undefined && e.document === textDocument) {
        eventRegistration.dispose();
        resolve();
      }
    });
  });
}
