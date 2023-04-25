import { type ComputerState, newComputerState } from "./Computer";
import { type OutputState, emptyOutput } from "./Output";
import type { AnimationSpeed } from "../UI/Simulator/AnimationSpeed";

export interface SimulatorState {
  computer: ComputerState;
  output: OutputState;
  animationSpeed: AnimationSpeed;
}

export function newSimulatorState(): SimulatorState {
  return {
    computer: newComputerState(),
    output: emptyOutput(),
    animationSpeed: "MEDIUM",
  };
}
