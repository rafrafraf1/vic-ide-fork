const ASCII0 = "0".charCodeAt(0);
const ASCII9 = "9".charCodeAt(0);
const ASCII_MINUS = "-".charCodeAt(0);

/**
 * @returns the given string, but stripped of any letters or non-digit
 * characters, such that the returned string is an integer in the range
 * [-999..999]. It may have leading zero characters.
 */
export function sanitizeValue(value: string): string {
  let sanitized = "";

  const negative = value.charCodeAt(0) === ASCII_MINUS;

  for (const char of value) {
    if (char.charCodeAt(0) >= ASCII0 && char.charCodeAt(0) <= ASCII9) {
      sanitized += char;
    }
  }

  sanitized = sanitized.substring(0, 3);

  if (negative) {
    sanitized = `-${sanitized}`;
  }

  return sanitized;
}
