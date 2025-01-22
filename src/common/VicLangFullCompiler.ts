import { assertNever } from "assert-never";

import type { Result } from "./Functional/Result";
import type { SrcError } from "./SrcError";
import { assembleVicProgram } from "./VicLangAssembler";
import { parseVicProgram, type Statement } from "./VicLangParser";

export interface VicCompileResult {
  statements: Statement[];
  program: Result<SrcError[], number[]>;
}

export function compileVicProgram(source: string): VicCompileResult {
  const parsedProgram = parseVicProgram(source);

  let errors: SrcError[] = parsedProgram.errors;

  const assembleResult = assembleVicProgram(parsedProgram.statements);

  if (assembleResult.kind === "Ok" && errors.length === 0) {
    return {
      statements: parsedProgram.statements,
      program: {
        kind: "Ok",
        value: assembleResult.value,
      },
    };
  }

  if (assembleResult.kind === "Error") {
    errors = errors.concat(assembleResult.error);
  }

  return {
    statements: parsedProgram.statements,
    program: {
      kind: "Error",
      error: errors,
    },
  };
}

/**
 * Formats a compiled program into Vic binary source code. The lines of the
 * resulting code will match up to the lines of the source assembly code. This
 * means that blank lines will be inserted in the output (for example, where
 * there were blank lines in the input, or label statements).
 *
 * The parameters should be the result of a call to `compileVicProgram`.
 */
export function prettyVicCompileResult(
  programValues: number[],
  statements: Statement[],
): string {
  let nextInstruction = 0;
  let currentLine = 0;
  const result: string[] = [];
  for (const stmt of statements) {
    const line = getInstructionLine(stmt);
    if (line === null) {
      continue;
    }
    while (currentLine !== line) {
      result.push("");
      currentLine++;
    }
    result.push(`${programValues[nextInstruction]}`);
    nextInstruction++;
    currentLine++;
  }
  let resultStr = result.join("\n");
  if (resultStr !== "") {
    resultStr += "\n";
  }
  return resultStr;
}

function getInstructionLine(statement: Statement): number | null {
  switch (statement.kind) {
    case "Label":
      return null;
    case "NullaryInstruction":
      return statement.srcLoc.line;
    case "UnaryInstruction":
      return statement.srcLoc.line;
    /* istanbul ignore next */
    default:
      return assertNever(statement);
  }
}
