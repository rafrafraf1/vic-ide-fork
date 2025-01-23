import { assertNever } from "assert-never";
import {
  fileOpen,
  fileSave,
  type FileWithHandle,
  type FirstFileSaveOptions,
} from "browser-fs-access";

import type { Result } from "../common/Functional/Result";

export type VicLanguage = "VIC_ASSEMBLY" | "VIC_BINARY";

export interface LoadedFile {
  fileName: string;
  handle: FileSystemFileHandle | null;
  language: VicLanguage;
  contents: string;
}

export interface LoadedFileError {
  error: ReadTextFileError;
  fileName: string | null;
  fileSize: number | null;
}

export function loadFile(
  cb: (result: Result<LoadedFileError, LoadedFile>) => void,
): void {
  fileOpen().then(
    (file: FileWithHandle): void => {
      const options: ReadTextFileOptions = {
        maxFileSize: 100 * 1024,
      };
      readTextFile(file, options, (result) => {
        switch (result.kind) {
          case "Error":
            cb({
              kind: "Error",
              error: {
                error: result.error,
                fileName: file.name,
                fileSize: file.size,
              },
            });
            break;
          case "Ok": {
            const handle = file.handle !== undefined ? file.handle : null;
            const contents = result.value;
            cb({
              kind: "Ok",
              value: {
                fileName: file.name,
                handle: handle,
                language: detectSourceLanguage(contents),
                contents: contents,
              },
            });
            break;
          }
          default:
            return assertNever(result);
        }
      });
    },
    (err: unknown) => {
      if (err instanceof DOMException && err.name === "AbortError") {
        // The user canceled the system open file dialog.
        return;
      }
      cb({
        kind: "Error",
        error: {
          error: {
            kind: "LoadError",
            error: String(err),
          },
          fileName: null,
          fileSize: null,
        },
      });
    },
  );
}

export function saveExistingFile(
  fileHandle: FileSystemFileHandle,
  contents: string,
  cb: (maybeError: string | null) => void,
): void {
  const blob = new Blob([contents]);
  const options: FirstFileSaveOptions = {};
  fileSave(blob, options, fileHandle).then(
    () => {
      const noError = null;
      cb(noError);
    },
    (err: unknown) => {
      cb(String(err));
    },
  );
}

export function saveFileAs(
  contents: string,
  cb: (handle: FileSystemFileHandle | null, maybeError: string | null) => void,
): void {
  const blob = new Blob([contents]);
  const options: FirstFileSaveOptions = {
    extensions: [".asm"],
    fileName: "vic-program.asm",
  };
  fileSave(blob, options).then(
    (handle) => {
      cb(handle, null);
    },
    (err: unknown) => {
      if (err instanceof DOMException && err.name === "AbortError") {
        // The user canceled the system open file dialog.
        return;
      }
      cb(null, String(err));
    },
  );
}

export type ReadTextFileError =
  | ReadTextFileError.LoadError
  | ReadTextFileError.EmptyFile
  | ReadTextFileError.InvalidBinaryFile
  | ReadTextFileError.FileTooLarge;

export namespace ReadTextFileError {
  export interface LoadError {
    kind: "LoadError";
    error: string;
  }

  export interface EmptyFile {
    kind: "EmptyFile";
  }

  export interface InvalidBinaryFile {
    kind: "InvalidBinaryFile";
  }

  export interface FileTooLarge {
    kind: "FileTooLarge";
    fileSize: number;
    maxFileSize: number;
  }
}

interface ReadTextFileOptions {
  maxFileSize: number;
}

/**
 * Reads the given browser `File` object as a Text file.
 *
 * @param file A File from the browser
 * @param options Configurable options
 * @param cb The callback that will be called with the result
 */
function readTextFile(
  file: File,
  options: ReadTextFileOptions,
  cb: (result: Result<ReadTextFileError, string>) => void,
): void {
  if (file.size === 0) {
    cb({
      kind: "Error",
      error: {
        kind: "EmptyFile",
      },
    });
    return;
  }

  if (file.size > options.maxFileSize) {
    cb({
      kind: "Error",
      error: {
        kind: "FileTooLarge",
        fileSize: file.size,
        maxFileSize: options.maxFileSize,
      },
    });
    return;
  }

  const reader = new FileReader();
  reader.onabort = (): void => {
    cb({
      kind: "Error",
      error: {
        kind: "LoadError",
        error: "FileReader read operation was aborted.",
      },
    });
  };
  reader.onerror = (): void => {
    cb({
      kind: "Error",
      error: {
        kind: "LoadError",
        error: "FileReader read operation failed.",
      },
    });
  };
  reader.onload = (): void => {
    if (reader.result === null || typeof reader.result === "string") {
      cb({
        kind: "Error",
        error: {
          kind: "LoadError",
          error: `FileReader returned unexpected result: ${
            reader.result === null ? "null" : "string"
          }`,
        },
      });
      return;
    }
    if (isBinaryData(reader.result)) {
      cb({
        kind: "Error",
        error: { kind: "InvalidBinaryFile" },
      });
      return;
    }
    const textDecoder = new TextDecoder("utf-8", {
      fatal: true,
    });
    let text: string;
    try {
      text = textDecoder.decode(reader.result);
    } catch {
      cb({
        kind: "Error",
        error: { kind: "InvalidBinaryFile" },
      });
      return;
    }
    cb({
      kind: "Ok",
      value: text,
    });
  };
  reader.readAsArrayBuffer(file);
}

/**
 * Determines if the given data is binary (otherwise it may be text).
 *
 * It simply searches for any zero bytes (null bytes).
 */
function isBinaryData(data: ArrayBuffer): boolean {
  const uint8view = new Uint8Array(data);
  let i = 0;
  while (i < uint8view.length) {
    if (uint8view[i] === 0) {
      return true;
    }
    i++;
  }
  return false;
}

/**
 * Uses a simple heuristic to detect if the input source is a Vic Binary or
 * Vic Assembly program.
 */
function detectSourceLanguage(source: string): VicLanguage {
  if (/^[0-9\s]*$/.test(source)) {
    return "VIC_BINARY";
  } else {
    return "VIC_ASSEMBLY";
  }
}
