import "./ValueCellInput.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import type { ChangeEvent, FormEvent } from "react";
import { type FocusableElement, tabbable } from "tabbable";
import type { Value } from "../Computer/Value";

export interface ValueCellInputProps {
  value: Value;

  // TODO Do we need this?
  allowBlank?: boolean;

  onValueChange?: (value: Value) => void;
}

export const ValueCellInput = React.memo(function ValueCellInput(
  props: ValueCellInputProps
): JSX.Element {
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

  // Key that we use in the input element's dataset that indicates if the user
  // has just pressed the "Escape" key.
  const HANDLING_ESCAPE_KEY = "HANDLING_ESCAPE";

  // This happens when the user tabs out of the input element, or clicks
  // outside of it.
  const handleBlur = React.useCallback((): void => {
    if (inputRef.current !== null) {
      // If the user has just pressed the escape key then we need to ignore
      // this event, because the previous handler has already handled
      // everything.
      if (inputRef.current.dataset[HANDLING_ESCAPE_KEY] === "true") {
        inputRef.current.dataset[HANDLING_ESCAPE_KEY] = "false";
        return;
      }
    }

    const value = inputStr === "" ? 0 : parseInt(inputStr, 10);

    // If the "inputStr" has any leading zeroes then we remove them:
    if (inputStr !== `${value}`) {
      setInputStr(`${value}`);
    }

    if (onValueChange !== undefined) {
      onValueChange(value);
    }
  }, [inputRef, inputStr, onValueChange]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Escape") {
        if (inputRef.current !== null) {
          setInputStr(`${value}`);

          // Set the displayed value of the input element to the previous
          // value:
          inputRef.current.value = `${value}`;

          // We are about to blur the input element. But when we do that, the
          // "handleBlur" callback will be called, causing trouble (Even
          // though we just called "setInputStr" it will see the previous
          // value, due to the way react works).
          //
          // We store a value on the input's dataset as a way to signal to the
          // "handleBlur" callback that this specific event should be ignored.
          inputRef.current.dataset[HANDLING_ESCAPE_KEY] = "true";

          // Deselect the input:
          inputRef.current.blur();
        }
      }
    },
    [inputRef, value]
  );

  // This happens when the user presses enter when the input element is
  // focused.
  const handleSubmit = React.useCallback(
    (e: FormEvent<HTMLFormElement>): void => {
      // Prevent the default behaviour of a page refresh:
      e.preventDefault();

      if (inputRef.current !== null) {
        const nextElem = nextTabbableElement(inputRef.current);
        if (nextElem !== null) {
          nextElem.focus();
        } else {
          inputRef.current.blur();
        }
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
        onKeyDown={handleKeyDown}
      />
    </form>
  );
});

const ASCII0 = "0".charCodeAt(0);
const ASCII9 = "9".charCodeAt(0);

/**
 * @returns the given string, but stripped of any letters or non-digit
 * characters, such that the returned string is an integer in the range
 * [-999..999]. It may have leading zero characters.
 */
export function sanitizeValue(value: string): string {
  let sanitized = "";

  const negative = value.charCodeAt(0) === "-1".charCodeAt(0);

  for (const char of value) {
    if (char.charCodeAt(0) >= ASCII0 && char.charCodeAt(0) <= ASCII9) {
      sanitized += char;
    }
  }

  sanitized = sanitized.substring(0, 3);

  if (negative && sanitized !== "") {
    sanitized = `-${sanitized}`;
  }

  return sanitized;
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
