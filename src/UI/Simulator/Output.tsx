import "./Output.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import type { OutputLine, OutputState } from "../../Computer/Output";
import { VscArrowCircleLeft } from "react-icons/vsc";
import { assertNever } from "assert-never";
import classNames from "classnames";

export interface OutputProps {
  output: OutputState;
}

export const Output = React.memo((props: OutputProps) => {
  const { output } = props;

  return (
    <div className="Output-Root">
      {output.lines.map((outputLine, index) => (
        <React.Fragment key={index}>
          <OutputLineElem outputLine={outputLine} />
          <span />
        </React.Fragment>
      ))}
      <span />
      <span>
        <VscArrowCircleLeft size={24} className="Output-Arrow" />
      </span>
    </div>
  );
});

export interface OutputLineElemProps {
  outputLine: OutputLine;
}

const OutputLineElem = React.memo((props: OutputLineElemProps) => {
  const { outputLine } = props;

  switch (outputLine.kind) {
    case "PrintedValue":
      return <span>{outputLine.value}</span>;
    case "Message":
      return (
        <span
          className={classNames({
            "Output-Error": outputLine.error,
          })}
        >
          {outputLine.text}
        </span>
      );
    default:
      return assertNever(outputLine);
  }
});
