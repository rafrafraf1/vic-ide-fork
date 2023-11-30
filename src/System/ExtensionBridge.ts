import type { WebviewApi } from "vscode-webview";

import type { SimulatorMessage } from "../common/Vic/Messages";

/**
 * A service for communicating with the VS Code extension code that houses the
 * Webview.
 *
 * It provides state management, which is needed in the VS Code extension,
 * because the app may be destroyed/recreated at any time (when the user
 * changes tab).
 *
 * You should call `getState` when the app starts up to initialize from the
 * current state, and call `setState` anytime the state changes.
 *
 * You can also call `postMessage` to send arbitrary messages to the VS Code
 * extension code.
 *
 * Reference:
 * <https://code.visualstudio.com/api/extension-guides/webview#persistence>
 * <https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-an-extension-to-a-webview>
 */
export interface ExtensionBridge<StateType> {
  getState: () => StateType | null;
  setState: (newState: StateType) => void;
  postMessage: (message: SimulatorMessage<StateType>) => void;
}

let getExtensionBridgeCalled = false;

/**
 * For the VSCode extension, this will return an instance of
 * VSCodeExtensionBridge.
 *
 * For the Browser version, this currently returns a DummyExtensionBridge.
 *
 * The ExtensionBridge is a global service and there is only one of it. To
 * ensure that only one component is responsible for managing it, this
 * function can only be called once. If it is called a second time it will
 * throw an Error.
 */
export function getExtensionBridge<StateType>(): ExtensionBridge<StateType> {
  if (getExtensionBridgeCalled) {
    throw new Error("getExtensionBridge already called");
  }
  getExtensionBridgeCalled = true;

  if ("acquireVsCodeApi" in window) {
    const vscode = acquireVsCodeApi<StateType>();
    console.log("getExtensionBridge: VSCode");
    return new VSCodeExtensionBridge<StateType>(vscode);
  } else {
    console.log("getExtensionBridge: Browser");
    // TODO For browsers return an instance of BrowserExtensionBridge
    return new DummyExtensionBridge<StateType>();
  }
}

export class VSCodeExtensionBridge<StateType>
  implements ExtensionBridge<StateType>
{
  constructor(private vscode: WebviewApi<StateType>) {
    // Do Nothing
  }

  getState(): StateType | null {
    const state = this.vscode.getState();
    if (state !== undefined) {
      return state;
    } else {
      const state = document.body.dataset["state"];
      if (state !== undefined) {
        return JSON.parse(state) as StateType;
      }
      return null;
    }
  }

  setState(newState: StateType): void {
    this.vscode.setState(newState !== null ? newState : undefined);
    const stateMessage: SimulatorMessage.SetState<StateType> = {
      kind: "SetState",
      state: newState,
    };
    this.postMessage(stateMessage);
  }

  postMessage(message: SimulatorMessage<StateType>): void {
    this.vscode.postMessage(message);
  }
}

export class DummyExtensionBridge<StateType>
  implements ExtensionBridge<StateType>
{
  getState(): StateType | null {
    return null;
  }

  setState(newState: StateType): void {
    // Do Nothing
  }

  postMessage(message: SimulatorMessage<StateType>): void {
    // Do Nothing
  }
}

export class BrowserExtensionBridge<StateType>
  implements ExtensionBridge<StateType>
{
  getState(): StateType | null {
    // TODO Implement this using Browser LocalStorage API
    throw new Error("TODO");
  }

  setState(newState: StateType): void {
    // TODO Implement this using Browser LocalStorage API
    throw new Error("TODO");
  }

  postMessage(message: SimulatorMessage<StateType>): void {
    // Do Nothing
  }
}
