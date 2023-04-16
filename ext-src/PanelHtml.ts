import * as vscode from "vscode";
import type { AppState } from "./AppState";
import type { AssetManifest } from "./AssetManifest";

/**
 * Renders the HTML page for the Vic-IDE web panel.
 *
 * @param nonce A secure random token used in the Content-Security-Policy to
 * restrict loading of scripts. This can be created using the function
 * `getNonce`.
 *
 * @param cspSource Content security policy source for webview resources. This
 * is the origin that should be used in a content security policy rule. This
 * should be `panel.webview.cspSource`.
 *
 * @param asWebviewUri A function for converting a path to a Uri. This should
 * be the function `panel.webview.asWebviewUri`.
 */
export function renderPageHtml(
  extensionUri: vscode.Uri,
  nonce: string,
  cspSource: string,
  asWebviewUri: (localResource: vscode.Uri) => vscode.Uri,
  assetManifest: AssetManifest,
  appState: AppState | undefined
): string {
  const entrypointsHtml = assetManifest
    .getEntryPoints()
    .map((e) => entrypointUri(extensionUri, asWebviewUri, e))
    .map((e) => entrypointHtml(nonce, e))
    .join("\n");

  // Use a content security policy to only allow loading images from
  // https or from our extension directory, and only allow scripts that
  // have a specific nonce.
  const contentSecurityPolicy = [
    `default-src 'none'`,
    `style-src ${cspSource}`,
    `img-src ${cspSource} https: data:`,
    `script-src 'nonce-${nonce}'`,
  ]
    .map((x) => `${x};`)
    .join(" ");

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
    </html>
    `;

  return pageHtml;
}

export function getNonce(): string {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function entrypointUri(
  extensionUri: vscode.Uri,
  asWebviewUri: (localResource: vscode.Uri) => vscode.Uri,
  entrypoint: string
): vscode.Uri {
  const pathOnDisk = vscode.Uri.joinPath(extensionUri, "build", entrypoint);
  return asWebviewUri(pathOnDisk);
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
