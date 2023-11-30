import * as React from "react";

import { usePrevious } from "./UsePrevious";

/**
 * useEvents is a React hook that provides an API to trigger events on a
 * component.
 *
 * It returns a function that acts as the "trigger". When the trigger is
 * called, it causes the component to re-render, at which point the hook
 * callback will also be called (with the payload from the trigger).
 *
 * This hook is useful in asynchronous contexts. For example, if you use
 * setTimeout (or make an AJAX call), then the component's React state
 * variables will not be updated in the setTimeout callback. You can solve
 * this by using `useEvents`: in your setTimeout callback, call "trigger", and
 * then move your logic into the hook callback. Now all of the state variables
 * will be up-to-date.
 *
 * Use like this:
 *
 *     function MyComponent() {
 *       const triggerMyEvent = useEvents<MyEvent>((myEvent: MyEvent) => {
 *         console.log("Event triggered:", myEvent);
 *       });
 *
 *       return <button onClick={() => triggerMyEvent({ foo: "bar" })}></button>;
 *     }
 */
export function useEvents<T>(onEvent: (e: T) => void): (e: T) => void {
  const [counter, setCounter] = React.useState(0);
  const prevCount = usePrevious(counter);
  const eRef = React.useRef<T | null>(null);

  React.useEffect(() => {
    if (counter !== prevCount) {
      if (eRef.current === null) {
        return;
      }
      onEvent(eRef.current);
    }
  }, [counter, onEvent, prevCount]);

  const trigger = React.useCallback((e: T): void => {
    eRef.current = e;
    setCounter((value) => value + 1);
  }, []);

  return trigger;
}
