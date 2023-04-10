import { type Address, parseInstruction } from "./Instruction";
import type { Value } from "./Value";
import { assertNever } from "assert-never";
import { compose } from "../Functional/Compose";

export type Register = Value;

export type MemoryCell = Value | null;

/**
 * The amount of memory available in the Vic computer.
 *
 * It doesn't make sense to make this larger, because the CPU instructions can only
 */
export const MEMORY_SIZE = 100;
export const MEMORY_READONLY_REGION = 98;

/**
 * This structure is immutable.
 *
 * Do not modify the "memory" array. Instead use the "writeMemory" function.
 */
export interface ComputerState {
  readonly instructionRegister: Register;
  readonly dataRegister: Register;
  readonly programCounter: Register;

  /**
   * The size of the memory is MEMORY_SIZE (equal to 100)
   */
  readonly memory: MemoryCell[];
}

export function setInstructionRegister(
  value: Register
): (computer: ComputerState) => ComputerState {
  return (computer: ComputerState): ComputerState => ({
    instructionRegister: value,
    dataRegister: computer.dataRegister,
    programCounter: computer.programCounter,
    memory: computer.memory,
  });
}

export function setDataRegister(
  value: Register
): (computer: ComputerState) => ComputerState {
  return (computer: ComputerState): ComputerState => ({
    instructionRegister: computer.instructionRegister,
    dataRegister: value,
    programCounter: computer.programCounter,
    memory: computer.memory,
  });
}

export function setProgramCounter(
  value: Register
): (computer: ComputerState) => ComputerState {
  return (computer: ComputerState): ComputerState => ({
    instructionRegister: computer.instructionRegister,
    dataRegister: computer.dataRegister,
    programCounter: value,
    memory: computer.memory,
  });
}

export function incProgramCounter(computer: ComputerState): ComputerState {
  return {
    instructionRegister: computer.instructionRegister,
    dataRegister: computer.dataRegister,
    programCounter: computer.programCounter + 1,
    memory: computer.memory,
  };
}

export function writeMemory(
  address: Address,
  value: Value | null
): (computer: ComputerState) => ComputerState {
  return (computer: ComputerState): ComputerState => ({
    instructionRegister: computer.instructionRegister,
    dataRegister: computer.dataRegister,
    programCounter: computer.programCounter,
    memory: memoryWrite(address, value)(computer.memory),
  });
}

export function memoryWrite(
  address: Address,
  value: Value | null
): (memory: MemoryCell[]) => MemoryCell[] {
  return (memory: MemoryCell[]): MemoryCell[] => {
    // TODO Ignore if the memory address is read-only
    const newMemory = memory.slice();
    newMemory[address] = value;
    return newMemory;
  };
}

export function memoryRead(memory: MemoryCell[], address: Address): MemoryCell {
  const value = memory[address];
  if (value === undefined) {
    throw new Error(
      `Address out of range: ${address} (Array length: ${memory.length})`
    );
  }
  return value;
}

export function readMemory(computer: ComputerState, address: Address): Value {
  const value = memoryRead(computer.memory, address);
  if (value === null) {
    return 0;
  }
  return value;
}

export function add(a: Value, b: Value): Value {
  // TODO Handle overflow/clamp behaviour, depending on what the requirements dictate.
  return a + b;
}

export function sub(a: Value, b: Value): Value {
  // TODO Handle underflow/clamp behaviour, depending on what the requirements dictate.
  return a - b;
}

/**
 * @returns an initial ComputerState
 */
export function newComputerState(): ComputerState {
  const memory = newBlankMemory();
  memory[MEMORY_SIZE - 2] = 0;
  memory[MEMORY_SIZE - 1] = 1;
  return {
    instructionRegister: 0,
    dataRegister: 0,
    programCounter: 0,
    memory: memory,
  };
}

/**
 * @returns an array of size `MEMORY_SIZE` with all elements set to blank
 * (`null`).
 */
export function newBlankMemory(): MemoryCell[] {
  const memory = [];
  for (let i = 0; i < MEMORY_SIZE; i++) {
    memory.push(null);
  }
  return memory;
}

export type StopResult = "STOP" | "NO_INPUT";

export interface ExecuteResult {
  consumedInput: boolean;
  output: Value | null;
  stop: StopResult | null;
}

export const nullExecuteResult: ExecuteResult = {
  consumedInput: false,
  output: null,
  stop: null,
};

/**
 * Fetches the next instruction that will be executed. It does this by reading
 * the memory location of the Program Counter, and updating the Instruction
 * Register with this value.
 */
export function fetchInstruction(computer: ComputerState): ComputerState {
  const memValue = memoryRead(computer.memory, computer.programCounter);
  const value = memValue === null ? 0 : memValue;

  return {
    instructionRegister: value,
    dataRegister: computer.dataRegister,
    programCounter: computer.programCounter,
    memory: computer.memory,
  };
}

export function executeInstruction(
  computer: ComputerState,
  nextInput: Value | null
): [ComputerState, ExecuteResult] {
  const instruction = parseInstruction(computer.instructionRegister);

  switch (instruction.kind) {
    case "ADD": {
      const op1 = computer.dataRegister;
      const op2 = readMemory(computer, instruction.address);
      const value = add(op1, op2);
      const newComputer = compose(
        setDataRegister(value),
        incProgramCounter
      )(computer);
      return [newComputer, nullExecuteResult];
    }
    case "SUB": {
      const op1 = computer.dataRegister;
      const op2 = readMemory(computer, instruction.address);
      const value = sub(op1, op2);
      const newComputer = compose(
        setDataRegister(value),
        incProgramCounter
      )(computer);
      return [newComputer, nullExecuteResult];
    }
    case "LOAD": {
      const value = readMemory(computer, instruction.address);
      const newComputer = compose(
        setDataRegister(value),
        incProgramCounter
      )(computer);
      return [newComputer, nullExecuteResult];
    }
    case "STORE": {
      const newComputer = compose(
        writeMemory(instruction.address, computer.dataRegister),
        incProgramCounter
      )(computer);
      return [newComputer, nullExecuteResult];
    }
    case "GOTO": {
      const newComputer = setProgramCounter(instruction.address)(computer);
      return [newComputer, nullExecuteResult];
    }
    case "GOTOZ": {
      let newComputer: ComputerState;
      if (computer.dataRegister === 0) {
        newComputer = setProgramCounter(instruction.address)(computer);
      } else {
        newComputer = incProgramCounter(computer);
      }
      return [newComputer, nullExecuteResult];
    }
    case "GOTOP": {
      let newComputer: ComputerState;
      if (computer.dataRegister > 0) {
        newComputer = setProgramCounter(instruction.address)(computer);
      } else {
        newComputer = incProgramCounter(computer);
      }
      return [newComputer, nullExecuteResult];
    }
    case "READ": {
      if (nextInput === null) {
        return [
          computer,
          {
            consumedInput: false,
            output: null,
            stop: "NO_INPUT",
          },
        ];
      }
      const newComputer = compose(
        setDataRegister(nextInput),
        incProgramCounter
      )(computer);
      return [
        newComputer,
        {
          consumedInput: true,
          output: null,
          stop: null,
        },
      ];
    }
    case "WRITE": {
      const output = computer.dataRegister;
      const newComputer = incProgramCounter(computer);
      return [
        newComputer,
        {
          consumedInput: false,
          output: output,
          stop: null,
        },
      ];
    }
    case "STOP": {
      return [
        computer,
        {
          consumedInput: false,
          output: null,
          stop: "STOP",
        },
      ];
    }
    default:
      return assertNever(instruction);
  }
}
