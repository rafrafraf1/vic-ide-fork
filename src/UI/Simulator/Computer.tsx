import "./Computer.css";

import * as React from "react";

import { assertNever } from "assert-never";
import classNames from "classnames";

import {
  MEMORY_HIGH_START,
  MEMORY_READONLY_REGION,
  MEMORY_SIZE,
  memoryRead,
  type ComputerState,
  type MemoryCell,
} from "../../Computer/Computer";
import type { InputState } from "../../Computer/Input";
import type { Address } from "../../Computer/Instruction";
import type { OutputState } from "../../Computer/Output";
import type { CpuState } from "../../Computer/SimulatorState";
import type { Value } from "../../Computer/Value";
import { nonNull } from "../../Functional/Nullability";
import type { UIStrings } from "../UIStrings";
import {
  BlankableValueCellInput,
  ValueCellInput,
  type ValueCellInputHandle,
} from "../ValueCellInput";
import { CpuStatus } from "./CpuStatus";
import { Input, type InputHandle } from "./Input";
import { Output, type OutputHandle } from "./Output";

export type UICell =
  | UICell.CpuRegister
  | UICell.MemoryCell
  | UICell.Input
  | UICell.Output;

export namespace UICell {
  export interface CpuRegister {
    kind: "CpuRegister";
    cpuRegister: CpuRegisterSelector;
  }

  export interface MemoryCell {
    kind: "MemoryCell";
    address: Address;
  }

  export interface Input {
    kind: "Input";
  }

  export interface Output {
    kind: "Output";
  }
}

export interface ComputerHandle {
  /**
   * @returns the position and size of the specified UICell.
   */
  getBoundingClientRect: (uiCell: UICell) => DOMRect;

  /**
   * Performs any necessar scrolling such that the specified UICell will be
   * visible to the user.
   */
  scrollIntoView: (uiCell: UICell) => void;
}

export interface ComputerProps {
  className?: string;

  uiString: UIStrings;

  computer: ComputerState;
  cpuState: CpuState;
  cpuWorking: boolean;
  input: InputState;
  output: OutputState;
  onMemoryCellChange?: (address: Address, value: Value | null) => void;
  onInstructionRegister?: (value: Value) => void;
  onDataRegisterChange?: (value: Value) => void;
  onProgramCounterChange?: (value: Value) => void;
  onInputChange?: (input: InputState) => void;
}

