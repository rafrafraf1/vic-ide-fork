import type { Value } from "./Value";

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

export function appendOutput(
  value: Value,
): (output: OutputState) => OutputState {
  return (output: OutputState) => {
    return {
      values: output.values.concat([value]),
    };
  };
}
