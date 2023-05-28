/**
 * Data about a SourceFile open in an editor.
 */
export interface SourceFile {
  /**
   * The name of the file open in the editor.
   */
  filename: string;

  /**
   * Additional information about the SourceFile.
   */
  info: SourceFileInfo;
}

/**
 * Additional information about a SourceFile.
 */
export type SourceFileInfo =
  | SourceFileInfo.ValidSourceFile
  | SourceFileInfo.InvalidSourceFile;

export namespace SourceFileInfo {
  /**
   * The SourceFile is a valid Vic file, that may or may not have errors.
   */
  export interface ValidSourceFile {
    kind: "ValidSourceFile";

    /**
     * If there are any parse or compile errors. If so, the file cannot be
     * loaded into the Simulator.
     */
    hasErrors: boolean;
  }

  /**
   * The SourceFile is invalid because it is the wrong Language Mode.
   */
  export interface InvalidSourceFile {
    kind: "InvalidSourceFile";
  }
}
