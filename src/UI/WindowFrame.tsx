import "./WindowFrame.css";

import * as React from "react";

import classNames from "classnames";
import { VscClose } from "react-icons/vsc";

import { Button, ButtonLabel } from "./Components/Button";

export interface WindowFrameProps {
  className?: string;
  title: string;
  showCloseButton?: boolean;
  children?: React.ReactNode;

  onCloseClick?: () => void;
}

export const WindowFrame = React.memo(
  (props: WindowFrameProps): React.JSX.Element => {
    const { className, title, showCloseButton, children, onCloseClick } = props;

    return (
      <div className={classNames(className, "WindowFrame-Root")}>
        <div className="WindowFrame-Titlebar">
          <div className="WindowFrame-Titlebar-Heading">{title}</div>
          {showCloseButton === true ? (
            <Button
              className="WindowFrame-Titlebar-CloseButton"
              onClick={onCloseClick}
            >
              <ButtonLabel>
                <VscClose size="24" />
              </ButtonLabel>
            </Button>
          ) : null}
        </div>
        <div className="WindowFrame-Contents">{children}</div>
      </div>
    );
  },
);
