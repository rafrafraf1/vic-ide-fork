// The VS Code extension and the Simulator Webview communicate using message
// passing.
//
// See:
// <https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-an-extension-to-a-webview>
//
// This module specifies the types of messages that are sent in both
// directions.

import type { SourceFile, SourceFileId } from "./SourceFile";

/**
 * Messages that the Simulator sends to the VS Code Extension.
 */
export type SimulatorMessage<SetState> =
  | SimulatorMessage.SetState<SetState>
  | SimulatorMessage.LoadSourceFile
  | SimulatorMessage.ShowErrors;

export namespace SimulatorMessage {
  /**
   * This is an internal message that shouldn't be used directly.
   */
  export interface SetState<StateType> {
    kind: "SetState";
    state: StateType | undefined;
  }

  /**
   * The user has requested to load the current source file into the
   * simulator. If it is an asm file then it should be assembled and then
   * loaded.
   */
  export interface LoadSourceFile {
    kind: "LoadSourceFile";
    sourceFileId: SourceFileId;
  }

  /**
   * The user has requested to show errors in a source file. The extension
   * should focus the source file and open the VS Code errors panel.
   */
  export interface ShowErrors {
    kind: "ShowErrors";
    sourceFileId: SourceFileId;
  }
}

/**
 * Messages that the VS Code Extension sends to the Simulator.
 */
export type ExtensionMessage =
  | ExtensionMessage.SourceFileChange
  | ExtensionMessage.LoadProgram;

export namespace ExtensionMessage {
  /**
   * The active source file has changed. The Simulator has a button to load
   * the active source file.
   */
  export interface SourceFileChange {
    kind: "SourceFileChange";
    sourceFile: SourceFile;
  }

  /**
   * The Simulator should load the given program into memory. The Simulator
   * should also reset the CPU registers and reset the input and output state
   * appropriately.
   */
  export interface LoadProgram {
    kind: "LoadProgram";
    program: number[];
  }
}
