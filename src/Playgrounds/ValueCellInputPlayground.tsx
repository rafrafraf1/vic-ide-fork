import * as React from "react";
import type { ChangeEvent } from "react";
import type { Value } from "../Computer/Value";
import { ValueCellInput } from "../UI/ValueCellInput";

export function ValueCellInputPlayground(): JSX.Element {
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
      if (value < 0 || value > 999) {
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
