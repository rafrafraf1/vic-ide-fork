import { render } from "@testing-library/react";

import App from "./App";

/**
 * Initialize the DOM to have the required "link" tag that specifies the current
 * theme.
 *
 * See the files "index.html" and "DemoTheme.ts".
 */
function initTheme(): void {
  const linkTag = document.createElement("link");
  linkTag.rel = "stylesheet";
  linkTag.id = "page-theme";
  linkTag.href = "/vscode-vars.css";

  document.head.appendChild(linkTag);
}

// eslint-disable-next-line jest/expect-expect
test("renders app", () => {
  // See: <https://github.com/jsdom/jsdom/issues/1695>
  Element.prototype.scrollIntoView = jest.fn();

  initTheme();

  render(<App savedState={null} />);
});
