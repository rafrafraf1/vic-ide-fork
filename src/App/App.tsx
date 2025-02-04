import "./App.css";

import * as React from "react";

import type { HardwareState } from "../Computer/SimulatorState";
import type { BrowserStorage } from "../System/BrowserStorage";
import { Computer } from "../UI/Simulator/Computer";
import { Toolbar } from "../UI/Toolbar";
import { EnglishStrings } from "../UI/UIStrings";
import { WindowFrame } from "../UI/WindowFrame";
import { newAppState, type AppState, type CodeEditorState } from "./AppState";
import { useCodeEditor, useCodeEditorState } from "./CodeEditor";
import { useFileManagement } from "./FileManagement";
import { useHelpScreen } from "./HelpScreen";
import { useSimulator } from "./Simulator";

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
  } = useSimulator({
    initialState: initialState.simulatorState,
  });

  const {
    helpScreenState,
    handleHelpClick,
    helpScreenSidebarElem,
    helpScreenWindowElem,
  } = useHelpScreen({
    initialState: initialState.helpScreenState,
  });

  const {
    asmText,
    setAsmText,
    binText,
    setBinText,
    asmBinSynced,
    setAsmBinSynced,
    setEditorCode,
  } = useCodeEditorState({
    initialState: {
      asmText: initialState.codeEditorState.asmText,
      binText: initialState.codeEditorState.binText,
      asmBinSynced: initialState.codeEditorState.asmBinSynced,
    },
  });

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
    initialState: {
      loadedFileName: initialState.codeEditorState.loadedFileName,
      loadedFileHandle: initialState.loadedFileHandle,
      fileSaved: initialState.codeEditorState.fileSaved,
    },
    input: {
      uiString,
      asmText,
      setEditorCode,
    },
  });

  const { codeEditorOpen, handleCodeEditorClick, codeEditorElems } =
    useCodeEditor({
      initialState: {
        open: initialState.codeEditorState.open,
      },
      input: {
        uiString,
        asmText,
        setAsmText,
        binText,
        setBinText,
        asmBinSynced,
        setAsmBinSynced,
        simulationState,
        computer,
        setComputer,
        cpuState,
        setCpuState,
        input,
        setInput,
        output,
        setOutput,
        fileSaved,
        setFileSaved,
        loadedFileName,
        handleOpenFileRequest,
        handleSaveClick,
        handleSaveAsClick,
      },
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
        {codeEditorElems}
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

export default App;
