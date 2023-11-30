import "./CpuStatus.css";

import * as React from "react";

import { assertNever } from "assert-never";

import type { StopResult } from "../../Computer/Computer";
import type { CpuState } from "../../Computer/CpuState";
import type { UIStrings } from "../UIStrings";

export interface CpuStatusProps {
  uiString: UIStrings;

  cpuStopped: StopResult | null;
  cpuState: CpuState;
}

export const CpuStatus = React.memo((props: CpuStatusProps): JSX.Element => {
  const { uiString, cpuStopped, cpuState } = props;

  return (
    <div className="CpuStatus-Root">
      <div>{uiString("CPU_STATUS")}</div>
      <div className="CpuStatus-Message">
        <CpuStatusMessage
          uiString={uiString}
          cpuStopped={cpuStopped}
          cpuState={cpuState}
        />
      </div>
    </div>
  );
});

interface CpuStatusMessageProps {
  uiString: UIStrings;

  cpuStopped: StopResult | null;
  cpuState: CpuState;
}

function CpuStatusMessage(props: CpuStatusMessageProps): JSX.Element {
  const { uiString, cpuStopped, cpuState } = props;

  if (cpuStopped !== null) {
    switch (cpuStopped) {
      case "STOP":
        return <span className="CpuStatus-Stop">{uiString("CPU_STOP")}</span>;
      case "NO_INPUT":
        return (
          <span className="CpuStatus-NoInput">{uiString("CPU_NO_INPUT")}</span>
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
        return assertNever(cpuStopped);
    }
  }

  switch (cpuState) {
    case "IDLE":
      return <span>{uiString("CPU_IDLE")}</span>;
    case "FETCHING":
      return (
        <span className="CpuStatus-Fetching">{uiString("CPU_FETCHING")}</span>
      );
    case "EXECUTING":
      return (
        <span className="CpuStatus-Executing">{uiString("CPU_EXECUTING")}</span>
      );
    default:
      return assertNever(cpuState);
  }
}
