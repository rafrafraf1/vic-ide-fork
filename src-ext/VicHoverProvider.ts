import * as vscode from "vscode";
import { vicLanguageId } from "./ExtManifest";

export function activateVicHoverProvider(
  context: vscode.ExtensionContext
): void {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      vicLanguageId,
      new VicHoverProvider()
    )
  );
}

class VicHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    // TODO !!!
    return null;
  }
}
