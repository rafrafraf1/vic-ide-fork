import "modern-css-reset";
import "tippy.js/dist/tippy.css";
import "./index.css";

import * as React from "react";

import ReactDOM from "react-dom/client";

import App from "./App";
import type { AppWebviewState } from "./AppWebviewState";
import { PlaygroundMenu } from "./Playgrounds/PlaygroundMenu";
import { getExtensionBridge } from "./System/ExtensionBridge";

function getRequiredElement(elementId: string): HTMLElement {
  const rootElem = document.getElementById(elementId);
  if (rootElem === null) {
    throw new Error(`Element "${elementId}" not found`);
  }
  return rootElem;
}

function devMode(): boolean {
  return window.location.hash === "#dev";
}

function boot(): void {
  console.log("vic-ide webapp boot");

  const root = ReactDOM.createRoot(getRequiredElement("root"));

  const extensionBridge = getExtensionBridge<AppWebviewState>();

  root.render(
    <React.StrictMode>
      {devMode() ? (
        <PlaygroundMenu />
      ) : (
        <App extensionBridge={extensionBridge} />
      )}
    </React.StrictMode>,
  );
}

boot();
