// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { AssetManifest } from "./AssetManifest";
import type { WebviewPanel } from "vscode";

type AppState = object;

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

function entrypointUri(
  extensionUri: vscode.Uri,
  webview: vscode.Webview,
  entrypoint: string
): vscode.Uri {
  const pathOnDisk = vscode.Uri.joinPath(extensionUri, "build", entrypoint);
  return webview.asWebviewUri(pathOnDisk);
}

function entrypointHtml(scriptNonce: string, entrypoint: vscode.Uri): string {
  const entrypointStr = entrypoint.toString();
  if (entrypointStr.endsWith(".css")) {
    return entrypointCssHtml(entrypointStr);
  } else if (entrypointStr.endsWith(".js")) {
    return entrypointJsHtml(scriptNonce, entrypointStr);
  } else {
    // TODO
    return "";
  }
}

function entrypointCssHtml(entrypoint: string): string {
  return `<link href="${entrypoint}" rel="stylesheet">`;
}

function entrypointJsHtml(scriptNonce: string, entrypoint: string): string {
  return `<script nonce="${scriptNonce}" defer="defer" src="${entrypoint}"></script>`;
}

/**
 * Escapes the given string so that it can be safely embedded inside an HTML
 * document.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Serializes the AppState to a string that is stored as an HTML attribute on
 * the HTML <body> tag.
 *
 * The app can then read this state at startup to load a previously saved
 * state.
 */
function stateHtmlBodyAttribute(state: AppState): string {
  return ` data-state="${escapeHtml(JSON.stringify(state))}"`;
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

        const entrypointsHtml = assetManifest
          .getEntryPoints()
          .map((e) => entrypointUri(extensionUri, panel.webview, e))
          .map((e) => entrypointHtml(nonce, e))
          .join("\n");

        // Use a content security policy to only allow loading images from
        // https or from our extension directory, and only allow scripts that
        // have a specific nonce.
        const contentSecurityPolicy =
          `default-src 'none'; ` +
          `style-src ${panel.webview.cspSource}; ` +
          `img-src ${panel.webview.cspSource} https: data:; ` +
          `script-src 'nonce-${nonce}';`;

        const pageHtml = `
				<!doctype html>
				<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">
					<meta name="viewport" content="width=device-width,initial-scale=1" />
					<title>Vic Simulator</title>
					${entrypointsHtml}
				</head>
				<body ${appState === undefined ? "" : stateHtmlBodyAttribute(appState)}>
					<div id="root"></div>
				</body>
				</html>`;

        void vscode.window.showInformationMessage(pageHtml);

        panel.webview.html = pageHtml;
      }
    },
    (err) => {
      void vscode.window.showErrorMessage(
        `Error loading asset-manifest.json:\n${err as string}`
      );
    }
  );

  // setTimeout(() => {
  // panel.webview.html = `<!DOCTYPE html>
  // 	<html lang="en">
  // 	<head>
  // 		<meta charset="UTF-8">
  // 		<!--
  // 			Use a content security policy to only allow loading images from https or from our extension directory,
  // 			and only allow scripts that have a specific nonce.
  // 		-->
  // 		<meta name="viewport" content="width=device-width, initial-scale=1.0">
  // 		<title>Vic</title>
  // 	</head>
  // 	<body>
  // 		<h1 id>Vic</h1>
  // 	</body>
  // 	</html>`;
  // }, 2000);
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from the specified directories.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, "build")],
  };
}

function getNonce(): string {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
