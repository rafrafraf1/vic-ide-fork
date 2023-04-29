import { type ComputerState, newComputerState } from "./Computer";
import { type InputState, emptyInput } from "./Input";
import { type OutputState, emptyOutput } from "./Output";
import type { AnimationSpeed } from "../UI/Simulator/AnimationSpeed";

export interface SimulatorState {
  computer: ComputerState;
  input: InputState;
  output: OutputState;
  animationSpeed: AnimationSpeed;
}

export function newSimulatorState(): SimulatorState {
  return {
    computer: newComputerState(),
    input: emptyInput(),
    output: emptyOutput(),
    animationSpeed: "MEDIUM",
  };
}
