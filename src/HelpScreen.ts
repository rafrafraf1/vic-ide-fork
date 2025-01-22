import * as React from "react";

import { assertNever } from "assert-never";

export type HelpScreenState = "CLOSED" | "OPEN" | "PINNED";

export function newHelpScreenState(): HelpScreenState {
  return "CLOSED";
}

export interface HelpScreenControls {
  helpScreenState: HelpScreenState;
  handleHelpClick: () => void;
  handleHelpScreenCloseClick: () => void;
  handleHelpScreenPinClick: () => void;
  handleHelpScreenUnpinClick: () => void;
}

export function useHelpScreen(
  initialState: HelpScreenState,
): HelpScreenControls {
  const [helpScreenState, setHelpScreenState] = React.useState(initialState);

  const handleHelpClick = React.useCallback((): void => {
    setHelpScreenState(toggleHelpScreenState);
  }, [setHelpScreenState]);

  const handleHelpScreenCloseClick = React.useCallback((): void => {
    setHelpScreenState("CLOSED");
  }, [setHelpScreenState]);

  const handleHelpScreenPinClick = React.useCallback((): void => {
    setHelpScreenState("PINNED");
  }, [setHelpScreenState]);

  const handleHelpScreenUnpinClick = React.useCallback((): void => {
    setHelpScreenState("OPEN");
  }, [setHelpScreenState]);

  return {
    helpScreenState,
    handleHelpClick,
    handleHelpScreenCloseClick,
    handleHelpScreenPinClick,
    handleHelpScreenUnpinClick,
  };
}

function toggleHelpScreenState(
  helpScreenState: HelpScreenState,
): HelpScreenState {
  switch (helpScreenState) {
    case "CLOSED":
      return "OPEN";
    case "OPEN":
      return "CLOSED";
    case "PINNED":
      return "CLOSED";
    default:
      return assertNever(helpScreenState);
  }
}
