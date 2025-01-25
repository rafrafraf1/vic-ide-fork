import "./App.css";

import * as React from "react";

import { assertNever } from "assert-never";

import { parseVicBin } from "../common/VicBinParser";
import {
  compileVicProgram,
  prettyVicCompileResult,
} from "../common/VicLangFullCompiler";
import { loadProgram } from "../Computer/Program";
import type { HardwareState } from "../Computer/SimulatorState";
import { getSampleProgramNames } from "../SamplePrograms/SampleProgram";
import type { BrowserStorage } from "../System/BrowserStorage";
import {
  CodeEditorPanel,
  type CodeEditorPanelHandle,
} from "../UI/CodeEditor/CodeEditorPanel";
import { Computer } from "../UI/Simulator/Computer";
import { Toolbar } from "../UI/Toolbar";
import { EnglishStrings } from "../UI/UIStrings";
import { WindowFrame } from "../UI/WindowFrame";
import { newAppState, type AppState, type CodeEditorState } from "./AppState";
import { useFileManagement } from "./FileManagement";
import { useHelpScreen } from "./HelpScreen";
import { useSimulator, type SimulatorOptions } from "./Simulator";

export interface AppProps {
  browserStorage?: BrowserStorage<AppState>;
  savedState: AppState | null;
}

/**
 * Initializes an initial state, by either loading a saved state from the
 * BrowserStorage, or if there is no saved state, creating a new empty state.
 */
function initAppWebviewState(savedState: AppState | null): AppState {
  if (savedState !== null) {
    return savedState;
  } else {
    return newAppState();
  }
}

