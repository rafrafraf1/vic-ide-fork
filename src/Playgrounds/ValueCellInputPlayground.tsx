import * as React from "react";
import { BlankableValueCellInput, ValueCellInput } from "../UI/ValueCellInput";
import type { ChangeEvent } from "react";
import type { Value } from "../Computer/Value";

export function ValueCellInputPlayground(): JSX.Element {
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

export function ValueCellInputTester(): JSX.Element {
  const [value, setValue] = React.useState<Value>(23);

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
    []
  );

  return (
    <>
      <h1>ValueCellInputPlayground</h1>
      <ValueCellInput value={value} onValueChange={handleValueChange} />
      <input value={value} onChange={handleChange} />
    </>
  );
}

export function BlankableValueCellInputTester(): JSX.Element {
  const [value, setValue] = React.useState<Value | null>(null);

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
    []
  );

  return (
    <>
      <h1>ValueCellInputPlayground</h1>
      <BlankableValueCellInput
        value={value}
        onValueChange={handleValueChange}
      />
      <input value={value === null ? "" : value} onChange={handleChange} />
    </>
  );
}
