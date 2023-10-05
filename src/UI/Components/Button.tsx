import "./Button.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import classNames from "classnames";

export interface ButtonProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export const Button = React.forwardRef(function Button(
  props: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
): JSX.Element {
  const { className, children, disabled, onClick } = props;

  const handleClick = React.useCallback(() => {
    if (props.disabled !== true) {
      if (onClick !== undefined) {
        onClick();
      }
    }
  }, [onClick, props.disabled]);

  return (
    <button
      ref={ref}
      className={classNames(className, "Button", {
        "Button-disabled": disabled,
      })}
      onClick={handleClick}
    >
      {children}
    </button>
  );
});

export interface ButtonLabelProps {
  children?: React.ReactNode;
  className?: string;
}

export function ButtonLabel(props: ButtonLabelProps): JSX.Element {
  const { children, className } = props;

  return (
    <span className={classNames(className, "Button-Label")}>{children}</span>
  );
}
