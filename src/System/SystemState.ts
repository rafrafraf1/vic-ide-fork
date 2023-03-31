import type { WebviewApi } from "vscode-webview";

/**
 * A service for saving and restoring the state of the app. This is needed in
 * the VSCode extension, because the app may be destroyed/recreated at any
 * time (when the user changes tab).
 *
 * You should call "getState" when the app starts up to initialize from the
 * current state, and call "setState" anytime the state changes.
 *
 * Reference:
 * <https://code.visualstudio.com/api/extension-guides/webview#persistence>
 *
 * Reference:
 * <https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/vscode-webview/index.d.ts>
 */
export interface SystemStateService<StateType> {
  getState: () => StateType | undefined;
  setState: (newState: StateType | undefined) => void;
}

let getSystemStateServiceCalled = false;

/**
 * For the VSCode extension, this will return an instance of
 * VSCodeSystemStateService.
 *
 * For the Browser version, this currently returns a DummySystemStateService.
 *
 * The SystemStateService is a global service and there is only one of it. To
 * ensure that only one component is responsible for managing it, this
 * function can only be called once. If it is called a second time it will
 * throw an Error.
 */
export function getSystemStateService<
  StateType
>(): SystemStateService<StateType> {
  if (getSystemStateServiceCalled) {
    throw new Error("getSystemStateService already called");
  }
  getSystemStateServiceCalled = true;

  if ("acquireVsCodeApi" in window) {
    const vscode = acquireVsCodeApi<StateType>();
    console.log("getSystemStateService: VSCode");
    return new VSCodeSystemStateService<StateType>(vscode);
  } else {
    console.log("getSystemStateService: Browser");
    // TODO For browsers return an instance of DummySystemStateService
    return new DummySystemStateService<StateType>();
  }
}

/**
 * The type used to send the state via "postMessage". This format is
 * understood by the extension.
 */
interface StateMessage<StateType> {
  state: StateType | undefined;
}

export class VSCodeSystemStateService<StateType>
  implements SystemStateService<StateType>
{
  constructor(private vscode: WebviewApi<StateType>) {
    // Do Nothing
  }

  getState(): StateType | undefined {
    const state = this.vscode.getState();
    if (state !== undefined) {
      return state;
    } else {
      const state = document.body.dataset["state"];
      if (state !== undefined) {
        return JSON.parse(state) as StateType;
      }
      return undefined;
    }
  }

  setState(newState: StateType | undefined): void {
    this.vscode.setState(newState);
    const stateMessage: StateMessage<StateType> = {
      state: newState,
    };
    this.vscode.postMessage(stateMessage);
  }
}

export class DummySystemStateService<StateType>
  implements SystemStateService<StateType>
{
  getState(): StateType | undefined {
    return undefined;
  }

  setState(newState: StateType | undefined): void {
    // Do Nothing
  }
}

export class BrowserSystemStateService<StateType>
  implements SystemStateService<StateType>
{
  getState(): StateType | undefined {
    // TODO Implement this using Browser LocalStorage API
    throw new Error("TODO");
  }

  setState(newState: StateType | undefined): void {
    // TODO Implement this using Browser LocalStorage API
    throw new Error("TODO");
  }
}
