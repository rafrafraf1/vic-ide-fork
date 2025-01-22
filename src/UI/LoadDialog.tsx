import "./LoadDialog.css";

import * as React from "react";

import { assertNever } from "assert-never";
import classNames from "classnames";
import Dropzone from "react-dropzone";
import { GrDownload } from "react-icons/gr";
import { VscClose } from "react-icons/vsc";

import type { Result } from "../common/Functional/Result";
import { Button, ButtonLabel } from "./Components/Button";
import type { UIStrings } from "./UIStrings";

export interface LoadDialogProps {
  uiString: UIStrings;

  onCloseClick?: () => void;
  onFileLoaded?: (language: VicLanguage, contents: string) => void;
}

export const LoadDialog = React.memo(
  (props: LoadDialogProps): React.JSX.Element => {
    const { uiString, onCloseClick, onFileLoaded } = props;

    return (
      <div className="LoadDialog-Root">
        <div className="LoadDialog-Background" onClick={onCloseClick} />
        <div className="LoadDialog-Window-Cont">
          <div className="LoadDialog-Window">
            <div className="LoadDialog-Window-Titlebar">
              <div className="LoadDialog-Window-Titlebar-Heading">
                {uiString("OPEN_FILE")}
              </div>
              <Button
                className="LoadDialog-Window-Titlebar-Button"
                onClick={onCloseClick}
              >
                <ButtonLabel>
                  <VscClose size="24" />
                </ButtonLabel>
              </Button>
            </div>
            <div className="LoadDialog-Window-Contents">
              <LoadInterface uiString={uiString} onFileLoaded={onFileLoaded} />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

interface LoadInterfaceProps {
  uiString: UIStrings;
  onFileLoaded?: (language: VicLanguage, contents: string) => void;
}

type LoadState = LoadState.Pending | LoadState.ReadFileError;

namespace LoadState {
  export interface Pending {
    kind: "Pending";
  }

  export interface ReadFileError {
    kind: "ReadFileError";
    error: ReadTextFileError;
    fileInfo: FileInfo;
  }
}

interface FileInfo {
  fileName: string;
  fileSize: number;
}

export type VicLanguage = "VIC_ASSEMBLY" | "VIC_BINARY";

const LoadInterface = React.memo(
  (props: LoadInterfaceProps): React.JSX.Element => {
    const { onFileLoaded } = props;

    const [dragHover, setDragHover] = React.useState(false);

    const [loadState, setLoadState] = React.useState<LoadState>({
      kind: "Pending",
    });

    const handleProgram = React.useCallback(
      (text: string): void => {
        const fixedText = text.replaceAll("\r", "");
        if (onFileLoaded !== undefined) {
          onFileLoaded(detectSourceLanguage(fixedText), fixedText);
        }
      },
      [onFileLoaded],
    );

    const handleDrop = React.useCallback(
      (acceptedFiles: File[]): void => {
        setDragHover(false);
        const file = acceptedFiles[0];
        if (file === undefined) {
          return;
        }
        const fileInfo: FileInfo = {
          fileName: file.name,
          fileSize: file.size,
        };

        const options: ReadTextFileOptions = {
          maxFileSize: 100 * 1024,
        };

        readTextFile(file, options, (result) => {
          switch (result.kind) {
            case "Error":
              setLoadState({
                kind: "ReadFileError",
                error: result.error,
                fileInfo: fileInfo,
              });
              break;
            case "Ok":
              handleProgram(result.value);
              break;
            default:
              assertNever(result);
          }
        });
      },
      [handleProgram],
    );

    const handleDragEnter = React.useCallback((): void => {
      setDragHover(true);
    }, []);

    const handleDragLeave = React.useCallback((): void => {
      setDragHover(false);
    }, []);

    return (
      <>
        <Dropzone
          onDrop={handleDrop}
          multiple={false}
          maxFiles={1}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              {...getRootProps({
                className: classNames("LoadDialog-Dropzone", {
                  "LoadDialog-Dropzone-Hover": dragHover,
                }),
              })}
            >
              <input {...getInputProps()} />
              <GrDownload size={48} />
              <p>
                <strong>Choose a file</strong> or drag it here.
              </p>
            </div>
          )}
        </Dropzone>
        {loadState.kind === "ReadFileError" ? (
          <ReadFileInfo
            error={loadState.error}
            fileName={loadState.fileInfo.fileName}
            fileSize={loadState.fileInfo.fileSize}
          />
        ) : null}
      </>
    );
  },
);

interface ReadFileInfoProps {
  error: ReadTextFileError;
  fileName: string;
  fileSize: number;
}

const ReadFileInfo = React.memo(
  (props: ReadFileInfoProps): React.JSX.Element => {
    const { error, fileName, fileSize } = props;

    const errorString = ((): string => {
      switch (error.kind) {
        case "EmptyFile":
          return "The file is empty. Please choose a different file.";
        case "FileTooLarge":
          return `The file is too large. The maximum file size is ${humanFileSize(
            error.maxFileSize,
          )}`;
        case "InvalidBinaryFile":
          return "The file is not a text file. Please choose a different file.";
        case "LoadError":
          return `There was an error loading the file: ${error.error}`;
        default:
          return assertNever(error);
      }
    })();

    return (
      <div className="LoadDialog-ErrorInfoCont">
        <h3>Error Reading File</h3>
        <p>
          <strong>
            {fileName} <em>({humanFileSize(fileSize)})</em>
          </strong>
        </p>
        <p> {errorString}</p>
      </div>
    );
  },
);

type ReadTextFileError =
  | ReadTextFileError.LoadError
  | ReadTextFileError.EmptyFile
  | ReadTextFileError.InvalidBinaryFile
  | ReadTextFileError.FileTooLarge;

namespace ReadTextFileError {
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
 * Converts a size in bytes to a human readable string.
 *
 * Example: "19.29 kB"
 */
function humanFileSize(size: number): string {
  // From: <https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string/20732091#20732091>
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  const unit = ["B", "kB", "MB", "GB", "TB"][i];
  return `${parseFloat((size / 1024 ** i).toFixed(2))} ${unit}`;
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
