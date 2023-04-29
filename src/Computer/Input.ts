import type { Value } from "./Value";

/**
 * Stores the values of the input stream, which can be edited by the user.
 */
export interface InputState {
  values: Value[];

  /**
   * An index in the range [0..values.length].
   *
   * If next is equal to values.length then we are at the end of the input and
   * a READ instruction will trigger an error.
   */
  next: number;
}

/**
 * Create a new InputState.
 */
export function emptyInput(): InputState {
  return {
    values: [],
    next: 0,
  };
}

/**
 * Checks whether we are at the end of the input. If so, then a READ
 * instruction will trigger an error.
 */
export function atEndOfInput(input: InputState): boolean {
  return input.next === input.values.length;
}

/**
 * Rewinds the input stream to the beginning. The next READ instruction will
 * read the first value.
 */
export function rewindInput(input: InputState): InputState {
  return {
    values: input.values,
    next: 0,
  };
}

/**
 * @returns the next value in the input stream.
 */
export function readNextInput(input: InputState): Value | null {
  const nextValue = input.values[input.next];
  if (nextValue === undefined) {
    return null;
  }

  return nextValue;
}

/**
 * Advances the input stream by one.
 */
export function consumeInput(input: InputState): InputState {
  return {
    values: input.values,
    next: input.next + 1,
  };
}
