import App from "./App";
import { DummyExtensionBridge } from "./System/ExtensionBridge";
import { render } from "@testing-library/react";

test("renders app", () => {
  render(<App extensionBridge={new DummyExtensionBridge()} />);
});
