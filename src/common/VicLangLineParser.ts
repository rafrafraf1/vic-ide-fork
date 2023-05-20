import {
  type Arg,
  type NullaryInstructionType,
  type Statement,
  type UnaryInstructionType,
  instructionArgKind,
} from "./VicLangParser";
import type { SrcError } from "./SrcError";
import { assertNever } from "assert-never";

export interface ParseLineResult {
  /**
   * Will be `null` if the line was blank (or containing just a comment).
   *
   * Will also be `null` if there was a parse error that made it hopeless to
   * extract a Statement.
   */
  statement: Statement | null;

  /**
   * Will be empty if there were no errors.
   */
  errors: SrcError[];
}

/**
 * Parse a single line into a statement (label or instruction).
 *
 * Even if there are errors, it will make an effort to return a statement.
 */
export function parseLine(lineNum: number, source: string): ParseLineResult {
  const tokens = parseLineTokens(stripComment(source));

  const firstToken = tokens[0];

  if (firstToken === undefined) {
    // No tokens (empty line, or only a comment)
    return {
      statement: null,
      errors: [],
    };
  }

  if (firstToken.contents.endsWith(":")) {
    return parseLabelStatement(lineNum, firstToken, tokens.slice(1));
  } else {
    return parseInstructionStatement(lineNum, firstToken, tokens.slice(1));
  }
}

function parseLabelStatement(
  lineNum: number,
  firstToken: LineToken,
  rest: LineToken[]
): ParseLineResult {
  const label = firstToken.contents.substring(
    0,
    firstToken.contents.length - 1
  );

  if (label === "") {
    return {
      statement: null,
      errors: [
        {
          srcLoc: {
            line: lineNum,
            startCol: firstToken.startCol,
            endCol: firstToken.endCol,
          },
          message: `Expected label name`,
        },
      ],
    };
  }

  if (!isValidIdentifier(label)) {
    return {
      statement: null,
      errors: [
        {
          srcLoc: {
            line: lineNum,
            startCol: firstToken.startCol,
            endCol: firstToken.endCol - 1, // Without the trailing ':' char
          },
          message: `Invalid label name: "${label}"`,
        },
      ],
    };
  }

  return {
    statement: {
      kind: "Label",
      labelName: label,
      srcLoc: {
        line: lineNum,
        startCol: firstToken.startCol,
        endCol: firstToken.endCol - 1, // Without the trailing ':' char
      },
    },
    errors: rest.map<SrcError>((t) => ({
      srcLoc: {
        line: lineNum,
        startCol: t.startCol,
        endCol: t.endCol,
      },
      message: `Unexpected token "${t.contents}" after label "${label}"`,
    })),
  };
}

type MatchedInstruction =
  | MatchedInstruction.NullaryInstruction
  | MatchedInstruction.UnaryInstruction;

namespace MatchedInstruction {
  export interface NullaryInstruction {
    kind: "NullaryInstruction";
    instruction: NullaryInstructionType;
  }

  export interface UnaryInstruction {
    kind: "UnaryInstruction";
    instruction: UnaryInstructionType;
  }
}

function matchInstructionName(
  instructionStr: string
): MatchedInstruction | null {
  switch (instructionStr.toLowerCase()) {
    case "read":
      return {
        kind: "NullaryInstruction",
        instruction: "READ",
      };
    case "write":
      return {
        kind: "NullaryInstruction",
        instruction: "WRITE",
      };
    case "stop":
      return {
        kind: "NullaryInstruction",
        instruction: "STOP",
      };
    case "add":
      return {
        kind: "UnaryInstruction",
        instruction: "ADD",
      };
    case "sub":
      return {
        kind: "UnaryInstruction",
        instruction: "SUB",
      };
    case "load":
      return {
        kind: "UnaryInstruction",
        instruction: "LOAD",
      };
    case "store":
      return {
        kind: "UnaryInstruction",
        instruction: "STORE",
      };
    case "goto":
      return {
        kind: "UnaryInstruction",
        instruction: "GOTO",
      };
    case "gotoz":
      return {
        kind: "UnaryInstruction",
        instruction: "GOTOZ",
      };
    case "gotop":
      return {
        kind: "UnaryInstruction",
        instruction: "GOTOP",
      };
    default:
      return null;
  }
}

