import "./CodeEditorPanel.css";

import * as React from "react";

import Tippy, { useSingleton } from "@tippyjs/react";
import { assertNever } from "assert-never";
import { FaHammer } from "react-icons/fa";
import { PiFolderOpenDuotone } from "react-icons/pi";
import { RiFileTransferLine } from "react-icons/ri";

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

export interface CodeEditorPanelProps {
  uiString: UIStrings;

  simulationState: SimulationState;

  sampleProgramNames: string[];
  onLoadSampleProgram?: (name: string) => void;
  onOpenFile?: () => void;

  asmText: string;
  binText: string;
  asmBinSynced: boolean;

  onAsmTextChange?: (value: string) => void;
  onBinTextChange?: (value: string) => void;

  onCompileClick?: () => void;

  onLoadClick?: () => void;
}

type OpenFileSelection =
  | OpenFileSelection.OpenFile
  | OpenFileSelection.LoadSampleProgram;

namespace OpenFileSelection {
  export interface OpenFile {
    kind: "OpenFile";
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
        onLoadSampleProgram,
        onOpenFile,
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

      return (
        <div className="CodeEditorPanel-Root">
          <CodeEditorToolbar
            uiString={uiString}
            simulationState={simulationState}
            sampleProgramNames={sampleProgramNames}
            onLoadSampleProgram={onLoadSampleProgram}
            onOpenFile={onOpenFile}
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
  onLoadSampleProgram?: (name: string) => void;
  onOpenFile?: () => void;
  onCompileClick?: () => void;
  onLoadProgramClick?: () => void;
}

const CodeEditorToolbar = React.memo(
  (props: CodeEditorToolbarProps): React.JSX.Element => {
    const {
      uiString,
      simulationState,
      sampleProgramNames,
      onLoadSampleProgram,
      onOpenFile,
      onCompileClick,
      onLoadProgramClick,
    } = props;

    const sampleProgramValues = React.useMemo<
      MenuButtonOption<OpenFileSelection>[]
    >(() => {
      const spacer: MenuButtonOption<OpenFileSelection> = {
        value: null,
        label: "",
        className: "Toolbar-MenuButton-Spacer",
      };
      const openFile: MenuButtonOption<OpenFileSelection> = {
        value: { kind: "OpenFile" },
        label: uiString("OPEN_FILE"),
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
      return [spacer, openFile, spacer, loadSampleProgram].concat(
        sampleProgramEntries,
      );
    }, [sampleProgramNames, uiString]);

    const handleOpenFileClick = React.useCallback(
      (value: OpenFileSelection): void => {
        switch (value.kind) {
          case "OpenFile":
            if (onOpenFile !== undefined) {
              onOpenFile();
            }
            break;
          case "LoadSampleProgram":
            if (onLoadSampleProgram !== undefined) {
              onLoadSampleProgram(value.sample);
            }
            break;
          default:
            assertNever(value);
        }
      },
      [onLoadSampleProgram, onOpenFile],
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
        <Separator />
        <Tippy singleton={tippyTarget} content={uiString("ASSEMBLE")}>
          <Button className="Toolbar-Button" onClick={onCompileClick}>
            <ButtonLabel>
              <FaHammer size={20} />
            </ButtonLabel>
          </Button>
        </Tippy>
        <Tippy singleton={tippyTarget} content={uiString("LOAD")}>
          <Button
            className="Toolbar-Button CodeEditorPanel-LoadButton"
            disabled={simulationActive(simulationState)}
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
