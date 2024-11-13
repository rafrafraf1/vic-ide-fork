import "./Toolbar.css";

import * as React from "react";

import Tippy, { useSingleton, type TippyProps } from "@tippyjs/react";
import { assertNever } from "assert-never";
import classNames from "classnames";
import type { IconType } from "react-icons";
import { BsHourglass } from "react-icons/bs";
import { FaFileUpload } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import { PiFolderOpenDuotone } from "react-icons/pi";
import { RiContrastFill, RiRewindMiniFill } from "react-icons/ri";
import {
  VscDebugContinue,
  VscDebugStart,
  VscDebugStop,
  VscQuestion,
  VscTrash,
} from "react-icons/vsc";

import type { SourceFile } from "../common/Vic/SourceFile";
import type { CpuState } from "../Computer/SimulatorState";
import {
  getCurrentTheme,
  nextTheme,
  registerThemeChangeListener,
  setCurrentTheme,
  unregisterThemeChangeListener,
  type DemoTheme,
  type ThemeChangeListener,
} from "../System/DemoTheme";
import { AnimationSpeedSelector } from "./Components/AnimationSpeedSelector";
import { Button, ButtonLabel } from "./Components/Button";
import { MenuButton, type MenuButtonOption } from "./Components/MenuButton";
import type { AnimationSpeed } from "./Simulator/AnimationSpeed";
import {
  simulationActive,
  type SimulationState,
} from "./Simulator/SimulationState";
import type { UIStrings } from "./UIStrings";

interface ToolbarProps {
  className?: string;

  uiString: UIStrings;

  /**
   * Show the button that allows changing themes. This should not be shown
   * when running as a VS Code extension, because it has builtin theme
   * switching functionality.
   */
  showThemeSwitcher: boolean;

  /**
   * Show the button that allows to load sample programs. This is mainly useful
   * in the web demo.
   */
  showSamplePrograms: boolean;

  /**
   * Show source file loader widget. This is useful only in the VS Code
   * extension.
   *
   * (In the future the web demo may be extended to include a text editor, in
   * which case this would be useful in that environment as well.)
   */
  showSourceLoader: boolean;

  cpuState: CpuState;
  simulationState: SimulationState;

  resetEnabled: boolean;

  sampleProgramNames: string[];
  onLoadSampleProgram?: (name: string) => void;
  onOpenFile?: () => void;

  sourceFile: SourceFile | null;
  onLoadSourceFileClick?: () => void;
  onShowErrorsClick?: () => void;

  animationSpeed: AnimationSpeed;
  onAnimationSpeedChange?: (value: AnimationSpeed) => void;

  onFetchInstructionClick?: () => void;
  onExecuteInstructionClick?: () => void;
  onResetClick?: () => void;
  onSingleStepClick?: () => void;
  onRunClick?: () => void;
  onStopClick?: () => void;

  onClearClick?: (option: ClearOption) => void;

