import "./Computer.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import {
  type ComputerState,
  type MemoryCell,
  memoryRead,
} from "../Computer/Computer";
import type { Address } from "../Computer/Instruction";
import type { Value } from "../Computer/Value";
import { ValueCellInput } from "./ValueCellInput";
import classNames from "classnames";

export interface ComputerProps {
  className?: string;
  computer: ComputerState;
}

export function Computer(props: ComputerProps): JSX.Element {
  return (
    <div className={classNames(props.className, "Computer-Root")}>
      <div className="Computer-Io">IO</div>
      <div className="Computer-Divider Computer-Divider1"></div>
      <Cpu
        className="Computer-Cpu"
        instructionRegister={0}
        dataRegister={0}
        programCounter={0}
      />
      <div className="Computer-Divider Computer-Divider2"></div>
      <MainMemory className="Computer-Memory" memory={props.computer.memory} />
      <div className="Computer-Io-Label Computer-Label">I/O Units</div>
      <div className="Computer-Cpu-Label Computer-Label">CPU</div>
      <div className="Computer-Memory-Label Computer-Label">Memory</div>
    </div>
  );
}

export interface MainMemoryProps {
  className?: string;
  memory: MemoryCell[];
}

export function MainMemory(props: MainMemoryProps): JSX.Element {
  return (
    <div className={classNames(props.className, "Computer-MainMemory")}>
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

interface CpuProps {
  className?: string;
  instructionRegister: Value;
  dataRegister: Value;
  programCounter: Value;
}

export function Cpu(props: CpuProps): JSX.Element {
  return (
    <div className={classNames(props.className, "Computer-Cpu")}>
      <CpuRegister label="Instruction Register">
        <ValueCellInput value={props.instructionRegister} />
      </CpuRegister>
      <CpuRegister label="Data Register">
        <ValueCellInput value={props.dataRegister} />
      </CpuRegister>
      <CpuRegister label="Program Counter">
        <ValueCellInput value={props.programCounter} />
      </CpuRegister>
    </div>
  );
}

interface CpuRegisterProps {
  children?: React.ReactNode;
  label: string;
}

function CpuRegister(props: CpuRegisterProps): JSX.Element {
  return (
    <div className="Computer-CpuRegister-Root">
      <header>{props.label}</header>
      {props.children}
    </div>
  );
}
