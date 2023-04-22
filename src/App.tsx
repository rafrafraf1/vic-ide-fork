import "./App.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import { Computer, type ComputerHandle } from "./UI/Simulator/Computer";
import { emptyOutput, processExecuteResult } from "./Computer/Output";
import {
  executeInstruction,
  fetchInstruction,
  newComputerState,
  setDataRegister,
  setInstructionRegister,
  setProgramCounter,
  writeMemory,
} from "./Computer/Computer";
import type { Address } from "./Computer/Instruction";
import type { SimulatorState } from "./Computer/SimulatorState";
import type { SystemStateService } from "./System/SystemState";
import { Toolbar } from "./UI/Toolbar";
import type { Value } from "./Computer/Value";
import { nextInstructionAnimation } from "./UI/Simulator/Animations";
import { nonNull } from "./Functional/Nullability";
import { useAnimate } from "./UI/UseAnimate";

export interface AppProps {
  systemStateService: SystemStateService<SimulatorState>;
}

/**
 * Initializes an initial state, by either loading a saved state from the
 * SystemStateService, or if there is no saved state, creating a new empty
 * state.
 */
function initSimulatorState(
  systemStateService: SystemStateService<SimulatorState>
): SimulatorState {
  const savedState = systemStateService.getState();
  if (savedState !== undefined) {
    return savedState;
  } else {
    return {
      computer: newComputerState(),
      output: emptyOutput(),
    };
  }
}

function App(props: AppProps): JSX.Element {
  const { systemStateService } = props;

  const initialState = React.useMemo(
    () => initSimulatorState(systemStateService),
    [systemStateService]
  );

  const [computer, setComputer] = React.useState(initialState.computer);
  const [output, setOutput] = React.useState(initialState.output);

  const [animating, setAnimating] = React.useState<boolean>(false);

  const computerRef = React.useRef<ComputerHandle>(null);

  // Whenever the `computer` or `output` state is changed, we send a message
  // to the `systemStateService` to persist the updated state.
  React.useEffect(() => {
    systemStateService.setState({
      computer: computer,
      output: output,
    });
  }, [computer, output, systemStateService]);

  const animate = useAnimate();

  const handleFetchInstructionClick = React.useCallback(() => {
    setAnimating(true);

    nonNull(computerRef.current).scrollIntoView({
      kind: "MemoryCell",
      address: computer.programCounter,
    });

    const startRect = nonNull(computerRef.current).getBoundingClientRect({
      kind: "MemoryCell",
      address: computer.programCounter,
    });

    const newComputer = fetchInstruction(computer);

    const endRect = nonNull(computerRef.current).getBoundingClientRect({
      kind: "CpuRegister",
      cpuRegister: "INSTRUCTION_REGISTER",
    });

    animate(
      {
        start: startRect,
        end: endRect,
        duration: 1000,
        text: `${newComputer.instructionRegister}`,
        className: "App-CellAnimationCont",
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

    function updateComputer(): void {
      // TODO Handle result
      const [newComputer, executeResult] = executeInstruction(
        computer,
        nextInput
      );
      setComputer(newComputer);
      setOutput(processExecuteResult(executeResult));
    }

    const animation = nextInstructionAnimation(computer, nextInput);
    if (animation === null) {
      updateComputer();
      return;
    }

    nonNull(computerRef.current).scrollIntoView(animation.start);
    nonNull(computerRef.current).scrollIntoView(animation.end);

    setAnimating(true);

    animate(
      {
        start: nonNull(computerRef.current).getBoundingClientRect(
          animation.start
        ),
        end: nonNull(computerRef.current).getBoundingClientRect(animation.end),
        duration: 1000,
        text: `${animation.value}`,
        className: "App-CellAnimationCont",
      },
      () => {
        updateComputer();
        setAnimating(false);
      }
    );
  }, [animate, computer]);

  const handleClearOutputClick = React.useCallback(() => {
    setOutput(emptyOutput());
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
        animating={animating}
        onFetchInstructionClick={handleFetchInstructionClick}
        onExecuteInstructionClick={handleExecuteInstructionClick}
      />
      <Computer
        ref={computerRef}
        className="App-Computer-Cont"
        computer={computer}
        output={output}
        onClearOutputClick={handleClearOutputClick}
        onMemoryCellChange={handleMemoryCellChange}
        onInstructionRegister={handleInstructionRegister}
        onDataRegisterChange={handleDataRegisterChange}
        onProgramCounterChange={handleProgramCounterChange}
      />
    </div>
  );
}

export default App;
