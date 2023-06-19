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

export type SourceFileId = string;

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
     * An identifier used only by the extension.
     */
    id: SourceFileId;

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

    /**
     * The language that the source file is in (which will be something other
     * than "Vic").
     */
    languageId: string;
  }
}
