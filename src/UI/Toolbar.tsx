import "./Toolbar.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import { Button, ButtonLabel } from "./Components/Button";
import { VscDebugContinue, VscDebugStart, VscDebugStop } from "react-icons/vsc";
import type { AnimationSpeed } from "./Simulator/AnimationSpeed";
import { AnimationSpeedSelector } from "./Components/AnimationSpeedSelector";
import { MenuButton } from "./Components/MenuButton";
import classNames from "classnames";

interface ToolbarProps {
  className?: string;

  /**
   * Whether an animation is currently running or not.
   */
  animating: boolean;

  /**
   * Whether the simulation is currently running.
   */
  running: boolean;

  examples: string[];
  onLoadExample?: (example: string) => void;

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
    animating,
    running,
    examples,
    onLoadExample,
    animationSpeed,
    onAnimationSpeedChange,
    onFetchInstructionClick,
    onExecuteInstructionClick,
    onSingleStepClick,
    onRunClick,
    onStopClick,
  } = props;

  const handleRunClick = React.useCallback((): void => {
    if (running) {
      if (onStopClick !== undefined) {
        onStopClick();
      }
    } else {
      if (onRunClick !== undefined) {
        onRunClick();
      }
    }
  }, [onRunClick, onStopClick, running]);

  return (
    <div className={classNames(className, "Toolbar-root")}>
      <MenuButton
        disabled={animating}
        label="Load Example"
        values={examples}
        onValueClick={onLoadExample}
      />
      <ToolbarButton disabled={animating} onClick={onFetchInstructionClick}>
        Fetch Instruction
      </ToolbarButton>
      <ToolbarButton disabled={animating} onClick={onExecuteInstructionClick}>
        Execute Instruction
      </ToolbarButton>
      <AnimationSpeedSelector
        animationSpeed={animationSpeed}
        onAnimationSpeedChange={onAnimationSpeedChange}
      />
      <Button disabled={animating} onClick={onSingleStepClick}>
        <ButtonLabel>Single Step</ButtonLabel>
        <VscDebugContinue />
      </Button>
      <Button disabled={animating && !running} onClick={handleRunClick}>
        <ButtonLabel>{running ? "Stop" : "Run"}</ButtonLabel>
        {running ? <VscDebugStop /> : <VscDebugStart />}
      </Button>
    </div>
  );
});

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
