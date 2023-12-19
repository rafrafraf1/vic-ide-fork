import {
  MEMORY_HIGH_START,
  WRITABLE_MEMORY_SIZE,
  writeMemory,
  type ComputerState,
} from "./Computer";

/**
 * Clears all of the memory values in the high memory segment of the computer.
 */
export function clearComputerHighMemory(
  computer: ComputerState,
): ComputerState {
  // This function could be optimized to overwrite the entire slice of the
  // array.

  let newComputer = computer;
  for (let i = MEMORY_HIGH_START; i < WRITABLE_MEMORY_SIZE; i++) {
    newComputer = writeMemory(i, null)(newComputer);
  }

  return newComputer;
}

/**
 * Clears all of the memory values in the low memory segment of the computer.
 */
export function clearComputerLowMemory(computer: ComputerState): ComputerState {
  // This function could be optimized to overwrite the entire slice of the
  // array.

  let newComputer = computer;
  for (let i = 0; i < MEMORY_HIGH_START; i++) {
    newComputer = writeMemory(i, null)(newComputer);
  }

  return newComputer;
}
