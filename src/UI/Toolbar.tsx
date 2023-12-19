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
import { MenuButton } from "./Components/MenuButton";
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

  simulationState: SimulationState;

  resetEnabled: boolean;

  examples: string[];
  onLoadExample?: (example: string) => void;

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

export type ClearOption =
  | "CLEAR_IO"
  | "CLEAR_HIGH_MEMORY"
  | "CLEAR_LOW_MEMORY"
  | "CLEAR_ALL";

export const Toolbar = React.memo(function Toolbar(
  props: ToolbarProps,
): JSX.Element {
  const {
    className,
    uiString,
    showThemeSwitcher,
    showExamples,
    showSourceLoader,
    simulationState,
    resetEnabled,
    examples,
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
        <MenuButton<string>
          disabled={simulationActive(simulationState)}
          icon={<PiFolderOpenDuotone size={22} />}
          label={uiString("LOAD_EXAMPLE")}
          values={examples.map((e) => [e, e])}
          onValueClick={onLoadExample}
        />
      ) : null}
      {showSourceLoader ? (
        <SourceFileLoader
          uiString={uiString}
          disabled={simulationActive(simulationState)}
          sourceFile={sourceFile}
          onLoadSourceFileClick={onLoadSourceFileClick}
          onShowErrorsClick={onShowErrorsClick}
        />
      ) : null}
      <Separator />
      <Tippy
        singleton={tippyTarget}
        content={uiString(
          "LOAD_INSTRUCTION_FROM_MEMORY_TO_INSTRUCTION_REGISTER",
        )}
      >
        <Button
          disabled={simulationActive(simulationState)}
          onClick={onFetchInstructionClick}
        >
          <ButtonLabel>{uiString("FETCH")}</ButtonLabel>
          <ButtonLabel>
            <BsCpu size={22} />
          </ButtonLabel>
        </Button>
      </Tippy>
      <Tippy
        singleton={tippyTarget}
        content={uiString("EXECUTE_INSTRUCTION_IN_INSTRUCTION_REGISTER")}
      >
        <Button
          disabled={simulationActive(simulationState)}
          onClick={onExecuteInstructionClick}
        >
          <ButtonLabel>
            <BsCpu size={22} />
          </ButtonLabel>
          <ButtonLabel>{uiString("EXECUTE")}</ButtonLabel>
        </Button>
      </Tippy>

      <Separator />
      <AnimationSpeedSelector
        uiString={uiString}
        animationSpeed={animationSpeed}
        onAnimationSpeedChange={onAnimationSpeedChange}
      />
      <Separator />
      <RunButton
        uiString={uiString}
        tippyTarget={tippyTarget}
        simulationState={simulationState}
        onClick={handleRunClick}
      />
      <Tippy
        singleton={tippyTarget}
        content={uiString("FETCH_NEXT_INSTRUCTION_AND_EXECUTE_IT")}
      >
        <Button
          disabled={simulationActive(simulationState)}
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
        icon={<VscTrash size={22} />}
        label={uiString("CLEAR")}
        values={[
          ["CLEAR_IO", uiString("CLEAR_IO")],
          ["CLEAR_HIGH_MEMORY", uiString("CLEAR_HIGH_MEMORY")],
          ["CLEAR_LOW_MEMORY", uiString("CLEAR_LOW_MEMORY")],
          ["CLEAR_ALL", uiString("CLEAR_ALL")],
        ]}
        disabled={simulationActive(simulationState)}
        onValueClick={handleClearClick}
      />
      <Separator />
      <Button onClick={onHelpClick}>
        <ButtonLabel>{uiString("HELP")}</ButtonLabel>
        <ButtonLabel>
          <VscQuestion size={24} />
        </ButtonLabel>
      </Button>
      {showThemeSwitcher ? (
        <>
          <Separator />
          <ThemeSwitcher uiString={uiString} />
        </>
      ) : null}
    </div>
  );
});

function Separator(): JSX.Element {
  return <div className="Toolbar-Separator" />;
}

interface SourceFileLoaderProps {
  uiString: UIStrings;
  disabled?: boolean;
  sourceFile: SourceFile | null;
  onLoadSourceFileClick?: () => void;
  onShowErrorsClick?: () => void;
}

function SourceFileLoader(props: SourceFileLoaderProps): JSX.Element {
  const {
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
        <Button disabled={true}>
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
          <Button disabled={true}>
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
            <Button disabled={disabled} onClick={handleLoadClick}>
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
            <Button disabled={disabled} onClick={handleLoadClick}>
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

interface RunButtonProps {
  uiString: UIStrings;
  tippyTarget: TippyProps["singleton"];
  simulationState: SimulationState;
  onClick: () => void;
}

export function RunButton(props: RunButtonProps): JSX.Element {
  const { uiString, tippyTarget, simulationState, onClick } = props;

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
        disabled={!(simulationState === "IDLE" || simulationState === "RUN")}
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
  uiString: UIStrings;
}

export function ThemeSwitcher(props: ThemeSwitcherProps): JSX.Element {
  const { uiString } = props;

  const [theme, setTheme] = React.useState<DemoTheme>(() => getCurrentTheme());

  React.useEffect(() => {
    const themeChangeListener: ThemeChangeListener = {
      onThemeChange: (currentTheme: DemoTheme) => {
        setTheme(currentTheme);
      },
    };

    registerThemeChangeListener(themeChangeListener);

    return () => {
      unregisterThemeChangeListener(themeChangeListener);
    };
  }, []);

  const handleClick = React.useCallback((): void => {
    const newTheme = nextTheme(theme);
    setCurrentTheme(newTheme);
  }, [theme]);

  return (
    <Button onClick={handleClick}>
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
