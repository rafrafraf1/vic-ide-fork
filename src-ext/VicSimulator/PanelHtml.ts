import * as crypto from "crypto";

import * as vscode from "vscode";

import { webviewBuildDir } from "../ExtManifest";
import type { AppState } from "./AppState";
import type { AssetManifest } from "./AssetManifest";

/**
 * Renders the HTML page for the Vic-IDE web panel.
 *
 * @param nonce A secure random token used in the Content-Security-Policy to
 * restrict loading of scripts. This can be created using the function
 * `generateSecureNonce`.
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
  appState: AppState | null,
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
    `style-src ${cspSource} 'nonce-${nonce}'`,
    `img-src ${cspSource} https: data:`,
    `script-src 'nonce-${nonce}'`,
  ]
    .map((x) => `${x};`)
    .join(" ");

  // Dynamic <style> tags require access to the CSP nonce. We use an existing
  // convention established by webpack of storing the nonce in the following
  // global variable.
  //
  // See:
  //
  // <https://webpack.js.org/guides/csp/>
  // <https://github.com/webpack/webpack/pull/3210/files>
  // <https://github.com/styled-components/styled-components/issues/887>
  // <https://github.com/styled-components/styled-components/pull/1022/files>
  const declareWebpackNonce = `
    <script nonce="${nonce}">
      window.__webpack_nonce__ = "${nonce}";
    </script>
    `;

  // This should (more-or-less) match the "public/index.html" source file:
  const pageHtml = `
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Vic Simulator</title>
        ${declareWebpackNonce}
        ${entrypointsHtml}
    </head>
    <body ${appState === null ? "" : stateHtmlBodyAttribute(appState)}>
        <div id="root"></div>
    </body>
    </html>
    `;

  return pageHtml;
}

/**
 * Creates a secure random token, that can be used as a
 * Content-Security-Policy nonce policy to restrict loading of scripts.
 *
 * See:
 * <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src>
 */
export function generateSecureNonce(): string {
  return crypto.randomBytes(16).toString("base64");
}

function entrypointUri(
  extensionUri: vscode.Uri,
  asWebviewUri: (localResource: vscode.Uri) => vscode.Uri,
  entrypoint: string,
): vscode.Uri {
  const pathOnDisk = vscode.Uri.joinPath(
    extensionUri,
    webviewBuildDir,
    entrypoint,
  );
  return asWebviewUri(pathOnDisk);
}

function entrypointHtml(scriptNonce: string, entrypoint: vscode.Uri): string {
  const entrypointStr = entrypoint.toString();
  switch (getExtension(entrypointStr)) {
    case "css":
      return entrypointCssHtml(entrypointStr);
    case "js":
      return entrypointJsHtml(scriptNonce, entrypointStr);
    /* istanbul ignore next */
    default:
      throw new Error(`Unknown entrypoint type: ${entrypointStr}`);
  }
}

function getExtension(filename: string): string | null {
  const index = filename.lastIndexOf(".");
  /* istanbul ignore if  */
  if (index < 0) {
    return null;
  }
  return filename.substring(index + 1);
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
