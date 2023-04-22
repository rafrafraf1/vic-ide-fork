import type { ExecuteResult } from "./Computer";
import type { Value } from "./Value";
import { assertNever } from "assert-never";

export type OutputLine = OutputLine.PrintedValue | OutputLine.Message;

export namespace OutputLine {
  export interface PrintedValue {
    kind: "PrintedValue";
    value: Value;
  }

  export interface Message {
    kind: "Message";
    text: string;
    error: boolean;
  }
}

export interface OutputState {
  lines: OutputLine[];
}

export function emptyOutput(): OutputState {
  return {
    lines: [],
  };
}

export function printValue(value: Value): (output: OutputState) => OutputState {
  return (output: OutputState): OutputState => {
    return {
      lines: output.lines.concat([
        {
          kind: "PrintedValue",
          value: value,
        },
      ]),
    };
  };
}

export function printMessage(
  text: string,
  error: boolean = false
): (output: OutputState) => OutputState {
  return (output: OutputState): OutputState => {
    return {
      lines: output.lines.concat([
        {
          kind: "Message",
          text: text,
          error: error,
        },
      ]),
    };
  };
}

export function printError(text: string): (output: OutputState) => OutputState {
  return printMessage(text, true);
}

export function processExecuteResult(
  executeResult: ExecuteResult
): (output: OutputState) => OutputState {
  if (executeResult.output !== null) {
    return printValue(executeResult.output);
  } else if (executeResult.stop !== null) {
    switch (executeResult.stop) {
      case "STOP":
        return printMessage("STOP");
      case "NO_INPUT":
        return printError("No input");
      default:
        return assertNever(executeResult.stop);
    }
  } else {
    return (output) => output;
  }
}