function App(props: AppProps): React.JSX.Element {
  const { browserStorage, savedState } = props;

  const uiString = EnglishStrings;

  const initialState = React.useMemo(
    () => initAppWebviewState(savedState),
    [savedState],
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
    helpScreenSidebarElem,
    helpScreenWindowElem,
  } = useHelpScreen(initialState.helpScreenState);

  const [codeEditorOpen, setCodeEditorOpen] = React.useState(
    initialState.codeEditorState.open,
  );

  const [asmText, setAsmText] = React.useState(
    initialState.codeEditorState.asmText,
  );
  const [binText, setBinText] = React.useState(
    initialState.codeEditorState.binText,
  );

  const [asmBinSynced, setAsmBinSynced] = React.useState(
    initialState.codeEditorState.asmBinSynced,
  );

  const codeEditorPanelRef = React.useRef<CodeEditorPanelHandle>(null);

  const setEditorCode = React.useCallback(
    (asmText: string, binText: string): void => {
      setAsmText(asmText);
      setBinText(binText);
      setAsmBinSynced(false);
    },
    [],
  );

  const {
    loadedFileName,
    fileSaved,
    loadedFileHandleRef,
    handleOpenFileRequest,
    handleSaveClick,
    handleSaveAsClick,
    setFileSaved,
    fileDialogElems,
  } = useFileManagement({
    uiString,
    initialLoadedFileName: initialState.codeEditorState.loadedFileName,
    initialLoadedFileHandle: initialState.loadedFileHandle,
    initialFileSaved: initialState.codeEditorState.fileSaved,
    asmText,
    setEditorCode,
  });

  const hardwareState = React.useMemo<HardwareState>(
    () => ({
      computer: computer,
      cpuState: cpuState,
      input: input,
      output: output,
    }),
    [computer, cpuState, input, output],
  );

  const codeEditorState = React.useMemo<CodeEditorState>(
    () => ({
      open: codeEditorOpen,
      asmText: asmText,
      binText: binText,
      asmBinSynced: asmBinSynced,
      loadedFileName: loadedFileName,
      fileSaved: fileSaved,
    }),
    [asmBinSynced, asmText, binText, codeEditorOpen, fileSaved, loadedFileName],
  );

  // Whenever any part of the `AppState` changes, we send a message to the
  // `browserStorage` to persist the updated state.
  React.useEffect(() => {
    if (browserStorage !== undefined) {
      browserStorage.setState({
        simulatorState: {
          hardwareState: hardwareState,
          animationSpeed: animationSpeed,
        },
        helpScreenState: helpScreenState,
        codeEditorState: codeEditorState,
        loadedFileHandle: loadedFileHandleRef.current,
      });
    }
  }, [
    animationSpeed,
    browserStorage,
    codeEditorState,
    hardwareState,
    helpScreenState,
    loadedFileHandleRef,
  ]);

  const handleCodeEditorClick = React.useCallback((): void => {
    setCodeEditorOpen((open: boolean): boolean => !open);
  }, []);

  const handleCodeEditorClose = React.useCallback((): void => {
    setCodeEditorOpen(false);
  }, []);

  const handleAsmTextChange = React.useCallback(
    (value: string): void => {
      setAsmText(value);
      setAsmBinSynced(false);
      setFileSaved(false);
    },
    [setFileSaved],
  );

  const handleBinTextChange = React.useCallback((value: string): void => {
    setBinText(value);
    setAsmBinSynced(false);
  }, []);

  const handleCompileClick = React.useCallback((): void => {
    const binSource = compileAsmToBinary(asmText);
    if (binSource === null) {
      if (codeEditorPanelRef.current !== null) {
        codeEditorPanelRef.current.pulseAsmEditor("ERROR");
      }
    } else {
      setBinText(binSource);
      setAsmBinSynced(true);
      if (codeEditorPanelRef.current !== null) {
        codeEditorPanelRef.current.pulseBinEditor("SUCCESS");
      }
    }
  }, [asmText]);

  const handleLoadClick = React.useCallback((): void => {
    const result = parseVicBin(binText);
    switch (result.kind) {
      case "Error":
        if (codeEditorPanelRef.current !== null) {
          codeEditorPanelRef.current.pulseBinEditor("ERROR");
        }
        break;
      case "Ok": {
        const memory = result.value;
        const hardwareState = loadProgram(
          {
            computer: computer,
            cpuState: cpuState,
            input: input,
            output: output,
          },
          memory,
        );

        setComputer(hardwareState.computer);
        setCpuState(hardwareState.cpuState);
        setInput(hardwareState.input);
        setOutput(hardwareState.output);
        break;
      }
      default:
        return assertNever(result);
    }
  }, [
    binText,
    computer,
    cpuState,
    input,
    output,
    setComputer,
    setCpuState,
    setInput,
    setOutput,
  ]);

  const sampleProgramNames = React.useMemo<string[]>(
    () => getSampleProgramNames(),
    [],
  );

  return (
    <div className="App-Root">
      <Toolbar
        className="App-Toolbar-Cont"
        uiString={uiString}
        showCodeEditor={true}
        showThemeSwitcher={true}
        showSourceLoader={false}
        cpuState={cpuState}
        simulationState={simulationState}
        resetEnabled={isResetEnabled}
        onCodeEditorClick={handleCodeEditorClick}
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
        {codeEditorOpen ? (
          <WindowFrame
            className="App-CodeEditor"
            title={uiString("CODE_EDITOR")}
            showCloseButton={true}
            onCloseClick={handleCodeEditorClose}
          >
            <CodeEditorPanel
              ref={codeEditorPanelRef}
              uiString={uiString}
              simulationState={simulationState}
              sampleProgramNames={sampleProgramNames}
              fileName={loadedFileName}
              fileSaved={fileSaved}
              onOpenFileRequest={handleOpenFileRequest}
              onSaveClick={handleSaveClick}
              onSaveAsClick={handleSaveAsClick}
              asmText={asmText}
              binText={binText}
              asmBinSynced={asmBinSynced}
              onAsmTextChange={handleAsmTextChange}
              onBinTextChange={handleBinTextChange}
              onCompileClick={handleCompileClick}
              onLoadClick={handleLoadClick}
            />
          </WindowFrame>
        ) : null}
        <WindowFrame
          className="App-Computer-WindowFrame"
          title={uiString("THE_VISUAL_COMPUTER")}
        >
          <Computer
            className="App-Computer"
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
        </WindowFrame>
        {helpScreenSidebarElem}
      </div>
      {fileDialogElems}
      {helpScreenWindowElem}
    </div>
  );
}

function compileAsmToBinary(source: string): string | null {
  const compileResult = compileVicProgram(source);

  switch (compileResult.program.kind) {
    case "Error":
      return null;
    case "Ok": {
      const output = prettyVicCompileResult(
        compileResult.program.value,
        compileResult.statements,
      );
      let numExtraLines = numLines(source) - numLines(output);
      if (numExtraLines < 0) {
        numExtraLines = 0;
      }
      return output + "\n".repeat(numExtraLines);
    }
    default:
      return assertNever(compileResult.program);
  }
}

function numLines(str: string): number {
  const m = str.match(/\n/g);
  if (m === null) {
    return 0;
  }
  return m.length;
}

export default App;
