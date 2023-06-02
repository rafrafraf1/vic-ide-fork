/**
 * A value that can be stored by the Vic computer. Must be in the range [-999..999]
 */
export type Value = number;

export const VALUE_MIN = -999;
export const VALUE_MAX = 999;

/**
 * Asserts that the given value is valid. Should only be used as an extra
 * safety measure in strategic locations in the code.
 *
 * @throws an Error if the given value is not a proper Value.
 */
export function assertValidValue(value: number, message: string): Value {
  if (!Number.isInteger(value) || value < VALUE_MIN || value > VALUE_MAX) {
    throw new Error(`${message}: invalid Value: ${value}`);
  }

  return value;
}
