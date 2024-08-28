import "./ComputerFrame.css";

import * as React from "react";

import classNames from "classnames";

import type { UIStrings } from "./UIStrings";

export interface ComputerFrameProps {
  className?: string;
  children?: React.ReactNode;

  uiString: UIStrings;
}

export const ComputerFrame = (props: ComputerFrameProps): React.JSX.Element => {
  const { className, children, uiString } = props;

  return (
    <div className={classNames(className, "ComputerFrame-Root")}>
      <div className="ComputerFrame-Titlebar">
        <div className="ComputerFrame-Titlebar-Heading">
          {uiString("THE_VISUAL_COMPUTER")}
        </div>
      </div>
      <div className="ComputerFrame-Contents">{children}</div>
    </div>
  );
};
