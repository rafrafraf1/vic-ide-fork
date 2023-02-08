import "./Computer.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import {
  type ComputerState,
  type MemoryCell,
  memoryRead,
} from "../Computer/Computer";
import type { Address } from "../Computer/Instruction";
import { ValueCellInput } from "./ValueCellInput";

export interface ComputerProps {
  computer: ComputerState;
}

export function Computer(props: ComputerProps): JSX.Element {
  return (
    <div>
      <MainMemory memory={props.computer.memory} />
    </div>
  );
}

export interface MainMemoryProps {
  memory: MemoryCell[];
}

export function MainMemory(props: MainMemoryProps): JSX.Element {
  return (
    <div className="Computer-MainMemory">
      <MemorySegment memory={props.memory} segmentStart={0} segmentEnd={49} />
      <MemorySegment memory={props.memory} segmentStart={50} segmentEnd={99} />
    </div>
  );
}

export interface MemorySegmentProps {
  memory: MemoryCell[];
  segmentStart: Address;
  segmentEnd: Address;
}

export function MemorySegment(props: MemorySegmentProps): JSX.Element {
  return (
    <div className="Computer-MemorySegment">
      {addressRange(props.segmentStart, props.segmentEnd).map((i) => (
        <>
          <span className="Computer-MemoryAddress">{i}</span>
          <ValueCellInput key={i} value={memoryRead(props.memory, i)} />
        </>
      ))}
    </div>
  );
}

function addressRange(low: Address, high: Address): Address[] {
  const result: number[] = [];
  for (let i = low; i <= high; i++) {
    result.push(i);
  }
  return result;
}
