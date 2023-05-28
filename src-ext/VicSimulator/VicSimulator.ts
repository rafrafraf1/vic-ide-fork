import * as vscode from "vscode";
import type {
  ExtensionMessage,
  SimulatorMessage,
} from "../../src/common/Vic/Messages";
import { generateSecureNonce, renderPageHtml } from "./PanelHtml";
import {
  vicOpenSimulatorCommand,
  vicWebviewPanelType,
  webviewBuildDir,
} from "../ExtManifest";
import type { AppState } from "./AppState";
import { AssetManifest } from "./AssetManifest";
import { assertNever } from "assert-never";

export function activateVicSimulator(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(vicOpenSimulatorCommand, () => {
      showVicSimulator(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer(vicWebviewPanelType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
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

  // TODO This event needs more polish (handle initial load, handle closing of
  // last file, etc...).
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(
      (activeTextEditor: vscode.TextEditor | undefined): void => {
        if (activeTextEditor !== undefined) {
          webviewPostMessage({
            kind: "SourceFileChange",
            sourceFile: {
              filename: getUriBasename(activeTextEditor.document.uri),
              info: {
                kind: "ValidSourceFile",
                hasErrors: false,
              },
            },
          });
        }
      }
    )
  );
}

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

  // The title of the tab that will contain the simulator:
  const title = "Vic Simulator";

  // Split the VS code editor into two columns, and place the simulator in the
  // right view column. (If the editor is already split, then the simulator
  // will open in a new tab in the right view column).
  //
  // Note: another good choice might be to use `vscode.ViewColumn.Beside`.
  //
  // See:
  // <https://stackoverflow.com/questions/56961523/how-do-i-get-the-number-of-viewcolumns-the-user-has-open-from-a-vscode-extension/58896667#58896667>
  const viewColumn: vscode.ViewColumn = vscode.ViewColumn.Two;

  const panel = vscode.window.createWebviewPanel(
    vicWebviewPanelType,
    title,
    viewColumn,
    getWebviewOptions(extensionUri)
  );

  renderVicPanel(panel, extensionUri, globalState);

  globalPanel = {
    panel: panel,
  };
}

function renderVicPanel(
  panel: vscode.WebviewPanel,
  extensionUri: vscode.Uri,
  appState: AppState | undefined
): void {
  const assetMannifestPath = vscode.Uri.joinPath(
    extensionUri,
    webviewBuildDir,
    "asset-manifest.json"
  );

  // User closes the VSCode tab containing the panel:
  panel.onDidDispose(() => {
    globalPanel = undefined;
  });

  panel.webview.onDidReceiveMessage((e) => {
    const message: SimulatorMessage<AppState> = e as SimulatorMessage<AppState>;

    switch (message.kind) {
      case "SetState":
        globalState = message.state;
        break;
      case "LoadSourceFile":
        console.log("LoadSourceFile");
        break;
      case "ShowErrors":
        // TODO ...
        break;
      default:
        assertNever(message);
    }
  });

  vscode.workspace.fs.readFile(assetMannifestPath).then(
    (contents) => {
      const assetManifest = AssetManifest.load(contents.toString());
      if (typeof assetManifest === "string") {
        void vscode.window.showErrorMessage(
          `Error loading asset-manifest.json:\n${assetManifest}`
        );
      } else {
        const nonce = generateSecureNonce();

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

/**
 * Tag all messages that are sent with a "source", because the browser
 * environment is chaotic, and there may be other components (like browser
 * extensions) that post messages to the window.
 *
 * We need the app to be able to identity the messages that come from us.
 */
type OutgoingMessage<T> = T & { source: "vic-ide-ext" };

function webviewPostMessage(message: ExtensionMessage): void {
  if (globalPanel !== undefined) {
    const outgoingMessage: OutgoingMessage<ExtensionMessage> = {
      source: "vic-ide-ext",
      ...message,
    };

    void globalPanel.panel.webview.postMessage(outgoingMessage);
  }
}

function getWebviewOptions(
  extensionUri: vscode.Uri
): vscode.WebviewPanelOptions & vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from the specified
    // directories.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, webviewBuildDir)],
  };
}

function getUriBasename(uri: vscode.Uri): string {
  const i = uri.path.lastIndexOf("/");
  if (i < 0) {
    return uri.path;
  }

  return uri.path.substring(i + 1);
}
