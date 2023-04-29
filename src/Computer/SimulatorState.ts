import { type ComputerState, newComputerState } from "./Computer";
import { type InputState, emptyInput } from "./Input";
import { type OutputState, emptyOutput } from "./Output";
import type { AnimationSpeed } from "../UI/Simulator/AnimationSpeed";

export interface HardwareState {
  computer: ComputerState;
  input: InputState;
  output: OutputState;
}

export interface SimulatorState {
  hardwareState: HardwareState;
  animationSpeed: AnimationSpeed;
}

export function newHardwareState(): HardwareState {
  return {
    computer: newComputerState(),
    input: emptyInput(),
    output: emptyOutput(),
  };
}

export function newSimulatorState(): SimulatorState {
  return {
    hardwareState: newHardwareState(),
    animationSpeed: "MEDIUM",
  };
}
