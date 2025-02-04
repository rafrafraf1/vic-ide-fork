import * as React from "react";

import { assertNever } from "assert-never";

import { parseVicBin } from "../common/VicBinParser";
import {
  compileVicProgram,
  prettyVicCompileResult,
} from "../common/VicLangFullCompiler";
import type { ComputerState } from "../Computer/Computer";
import type { InputState } from "../Computer/Input";
import type { OutputState } from "../Computer/Output";
import { loadProgram } from "../Computer/Program";
import type { CpuState } from "../Computer/SimulatorState";
import { getSampleProgramNames } from "../SamplePrograms/SampleProgram";
import {
  CodeEditorPanel,
  type CodeEditorPanelHandle,
  type OpenFileSelection,
} from "../UI/CodeEditor/CodeEditorPanel";
import type { SimulationState } from "../UI/Simulator/SimulationState";
import type { UIStringKey } from "../UI/UIStrings";
import { WindowFrame } from "../UI/WindowFrame";

export interface CodeEditorStateOptions {
  /**
   * This should be set using React.useMemo
   */
  initialState: CodeEditorStateInitialState;
}

export interface CodeEditorStateInitialState {
  asmText: string;
  binText: string;
  asmBinSynced: boolean;
}

export interface CodeEditorStateControls {
  asmText: string;
  setAsmText: React.Dispatch<React.SetStateAction<string>>;

  binText: string;
  setBinText: React.Dispatch<React.SetStateAction<string>>;

  asmBinSynced: boolean;
  setAsmBinSynced: React.Dispatch<React.SetStateAction<boolean>>;

  setEditorCode: (asmText: string, binText: string) => void;
}

export function useCodeEditorState(
  opts: CodeEditorStateOptions,
): CodeEditorStateControls {
  const initialState = opts.initialState;

  const [asmText, setAsmText] = React.useState(initialState.asmText);
  const [binText, setBinText] = React.useState(initialState.binText);

  const [asmBinSynced, setAsmBinSynced] = React.useState(
    initialState.asmBinSynced,
  );

  const setEditorCode = React.useCallback(
    (asmText: string, binText: string): void => {
      setAsmText(asmText);
      setBinText(binText);
      setAsmBinSynced(false);
    },
    [],
  );

  return {
    asmText,
    setAsmText,
    binText,
    setBinText,
    asmBinSynced,
    setAsmBinSynced,
    setEditorCode,
  };
}

export interface CodeEditorControls {
  codeEditorOpen: boolean;
  handleCodeEditorClick: () => void;
  codeEditorElems: React.JSX.Element;
}

export interface CodeEditorInput {
  uiString: (key: UIStringKey) => string;
  asmText: string;
  setAsmText: React.Dispatch<React.SetStateAction<string>>;
  binText: string;
  setBinText: React.Dispatch<React.SetStateAction<string>>;
  asmBinSynced: boolean;
  setAsmBinSynced: React.Dispatch<React.SetStateAction<boolean>>;
  simulationState: SimulationState;
  computer: ComputerState;
  setComputer: React.Dispatch<React.SetStateAction<ComputerState>>;
  cpuState: CpuState;
  setCpuState: React.Dispatch<React.SetStateAction<CpuState>>;
  input: InputState;
  setInput: React.Dispatch<React.SetStateAction<InputState>>;
  output: OutputState;
  setOutput: React.Dispatch<React.SetStateAction<OutputState>>;
  fileSaved: boolean;
  setFileSaved: React.Dispatch<React.SetStateAction<boolean>>;
  loadedFileName: string | null;
  handleOpenFileRequest: (selection: OpenFileSelection) => void;
  handleSaveClick: () => void;
  handleSaveAsClick: () => void;
}

export interface CodeEditorInitialState {
  open: boolean;
}

export interface CodeEditorOptions {
  /**
   * This should be set using React.useMemo
   */
  initialState: CodeEditorInitialState;

  input: CodeEditorInput;
}

export function useCodeEditor(opts: CodeEditorOptions): CodeEditorControls {
  const { initialState } = opts;
  const {
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
  } = opts.input;

  const [codeEditorOpen, setCodeEditorOpen] = React.useState(initialState.open);

  const codeEditorPanelRef = React.useRef<CodeEditorPanelHandle>(null);

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
    [setAsmBinSynced, setAsmText, setFileSaved],
  );

  const handleBinTextChange = React.useCallback(
    (value: string): void => {
      setBinText(value);
      setAsmBinSynced(false);
    },
    [setAsmBinSynced, setBinText],
  );

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
  }, [asmText, setAsmBinSynced, setBinText]);

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

  const codeEditorElems = (
    <>
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
    </>
  );

  return {
    codeEditorOpen,
    handleCodeEditorClick,
    codeEditorElems,
  };
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
