import "./ValueCellInput.css";

import * as React from "react";
import type { ChangeEvent, FormEvent } from "react";

import { hide } from "@popperjs/core";
import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { tabbable, type FocusableElement } from "tabbable";

import type { Value } from "../Computer/Value";
import { nonNull } from "../Functional/Nullability";
import { sanitizeValue } from "./ValueCellInput/SanitizeValue";

export interface ValueCellInputHandle {
  /**
   * Focus the input element.
   */
  focus: () => void;

  /**
   * @returns the position and size of the input element.
   */
  getBoundingClientRect: () => DOMRect;

  /**
   * Scrolls the ancestor containers such that the input element will be
   * visible (calls the DOM `scrollIntoView` method).
   */
  scrollIntoView: () => void;
}

interface ValueCellInputPropsMixin {
  highlighted?: boolean;
  disabled?: boolean;
  tooltip?: string;
  enableEnterEvent?: boolean;
  onEnterPressed?: () => void;
}

export interface ValueCellInputProps extends ValueCellInputPropsMixin {
  value: Value;
  onValueChange?: (value: Value) => void;
}

export const ValueCellInput: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ValueCellInputTemplateProps<number> &
      React.RefAttributes<ValueCellInputHandle>
  >
> = React.memo(
  ValueCellInputTemplate<number>({
    renderValue: (value: number): string => {
      return `${value}`;
    },
    parseInput: (inputStr: string): number => {
      if (inputStr === "" || inputStr === "-") {
        return 0;
      } else {
        return parseInt(inputStr, 10);
      }
    },
  }),
);

export interface BlankableValueCellInputProps extends ValueCellInputPropsMixin {
  value: Value | null;
  onValueChange?: (value: Value | null) => void;
}

export const BlankableValueCellInput: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ValueCellInputTemplateProps<number | null> &
      React.RefAttributes<ValueCellInputHandle>
  >
> = React.memo(
  ValueCellInputTemplate<number | null>({
    renderValue: (value: number | null): string => {
      if (value === null) {
        return "";
      } else {
        return `${value}`;
      }
    },
    parseInput: (inputStr: string): number | null => {
      if (inputStr === "" || inputStr === "-") {
        return null;
      } else {
        return parseInt(inputStr, 10);
      }
    },
  }),
);

interface ValueCellInputTemplateProps<T> extends ValueCellInputPropsMixin {
  value: T;
  onValueChange?: (value: T) => void;
}

interface ValueCellInputTemplateParams<T> {
  renderValue: (value: T) => string;
  parseInput: (inputStr: string) => T;
}

function ValueCellInputTemplate<T>(
  params: ValueCellInputTemplateParams<T>,
): React.ForwardRefExoticComponent<
  ValueCellInputTemplateProps<T> & React.RefAttributes<ValueCellInputHandle>
