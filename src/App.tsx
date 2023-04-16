import "./App.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import { Computer, type ComputerHandle } from "./UI/Computer";
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
import type { SystemStateService } from "./System/SystemState";
import { Toolbar } from "./UI/Toolbar";
import type { Value } from "./Computer/Value";
import { nonNull } from "./Functional/Nullability";
import { useAnimate } from "./UI/UseAnimate";

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

  const computerRef = React.useRef<ComputerHandle>(null);

  // Whenever the `computer` state is changed, we send a message to the
  // `systemStateService` to persist the updated state.
  React.useEffect(() => {
    systemStateService.setState(computer);
  }, [computer, systemStateService]);

  const animate = useAnimate();

  const handleFetchInstructionClick = React.useCallback(() => {
    const newComputer = fetchInstruction(computer);

    // TODO This animation is a temporary test.

    const startRect = nonNull(computerRef.current).getBoundingClientRect(
      "DATA_REGISTER"
    );
    const endRect = nonNull(computerRef.current).getBoundingClientRect(
      "INSTRUCTION_REGISTER"
    );

    animate(
      {
        start: startRect,
        end: endRect,
        duration: 1000,
      },
      () => {
        setComputer(newComputer);
      }
    );
  }, [animate, computer, computerRef]);

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
        ref={computerRef}
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
