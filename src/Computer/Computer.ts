import { Instruction, Address } from "./Instruction";
import { Value } from "./Value";

type Register = Value;

type MemoryCell = Value;

/**
 * The amount of memory available in the Vic computer.
 *
 * It doesn't make sense to make this larger, because the CPU instructions can only
 */
export const MEMORY_SIZE = 100;
export const MEMORY_READONLY_REGION = 98;

/**
 * For efficiency reasons, the fields are mutable
 */
export interface ComputerState {
  // TODO Do we need this?
  // instructionRegister: Register;
  dataRegister: Register;
  programCounter: Register;

  /**
   * The size of the memory is MEMORY_SIZE (equal to 100)
   */
  memory: Array<MemoryCell>;
}

export function writeMemory(
  computer: ComputerState,
  address: Address,
  value: Value
): void {
  // TODO Ignore if the memory address is read-only
  computer.memory[address] = value;
}

export function readMemory(computer: ComputerState, address: Address): Value {
  return computer.memory[address];
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
  memory[MEMORY_SIZE - 1] = 1;
  return {
    dataRegister: 0,
    // TODO:
    // instructionRegister: 0,
    programCounter: 0,
    memory: newBlankMemory(),
  };
}

/**
 * @returns an array of size MEMORY_SIZE with all elements set to 0.
 */
export function newBlankMemory(): Array<MemoryCell> {
  const memory = [];
  for (let i = 0; i < MEMORY_SIZE; i++) {
    memory.push(0);
  }
  return memory;
}

export interface ExecuteResult {
  consumedInput: boolean;
  output: Value | null;
  stop: boolean;
}

export const nullExecuteResult: ExecuteResult = {
  consumedInput: false,
  output: null,
  stop: false,
};

export function executeInstruction(
  computer: ComputerState,
  instruction: Instruction,
  nextInput: Value
): ExecuteResult {
  switch (instruction.kind) {
    case "ADD":
      computer.dataRegister = add(
        computer.dataRegister,
        readMemory(computer, instruction.address)
      );
      computer.programCounter++;
      return nullExecuteResult;
    case "SUB":
      computer.dataRegister = sub(
        computer.dataRegister,
        readMemory(computer, instruction.address)
      );
      computer.programCounter++;
      return nullExecuteResult;
    case "LOAD":
      computer.dataRegister = readMemory(computer, instruction.address);
      computer.programCounter++;
      return nullExecuteResult;
    case "STORE":
      writeMemory(computer, instruction.address, computer.dataRegister);
      computer.programCounter++;
      return nullExecuteResult;
    case "GOTO":
      computer.programCounter = instruction.address;
      return nullExecuteResult;
    case "GOTOZ":
      if (computer.dataRegister === 0) {
        computer.programCounter = instruction.address;
      } else {
        computer.programCounter++;
      }
      return nullExecuteResult;
    case "GOTOP":
      if (computer.dataRegister > 0) {
        computer.programCounter = instruction.address;
      } else {
        computer.programCounter++;
      }
      return nullExecuteResult;
    case "READ":
      computer.dataRegister = nextInput;
      computer.programCounter++;
      return {
        consumedInput: true,
        output: null,
        stop: false,
      };
    case "WRITE":
      const output = computer.dataRegister;
      computer.programCounter++;
      return {
        consumedInput: false,
        output: output,
        stop: false,
      };
    case "STOP":
      return {
        consumedInput: false,
        output: null,
        stop: true,
      };
  }
}
