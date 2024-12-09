import "./App.css";

import * as React from "react";

import { assertNever } from "assert-never";

import type { ExtensionMessage } from "./common/Vic/Messages";
import type { ExtensionDebugMessage } from "./common/Vic/MessagesDebug";
import type { SourceFile, SourceFileId } from "./common/Vic/SourceFile";
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
import { loadProgram } from "./Computer/Program";
import {
  NUM_ITERATIONS_FOR_REAL_TIME,
  runSimulatorIterations,
} from "./Computer/SimulationUtils";
import {
  initialCpuState,
  newSimulatorState,
  type CpuState,
  type HardwareState,
  type HelpScreenState,
  type SimulatorState,
} from "./Computer/SimulatorState";
import type { Value } from "./Computer/Value";
import { compose } from "./Functional/Compose";
import { nonNull } from "./Functional/Nullability";
import {
  getSampleProgramNames,
  loadSampleProgram,
  lookupSampleProgram,
} from "./SamplePrograms/SampleProgram";
import { IS_DEMO_ENVIRONMENT } from "./System/Environment";
import type { ExtensionBridge } from "./System/ExtensionBridge";
import { ComputerFrame } from "./UI/ComputerFrame";
import { HelpScreen, HelpSidebar } from "./UI/HelpScreen";
import { LoadDialog } from "./UI/LoadDialog";
import { useEvents } from "./UI/ReactHooks/UseEvents";
import { useWindowMessages } from "./UI/ReactHooks/UseWindowMessages";
import { nextInstructionAnimation } from "./UI/Simulator/Animations";
import {
  animationSpeedDuration,
  type AnimationSpeed,
} from "./UI/Simulator/AnimationSpeed";
import { Computer, type ComputerHandle } from "./UI/Simulator/Computer";
import {
  simulationActive,
  type SimulationState,
} from "./UI/Simulator/SimulationState";
import { Toolbar, type ClearOption } from "./UI/Toolbar";
import { EnglishStrings } from "./UI/UIStrings";
import { useAnimate } from "./UI/UseAnimate";

export interface AppProps {
  extensionBridge: ExtensionBridge<SimulatorState>;
}

/**
 * Initializes an initial state, by either loading a saved state from the
 * ExtensionBridge, or if there is no saved state, creating a new empty state.
 */
function initSimulatorState(
  extensionBridge: ExtensionBridge<SimulatorState>,
): SimulatorState {
  const savedState = extensionBridge.getState();
  if (savedState !== null) {
    return savedState;
  } else {
    return newSimulatorState();
  }
}

