import { assertNever } from "assert-never";

import type { Result } from "./Functional/Result";
import type { SrcError } from "./SrcError";
import type { Arg, Statement } from "./VicLangParser";

export function assembleVicProgram(
  statements: Statement[],
): Result<SrcError[], number[]> {
  const result: number[] = [];
  let errors: SrcError[] = [];

  const numInstructions = countInstructions(statements);
  if (numInstructions.error !== null) {
    errors.push(numInstructions.error);
  }

  const labels = processLabels(statements);
  errors = errors.concat(labels.errors);

  // The variables share a memory space with the instructions. The more
  // instructions there are, the less room there is for variables.
  //
  // The total size of the memory is 100 memory cells.
  const maxNumVariables = 100 - numInstructions.numInstructions;

  const variables = processVariables(statements, maxNumVariables);
  if (variables.error !== null) {
    errors.push(variables.error);
  }

  function varInstruction(code: number, arg: Arg | null): void {
    if (arg === null) {
      // We are assuming that an error has already been emitted at a previous
      // phase.
      return;
    }
    const addr = variables.variables.get(arg.name.toLowerCase());
    if (addr === undefined) {
      errors.push({
        message: `No such variable "${arg.name}"`,
        srcLoc: arg.srcLoc,
      });
      return;
    }
    result.push(code + addr);
  }

  function gotoInstruction(code: number, arg: Arg | null): void {
    if (arg === null) {
      // We are assuming that an error has already been emitted at a previous
      // phase.
      return;
    }
    const addr = labels.labels.get(arg.name.toLowerCase());
    if (addr === undefined) {
      errors.push({
        message: `No such label "${arg.name}"`,
        srcLoc: arg.srcLoc,
      });
      return;
    }
    result.push(code + addr);
  }

  for (const statement of statements) {
    switch (statement.kind) {
      case "Label":
        break;
      case "NullaryInstruction":
        switch (statement.instructionVal) {
          case "READ":
            result.push(800);
            break;
          case "WRITE":
            result.push(900);
            break;
          case "STOP":
            result.push(0);
            break;
          /* istanbul ignore next */
          default:
            assertNever(statement);
        }
        break;
      case "UnaryInstruction":
        switch (statement.instructionVal) {
          case "ADD":
            varInstruction(100, statement.arg);
            break;
          case "SUB":
            varInstruction(200, statement.arg);
            break;
          case "LOAD":
            varInstruction(300, statement.arg);
            break;
          case "STORE":
            varInstruction(400, statement.arg);
            break;
          case "GOTO":
            gotoInstruction(500, statement.arg);
            break;
          case "GOTOZ":
            gotoInstruction(600, statement.arg);
            break;
          case "GOTOP":
            gotoInstruction(700, statement.arg);
            break;
          /* istanbul ignore next */
          default:
            assertNever(statement);
        }
        break;
      /* istanbul ignore next */
      default:
        return assertNever(statement);
    }
  }

  if (errors.length > 0) {
    return {
      kind: "Error",
      error: errors,
    };
  } else {
    return {
      kind: "Ok",
      value: result,
    };
  }
}

interface CountInstructionsResult {
  numInstructions: number;
  error: SrcError | null;
}

function countInstructions(statements: Statement[]): CountInstructionsResult {
  let instructionCounter = 0;

  let error: SrcError | null = null;

  // This is the maximum number of instructions that will fit into the
  // computer memory.
  const maxNumInstructions = 90;

  for (const statement of statements) {
    switch (statement.kind) {
      case "Label": {
        break;
      }
      case "NullaryInstruction":
        instructionCounter++;
        if (error == null && instructionCounter > maxNumInstructions) {
          error = {
            message: "Too many instructions",
            srcLoc: statement.srcLoc,
          };
        }
        break;
      case "UnaryInstruction":
        instructionCounter++;
        if (error == null && instructionCounter > maxNumInstructions) {
          error = {
            message: "Too many instructions",
            srcLoc:
              statement.arg === null
                ? statement.srcLoc
                : {
                    line: statement.srcLoc.line,
                    startCol: statement.srcLoc.startCol,
                    endCol: statement.arg.srcLoc.endCol,
                  },
          };
        }
        break;
      /* istanbul ignore next */
      default:
        return assertNever(statement);
    }
  }
  return {
    numInstructions: instructionCounter,
    error: error,
  };
}

interface LabelsResult {
  labels: Map<string, number>;
  errors: SrcError[];
}

function processLabels(statements: Statement[]): LabelsResult {
  const labels = new Map<string, number>();
  const errors: SrcError[] = [];

  let instructionNumber = 0;
  for (const statement of statements) {
    switch (statement.kind) {
      case "Label": {
        const name = statement.labelName.toLowerCase();
        if (labels.has(name)) {
          errors.push({
            srcLoc: statement.srcLoc,
            message: `Duplicate label "${statement.labelName}"`,
          });
        } else {
          labels.set(name, instructionNumber);
        }
        break;
      }
      case "NullaryInstruction":
        instructionNumber++;
        break;
      case "UnaryInstruction":
        instructionNumber++;
        break;
      /* istanbul ignore next */
      default:
        return assertNever(statement);
    }
  }

  return {
    labels: labels,
    errors: errors,
  };
}

interface VariablesResult {
  variables: Map<string, number>;
  error: SrcError | null;
}

/**
 * The specification states that variables are allocated to memory addresses
 * starting at 90.
 *
 * See also `nextVariableSlot`
 */
export function firstVariableSlot(): number {
  return 90;
}

/**
 * The specification states that variables are first allocated to memory
 * addresses [90..97] (98 and 99 are already occupied with the built-in "zero"
 * and "one" variables).
 *
 * After those are full, the next variable is allocated at memory address 89,
 * and then it decreases from there.
 *
 * See also `firstVariableSlot`
 */
export function nextVariableSlot(slot: number): number {
  if (slot >= 90 && slot <= 96) {
    return slot + 1;
  } else if (slot === 97) {
    return 89;
  } else if (slot > 1) {
    return slot - 1;
  } else {
    return 0;
  }
}

function processVariables(
  statements: Statement[],
  maxNumVariables: number,
): VariablesResult {
  const variables = new Map<string, number>();

  // Built-in variables:
  variables.set("zero", 98);
  variables.set("one", 99);

  let error: SrcError | null = null;

  let variableSlot = firstVariableSlot();

  for (const statement of statements) {
    switch (statement.kind) {
      case "Label":
        break;
      case "NullaryInstruction":
        break;
      case "UnaryInstruction":
        if (statement.instructionVal === "STORE" && statement.arg !== null) {
          const varLower = statement.arg.name.toLowerCase();
          if (!variables.has(varLower)) {
            variables.set(varLower, variableSlot);
            variableSlot = nextVariableSlot(variableSlot);

            if (error === null && variables.size > maxNumVariables) {
              error = {
                message: "Too many variables",
                srcLoc: statement.arg.srcLoc,
              };
            }
          }
        }
        break;
      /* istanbul ignore next */
      default:
        return assertNever(statement);
    }
  }

  return {
    variables: variables,
    error: error,
  };
}
