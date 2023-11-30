import * as vscode from "vscode";

import { vicAsmLanguageId, vicBinLanguageId } from "../ExtManifest";

export function activateVicHoverProvider(
  context: vscode.ExtensionContext,
): void {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      vicAsmLanguageId,
      new VicAsmHoverProvider(),
    ),
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      vicBinLanguageId,
      new VicBinHoverProvider(),
    ),
  );
}

class VicAsmHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Hover> {
    // TODO !!!
    return null;
  }
}

class VicBinHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Hover> {
    // TODO !!!
    return null;
  }
}
