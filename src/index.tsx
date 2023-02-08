import "modern-css-reset"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import "./index.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

function getRequiredElement(elementId: string): HTMLElement {
  const rootElem = document.getElementById(elementId);
  if (rootElem === null) {
    throw new Error(`Element "${elementId}" not found`);
  }
  return rootElem;
}

const root = ReactDOM.createRoot(getRequiredElement("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
