import {
  newHardwareState,
  type HardwareState,
} from "../Computer/SimulatorState";
import type { Value } from "../Computer/Value";
import { samplePrograms } from "./SamplePrograms";

/**
 * A built-in sample program that can be loaded and may be helpful during
 * development.
 */
export interface SampleProgram {
  name: string;
  memory: (Value | null)[];
  input: Value[];
}

/**
 * Get the list of all available sample programs.
 */
export function getSampleProgramNames(): string[] {
  return samplePrograms.map((x) => x.name);
}

/**
 * @returns the full contents of the given SampleProgram.
 */
export function lookupSampleProgram(name: string): SampleProgram | null {
  for (const sampleProgram of samplePrograms) {
    if (sampleProgram.name === name) {
      return sampleProgram;
    }
  }

  return null;
}

/**
 * Loads the given SampleProgram into a new HardwareState.
 */
export function loadSampleProgram(sampleProgram: SampleProgram): HardwareState {
  const hardware = newHardwareState();

  // For ease of implementation, this code uses mutation. Because we have just
  // created the "hardware" and it is "private" to us, this is safe.

  // Set the input:
  hardware.input.values = sampleProgram.input;

  // Set the main memory:
  for (let i = 0; i < sampleProgram.memory.length; i++) {
    const val = sampleProgram.memory[i];
    if (typeof val === "number") {
      hardware.computer.memory[i] = val;
    }
  }

  return hardware;
}
