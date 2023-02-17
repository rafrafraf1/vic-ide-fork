import "./ValueCellInput.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Value } from "../Computer/Value";

export interface ValueCellInputProps {
  value: Value;

  // TODO Do we need this?
  allowBlank?: boolean;

  onValueChange?: (value: Value) => void;
}

export function ValueCellInput(props: ValueCellInputProps): JSX.Element {
  const { value, onValueChange } = props;

  const [inputStr, setInputStr] = React.useState<string>(`${value}`);

  const inputRef = React.createRef<HTMLInputElement>();

  // React to changes to the "value" prop
  React.useEffect(() => {
    // If we are focused then we ignore the change. The user is editing the
    // value and that is what takes preference.
    if (document.activeElement === inputRef.current) {
      return;
    }

    if (value !== parseInt(inputStr, 10)) {
      setInputStr(`${value}`);
    }
  }, [inputRef, inputStr, value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputStr(sanitizeValue(e.target.value));
  };

  const handleFocus = (): void => {
    // When the user focuses the input element, we want to to select the input
    // text, so that it is ready to be replaced.
    if (inputRef.current !== null) {
      inputRef.current.select();
    }
  };

  // Called after the user has confirmed the entered value
  const updateValue = React.useCallback((): void => {
    const value = inputStr === "" ? 0 : parseInt(inputStr, 10);

    // If the "inputStr" has any leading zeroes then we remove them:
    if (inputStr !== `${value}`) {
      setInputStr(`${value}`);
    }

    if (onValueChange !== undefined) {
      onValueChange(value);
    }
  }, [inputStr, onValueChange]);

  // This happens when the user tabs out of the input element, or clicks
  // outside of it.
  const handleBlur = React.useCallback((): void => {
    console.log("BLUR");
    updateValue();
  }, [updateValue]);

  // This happens when the user presses enter when the input element is
  // focused.
  const handleSubmit = React.useCallback(
    (e: FormEvent<HTMLFormElement>): void => {
      // Prevent the default behaviour of a page refresh:
      e.preventDefault();

      console.log("SUBMIT");
      if (inputRef.current !== null) {
        // TODO Select next input (according to tab order) instead of "blur"
        inputRef.current.blur();
      }
    },
    [inputRef]
  );

  return (
    <form className="ValueCellInput" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        value={inputStr}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </form>
  );
}

const ascii0 = "0".charCodeAt(0);
const ascii9 = "9".charCodeAt(0);

export function sanitizeValue(value: string): string {
  let sanitized = "";
  for (const char of value) {
    if (char.charCodeAt(0) >= ascii0 && char.charCodeAt(0) <= ascii9) {
      sanitized += char;
    }
  }
  sanitized = sanitized.substring(0, 3);
  return sanitized;
}
