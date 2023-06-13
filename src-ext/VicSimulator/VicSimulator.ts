import * as vscode from "vscode";
import {
  type DebugState,
  handleDebugMessage,
  initDebugState,
} from "./VicSimulatorDebug";
import {
  type DiagnosticsService,
  getTextDocumentHasErrors,
} from "../VicLanguageFeatures/VicDiagnostics";
import type {
  ExtensionMessage,
  SimulatorMessage,
} from "../../src/common/Vic/Messages";
import type { SourceFile, SourceFileId } from "../../src/common/Vic/SourceFile";
import { generateSecureNonce, renderPageHtml } from "./PanelHtml";
import {
  vicOpenSimulatorCommand,
  vicWebviewPanelType,
  webviewBuildDir,
} from "../ExtManifest";
import type { AppState } from "./AppState";
import { AssetManifest } from "./AssetManifest";
import { assertNever } from "assert-never";
import { compileVicProgram } from "../../src/common/VicLangFullCompiler";

export interface Panel {
  webviewPanel: vscode.WebviewPanel;
  ready: boolean;
}

export interface SimulatorManager {
  readonly diagnosticsService: DiagnosticsService;

  /**
   * We only want to allow a single tab with the Vic Simulator to exist. If
   * the user tries to open a new Vic Simulator, then we reveal the existing
   * tab.
   */
  panel: Panel | null;

  /**
   * The VSCode extension API supports saving/restoring state of the webview.
   * This functionality is only used when the tab is hidden/revealed. If the
   * tab is closed, then the state is lost.
   *
   * So we use this variable to store the state, so that we have it available
   * afte the user closes the tab and opens a "new" Vic Simulator.
   */
  state: AppState | null;

  activeTextDocument: vscode.Uri | null;

  debugState: DebugState;
}

export function createSimulatorManager(
  diagnosticsService: DiagnosticsService
): SimulatorManager {
  return {
    diagnosticsService: diagnosticsService,
    panel: null,
    state: null,
    activeTextDocument: null,
    debugState: initDebugState(),
  };
}

export function activateVicSimulator(
  context: vscode.ExtensionContext,
  simulatorManager: SimulatorManager
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(vicOpenSimulatorCommand, () => {
      showVicSimulator(simulatorManager, context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer(vicWebviewPanelType, {
      // Called when the user runs the "Developer: Reload Window" command.
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: AppState
      ): Promise<void> {
        // `state` is the state persisted using `setState` inside the webview

        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);

        renderVicPanel(
          simulatorManager,
          webviewPanel,
          context.extensionUri,
          null
        );

        simulatorManager.panel = {
          webviewPanel: webviewPanel,
          ready: false,
        };

        simulatorManager.state = state;

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
          const uri = activeTextEditor.document.uri;
          simulatorManager.activeTextDocument = uri;

          webviewPostMessage(simulatorManager, {
            kind: "SourceFileChange",
            sourceFile: buildSourceFile(
              simulatorManager.diagnosticsService,
              uri
            ),
          });
        }
      }
    )
  );

  if (vscode.window.activeTextEditor !== undefined) {
    simulatorManager.activeTextDocument =
      vscode.window.activeTextEditor.document.uri;
  }

  simulatorManager.diagnosticsService.observer = {
    onTextDocumentHasErrors: (uri: vscode.Uri, hasErrors: boolean): void => {
      if (simulatorManager.activeTextDocument === null) {
        return;
      }

      if (uri.toString() === simulatorManager.activeTextDocument.toString()) {
        webviewPostMessage(simulatorManager, {
          kind: "SourceFileChange",
          sourceFile: {
            id: uriToSourceFileId(uri),
            filename: getUriBasename(uri),
            info: {
              kind: "ValidSourceFile",
              hasErrors: hasErrors,
            },
          },
        });
      }
    },
  };
}

function buildSourceFile(
  diagnosticsService: DiagnosticsService,
  uri: vscode.Uri
): SourceFile {
  return {
    id: uriToSourceFileId(uri),
    filename: getUriBasename(uri),
    info: {
      kind: "ValidSourceFile",
      hasErrors: getTextDocumentHasErrors(diagnosticsService, uri),
    },
  };
}

