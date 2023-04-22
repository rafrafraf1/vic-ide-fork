import type { ComputerState } from "./Computer";
import type { OutputState } from "./Output";

export interface SimulatorState {
  computer: ComputerState;
  output: OutputState;
}