export const Computer = React.forwardRef<ComputerHandle, ComputerProps>(
  (props: ComputerProps, ref: React.ForwardedRef<ComputerHandle>) => {
    const {
      className,
      uiString,
      computer,
      cpuState,
      cpuWorking,
      input,
      output,
      onMemoryCellChange,
      onInstructionRegister,
      onDataRegisterChange,
      onProgramCounterChange,
      onInputChange,
    } = props;

    const cpuRef = React.useRef<CpuHandle>(null);
    const mainMemoryRef = React.useRef<MainMemoryHandle>(null);
    const inputRef = React.useRef<InputHandle>(null);
    const outputRef = React.useRef<OutputHandle>(null);

    React.useImperativeHandle(
      ref,
      (): ComputerHandle => ({
        getBoundingClientRect: (uiCell: UICell): DOMRect => {
          switch (uiCell.kind) {
            case "CpuRegister":
              return nonNull(cpuRef.current).getBoundingClientRect(
                uiCell.cpuRegister,
              );
            case "MemoryCell":
              return nonNull(mainMemoryRef.current).getBoundingClientRect(
                uiCell.address,
              );
            case "Input":
              return nonNull(inputRef.current).getInputBoundingClientRect();
            case "Output":
              return nonNull(outputRef.current).getOutputBoundingClientRect();
            default:
              return assertNever(uiCell);
          }
        },

        scrollIntoView: (uiCell: UICell): void => {
          switch (uiCell.kind) {
            case "CpuRegister":
              // CPU Registers are always visible, so nothing to scroll.
              break;
            case "MemoryCell":
              nonNull(mainMemoryRef.current).scrollIntoView(uiCell.address);
              break;
            case "Input":
              nonNull(inputRef.current).scrollToNext();
              break;
            case "Output":
              nonNull(outputRef.current).scrollToBottom();
              break;
            default:
              return assertNever(uiCell);
          }
        },
      }),
      [],
    );

    const handleAppendInput = React.useCallback(
      (value: Value): void => {
        if (onInputChange !== undefined) {
          onInputChange(appendInput(input, value));
        }
      },
      [input, onInputChange],
    );

    const handleInputChange = React.useCallback(
      (index: number, value: Value): void => {
        if (onInputChange !== undefined) {
          onInputChange(inputChange(input, index, value));
        }
      },
      [input, onInputChange],
    );

    const handleDeleteInput = React.useCallback(
      (index: number): void => {
        if (onInputChange !== undefined) {
          onInputChange(deleteInput(input, index));
        }
      },
      [input, onInputChange],
    );

    return (
      <div className={classNames(className, "Computer-Root")}>
        <div className="Computer-Io">
          <div className="Computer-IoTitleRow">{uiString("INPUT")}</div>
          <Input
            ref={inputRef}
            input={input}
            onAppendInput={handleAppendInput}
            onInputChange={handleInputChange}
            onDeleteInput={handleDeleteInput}
          />
          <div className="Computer-IoTitleRow">{uiString("OUTPUT")}</div>
          <Output ref={outputRef} output={output} />
        </div>
        <div className="Computer-Divider Computer-Divider1"></div>
        <Cpu
          ref={cpuRef}
          uiString={uiString}
          instructionRegister={computer.instructionRegister}
          dataRegister={computer.dataRegister}
          programCounter={computer.programCounter}
          cpuState={cpuState}
          cpuWorking={cpuWorking}
          onInstructionRegister={onInstructionRegister}
          onDataRegisterChange={onDataRegisterChange}
          onProgramCounterChange={onProgramCounterChange}
        />
        <div className="Computer-Divider Computer-Divider2"></div>
        <MainMemory
          ref={mainMemoryRef}
          uiString={uiString}
          className="Computer-Memory"
          memory={computer.memory}
          programCounter={computer.programCounter}
          onMemoryCellChange={onMemoryCellChange}
        />
        <div className="Computer-Io-Label Computer-Label">
          {uiString("I_O_UNITS")}
        </div>
        <div className="Computer-Cpu-Label Computer-Label">
          {uiString("CPU")}
        </div>
        <div className="Computer-Memory-Label Computer-Label">
          {uiString("MEMORY")}
        </div>
      </div>
    );
  },
);

export interface MainMemoryHandle {
  /**
   * @returns the position and size of the input element of the specified
   * Memory Address Cell.
   */
  getBoundingClientRect: (address: Address) => DOMRect;

  /**
   * Scrolls the memory segment such that the memory cell of the specified
   * address will be visible to the user.
   */
  scrollIntoView: (address: Address) => void;
}

export interface MainMemoryProps {
  uiString: UIStrings;
  className?: string;
  memory: MemoryCell[];
  programCounter: Value;
  onMemoryCellChange?: (address: Address, value: Value | null) => void;
}

export const MainMemory = React.forwardRef<MainMemoryHandle, MainMemoryProps>(
  (props: MainMemoryProps, ref: React.ForwardedRef<MainMemoryHandle>) => {
    const { uiString, className, memory, programCounter, onMemoryCellChange } =
      props;

    const memorySegment1 = React.useRef<MemorySegmentHandle>(null);
    const memorySegment2 = React.useRef<MemorySegmentHandle>(null);

    const getMemorySegmentRef = React.useCallback(
      (address: Address): MemorySegmentHandle => {
        if (address >= 0 && address < MEMORY_HIGH_START) {
          return nonNull(memorySegment1.current);
        } else if (address >= MEMORY_HIGH_START && address < MEMORY_SIZE) {
          return nonNull(memorySegment2.current);
        } else {
          throw new Error(`Invalid address: ${address}`);
        }
      },
      [],
    );

    React.useImperativeHandle(
      ref,
      (): MainMemoryHandle => ({
        getBoundingClientRect: (address: Address): DOMRect => {
          return getMemorySegmentRef(address).getBoundingClientRect(address);
        },

        scrollIntoView: (address: Address): void => {
          getMemorySegmentRef(address).scrollIntoView(address);
        },
      }),
      [getMemorySegmentRef],
    );

    return (
      <div className={classNames(className, "Computer-MainMemory")}>
        <MemorySegment
          ref={memorySegment1}
          uiString={uiString}
          memory={memory}
          programCounter={programCounter}
          segmentStart={0}
          segmentEnd={MEMORY_HIGH_START - 1}
          onMemoryCellChange={onMemoryCellChange}
        />
        <MemorySegment
          ref={memorySegment2}
          uiString={uiString}
          memory={memory}
          programCounter={programCounter}
          segmentStart={MEMORY_HIGH_START}
          segmentEnd={MEMORY_SIZE - 1}
          onMemoryCellChange={onMemoryCellChange}
        />
      </div>
    );
  },
);