function App(props: AppProps): React.JSX.Element {
  const { extensionBridge } = props;

  const uiString = EnglishStrings;

  const initialState = React.useMemo(
    () => initSimulatorState(extensionBridge),
    [extensionBridge],
  );

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
  const [loadDialogOpen, setLoadDialogOpen] = React.useState(false);
  const [helpScreenState, setHelpScreenState] = React.useState(
    initialState.helpScreenState,
  );

  const [simulationState, setSimulationState] =
    React.useState<SimulationState>("IDLE");

  const [sourceFile, setSourceFile] = React.useState<SourceFile | null>(null);

  const hardwareState = React.useMemo<HardwareState>(
    () => ({
      computer: computer,
      cpuState: cpuState,
      input: input,
      output: output,
    }),
    [computer, cpuState, input, output],
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

  const handleOpenFile = React.useCallback((): void => {
    setLoadDialogOpen(true);
  }, []);

  const handleLoadSampleProgram = React.useCallback((name: string): void => {
    const sampleProgram = lookupSampleProgram(name);
    if (sampleProgram !== null) {
      const hardware = loadSampleProgram(sampleProgram);
      setComputer(hardware.computer);
      setCpuState(hardware.cpuState);
      setInput(hardware.input);
      setOutput(hardware.output);
    }
  }, []);

  const handleProgramLoaded = React.useCallback(
    (memory: Value[]): void => {
      const hardwareState = loadProgram(
        {
          computer: computer,
          cpuState: cpuState,
          input: input,
          output: output,
        },
        memory,
      );

      setLoadDialogOpen(false);
      setComputer(hardwareState.computer);
      setCpuState(hardwareState.cpuState);
      setInput(hardwareState.input);
      setOutput(hardwareState.output);
    },
    [computer, cpuState, input, output],
  );

  const handleAnimationSpeedChange = React.useCallback(
    (value: AnimationSpeed): void => {
      setAnimationSpeed(value);
    },
    [],
  );

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
  }, [computer, cpuState, input, output, triggerStepComplete]);

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
      shouldRunInstantIterations,
      triggerStepComplete,
    ],
  );

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
  }, []);

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

  const handleClearClick = React.useCallback((option: ClearOption): void => {
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
  }, []);

  const handleHelpClick = React.useCallback((): void => {
    setHelpScreenState(toggleHelpScreenState);
  }, []);

  const handleLoadDialogCloseClick = React.useCallback((): void => {
    setLoadDialogOpen(false);
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

  const handleMemoryCellChange = React.useCallback(
    (address: Address, value: Value | null): void => {
      setComputer(writeMemory(address, value));
    },
    [],
  );

  const handleInstructionRegister = React.useCallback((value: Value): void => {
    setComputer(setInstructionRegister(value));
  }, []);

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
    ],
  );

  const handleMessage = React.useCallback(
    (message: ExtensionMessage): void => {
      switch (message.kind) {
        case "SourceFileChange":
          setSourceFile(message.sourceFile);
          break;
        case "LoadProgram": {
          // TODO Fix the limitation that we can't load a program while the
          // simulation is active. In order for it to work, we need to stop
          // the current animation.
          if (simulationActive(simulationState)) {
            return;
          }

          const hardwareState = loadProgram(
            {
              computer: computer,
              cpuState: cpuState,
              input: input,
              output: output,
            },
            message.program,
          );

          setComputer(hardwareState.computer);
          setCpuState(hardwareState.cpuState);
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
    [computer, cpuState, handleDebugMessage, input, output, simulationState],
  );

  useWindowMessages(extensionBridge, handleMessage);

  return (
    <div className="App-Root">
      <Toolbar
        className="App-Toolbar-Cont"
        uiString={uiString}
        showSamplePrograms={IS_DEMO_ENVIRONMENT}
        showThemeSwitcher={IS_DEMO_ENVIRONMENT}
        showSourceLoader={!IS_DEMO_ENVIRONMENT}
        cpuState={cpuState}
        simulationState={simulationState}
        resetEnabled={isResetEnabled(computer, cpuState, input, output)}
        sampleProgramNames={getSampleProgramNames()}
        onOpenFile={handleOpenFile}
        onLoadSampleProgram={handleLoadSampleProgram}
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
        onClearClick={handleClearClick}
        onHelpClick={handleHelpClick}
      />
      <div className="App-Main">
        <ComputerFrame className="App-ComputerFrame-Cont" uiString={uiString}>
          <Computer
            ref={computerRef}
            uiString={uiString}
            computer={computer}
            input={input}
            output={output}
            onMemoryCellChange={handleMemoryCellChange}
            onInstructionRegister={handleInstructionRegister}
            onInstructionRegisterEnterPressed={
              handleInstructionRegisterEnterPressed
            }
            onDataRegisterChange={handleDataRegisterChange}
            onProgramCounterChange={handleProgramCounterChange}
            onInputChange={handleInputChange}
          />
        </ComputerFrame>
        {helpScreenState === "PINNED" ? (
          <div className="App-HelpSidebar-Cont">
            <HelpSidebar
              onCloseClick={handleHelpScreenCloseClick}
              onUnpinClick={handleHelpScreenUnpinClick}
            />
          </div>
        ) : null}
      </div>
      {loadDialogOpen ? (
        <LoadDialog
          uiString={uiString}
          onCloseClick={handleLoadDialogCloseClick}
          onProgramLoaded={handleProgramLoaded}
        />
      ) : null}
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

function processDebugSetCpuRegisters(
  message: ExtensionDebugMessage.SetCpuRegisters,
  computer: ComputerState,
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
  helpScreenState: HelpScreenState,
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
        `Invalid "InvalidSourceFile" sourceFile: ${JSON.stringify(sourceFile)}`,
      );
    case "ValidSourceFile":
      return sourceFile.info.id;
    default:
      return assertNever(sourceFile.info);
  }
}

export default App;
