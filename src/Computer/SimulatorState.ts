import type { AnimationSpeed } from "../UI/Simulator/AnimationSpeed";
import {
  newComputerState,
  type ComputerState,
  type StopResult,
} from "./Computer";
import { emptyInput, type InputState } from "./Input";
import { emptyOutput, type OutputState } from "./Output";

export interface HardwareState {
  computer: ComputerState;
  cpuState: CpuState;
  input: InputState;
  output: OutputState;
}

export type CpuState =
  | CpuState.PendingFetch
  | CpuState.PendingExecute
  | CpuState.Stopped;

export namespace CpuState {
  export interface PendingFetch {
    kind: "PendingFetch";
  }

  export interface PendingExecute {
    kind: "PendingExecute";
  }

  export interface Stopped {
    kind: "Stopped";
    stopResult: StopResult;
  }
}

export function initialCpuState(): CpuState {
  return { kind: "PendingFetch" };
}

export interface SimulatorState {
  hardwareState: HardwareState;
  animationSpeed: AnimationSpeed;
}

export function newHardwareState(): HardwareState {
  return {
    computer: newComputerState(),
    cpuState: initialCpuState(),
    input: emptyInput(),
    output: emptyOutput(),
  };
}

export function newSimulatorState(): SimulatorState {
  return {
    hardwareState: newHardwareState(),
    animationSpeed: "SLOW",
  };
}