function parseInstructionStatement(
  lineNum: number,
  firstToken: LineToken,
  rest: LineToken[]
): ParseLineResult {
  const matched = matchInstructionName(firstToken.contents);
  if (matched === null) {
    return {
      statement: null,
      errors: [
        {
          srcLoc: {
            line: lineNum,
            startCol: firstToken.startCol,
            endCol: firstToken.endCol,
          },
          message: `Unknown instruction "${firstToken.contents.toUpperCase()}"`,
        },
      ],
    };
  }

  switch (matched.kind) {
    case "NullaryInstruction":
      return {
        statement: {
          kind: "NullaryInstruction",
          instruction: firstToken.contents,
          instructionVal: matched.instruction,
          srcLoc: {
            line: lineNum,
            startCol: firstToken.startCol,
            endCol: firstToken.endCol,
          },
        },
        errors: rest.map<SrcError>((t) => ({
          srcLoc: {
            line: lineNum,
            startCol: t.startCol,
            endCol: t.endCol,
          },
          message: `Unexpected argument to ${matched.instruction} instruction`,
        })),
      };
    case "UnaryInstruction": {
      let errors: SrcError[] = [];
      let arg: Arg | null = null;

      const argKind = instructionArgKind(
        matched.instruction
      ).toLocaleLowerCase();

      const argToken = rest[0];

      if (argToken === undefined) {
        errors = errors.concat([
          {
            srcLoc: {
              line: lineNum,
              startCol: firstToken.startCol,
              endCol: firstToken.endCol,
            },
            message: `Expected ${argKind} argument to ${matched.instruction} instruction`,
          },
        ]);
      } else {
        if (isValidIdentifier(argToken.contents)) {
          arg = {
            name: argToken.contents,
            srcLoc: {
              line: lineNum,
              startCol: argToken.startCol,
              endCol: argToken.endCol,
            },
          };
        } else {
          errors = errors.concat([
            {
              srcLoc: {
                line: lineNum,
                startCol: argToken.startCol,
                endCol: argToken.endCol,
              },
              message: `Invalid ${argKind} name: "${argToken.contents}"`,
            },
          ]);
        }
      }

      if (rest.length >= 2) {
        errors = errors.concat(
          rest.slice(1).map<SrcError>((t) => ({
            srcLoc: {
              line: lineNum,
              startCol: t.startCol,
              endCol: t.endCol,
            },
            message: `Unexpected additional argument to ${matched.instruction} instruction`,
          }))
        );
      }

      return {
        statement: {
          kind: "UnaryInstruction",
          instruction: firstToken.contents,
          instructionVal: matched.instruction,
          srcLoc: {
            line: lineNum,
            startCol: firstToken.startCol,
            endCol: firstToken.endCol,
          },
          arg: arg,
        },
        errors: errors,
      };
    }
    /* istanbul ignore next */
    default:
      return assertNever(matched);
  }
}

function stripComment(source: string): string {
  const i = source.indexOf("//");
  if (i < 0) {
    return source;
  }
  return source.substring(0, i);
}

interface LineToken {
  startCol: number;
  endCol: number;
  contents: string;
}

function parseLineTokens(source: string): LineToken[] {
  const tokens: LineToken[] = [];

  let currentToken: LineToken | null = null;

  for (let i = 0; i < source.length; i++) {
    const ch = source.charAt(i);
    if (currentToken === null) {
      if (ch !== " " && ch !== "\t") {
        currentToken = {
          contents: ch,
          startCol: i,
          endCol: i + 1,
        };
      }
    } else {
      if (ch !== " " && ch !== "\t") {
        currentToken.contents += ch;
        currentToken.endCol++;
      } else {
        tokens.push(currentToken);
        currentToken = null;
      }
    }
  }

  if (currentToken !== null) {
    tokens.push(currentToken);
  }

  return tokens;
}

const identRegex = /^[a-zA-Z]\w*$/;

function isValidIdentifier(ident: string): boolean {
  return identRegex.test(ident);
}
