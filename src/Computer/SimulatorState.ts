import {
  type ComputerState,
  type StopResult,
  newComputerState,
} from "./Computer";
import { type InputState, emptyInput } from "./Input";
import { type OutputState, emptyOutput } from "./Output";
import type { AnimationSpeed } from "../UI/Simulator/AnimationSpeed";

export interface HardwareState {
  computer: ComputerState;
  cpuStopped: StopResult | null;
  input: InputState;
  output: OutputState;
}

export type HelpScreenState = "CLOSED" | "OPEN" | "PINNED";

export interface SimulatorState {
  hardwareState: HardwareState;
  animationSpeed: AnimationSpeed;
  helpScreenState: HelpScreenState;
}

export function newHardwareState(): HardwareState {
  return {
    computer: newComputerState(),
    cpuStopped: null,
    input: emptyInput(),
    output: emptyOutput(),
  };
}

export function newSimulatorState(): SimulatorState {
  return {
    hardwareState: newHardwareState(),
    animationSpeed: "MEDIUM",
    helpScreenState: "CLOSED",
  };
}
