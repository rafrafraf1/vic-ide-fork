import * as React from "react";

/**
 * All incoming messages are meant for us are tagged with a "source", so that
 * we can ignore messages that are not for us (for example, various browser
 * extensions send messages to the window).
 *
 * Example: The react-devtools browser extension
 * (<https://github.com/facebook/react/tree/main/packages/react-devtools>)
 * sends such messages. See:
 * <https://github.com/facebook/react-devtools/issues/812>
 */
type IncomingMessage<T> = T & { source?: "vic-ide-ext" };

/**
 * Enables a React component to listen to window "message" events that are
 * sent by the host VS Code extension.
 *
 * Reference:
 * <https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-an-extension-to-a-webview>
 *
 * @param onMessage This will be called whenever a new message arrives.
 */
export function useWindowMessages<T>(onMessage: (e: T) => void): void {
  const handleEvent = React.useCallback(
    (e: MessageEvent) => {
      const message = e.data as IncomingMessage<T>;
      if (message.source === "vic-ide-ext") {
        onMessage(message);
      }
    },
    [onMessage]
  );

  React.useEffect(() => {
    window.addEventListener("message", handleEvent);
    return () => {
      window.removeEventListener("message", handleEvent);
    };
  }, [handleEvent]);
}
