import * as React from "react";

import { assertNever } from "assert-never";

import {
  executeInstruction,
  fetchInstruction,
  setDataRegister,
  setInstructionRegister,
  setProgramCounter,
  writeMemory,
  type ComputerState,
} from "./Computer/Computer";
import {
  clearComputerHighMemory,
  clearComputerLowMemory,
} from "./Computer/ComputerUtils";
import {
  atBeginningOfInput,
  consumeInput,
  emptyInput,
  readNextInput,
  rewindInput,
  type InputState,
} from "./Computer/Input";
import type { Address } from "./Computer/Instruction";
import {
  appendOutput,
  emptyOutput,
  isOutputEmpty,
  type OutputState,
} from "./Computer/Output";
import {
  NUM_ITERATIONS_FOR_REAL_TIME,
  runSimulatorIterations,
} from "./Computer/SimulationUtils";
import {
  initialCpuState,
  type CpuState,
  type SimulatorState,
} from "./Computer/SimulatorState";
import type { Value } from "./Computer/Value";
import { compose } from "./Functional/Compose";
import { nonNull } from "./Functional/Nullability";
import { useEvents } from "./UI/ReactHooks/UseEvents";
import { nextInstructionAnimation } from "./UI/Simulator/Animations";
import {
  animationSpeedDuration,
  type AnimationSpeed,
} from "./UI/Simulator/AnimationSpeed";
import type { ComputerHandle } from "./UI/Simulator/Computer";
import {
  simulationActive,
  type SimulationState,
} from "./UI/Simulator/SimulationState";
import type { ClearOption } from "./UI/Toolbar";
import { useAnimate } from "./UI/UseAnimate";

export interface SimulatorOptions {
  /**
   * This should be set using React.useMemo
   */
  initialState: SimulatorState;
}

export interface SimulatorControls {
  computer: ComputerState;
  setComputer: React.Dispatch<React.SetStateAction<ComputerState>>;

  cpuState: CpuState;
  setCpuState: React.Dispatch<React.SetStateAction<CpuState>>;

  input: InputState;
  setInput: React.Dispatch<React.SetStateAction<InputState>>;

  output: OutputState;
  setOutput: React.Dispatch<React.SetStateAction<OutputState>>;

  animationSpeed: AnimationSpeed;

  simulationState: SimulationState;

  isResetEnabled: boolean;

  computerRef: React.RefObject<ComputerHandle>;

  handleAnimationSpeedChange: (value: AnimationSpeed) => void;
  handleFetchInstructionClick: () => void;
  handleExecuteInstructionClick: () => void;
  handleResetClick: () => void;
  handleSingleStepClick: () => void;
  handleRunClick: () => void;
  handleStopClick: () => void;
  handleClearClick: (option: ClearOption) => void;
  handleMemoryCellChange: (address: Address, value: Value | null) => void;
  handleInstructionRegister: (value: Value) => void;
  handleInstructionRegisterEnterPressed: () => void;
  handleDataRegisterChange: (value: Value) => void;
  handleProgramCounterChange: (value: Value) => void;
  handleInputChange: (input: InputState) => void;
}

