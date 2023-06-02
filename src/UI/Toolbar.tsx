import "./Toolbar.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import { Button, ButtonLabel } from "./Components/Button";
import {
  type DemoTheme,
  type ThemeChangeListener,
  getCurrentTheme,
  nextTheme,
  registerThemeChangeListener,
  setCurrentTheme,
  unregisterThemeChangeListener,
} from "../System/DemoTheme";
import {
  type SimulationState,
  simulationActive,
} from "./Simulator/SimulationState";
import { VscDebugContinue, VscDebugStart, VscDebugStop } from "react-icons/vsc";
import type { AnimationSpeed } from "./Simulator/AnimationSpeed";
import { AnimationSpeedSelector } from "./Components/AnimationSpeedSelector";
import { BsHourglass } from "react-icons/bs";
import { IS_DEMO_ENVIRONMENT } from "../System/Environment";
import type { IconType } from "react-icons";
import { MenuButton } from "./Components/MenuButton";
import type { SourceFile } from "../common/Vic/SourceFile";
import { assertNever } from "assert-never";
import classNames from "classnames";

interface ToolbarProps {
  className?: string;

  simulationState: SimulationState;

  examples: string[];
  onLoadExample?: (example: string) => void;

  sourceFile: SourceFile | null;
  onLoadSourceFileClick?: () => void;

  animationSpeed: AnimationSpeed;
  onAnimationSpeedChange?: (value: AnimationSpeed) => void;

  onFetchInstructionClick?: () => void;
  onExecuteInstructionClick?: () => void;
  onSingleStepClick?: () => void;
  onRunClick?: () => void;
  onStopClick?: () => void;
}

export const Toolbar = React.memo(function Toolbar(
  props: ToolbarProps
): JSX.Element {
  const {
    className,
    simulationState,
    examples,
    onLoadExample,
    sourceFile,
    onLoadSourceFileClick,
    animationSpeed,
    onAnimationSpeedChange,
    onFetchInstructionClick,
    onExecuteInstructionClick,
    onSingleStepClick,
    onRunClick,
    onStopClick,
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

  return (
    <div className={classNames(className, "Toolbar-root")}>
      {IS_DEMO_ENVIRONMENT ? <ThemeSwitcher /> : null}
      {IS_DEMO_ENVIRONMENT ? (
        <MenuButton
          disabled={simulationActive(simulationState)}
          label="Load Example"
          values={examples}
          onValueClick={onLoadExample}
        />
      ) : (
        <ToolbarButton onClick={onLoadSourceFileClick}>
          {sourceFile === null ? "NONE" : sourceFile.filename}
        </ToolbarButton>
      )}
      <ToolbarButton
        disabled={simulationActive(simulationState)}
        onClick={onFetchInstructionClick}
      >
        Fetch Instruction
      </ToolbarButton>
      <ToolbarButton
        disabled={simulationActive(simulationState)}
        onClick={onExecuteInstructionClick}
      >
        Execute Instruction
      </ToolbarButton>
      <AnimationSpeedSelector
        animationSpeed={animationSpeed}
        onAnimationSpeedChange={onAnimationSpeedChange}
      />
      <Button
        disabled={simulationActive(simulationState)}
        onClick={onSingleStepClick}
      >
        <ButtonLabel>Single Step</ButtonLabel>
        <VscDebugContinue />
      </Button>
      <RunButton simulationState={simulationState} onClick={handleRunClick} />
    </div>
  );
});

interface RunButtonProps {
  simulationState: SimulationState;
  onClick: () => void;
}

export function RunButton(props: RunButtonProps): JSX.Element {
  const { simulationState, onClick } = props;

  const [label, icon] = ((): [string, IconType] => {
    switch (simulationState) {
      case "IDLE":
        return ["Run", VscDebugStart];
      case "FETCH_INSTRUCTION":
        return ["Run", VscDebugStart];
      case "EXECUTE_INSTRUCTION":
        return ["Run", VscDebugStart];
      case "SINGLE_STEP":
        return ["Run", VscDebugStart];
      case "RUN":
        return ["Stop", VscDebugStop];
      case "STOPPING":
        return ["Stopping", BsHourglass];
      default:
        return assertNever(simulationState);
    }
  })();

  return (
    <Button
      disabled={!(simulationState === "IDLE" || simulationState === "RUN")}
      onClick={onClick}
    >
      <>
        <ButtonLabel>{label}</ButtonLabel>
        {icon({})}
      </>
    </Button>
  );
}

function ThemeSwitcher(): JSX.Element {
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
      <ButtonLabel>{theme} Mode</ButtonLabel>
    </Button>
  );
}

interface ToolbarButtonProps {
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export function ToolbarButton(props: ToolbarButtonProps): JSX.Element {
  const { children, disabled, onClick } = props;
  return (
    <button disabled={disabled} className="Toolbar-Button" onClick={onClick}>
      {children}
    </button>
  );
}
