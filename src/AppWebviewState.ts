import {
  newSimulatorState,
  type SimulatorState,
} from "./Computer/SimulatorState";
import { newHelpScreenState, type HelpScreenState } from "./HelpScreen";

export interface AppWebviewState {
  simulatorState: SimulatorState;
  helpScreenState: HelpScreenState;
}

export function newAppWebviewState(): AppWebviewState {
  return {
    simulatorState: newSimulatorState(),
    helpScreenState: newHelpScreenState(),
  };
}
