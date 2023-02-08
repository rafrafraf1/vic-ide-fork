import "./ValueCellInput.css";
import { ChangeEvent, FormEvent, createRef, useState } from "react";
import { Value } from "../Computer/Value";

export interface ValueCellInputProps {
  value: Value;

  // TODO Do we need this?
  allowBlank?: boolean;

  onValueChange?: (value: Value) => void;
}

export function ValueCellInput(props: ValueCellInputProps): JSX.Element {
  const [inputStr, setInputStr] = useState<string>(`${props.value}`);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputStr(sanitizeValue(e.target.value));
  };

  const handleFocus = (): void => {
    if (inputRef.current !== null) {
      inputRef.current.select();
    }
  };

  const handleBlur = (): void => {
    console.log("BLUR");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log("SUBMIT");
    if (inputRef.current !== null) {
      inputRef.current.blur();
    }
  };

  const inputRef = createRef<HTMLInputElement>();

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
