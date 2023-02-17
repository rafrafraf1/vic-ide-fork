import "./App.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import {
  type ComputerState,
  newComputerState,
  writeMemory,
} from "./Computer/Computer";
import type { Address } from "./Computer/Instruction";
import { Computer } from "./UI/Computer";
import type { Value } from "./Computer/Value";

/**
 * Force a re-render. This can be used if mutable state has been changed that
 * is not tracked by "useState"
 */
function useForceUpdate(): () => void {
  // See: <https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate>
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
  return forceUpdate;
}

function App(): JSX.Element {
  const forceUpdate = useForceUpdate();

  const computer = React.useRef<ComputerState>(newComputerState());

  console.log(computer);

  const handleMemoryCellChange = React.useCallback(
    (address: Address, value: Value): void => {
      writeMemory(computer.current, address, value);
      forceUpdate();
    },
    [forceUpdate]
  );

  const handleDataRegisterChange = React.useCallback(
    (value: Value) => {
      computer.current.dataRegister = value;
      forceUpdate();
    },
    [forceUpdate]
  );

  const handleProgramCounterChange = React.useCallback(
    (value: Value) => {
      computer.current.programCounter = value;
      forceUpdate();
    },
    [forceUpdate]
  );

  return (
    <div className="App-Root">
      <div className="App-Toolbar-Cont">VIC Toolbar</div>
      <Computer
        className="App-Computer-Cont"
        computer={computer.current}
        onMemoryCellChange={handleMemoryCellChange}
        onDataRegisterChange={handleDataRegisterChange}
        onProgramCounterChange={handleProgramCounterChange}
      />
    </div>
  );
}

export default App;
