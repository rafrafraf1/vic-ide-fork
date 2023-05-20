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

/**
 * The position of a single character within a source file.
 *
 * All values are zero-based.
 */
export interface SrcPos {
  line: number;
  column: number;
}

/**
 * @returns true if the given SrcPos is contained within the given SrcLoc.
 */
export function srcPosWithinSrcLoc(srcPos: SrcPos, srcLoc: SrcLoc): boolean {
  if (srcPos.line !== srcLoc.line) {
    return false;
  }

  return srcPos.column >= srcLoc.startCol && srcPos.column <= srcLoc.endCol;
}
