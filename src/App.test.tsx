import App from "./App";
import { DummySystemStateService } from "./System/SystemState";
import { render } from "@testing-library/react";

test("renders app", () => {
  render(<App systemStateService={new DummySystemStateService()} />);
});
