import "./App.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import {
  type AnimationSpeed,
  animationSpeedDuration,
} from "./UI/Simulator/AnimationSpeed";
import { Computer, type ComputerHandle } from "./UI/Simulator/Computer";
import {
  type ComputerState,
  executeInstruction,
  fetchInstruction,
  setDataRegister,
  setInstructionRegister,
  setProgramCounter,
  writeMemory,
} from "./Computer/Computer";
import {
  type HardwareState,
  type SimulatorState,
  newSimulatorState,
} from "./Computer/SimulatorState";
import { type InputState, consumeInput, readNextInput } from "./Computer/Input";
import {
  type SimulationState,
  simulationActive,
} from "./UI/Simulator/SimulationState";
import { emptyOutput, processExecuteResult } from "./Computer/Output";
import {
  getExampleProgramNames,
  loadExampleProgram,
  lookupExampleProgram,
} from "./Examples/ExampleProgram";
import type { Address } from "./Computer/Instruction";
import type { ExtensionBridge } from "./System/ExtensionBridge";
import type { ExtensionDebugMessage } from "./common/Vic/MessagesDebug";
import type { ExtensionMessage } from "./common/Vic/Messages";
import type { SourceFile } from "./common/Vic/SourceFile";
import { Toolbar } from "./UI/Toolbar";
import type { Value } from "./Computer/Value";
import { assertNever } from "assert-never";
import { loadProgram } from "./Computer/Program";
import { nextInstructionAnimation } from "./UI/Simulator/Animations";
import { nonNull } from "./Functional/Nullability";
import { useAnimate } from "./UI/UseAnimate";
import { useEvents } from "./UI/ReactHooks/UseEvents";
import { useWindowMessages } from "./UI/ReactHooks/UseWindowMessages";

export interface AppProps {
  extensionBridge: ExtensionBridge<SimulatorState>;
}

/**
 * Initializes an initial state, by either loading a saved state from the
 * ExtensionBridge, or if there is no saved state, creating a new empty state.
 */
function initSimulatorState(
  extensionBridge: ExtensionBridge<SimulatorState>
): SimulatorState {
  const savedState = extensionBridge.getState();
  if (savedState !== null) {
    return savedState;
  } else {
    return newSimulatorState();
  }
}

type StepComplete = StepComplete.FetchComplete | StepComplete.ExecuteComplete;

namespace StepComplete {
  export interface FetchComplete {
    kind: "FetchComplete";
  }

  export interface ExecuteComplete {
    kind: "ExecuteComplete";
    stopped: boolean;
  }
}

