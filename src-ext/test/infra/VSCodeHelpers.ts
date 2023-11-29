import * as vscode from "vscode";

/**
 * Call this after calling `vscode.workspace.openTextDocument` to wait for the
 * document to actually finish opening.
 */
export async function waitForTextDocumentToOpen(
  textDocument: vscode.TextDocument,
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

/**
 * A simplified view of a `vscode.TabGroup`. Useful in unit test assertions.
 */
export interface TabGroupView {
  viewColumn: vscode.ViewColumn;
  isActive: boolean;
  tabs: TabView[];
}

/**
 * A simplified view of a `vscode.Tab`. Useful in unit test assertions.
 */
export interface TabView {
  label: string;
  isActive: boolean;
}

/**
 * Convert a `vscode.TabGroup` to a `TabGroupView`.
 */
export function tabGroupView(tabGroup: vscode.TabGroup): TabGroupView {
  return {
    viewColumn: tabGroup.viewColumn,
    isActive: tabGroup.isActive,
    tabs: tabGroup.tabs.map<TabView>(tabView),
  };
}

/**
 * Convert a `vscode.Tab` to a `TabView`.
 */
export function tabView(tab: vscode.Tab): TabView {
  return {
    label: tab.label,
    isActive: tab.isActive,
  };
}
