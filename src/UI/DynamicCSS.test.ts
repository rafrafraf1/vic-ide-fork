import * as crypto from "crypto";

import { css, withDynamicCSS, type CSS } from "./DynamicCSS";

describe("DynamicCSS css tag", () => {
  test("css empty", () => {
    expect(css``).toEqual<CSS>({ tag: "CSS", contents: "" });
  });
  test("css simple", () => {
    expect(css`hello`).toEqual<CSS>({ tag: "CSS", contents: "hello" });
  });
  test("css simple splice", () => {
    expect(css`
      border: ${3}px;
    `).toEqual<CSS>({ tag: "CSS", contents: "border: 3px;" });
  });
  test("css multiple splice", () => {
    expect(css`
      margin: ${3}px ${5}px;
    `).toEqual<CSS>({ tag: "CSS", contents: "margin: 3px 5px;" });
  });
});

describe("DynamicCSS withDynamicCSS", () => {
  beforeAll(() => {
    polyfillGetRandomValues();
  });

  afterEach(() => {
    resetJSDOM();
  });

  test("Nothing", () => {
    expect(document.head).toBeEmptyDOMElement();
  });

  test("Empty style", () => {
    withDynamicCSS(() => {
      // Do Nothing
    });
    expect(document.head).toContainHTML("<style></style>");
  });

  test("Delete empty style", () => {
    const dynCss = withDynamicCSS(() => {
      // Do Nothing
    });
    dynCss.dispose();
    expect(document.head).toBeEmptyDOMElement();
  });

  test("Simple style", () => {
    const buttonWithStyle = document.createElement("button");
    const buttonWithoutStyle = document.createElement("button");
    const dynCss = withDynamicCSS((dynCss) => {
      const green = dynCss.class(css`
        color: green;
      `);

      buttonWithStyle.className = green;
    });

    document.body.appendChild(buttonWithStyle);
    document.body.appendChild(buttonWithoutStyle);
    expect(buttonWithStyle).toHaveStyle("color: green");
    expect(buttonWithoutStyle).not.toHaveStyle("color: green");

    dynCss.dispose();

    expect(buttonWithStyle).not.toHaveStyle("color: green");
    expect(buttonWithoutStyle).not.toHaveStyle("color: green");
    expect(document.head).toBeEmptyDOMElement();
  });

  test("Multiple styles", () => {
    const buttonGreenText = document.createElement("button");
    const buttonBlueBackground = document.createElement("button");
    const dynCss = withDynamicCSS((dynCss) => {
      const greenText = dynCss.class(css`
        color: green;
      `);

      const blueBackground = dynCss.class(css`
        background: blue;
      `);

      buttonGreenText.className = greenText;
      buttonBlueBackground.className = blueBackground;
    });

    document.body.appendChild(buttonGreenText);
    document.body.appendChild(buttonBlueBackground);
    expect(buttonGreenText).toHaveStyle("color: green");
    expect(buttonGreenText).not.toHaveStyle("background: blue");

    expect(buttonBlueBackground).toHaveStyle("background: blue");
    expect(buttonBlueBackground).not.toHaveStyle("color: green");

    dynCss.dispose();

    expect(buttonGreenText).not.toHaveStyle("color: green");
    expect(buttonBlueBackground).not.toHaveStyle("background: blue");
    expect(document.head).toBeEmptyDOMElement();
  });

  test("Multiple DynamicCSS", () => {
    const buttonGreenText = document.createElement("button");
    const buttonBlueBackground = document.createElement("button");
    const dynCss1 = withDynamicCSS((dynCss) => {
      const greenText = dynCss.class(css`
        color: green;
      `);

      buttonGreenText.className = greenText;
    });

    const dynCss2 = withDynamicCSS((dynCss) => {
      const blueBackground = dynCss.class(css`
        background: blue;
      `);
      buttonBlueBackground.className = blueBackground;
    });

    document.body.appendChild(buttonGreenText);
    document.body.appendChild(buttonBlueBackground);
    expect(buttonGreenText).toHaveStyle("color: green");
    expect(buttonGreenText).not.toHaveStyle("background: blue");

    expect(buttonBlueBackground).toHaveStyle("background: blue");
    expect(buttonBlueBackground).not.toHaveStyle("color: green");

    dynCss1.dispose();

    expect(buttonGreenText).not.toHaveStyle("color: green");
    expect(buttonGreenText).not.toHaveStyle("background: blue");

    expect(buttonBlueBackground).not.toHaveStyle("color: green");
    expect(buttonBlueBackground).toHaveStyle("background: blue");

    dynCss2.dispose();

    expect(buttonGreenText).not.toHaveStyle("color: green");
    expect(buttonBlueBackground).not.toHaveStyle("background: blue");
    expect(document.head).toBeEmptyDOMElement();
  });
});

/**
 * jsdom does not support window.crypto.getRandomValues.
 *
 * This adds a polyfill implementation for it.
 *
 * See: <https://github.com/jsdom/jsdom/issues/1612>
 */
function polyfillGetRandomValues(): void {
  if ((global.crypto as unknown) === undefined) {
    (global.crypto as unknown) = {};
    global.crypto.getRandomValues = <T extends ArrayBufferView | null>(
      array: T,
    ): T => {
      if (array !== null) {
        crypto.randomFillSync(array as unknown as NodeJS.ArrayBufferView);
      }
      return array;
    };
  }
}

/**
 * This uses a hacky implementation, but works for the use cases in this file.
 *
 * See:
 * <https://stackoverflow.com/questions/42805128/does-jest-reset-the-jsdom-document-after-every-suite-or-test/50800473#50800473>
 * <https://github.com/facebook/jest/issues/1224>
 */
function resetJSDOM(): void {
  const html = document.getElementsByTagName("html")[0];
  if (html !== undefined) {
    html.innerHTML = "<head></head><body></body>";
  }
}
