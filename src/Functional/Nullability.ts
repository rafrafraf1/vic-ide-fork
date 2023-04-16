/**
 * Asserts that a value is known to be non-null.
 *
 * If the value is null then an Error is thrown.
 */
export function nonNull<T>(value: T | null): T {
  if (value === null) {
    throw new Error("Expected non-null value");
  }
  return value;
}
