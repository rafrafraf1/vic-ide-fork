import "./Output.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import type { OutputLine, OutputState } from "../../Computer/Output";
import { VscArrowCircleLeft } from "react-icons/vsc";
import { assertNever } from "assert-never";
import classNames from "classnames";
import { nonNull } from "../../Functional/Nullability";
import { usePrevious } from "../ReactHooks/UsePrevious";

export interface OutputHandle {
  /**
   * @returns the position and size of the next output line.
   */
  getOutputBoundingClientRect: () => DOMRect;

  /**
   * Scrolls to the bottom.
   */
  scrollToBottom: () => void;
}

export interface OutputProps {
  output: OutputState;
}

export const Output = React.memo(
  React.forwardRef(
    (props: OutputProps, ref: React.ForwardedRef<OutputHandle>) => {
      const { output } = props;

      const prevLinesLength = usePrevious(output.lines.length);

      const root = React.useRef<HTMLDivElement>(null);
      const nextLine = React.useRef<HTMLDivElement>(null);

      React.useImperativeHandle(
        ref,
        (): OutputHandle => ({
          getOutputBoundingClientRect: (): DOMRect => {
            return nonNull(nextLine.current).getBoundingClientRect();
          },
          scrollToBottom: (): void => {
            nonNull(root.current).scrollTop = nonNull(
              root.current
            ).scrollHeight;
          },
        }),
        []
      );

      React.useEffect(() => {
        if (
          prevLinesLength === undefined ||
          output.lines.length > prevLinesLength
        ) {
          if (root.current !== null) {
            root.current.scrollTop = root.current.scrollHeight;
          }
        }
      }, [output.lines.length, prevLinesLength]);

      return (
        <div className="Output-Root" ref={root}>
          {output.lines.map((outputLine, index) => (
            <React.Fragment key={index}>
              <OutputLineElem outputLine={outputLine} />
              <span />
            </React.Fragment>
          ))}
          <div ref={nextLine} />
          <span>
            <VscArrowCircleLeft size={24} className="Output-Arrow" />
          </span>
        </div>
      );
    }
  )
);

interface OutputLineElemProps {
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
