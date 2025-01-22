import "./WindowFrame.css";

import * as React from "react";

import classNames from "classnames";

export interface WindowFrameProps {
  className?: string;
  title: string;
  children?: React.ReactNode;
}

export const WindowFrame = (props: WindowFrameProps): React.JSX.Element => {
  const { className, title, children } = props;

  return (
    <div className={classNames(className, "WindowFrame-Root")}>
      <div className="WindowFrame-Titlebar">
        <div className="WindowFrame-Titlebar-Heading">{title}</div>
      </div>
      <div className="WindowFrame-Contents">{children}</div>
    </div>
  );
};
