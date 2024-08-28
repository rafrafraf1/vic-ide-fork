import "./Toolbar.css";

import * as React from "react";

import Tippy, { useSingleton, type TippyProps } from "@tippyjs/react";
import { assertNever } from "assert-never";
import classNames from "classnames";
import type { IconType } from "react-icons";
import { BsCpu, BsHourglass } from "react-icons/bs";
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
   * Show the button that allows to load example programs. This is mainly
   * useful in the web demo.
   */
  showExamples: boolean;

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

  examples: string[];
  onLoadExample?: (example: string) => void;
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
  | OpenFileSelection.LoadExample;

namespace OpenFileSelection {
  export interface OpenFile {
    kind: "OpenFile";
  }

  export interface LoadExample {
    kind: "LoadExample";
    example: string;
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
    showExamples,
    showSourceLoader,
    cpuState,
    simulationState,
    resetEnabled,
    examples,
    onOpenFile,
    onLoadExample,
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

  const exampleValues = React.useMemo<
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
    const loadExample: MenuButtonOption<OpenFileSelection> = {
      value: null,
      label: `\u2500 ${uiString("LOAD_EXAMPLE")} \u2500`,
    };
    const exampleEntries = examples.map<MenuButtonOption<OpenFileSelection>>(
      (e) => ({
        value: { kind: "LoadExample", example: e },
        label: e,
      }),
    );
    return [spacer, openFile, spacer, loadExample].concat(exampleEntries);
  }, [examples, uiString]);

  const handleOpenFileClick = React.useCallback(
    (value: OpenFileSelection): void => {
      switch (value.kind) {
        case "OpenFile":
          if (onOpenFile !== undefined) {
            onOpenFile();
          }
          break;
        case "LoadExample":
          if (onLoadExample !== undefined) {
            onLoadExample(value.example);
          }
          break;
        default:
          assertNever(value);
      }
    },
    [onLoadExample, onOpenFile],
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
      {showExamples ? (
        <MenuButton<OpenFileSelection>
          className="Toolbar-Button"
          disabled={simulationActive(simulationState)}
          icon={<PiFolderOpenDuotone size={22} />}
          label={uiString("FILE")}
          values={exampleValues}
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
      <FetchExecuteButton
        className="Toolbar-Button"
        uiString={uiString}
        tippyTarget={tippyTarget}
        cpuState={cpuState}
        simulationState={simulationState}
        onFetchInstructionClick={onFetchInstructionClick}
        onExecuteInstructionClick={onExecuteInstructionClick}
      />
      <Separator />
      <AnimationSpeedSelector
        className="Toolbar-AnimationSpeedSelector"
        uiString={uiString}
        animationSpeed={animationSpeed}
        onAnimationSpeedChange={onAnimationSpeedChange}
      />
      <Separator />
      <RunButton
        className="Toolbar-Button"
        uiString={uiString}
        tippyTarget={tippyTarget}
        cpuState={cpuState}
        simulationState={simulationState}
        onClick={handleRunClick}
      />
      <Tippy
        singleton={tippyTarget}
        content={uiString("FETCH_NEXT_INSTRUCTION_AND_EXECUTE_IT")}
      >
        <Button
          className="Toolbar-Button"
          disabled={
            simulationActive(simulationState) ||
            cpuState.kind !== "PendingFetch"
          }
          onClick={onSingleStepClick}
        >
          <ButtonLabel>{uiString("SINGLE_STEP")}</ButtonLabel>
          <ButtonLabel>
            <VscDebugContinue />
          </ButtonLabel>
        </Button>
      </Tippy>
      <Tippy
        singleton={tippyTarget}
        content={uiString(
          "RESET_THE_INPUT_SET_THE_PROGRAM_COUNTER_TO_ZERO_CLEAR_THE_OUTPUT",
        )}
      >
        <Button
          className="Toolbar-Button"
          disabled={simulationActive(simulationState) || !resetEnabled}
          onClick={onResetClick}
        >
          <ButtonLabel>{uiString("RESET")}</ButtonLabel>
          <ButtonLabel>
            <RiRewindMiniFill size={24} />
          </ButtonLabel>
        </Button>
      </Tippy>
      <Separator />
      <MenuButton<ClearOption>
        className="Toolbar-Button"
        icon={<VscTrash size={22} />}
        label={uiString("CLEAR")}
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
      <Button className="Toolbar-Button" onClick={onHelpClick}>
        <ButtonLabel>{uiString("HELP")}</ButtonLabel>
        <ButtonLabel>
          <VscQuestion size={24} />
        </ButtonLabel>
      </Button>
      {showThemeSwitcher ? (
        <>
          <Separator />
          <ThemeSwitcher className="Toolbar-Button" uiString={uiString} />
        </>
      ) : null}
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
    <Tippy
      singleton={tippyTarget}
      content={
        <>
          {uiString("FETCH_OR_EXECUTE_AN_INSTRUCTION")}
          <br />
          <br />
          {uiString("LOAD_INSTRUCTION_FROM_MEMORY_TO_INSTRUCTION_REGISTER")}
          <br />
          <br />
          {uiString("EXECUTE_INSTRUCTION_IN_INSTRUCTION_REGISTER")}
        </>
      }
    >
      <Button
        className={className}
        disabled={fetchDisabled && executeDisabled}
        onClick={handleClick}
      >
        <ButtonLabel>
          <BsCpu size={22} />
        </ButtonLabel>
        <ButtonLabel
          className={classNames({ "Toolbar-ButtonLabelDim": fetchDisabled })}
        >
          {uiString("FETCH")}
        </ButtonLabel>
        <ButtonLabel className="Toolbar-ButtonLabelDim">/</ButtonLabel>
        <ButtonLabel
          className={classNames({ "Toolbar-ButtonLabelDim": executeDisabled })}
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

  const [label, icon] = ((): [string, IconType] => {
    switch (simulationState) {
      case "IDLE":
        return [uiString("RUN"), VscDebugStart];
      case "FETCH_INSTRUCTION":
        return [uiString("RUN"), VscDebugStart];
      case "EXECUTE_INSTRUCTION":
        return [uiString("RUN"), VscDebugStart];
      case "SINGLE_STEP":
        return [uiString("RUN"), VscDebugStart];
      case "RUN":
        return [uiString("STOP"), VscDebugStop];
      case "STOPPING":
        return [uiString("STOPPING"), BsHourglass];
      default:
        return assertNever(simulationState);
    }
  })();

  // The button is always rendered with all of the possible label values
  // inside it, that are hidden and act as spacers.
  //
  // This is done so that the size of the button fits the longest label (so
  // that the button doesn't resize when the label changes).
  const spacer = "Toolbar-RunLabel Toolbar-RunLabelSpacer";

  return (
    <Tippy
      singleton={tippyTarget}
      content={uiString("RUN_PROGRAM_UNTIL_IT_TERMINATES")}
    >
      <Button
        className={className}
        disabled={
          !(simulationState === "IDLE" || simulationState === "RUN") ||
          cpuState.kind === "Stopped"
        }
        onClick={onClick}
      >
        <>
          <div className="Toolbar-RunLabels">
            <ButtonLabel className={spacer}>{uiString("RUN")}</ButtonLabel>
            <ButtonLabel className={spacer}>{uiString("STOP")}</ButtonLabel>
            <ButtonLabel className={spacer}>{uiString("STOPPING")}</ButtonLabel>
            <ButtonLabel className="Toolbar-RunLabel">{label}</ButtonLabel>
          </div>
          <ButtonLabel>{icon({})}</ButtonLabel>
        </>
      </Button>
    </Tippy>
  );
}

interface ThemeSwitcherProps {
  className?: string;
  uiString: UIStrings;
}

export function ThemeSwitcher(props: ThemeSwitcherProps): React.JSX.Element {
  const { className, uiString } = props;

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
      <ButtonLabel>{themeLabel(uiString, theme)}</ButtonLabel>
    </Button>
  );
}

function themeLabel(uiString: UIStrings, theme: DemoTheme): string {
  switch (theme) {
    case "Dark":
      return uiString("DARK_MODE");
    case "Light":
      return uiString("LIGHT_MODE");
    default:
      return assertNever(theme);
  }
}
