import { assertNever } from "assert-never";

import type {
  ExtensionDebugMessage,
  SimulatorDebugMessage,
} from "../../src/common/Vic/MessagesDebug";
import type { SourceFile } from "../../src/common/Vic/SourceFile";
import type { AppState } from "./AppState";
import { webviewPostMessage, type SimulatorManager } from "./VicSimulator";

export interface DebugState {
  panelReadyListeners: (() => void)[];

  stateUpdateListener: (() => void) | null;
  debugResponseStateListener: ((state: AppState) => void) | null;
  debugResponseSourceFileListener:
    | ((sourceFile: SourceFile | null) => void)
    | null;
  debugResponseShowErrorsListener: (() => void) | null;
}

export function initDebugState(): DebugState {
  return {
    panelReadyListeners: [],
    stateUpdateListener: null,
    debugResponseStateListener: null,
    debugResponseSourceFileListener: null,
    debugResponseShowErrorsListener: null,
  };
}

/**
 * Should be used only in tests.
 */
export async function waitForSimulatorReady(
  simulatorManager: SimulatorManager,
): Promise<void> {
  if (simulatorManager.panel !== null && simulatorManager.panel.ready) {
    return;
  }

  await new Promise<void>((resolve) => {
    simulatorManager.debugState.panelReadyListeners.push(resolve);
  });
}

/**
 * Should be used only in tests.
 */
export async function simulatorSetCpuRegisters(
  simulatorManager: SimulatorManager,
  setCpuRegisters: ExtensionDebugMessage.SetCpuRegisters,
): Promise<void> {
  await sendDebugMessage(
    simulatorManager,
    (resolve) => {
      simulatorManager.debugState.stateUpdateListener = resolve;
    },
    setCpuRegisters,
  );

  // This delay is needed so that VS Code WebviewPanels will have enough time
  // to persist their internal state. (When the Webview code calls
  // `vscode.setState`).
  //
  // Even though we waited for the "SetState" message to arrive from the
  // Simulator, it is still not guaranted that VS Code has completed
  // processing and persisting the `vscode.setState` call that came along with
  // it.
  //
  // I couldn't figure out a proper way to deterministically wait for this
  // wihout adding an artificial delay.
  await delay(200);
}

/**
 * Should be used only in tests.
 */
export async function simulatorDoLoadSourceFileClick(
  simulatorManager: SimulatorManager,
): Promise<void> {
  await sendDebugMessage(
    simulatorManager,
    (resolve) => {
      simulatorManager.debugState.stateUpdateListener = resolve;
    },
    { kind: "DoLoadSourceFileClick" },
  );
}

/**
 * Should be used only in tests.
 */
export async function simulatorDoShowErrorsClick(
  simulatorManager: SimulatorManager,
): Promise<void> {
  await sendDebugMessage(
    simulatorManager,
    (resolve) => {
      simulatorManager.debugState.debugResponseShowErrorsListener = resolve;
    },
    { kind: "DoShowErrorsClick" },
  );
}

async function sendDebugMessage(
  simulatorManager: SimulatorManager,
  assignResolve: (value: () => void) => void,
  message: ExtensionDebugMessage,
): Promise<void> {
  /* istanbul ignore next */
  if (simulatorManager.panel === null) {
    throw new Error("Simulator not ready");
  }

  await new Promise<void>((resolve) => {
    assignResolve(resolve);

    webviewPostMessage(simulatorManager, {
      kind: "DebugMessage",
      message: message,
    });
  });
}

/**
 * Should be used only in tests.
 */
export async function simulatorGetState(
  simulatorManager: SimulatorManager,
): Promise<AppState> {
  /* istanbul ignore next */
  if (simulatorManager.panel === null) {
    throw new Error("Simulator not ready");
  }

  return await new Promise<AppState>((resolve, reject) => {
    simulatorManager.debugState.debugResponseStateListener =
      callbackWithTimeout("simulatorGetState", resolve, reject);

    webviewPostMessage(simulatorManager, {
      kind: "DebugMessage",
      message: {
        kind: "RequestState",
      },
    });
  });
}

/**
 * Should be used only in tests.
 */
export async function simulatorGetSourceFile(
  simulatorManager: SimulatorManager,
): Promise<SourceFile | null> {
  /* istanbul ignore next */
  if (simulatorManager.panel === null) {
    throw new Error("Simulator not ready");
  }

  return await new Promise<SourceFile | null>((resolve, reject) => {
    simulatorManager.debugState.debugResponseSourceFileListener =
      callbackWithTimeout("simulatorGetSourceFile", resolve, reject);

    webviewPostMessage(simulatorManager, {
      kind: "DebugMessage",
      message: {
        kind: "RequestSourceFile",
      },
    });
  });
}

function callbackWithTimeout<T>(
  label: string,
  resolve: (value: T) => void,
  reject: (error: Error) => void,
): (value: T) => void {
  let rejected = false;

  const timeout = setTimeout(
    /* istanbul ignore next */
    () => {
      rejected = true;
      reject(new Error(`${label} timeout`));
    },
    5000,
  );

  return (sourceFile: T): void => {
    /* istanbul ignore else */
    if (!rejected) {
      clearTimeout(timeout);
      resolve(sourceFile);
    }
  };
}

export function handleDebugMessage(
  simulatorManager: SimulatorManager,
  message: SimulatorDebugMessage<AppState>,
): void {
  switch (message.kind) {
    case "RequestStateResponse":
      /* istanbul ignore next */
      if (simulatorManager.debugState.debugResponseStateListener === null) {
        throw new Error("Expected debugResponseStateListener to be set");
      }
      simulatorManager.debugState.debugResponseStateListener(message.state);
      simulatorManager.debugState.debugResponseStateListener = null;
      break;
    case "RequestSourceFileResponse":
      /* istanbul ignore next */
      if (
        simulatorManager.debugState.debugResponseSourceFileListener === null
      ) {
        throw new Error("Expected debugResponseSourceFileListener to be set");
      }
      simulatorManager.debugState.debugResponseSourceFileListener(
        message.sourceFile,
      );
      simulatorManager.debugState.debugResponseSourceFileListener = null;
      break;
    /* istanbul ignore next */
    default:
      assertNever(message);
  }
}

async function delay(milliseconds: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
