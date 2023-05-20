export interface Error {
  line: number;
  startCol: number;
  endCol: number;
  message: string;
}

export function getVicAsmErrors(source: string): Error[] {
  const lines = source.split("\n");

  let errors: Error[] = [];

  lines.forEach((line: string, index: number) => {
    errors = errors.concat(getLineErrors(index, line));
  });

  return errors;
}

export function getLineErrors(lineNum: number, source: string): Error[] {
  const tokens = parseLineTokens(stripComment(source));

  const firstToken = tokens[0];

  if (firstToken === undefined) {
    return [];
  }

  if (firstToken.contents.endsWith(":")) {
    return getLineErrorsLabel(lineNum, firstToken, tokens.slice(1));
  } else {
    return getLineErrorsInstruction(lineNum, firstToken, tokens.slice(1));
  }
}

export function getLineErrorsLabel(
  lineNum: number,
  firstToken: LineToken,
  rest: LineToken[]
): Error[] {
  const label = firstToken.contents.substring(
    0,
    firstToken.contents.length - 1
  );

  if (label === "") {
    return [
      {
        line: lineNum,
        startCol: firstToken.startCol,
        endCol: firstToken.endCol,
        message: `Expected label name`,
      },
    ];
  }

  if (!isValidIdentifier(label)) {
    return [
      {
        line: lineNum,
        startCol: firstToken.startCol,
        endCol: firstToken.endCol,
        message: `Invalid label name: "${label}"`,
      },
    ];
  }

  return rest.map<Error>((t) => ({
    line: lineNum,
    startCol: t.startCol,
    endCol: t.endCol,
    message: `Unexpected token "${t.contents}" after label "${label}"`,
  }));
}

export function getLineErrorsInstruction(
  lineNum: number,
  firstToken: LineToken,
  rest: LineToken[]
): Error[] {
  const instr = firstToken.contents.toLowerCase();
  switch (instr) {
    case "read":
    case "write":
    case "stop":
      return rest.map<Error>((t) => ({
        line: lineNum,
        startCol: t.startCol,
        endCol: t.endCol,
        message: `Unexpected argument to "${firstToken.contents}" instruction`,
      }));
    case "add":
    case "sub":
    case "load":
    case "store":
    case "goto":
    case "gotoz":
    case "gotop": {
      if (rest.length >= 2) {
        return rest.slice(1).map<Error>((t) => ({
          line: lineNum,
          startCol: t.startCol,
          endCol: t.endCol,
          message: `Unexpected additional argument to "${firstToken.contents}" instruction`,
        }));
      }

      const arg = rest[0];

      if (arg === undefined) {
        return [
          {
            line: lineNum,
            startCol: firstToken.startCol,
            endCol: firstToken.endCol,
            message: `Expected argument to "${firstToken.contents}" instruction`,
          },
        ];
      }

      if (!isValidIdentifier(arg.contents)) {
        const identType =
          instr === "goto" || instr === "gotoz" || instr === "gotop"
            ? "label"
            : "variable";

        return [
          {
            line: lineNum,
            startCol: arg.startCol,
            endCol: arg.endCol,
            message: `Invalid ${identType} name: "${arg.contents}"`,
          },
        ];
      }

      return [];
    }
    default:
      return [
        {
          line: lineNum,
          startCol: firstToken.startCol,
          endCol: firstToken.endCol,
          message: `Unknown instruction "${firstToken.contents}"`,
        },
      ];
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
