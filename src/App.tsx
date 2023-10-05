import "./App.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import {
  type AnimationSpeed,
  animationSpeedDuration,
} from "./UI/Simulator/AnimationSpeed";
import { Computer, type ComputerHandle } from "./UI/Simulator/Computer";
import {
  type ComputerState,
  type StopResult,
  executeInstruction,
  fetchInstruction,
  setDataRegister,
  setInstructionRegister,
  setProgramCounter,
  writeMemory,
} from "./Computer/Computer";
import {
  type HardwareState,
  type HelpScreenState,
  type SimulatorState,
  newSimulatorState,
} from "./Computer/SimulatorState";
import { HelpScreen, HelpSidebar } from "./UI/HelpScreen";
import {
  type InputState,
  atBeginningOfInput,
  consumeInput,
  readNextInput,
  rewindInput,
} from "./Computer/Input";
import {
  type OutputState,
  appendOutput,
  emptyOutput,
  isOutputEmpty,
} from "./Computer/Output";
import {
  type SimulationState,
  simulationActive,
} from "./UI/Simulator/SimulationState";
import type { SourceFile, SourceFileId } from "./common/Vic/SourceFile";
import {
  getExampleProgramNames,
  loadExampleProgram,
  lookupExampleProgram,
} from "./Examples/ExampleProgram";
import type { Address } from "./Computer/Instruction";
import type { CpuState } from "./Computer/CpuState";
import { EnglishStrings } from "./UI/UIStrings";
import type { ExtensionBridge } from "./System/ExtensionBridge";
import type { ExtensionDebugMessage } from "./common/Vic/MessagesDebug";
import type { ExtensionMessage } from "./common/Vic/Messages";
import { IS_DEMO_ENVIRONMENT } from "./System/Environment";
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
    stopped: StopResult | null;
  }
}

