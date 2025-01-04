/**
 * Splits a string containing source code into lines. The line terminator may be
 * "\n", "\r", or "\r\n".
 */
export function splitSourceLines(source: string): string[] {
  return source.split(/\r?\n|\r|\n/g);
}