> {
  return React.forwardRef<ValueCellInputHandle, ValueCellInputTemplateProps<T>>(
    (
      props: ValueCellInputTemplateProps<T>,
      ref: React.ForwardedRef<ValueCellInputHandle>,
    ): React.JSX.Element => {
      const {
        value,
        highlighted,
        disabled,
        tooltip,
        enableEnterEvent,
        onEnterPressed,
        onValueChange,
      } = props;

      const [inputStr, setInputStr] = React.useState<string>(() =>
        params.renderValue(value),
      );

      const [focused, setFocused] = React.useState<boolean>(false);

      const inputRef = React.useRef<HTMLInputElement>(null);

      React.useImperativeHandle(
        ref,
        (): ValueCellInputHandle => ({
          focus: (): void => {
            nonNull(inputRef.current).focus();
          },

          getBoundingClientRect: (): DOMRect => {
            return nonNull(inputRef.current).getBoundingClientRect();
          },

          scrollIntoView: (): void => {
            // Reference: <https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView>
            const scrollOptions: ScrollIntoViewOptions = {
              block: "nearest",
            };
            nonNull(inputRef.current).scrollIntoView(scrollOptions);
          },
        }),
        [inputRef],
      );

      // React to changes to the "value" prop
      React.useEffect(() => {
        // If we are focused then we ignore the change. The user is editing the
        // value and that is what takes preference.
        if (document.activeElement === inputRef.current) {
          return;
        }

        if (value !== params.parseInput(inputStr)) {
          setInputStr(params.renderValue(value));
        }
      }, [inputRef, inputStr, value]);

      const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        if (disabled === true) {
          return;
        }
        setInputStr(sanitizeValue(e.target.value));
      };

      const handleFocus = (): void => {
        if (inputRef.current !== null) {
          setFocused(true);

          // When the user focuses the input element, we want to to select the
          // input text, so that it is ready to be replaced.
          inputRef.current.select();
        }
      };

      const updateValue = React.useCallback((): void => {
        const value = params.parseInput(inputStr);

        // If the "inputStr" has any leading zeroes then we remove them:
        if (inputStr !== params.renderValue(value)) {
          setInputStr(params.renderValue(value));
        }

        if (onValueChange !== undefined) {
          onValueChange(value);
        }
      }, [inputStr, onValueChange]);

      // Key that we use in the input element's dataset that indicates if the
      // user has just pressed the "Escape" key.
      const HANDLING_ESCAPE_KEY = "HANDLING_ESCAPE";

      // This happens when the user tabs out of the input element, or clicks
      // outside of it.
      const handleBlur = React.useCallback((): void => {
        if (inputRef.current !== null) {
          setFocused(false);

          // If the user has just pressed the escape key then we need to
          // ignore this event, because the previous handler has already
          // handled everything.
          if (inputRef.current.dataset[HANDLING_ESCAPE_KEY] === "true") {
            inputRef.current.dataset[HANDLING_ESCAPE_KEY] = "false";
            return;
          }
        }

        updateValue();
      }, [updateValue]);

      const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>): void => {
          if (e.key === "Escape") {
            if (inputRef.current !== null) {
              setInputStr(params.renderValue(value));

              // Set the displayed value of the input element to the previous
              // value:
              inputRef.current.value = params.renderValue(value);

              // We are about to blur the input element. But when we do that,
              // the "handleBlur" callback will be called, causing trouble
              // (Even though we just called "setInputStr" it will see the
              // previous value, due to the way react works).
              //
              // We store a value on the input's dataset as a way to signal to
              // the "handleBlur" callback that this specific event should be
              // ignored.
              inputRef.current.dataset[HANDLING_ESCAPE_KEY] = "true";

              // Deselect the input:
              inputRef.current.blur();
            }
          }
        },
        [inputRef, value],
      );

      // This happens when the user presses enter when the input element is
      // focused.
      const handleSubmit = React.useCallback(
        (e: FormEvent<HTMLFormElement>): void => {
          // Prevent the default behaviour of a page refresh:
          e.preventDefault();

          if (inputRef.current !== null) {
            if (enableEnterEvent !== undefined && enableEnterEvent) {
              updateValue();

              if (onEnterPressed !== undefined) {
                onEnterPressed();
              }

              inputRef.current.select();
              return;
            }

            const nextElem = nextTabbableElement(inputRef.current);
            if (nextElem !== null) {
              nextElem.focus();
            } else {
              inputRef.current.blur();
            }
          }
        },
        [enableEnterEvent, onEnterPressed, updateValue],
      );

      const elem = (
        <form
          className={classNames("ValueCellInput", {
            "ValueCellInput-highlighted": highlighted,
          })}
          onSubmit={handleSubmit}
        >
          <input
            ref={inputRef}
            value={inputStr}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        </form>
      );

      if (tooltip === undefined) {
        return elem;
      } else {
        return (
          <Tippy
            className="ValueCellInput-tippy"
            content={tooltip}
            placement="right"
            visible={focused}
            offset={[0, 28]}
            popperOptions={{
              strategy: "fixed",
              modifiers: [hide],
            }}
          >
            {elem}
          </Tippy>
        );
      }
    },
  );
}

/**
 * @returns the Element that comes after the target element in the tab-order
 * of the document (The element that would be focused if the user were to
 * press the "Tab" key). Returns `null` if a next element could not be found.
 */
function nextTabbableElement(elem: HTMLElement): FocusableElement | null {
  const allElements = tabbable(document.body);
  for (let i = 0; i < allElements.length; ++i) {
    if (allElements[i] === elem) {
      const nextElem = allElements[i + 1];
      if (nextElem === undefined) {
        // The target element is the last one in the document
        return null;
      }
      return nextElem;
    }
  }
  return null;
}
