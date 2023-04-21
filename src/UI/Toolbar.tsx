import "./Toolbar.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import classNames from "classnames";

interface ToolbarProps {
  className?: string;

  /**
   * Whether an animation is currently running or not.
   */
  animating: boolean;

  onFetchInstructionClick?: () => void;
  onExecuteInstructionClick?: () => void;
}

export const Toolbar = React.memo(function Toolbar(
  props: ToolbarProps
): JSX.Element {
  const {
    className,
    animating,
    onFetchInstructionClick,
    onExecuteInstructionClick,
  } = props;

  return (
    <div className={classNames(className, "Toolbar-root")}>
      <ToolbarButton disabled={animating} onClick={onFetchInstructionClick}>
        Fetch Instruction
      </ToolbarButton>
      <ToolbarButton disabled={animating} onClick={onExecuteInstructionClick}>
        Execute Instruction
      </ToolbarButton>
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
