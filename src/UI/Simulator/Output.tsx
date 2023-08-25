import "./Output.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import { BlankableValueCellInput, ValueCellInput } from "../ValueCellInput";
import type { OutputState } from "../../Computer/Output";
import { VscArrowCircleLeft } from "react-icons/vsc";
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

      const prevLinesLength = usePrevious(output.values.length);

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
          output.values.length > prevLinesLength
        ) {
          if (root.current !== null) {
            root.current.scrollTop = root.current.scrollHeight;
          }
        }
      }, [output.values.length, prevLinesLength]);

      return (
        <div className="Output-Root" ref={root}>
          {output.values.map((value, index) => (
            <React.Fragment key={index}>
              <ValueCellInput value={value} disabled={true} />
              <span />
            </React.Fragment>
          ))}
          <BlankableValueCellInput
            ref={nextLine}
            value={null}
            highlighted={true}
            disabled={true}
          />
          <span>
            <VscArrowCircleLeft size={24} className="Output-Arrow" />
          </span>
        </div>
      );
    }
  )
);
