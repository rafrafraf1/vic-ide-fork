import type { SrcLoc, SrcPos } from "./SrcLoc";
import { getHighlights } from "./VicLangSrcAnalysis";
import { parseVicProgram } from "./VicLangParser";

/**
 * Helper function for parsing and highlighting a source program.
 */
function getProgramHighlights(
  source: string,
  lineCol: [number, number],
): SrcLoc[] {
  const parsedProgram = parseVicProgram(source);
  const [line, column] = lineCol;
  const pos: SrcPos = {
    line: line,
    column: column,
  };
  return getHighlights(parsedProgram.statements, pos);
}

describe("getHighlights no results", () => {
  test("empty string", () => {
    expect(getProgramHighlights("", [0, 0])).toEqual<SrcLoc[]>([]);
  });

  test("empty pos", () => {
    expect(
      getProgramHighlights(
        [
          "foo:", // 0
          "    read", // 1
          "    store x", // 2
        ].join("\n"),
        [1, 0],
      ),
    ).toEqual<SrcLoc[]>([]);
  });

  test("sneaky variable name pos at instruction", () => {
    expect(
      getProgramHighlights(
        [
          "store foo", // 0
          "store add", // 1
          "add add", // 2
          "sub add", // 3
          "stop", // 4
        ].join("\n"),
        [2, 0],
      ),
    ).toEqual<SrcLoc[]>([]);
  });
});

describe("getHighlights success", () => {
  test("single label", () => {
    expect(getProgramHighlights("foo:", [0, 0])).toEqual<SrcLoc[]>([
      {
        line: 0,
        startCol: 0,
        endCol: 3,
      },
    ]);
  });

  test("duplicate label", () => {
    expect(
      getProgramHighlights(
        [
          "foo:", // 0
          "bar:", // 1
          " foo:", // 2
        ].join("\n"),
        [0, 0],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 0,
        startCol: 0,
        endCol: 3,
      },
      {
        line: 2,
        startCol: 1,
        endCol: 4,
      },
    ]);
  });

  test("label and gotos", () => {
    expect(
      getProgramHighlights(
        [
          "start:", // 0
          "read", // 1
          "foo:", // 2
          "write", // 3
          "goto foo", // 4
          "stop", // 5
          "gotoz foo", //6
        ].join("\n"),
        [2, 0],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 2,
        startCol: 0,
        endCol: 3,
      },
      {
        line: 4,
        startCol: 5,
        endCol: 8,
      },
      {
        line: 6,
        startCol: 6,
        endCol: 9,
      },
    ]);
  });

  test("highlight goto label", () => {
    expect(
      getProgramHighlights(
        [
          "start:", // 0
          "read", // 1
          "foo:", // 2
          "write", // 3
          "goto foo", // 4
          "stop", // 5
          "gotoz foo", //6
        ].join("\n"),
        [4, 5],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 2,
        startCol: 0,
        endCol: 3,
      },
      {
        line: 4,
        startCol: 5,
        endCol: 8,
      },
      {
        line: 6,
        startCol: 6,
        endCol: 9,
      },
    ]);
  });

  test("simple variable", () => {
    expect(
      getProgramHighlights(
        [
          "goto foo", // 0
          "add x", // 1
          "foo:", // 2
          "store x", // 3
          "sub x", // 4
          "stop", // 5
        ].join("\n"),
        [1, 4],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 1,
        startCol: 4,
        endCol: 5,
      },
      {
        line: 3,
        startCol: 6,
        endCol: 7,
      },
      {
        line: 4,
        startCol: 4,
        endCol: 5,
      },
    ]);
  });

  test("variable with no store", () => {
    expect(
      getProgramHighlights(
        [
          "add var", // 0
          "add var", // 1
        ].join("\n"),
        [1, 4],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 0,
        startCol: 4,
        endCol: 7,
      },
      {
        line: 1,
        startCol: 4,
        endCol: 7,
      },
    ]);
  });

  test("program with errors", () => {
    expect(
      getProgramHighlights(
        [
          "add x", // 0
          "sub x y", // 1
        ].join("\n"),
        [1, 4],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 0,
        startCol: 4,
        endCol: 5,
      },
      {
        line: 1,
        startCol: 4,
        endCol: 5,
      },
    ]);
  });

  test("case insensitive variables", () => {
    expect(
      getProgramHighlights(
        [
          "store count", // 0
          "load cOunt", // 1
        ].join("\n"),
        [0, 6],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 0,
        startCol: 6,
        endCol: 11,
      },
      {
        line: 1,
        startCol: 5,
        endCol: 10,
      },
    ]);
  });

  test("case insensitive labels 1", () => {
    expect(
      getProgramHighlights(
        [
          "start:", // 0
          "goto sTart", // 1
          "sTart:", // 2
          "gotoz start", // 3
        ].join("\n"),
        [0, 0],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 0,
        startCol: 0,
        endCol: 5,
      },
      {
        line: 1,
        startCol: 5,
        endCol: 10,
      },
      {
        line: 2,
        startCol: 0,
        endCol: 5,
      },
      {
        line: 3,
        startCol: 6,
        endCol: 11,
      },
    ]);
  });

  test("case insensitive labels 2", () => {
    expect(
      getProgramHighlights(
        [
          "start:", // 0
          "goto sTart", // 1
          "sTart:", // 2
          "gotoz start", // 3
        ].join("\n"),
        [1, 5],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 0,
        startCol: 0,
        endCol: 5,
      },
      {
        line: 1,
        startCol: 5,
        endCol: 10,
      },
      {
        line: 2,
        startCol: 0,
        endCol: 5,
      },
      {
        line: 3,
        startCol: 6,
        endCol: 11,
      },
    ]);
  });

  test("sneaky variable name pos at var", () => {
    expect(
      getProgramHighlights(
        [
          "store foo", // 0
          "store add", // 1
          "add add", // 2
          "sub add", // 3
          "stop", // 4
        ].join("\n"),
        [2, 5],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 1,
        startCol: 6,
        endCol: 9,
      },
      {
        line: 2,
        startCol: 4,
        endCol: 7,
      },
      {
        line: 3,
        startCol: 4,
        endCol: 7,
      },
    ]);
  });

  test("label and variable with same name 1", () => {
    expect(
      getProgramHighlights(
        [
          "store foo", // 0
          "foo:", // 1
          "add foo", // 2
          "goto foo", // 3
          "bar:", // 4
          "goto bar", // 5
          "store bar", // 6
        ].join("\n"),
        [0, 6],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 0,
        startCol: 6,
        endCol: 9,
      },
      {
        line: 2,
        startCol: 4,
        endCol: 7,
      },
    ]);
  });

  test("label and variable with same name 2", () => {
    expect(
      getProgramHighlights(
        [
          "store foo", // 0
          "foo:", // 1
          "add foo", // 2
          "goto foo", // 3
          "bar:", // 4
          "goto bar", // 5
          "store bar", // 6
        ].join("\n"),
        [1, 0],
      ),
    ).toEqual<SrcLoc[]>([
      {
        line: 1,
        startCol: 0,
        endCol: 3,
      },
      {
        line: 3,
        startCol: 5,
        endCol: 8,
      },
    ]);
  });
});