function App(props: AppProps): JSX.Element {
  const { extensionBridge } = props;

  const initialState = React.useMemo(
    () => initSimulatorState(extensionBridge),
    [extensionBridge]
  );

  const [computer, setComputer] = React.useState(
    initialState.hardwareState.computer
  );
  const [input, setInput] = React.useState(initialState.hardwareState.input);
  const [output, setOutput] = React.useState(initialState.hardwareState.output);
  const [animationSpeed, setAnimationSpeed] = React.useState(
    initialState.animationSpeed
  );

  const [simulationState, setSimulationState] =
    React.useState<SimulationState>("IDLE");

  const [sourceFile, setSourceFile] = React.useState<SourceFile | null>(null);

  const hardwareState = React.useMemo<HardwareState>(
    () => ({
      computer: computer,
      input: input,
      output: output,
    }),
    [computer, input, output]
  );

  const handleDebugMessage = React.useCallback(
    (message: ExtensionDebugMessage): void => {
      switch (message.kind) {
        case "RequestState":
          extensionBridge.postMessage({
            kind: "DebugMessage",
            message: {
              kind: "RequestStateResponse",
              state: {
                hardwareState: hardwareState,
                animationSpeed: animationSpeed,
              },
            },
          });
          break;
        case "RequestSourceFile":
          extensionBridge.postMessage({
            kind: "DebugMessage",
            message: {
              kind: "RequestSourceFileResponse",
              sourceFile: sourceFile,
            },
          });

          break;
        case "SetCpuRegisters":
          setComputer(processDebugSetCpuRegisters(message, computer));
          break;
        default:
          assertNever(message);
      }
    },
    [animationSpeed, computer, extensionBridge, hardwareState, sourceFile]
  );

  const handleMessage = React.useCallback(
    (message: ExtensionMessage): void => {
      switch (message.kind) {
        case "SourceFileChange":
          setSourceFile(message.sourceFile);
          break;
        case "LoadProgram": {
          const hardwareState = loadProgram(
            {
              computer: computer,
              input: input,
              output: output,
            },
            message.program
          );

          setComputer(hardwareState.computer);
          setInput(hardwareState.input);
          setOutput(hardwareState.output);
          break;
        }
        case "DebugMessage":
          handleDebugMessage(message.message);
          break;
        default:
          assertNever(message);
      }
    },
    [computer, handleDebugMessage, input, output]
  );

  useWindowMessages(extensionBridge, handleMessage);

  const handleLoadSourceFileClick = React.useCallback(() => {
    extensionBridge.postMessage({
      kind: "LoadSourceFile",
      sourceFileId: nonNull(sourceFile).id,
    });
  }, [extensionBridge, sourceFile]);

  const handleShowErrorsClick = React.useCallback(() => {
    extensionBridge.postMessage({
      kind: "ShowErrors",
      sourceFileId: nonNull(sourceFile).id,
    });
  }, [extensionBridge, sourceFile]);

  const triggerStepComplete = useEvents<StepComplete>(
    (step: StepComplete): void => {
      switch (simulationState) {
        case "IDLE":
          // TODO This should never happen (assert)?
          break;
        case "FETCH_INSTRUCTION":
          // TODO assert that "step" is "FetchComplete" (?)
          setSimulationState("IDLE");
          break;
        case "EXECUTE_INSTRUCTION":
          // TODO assert that "step" is "ExecuteComplete" (?)
          setSimulationState("IDLE");
          break;
        case "SINGLE_STEP":
          switch (step.kind) {
            case "FetchComplete":
              doExecuteInstruction();
              break;
            case "ExecuteComplete":
              setSimulationState("IDLE");
              break;
            default:
              assertNever(step);
          }
          break;
        case "RUN":
          switch (step.kind) {
            case "FetchComplete":
              doExecuteInstruction();
              break;
            case "ExecuteComplete":
              if (step.stopped) {
                setSimulationState("IDLE");
              } else {
                doFetchInstruction();
              }
              break;
            default:
              assertNever(step);
          }
          break;
        case "STOPPING":
          setSimulationState("IDLE");
          break;
        default:
          assertNever(simulationState);
      }
    }
  );

  const computerRef = React.useRef<ComputerHandle>(null);

  // Whenever any part of the `SimulatorState` changes (`computer`, `input`,
  // `output`, or `animationSpeed`), we send a message to the
  // `extensionBridge` to persist the updated state.
  React.useEffect(() => {
    extensionBridge.setState({
      hardwareState: hardwareState,
      animationSpeed: animationSpeed,
    });
  }, [animationSpeed, extensionBridge, hardwareState]);

  const animate = useAnimate();

  const handleLoadExample = React.useCallback((example: string): void => {
    const exampleProgram = lookupExampleProgram(example);
    if (exampleProgram !== null) {
      const hardware = loadExampleProgram(exampleProgram);
      setComputer(hardware.computer);
      setInput(hardware.input);
      setOutput(hardware.output);
    }
  }, []);

  const handleAnimationSpeedChange = React.useCallback(
    (value: AnimationSpeed): void => {
      setAnimationSpeed(value);
    },
    []
  );

  const doFetchInstruction = React.useCallback((): void => {
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
        duration: animationSpeedDuration(animationSpeed),
        text: `${newComputer.instructionRegister}`,
        className: "App-CellAnimationCont",
      },
      (): void => {
        setComputer(newComputer);

        triggerStepComplete({
          kind: "FetchComplete",
        });
      }
    );
  }, [animate, animationSpeed, computer, triggerStepComplete]);

  const doExecuteInstruction = React.useCallback((): void => {
    const nextInput = readNextInput(input);

    function updateComputer(): void {
      const [newComputer, executeResult] = executeInstruction(
        computer,
        nextInput
      );
      setComputer(newComputer);
      if (executeResult.consumedInput) {
        setInput(consumeInput(input));
      }
      setOutput(processExecuteResult(executeResult));

      triggerStepComplete({
        kind: "ExecuteComplete",
        stopped: executeResult.stop !== null,
      });
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
          animation.start
        ),
        end: nonNull(computerRef.current).getBoundingClientRect(animation.end),
        duration: animationSpeedDuration(animationSpeed),
        text: `${animation.value}`,
        className: "App-CellAnimationCont",
      },
      () => {
        updateComputer();
      }
    );
  }, [animate, animationSpeed, computer, input, triggerStepComplete]);

  const handleFetchInstructionClick = React.useCallback((): void => {
    setSimulationState("FETCH_INSTRUCTION");
    doFetchInstruction();
  }, [doFetchInstruction]);

  const handleExecuteInstructionClick = React.useCallback((): void => {
    setSimulationState("EXECUTE_INSTRUCTION");
    doExecuteInstruction();
  }, [doExecuteInstruction]);

  const handleSingleStepClick = React.useCallback((): void => {
    setSimulationState("SINGLE_STEP");
    doFetchInstruction();
  }, [doFetchInstruction]);

  const handleRunClick = React.useCallback((): void => {
    setSimulationState("RUN");
    doFetchInstruction();
  }, [doFetchInstruction]);

  const handleStopClick = React.useCallback((): void => {
    setSimulationState("STOPPING");
  }, []);

  const handleClearOutputClick = React.useCallback((): void => {
    setOutput(emptyOutput());
  }, []);

  const handleMemoryCellChange = React.useCallback(
    (address: Address, value: Value | null): void => {
      setComputer(writeMemory(address, value));
    },
    []
  );

  const handleInstructionRegister = React.useCallback((value: Value): void => {
    setComputer(setInstructionRegister(value));
  }, []);

  const handleDataRegisterChange = React.useCallback((value: Value): void => {
    setComputer(setDataRegister(value));
  }, []);

  const handleProgramCounterChange = React.useCallback((value: Value): void => {
    setComputer(setProgramCounter(value));
  }, []);

  const handleInputChange = React.useCallback((input: InputState): void => {
    setInput(input);
  }, []);

  return (
    <div className="App-Root">
      <Toolbar
        className="App-Toolbar-Cont"
        simulationState={simulationState}
        examples={getExampleProgramNames()}
        onLoadExample={handleLoadExample}
        sourceFile={sourceFile}
        onLoadSourceFileClick={handleLoadSourceFileClick}
        onShowErrorsClick={handleShowErrorsClick}
        animationSpeed={animationSpeed}
        onAnimationSpeedChange={handleAnimationSpeedChange}
        onFetchInstructionClick={handleFetchInstructionClick}
        onExecuteInstructionClick={handleExecuteInstructionClick}
        onSingleStepClick={handleSingleStepClick}
        onRunClick={handleRunClick}
        onStopClick={handleStopClick}
      />
      <Computer
        ref={computerRef}
        className="App-Computer-Cont"
        animating={simulationActive(simulationState)}
        computer={computer}
        input={input}
        output={output}
        onClearOutputClick={handleClearOutputClick}
        onMemoryCellChange={handleMemoryCellChange}
        onInstructionRegister={handleInstructionRegister}
        onDataRegisterChange={handleDataRegisterChange}
        onProgramCounterChange={handleProgramCounterChange}
        onInputChange={handleInputChange}
      />
    </div>
  );
}

function processDebugSetCpuRegisters(
  message: ExtensionDebugMessage.SetCpuRegisters,
  computer: ComputerState
): ComputerState {
  return {
    ...computer,
    ...(message.instructionRegister !== null
      ? { instructionRegister: message.instructionRegister }
      : {}),
    ...(message.dataRegister !== null
      ? { dataRegister: message.dataRegister }
      : {}),
    ...(message.programCounter !== null
      ? { programCounter: message.programCounter }
      : {}),
  };
}

export default App;
