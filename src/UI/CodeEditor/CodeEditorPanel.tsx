import "./CodeEditorPanel.css";

import * as React from "react";

import Tippy, { useSingleton } from "@tippyjs/react";
import { useHotkeys, type Options } from "react-hotkeys-hook";
import { FaHammer } from "react-icons/fa";
import { PiFolderOpenDuotone } from "react-icons/pi";
import { RiFileTransferLine, RiSave3Fill } from "react-icons/ri";
import { VscArrowCircleRight } from "react-icons/vsc";
import { UAParser } from "ua-parser-js";

import { Button, ButtonLabel } from "../Components/Button";
import { MenuButton, type MenuButtonOption } from "../Components/MenuButton";
import {
  simulationActive,
  type SimulationState,
} from "../Simulator/SimulationState";
import { Separator } from "../Toolbar";
import type { UIStrings } from "../UIStrings";
import {
  CodeEditor,
  type CodeEditorHandle,
  type PulseColor,
} from "./CodeEditor";

export interface CodeEditorPanelHandle {
  /**
   * Briefly flashes the background of the assembly code editor with the
   * specified background color.
   *
   * This can be used to indicate to the user that something happened.
   */
  pulseAsmEditor: (pulseColor: PulseColor) => void;

  /**
   * Briefly flashes the background of the binary code editor with the specified
   * background color.
   *
   * This can be used to indicate to the user that something happened.
   */
  pulseBinEditor: (pulseColor: PulseColor) => void;
}

// See: <https://github.com/JohannesKlauss/react-hotkeys-hook/issues/1181>
const IS_MAC_OS = new UAParser().getOS().is("macOS");
const MOD_KEY = IS_MAC_OS ? "meta" : "ctrl";
const MOD_KEY_STRING = IS_MAC_OS ? "\u2318" : "Ctrl";

export interface CodeEditorPanelProps {
  uiString: UIStrings;

  simulationState: SimulationState;

  sampleProgramNames: string[];
  onOpenFileRequest?: (selection: OpenFileSelection) => void;
  onSaveClick?: () => void;
  onSaveAsClick?: () => void;

  fileName: string | null;
  fileSaved: boolean;

  asmText: string;
  binText: string;
  asmBinSynced: boolean;

  onAsmTextChange?: (value: string) => void;
  onBinTextChange?: (value: string) => void;

  onCompileClick?: () => void;

  onLoadClick?: () => void;
}

export type OpenFileSelection =
  | OpenFileSelection.OpenFile
  | OpenFileSelection.CloseFile
  | OpenFileSelection.LoadSampleProgram;

export namespace OpenFileSelection {
  export interface OpenFile {
    kind: "OpenFile";
  }

  export interface CloseFile {
    kind: "CloseFile";
  }

  export interface LoadSampleProgram {
    kind: "LoadSampleProgram";
    sample: string;
  }
}

export const CodeEditorPanel = React.memo(
  React.forwardRef(
    (
      props: CodeEditorPanelProps,
      ref: React.ForwardedRef<CodeEditorPanelHandle>,
    ): React.JSX.Element => {
      const {
        uiString,
        simulationState,
        sampleProgramNames,
        onOpenFileRequest,
        onSaveClick,
        onSaveAsClick,
        fileName,
        fileSaved,
        asmText,
        binText,
        asmBinSynced,
        onAsmTextChange,
        onBinTextChange,
        onCompileClick,
        onLoadClick,
      } = props;

      const codeEditorRef = React.useRef<CodeEditorHandle>(null);

      React.useImperativeHandle(
        ref,
        (): CodeEditorPanelHandle => ({
          pulseAsmEditor: (pulseColor: PulseColor): void => {
            if (codeEditorRef.current !== null) {
              codeEditorRef.current.pulseAsmEditor(pulseColor);
            }
          },
          pulseBinEditor: (pulseColor: PulseColor): void => {
            if (codeEditorRef.current !== null) {
              codeEditorRef.current.pulseBinEditor(pulseColor);
            }
          },
        }),
        [],
      );

      const hotKeyOptions: Options = {
        enableOnFormTags: true,
        enableOnContentEditable: true,
        preventDefault: true,
      };

      useHotkeys(
        `${MOD_KEY}+o`,
        () => {
          if (onOpenFileRequest !== undefined) {
            onOpenFileRequest({
              kind: "OpenFile",
            });
          }
        },
        hotKeyOptions,
        [onOpenFileRequest],
      );

      useHotkeys(
        `${MOD_KEY}+s`,
        () => {
          if (onSaveClick !== undefined && !fileSaved) {
            onSaveClick();
          }
        },
        hotKeyOptions,
        [fileSaved, onSaveClick],
      );

      return (
        <div className="CodeEditorPanel-Root">
          <CodeEditorToolbar
            uiString={uiString}
            simulationState={simulationState}
            sampleProgramNames={sampleProgramNames}
            fileName={fileName}
            fileSaved={fileSaved}
            assembleButtonEnabled={asmText !== ""}
            loadButtonEnabled={binText !== ""}
            onOpenFileRequest={onOpenFileRequest}
            onSaveClick={onSaveClick}
            onSaveAsClick={onSaveAsClick}
            onCompileClick={onCompileClick}
            onLoadProgramClick={onLoadClick}
          />
          <CodeEditor
            ref={codeEditorRef}
            asmValue={asmText}
            binValue={binText}
            asmBinSynced={asmBinSynced}
            onAsmValueChange={onAsmTextChange}
            onBinValueChange={onBinTextChange}
          />
        </div>
      );
    },
  ),
);