export interface MemorySegmentHandle {
  /**
   * @returns the position and size of the input element of the specified
   * Memory Address Cell.
   */
  getBoundingClientRect: (address: Address) => DOMRect;

  /**
   * Scrolls the memory segment such that the memory cell of the specified
   * address will be visible to the user.
   */
  scrollIntoView: (address: Address) => void;
}

export interface MemorySegmentProps {
  uiString: UIStrings;
  memory: MemoryCell[];
  programCounter: Value;
  segmentStart: Address;
  segmentEnd: Address;
  onMemoryCellChange?: (address: Address, value: Value | null) => void;
}

interface MemoryValueCellInputProps {
  uiString: UIStrings;
  address: Address;
  value: Value | null;
  highlighted: boolean;
  onValueChange: (address: Address, value: Value | null) => void;
}

const MemoryValueCellInput = React.memo(
  React.forwardRef(
    (
      props: MemoryValueCellInputProps,
      ref: React.ForwardedRef<ValueCellInputHandle>,
    ) => {
      const { uiString, address, value, highlighted, onValueChange } = props;

      const handleValueChange = React.useCallback(
        (newValue: Value | null): void => {
          onValueChange(address, newValue);
        },
        [address, onValueChange],
      );

      const disabled = address >= MEMORY_READONLY_REGION;

      return (
        <BlankableValueCellInput
          ref={ref}
          value={value}
          highlighted={highlighted}
          disabled={disabled}
          tooltip={disabled ? uiString("READONLY_MEMORY_ADDRESS") : undefined}
          onValueChange={handleValueChange}
        />
      );
    },
  ),
);

export const MemorySegment = React.forwardRef<
  MemorySegmentHandle,
  MemorySegmentProps
