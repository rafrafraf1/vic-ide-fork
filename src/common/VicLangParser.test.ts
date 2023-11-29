import { type VicParsedProgram, parseVicProgram } from "./VicLangParser";

describe("parseVicProgram success", () => {
  test("empty string", () => {
    expect(parseVicProgram("")).toEqual<VicParsedProgram>({
      statements: [],
      errors: [],
    });
  });

  test("just a label", () => {
    expect(parseVicProgram("foo:")).toEqual<VicParsedProgram>({
      statements: [
        {
          kind: "Label",
          labelName: "foo",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
      errors: [],
    });
  });

  test("two labels", () => {
    expect(
      parseVicProgram(
        [
          "foo:", // 0
          "bar:", // 1
        ].join("\n"),
      ),
    ).toEqual<VicParsedProgram>({
      statements: [
        {
          kind: "Label",
          labelName: "foo",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 3,
          },
        },
        {
          kind: "Label",
          labelName: "bar",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
      errors: [],
    });
  });

  test("labels with blank lines", () => {
    expect(
      parseVicProgram(
        [
          "foo:", // 0
          "", // 1
          "// comment", // 2
          "bar:", // 3
        ].join("\n"),
      ),
    ).toEqual<VicParsedProgram>({
      statements: [
        {
          kind: "Label",
          labelName: "foo",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 3,
          },
        },
        {
          kind: "Label",
          labelName: "bar",
          srcLoc: {
            line: 3,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
      errors: [],
    });
  });

  test("first line blank", () => {
    expect(
      parseVicProgram(
        [
          "", // 0
          "foo:", // 1
        ].join("\n"),
      ),
    ).toEqual<VicParsedProgram>({
      statements: [
        {
          kind: "Label",
          labelName: "foo",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
      errors: [],
    });
  });
});

describe("parseVicProgram errors", () => {
  test("invalid instruction", () => {
    expect(parseVicProgram("blah")).toEqual<VicParsedProgram>({
      statements: [],
      errors: [
        {
          message: 'Unknown instruction "BLAH"',
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 4,
          },
        },
      ],
    });
  });

  test("invalid instruction sandwich", () => {
    expect(
      parseVicProgram(
        [
          "read", // 0
          "blah", // 1
          "write", // 2
        ].join("\n"),
      ),
    ).toEqual<VicParsedProgram>({
      statements: [
        {
          kind: "NullaryInstruction",
          instruction: "read",
          instructionVal: "READ",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 4,
          },
        },
        {
          kind: "NullaryInstruction",
          instruction: "write",
          instructionVal: "WRITE",
          srcLoc: {
            line: 2,
            startCol: 0,
            endCol: 5,
          },
        },
      ],
      errors: [
        {
          message: 'Unknown instruction "BLAH"',
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 4,
          },
        },
      ],
    });
  });
});
