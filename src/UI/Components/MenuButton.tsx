import "./MenuButton.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import type { ChangeEvent } from "react";

export interface MenuButtonProps {
  label: string;
  disabled?: boolean;
  values: string[];
  onValueClick?: (value: string) => void;
}

export function MenuButton(props: MenuButtonProps): JSX.Element {
  const { label, disabled, values, onValueClick } = props;

  const selectRef = React.useRef<HTMLSelectElement>(null);

  const handleChange = React.useCallback(
    (e: ChangeEvent<HTMLSelectElement>): void => {
      if (selectRef.current !== null) {
        selectRef.current.blur();
      }
      if (onValueClick !== undefined) {
        onValueClick(e.target.value);
      }
    },
    [onValueClick]
  );

  return (
    <select
      ref={selectRef}
      className="MenuButton"
      disabled={disabled}
      onChange={handleChange}
      value=""
    >
      <option className="MenuButton-Label" value="">
        {label}
      </option>
      {values.map((value, index) => (
        <option key={index} className="MenuButton-Option" value={value}>
          {value}
        </option>
      ))}
    </select>
  );
}