export function useSimulator(opts: SimulatorOptions): SimulatorControls {
  const initialState = opts.initialState;

  const [computer, setComputer] = React.useState(
    initialState.hardwareState.computer,
  );
  const [cpuState, setCpuState] = React.useState<CpuState>(
    initialState.hardwareState.cpuState,
  );
  const [input, setInput] = React.useState(initialState.hardwareState.input);
  const [output, setOutput] = React.useState(initialState.hardwareState.output);
  const [animationSpeed, setAnimationSpeed] = React.useState(
    initialState.animationSpeed,
  );

  const [simulationState, setSimulationState] =
    React.useState<SimulationState>("IDLE");

  const computerRef = React.useRef<ComputerHandle>(null);

  const animate = useAnimate();

  const triggerStepComplete = useEvents<undefined>((): void => {
    switch (simulationState) {
      case "IDLE":
        // TODO This should never happen (assert)?
        break;
      case "FETCH_INSTRUCTION":
        setSimulationState("IDLE");
        break;
      case "EXECUTE_INSTRUCTION":
        setSimulationState("IDLE");
        break;
      case "SINGLE_STEP":
        switch (cpuState.kind) {
          case "PendingExecute":
            doExecuteInstruction(true);
            break;
          case "PendingFetch":
          case "Stopped":
            setSimulationState("IDLE");
            break;
          default:
            assertNever(cpuState);
        }
        break;
      case "RUN":
        switch (cpuState.kind) {
          case "PendingFetch":
            doFetchInstruction(true);
            break;
          case "PendingExecute":
            doExecuteInstruction(true);
            break;
          case "Stopped":
            setSimulationState("IDLE");
            break;
          default:
            assertNever(cpuState);
        }
        break;
      case "STOPPING":
        switch (cpuState.kind) {
          case "PendingFetch":
            setSimulationState("IDLE");
            break;
          case "PendingExecute":
            doExecuteInstruction(true);
            break;
          case "Stopped":
            setSimulationState("IDLE");
            break;
          default:
            assertNever(cpuState);
        }
        break;
      default:
        assertNever(simulationState);
    }
  });

  const shouldRunInstantIterations =
    simulationState === "RUN" && animationSpeed === "INSTANT";

  const runInstantIterations = React.useCallback((): void => {
    const hardwareState = runSimulatorIterations(
      {
        computer: computer,
        cpuState: cpuState,
        input: input,
        output: output,
      },
      NUM_ITERATIONS_FOR_REAL_TIME,
    );

    setComputer(hardwareState.computer);
    setCpuState(hardwareState.cpuState);
    setInput(hardwareState.input);
    setOutput(hardwareState.output);

    nonNull(computerRef.current).scrollIntoView({
      kind: "MemoryCell",
      address: hardwareState.computer.programCounter,
    });
    nonNull(computerRef.current).scrollIntoView({
      kind: "Input",
    });
    nonNull(computerRef.current).scrollIntoView({
      kind: "Output",
    });

    if (hardwareState.cpuState.kind === "Stopped") {
      setSimulationState("IDLE");
    } else {
      requestAnimationFrame(() => {
        triggerStepComplete(undefined);
      });
    }
  }, [
    computer,
    cpuState,
    input,
    output,
    setComputer,
    setCpuState,
    setInput,
    setOutput,
    triggerStepComplete,
  ]);

  const doFetchInstruction = React.useCallback(
    (animation: boolean): void => {
      if (shouldRunInstantIterations) {
        runInstantIterations();
        return;
      }

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

      function updateComputer(): void {
        setComputer(newComputer);
        setCpuState({
          kind: "PendingExecute",
        });

        triggerStepComplete(undefined);
      }

      if (!animation) {
        updateComputer();
        return;
      }

      animate(
        {
          start: startRect,
          end: endRect,
          duration: animationSpeedDuration(animationSpeed),
          text: `${newComputer.instructionRegister}`,
          className: "App-CellAnimationCont",
        },
        (): void => {
          updateComputer();
        },
      );
    },
    [
      animate,
      animationSpeed,
      computer,
      runInstantIterations,
      setComputer,
      setCpuState,
      shouldRunInstantIterations,
      triggerStepComplete,
    ],
  );

  const doExecuteInstruction = React.useCallback(
    (advanceProgramCounter: boolean): void => {
      if (shouldRunInstantIterations) {
        runInstantIterations();
        return;
      }

      const nextInput = readNextInput(input);

      function updateComputer(): void {
        const [newComputer, executeResult] = executeInstruction(
          computer,
          nextInput,
          advanceProgramCounter,
        );
        setComputer(newComputer);
        setCpuState(
          executeResult.stop !== null
            ? { kind: "Stopped", stopResult: executeResult.stop }
            : { kind: "PendingFetch" },
        );
        if (executeResult.consumedInput) {
          setInput(consumeInput(input));
        }
        if (executeResult.output !== null) {
          setOutput(appendOutput(executeResult.output));
        }

        triggerStepComplete(undefined);
      }

      const animation = nextInstructionAnimation(computer, nextInput);
      if (animation === null) {
        updateComputer();
        return;
      }

      nonNull(computerRef.current).scrollIntoView(animation.start);
      nonNull(computerRef.current).scrollIntoView(animation.end);

      animate(
        {
          start: nonNull(computerRef.current).getBoundingClientRect(
            animation.start,
          ),
          end: nonNull(computerRef.current).getBoundingClientRect(
            animation.end,
          ),
          duration: animationSpeedDuration(animationSpeed),
          text: `${animation.value}`,
          className: "App-CellAnimationCont",
        },
        () => {
          updateComputer();
        },
      );
    },
    [
      animate,
      animationSpeed,
      computer,
      input,
      runInstantIterations,
      setComputer,
      setCpuState,
      setInput,
      setOutput,
      shouldRunInstantIterations,
      triggerStepComplete,
    ],
  );

  const handleAnimationSpeedChange = React.useCallback(
    (value: AnimationSpeed): void => {
      setAnimationSpeed(value);
    },
    [setAnimationSpeed],
  );

  const handleFetchInstructionClick = React.useCallback((): void => {
    setSimulationState("FETCH_INSTRUCTION");
    doFetchInstruction(true);
  }, [doFetchInstruction]);

  const handleExecuteInstructionClick = React.useCallback((): void => {
    setSimulationState("EXECUTE_INSTRUCTION");
    doExecuteInstruction(true);
  }, [doExecuteInstruction]);

  const handleResetClick = React.useCallback((): void => {
    setComputer(
      compose(
        setInstructionRegister(0),
        setDataRegister(0),
        setProgramCounter(0),
      ),
    );
    setCpuState(initialCpuState());
    setInput((input) => rewindInput(input));
    setOutput(emptyOutput());
  }, [setComputer, setCpuState, setInput, setOutput]);

  const handleSingleStepClick = React.useCallback((): void => {
    setSimulationState("SINGLE_STEP");
    doFetchInstruction(false);
  }, [doFetchInstruction]);

  const handleRunClick = React.useCallback((): void => {
    setSimulationState("RUN");
    if (animationSpeed === "INSTANT") {
      runInstantIterations();
      return;
    }
    switch (cpuState.kind) {
      case "PendingFetch":
        doFetchInstruction(true);
        break;
      case "PendingExecute":
        doExecuteInstruction(true);
        break;
      case "Stopped":
        // TODO This should never happen (assert)?
        break;
      default:
        assertNever(cpuState);
    }
  }, [
    animationSpeed,
    cpuState,
    doExecuteInstruction,
    doFetchInstruction,
    runInstantIterations,
  ]);

  const handleStopClick = React.useCallback((): void => {
    setSimulationState("STOPPING");
  }, []);

  const handleClearClick = React.useCallback(
    (option: ClearOption): void => {
      switch (option) {
        case "CLEAR_IO":
          setInput(emptyInput());
          setOutput(emptyOutput());
          break;
        case "CLEAR_HIGH_MEMORY":
          setComputer(clearComputerHighMemory);
          break;
        case "CLEAR_LOW_MEMORY":
          setComputer(clearComputerLowMemory);
          break;
        case "CLEAR_ALL":
          setInput(emptyInput());
          setOutput(emptyOutput());
          setComputer(clearComputerHighMemory);
          setComputer(clearComputerLowMemory);
          break;
        default:
          assertNever(option);
      }
    },
    [setComputer, setInput, setOutput],
  );

  const handleMemoryCellChange = React.useCallback(
    (address: Address, value: Value | null): void => {
      setComputer(writeMemory(address, value));
    },
    [setComputer],
  );

  const handleInstructionRegister = React.useCallback(
    (value: Value): void => {
      setComputer(setInstructionRegister(value));
    },
    [setComputer],
  );

  const triggerExecuteInstructionRegister = useEvents<undefined>((): void => {
    doExecuteInstruction(false);
  });

  const handleInstructionRegisterEnterPressed = React.useCallback((): void => {
    if (simulationActive(simulationState)) {
      return;
    }
    setSimulationState("EXECUTE_INSTRUCTION");
    triggerExecuteInstructionRegister(undefined);
  }, [simulationState, triggerExecuteInstructionRegister]);

  const handleDataRegisterChange = React.useCallback(
    (value: Value): void => {
      setComputer(setDataRegister(value));
    },
    [setComputer],
  );

  const handleProgramCounterChange = React.useCallback(
    (value: Value): void => {
      setComputer(setProgramCounter(value));
    },
    [setComputer],
  );

  const handleInputChange = React.useCallback(
    (input: InputState): void => {
      setInput(input);
    },
    [setInput],
  );

  return {
    computer,
    setComputer,
    cpuState,
    setCpuState,
    input,
    setInput,
    output,
    setOutput,
    animationSpeed,
    simulationState,
    isResetEnabled: getIsResetEnabled(computer, cpuState, input, output),
    computerRef,
    handleAnimationSpeedChange,
    handleFetchInstructionClick,
    handleExecuteInstructionClick,
    handleResetClick,
    handleSingleStepClick,
    handleRunClick,
    handleStopClick,
    handleClearClick,
    handleMemoryCellChange,
    handleInstructionRegister,
    handleInstructionRegisterEnterPressed,
    handleDataRegisterChange,
    handleProgramCounterChange,
    handleInputChange,
  };
}

function getIsResetEnabled(
  computer: ComputerState,
  cpuState: CpuState,
  input: InputState,
  output: OutputState,
): boolean {
  return (
    computer.instructionRegister !== 0 ||
    computer.dataRegister !== 0 ||
    computer.programCounter !== 0 ||
    !atBeginningOfInput(input) ||
    !isOutputEmpty(output) ||
    cpuState.kind !== "PendingFetch"
  );
}
