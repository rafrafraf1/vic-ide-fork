import "./FileDialog.css";

import * as React from "react";

import { assertNever } from "assert-never";
import { VscClose } from "react-icons/vsc";

import { Button, ButtonLabel } from "./Components/Button";
import type { ReadTextFileError } from "./Files";
import { Separator } from "./Toolbar";
import type { UIStrings } from "./UIStrings";

export interface FileDialogProps {
  title: string;
  children?: React.ReactNode;

  onCloseClick?: () => void;
}

export const FileDialog = React.memo(
  (props: FileDialogProps): React.JSX.Element => {
    const { title, children, onCloseClick } = props;

    return (
      <div className="FileDialog-Root">
        <div className="FileDialog-Background" onClick={onCloseClick} />
        <div className="FileDialog-Window-Cont">
          <div className="FileDialog-Window">
            <div className="FileDialog-Window-Titlebar">
              <div className="FileDialog-Window-Titlebar-Heading">{title}</div>
              <Button
                className="FileDialog-Window-Titlebar-Button"
                onClick={onCloseClick}
              >
                <ButtonLabel>
                  <VscClose size="24" />
                </ButtonLabel>
              </Button>
            </div>
            <div className="FileDialog-Window-Contents">{children}</div>
          </div>
        </div>
      </div>
    );
  },
);

export interface FileOpenErrorProps {
  error: ReadTextFileError;
  fileName: string | null;
  fileSize: number | null;

  onCloseClick?: () => void;
}

export function FileOpenError(props: FileOpenErrorProps): React.JSX.Element {
  const { error, fileName, fileSize, onCloseClick } = props;

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
    <>
      <div className="FileDialog-ErrorInfoCont">
        <h3>Error Reading File</h3>
        {fileName !== null && fileSize !== null ? (
          <p>
            <strong>
              {fileName} <em>({humanFileSize(fileSize)})</em>
            </strong>
          </p>
        ) : null}
        <p>{errorString}</p>
      </div>
      <div className="FileDialog-ActionButtons-Root">
        <Button onClick={onCloseClick}>
          <ButtonLabel>OK</ButtonLabel>
        </Button>
      </div>
    </>
  );
}

export interface FileSaveErrorProps {
  error: string;
  fileName: string | null;

  onCloseClick?: () => void;
}

export function FileSaveError(props: FileSaveErrorProps): React.JSX.Element {
  const { error, fileName, onCloseClick } = props;

  return (
    <>
      <div className="FileDialog-ErrorInfoCont">
        <h3>Error Saving File</h3>
        {fileName !== null ? (
          <p>
            <strong>{fileName}</strong>
          </p>
        ) : null}
        <p>{error}</p>
        <br />
        <p>
          <strong>
            You may need to enable File Editing permissions in your browser.
          </strong>
        </p>
      </div>
      <div className="FileDialog-ActionButtons-Root">
        <Button onClick={onCloseClick}>
          <ButtonLabel>OK</ButtonLabel>
        </Button>
      </div>
    </>
  );
}

export interface ConfirmDiscardUnsavedFileProps {
  uiString: UIStrings;

  fileName: string;
  onCancelClick?: () => void;
  onContinueClick?: () => void;
}

export function ConfirmDiscardUnsavedFile(
  props: ConfirmDiscardUnsavedFileProps,
): React.JSX.Element {
  const { uiString, fileName, onCancelClick, onContinueClick } = props;

  return (
    <>
      <div className="FileDialog-ErrorInfoCont">
        The file <strong>{fileName}</strong> is not saved!
      </div>
      <div>
        <p>Are you sure you want to continue and discard your changes?</p>
        <div className="FileDialog-ActionButtons-Root">
          <Button onClick={onCancelClick}>
            <ButtonLabel>{uiString("CANCEL")}</ButtonLabel>
          </Button>
          <Separator />
          <Button onClick={onContinueClick}>
            <ButtonLabel>{uiString("CONTINUE")}</ButtonLabel>
          </Button>
        </div>
      </div>
    </>
  );
}

export type VicLanguage = "VIC_ASSEMBLY" | "VIC_BINARY";

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
