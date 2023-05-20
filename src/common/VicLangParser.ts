import type { SrcError } from "./SrcError";
import type { SrcLoc } from "./SrcLoc";
import { assertNever } from "assert-never";
import { parseLine } from "./VicLangLineParser";

/**
 * A single line in a Vic program. Can be a label or an instruction.
 */
export type Statement =
  | Statement.Label
  | Statement.NullaryInstruction
  | Statement.UnaryInstruction;

export namespace Statement {
  /**
   * A label statement, for example: "LOOP:"
   */
  export interface Label {
    kind: "Label";
    labelName: string;

    /**
     * The label, not including the trailing ':' character.
     */
    srcLoc: SrcLoc;
  }

  /**
   * Instructions that don't take an argument.
   *
   * Includes the instructions: READ, WRITE, STOP.
   */
  export interface NullaryInstruction {
    kind: "NullaryInstruction";
    instruction: string;
    instructionVal: NullaryInstructionType;
    srcLoc: SrcLoc;
  }

  /**
   * Instructions that take a single argument.
   *
   * Includes the instructions: ADD, SUB, LOAD, STORE, GOTO, GOTOZ, GOTOP.
   */
  export interface UnaryInstruction {
    kind: "UnaryInstruction";

    instruction: string;
    instructionVal: UnaryInstructionType;
    srcLoc: SrcLoc;

    arg: Arg | null;
  }
}

export type NullaryInstructionType = "READ" | "WRITE" | "STOP";

export type UnaryInstructionType =
  | "ADD"
  | "SUB"
  | "LOAD"
  | "STORE"
  | "GOTO"
  | "GOTOZ"
  | "GOTOP";

/**
 * An argument to an instruction
 */
export interface Arg {
  name: string;
  srcLoc: SrcLoc;
}

/**
 * If the argument is a variable, or a label (for a goto instruction).
 */
export type ArgKind = "VARIABLE" | "LABEL";

/**
 * @returns whether the instruction argument is a variable or a label (goto
 * instructions accept labels).
 */
export function instructionArgKind(instr: UnaryInstructionType): ArgKind {
  switch (instr) {
    case "ADD":
      return "VARIABLE";
    case "SUB":
      return "VARIABLE";
    case "LOAD":
      return "VARIABLE";
    case "STORE":
      return "VARIABLE";
    case "GOTO":
      return "LABEL";
    case "GOTOZ":
      return "LABEL";
    case "GOTOP":
      return "LABEL";
    /* istanbul ignore next */
    default:
      return assertNever(instr);
  }
}

export interface VicParsedProgram {
  /**
   * The list of statements that the program consists of, in order.
   */
  statements: Statement[];

  /**
   * Will be empty is the program is valid.
   */
  errors: SrcError[];
}

/**
 * Parse a Vic language source program.
 *
 * Even if there are errors, it will make an effort to return the list of
 * valid statements.
 */
export function parseVicProgram(source: string): VicParsedProgram {
  const lines = source.split("\n");

  const statements: Statement[] = [];
  let errors: SrcError[] = [];

  lines.forEach((line: string, index: number) => {
    const result = parseLine(index, line);

    if (result.statement !== null) {
      statements.push(result.statement);
    }
    errors = errors.concat(result.errors);
  });

  return {
    statements: statements,
    errors: errors,
  };
}
