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