>((props: MemorySegmentProps, ref: React.ForwardedRef<MemorySegmentHandle>) => {
  const {
    uiString,
    memory,
    programCounter,
    segmentStart,
    segmentEnd,
    onMemoryCellChange,
  } = props;

  const memoryCellRefs = React.useRef<(ValueCellInputHandle | null)[]>([]);

  const getMemoryCellRef = React.useCallback(
    (address: Address): ValueCellInputHandle => {
      const index = address - segmentStart;
      const ref = nonNull(nonNull(memoryCellRefs.current)[index]);
      if (ref === undefined) {
        throw new Error(`Address out of range: ${address}`);
      }
      return ref;
    },
    [segmentStart],
  );

  React.useImperativeHandle(
    ref,
    (): MemorySegmentHandle => ({
      getBoundingClientRect: (address: Address): DOMRect => {
        return getMemoryCellRef(address).getBoundingClientRect();
      },

      scrollIntoView: (address: Address): void => {
        getMemoryCellRef(address).scrollIntoView();
      },
    }),
    [getMemoryCellRef],
  );

  React.useEffect(() => {
    resizeRefsArray(memoryCellRefs.current, segmentEnd - segmentStart + 1);
  }, [segmentEnd, segmentStart]);

  const handleValueChange = React.useCallback(
    (address: Address, value: Value | null) => {
      if (onMemoryCellChange !== undefined) {
        onMemoryCellChange(address, value);
      }
    },
    [onMemoryCellChange],
  );

  return (
    <div className="Computer-MemorySegment">
      {addressRange(segmentStart, segmentEnd).map((address, i) => {
        const highlighted = address === programCounter;

        return (
          <React.Fragment key={address}>
            <span
              className={classNames("Computer-MemoryAddress", {
                "Computer-MemoryAddress-Active": highlighted,
              })}
            >
              {address}
            </span>
            <MemoryValueCellInput
              ref={(el): void => {
                memoryCellRefs.current[i] = el;
              }}
              uiString={uiString}
              address={address}
              value={memoryRead(memory, address)}
              highlighted={highlighted}
              onValueChange={handleValueChange}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
});

function resizeRefsArray<T>(array: (T | null)[], newSize: number): void {
  if (newSize < array.length) {
    array.splice(newSize);
  } else {
    const count = newSize - array.length;
    for (let i = 0; i < count; i++) {
      array.push(null);
    }
  }
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
  uiString: UIStrings;
  instructionRegister: Value;
  dataRegister: Value;
  programCounter: Value;
  cpuState: CpuState;
  cpuWorking: boolean;
  onInstructionRegister?: (value: Value) => void;
  onDataRegisterChange?: (value: Value) => void;
  onProgramCounterChange?: (value: Value) => void;
}

export const Cpu = React.forwardRef<CpuHandle, CpuProps>(
  (props: CpuProps, ref: React.ForwardedRef<CpuHandle>) => {
    const {
      uiString,
      instructionRegister,
      dataRegister,
      programCounter,
      cpuState,
      cpuWorking,
      onInstructionRegister,
      onDataRegisterChange,
      onProgramCounterChange,
    } = props;

    const instructionRegisterRef = React.useRef<ValueCellInputHandle>(null);
    const dataRegisterRef = React.useRef<ValueCellInputHandle>(null);

    React.useImperativeHandle(
      ref,
      (): CpuHandle => ({
        getBoundingClientRect: (cpuRegister: CpuRegisterSelector): DOMRect => {
          switch (cpuRegister) {
            case "INSTRUCTION_REGISTER":
              return nonNull(
                instructionRegisterRef.current,
              ).getBoundingClientRect();
            case "DATA_REGISTER":
              return nonNull(dataRegisterRef.current).getBoundingClientRect();
            default:
              return assertNever(cpuRegister);
          }
        },
      }),
      [],
    );

    return (
      <div className="Computer-Cpu">
        <CpuRegister label={uiString("INSTRUCTION_REGISTER")}>
          <ValueCellInput
            ref={instructionRegisterRef}
            value={instructionRegister}
            onValueChange={onInstructionRegister}
          />
        </CpuRegister>
        <CpuRegister label={uiString("DATA_REGISTER")}>
          <ValueCellInput
            ref={dataRegisterRef}
            value={dataRegister}
            onValueChange={onDataRegisterChange}
          />
        </CpuRegister>
        <CpuRegister label={uiString("PROGRAM_COUNTER")}>
          <ValueCellInput
            value={programCounter}
            onValueChange={onProgramCounterChange}
          />
        </CpuRegister>
        <CpuStatus
          uiString={uiString}
          cpuState={cpuState}
          cpuWorking={cpuWorking}
        />
      </div>
    );
  },
);

interface CpuRegisterProps {
  children?: React.ReactNode;
  label: string;
}

function CpuRegister(props: CpuRegisterProps): React.JSX.Element {
  const { label, children } = props;

  return (
    <div className="Computer-CpuRegister-Root">
      <header>{label}</header>
      {children}
    </div>
  );
}

function appendInput(input: InputState, value: Value): InputState {
  const newValues = input.values.concat([value]);
  return { ...input, values: newValues };
}

function inputChange(
  input: InputState,
  index: number,
  value: Value,
): InputState {
  if (index >= input.values.length) {
    throw new Error(`Invalid array index for input values: ${index}`);
  }
  const newValues = input.values.slice();
  newValues[index] = value;
  return { ...input, values: newValues };
}

function deleteInput(input: InputState, index: number): InputState {
  if (index >= input.values.length) {
    throw new Error(`Invalid array index for input values: ${index}`);
  }
  let next = input.next;
  if (index < next) {
    next -= 1;
  }

  const newValues = input.values.slice();
  newValues.splice(index, 1);

  return {
    values: newValues,
    next: next,
  };
}
