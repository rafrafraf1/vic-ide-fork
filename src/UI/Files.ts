import { assertNever } from "assert-never";

import type { Result } from "../common/Functional/Result";

export type VicLanguage = "VIC_ASSEMBLY" | "VIC_BINARY";

export type FileHandle = FileSystemFileHandle & FileSystemHandle;

export interface LoadedFile {
  fileName: string;
  handle: FileHandle | null;
  language: VicLanguage;
  contents: string;
}

export interface LoadedFileError {
  error: ReadTextFileError;
  fileName: string | null;
  fileSize: number | null;
}

const FILE_SYSTEM_ACCESS_API = "showOpenFilePicker" in self;

export function loadFile(
  cb: (result: Result<LoadedFileError, LoadedFile>) => void,
): void {
  if (FILE_SYSTEM_ACCESS_API) {
    loadFile_FileSystemAccessApi(cb);
  } else {
    loadFile_Legacy(cb);
  }
}

function loadFile_FileSystemAccessApi(
  cb: (result: Result<LoadedFileError, LoadedFile>) => void,
): void {
  showOpenFilePicker().then(
    ([handle]) => {
      handle.getFile().then(
        (file) => {
          processFile(file, handle, cb);
        },
        (err: unknown) => {
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

function loadFile_Legacy(
  cb: (result: Result<LoadedFileError, LoadedFile>) => void,
): void {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = false;
  input.accept = "";
  // Append to the DOM, else Safari on iOS won't fire the `change` event
  // reliably.
  input.style.display = "none";
  document.body.append(input);
  input.addEventListener("change", () => {
    if (input.files === null) {
      cb({
        kind: "Error",
        error: {
          error: {
            kind: "LoadError",
            error: "Unexpected Error: No chosen file detected",
          },
          fileName: null,
          fileSize: null,
        },
      });
      return;
    }
    const file = input.files[0];
    if (file === undefined) {
      cb({
        kind: "Error",
        error: {
          error: {
            kind: "LoadError",
            error: "Unexpected Error: No chosen file detected",
          },
          fileName: null,
          fileSize: null,
        },
      });
      return;
    }
    processFile(file, null, cb);
  });
  if ("showPicker" in HTMLInputElement.prototype) {
    input.showPicker();
  } else {
    input.click();
  }
}

function processFile(
  file: File,
  handle: FileSystemFileHandle | null,
  cb: (result: Result<LoadedFileError, LoadedFile>) => void,
): void {
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
}

export function saveExistingFile(
  handle: FileHandle,
  contents: string,
  cb: (maybeError: string | null) => void,
): void {
  const blob = new Blob([contents]);

  handle.getFile().then(
    () => {
      handle.createWritable().then(
        (writable) => {
          writable.write(blob).then(
            () => {
              writable.close().then(
                () => {
                  cb(null);
                },
                (err: unknown) => {
                  cb(String(err));
                },
              );
            },
            (err: unknown) => {
              cb(String(err));
            },
          );
        },
        (err: unknown) => {
          cb(String(err));
        },
      );
    },
    (err: unknown) => {
      cb(`File doesn't exist: ${String(err)}`);
    },
  );
}

export function saveFileAs(
  contents: string,
  cb: (handle: FileHandle | null, maybeError: string | null) => void,
): void {
  const blob = new Blob([contents]);
  if (FILE_SYSTEM_ACCESS_API) {
    saveFileAs_FileSystemAccessApi(blob, cb);
  } else {
    saveFileAs_Legacy(blob, cb);
  }
}

function saveFileAs_FileSystemAccessApi(
  blob: Blob,
  cb: (handle: FileHandle | null, maybeError: string | null) => void,
): void {
  showSaveFilePicker({
    suggestedName: "vic-program.asm",
  }).then(
    (handle) => {
      handle.createWritable().then(
        (writable) => {
          writable.write(blob).then(
            () => {
              writable.close().then(
                () => {
                  cb(handle, null);
                },
                (err: unknown) => {
                  cb(null, String(err));
                },
              );
            },
            (err: unknown) => {
              cb(null, String(err));
            },
          );
        },
        (err: unknown) => {
          cb(null, String(err));
        },
      );
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

function saveFileAs_Legacy(
  blob: Blob,
  cb: (handle: FileHandle | null, maybeError: string | null) => void,
): void {
  const a = document.createElement("a");
  a.download = "vic-program.asm";
  a.href = URL.createObjectURL(blob);

  a.addEventListener("click", () => {
    // `setTimeout()` due to
    // https://github.com/LLK/scratch-gui/issues/1783#issuecomment-426286393
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
    }, 30 * 1000);
  });
  a.click();
  cb(null, null);
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
