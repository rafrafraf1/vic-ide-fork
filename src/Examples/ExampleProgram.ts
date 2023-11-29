import {
  type HardwareState,
  newHardwareState,
} from "../Computer/SimulatorState";
import type { Value } from "../Computer/Value";
import { examplePrograms } from "./Examples";

/**
 * A built-in example program that can be loaded and may be helpful during
 * development.
 */
export interface ExampleProgram {
  name: string;
  memory: (Value | null)[];
  input: Value[];
}

/**
 * Get the list of all available example programs.
 */
export function getExampleProgramNames(): string[] {
  return examplePrograms.map((x) => x.name);
}

/**
 * @returns the full contents of the given ExampleProgram.
 */
export function lookupExampleProgram(name: string): ExampleProgram | null {
  for (const example of examplePrograms) {
    if (example.name === name) {
      return example;
    }
  }

  return null;
}

/**
 * Loads the given ExampleProgram into a new HardwareState.
 */
export function loadExampleProgram(
  exampleProgram: ExampleProgram,
): HardwareState {
  const hardware = newHardwareState();

  // For ease of implementation, this code uses mutation. Because we have just
  // created the "hardware" and it is "private" to us, this is safe.

  // Set the input:
  hardware.input.values = exampleProgram.input;

  // Set the main memory:
  for (let i = 0; i < exampleProgram.memory.length; i++) {
    const val = exampleProgram.memory[i];
    if (typeof val === "number") {
      hardware.computer.memory[i] = val;
    }
  }

  return hardware;
}
