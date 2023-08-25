import "./Input.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import {
  BlankableValueCellInput,
  ValueCellInput,
  type ValueCellInputHandle,
} from "../ValueCellInput";
import { type InputState, atEndOfInput } from "../../Computer/Input";
import type { Value } from "../../Computer/Value";
import { VscArrowCircleRight } from "react-icons/vsc";
import { nonNull } from "../../Functional/Nullability";

export interface InputHandle {
  /**
   * @returns the position and size of the next input value.
   *
   * This function will throw an Error if there is no next input value.
   */
  getInputBoundingClientRect: () => DOMRect;

  /**
   * Scrolls to the cell of the next input that will be read.
   *
   * This function will throw an Error if there is no next input value.
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

      const nextInputLineElemRef = React.useRef<InputLineElemHandle>(null);

      React.useImperativeHandle(
        ref,
        (): InputHandle => ({
          getInputBoundingClientRect: (): DOMRect => {
            return nonNull(
              nextInputLineElemRef.current
            ).getInputBoundingClientRect();
          },
          scrollToNext: (): void => {
            nonNull(nextInputLineElemRef.current).scrollIntoView();
          },
        }),
        []
      );

      const handleNewInputCellChange = React.useCallback(
        (value: Value | null): void => {
          if (value === null) {
            return;
          }
          if (onAppendInput !== undefined) {
            onAppendInput(value);
          }
        },
        [onAppendInput]
      );

      const handleValueChange = React.useCallback(
        (index: number, value: Value): void => {
          if (onInputChange !== undefined) {
            onInputChange(index, value);
          }
        },
        [onInputChange]
      );

      const handleDelete = React.useCallback(
        (index: number): void => {
          if (onDeleteInput !== undefined) {
            onDeleteInput(index);
          }
        },
        [onDeleteInput]
      );

      return (
        <div className="Input-Root">
          {input.values.map((value, index) => (
            <React.Fragment key={index}>
              <InputLineElem
                ref={index === input.next ? nextInputLineElemRef : undefined}
                value={value}
                index={index}
                next={index === input.next}
                last={index === input.values.length - 1}
                onValueChange={handleValueChange}
                onDelete={handleDelete}
              />
            </React.Fragment>
          ))}
          <BlankableValueCellInput
            key={input.values.length}
            value={null}
            highlighted={atEndOfInput(input)}
            onValueChange={handleNewInputCellChange}
          />
          {atEndOfInput(input) ? (
            <VscArrowCircleRight size={24} className="Input-Arrow" />
          ) : (
            <div />
          )}
        </div>
      );
    }
  )
);

interface InputLineElemHandle {
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
      ref: React.ForwardedRef<InputLineElemHandle>
    ) => {
      const { value, index, next, last, onValueChange, onDelete } = props;

      const valueCellInputRef = React.useRef<ValueCellInputHandle>(null);

      React.useImperativeHandle(
        ref,
        (): InputLineElemHandle => ({
          getInputBoundingClientRect: (): DOMRect => {
            return nonNull(valueCellInputRef.current).getBoundingClientRect();
          },
          scrollIntoView: (): void => {
            nonNull(valueCellInputRef.current).scrollIntoView();
          },
        }),
        []
      );

      const handleValueChange = React.useCallback(
        (value: Value): void => {
          if (onValueChange !== undefined) {
            onValueChange(index, value);
          }
        },
        [index, onValueChange]
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
        [index, onDelete, onValueChange]
      );

      return (
        <>
          {last ? (
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
          )}
          {next ? (
            <VscArrowCircleRight size={24} className="Input-Arrow" />
          ) : (
            <div />
          )}
        </>
      );
    }
  )
);
