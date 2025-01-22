import "./AppWebview.css";

import * as React from "react";

import { assertNever } from "assert-never";

import { newAppWebviewState, type AppWebviewState } from "./AppWebviewState";
import type { ExtensionMessage } from "./common/Vic/Messages";
import type { ExtensionDebugMessage } from "./common/Vic/MessagesDebug";
import type { SourceFile, SourceFileId } from "./common/Vic/SourceFile";
import type { ComputerState } from "./Computer/Computer";
import { loadProgram } from "./Computer/Program";
import type { HardwareState } from "./Computer/SimulatorState";
import { useHelpScreen } from "./HelpScreen";
import {
  getSampleProgramNames,
  loadSampleProgram,
  lookupSampleProgram,
} from "./SamplePrograms/SampleProgram";
import { useSimulator, type SimulatorOptions } from "./Simulator";
import type { ExtensionBridge } from "./System/ExtensionBridge";
import { ComputerFrame } from "./UI/ComputerFrame";
import { HelpScreen, HelpSidebar } from "./UI/HelpScreen";
import { useWindowMessages } from "./UI/ReactHooks/UseWindowMessages";
import { Computer } from "./UI/Simulator/Computer";
import { simulationActive } from "./UI/Simulator/SimulationState";
import { Toolbar } from "./UI/Toolbar";
import { EnglishStrings } from "./UI/UIStrings";

export interface AppProps {
  extensionBridge: ExtensionBridge<AppWebviewState>;
}

/**
 * Initializes an initial state, by either loading a saved state from the
 * ExtensionBridge, or if there is no saved state, creating a new empty state.
 */
function initAppWebviewState(
  extensionBridge: ExtensionBridge<AppWebviewState>,
): AppWebviewState {
  const savedState = extensionBridge.getState();
  if (savedState !== null) {
    return savedState;
  } else {
    return newAppWebviewState();
  }
}

function AppWebview(props: AppProps): React.JSX.Element {
  const { extensionBridge } = props;

  const uiString = EnglishStrings;

  const initialState = React.useMemo(
    () => initAppWebviewState(extensionBridge),
    [extensionBridge],
  );

  const simulatorOptions: SimulatorOptions = {
    initialState: initialState.simulatorState,
  };
  const {
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
    isResetEnabled,
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
  } = useSimulator(simulatorOptions);

  const {
    helpScreenState,
    handleHelpClick,
    handleHelpScreenCloseClick,
    handleHelpScreenPinClick,
    handleHelpScreenUnpinClick,
  } = useHelpScreen(initialState.helpScreenState);

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

  // Whenever any part of the `SimulatorState` changes (`computer`, `input`,
  // `output`, or `animationSpeed`), we send a message to the
  // `extensionBridge` to persist the updated state.
  React.useEffect(() => {
    extensionBridge.setState({
      simulatorState: {
        hardwareState: hardwareState,
        animationSpeed: animationSpeed,
      },
      helpScreenState: helpScreenState,
    });
  }, [animationSpeed, extensionBridge, hardwareState, helpScreenState]);

  const handleLoadSampleProgram = React.useCallback(
    (name: string): void => {
      const sampleProgram = lookupSampleProgram(name);
      if (sampleProgram !== null) {
        const hardware = loadSampleProgram(sampleProgram);
        setComputer(hardware.computer);
        setCpuState(hardware.cpuState);
        setInput(hardware.input);
        setOutput(hardware.output);
      }
    },
    [setComputer, setCpuState, setInput, setOutput],
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

  const handleDebugMessage = React.useCallback(
    (message: ExtensionDebugMessage): void => {
      switch (message.kind) {
        case "RequestState":
          extensionBridge.postMessage({
            kind: "DebugMessage",
            message: {
              kind: "RequestStateResponse",
              state: {
                simulatorState: {
                  hardwareState: hardwareState,
                  animationSpeed: animationSpeed,
                },
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
      setComputer,
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
    [
      computer,
      cpuState,
      handleDebugMessage,
      input,
      output,
      setComputer,
      setCpuState,
      setInput,
      setOutput,
      simulationState,
    ],
  );

  useWindowMessages(extensionBridge, handleMessage);

  return (
    <div className="AppWebview-Root">
      <Toolbar
        className="AppWebview-Toolbar-Cont"
        uiString={uiString}
        showSamplePrograms={false}
        showThemeSwitcher={false}
        showSourceLoader={true}
        cpuState={cpuState}
        simulationState={simulationState}
        resetEnabled={isResetEnabled}
        sampleProgramNames={getSampleProgramNames()}
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
      <div className="AppWebview-Main">
        <ComputerFrame
          className="AppWebview-ComputerFrame-Cont"
          uiString={uiString}
        >
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
          <div className="AppWebview-HelpSidebar-Cont">
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

export default AppWebview;
