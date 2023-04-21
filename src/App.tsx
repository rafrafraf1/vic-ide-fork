import "./App.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import {
  Computer,
  type ComputerHandle,
  type UICell,
} from "./UI/Simulator/Computer";
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
import { assertNever } from "assert-never";
import { nextInstructionAnimation } from "./UI/Simulator/Animations";
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

  const [animating, setAnimating] = React.useState<boolean>(false);

  const computerRef = React.useRef<ComputerHandle>(null);

  // Whenever the `computer` state is changed, we send a message to the
  // `systemStateService` to persist the updated state.
  React.useEffect(() => {
    systemStateService.setState(computer);
  }, [computer, systemStateService]);

  const animate = useAnimate();

  const handleFetchInstructionClick = React.useCallback(() => {
    setAnimating(true);

    nonNull(computerRef.current).scrollIntoView(computer.programCounter);

    const startRect = nonNull(computerRef.current).getBoundingClientRect({
      kind: "MemoryCell",
      address: computer.programCounter,
    });

    const newComputer = fetchInstruction(computer);

    // TODO This animation is a temporary test.

    const endRect = nonNull(computerRef.current).getBoundingClientRect({
      kind: "CpuRegister",
      cpuRegister: "INSTRUCTION_REGISTER",
    });

    animate(
      {
        start: startRect,
        end: endRect,
        duration: 1000,
      },
      () => {
        setComputer(newComputer);
        setAnimating(false);
      }
    );
  }, [animate, computer, computerRef]);

  const handleExecuteInstructionClick = React.useCallback(() => {
    // TODO:
    const nextInput = null;

    const animation = nextInstructionAnimation(computer);
    if (animation === null) {
      // TODO Handle result
      const [newComputer] = executeInstruction(computer, nextInput);
      setComputer(newComputer);
      return;
    }

    function scrollCellIntoView(uiCell: UICell): void {
      switch (uiCell.kind) {
        case "CpuRegister":
          break;
        case "MemoryCell":
          nonNull(computerRef.current).scrollIntoView(uiCell.address);
          break;
        default:
          return assertNever(uiCell);
      }
    }

    scrollCellIntoView(animation.start);
    scrollCellIntoView(animation.end);

    setAnimating(true);

    animate(
      {
        start: nonNull(computerRef.current).getBoundingClientRect(
          animation.start
        ),
        end: nonNull(computerRef.current).getBoundingClientRect(animation.end),
        duration: 1000,
      },
      () => {
        // TODO Handle result
        const [newComputer] = executeInstruction(computer, nextInput);
        setComputer(newComputer);

        setAnimating(false);
      }
    );
  }, [animate, computer]);

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
        animating={animating}
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
