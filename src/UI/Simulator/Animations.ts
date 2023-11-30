import { assertNever } from "assert-never";

import { readMemory, type ComputerState } from "../../Computer/Computer";
import { parseInstruction } from "../../Computer/Instruction";
import type { Value } from "../../Computer/Value";
import type { UICell } from "../Simulator/Computer";

export interface ComputerAnimation {
  start: UICell;
  end: UICell;
  value: Value;
}

export function nextInstructionAnimation(
  computer: ComputerState,
  nextInput: Value | null,
): ComputerAnimation | null {
  const instruction = parseInstruction(computer.instructionRegister);

  if (instruction === null) {
    return null;
  }

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
      if (nextInput === null) {
        return null;
      } else {
        return {
          start: {
            kind: "Input",
          },
          end: {
            kind: "CpuRegister",
            cpuRegister: "DATA_REGISTER",
          },
          value: nextInput,
        };
      }
    case "WRITE":
      return {
        start: {
          kind: "CpuRegister",
          cpuRegister: "DATA_REGISTER",
        },
        end: {
          kind: "Output",
        },
        value: computer.dataRegister,
      };
    case "STOP":
      return null;
    default:
      return assertNever(instruction);
  }
}