  onHelpClick?: () => void;
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

export type ClearOption =
  | "CLEAR_IO"
  | "CLEAR_HIGH_MEMORY"
  | "CLEAR_LOW_MEMORY"
  | "CLEAR_ALL";

export const Toolbar = React.memo(function Toolbar(
  props: ToolbarProps,
): React.JSX.Element {
  const {
    className,
    uiString,
    showThemeSwitcher,
    showSamplePrograms,
    showSourceLoader,
    cpuState,
    simulationState,
    resetEnabled,
    sampleProgramNames,
    onOpenFile,
    onLoadSampleProgram,
    sourceFile,
    onLoadSourceFileClick,
    onShowErrorsClick,
    animationSpeed,
    onAnimationSpeedChange,
    onFetchInstructionClick,
    onExecuteInstructionClick,
    onResetClick,
    onSingleStepClick,
    onRunClick,
    onStopClick,
    onClearClick,
    onHelpClick,
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

  const handleRunClick = React.useCallback((): void => {
    switch (simulationState) {
      case "IDLE":
        if (onRunClick !== undefined) {
          onRunClick();
        }
        break;
      case "FETCH_INSTRUCTION":
        // Nothing
        break;
      case "EXECUTE_INSTRUCTION":
        // Nothing
        break;
      case "SINGLE_STEP":
        // Nothing
        break;
      case "RUN":
        if (onStopClick !== undefined) {
          onStopClick();
        }
        break;
      case "STOPPING":
        // Nothing
        break;
      default:
        assertNever(simulationState);
    }
  }, [onRunClick, onStopClick, simulationState]);

  const handleClearClick = React.useCallback(
    (value: ClearOption): void => {
      if (onClearClick !== undefined) {
        onClearClick(value);
      }
    },
    [onClearClick],
  );

  // Reference: <https://github.com/atomiks/tippyjs-react#-usesingleton>
  const [tippySource, tippyTarget] = useSingleton();

  return (
    <div className={classNames(className, "Toolbar-root")}>
      <Tippy singleton={tippySource} placement="bottom" delay={[500, 100]} />
      {showSamplePrograms ? (
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
          disabled={simulationActive(simulationState)}
          icon={<PiFolderOpenDuotone size={22} />}
          label=""
          values={sampleProgramValues}
          onValueClick={handleOpenFileClick}
        />
      ) : null}
      {showSourceLoader ? (
        <SourceFileLoader
          className="Toolbar-Button"
          uiString={uiString}
          disabled={simulationActive(simulationState)}
          sourceFile={sourceFile}
          onLoadSourceFileClick={onLoadSourceFileClick}
          onShowErrorsClick={onShowErrorsClick}
        />
      ) : null}
      <Separator />
      <RunButton
        className="Toolbar-Button"
        uiString={uiString}
        tippyTarget={tippyTarget}
        cpuState={cpuState}
        simulationState={simulationState}
        onClick={handleRunClick}
      />
      <Tippy singleton={tippyTarget} content={uiString("STEP")}>
        <Button
          className="Toolbar-Button"
          disabled={
            simulationActive(simulationState) ||
            cpuState.kind !== "PendingFetch"
          }
          onClick={onSingleStepClick}
        >
          <ButtonLabel>
            <VscDebugStart />
          </ButtonLabel>
        </Button>
      </Tippy>
      <FetchExecuteButton
        className="Toolbar-Button"
        uiString={uiString}
        tippyTarget={tippyTarget}
        cpuState={cpuState}
        simulationState={simulationState}
        onFetchInstructionClick={onFetchInstructionClick}
        onExecuteInstructionClick={onExecuteInstructionClick}
      />
      <Tippy singleton={tippyTarget} content={uiString("RESET")}>
        <Button
          className="Toolbar-Button"
          disabled={simulationActive(simulationState) || !resetEnabled}
          onClick={onResetClick}
        >
          <ButtonLabel>
            <RiRewindMiniFill size={24} />
          </ButtonLabel>
        </Button>
      </Tippy>
      <Separator />
      <MenuButton<ClearOption>
        className="Toolbar-Button Toolbar-IconOnlyMenuButton"
        icon={<VscTrash size={22} />}
        label={""}
        values={[
          { value: "CLEAR_IO", label: uiString("CLEAR_IO") },
          { value: "CLEAR_HIGH_MEMORY", label: uiString("CLEAR_HIGH_MEMORY") },
          { value: "CLEAR_LOW_MEMORY", label: uiString("CLEAR_LOW_MEMORY") },
          { value: "CLEAR_ALL", label: uiString("CLEAR_ALL") },
        ]}
        disabled={simulationActive(simulationState)}
        onValueClick={handleClearClick}
      />
      <Separator />
      <Tippy singleton={tippyTarget} content={uiString("ANIMATION_SPEED")}>
        <AnimationSpeedSelector
          uiString={uiString}
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={onAnimationSpeedChange}
        />
      </Tippy>
      {showThemeSwitcher ? (
        <>
          <Separator />
          <ThemeSwitcher className="Toolbar-Button" />
        </>
      ) : null}
      <Separator />
      <Button className="Toolbar-Button" onClick={onHelpClick}>
        <ButtonLabel>
          <VscQuestion size={24} />
        </ButtonLabel>
      </Button>
    </div>
  );
});

function Separator(): React.JSX.Element {
  return <div className="Toolbar-Separator" />;
}

interface SourceFileLoaderProps {
  className?: string;
  uiString: UIStrings;
  disabled?: boolean;
  sourceFile: SourceFile | null;
  onLoadSourceFileClick?: () => void;
  onShowErrorsClick?: () => void;
}

function SourceFileLoader(props: SourceFileLoaderProps): React.JSX.Element {
  const {
    className,
    uiString,
    disabled,
    sourceFile,
    onLoadSourceFileClick,
    onShowErrorsClick,
  } = props;

  if (sourceFile === null) {
    return (
      <Tippy
        content={uiString("USE_THE_FILE_EXPLORER_TO_OPEN_A_FILE")}
        placement="bottom"
      >
        <Button className={className} disabled={true}>
          <ButtonLabel>
            <FaFileUpload />
          </ButtonLabel>
          <ButtonLabel>{uiString("NO_FILE_AVAILABLE")}</ButtonLabel>
        </Button>
      </Tippy>
    );
  }

  switch (sourceFile.info.kind) {
    case "InvalidSourceFile":
      return (
        <Tippy
          content={
            <>
              <div>
                {sourceFile.filename} {uiString("FILE_IS_OF_TYPE")}:{" "}
                {sourceFile.info.languageId}
              </div>
              <div>
                {uiString("CHANGE_THE_LANGUAGE_MODE_OF_THE_FILE_TO")} "Vic"
              </div>
            </>
          }
          placement="bottom"
        >
          <Button className={className} disabled={true}>
            <ButtonLabel>
              <FaFileUpload />
            </ButtonLabel>
            <ButtonLabel>
              {uiString("LOAD")} {sourceFile.filename}
            </ButtonLabel>
          </Button>
        </Tippy>
      );

    case "ValidSourceFile": {
      const sourceFileInfo = sourceFile.info;

      const handleLoadClick = (): void => {
        if (sourceFileInfo.hasErrors) {
          if (onShowErrorsClick !== undefined) {
            onShowErrorsClick();
          }
        } else {
          if (onLoadSourceFileClick !== undefined) {
            onLoadSourceFileClick();
          }
        }
      };

      if (!sourceFile.info.hasErrors) {
        return (
          <Tippy
            content={`${uiString("COMPILE")} ${sourceFile.filename} ${uiString(
              "AND_LOAD_IT_INTO_THE_SIMULATOR",
            )}`}
            placement="bottom"
          >
            <Button
              className={className}
              disabled={disabled}
              onClick={handleLoadClick}
            >
              <ButtonLabel>
                <FaFileUpload />
              </ButtonLabel>
              <ButtonLabel>
                {uiString("LOAD")} {sourceFile.filename}
              </ButtonLabel>
            </Button>
          </Tippy>
        );
      } else {
        return (
          <Tippy
            content={
              <>
                <div>
                  {sourceFile.filename}{" "}
                  {uiString("CONTAINS_ERRORS_THAT_MUST_BE_FIXED")}.
                </div>
                <div>{uiString("CLICK_TO_VIEW_THE_ERRORS")}.</div>
              </>
            }
            placement="bottom"
          >
            <Button
              className={className}
              disabled={disabled}
              onClick={handleLoadClick}
            >
              <ButtonLabel>
                <FaFileUpload />
              </ButtonLabel>
              <ButtonLabel>
                {uiString("LOAD")} {sourceFile.filename}
              </ButtonLabel>
              <ButtonLabel className="Toolbar-error">
                <MdErrorOutline size={22} />
              </ButtonLabel>
            </Button>
          </Tippy>
        );
      }
    }
    default:
      return assertNever(sourceFile.info);
  }
}

interface FetchExecuteButtonProps {
  className?: string;
  uiString: UIStrings;
  tippyTarget: TippyProps["singleton"];

  cpuState: CpuState;
  simulationState: SimulationState;

  onFetchInstructionClick?: () => void;
  onExecuteInstructionClick?: () => void;
}

export function FetchExecuteButton(
  props: FetchExecuteButtonProps,
): React.JSX.Element {
  const {
    className,
    uiString,
    tippyTarget,
    cpuState,
    simulationState,
    onFetchInstructionClick,
    onExecuteInstructionClick,
  } = props;

  const fetchDisabled =
    simulationActive(simulationState) || cpuState.kind !== "PendingFetch";

  const executeDisabled =
    simulationActive(simulationState) || cpuState.kind !== "PendingExecute";

  const handleClick = React.useCallback(() => {
    if (fetchDisabled && !executeDisabled) {
      if (onExecuteInstructionClick !== undefined) {
        onExecuteInstructionClick();
      }
      return;
    }
    if (executeDisabled && !fetchDisabled) {
      if (onFetchInstructionClick !== undefined) {
        onFetchInstructionClick();
      }
    }
  }, [
    executeDisabled,
    fetchDisabled,
    onExecuteInstructionClick,
    onFetchInstructionClick,
  ]);

  return (
    <Tippy singleton={tippyTarget} content={uiString("FETCH_OR_EXECUTE")}>
      <Button
        className={className}
        disabled={fetchDisabled && executeDisabled}
        onClick={handleClick}
      >
        <ButtonLabel
          className={classNames("Toolbar-FetchExecuteLabel", {
            "Toolbar-ButtonLabelDim": fetchDisabled,
          })}
        >
          {uiString("FETCH")}
        </ButtonLabel>
        <ButtonLabel className="Toolbar-FetchExecuteLabel Toolbar-ButtonLabelDim">
          /
        </ButtonLabel>
        <ButtonLabel
          className={classNames("Toolbar-FetchExecuteLabel", {
            "Toolbar-ButtonLabelDim": executeDisabled,
          })}
        >
          {uiString("EXECUTE")}
        </ButtonLabel>
      </Button>
    </Tippy>
  );
}

interface RunButtonProps {
  className?: string;
  uiString: UIStrings;
  tippyTarget: TippyProps["singleton"];
  cpuState: CpuState;
  simulationState: SimulationState;
  onClick: () => void;
}

export function RunButton(props: RunButtonProps): React.JSX.Element {
  const {
    className,
    uiString,
    tippyTarget,
    cpuState,
    simulationState,
    onClick,
  } = props;

  const icon = ((): IconType => {
    switch (simulationState) {
      case "IDLE":
        return VscDebugContinue;
      case "FETCH_INSTRUCTION":
        return VscDebugContinue;
      case "EXECUTE_INSTRUCTION":
        return VscDebugContinue;
      case "SINGLE_STEP":
        return VscDebugContinue;
      case "RUN":
        return VscDebugStop;
      case "STOPPING":
        return BsHourglass;
      default:
        return assertNever(simulationState);
    }
  })();

  return (
    <Tippy singleton={tippyTarget} content={uiString("RUN")}>
      <Button
        className={className}
        disabled={
          !(simulationState === "IDLE" || simulationState === "RUN") ||
          cpuState.kind === "Stopped"
        }
        onClick={onClick}
      >
        <ButtonLabel>{icon({})}</ButtonLabel>
      </Button>
    </Tippy>
  );
}

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher(props: ThemeSwitcherProps): React.JSX.Element {
  const { className } = props;

  const [theme, setTheme] = React.useState<DemoTheme>(() => getCurrentTheme());

  React.useEffect(() => {
    const themeChangeListener: ThemeChangeListener = {
      onThemeChange: (currentTheme: DemoTheme) => {
        setTheme(currentTheme);
      },
    };

    registerThemeChangeListener(themeChangeListener);

    return (): void => {
      unregisterThemeChangeListener(themeChangeListener);
    };
  }, []);

  const handleClick = React.useCallback((): void => {
    const newTheme = nextTheme(theme);
    setCurrentTheme(newTheme);
  }, [theme]);

  return (
    <Button className={className} onClick={handleClick}>
      <ButtonLabel>
        <RiContrastFill size={22} />
      </ButtonLabel>
    </Button>
  );
}
