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
  onMessage: (e: T) => void,
): void {
  const onMessageRef = React.useRef<(e: T) => void>(onMessage);
  onMessageRef.current = onMessage;

  // We want the property that if multiple messages arrives quickly, a full
  // re-render happens between each dispatch.
  //
  // This is important so that if the handler of the first message calls a
  // React "setState" function, then the handler of the next message will see
  // the updated state.
  //
  // To achieve this, we use a message queue, and a "counter" state variable
  // used to trigger re-renders.

  const messageQueueRef = React.useRef<T[]>([]);
  const [counter, setCounter] = React.useState(0);

  React.useEffect(() => {
    const nextMessage = messageQueueRef.current.shift();
    if (nextMessage !== undefined) {
      onMessageRef.current(nextMessage);
      if (messageQueueRef.current.length > 0) {
        // Trigger a re-render, so that the next message in the queue will be
        // dispatched:
        setCounter(counter + 1);
      }
    }
  }, [counter]);

  React.useEffect(() => {
    function handleEvent(e: MessageEvent): void {
      const message = e.data as IncomingMessage<T>;
      if (message.source === "vic-ide-ext") {
        messageQueueRef.current.push(message);

        // Trigger a re-render, so that the message that was just queued will
        // be dispatched:
        setCounter((c) => c + 1);
      }
    }

    window.addEventListener("message", handleEvent);
    extensionBridge.postMessage({
      kind: "Ready",
    });
    return () => {
      window.removeEventListener("message", handleEvent);
    };

    // It is important that there are no dependencies here (other than
    // "extensionBridge") so that the event listener is not
    // de-registered/re-registered unnecessarily (which could cause us to miss
    // events):
  }, [extensionBridge]);
}
