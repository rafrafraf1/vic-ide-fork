/**
 * The location of a span of text within a source file.
 *
 * All values are zero-based.
 */
export interface SrcLoc {
  line: number;
  startCol: number;
  endCol: number;
}
