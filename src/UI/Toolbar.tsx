import "./Toolbar.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import classNames from "classnames";

interface ToolbarProps {
  className?: string;
  onFetchInstructionClick?: () => void;
  onExecuteInstructionClick?: () => void;
}

export const Toolbar = React.memo(function Toolbar(
  props: ToolbarProps
): JSX.Element {
  const { className, onFetchInstructionClick, onExecuteInstructionClick } =
    props;

  return (
    <div className={classNames(className, "Toolbar-root")}>
      <ToolbarButton onClick={onFetchInstructionClick}>
        Fetch Instruction
      </ToolbarButton>
      <ToolbarButton onClick={onExecuteInstructionClick}>
        Execute Instruction
      </ToolbarButton>
    </div>
  );
});

interface ToolbarButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
}

export function ToolbarButton(props: ToolbarButtonProps): JSX.Element {
  const { children, onClick } = props;
  return (
    <button className="Toolbar-Button" onClick={onClick}>
      {children}
    </button>
  );
}
