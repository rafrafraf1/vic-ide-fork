import { type ComputerState, readMemory } from "../../Computer/Computer";
import type { UICell } from "../Simulator/Computer";
import type { Value } from "../../Computer/Value";
import { assertNever } from "assert-never";
import { parseInstruction } from "../../Computer/Instruction";

export interface ComputerAnimation {
  start: UICell;
  end: UICell;
  value: Value;
}

export function nextInstructionAnimation(
  computer: ComputerState
): ComputerAnimation | null {
  const instruction = parseInstruction(computer.instructionRegister);

  switch (instruction.kind) {
    case "ADD":
      return {
        start: {
          kind: "MemoryCell",
          address: instruction.address,
        },
        end: {
          kind: "CpuRegister",
          cpuRegister: "DATA_REGISTER",
        },
        value: readMemory(computer, instruction.address),
      };

    case "SUB":
      return {
        start: {
          kind: "MemoryCell",
          address: instruction.address,
        },
        end: {
          kind: "CpuRegister",
          cpuRegister: "DATA_REGISTER",
        },
        value: readMemory(computer, instruction.address),
      };
    case "LOAD":
      return {
        start: {
          kind: "MemoryCell",
          address: instruction.address,
        },
        end: {
          kind: "CpuRegister",
          cpuRegister: "DATA_REGISTER",
        },
        value: readMemory(computer, instruction.address),
      };
    case "STORE":
      return {
        start: {
          kind: "CpuRegister",
          cpuRegister: "DATA_REGISTER",
        },
        end: {
          kind: "MemoryCell",
          address: instruction.address,
        },
        value: computer.dataRegister,
      };
    case "GOTO":
      return null;
    case "GOTOZ":
      return null;
    case "GOTOP":
      return null;
    case "READ":
      throw new Error("TODO");
    case "WRITE":
      throw new Error("TODO");
    case "STOP":
      return null;
    default:
      return assertNever(instruction);
  }
}
