/**
 * The persisted state of the panel, that is saved/load when needed.
 */
export type AppState = AppWebviewState;

// This interface (loosely) matches the one in the file:
// "src/AppWebviewState.ts"

export interface AppWebviewState {
  simulatorState: SimulatorState;

  // `helpScreenState` field omitted.
}

// The following interfaces (loosely) match the ones in the file:
// "src/Computer/SimulatorState.ts"

export interface HardwareState {
  computer: ComputerState;
  input: InputState;

  // `cpuState` field omitted.
  // `output` field omitted.
}

export interface SimulatorState {
  hardwareState: HardwareState;

  // `animationSpeed` field omitted.
}

export interface ComputerState {
  instructionRegister: number;
  dataRegister: number;
  programCounter: number;
  memory: number[];
}

export interface InputState {
  values: number[];
  next: number;
}
