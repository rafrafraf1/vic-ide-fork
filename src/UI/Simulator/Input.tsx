import "./Input.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import {
  BlankableValueCellInput,
  ValueCellInput,
  type ValueCellInputHandle,
} from "../ValueCellInput";
import { Button, ButtonLabel } from "../Components/Button";
import { type InputState, atEndOfInput } from "../../Computer/Input";
import { VscArrowCircleLeft, VscTrash } from "react-icons/vsc";
import type { Value } from "../../Computer/Value";
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
}

export const Input = React.memo(
  React.forwardRef(
    (props: InputProps, ref: React.ForwardedRef<InputHandle>) => {
      const { input, onAppendInput, onInputChange } = props;

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

      return (
        <div className="Input-Root">
          {input.values.map((value, index) => (
            <React.Fragment key={index}>
              <InputLineElem
                ref={index === input.next ? nextInputLineElemRef : undefined}
                value={value}
                index={index}
                next={index === input.next}
                onValueChange={handleValueChange}
              />
            </React.Fragment>
          ))}
          <div />
          <BlankableValueCellInput
            key={input.values.length}
            value={null}
            onValueChange={handleNewInputCellChange}
          />
          {atEndOfInput(input) ? (
            <VscArrowCircleLeft size={24} className="Input-Arrow" />
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
  onValueChange?: (index: number, value: Value) => void;
}

const InputLineElem = React.memo(
  React.forwardRef(
    (
      props: InputLineElemProps,
      ref: React.ForwardedRef<InputLineElemHandle>
    ) => {
      const { value, index, next, onValueChange } = props;

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

      return (
        <>
          <Button>
            <ButtonLabel>
              <VscTrash size={18} />
            </ButtonLabel>
          </Button>
          <ValueCellInput
            ref={valueCellInputRef}
            value={value}
            onValueChange={handleValueChange}
          />
          {next ? (
            <VscArrowCircleLeft size={24} className="Input-Arrow" />
          ) : (
            <div />
          )}
        </>
      );
    }
  )
);