interface CodeEditorToolbarProps {
  uiString: UIStrings;
  simulationState: SimulationState;
  sampleProgramNames: string[];
  fileName: string | null;
  fileSaved: boolean;
  assembleButtonEnabled: boolean;
  loadButtonEnabled: boolean;

  onOpenFileRequest?: (selection: OpenFileSelection) => void;
  onSaveClick?: () => void;
  onSaveAsClick?: () => void;
  onCompileClick?: () => void;
  onLoadProgramClick?: () => void;
}

const CodeEditorToolbar = React.memo(
  (props: CodeEditorToolbarProps): React.JSX.Element => {
    const {
      uiString,
      simulationState,
      sampleProgramNames,
      fileName,
      fileSaved,
      assembleButtonEnabled,
      loadButtonEnabled,
      onOpenFileRequest,
      onSaveClick,
      onSaveAsClick,
      onCompileClick,
      onLoadProgramClick,
    } = props;

    const sampleProgramValues = React.useMemo<
      MenuButtonOption<OpenFileSelection>[]
    >(
      () =>
        buildSampleProgramValues(
          uiString,
          sampleProgramNames,
          fileName !== null,
        ),
      [fileName, sampleProgramNames, uiString],
    );

    const handleOpenFileClick = React.useCallback(
      (value: OpenFileSelection): void => {
        if (onOpenFileRequest !== undefined) {
          onOpenFileRequest(value);
        }
      },
      [onOpenFileRequest],
    );

    // Reference: <https://github.com/atomiks/tippyjs-react#-usesingleton>
    const [tippySource, tippyTarget] = useSingleton();

    return (
      <div className="CodeEditorPanel-Toolbar-Root">
        <Tippy singleton={tippySource} placement="bottom" delay={[500, 100]} />

        <MenuButton<OpenFileSelection>
          wrapperElem={(c) => (
            <Tippy
              singleton={tippyTarget}
              content={uiString("LOAD_A_VIC_PROGRAM")}
            >
              {c}
            </Tippy>
          )}
          className="Toolbar-Button Toolbar-IconOnlyMenuButton"
          icon={<PiFolderOpenDuotone size={22} />}
          label=""
          values={sampleProgramValues}
          onValueClick={handleOpenFileClick}
        />
        {fileName !== null ? (
          <Tippy
            singleton={tippyTarget}
            content={`${uiString("SAVE")} (${MOD_KEY_STRING}+s)`}
          >
            <Button
              className="Toolbar-Button"
              onClick={onSaveClick}
              disabled={fileSaved}
            >
              <ButtonLabel>
                <RiSave3Fill size={22} />
                &nbsp;&nbsp;
                {fileName}
              </ButtonLabel>
            </Button>
          </Tippy>
        ) : null}
        <Tippy singleton={tippyTarget} content={uiString("SAVE_AS")}>
          <Button className="Toolbar-Button" onClick={onSaveAsClick}>
            <ButtonLabel>
              <RiSave3Fill size={22} />
              <VscArrowCircleRight size={22} />
            </ButtonLabel>
          </Button>
        </Tippy>
        <Separator />
        <Tippy singleton={tippyTarget} content={uiString("ASSEMBLE")}>
          <Button
            className="Toolbar-Button"
            disabled={!assembleButtonEnabled}
            onClick={onCompileClick}
          >
            <ButtonLabel>
              <FaHammer size={20} />
            </ButtonLabel>
          </Button>
        </Tippy>
        <Tippy singleton={tippyTarget} content={uiString("LOAD")}>
          <Button
            className="Toolbar-Button CodeEditorPanel-LoadButton"
            disabled={!loadButtonEnabled || simulationActive(simulationState)}
            onClick={onLoadProgramClick}
          >
            <ButtonLabel>
              <RiFileTransferLine size={22} />
            </ButtonLabel>
          </Button>
        </Tippy>
      </div>
    );
  },
);

function buildSampleProgramValues(
  uiString: UIStrings,
  sampleProgramNames: string[],
  showCloseFile: boolean,
): MenuButtonOption<OpenFileSelection>[] {
  const spacer: MenuButtonOption<OpenFileSelection> = {
    value: null,
    label: "",
    className: "Toolbar-MenuButton-Spacer",
  };
  const openFile: MenuButtonOption<OpenFileSelection> = {
    value: { kind: "OpenFile" },
    label: `${uiString("OPEN_FILE")} (${MOD_KEY_STRING}+o)`,
  };
  const closeFile: MenuButtonOption<OpenFileSelection> = {
    value: { kind: "CloseFile" },
    label: uiString("CLOSE_FILE"),
  };
  const loadSampleProgram: MenuButtonOption<OpenFileSelection> = {
    value: null,
    label: `\u2500 ${uiString("SAMPLE_PROGRAMS")} \u2500`,
  };
  const sampleProgramEntries = sampleProgramNames.map<
    MenuButtonOption<OpenFileSelection>
  >((e) => ({
    value: { kind: "LoadSampleProgram", sample: e },
    label: e,
  }));
  return [spacer, openFile]
    .concat(showCloseFile ? closeFile : [])
    .concat([spacer, loadSampleProgram])
    .concat(sampleProgramEntries);
}
