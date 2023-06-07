/**
 * The persisted state of the panel, that is saved/load when needed.
 */
export type AppState = SimulatorState;

// The following interfaces (loosely) match the ones in the file:
// "src/Computer/SimulatorState.ts"

export interface HardwareState {
  computer: ComputerState;
  input: InputState;

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
