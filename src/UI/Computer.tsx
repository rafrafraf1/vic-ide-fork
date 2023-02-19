import "./Computer.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
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
  onMemoryCellChange?: (address: Address, value: Value) => void;
  onDataRegisterChange?: (value: Value) => void;
  onProgramCounterChange?: (value: Value) => void;
}

export function Computer(props: ComputerProps): JSX.Element {
  const {
    className,
    computer,
    onMemoryCellChange,
    onDataRegisterChange,
    onProgramCounterChange,
  } = props;

  return (
    <div className={classNames(className, "Computer-Root")}>
      <div className="Computer-Io">IO</div>
      <div className="Computer-Divider Computer-Divider1"></div>
      <Cpu
        className="Computer-Cpu"
        instructionRegister={/* TODO */ 0}
        dataRegister={computer.dataRegister}
        programCounter={computer.programCounter}
        onDataRegisterChange={onDataRegisterChange}
        onProgramCounterChange={onProgramCounterChange}
      />
      <div className="Computer-Divider Computer-Divider2"></div>
      <MainMemory
        className="Computer-Memory"
        memory={computer.memory}
        programCounter={computer.programCounter}
        onMemoryCellChange={onMemoryCellChange}
      />
      <div className="Computer-Io-Label Computer-Label">I/O Units</div>
      <div className="Computer-Cpu-Label Computer-Label">CPU</div>
      <div className="Computer-Memory-Label Computer-Label">Memory</div>
    </div>
  );
}

export interface MainMemoryProps {
  className?: string;
  memory: MemoryCell[];
  programCounter: Value;
  onMemoryCellChange?: (address: Address, value: Value) => void;
}

export function MainMemory(props: MainMemoryProps): JSX.Element {
  const { className, memory, programCounter, onMemoryCellChange } = props;

  return (
    <div className={classNames(className, "Computer-MainMemory")}>
      <MemorySegment
        memory={memory}
        programCounter={programCounter}
        segmentStart={0}
        segmentEnd={49}
        onMemoryCellChange={onMemoryCellChange}
      />
      <MemorySegment
        memory={memory}
        programCounter={programCounter}
        segmentStart={50}
        segmentEnd={99}
        onMemoryCellChange={onMemoryCellChange}
      />
    </div>
  );
}

export interface MemorySegmentProps {
  memory: MemoryCell[];
  programCounter: Value;
  segmentStart: Address;
  segmentEnd: Address;
  onMemoryCellChange?: (address: Address, value: Value) => void;
}

interface MemoryValueCellInputProps {
  address: Address;
  value: Value;
  onValueChange: (address: Address, value: Value) => void;
}

const MemoryValueCellInput = React.memo(function MemoryValueCellInput(
  props: MemoryValueCellInputProps
): JSX.Element {
  const { address, value, onValueChange } = props;

  const handleValueChange = React.useCallback(
    (newValue: Value): void => {
      onValueChange(address, newValue);
    },
    [address, onValueChange]
  );
  return <ValueCellInput value={value} onValueChange={handleValueChange} />;
});

export function MemorySegment(props: MemorySegmentProps): JSX.Element {
  const {
    memory,
    programCounter,
    segmentStart,
    segmentEnd,
    onMemoryCellChange,
  } = props;

  const handleValueChange = React.useCallback(
    (address: Address, value: Value) => {
      if (onMemoryCellChange !== undefined) {
        onMemoryCellChange(address, value);
      }
    },
    [onMemoryCellChange]
  );

  return (
    <div className="Computer-MemorySegment">
      {addressRange(segmentStart, segmentEnd).map((i) => (
        <React.Fragment key={i}>
          <span
            className={classNames("Computer-MemoryAddress", {
              "Computer-MemoryAddress-Active": i === programCounter,
            })}
          >
            {i}
          </span>
          <MemoryValueCellInput
            value={memoryRead(memory, i)}
            address={i}
            onValueChange={handleValueChange}
          />
        </React.Fragment>
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
  onDataRegisterChange?: (value: Value) => void;
  onProgramCounterChange?: (value: Value) => void;
}

export function Cpu(props: CpuProps): JSX.Element {
  const {
    className,
    instructionRegister,
    dataRegister,
    programCounter,
    onDataRegisterChange,
    onProgramCounterChange,
  } = props;

  return (
    <div className={classNames(className, "Computer-Cpu")}>
      <CpuRegister label="Instruction Register">
        <ValueCellInput value={instructionRegister} />
      </CpuRegister>
      <CpuRegister label="Data Register">
        <ValueCellInput
          value={dataRegister}
          onValueChange={onDataRegisterChange}
        />
      </CpuRegister>
      <CpuRegister label="Program Counter">
        <ValueCellInput
          value={programCounter}
          onValueChange={onProgramCounterChange}
        />
      </CpuRegister>
    </div>
  );
}

interface CpuRegisterProps {
  children?: React.ReactNode;
  label: string;
}

function CpuRegister(props: CpuRegisterProps): JSX.Element {
  const { label, children } = props;

  return (
    <div className="Computer-CpuRegister-Root">
      <header>{label}</header>
      {children}
    </div>
  );
}
