import * as React from "react";
import type { ExtensionBridge } from "../../System/ExtensionBridge";

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
export function useWindowMessages<T, U>(
  extensionBridge: ExtensionBridge<U>,
  onMessage: (e: T) => void
): void {
  const onMessageRef = React.useRef<(e: T) => void>(onMessage);
  onMessageRef.current = onMessage;

  React.useEffect(() => {
    function handleEvent(e: MessageEvent): void {
      const message = e.data as IncomingMessage<T>;
      if (message.source === "vic-ide-ext") {
        onMessageRef.current(message);
      }
    }

    window.addEventListener("message", handleEvent);
    extensionBridge.postMessage({
      kind: "Ready",
    });
    return () => {
      window.removeEventListener("message", handleEvent);
    };
  }, [extensionBridge]);
}
