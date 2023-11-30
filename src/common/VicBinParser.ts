import { assertNever } from "assert-never";

import type { Result } from "./Functional/Result";
import type { SrcError } from "./SrcError";
import type { SrcLoc } from "./SrcLoc";

/**
 * The maximum size of a program.
 *
 * The total size of the memory is 100 memory cells, but the last 2 addresses
 * are read-only.
 */
const WRITABLE_MEMORY_SIZE = 98;

/**
 * Parse a vic source file.
 *
 * @returns An array of values that should be loaded into memory, or a list of
 * errors.
 */
export function parseVicBin(source: string): Result<SrcError[], number[]> {
  const values: number[] = [];
  const errors: SrcError[] = [];

  const lines = source.split("\n");
  lines.forEach((line, i) => {
    const result = parseVicBinLine(line, i);
    switch (result.kind) {
      case "Error":
        errors.push(result.error);
        break;
      case "Ok":
        if (result.value !== null) {
          values.push(result.value);
          if (values.length === WRITABLE_MEMORY_SIZE + 1) {
            const startCol = line.search("\\S");
            const endCol = line.length;
            errors.push({
              message: "Program too long to fit into memory",
              srcLoc: {
                line: i,
                startCol: startCol,
                endCol: endCol,
              },
            });
          }
        }
        break;
      /* istanbul ignore next */
      default:
        assertNever(result);
    }
  });

  if (errors.length > 0) {
    return {
      kind: "Error",
      error: errors,
    };
  }

  return {
    kind: "Ok",
    value: values,
  };
}

/**
 * Parse a single line of a vic source file.
 */
export function parseVicBinLine(
  line: string,
  lineNumber: number,
): Result<SrcError, number | null> {
  const [first, second] = splitWords(line);

  if (first === undefined) {
    return {
      kind: "Ok",
      value: null,
    };
  }

  if (second === undefined) {
    return parseValue(first.word, {
      line: lineNumber,
      startCol: first.index,
      endCol: first.index + first.word.length,
    });
  }

  const firstCheck = parseValue(first.word, {
    line: lineNumber,
    startCol: first.index,
    endCol: first.index + first.word.length,
  });

  if (firstCheck.kind === "Error") {
    return firstCheck;
  } else {
    return {
      kind: "Error",
      error: {
        message: `Unexpected value: "${second.word}"`,
        srcLoc: {
          line: lineNumber,
          startCol: second.index,
          endCol: second.index + second.word.length,
        },
      },
    };
  }
}

/**
 * Parses a word into a number in the range [-999, 999] or returns an error.
 */
function parseValue(word: string, srcLoc: SrcLoc): Result<SrcError, number> {
  const numRegex = /^-?\d+$/;
  if (!numRegex.test(word)) {
    return {
      kind: "Error",
      error: {
        message: `Invalid Value: "${word}"`,
        srcLoc: srcLoc,
      },
    };
  }

  const num = parseInt(word, 10);
  if (num < -999 || num > 999) {
    return {
      kind: "Error",
      error: {
        message: `Value out of range: ${num}`,
        srcLoc: srcLoc,
      },
    };
  }

  return {
    kind: "Ok",
    value: num,
  };
}

interface Word {
  /**
   * The contents of the word.
   */
  word: string;

  /**
   * The index of the first character of the word in the line.
   */
  index: number;
}

/**
 * Splits a line of text into zero or more words (separated by whitespace).
 */
function splitWords(line: string): Word[] {
  let index = 0;
  let rest: string = line;
  const result: Word[] = [];
  for (;;) {
    const nextNonWhitespace = rest.search("\\S");
    if (nextNonWhitespace < 0) {
      return result;
    }
    index += nextNonWhitespace;
    rest = rest.substring(nextNonWhitespace);

    const nextWhitespace = rest.search("\\s");
    if (nextWhitespace < 0) {
      result.push({
        word: rest,
        index: index,
      });
      return result;
    }

    result.push({
      word: rest.substring(0, nextWhitespace),
      index: index,
    });

    rest = rest.substring(nextWhitespace);
    index += nextWhitespace;
  }
}
