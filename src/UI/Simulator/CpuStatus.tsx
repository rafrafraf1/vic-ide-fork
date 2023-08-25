import "./CpuStatus.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import type { CpuState } from "../../Computer/CpuState";
import type { StopResult } from "../../Computer/Computer";

export interface CpuStatusProps {
  cpuStopped: StopResult | null;
  cpuState: CpuState;
}

export const CpuStatus = React.memo((props: CpuStatusProps): JSX.Element => {
  const { cpuStopped, cpuState } = props;

  return (
    <div className="CpuStatus-Root">
      <div>CPU Status</div>
      <CpuStatusMessage cpuStopped={cpuStopped} cpuState={cpuState} />
    </div>
  );
});

interface CpuStatusMessageProps {
  cpuStopped: StopResult | null;
  cpuState: CpuState;
}

function CpuStatusMessage(props: CpuStatusMessageProps): JSX.Element {
  const { cpuStopped, cpuState } = props;

  if (cpuStopped !== null) {
    // TODO Message color and text
    return <div>{cpuStopped}</div>;
  }

  // TODO Message color and text
  return <div>{cpuState}</div>;
}
