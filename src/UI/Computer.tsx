import "./Computer.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import {
  BlankableValueCellInput,
  ValueCellInput,
  type ValueCellInputHandle,
} from "./ValueCellInput";
import {
  type ComputerState,
  type MemoryCell,
  memoryRead,
} from "../Computer/Computer";
import type { Address } from "../Computer/Instruction";
import type { Value } from "../Computer/Value";
import { assertNever } from "assert-never";
import classNames from "classnames";
import { nonNull } from "../Functional/Nullability";

export interface ComputerHandle {
  /**
   * @returns the position and size of the input element of the specified CPU
   * Register.
   */
  getBoundingClientRect: (cpuRegister: CpuRegisterSelector) => DOMRect;
}

export interface ComputerProps {
  className?: string;
  computer: ComputerState;
  onMemoryCellChange?: (address: Address, value: Value | null) => void;
  onInstructionRegister?: (value: Value) => void;
  onDataRegisterChange?: (value: Value) => void;
  onProgramCounterChange?: (value: Value) => void;
}

export const Computer = React.forwardRef<ComputerHandle, ComputerProps>(
  (props: ComputerProps, ref: React.ForwardedRef<ComputerHandle>) => {
    const {
      className,
      computer,
      onMemoryCellChange,
      onInstructionRegister,
      onDataRegisterChange,
      onProgramCounterChange,
    } = props;

    const cpuRef = React.useRef<CpuHandle>(null);

    React.useImperativeHandle(
      ref,
      (): ComputerHandle => ({
        getBoundingClientRect: (cpuRegister: CpuRegisterSelector): DOMRect => {
          return nonNull(cpuRef.current).getBoundingClientRect(cpuRegister);
        },
      }),
      [cpuRef]
    );

    return (
      <div className={classNames(className, "Computer-Root")}>
        <div className="Computer-Io">IO</div>
        <div className="Computer-Divider Computer-Divider1"></div>
        <Cpu
          ref={cpuRef}
          className="Computer-Cpu"
          instructionRegister={computer.instructionRegister}
          dataRegister={computer.dataRegister}
          programCounter={computer.programCounter}
          onInstructionRegister={onInstructionRegister}
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
);

export interface MainMemoryProps {
  className?: string;
  memory: MemoryCell[];
  programCounter: Value;
  onMemoryCellChange?: (address: Address, value: Value | null) => void;
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
  onMemoryCellChange?: (address: Address, value: Value | null) => void;
}

interface MemoryValueCellInputProps {
  address: Address;
  value: Value | null;
  onValueChange: (address: Address, value: Value | null) => void;
}

const MemoryValueCellInput = React.memo(function MemoryValueCellInput(
  props: MemoryValueCellInputProps
): JSX.Element {
  const { address, value, onValueChange } = props;

  const handleValueChange = React.useCallback(
    (newValue: Value | null): void => {
      onValueChange(address, newValue);
    },
    [address, onValueChange]
  );
  return (
    <BlankableValueCellInput value={value} onValueChange={handleValueChange} />
  );
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
    (address: Address, value: Value | null) => {
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

export type CpuRegisterSelector = "INSTRUCTION_REGISTER" | "DATA_REGISTER";

export interface CpuHandle {
  /**
   * @returns the position and size of the input element of the specified CPU
   * Register.
   */
  getBoundingClientRect: (register: CpuRegisterSelector) => DOMRect;
}

interface CpuProps {
  className?: string;
  instructionRegister: Value;
  dataRegister: Value;
  programCounter: Value;
  onInstructionRegister?: (value: Value) => void;
  onDataRegisterChange?: (value: Value) => void;
  onProgramCounterChange?: (value: Value) => void;
}

export const Cpu = React.forwardRef<CpuHandle, CpuProps>(
  (props: CpuProps, ref: React.ForwardedRef<CpuHandle>) => {
    const {
      className,
      instructionRegister,
      dataRegister,
      programCounter,
      onInstructionRegister,
      onDataRegisterChange,
      onProgramCounterChange,
    } = props;

    const instructionRegisterRef = React.useRef<ValueCellInputHandle>(null);
    const dataRegisterRef = React.useRef<ValueCellInputHandle>(null);

    React.useImperativeHandle(
      ref,
      (): ComputerHandle => ({
        getBoundingClientRect: (cpuRegister: CpuRegisterSelector): DOMRect => {
          switch (cpuRegister) {
            case "INSTRUCTION_REGISTER":
              return nonNull(
                instructionRegisterRef.current
              ).getBoundingClientRect();
            case "DATA_REGISTER":
              return nonNull(dataRegisterRef.current).getBoundingClientRect();
            default:
              return assertNever(cpuRegister);
          }
        },
      }),
      [dataRegisterRef, instructionRegisterRef]
    );

    return (
      <div className={classNames(className, "Computer-Cpu")}>
        <CpuRegister label="Instruction Register">
          <ValueCellInput
            ref={instructionRegisterRef}
            value={instructionRegister}
            onValueChange={onInstructionRegister}
          />
        </CpuRegister>
        <CpuRegister label="Data Register">
          <ValueCellInput
            ref={dataRegisterRef}
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
);

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
