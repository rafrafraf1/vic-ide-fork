import "./App.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import { type Address, parseInstruction } from "./Computer/Instruction";
import {
  type ComputerState,
  executeInstruction,
  fetchInstruction,
  newComputerState,
  writeMemory,
} from "./Computer/Computer";
import { Computer } from "./UI/Computer";
import { Toolbar } from "./UI/Toolbar";
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
  const instructionRegister = React.useRef<Value>(0);

  console.log(computer);

  const handleFetchInstructionClick = React.useCallback(() => {
    const instr = fetchInstruction(computer.current);
    instructionRegister.current = instr;
    forceUpdate();
  }, [forceUpdate]);

  const handleExecuteInstructionClick = React.useCallback(() => {
    const instr = parseInstruction(instructionRegister.current);

    // TODO Handle the result:
    executeInstruction(computer.current, instr, null);

    forceUpdate();
  }, [forceUpdate]);

  const handleMemoryCellChange = React.useCallback(
    (address: Address, value: Value): void => {
      writeMemory(computer.current, address, value);
      forceUpdate();
    },
    [forceUpdate]
  );

  const handleInstructionRegister = React.useCallback(
    (value: Value) => {
      instructionRegister.current = value;
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
      <Toolbar
        className="App-Toolbar-Cont"
        onFetchInstructionClick={handleFetchInstructionClick}
        onExecuteInstructionClick={handleExecuteInstructionClick}
      />
      <Computer
        className="App-Computer-Cont"
        computer={computer.current}
        instructionRegister={instructionRegister.current}
        onMemoryCellChange={handleMemoryCellChange}
        onInstructionRegister={handleInstructionRegister}
        onDataRegisterChange={handleDataRegisterChange}
        onProgramCounterChange={handleProgramCounterChange}
      />
    </div>
  );
}

export default App;
