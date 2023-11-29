import "./HelpScreen.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import { Button, ButtonLabel } from "./Components/Button";
import { VscClose, VscPin, VscPinned } from "react-icons/vsc";

export interface HelpScreenProps {
  onCloseClick?: () => void;
  onPinClick?: () => void;
}

export const HelpScreen = React.memo((props: HelpScreenProps): JSX.Element => {
  const { onCloseClick, onPinClick } = props;

  return (
    <div className="HelpScreen-Root">
      <div className="HelpScreen-Background" onClick={onCloseClick} />
      <div className="HelpScreen-Window-Cont">
        <div className="HelpScreen-Window">
          <div className="HelpScreen-Window-Titlebar">
            <div className="HelpScreen-Window-Titlebar-Heading">Vic Help</div>
            <Button
              className="HelpScreen-Window-Titlebar-Button"
              onClick={onPinClick}
            >
              <ButtonLabel>
                <VscPinned size="24" />
              </ButtonLabel>
            </Button>
            <Button
              className="HelpScreen-Window-Titlebar-Button"
              onClick={onCloseClick}
            >
              <ButtonLabel>
                <VscClose size="24" />
              </ButtonLabel>
            </Button>
          </div>
          <div className="HelpScreen-Window-Contents">
            <InstructionsHelp />
          </div>
        </div>
      </div>
    </div>
  );
});

export interface HelpSidebarProps {
  onUnpinClick?: () => void;
  onCloseClick?: () => void;
}

export const HelpSidebar = React.memo(
  (props: HelpSidebarProps): JSX.Element => {
    const { onUnpinClick, onCloseClick } = props;

    return (
      <div className="HelpScreen-Window">
        <div className="HelpScreen-Window-Titlebar">
          <div className="HelpScreen-Window-Titlebar-Heading">Vic Help</div>
          <Button
            className="HelpScreen-Window-Titlebar-Button"
            onClick={onUnpinClick}
          >
            <ButtonLabel>
              <VscPin size="24" />
            </ButtonLabel>
          </Button>
          <Button
            className="HelpScreen-Window-Titlebar-Button"
            onClick={onCloseClick}
          >
            <ButtonLabel>
              <VscClose size="24" />
            </ButtonLabel>
          </Button>
        </div>
        <div className="HelpScreen-Window-Contents">
          <InstructionsHelp />
        </div>
      </div>
    );
  },
);

export const InstructionsHelp = React.memo((): JSX.Element => {
  return (
    <>
      <h3>Vic Instructions</h3>
      <table className="HelpScreen-Instructions-Table">
        <thead>
          <tr>
            <th>Inst. code</th>
            <th>Inst. name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <InstructionsRow code="1xx" name="ADD">
            Add <code>memory[xx]</code> value to data register value
          </InstructionsRow>
          <InstructionsRow code="2xx" name="SUB">
            Subtract <code>memory[xx]</code> value from data register value
          </InstructionsRow>
          <InstructionsRow code="3xx" name="LOAD">
            Load <code>memory[xx]</code> value to data register
          </InstructionsRow>
          <InstructionsRow code="4xx" name="STORE">
            Store data register value in <code>memory[xx]</code>
          </InstructionsRow>
          <InstructionsRow code="5xx" name="GOTO">
            Goto execute the <code>memory[xx]</code> instruction
          </InstructionsRow>
          <InstructionsRow code="6xx" name="GOTOZ">
            If data reg. value equals to zero, goto execute the{" "}
            <code>memory[xx]</code> instruction
          </InstructionsRow>
          <InstructionsRow code="7xx" name="GOTOP">
            If data reg. value is greater than zero, goto execute the{" "}
            <code>memory[xx]</code> instruction
          </InstructionsRow>
          <InstructionsRow code="800" name="READ">
            Read next input value to data register
          </InstructionsRow>
          <InstructionsRow code="900" name="WRITE">
            Write data register value to output
          </InstructionsRow>
          <InstructionsRow code="0" name="STOP">
            Stop program execution
          </InstructionsRow>
        </tbody>
      </table>
    </>
  );
});

interface InstructionsRowProps {
  code: string;
  name: string;
  children?: React.ReactNode;
}

export function InstructionsRow(props: InstructionsRowProps): JSX.Element {
  const { code, name, children } = props;
  return (
    <tr>
      <td className="HelpScreen-Instructions-Table-Mono">{code}</td>
      <td className="HelpScreen-Instructions-Table-Mono">{name}</td>
      <td>{children}</td>
    </tr>
  );
}
