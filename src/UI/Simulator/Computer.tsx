import "./Computer.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import {
  BlankableValueCellInput,
  ValueCellInput,
  type ValueCellInputHandle,
} from "../ValueCellInput";
import { Button, ButtonLabel } from "../Components/Button";
import {
  type ComputerState,
  type MemoryCell,
  memoryRead,
} from "../../Computer/Computer";
import { Input, type InputHandle } from "./Input";
import {
  type InputState,
  atBeginningOfInput,
  rewindInput,
} from "../../Computer/Input";
import { Output, type OutputHandle } from "./Output";
import { type OutputState, isOutputEmpty } from "../../Computer/Output";
import type { Address } from "../../Computer/Instruction";
import { RiRewindMiniFill } from "react-icons/ri";
import type { Value } from "../../Computer/Value";
import { VscTrash } from "react-icons/vsc";
import { assertNever } from "assert-never";
import classNames from "classnames";
import { nonNull } from "../../Functional/Nullability";

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

  /**
   * Whether an animation is currently running or not.
   */
  animating: boolean;

  computer: ComputerState;
  input: InputState;
  output: OutputState;
  onClearOutputClick?: () => void;
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
      animating,
      computer,
      input,
      output,
      onClearOutputClick,
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
                uiCell.cpuRegister
              );
            case "MemoryCell":
              return nonNull(mainMemoryRef.current).getBoundingClientRect(
                uiCell.address
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
      []
    );

    const handleInputResetClick = React.useCallback((): void => {
      if (onInputChange !== undefined) {
        onInputChange(rewindInput(input));
      }
      if (onProgramCounterChange !== undefined) {
        onProgramCounterChange(0);
      }
    }, [input, onInputChange, onProgramCounterChange]);

    const handleAppendInput = React.useCallback(
      (value: Value): void => {
        if (onInputChange !== undefined) {
          const newValues = input.values.concat([value]);
          onInputChange({ ...input, values: newValues });
        }
      },
      [input, onInputChange]
    );

    const handleInputChange = React.useCallback(
      (index: number, value: Value): void => {
        if (index >= input.values.length) {
          throw new Error(`Invalid array index for input values: ${index}`);
        }
        if (onInputChange !== undefined) {
          const newValues = input.values.slice();
          newValues[index] = value;
          onInputChange({ ...input, values: newValues });
        }
      },
      [input, onInputChange]
    );

    return (
      <div className={classNames(className, "Computer-Root")}>
        <div className="Computer-Io">
          <div className="Computer-IoTitleRow">
            <span className="Computer-IoTitleRowHeading">Input</span>
            <Button
              disabled={
                animating ||
                (atBeginningOfInput(input) && computer.programCounter === 0)
              }
              onClick={handleInputResetClick}
            >
              <ButtonLabel>Reset</ButtonLabel>
              <ButtonLabel>
                <RiRewindMiniFill size={24} />
              </ButtonLabel>
            </Button>
          </div>
          <Input
            ref={inputRef}
            input={input}
            onAppendInput={handleAppendInput}
            onInputChange={handleInputChange}
          />
          <div className="Computer-IoTitleRow">
            <span className="Computer-IoTitleRowHeading">Output</span>
            <Button
              disabled={animating || isOutputEmpty(output)}
              onClick={onClearOutputClick}
            >
              <ButtonLabel>Clear</ButtonLabel>
              <ButtonLabel>
                <VscTrash size={24} />
              </ButtonLabel>
            </Button>
          </div>
          <Output ref={outputRef} output={output} />
        </div>
        <div className="Computer-Divider Computer-Divider1"></div>
        <Cpu
          ref={cpuRef}
          instructionRegister={computer.instructionRegister}
          dataRegister={computer.dataRegister}
          programCounter={computer.programCounter}
          onInstructionRegister={onInstructionRegister}
          onDataRegisterChange={onDataRegisterChange}
          onProgramCounterChange={onProgramCounterChange}
        />
        <div className="Computer-Divider Computer-Divider2"></div>
        <MainMemory
          ref={mainMemoryRef}
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
  className?: string;
  memory: MemoryCell[];
  programCounter: Value;
  onMemoryCellChange?: (address: Address, value: Value | null) => void;
}

export const MainMemory = React.forwardRef<MainMemoryHandle, MainMemoryProps>(
  (props: MainMemoryProps, ref: React.ForwardedRef<MainMemoryHandle>) => {
    const { className, memory, programCounter, onMemoryCellChange } = props;

    const memorySegment1 = React.useRef<MemorySegmentHandle>(null);
    const memorySegment2 = React.useRef<MemorySegmentHandle>(null);

    const getMemorySegmentRef = React.useCallback(
      (address: Address): MemorySegmentHandle => {
        if (address >= 0 && address <= 49) {
          return nonNull(memorySegment1.current);
        } else if (address >= 50 && address <= 99) {
          return nonNull(memorySegment2.current);
        } else {
          throw new Error(`Invalid address: ${address}`);
        }
      },
      []
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
      [getMemorySegmentRef]
    );

    return (
      <div className={classNames(className, "Computer-MainMemory")}>
        <MemorySegment
          ref={memorySegment1}
          memory={memory}
          programCounter={programCounter}
          segmentStart={0}
          segmentEnd={49}
          onMemoryCellChange={onMemoryCellChange}
        />
        <MemorySegment
          ref={memorySegment2}
          memory={memory}
          programCounter={programCounter}
          segmentStart={50}
          segmentEnd={99}
          onMemoryCellChange={onMemoryCellChange}
        />
      </div>
    );
  }
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
  memory: MemoryCell[];
  programCounter: Value;
  segmentStart: Address;
  segmentEnd: Address;
  onMemoryCellChange?: (address: Address, value: Value | null) => void;
}

interface MemoryValueCellInputProps {
  address: Address;
  value: Value | null;
  highlighted: boolean;
  onValueChange: (address: Address, value: Value | null) => void;
}

const MemoryValueCellInput = React.memo(
  React.forwardRef(
    (
      props: MemoryValueCellInputProps,
      ref: React.ForwardedRef<ValueCellInputHandle>
    ) => {
      const { address, value, highlighted, onValueChange } = props;

      const handleValueChange = React.useCallback(
        (newValue: Value | null): void => {
          onValueChange(address, newValue);
        },
        [address, onValueChange]
      );
      return (
        <BlankableValueCellInput
          ref={ref}
          value={value}
          highlighted={highlighted}
          onValueChange={handleValueChange}
        />
      );
    }
  )
);

export const MemorySegment = React.forwardRef<
  MemorySegmentHandle,
  MemorySegmentProps
>((props: MemorySegmentProps, ref: React.ForwardedRef<MemorySegmentHandle>) => {
  const {
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
    [segmentStart]
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
    [getMemoryCellRef]
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
    [onMemoryCellChange]
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
      (): CpuHandle => ({
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
      []
    );

    return (
      <div className="Computer-Cpu">
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
