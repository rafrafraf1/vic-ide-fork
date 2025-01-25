import { assertNever } from "assert-never";

import { executeInstruction, fetchInstruction } from "./Computer";
import { consumeInput, readNextInput } from "./Input";
import { appendOutput, isOutputFull } from "./Output";
import type { HardwareState } from "./SimulatorState";

/**
 * The number of iterations that can be run such that they all complete in real
 * time, at 60 FPS (meaning they complete within 16 milliseconds).
 *
 * This depends on the actual hardware and JavaScript runtime that is being
 * used, but the chosen value is appropriate for the average setup.
 *
 * This number is chosen to be a bit random (and prime) so that programs that
 * infinitely loop will show "interesting"(random) snapshots of their execution
 * instead of a predictable pattern.
 */
export const NUM_ITERATIONS_FOR_REAL_TIME = 107347;

/**
 * Runs multiple simulation iterations, each iteration is either an instruction
 * fetch, or an instruction execution.
 *
 * @param hardwareState initial HardwareState
 * @param numIterations maximum number of iterations to run. This is needed in
 *                      case the program never terminates.
 *
 * @returns The new HardwareState
 */
export function runSimulatorIterations(
  hardwareState: HardwareState,
  numIterations: number,
): HardwareState {
  let curHardwareState: HardwareState = hardwareState;

  for (let i = 0; i < numIterations; i++) {
    switch (curHardwareState.cpuState.kind) {
      case "Stopped":
        return curHardwareState;
      case "PendingFetch": {
        curHardwareState = doFetch(curHardwareState);
        break;
      }
      case "PendingExecute": {
        curHardwareState = doExecute(curHardwareState);
        break;
      }
      default:
        return assertNever(curHardwareState.cpuState);
    }
  }

  return curHardwareState;
}

function doFetch(hardwareState: HardwareState): HardwareState {
  const newComputer = fetchInstruction(hardwareState.computer);
  return {
    computer: newComputer,
    cpuState: { kind: "PendingExecute" },
    input: hardwareState.input,
    output: hardwareState.output,
  };
}

function doExecute(hardwareState: HardwareState): HardwareState {
  const nextInput = readNextInput(hardwareState.input);
  const [newComputer, executeResult] = executeInstruction(
    hardwareState.computer,
    nextInput,
    isOutputFull(hardwareState.output),
    true,
  );
  return {
    computer: newComputer,
    cpuState:
      executeResult.stop !== null
        ? { kind: "Stopped", stopResult: executeResult.stop }
        : { kind: "PendingFetch" },
    input: executeResult.consumedInput
      ? consumeInput(hardwareState.input)
      : hardwareState.input,
    output:
      executeResult.output !== null
        ? appendOutput(executeResult.output)(hardwareState.output)
        : hardwareState.output,
  };
}
