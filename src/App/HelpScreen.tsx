import * as React from "react";

import { assertNever } from "assert-never";

import { HelpScreen, HelpSidebar } from "../UI/HelpScreen";

export type HelpScreenState = "CLOSED" | "OPEN" | "PINNED";

export function newHelpScreenState(): HelpScreenState {
  return "CLOSED";
}

export interface HelpScreenControls {
  helpScreenState: HelpScreenState;
  handleHelpClick: () => void;
  helpScreenSidebarElem: React.JSX.Element;
  helpScreenWindowElem: React.JSX.Element;
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

  const helpScreenSidebarElem = (
    <>
      {helpScreenState === "PINNED" ? (
        <div className="App-HelpSidebar-Cont">
          <HelpSidebar
            onCloseClick={handleHelpScreenCloseClick}
            onUnpinClick={handleHelpScreenUnpinClick}
          />
        </div>
      ) : null}
    </>
  );

  const helpScreenWindowElem = (
    <>
      {helpScreenState === "OPEN" ? (
        <HelpScreen
          onCloseClick={handleHelpScreenCloseClick}
          onPinClick={handleHelpScreenPinClick}
        />
      ) : null}
    </>
  );

  return {
    helpScreenState,
    handleHelpClick,
    helpScreenSidebarElem,
    helpScreenWindowElem,
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
