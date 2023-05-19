// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getNonce, renderPageHtml } from "./PanelHtml";
import type { AppState } from "./AppState";
import { AssetManifest } from "./AssetManifest";
import type { WebviewPanel } from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vic-ide" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "vic-ide.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      void vscode.window.showInformationMessage("Hello World from vic-ide!");
    }
  );

  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.commands.registerCommand("vic-ide.openSimulator", () => {
      showVicSimulator(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer(vicViewType, {
      async deserializeWebviewPanel(
        webviewPanel: WebviewPanel,
        state: AppState
      ): Promise<void> {
        // `state` is the state persisted using `setState` inside the webview

        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);

        renderVicPanel(webviewPanel, context.extensionUri, undefined);

        globalPanel = {
          panel: webviewPanel,
        };

        globalState = state;

        await Promise.resolve();
      },
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate(): void {
  // TODO ...
}

const vicViewType = "vic-ide";

interface VicPanel {
  panel: vscode.WebviewPanel;
}

/**
 * We only allow a single tab with the Vic IDE to exist. If the user tries to
 * open a new Vic IDE, then we reveal the existing tab.
 *
 * This variable is used to keep track of the existing (single) panel, so that
 * it can be revealed.
 */
let globalPanel: VicPanel | undefined = undefined;

/**
 * The VSCode extension API supports saving/restoring state of the webview.
 * This functionality is only used when the tab is hidden/revealed. If the tab
 * is closed, then the state is lost.
 *
 * So we use this variable to store the state, so that we have it available
 * afte the user closes the tab and opens a "new" Vic IDE.
 */
let globalState: AppState | undefined = undefined;

function showVicSimulator(extensionUri: vscode.Uri): void {
  if (globalPanel !== undefined) {
    globalPanel.panel.reveal();
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    vicViewType,
    "Vic Simulator",
    vscode.ViewColumn.One,
    getWebviewOptions(extensionUri)
  );

  renderVicPanel(panel, extensionUri, globalState);

  globalPanel = {
    panel: panel,
  };
}

interface StateMessage<StateType> {
  state: StateType | undefined;
}

function renderVicPanel(
  panel: vscode.WebviewPanel,
  extensionUri: vscode.Uri,
  appState: AppState | undefined
): void {
  const assetMannifestPath = vscode.Uri.joinPath(
    extensionUri,
    "build",
    "asset-manifest.json"
  );

  // User closes the VSCode tab containing the panel:
  panel.onDidDispose(() => {
    globalPanel = undefined;
  });

  panel.webview.onDidReceiveMessage((e) => {
    // TODO In the future there will be different message types. For now
    // assuming that it is a state-update message.

    const stateMessage: StateMessage<AppState> = e as StateMessage<AppState>;

    globalState = stateMessage.state;
  });

  vscode.workspace.fs.readFile(assetMannifestPath).then(
    (contents) => {
      const assetManifest = AssetManifest.load(contents.toString());
      if (typeof assetManifest === "string") {
        void vscode.window.showErrorMessage(
          `Error loading asset-manifest.json:\n${assetManifest}`
        );
      } else {
        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        const pageHtml = renderPageHtml(
          extensionUri,
          nonce,
          panel.webview.cspSource,
          (u) => panel.webview.asWebviewUri(u),
          assetManifest,
          appState
        );

        panel.webview.html = pageHtml;
      }
    },
    (err) => {
      void vscode.window.showErrorMessage(
        `Error loading asset-manifest.json:\n${err as string}`
      );
    }
  );
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from the specified
    // directories.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, "build")],
  };
}
