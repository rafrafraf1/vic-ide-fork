import * as React from "react";

/**
 * Returns the previous value (prop or state).
 *
 * See:
 * <https://blog.logrocket.com/accessing-previous-props-state-react-hooks/>
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
