import "modern-css-reset";
import "tippy.js/dist/tippy.css";
import "./index.css";

import * as React from "react";

import ReactDOM from "react-dom/client";

import App from "./App";
import type { SimulatorState } from "./Computer/SimulatorState";
import { PlaygroundMenu } from "./Playgrounds/PlaygroundMenu";
import reportWebVitals from "./reportWebVitals";
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
  console.log("vic-ide boot");

  const root = ReactDOM.createRoot(getRequiredElement("root"));

  const extensionBridge = getExtensionBridge<SimulatorState>();

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
