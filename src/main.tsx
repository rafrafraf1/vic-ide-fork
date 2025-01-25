import "modern-css-reset";
import "tippy.js/dist/tippy.css";
import "./index.css";

import * as React from "react";

import ReactDOM from "react-dom/client";

import App from "./App/App";
import { getBrowserStorage } from "./App/AppState";
import { PlaygroundMenu } from "./Playgrounds/PlaygroundMenu";

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

  const browserStorage = getBrowserStorage();
  void browserStorage.getState().then((state) => {
    const root = ReactDOM.createRoot(getRequiredElement("root"));

    root.render(
      <React.StrictMode>
        {devMode() ? (
          <PlaygroundMenu />
        ) : (
          <App browserStorage={browserStorage} savedState={state} />
        )}
      </React.StrictMode>,
    );
  });
}

boot();
