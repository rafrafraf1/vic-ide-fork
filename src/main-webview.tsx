import "modern-css-reset";
import "tippy.js/dist/tippy.css";
import "./index.css";

import * as React from "react";

import ReactDOM from "react-dom/client";

import AppWebview from "./AppWebview";
import type { AppWebviewState } from "./AppWebviewState";
import { getExtensionBridge } from "./System/ExtensionBridge";

function getRequiredElement(elementId: string): HTMLElement {
  const rootElem = document.getElementById(elementId);
  if (rootElem === null) {
    throw new Error(`Element "${elementId}" not found`);
  }
  return rootElem;
}

function boot(): void {
  console.log("vic-ide webview boot");

  const root = ReactDOM.createRoot(getRequiredElement("root"));

  const extensionBridge = getExtensionBridge<AppWebviewState>();

  root.render(
    <React.StrictMode>
      <AppWebview extensionBridge={extensionBridge} />
    </React.StrictMode>,
  );
}

boot();
