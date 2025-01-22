import "./App.css";

import * as React from "react";

import { loadProgram } from "./Computer/Program";
import { newSimulatorState } from "./Computer/SimulatorState";
import type { Value } from "./Computer/Value";
import { newHelpScreenState, useHelpScreen } from "./HelpScreen";
import {
  getSampleProgramNames,
  loadSampleProgram,
  lookupSampleProgram,
} from "./SamplePrograms/SampleProgram";
import { useSimulator, type SimulatorOptions } from "./Simulator";
import { HelpScreen, HelpSidebar } from "./UI/HelpScreen";
import { LoadDialog } from "./UI/LoadDialog";
import { Computer } from "./UI/Simulator/Computer";
import { Toolbar } from "./UI/Toolbar";
import { EnglishStrings } from "./UI/UIStrings";
import { WindowFrame } from "./UI/WindowFrame";

function App(): React.JSX.Element {
  const uiString = EnglishStrings;

  const initialState = React.useMemo(() => newSimulatorState(), []);

  const simulatorOptions: SimulatorOptions = {
    initialState: initialState,
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
  } = useHelpScreen(newHelpScreenState());

  const [loadDialogOpen, setLoadDialogOpen] = React.useState(false);

  const handleOpenFile = React.useCallback((): void => {
    setLoadDialogOpen(true);
  }, []);

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
    [
      computer,
      cpuState,
      input,
      output,
      setComputer,
      setCpuState,
      setInput,
      setOutput,
    ],
  );

  const handleLoadDialogCloseClick = React.useCallback((): void => {
    setLoadDialogOpen(false);
  }, []);

  return (
    <div className="App-Root">
      <Toolbar
        className="App-Toolbar-Cont"
        uiString={uiString}
        showSamplePrograms={true}
        showThemeSwitcher={true}
        showSourceLoader={false}
        cpuState={cpuState}
        simulationState={simulationState}
        resetEnabled={isResetEnabled}
        sampleProgramNames={getSampleProgramNames()}
        onOpenFile={handleOpenFile}
        onLoadSampleProgram={handleLoadSampleProgram}
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

export default App;
