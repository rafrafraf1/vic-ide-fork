import type { Value } from "./Value";

/**
 * If the number of values in the output grows to be too large, then it consumes
 * more and more memory and the simulator can slow down and even crash the
 * browser.
 */
const OUTPUT_BUFFER_SIZE = 999;

/**
 * Stores the values of the output stream.
 */
export interface OutputState {
  values: Value[];
}

export function emptyOutput(): OutputState {
  return {
    values: [],
  };
}

export function isOutputEmpty(output: OutputState): boolean {
  return output.values.length === 0;
}

export function isOutputFull(output: OutputState): boolean {
  return output.values.length >= OUTPUT_BUFFER_SIZE;
}

export function appendOutput(
  value: Value,
): (output: OutputState) => OutputState {
  return (output: OutputState) => {
    return {
      values: output.values.concat([value]),
    };
  };
}
