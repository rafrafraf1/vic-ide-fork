import "./MenuButton.css";

import * as React from "react";
import type { ChangeEvent } from "react";

import classNames from "classnames";

export interface MenuButtonProps<T> {
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  values: MenuButtonOption<T>[];
  onValueClick?: (value: T) => void;
}

export interface MenuButtonOption<T> {
  /**
   * If value is `null` then the option is not able to be selected, and
   * functions as a separator.
   */
  value: T | null;

  label: string;

  className?: string;
}

export function MenuButton<T>(props: MenuButtonProps<T>): React.JSX.Element {
  const { icon, label, disabled, values, onValueClick } = props;

  const selectRef = React.useRef<HTMLSelectElement>(null);

  const handleChange = React.useCallback(
    (e: ChangeEvent<HTMLSelectElement>): void => {
      if (selectRef.current !== null) {
        selectRef.current.blur();
      }
      const index = parseInt(e.target.value, 10);
      if (onValueClick !== undefined) {
        const chosen = values[index];
        if (chosen !== undefined && chosen.value !== null) {
          onValueClick(chosen.value);
        }
      }
    },
    [onValueClick, values],
  );

  return (
    <>
      <div
        className={classNames("MenuButton-Icon", {
          "MenuButton-Icon-disabled": disabled === true,
        })}
      >
        {icon}
      </div>
      <select
        ref={selectRef}
        className="MenuButton"
        disabled={disabled}
        onChange={handleChange}
        value=""
      >
        <option className="MenuButton-Label" value="">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {label}
        </option>
        {values.map((option, index) => (
          <option
            disabled={option.value === null}
            key={index}
            className={classNames(option.className, "MenuButton-Option")}
            value={index}
          >
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
}
