import { render } from "@testing-library/react";

import App from "./App";

// eslint-disable-next-line jest/expect-expect
test("renders app", () => {
  // See: <https://github.com/jsdom/jsdom/issues/1695>
  Element.prototype.scrollIntoView = jest.fn();

  render(<App />);
});
