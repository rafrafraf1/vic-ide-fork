// This module contains message related types that should only be used during
// debugging and in tests.

/**
 * Debug Messages that the Simulator sends to the VS Code Extension.
 */
export type SimulatorDebugMessage<StateType> =
  SimulatorDebugMessage.RequestStateResponse<StateType>;

export namespace SimulatorDebugMessage {
  /**
   * This is a response that will be sent after a `DebugRequestMessage` is
   * received.
   */
  export interface RequestStateResponse<StateType> {
    kind: "RequestStateResponse";
    state: StateType;
  }
}

/**
 * Debug Messages that the VS Code Extension sends to the Simulator.
 */
export type ExtensionDebugMessage =
  | ExtensionDebugMessage.RequestState
  | ExtensionDebugMessage.SetCpuRegisters;

export namespace ExtensionDebugMessage {
  /**
   * Instruct the Simulator to send back a
   * `SimulatorDebugMessage.RequestStateResponse` message containing the
   * current state of the Simulator.
   */
  export interface RequestState {
    kind: "RequestState";
  }

  /**
   * Instruct the Simulator to set the CPU registers to the given values.
   *
   * If any of the values are `null` then they won't be changed.
   */
  export interface SetCpuRegisters {
    kind: "SetCpuRegisters";
    instructionRegister: number | null;
    dataRegister: number | null;
    programCounter: number | null;
  }
}
