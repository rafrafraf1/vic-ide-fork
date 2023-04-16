import "./App.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import {
  type ComputerState,
  executeInstruction,
  fetchInstruction,
  newComputerState,
  setDataRegister,
  setInstructionRegister,
  setProgramCounter,
  writeMemory,
} from "./Computer/Computer";
import type { Address } from "./Computer/Instruction";
import { Computer } from "./UI/Computer";
import type { SystemStateService } from "./System/SystemState";
import { Toolbar } from "./UI/Toolbar";
import type { Value } from "./Computer/Value";

export interface AppProps {
  systemStateService: SystemStateService<ComputerState>;
}

/**
 * Initializes an initial state, by either loading a saved state from the
 * SystemStateService, or if there is no saved state, creating a new empty
 * state.
 */
function initComputerState(
  systemStateService: SystemStateService<ComputerState>
): ComputerState {
  const savedState = systemStateService.getState();
  if (savedState !== undefined) {
    return savedState;
  } else {
    return newComputerState();
  }
}

function App(props: AppProps): JSX.Element {
  const { systemStateService } = props;

  const [computer, setComputer] = React.useState<ComputerState>(() =>
    initComputerState(systemStateService)
  );

  // Whenever the `computer` state is changed, we send a message to the
  // `systemStateService` to persist the updated state.
  React.useEffect(() => {
    systemStateService.setState(computer);
  }, [computer, systemStateService]);

  const handleFetchInstructionClick = React.useCallback(() => {
    setComputer(fetchInstruction);
  }, []);

  const handleExecuteInstructionClick = React.useCallback(() => {
    setComputer((computer) => {
      // TODO:
      const nextInput = null;

      const [newComputer] = executeInstruction(computer, nextInput);

      return newComputer;
    });
  }, []);

  const handleMemoryCellChange = React.useCallback(
    (address: Address, value: Value | null): void => {
      setComputer(writeMemory(address, value));
    },
    []
  );

  const handleInstructionRegister = React.useCallback((value: Value) => {
    setComputer(setInstructionRegister(value));
  }, []);

  const handleDataRegisterChange = React.useCallback((value: Value) => {
    setComputer(setDataRegister(value));
  }, []);

  const handleProgramCounterChange = React.useCallback((value: Value) => {
    setComputer(setProgramCounter(value));
  }, []);

  return (
    <div className="App-Root">
      <Toolbar
        className="App-Toolbar-Cont"
        onFetchInstructionClick={handleFetchInstructionClick}
        onExecuteInstructionClick={handleExecuteInstructionClick}
      />
      <Computer
        className="App-Computer-Cont"
        computer={computer}
        onMemoryCellChange={handleMemoryCellChange}
        onInstructionRegister={handleInstructionRegister}
        onDataRegisterChange={handleDataRegisterChange}
        onProgramCounterChange={handleProgramCounterChange}
      />
    </div>
  );
}

export default App;