function showVicSimulator(
  simulatorManager: SimulatorManager,
  extensionUri: vscode.Uri
): void {
  if (simulatorManager.panel !== null) {
    simulatorManager.panel.webviewPanel.reveal();
    return;
  }

  // This can happen if the user ran "Reload Window" while a Simulator tab
  // exists that isn't active.
  if (simulatorTabExists()) {
    void switchToSimulatorTab();
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

  renderVicPanel(simulatorManager, panel, extensionUri, simulatorManager.state);

  simulatorManager.panel = {
    webviewPanel: panel,
    ready: false,
  };
}

function isSimulatorTab(tabInput: vscode.TabInputWebview): boolean {
  // For some reason, the `viewType` is: "mainThreadWebview-vic-ide"

  return (
    tabInput.viewType === vicWebviewPanelType ||
    tabInput.viewType.endsWith(`-${vicWebviewPanelType}`)
  );
}

function simulatorTabExists(): boolean {
  for (const tabGroup of vscode.window.tabGroups.all) {
    for (const tab of tabGroup.tabs) {
      if (tab.input instanceof vscode.TabInputWebview) {
        if (isSimulatorTab(tab.input)) {
          return true;
        }
      }
    }
  }

  return false;
}

function isSimulatorTabActive(): boolean {
  for (const tabGroup of vscode.window.tabGroups.all) {
    for (const tab of tabGroup.tabs) {
      if (tab.input instanceof vscode.TabInputWebview) {
        if (isSimulatorTab(tab.input)) {
          return tab.isActive;
        }
      }
    }
  }

  /* istanbul ignore next */
  throw new Error("Simulator tab not found");
}

async function switchToSimulatorTab(): Promise<void> {
  // This is a very hacky way to switch to the target tab. There doesn't
  // appear to be a better way.

  // TODO A slightly nicer hack would be to check if the target tab is in the
  // current tab group, and then use "workbench.action.openEditorAtIndex1" or
  // "workbench.action.openEditorAtIndex2", etc...
  //
  // If that doesn't work, then another improvement would be to go in the
  // direction of "workbench.action.previousEditor" if the path is shorter.

  for (;;) {
    if (isSimulatorTabActive()) {
      return;
    }
    await vscode.commands.executeCommand("workbench.action.nextEditor");
  }
}

function renderVicPanel(
  simulatorManager: SimulatorManager,
  panel: vscode.WebviewPanel,
  extensionUri: vscode.Uri,
  appState: AppState | null
): void {
  const assetMannifestPath = vscode.Uri.joinPath(
    extensionUri,
    webviewBuildDir,
    "asset-manifest.json"
  );

  // User closes the VSCode tab containing the panel:
  panel.onDidDispose(() => {
    simulatorManager.panel = null;
  });

  panel.onDidChangeViewState(() => {
    if (!panel.visible) {
      if (simulatorManager.panel !== null) {
        simulatorManager.panel.ready = false;
      }
    }
  });

  panel.onDidChangeViewState((e) => {
    if (e.webviewPanel.active) {
      if (
        simulatorManager.panel !== null &&
        simulatorManager.panel.ready &&
        simulatorManager.activeTextDocument !== null
      ) {
        webviewPostMessage(simulatorManager, {
          kind: "SourceFileChange",
          sourceFile: buildSourceFile(
            simulatorManager.diagnosticsService,
            simulatorManager.activeTextDocument
          ),
        });
      }
    }
  });

  panel.webview.onDidReceiveMessage((e) => {
    const message: SimulatorMessage<AppState> = e as SimulatorMessage<AppState>;
    handleSimulatorMessage(simulatorManager, message);
  });

  vscode.workspace.fs.readFile(assetMannifestPath).then(
    (contents) => {
      const assetManifest = AssetManifest.load(contents.toString());
      /* istanbul ignore next */
      if (typeof assetManifest === "string") {
        console.error(`Error loading asset-manifest.json:\n${assetManifest}`);
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
    /* istanbul ignore next */
    (err) => {
      console.error(`Error loading asset-manifest.json:\n${err as string}`);
      void vscode.window.showErrorMessage(
        `Error loading asset-manifest.json:\n${err as string}`
      );
    }
  );
}

function handleSimulatorMessage(
  simulatorManager: SimulatorManager,
  message: SimulatorMessage<AppState>
): void {
  switch (message.kind) {
    case "Ready":
      if (simulatorManager.panel !== null) {
        simulatorManager.panel.ready = true;
        if (simulatorManager.activeTextDocument !== null) {
          webviewPostMessage(simulatorManager, {
            kind: "SourceFileChange",
            sourceFile: buildSourceFile(
              simulatorManager.diagnosticsService,
              simulatorManager.activeTextDocument
            ),
          });
        }
      }
      simulatorManager.debugState.panelReadyListeners.forEach((listener) => {
        listener();
      });
      break;
    case "SetState":
      simulatorManager.state = message.state;
      if (simulatorManager.debugState.stateUpdateListener !== null) {
        simulatorManager.debugState.stateUpdateListener();
        simulatorManager.debugState.stateUpdateListener = null;
      }
      break;
    case "LoadSourceFile":
      handleLoadSourceFile(simulatorManager, message.sourceFileId);
      break;
    case "ShowErrors":
      handleShowErrors(message.sourceFileId);
      break;
    case "DebugMessage":
      handleDebugMessage(simulatorManager, message.message);
      break;
    /* istanbul ignore next */
    default:
      assertNever(message);
  }
}

// [Note about message passing race conditions]
//
// There are several points in the code that contain a reference to this note.
//
// In general, these branches should not happen. But because the Extension and
// the Simulator communicate using asynchronous message passing, it is
// possible for race conditions to happen that will lead to these branches.
//
// The race conditions can happen as a result of very quick user interactions.
//
// For example: The user clicks the button in the Simulator to load a source
// file (containing no errors). But before the message arrives to the
// Extension, the user very quickly modifies the source file to introduce an
// error. When the Extension receives the message and tries to compile the
// source file it will encounter an unexpected error.
//
// Note: I have not observed these race conditions happening in practice, but
// they are possible in theory.

function handleLoadSourceFile(
  simulatorManager: SimulatorManager,
  sourceFileId: SourceFileId
): void {
  const textDocument = vscode.workspace.textDocuments.find(
    (t) => uriToSourceFileId(t.uri) === sourceFileId
  );

  if (textDocument === undefined) {
    // See [Note about message passing race conditions]
    void vscode.window.showErrorMessage(`No file to load`);
    return;
  }

  const source = textDocument.getText();
  const result = compileVicProgram(source);
  switch (result.program.kind) {
    case "Ok":
      webviewPostMessage(simulatorManager, {
        kind: "LoadProgram",
        program: result.program.value,
      });
      break;
    case "Error": {
      // See [Note about message passing race conditions]
      void vscode.window.showErrorMessage(
        `Error loading ${getUriBasename(textDocument.uri)}`
      );
      break;
    }
    default:
      assertNever(result.program);
  }
}

function handleShowErrors(sourceFileId: SourceFileId): void {
  const textDocument = vscode.workspace.textDocuments.find(
    (t) => uriToSourceFileId(t.uri) === sourceFileId
  );

  void vscode.commands.executeCommand("workbench.panel.markers.view.focus");

  if (textDocument === undefined) {
    // See [Note about message passing race conditions]
    return;
  }

  // TODO This sometimes opens in a new tab
  void vscode.window.showTextDocument(textDocument);
}

/**
 * Tag all messages that are sent with a "source", because the browser
 * environment is chaotic, and there may be other components (like browser
 * extensions) that post messages to the window.
 *
 * We need the app to be able to identity the messages that come from us.
 */
type OutgoingMessage<T> = T & { source: "vic-ide-ext" };

export function webviewPostMessage(
  simulatorManager: SimulatorManager,
  message: ExtensionMessage
): void {
  if (simulatorManager.panel !== null) {
    const outgoingMessage: OutgoingMessage<ExtensionMessage> = {
      source: "vic-ide-ext",
      ...message,
    };

    simulatorManager.panel.webviewPanel.webview
      .postMessage(outgoingMessage)
      .then(
        () => {
          // Message sent to webview. Do Nothing.
        },
        () => {
          // Ignore this error.
          //
          // This happens sometimes when the user closes the webview panel.
          // Focus switches to another text editor, and VS Code emits the
          // "onDidChangeActiveTextEditor" event before the "panel.onDidDispose"
          // event.
          //
          // See: <https://github.com/microsoft/vscode/issues/48509>
        }
      );
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

/**
 * Converts a `vscode.Uri` to a `SourceFileId`. This allows the uri to be
 * serialized (to be sent as part of a message). It also allows comparing uris
 * for equality (If two uris map ot the same `SourceFileId` then the two uris
 * are equal).
 */
function uriToSourceFileId(uri: vscode.Uri): SourceFileId {
  return uri.toString();
}

function getUriBasename(uri: vscode.Uri): string {
  const i = uri.path.lastIndexOf("/");
  if (i < 0) {
    return uri.path;
  }

  return uri.path.substring(i + 1);
}
