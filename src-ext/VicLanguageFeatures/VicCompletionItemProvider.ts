import * as vscode from "vscode";

import { vicAsmLanguageId, vicBinLanguageId } from "../ExtManifest";

export function activateVicCompletionItemProvider(
  context: vscode.ExtensionContext,
): void {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      [vicAsmLanguageId, vicBinLanguageId],
      new VicCompletionItemProvider(),
      ...[],
    ),
  );
}

class VicCompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext,
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    // This code is a hack to (try to) disable completions completely.
    //
    // VS Code by default will give suggestions for all of the words in the
    // documents. This is annoying.
    //
    // So we have to replace the completions with our own. If we return an
    // empty array, then VS Code will fallback to the word completions, so we
    // have to return (at least) one result.
    //
    // The strategy is to return a suggestion that won't actually complete the
    // current word.
    //
    // But if we are not at a word (meaning we are at the beginning of a line,
    // or the beginning of a word), then any suggestion we offer will match,
    // so we make a fake "No suggestions" suggestion.
    //
    // This system is not perfect, but works well enough.
    //
    // P.S. One legitimate "bug" that currently exists is if the user is at a
    // blank line, then triggers copmletions (Ctrl+Space), and then starts to
    // actually type "No sugge" and then clicks the completion then their text
    // will be deleted. This is considered an unimportant edge case.

    const range = document.getWordRangeAtPosition(position);
    if (range === undefined || range.start.isEqual(position)) {
      const completionItem = new vscode.CompletionItem("No suggestions");
      completionItem.insertText = "";
      completionItem.kind = vscode.CompletionItemKind.Snippet;
      return new vscode.CompletionList([completionItem], false);
    }

    const text = document.getText(range);

    const notMatching = !text.startsWith("x") ? "x" : "y";
    return new vscode.CompletionList(
      [new vscode.CompletionItem(notMatching)],
      false,
    );
  }
}
