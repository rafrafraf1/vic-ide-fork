import "./Input.css";

import * as React from "react";

import { atEndOfInput, type InputState } from "../../Computer/Input";
import type { Value } from "../../Computer/Value";
import { nonNull } from "../../Functional/Nullability";
import { usePrevious } from "../ReactHooks/UsePrevious";
import {
  BlankableValueCellInput,
  ValueCellInput,
  type ValueCellInputHandle,
} from "../ValueCellInput";

export interface InputHandle {
  /**
   * @returns the position and size of the next input value.
   *
   * This function will throw an Error if there is no next input value.
   */
  getInputBoundingClientRect: () => DOMRect;

  /**
   * Scrolls to the cell of the next input that will be read.
   */
  scrollToNext: () => void;
}

export interface InputProps {
  input: InputState;
  onAppendInput?: (value: Value) => void;
  onInputChange?: (index: number, value: Value) => void;
  onDeleteInput?: (index: number) => void;
}

export const Input = React.memo(
  React.forwardRef(
    (props: InputProps, ref: React.ForwardedRef<InputHandle>) => {
      const { input, onAppendInput, onInputChange, onDeleteInput } = props;

      const nextInputLineElemRef = React.useRef<InputLineElemHandle | null>(
        null,
      );
      const lastInputRef = React.useRef<InputLineElemHandle | null>(null);
      const blankInputRef = React.useRef<ValueCellInputHandle>(null);

      const prevNumInputValues = usePrevious(input.values.length);

      React.useImperativeHandle(
        ref,
        (): InputHandle => ({
          getInputBoundingClientRect: (): DOMRect => {
            return nonNull(
              nextInputLineElemRef.current,
            ).getInputBoundingClientRect();
          },
          scrollToNext: (): void => {
            if (nextInputLineElemRef.current !== null) {
              nextInputLineElemRef.current.scrollIntoView();
            }
          },
        }),
        [],
      );

      React.useEffect(() => {
        if (prevNumInputValues === undefined) {
          return;
        }
        if (input.values.length < prevNumInputValues) {
          // If the last input was deleted, then set the focus to the new last
          // input.
          if (input.values.length > 0) {
            if (lastInputRef.current !== null) {
              lastInputRef.current.focus();
            }
          }
        } else if (input.values.length > prevNumInputValues) {
          // If a new input was added, then set the focus to the new input.
          if (blankInputRef.current !== null) {
            blankInputRef.current.focus();
          }
        }
      }, [input.values.length, prevNumInputValues]);

      const handleNewInputCellChange = React.useCallback(
        (value: Value | null): void => {
          if (value === null) {
            return;
          }
          if (onAppendInput !== undefined) {
            onAppendInput(value);
          }
        },
        [onAppendInput],
      );

      const handleValueChange = React.useCallback(
        (index: number, value: Value): void => {
          if (onInputChange !== undefined) {
            onInputChange(index, value);
          }
        },
        [onInputChange],
      );

      const handleDelete = React.useCallback(
        (index: number): void => {
          if (onDeleteInput !== undefined) {
            onDeleteInput(index);
          }
        },
        [onDeleteInput],
      );

      return (
        <div className="Input-Root">
          {input.values.map((value, index) => (
            <InputLineElem
              key={index}
              ref={(ref: InputLineElemHandle): void => {
                if (index === input.next) {
                  nextInputLineElemRef.current = ref;
                }
                if (index === input.values.length - 1) {
                  lastInputRef.current = ref;
                }
              }}
              value={value}
              index={index}
              next={index === input.next}
              last={index === input.values.length - 1}
              onValueChange={handleValueChange}
              onDelete={handleDelete}
            />
          ))}
          <BlankableValueCellInput
            ref={blankInputRef}
            key={input.values.length}
            value={null}
            highlighted={atEndOfInput(input)}
            onValueChange={handleNewInputCellChange}
          />
        </div>
      );
    },
  ),
);

interface InputLineElemHandle {
  focus: () => void;
  getInputBoundingClientRect: () => DOMRect;
  scrollIntoView: () => void;
}

interface InputLineElemProps {
  value: Value;
  index: number;
  next: boolean;
  last: boolean;
  onValueChange?: (index: number, value: Value) => void;
  onDelete?: (index: number) => void;
}

const InputLineElem = React.memo(
  React.forwardRef(
    (
      props: InputLineElemProps,
      ref: React.ForwardedRef<InputLineElemHandle>,
    ) => {
      const { value, index, next, last, onValueChange, onDelete } = props;

      const valueCellInputRef = React.useRef<ValueCellInputHandle>(null);

      React.useImperativeHandle(
        ref,
        (): InputLineElemHandle => ({
          focus: (): void => {
            nonNull(valueCellInputRef.current).focus();
          },

          getInputBoundingClientRect: (): DOMRect => {
            return nonNull(valueCellInputRef.current).getBoundingClientRect();
          },
          scrollIntoView: (): void => {
            nonNull(valueCellInputRef.current).scrollIntoView();
          },
        }),
        [],
      );

      const handleValueChange = React.useCallback(
        (value: Value): void => {
          if (onValueChange !== undefined) {
            onValueChange(index, value);
          }
        },
        [index, onValueChange],
      );

      const handleLastValueChange = React.useCallback(
        (value: Value | null): void => {
          if (value === null) {
            if (onDelete !== undefined) {
              onDelete(index);
            }
          } else {
            if (onValueChange !== undefined) {
              onValueChange(index, value);
            }
          }
        },
        [index, onDelete, onValueChange],
      );

      return last ? (
        <BlankableValueCellInput
          ref={valueCellInputRef}
          value={value}
          highlighted={next}
          onValueChange={handleLastValueChange}
        />
      ) : (
        <ValueCellInput
          ref={valueCellInputRef}
          value={value}
          highlighted={next}
          onValueChange={handleValueChange}
        />
      );
    },
  ),
);
