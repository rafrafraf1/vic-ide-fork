import "./WindowFrame.css";

import * as React from "react";

import classNames from "classnames";

import type { UIStrings } from "./UIStrings";

export interface WindowFrameProps {
  className?: string;
  children?: React.ReactNode;

  uiString: UIStrings;
}

export const WindowFrame = (props: WindowFrameProps): React.JSX.Element => {
  const { className, children, uiString } = props;

  return (
    <div className={classNames(className, "WindowFrame-Root")}>
      <div className="WindowFrame-Titlebar">
        <div className="WindowFrame-Titlebar-Heading">
          {uiString("THE_VISUAL_COMPUTER")}
        </div>
      </div>
      <div className="WindowFrame-Contents">{children}</div>
    </div>
  );
};