function App(props: AppProps): JSX.Element {
  const { extensionBridge } = props;

  const uiString = EnglishStrings;

  const initialState = React.useMemo(
    () => initSimulatorState(extensionBridge),
    [extensionBridge]
  );

  const [computer, setComputer] = React.useState(
    initialState.hardwareState.computer
  );
  const [cpuStopped, setCpuStopped] = React.useState(
    initialState.hardwareState.cpuStopped
  );
  const [input, setInput] = React.useState(initialState.hardwareState.input);
  const [output, setOutput] = React.useState(initialState.hardwareState.output);
  const [animationSpeed, setAnimationSpeed] = React.useState(
    initialState.animationSpeed
  );
  const [helpScreenState, setHelpScreenState] = React.useState(
    initialState.helpScreenState
  );
  const [cpuState, setCpuState] = React.useState<CpuState>("IDLE");

  const [simulationState, setSimulationState] =
    React.useState<SimulationState>("IDLE");

  const [sourceFile, setSourceFile] = React.useState<SourceFile | null>(null);

  const hardwareState = React.useMemo<HardwareState>(
    () => ({
      computer: computer,
      cpuStopped: cpuStopped,
      input: input,
      output: output,
    }),
    [computer, cpuStopped, input, output]
  );

  const triggerStepComplete = useEvents<StepComplete>(
    (step: StepComplete): void => {
      switch (simulationState) {
        case "IDLE":
          // TODO This should never happen (assert)?
          break;
        case "FETCH_INSTRUCTION":
          // TODO assert that "step" is "FetchComplete" (?)
          setCpuState("IDLE");
          setSimulationState("IDLE");
          break;
        case "EXECUTE_INSTRUCTION":
          if (step.kind !== "ExecuteComplete") {
            throw new Error(
              `Expected "step" to be of kind "ExecuteComplete", got: ${step.kind}`
            );
          }
          setCpuStopped(step.stopped);
          setCpuState("IDLE");
          setSimulationState("IDLE");
          break;
        case "SINGLE_STEP":
          switch (step.kind) {
            case "FetchComplete":
              doExecuteInstruction();
              break;
            case "ExecuteComplete":
              setCpuStopped(step.stopped);
              setCpuState("IDLE");
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
              if (step.stopped !== null) {
                setCpuStopped(step.stopped);
                setCpuState("IDLE");
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
          setCpuState("IDLE");
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
      helpScreenState: helpScreenState,
    });
  }, [animationSpeed, extensionBridge, hardwareState, helpScreenState]);

  const animate = useAnimate();

  const handleLoadExample = React.useCallback((example: string): void => {
    const exampleProgram = lookupExampleProgram(example);
    if (exampleProgram !== null) {
      const hardware = loadExampleProgram(exampleProgram);
      setComputer(hardware.computer);
      setCpuStopped(hardware.cpuStopped);
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
    setCpuStopped(null);
    setCpuState("FETCHING");

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
    setCpuStopped(null);
    setCpuState("EXECUTING");

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
      if (executeResult.output !== null) {
        setOutput(appendOutput(executeResult.output));
      }

      triggerStepComplete({
        kind: "ExecuteComplete",
        stopped: executeResult.stop,
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

  const handleLoadSourceFileClick = React.useCallback((): void => {
    extensionBridge.postMessage({
      kind: "LoadSourceFile",
      sourceFileId: getSourceFileId(sourceFile),
    });
  }, [extensionBridge, sourceFile]);

  const handleShowErrorsClick = React.useCallback((): void => {
    extensionBridge.postMessage({
      kind: "ShowErrors",
      sourceFileId: getSourceFileId(sourceFile),
    });
  }, [extensionBridge, sourceFile]);

  const handleFetchInstructionClick = React.useCallback((): void => {
    setSimulationState("FETCH_INSTRUCTION");
    doFetchInstruction();
  }, [doFetchInstruction]);

  const handleExecuteInstructionClick = React.useCallback((): void => {
    setSimulationState("EXECUTE_INSTRUCTION");
    doExecuteInstruction();
  }, [doExecuteInstruction]);

  const handleResetClick = React.useCallback((): void => {
    setComputer(setProgramCounter(0));
    setCpuStopped(null);
    setInput((input) => rewindInput(input));
    setOutput(emptyOutput());
  }, []);

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

  const handleHelpClick = React.useCallback((): void => {
    setHelpScreenState(toggleHelpScreenState);
  }, []);

  const handleHelpScreenCloseClick = React.useCallback((): void => {
    setHelpScreenState("CLOSED");
  }, []);

  const handleHelpScreenPinClick = React.useCallback((): void => {
    setHelpScreenState("PINNED");
  }, []);

  const handleHelpScreenUnpinClick = React.useCallback((): void => {
    setHelpScreenState("OPEN");
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
                helpScreenState: helpScreenState,
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
        case "DoLoadSourceFileClick":
          handleLoadSourceFileClick();
          break;
        case "DoShowErrorsClick":
          handleShowErrorsClick();
          break;
        default:
          assertNever(message);
      }
    },
    [
      animationSpeed,
      computer,
      extensionBridge,
      handleLoadSourceFileClick,
      handleShowErrorsClick,
      hardwareState,
      helpScreenState,
      sourceFile,
    ]
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
              cpuStopped: cpuStopped,
              input: input,
              output: output,
            },
            message.program
          );

          setComputer(hardwareState.computer);
          setCpuStopped(hardwareState.cpuStopped);
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
    [computer, cpuStopped, handleDebugMessage, input, output]
  );

  useWindowMessages(extensionBridge, handleMessage);

  return (
    <div className="App-Root">
      <Toolbar
        className="App-Toolbar-Cont"
        uiString={uiString}
        showExamples={IS_DEMO_ENVIRONMENT}
        showThemeSwitcher={IS_DEMO_ENVIRONMENT}
        showSourceLoader={!IS_DEMO_ENVIRONMENT}
        simulationState={simulationState}
        resetEnabled={isResetEnabled(computer, cpuStopped, input, output)}
        examples={getExampleProgramNames()}
        onLoadExample={handleLoadExample}
        sourceFile={sourceFile}
        onLoadSourceFileClick={handleLoadSourceFileClick}
        onShowErrorsClick={handleShowErrorsClick}
        animationSpeed={animationSpeed}
        onAnimationSpeedChange={handleAnimationSpeedChange}
        onFetchInstructionClick={handleFetchInstructionClick}
        onExecuteInstructionClick={handleExecuteInstructionClick}
        onResetClick={handleResetClick}
        onSingleStepClick={handleSingleStepClick}
        onRunClick={handleRunClick}
        onStopClick={handleStopClick}
        onHelpClick={handleHelpClick}
      />
      <div className="App-Main">
        <Computer
          ref={computerRef}
          className="App-Computer-Cont"
          uiString={uiString}
          animating={simulationActive(simulationState)}
          computer={computer}
          cpuStopped={cpuStopped}
          cpuState={cpuState}
          input={input}
          output={output}
          onClearOutputClick={handleClearOutputClick}
          onMemoryCellChange={handleMemoryCellChange}
          onInstructionRegister={handleInstructionRegister}
          onDataRegisterChange={handleDataRegisterChange}
          onProgramCounterChange={handleProgramCounterChange}
          onInputChange={handleInputChange}
        />
        {helpScreenState === "PINNED" ? (
          <div className="App-HelpSidebar-Cont">
            <HelpSidebar
              onCloseClick={handleHelpScreenCloseClick}
              onUnpinClick={handleHelpScreenUnpinClick}
            />
          </div>
        ) : null}
      </div>
      {helpScreenState === "OPEN" ? (
        <HelpScreen
          onCloseClick={handleHelpScreenCloseClick}
          onPinClick={handleHelpScreenPinClick}
        />
      ) : null}
    </div>
  );
}

function isResetEnabled(
  computer: ComputerState,
  cpuStopped: StopResult | null,
  input: InputState,
  output: OutputState
): boolean {
  return (
    computer.programCounter !== 0 ||
    !atBeginningOfInput(input) ||
    !isOutputEmpty(output) ||
    cpuStopped !== null
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

function toggleHelpScreenState(
  helpScreenState: HelpScreenState
): HelpScreenState {
  switch (helpScreenState) {
    case "CLOSED":
      return "OPEN";
    case "OPEN":
      return "CLOSED";
    case "PINNED":
      return "CLOSED";
    default:
      return assertNever(helpScreenState);
  }
}

function getSourceFileId(sourceFile: SourceFile | null): SourceFileId {
  if (sourceFile === null) {
    throw new Error("Invalid null sourceFile");
  }

  switch (sourceFile.info.kind) {
    case "InvalidSourceFile":
      throw new Error(
        `Invalid "InvalidSourceFile" sourceFile: ${JSON.stringify(sourceFile)}`
      );
    case "ValidSourceFile":
      return sourceFile.info.id;
    default:
      return assertNever(sourceFile.info);
  }
}

export default App;
