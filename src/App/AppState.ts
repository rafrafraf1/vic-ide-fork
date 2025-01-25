import {
  newSimulatorState,
  type SimulatorState,
} from "../Computer/SimulatorState";
import { BrowserStorage } from "../System/BrowserStorage";
import type { FileHandle } from "../UI/Files";
import { newHelpScreenState, type HelpScreenState } from "./HelpScreen";

export interface AppState {
  simulatorState: SimulatorState;
  helpScreenState: HelpScreenState;
  codeEditorState: CodeEditorState;
  loadedFileHandle: FileHandle | null;
}

export interface CodeEditorState {
  open: boolean;
  asmText: string;
  binText: string;
  asmBinSynced: boolean;
  loadedFileName: string | null;
  fileSaved: boolean;
}

function newCodeEditorState(): CodeEditorState {
  return {
    open: false,
    asmText: "",
    binText: "",
    asmBinSynced: false,
    loadedFileName: null,
    fileSaved: true,
  };
}

export function newAppState(): AppState {
  return {
    simulatorState: newSimulatorState(),
    helpScreenState: newHelpScreenState(),
    codeEditorState: newCodeEditorState(),
    loadedFileHandle: null,
  };
}

const SIMULATOR_KEY: IDBValidKey = "simulator";
const HELP_SCREEN_KEY: IDBValidKey = "help_screen";
const CODE_EDITOR_KEY: IDBValidKey = "code_editor";
const LOADED_FILE_KEY: IDBValidKey = "loaded_file";

const ALL_KEYS: IDBValidKey[] = [
  SIMULATOR_KEY,
  HELP_SCREEN_KEY,
  CODE_EDITOR_KEY,
  LOADED_FILE_KEY,
];

export function serializeAppState(state: AppState): [IDBValidKey, unknown][] {
  return [
    [SIMULATOR_KEY, JSON.stringify(state.simulatorState)],
    [HELP_SCREEN_KEY, JSON.stringify(state.helpScreenState)],
    [CODE_EDITOR_KEY, JSON.stringify(state.codeEditorState)],
    [LOADED_FILE_KEY, state.loadedFileHandle],
  ];
}

export function deserializeAppState(input: unknown[]): AppState | null {
  const simulator = input[0];
  const helpScreen = input[1];
  const codeEditor = input[2];
  const loadedFile = input[3];

  if (typeof simulator !== "string") {
    return null;
  }
  if (typeof helpScreen !== "string") {
    return null;
  }
  if (typeof codeEditor !== "string") {
    return null;
  }
  if (!(loadedFile === null || loadedFile instanceof FileSystemFileHandle)) {
    return null;
  }
  return {
    simulatorState: JSON.parse(simulator) as SimulatorState,
    helpScreenState: JSON.parse(helpScreen) as HelpScreenState,
    codeEditorState: JSON.parse(codeEditor) as CodeEditorState,
    loadedFileHandle: loadedFile,
  };
}

export function getBrowserStorage(): BrowserStorage<AppState> {
  return new BrowserStorage<AppState>(
    ALL_KEYS,
    serializeAppState,
    deserializeAppState,
  );
}
