import { render } from "@testing-library/react";

import App from "./App";
import { DummyExtensionBridge } from "./System/ExtensionBridge";

// eslint-disable-next-line jest/expect-expect
test("renders app", () => {
  render(<App extensionBridge={new DummyExtensionBridge()} />);
});
