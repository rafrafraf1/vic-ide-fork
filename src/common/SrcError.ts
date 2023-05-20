import type { SrcLoc } from "./SrcLoc";

/**
 * An error in a source file, for example a parse error.
 */
export interface SrcError {
  srcLoc: SrcLoc;
  message: string;
}
