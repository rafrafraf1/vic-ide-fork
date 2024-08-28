import type { ChangeEvent } from "react";
import * as React from "react";

import type { Value } from "../Computer/Value";
import { BlankableValueCellInput, ValueCellInput } from "../UI/ValueCellInput";

export function ValueCellInputPlayground(): React.JSX.Element {
  return (
    <>
      <div>
        <ValueCellInputTester />
      </div>
      <div>
        <BlankableValueCellInputTester />
      </div>
    </>
  );
}

export function ValueCellInputTester(): React.JSX.Element {
  const [value, setValue] = React.useState<Value>(23);
  const [highlighted, setHighlighted] = React.useState<boolean>(false);
  const [disabled, setDisabled] = React.useState<boolean>(false);

  const handleValueChange = React.useCallback((value: number): void => {
    setValue(value);
  }, []);

  const handleChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      if (e.target.value.trim() === "") {
        setValue(0);
      }
      const value = parseInt(e.target.value, 10);
      if (isNaN(value)) {
        return;
      }
      if (value < -999 || value > 999) {
        return;
      }
      setValue(value);
    },
    [],
  );

  const handleHighlightedChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setHighlighted(e.target.checked);
    },
    [],
  );

  const handleDisabledChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setDisabled(e.target.checked);
    },
    [],
  );

  return (
    <>
      <h1>ValueCellInputTester</h1>
      <label>
        <input
          type="checkbox"
          checked={highlighted}
          onChange={handleHighlightedChange}
        />
        Highlighted
      </label>
      <label>
        <input
          type="checkbox"
          checked={disabled}
          onChange={handleDisabledChange}
        />
        Disabled
      </label>
      <ValueCellInput
        value={value}
        highlighted={highlighted}
        disabled={disabled}
        onValueChange={handleValueChange}
      />
      <input value={value} onChange={handleChange} />
    </>
  );
}

export function BlankableValueCellInputTester(): React.JSX.Element {
  const [value, setValue] = React.useState<Value | null>(null);
  const [highlighted, setHighlighted] = React.useState<boolean>(false);
  const [disabled, setDisabled] = React.useState<boolean>(false);

  const handleValueChange = React.useCallback((value: number | null): void => {
    setValue(value);
  }, []);

  const handleChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      if (e.target.value.trim() === "") {
        setValue(null);
      }
      const value = parseInt(e.target.value, 10);
      if (isNaN(value)) {
        return;
      }
      if (value < -999 || value > 999) {
        return;
      }
      setValue(value);
    },
    [],
  );

  const handleHighlightedChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setHighlighted(e.target.checked);
    },
    [],
  );

  const handleDisabledChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setDisabled(e.target.checked);
    },
    [],
  );

  return (
    <>
      <h1>BlankableValueCellInputTester</h1>
      <label>
        <input
          type="checkbox"
          checked={highlighted}
          onChange={handleHighlightedChange}
        />
        Highlighted
      </label>
      <label>
        <input
          type="checkbox"
          checked={disabled}
          onChange={handleDisabledChange}
        />
        Disabled
      </label>
      <BlankableValueCellInput
        value={value}
        highlighted={highlighted}
        disabled={disabled}
        onValueChange={handleValueChange}
      />
      <input value={value === null ? "" : value} onChange={handleChange} />
    </>
  );
}
