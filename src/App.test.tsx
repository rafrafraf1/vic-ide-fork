import { render } from "@testing-library/react";

import App from "./App";
import { DummyExtensionBridge } from "./System/ExtensionBridge";

test("renders app", () => {
  render(<App extensionBridge={new DummyExtensionBridge()} />);
});
