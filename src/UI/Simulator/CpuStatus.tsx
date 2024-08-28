import "./CpuStatus.css";

import * as React from "react";

import { assertNever } from "assert-never";

import type { CpuState } from "../../Computer/SimulatorState";
import type { UIStrings } from "../UIStrings";

export interface CpuStatusProps {
  uiString: UIStrings;

  cpuState: CpuState;
  cpuWorking: boolean;
}

export const CpuStatus = React.memo(
  (props: CpuStatusProps): React.JSX.Element => {
    const { uiString, cpuState, cpuWorking } = props;

    return (
      <div className="CpuStatus-Root">
        <div>{uiString("CPU_STATUS")}</div>
        <div className="CpuStatus-Message">
          <CpuStatusMessage
            uiString={uiString}
            cpuState={cpuState}
            cpuWorking={cpuWorking}
          />
        </div>
      </div>
    );
  },
);

interface CpuStatusMessageProps {
  uiString: UIStrings;

  cpuState: CpuState;
  cpuWorking: boolean;
}

function CpuStatusMessage(props: CpuStatusMessageProps): React.JSX.Element {
  const { uiString, cpuState, cpuWorking } = props;

  switch (cpuState.kind) {
    case "Stopped":
      switch (cpuState.stopResult) {
        case "STOP":
          return <span className="CpuStatus-Stop">{uiString("CPU_STOP")}</span>;
        case "NO_INPUT":
          return (
            <span className="CpuStatus-NoInput">
              {uiString("CPU_NO_INPUT")}
            </span>
          );
        case "INVALID_INSTRUCTION":
          return (
            <span className="CpuStatus-InvalidInstruction">
              {uiString("CPU_INVALID_INSTRUCTION")}
            </span>
          );
        case "INVALID_WRITE":
          return (
            <span className="CpuStatus-InvalidInstruction">
              {uiString("CPU_INVALID_WRITE")}
            </span>
          );
        default:
          return assertNever(cpuState.stopResult);
      }
    case "PendingFetch":
      if (cpuWorking) {
        return (
          <span className="CpuStatus-Fetching">{uiString("CPU_FETCHING")}</span>
        );
      } else {
        return <span>{uiString("CPU_IDLE_PENDING_FETCH")}</span>;
      }
    case "PendingExecute":
      if (cpuWorking) {
        return (
          <span className="CpuStatus-Executing">
            {uiString("CPU_EXECUTING")}
          </span>
        );
      } else {
        return <span>{uiString("CPU_IDLE_PENDING_EXECUTE")}</span>;
      }
    default:
      return assertNever(cpuState);
  }
}
