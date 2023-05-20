import { type ParseLineResult, parseLine } from "./VicLangLineParser";

describe("parseLine success", () => {
  test("empty string", () => {
    expect(parseLine(0, "")).toEqual<ParseLineResult>({
      statement: null,
      errors: [],
    });
  });

  test("whitespace 1", () => {
    expect(parseLine(0, " ")).toEqual<ParseLineResult>({
      statement: null,
      errors: [],
    });
  });

  test("whitespace 2", () => {
    expect(parseLine(0, "  ")).toEqual<ParseLineResult>({
      statement: null,
      errors: [],
    });
  });

  test("only comment", () => {
    expect(parseLine(0, "// This is a comment")).toEqual<ParseLineResult>({
      statement: null,
      errors: [],
    });
  });

  test("whitespace and comment", () => {
    expect(parseLine(0, " // This is a comment")).toEqual<ParseLineResult>({
      statement: null,
      errors: [],
    });
  });

  test("label 1", () => {
    expect(parseLine(0, "foo:")).toEqual<ParseLineResult>({
      statement: {
        kind: "Label",
        labelName: "foo:",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 3,
        },
      },
      errors: [],
    });
  });

  test("label with tight comment", () => {
    expect(parseLine(0, "foo://comment")).toEqual<ParseLineResult>({
      statement: {
        kind: "Label",
        labelName: "foo:",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 3,
        },
      },
      errors: [],
    });
  });

  test("read instruction 1", () => {
    expect(parseLine(0, "read")).toEqual<ParseLineResult>({
      statement: {
        kind: "NullaryInstruction",
        instruction: "read",
        instructionVal: "READ",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 4,
        },
      },
      errors: [],
    });
  });

  test("read instruction 2", () => {
    expect(parseLine(0, "rEad")).toEqual<ParseLineResult>({
      statement: {
        kind: "NullaryInstruction",
        instruction: "rEad",
        instructionVal: "READ",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 4,
        },
      },
      errors: [],
    });
  });

  test("write instruction 1", () => {
    expect(parseLine(0, "write")).toEqual<ParseLineResult>({
      statement: {
        kind: "NullaryInstruction",
        instruction: "write",
        instructionVal: "WRITE",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 5,
        },
      },
      errors: [],
    });
  });

  test("write instruction 2", () => {
    expect(parseLine(0, "wRite")).toEqual<ParseLineResult>({
      statement: {
        kind: "NullaryInstruction",
        instruction: "wRite",
        instructionVal: "WRITE",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 5,
        },
      },
      errors: [],
    });
  });

  test("stop instruction 1", () => {
    expect(parseLine(0, "stop")).toEqual<ParseLineResult>({
      statement: {
        kind: "NullaryInstruction",
        instruction: "stop",
        instructionVal: "STOP",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 4,
        },
      },
      errors: [],
    });
  });

  test("stop instruction 2", () => {
    expect(parseLine(0, "sTop")).toEqual<ParseLineResult>({
      statement: {
        kind: "NullaryInstruction",
        instruction: "sTop",
        instructionVal: "STOP",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 4,
        },
      },
      errors: [],
    });
  });

  test("add instruction 1", () => {
    expect(parseLine(0, "add x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "add",
        instructionVal: "ADD",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 3,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 4,
            endCol: 5,
          },
        },
      },
      errors: [],
    });
  });

  test("add instruction 2", () => {
    expect(parseLine(0, "aDd x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "aDd",
        instructionVal: "ADD",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 3,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 4,
            endCol: 5,
          },
        },
      },
      errors: [],
    });
  });

  test("sub instruction 1", () => {
    expect(parseLine(0, "sub x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "sub",
        instructionVal: "SUB",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 3,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 4,
            endCol: 5,
          },
        },
      },
      errors: [],
    });
  });

  test("sub instruction 2", () => {
    expect(parseLine(0, "sUb x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "sUb",
        instructionVal: "SUB",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 3,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 4,
            endCol: 5,
          },
        },
      },
      errors: [],
    });
  });

  test("load instruction 1", () => {
    expect(parseLine(0, "load x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "load",
        instructionVal: "LOAD",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 4,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 5,
            endCol: 6,
          },
        },
      },
      errors: [],
    });
  });

  test("load instruction 2", () => {
    expect(parseLine(0, "lOad x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "lOad",
        instructionVal: "LOAD",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 4,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 5,
            endCol: 6,
          },
        },
      },
      errors: [],
    });
  });

  test("store instruction 1", () => {
    expect(parseLine(0, "store x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "store",
        instructionVal: "STORE",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 5,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 6,
            endCol: 7,
          },
        },
      },
      errors: [],
    });
  });

  test("store instruction 2", () => {
    expect(parseLine(0, "sTore x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "sTore",
        instructionVal: "STORE",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 5,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 6,
            endCol: 7,
          },
        },
      },
      errors: [],
    });
  });

  test("goto instruction 1", () => {
    expect(parseLine(0, "goto x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "goto",
        instructionVal: "GOTO",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 4,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 5,
            endCol: 6,
          },
        },
      },
      errors: [],
    });
  });

  test("goto instruction 2", () => {
    expect(parseLine(0, "gOto x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "gOto",
        instructionVal: "GOTO",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 4,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 5,
            endCol: 6,
          },
        },
      },
      errors: [],
    });
  });

  test("gotoz instruction 1", () => {
    expect(parseLine(0, "gotoz x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "gotoz",
        instructionVal: "GOTOZ",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 5,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 6,
            endCol: 7,
          },
        },
      },
      errors: [],
    });
  });

  test("gotoz instruction 2", () => {
    expect(parseLine(0, "gOtoz x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "gOtoz",
        instructionVal: "GOTOZ",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 5,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 6,
            endCol: 7,
          },
        },
      },
      errors: [],
    });
  });

  test("gotop instruction 1", () => {
    expect(parseLine(0, "gotop x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "gotop",
        instructionVal: "GOTOP",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 5,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 6,
            endCol: 7,
          },
        },
      },
      errors: [],
    });
  });

  test("gotop instruction 2", () => {
    expect(parseLine(0, "gOtop x")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "gOtop",
        instructionVal: "GOTOP",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 5,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 6,
            endCol: 7,
          },
        },
      },
      errors: [],
    });
  });
});

describe("parseLine errors", () => {
  test("empty label", () => {
    expect(parseLine(0, ":")).toEqual<ParseLineResult>({
      statement: null,
      errors: [
        {
          message: "Expected label name",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 1,
          },
        },
      ],
    });
  });

  test("invalid label", () => {
    expect(parseLine(0, "foo-bar:")).toEqual<ParseLineResult>({
      statement: null,
      errors: [
        {
          message: 'Invalid label name: "foo-bar"',
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 7,
          },
        },
      ],
    });
  });

  test("label with invalid trailing token", () => {
    expect(parseLine(0, "foo:  bar")).toEqual<ParseLineResult>({
      statement: {
        kind: "Label",
        labelName: "foo:",
        srcLoc: {
          endCol: 3,
          line: 0,
          startCol: 0,
        },
      },
      errors: [
        {
          message: 'Unexpected token "bar" after label "foo"',
          srcLoc: {
            line: 0,
            startCol: 6,
            endCol: 9,
          },
        },
      ],
    });
  });

  test("unknown instruction", () => {
    expect(parseLine(0, "foo")).toEqual<ParseLineResult>({
      statement: null,
      errors: [
        {
          message: 'Unknown instruction "FOO"',
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
    });
  });

  test("unknown instruction with arg", () => {
    expect(parseLine(0, "foo x")).toEqual<ParseLineResult>({
      statement: null,
      errors: [
        {
          message: 'Unknown instruction "FOO"',
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
    });
  });

  test("read with invalid arg", () => {
    expect(parseLine(0, "read x")).toEqual<ParseLineResult>({
      statement: {
        kind: "NullaryInstruction",
        instruction: "read",
        instructionVal: "READ",
        srcLoc: {
          endCol: 4,
          line: 0,
          startCol: 0,
        },
      },
      errors: [
        {
          message: "Unexpected argument to READ instruction",
          srcLoc: {
            line: 0,
            startCol: 5,
            endCol: 6,
          },
        },
      ],
    });
  });

  test("read with invalid two args", () => {
    expect(parseLine(0, "read x  y")).toEqual<ParseLineResult>({
      statement: {
        kind: "NullaryInstruction",
        instruction: "read",
        instructionVal: "READ",
        srcLoc: {
          endCol: 4,
          line: 0,
          startCol: 0,
        },
      },
      errors: [
        {
          message: "Unexpected argument to READ instruction",
          srcLoc: {
            line: 0,
            startCol: 5,
            endCol: 6,
          },
        },
        {
          message: "Unexpected argument to READ instruction",
          srcLoc: {
            line: 0,
            startCol: 8,
            endCol: 9,
          },
        },
      ],
    });
  });

  test("add with invalid arg", () => {
    expect(parseLine(0, "add foo-bar")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "add",
        instructionVal: "ADD",
        srcLoc: {
          endCol: 3,
          line: 0,
          startCol: 0,
        },
        arg: null,
      },
      errors: [
        {
          message: 'Invalid variable name: "foo-bar"',
          srcLoc: {
            line: 0,
            startCol: 4,
            endCol: 11,
          },
        },
      ],
    });
  });

  test("sub with invalid arg", () => {
    expect(parseLine(0, "sub foo-bar")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "sub",
        instructionVal: "SUB",
        srcLoc: {
          endCol: 3,
          line: 0,
          startCol: 0,
        },
        arg: null,
      },
      errors: [
        {
          message: 'Invalid variable name: "foo-bar"',
          srcLoc: {
            line: 0,
            startCol: 4,
            endCol: 11,
          },
        },
      ],
    });
  });

  test("load with invalid arg", () => {
    expect(parseLine(0, "load foo-bar")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "load",
        instructionVal: "LOAD",
        srcLoc: {
          endCol: 4,
          line: 0,
          startCol: 0,
        },
        arg: null,
      },
      errors: [
        {
          message: 'Invalid variable name: "foo-bar"',
          srcLoc: {
            line: 0,
            startCol: 5,
            endCol: 12,
          },
        },
      ],
    });
  });

  test("store with invalid arg", () => {
    expect(parseLine(0, "store foo-bar")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "store",
        instructionVal: "STORE",
        srcLoc: {
          endCol: 5,
          line: 0,
          startCol: 0,
        },
        arg: null,
      },
      errors: [
        {
          message: 'Invalid variable name: "foo-bar"',
          srcLoc: {
            line: 0,
            startCol: 6,
            endCol: 13,
          },
        },
      ],
    });
  });

  test("goto with invalid arg", () => {
    expect(parseLine(0, "goto foo-bar")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "goto",
        instructionVal: "GOTO",
        srcLoc: {
          endCol: 4,
          line: 0,
          startCol: 0,
        },
        arg: null,
      },
      errors: [
        {
          message: 'Invalid label name: "foo-bar"',
          srcLoc: {
            line: 0,
            startCol: 5,
            endCol: 12,
          },
        },
      ],
    });
  });

  test("gotoz with invalid arg", () => {
    expect(parseLine(0, "gotoz foo-bar")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "gotoz",
        instructionVal: "GOTOZ",
        srcLoc: {
          endCol: 5,
          line: 0,
          startCol: 0,
        },
        arg: null,
      },
      errors: [
        {
          message: 'Invalid label name: "foo-bar"',
          srcLoc: {
            line: 0,
            startCol: 6,
            endCol: 13,
          },
        },
      ],
    });
  });

  test("gotop with invalid arg", () => {
    expect(parseLine(0, "gotop foo-bar")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "gotop",
        instructionVal: "GOTOP",
        srcLoc: {
          endCol: 5,
          line: 0,
          startCol: 0,
        },
        arg: null,
      },
      errors: [
        {
          message: 'Invalid label name: "foo-bar"',
          srcLoc: {
            line: 0,
            startCol: 6,
            endCol: 13,
          },
        },
      ],
    });
  });

  test("add with missing arg", () => {
    expect(parseLine(0, "add")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "add",
        instructionVal: "ADD",
        srcLoc: {
          endCol: 3,
          line: 0,
          startCol: 0,
        },
        arg: null,
      },
      errors: [
        {
          message: "Expected variable argument to ADD instruction",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
    });
  });

  test("add with extra arg", () => {
    expect(parseLine(0, "add  x y")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "add",
        instructionVal: "ADD",
        srcLoc: {
          endCol: 3,
          line: 0,
          startCol: 0,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 5,
            endCol: 6,
          },
        },
      },
      errors: [
        {
          message: "Unexpected additional argument to ADD instruction",
          srcLoc: {
            line: 0,
            startCol: 7,
            endCol: 8,
          },
        },
      ],
    });
  });

  test("add with two extra args", () => {
    expect(parseLine(0, "add  x y z")).toEqual<ParseLineResult>({
      statement: {
        kind: "UnaryInstruction",
        instruction: "add",
        instructionVal: "ADD",
        srcLoc: {
          endCol: 3,
          line: 0,
          startCol: 0,
        },
        arg: {
          name: "x",
          srcLoc: {
            line: 0,
            startCol: 5,
            endCol: 6,
          },
        },
      },
      errors: [
        {
          message: "Unexpected additional argument to ADD instruction",
          srcLoc: {
            line: 0,
            startCol: 7,
            endCol: 8,
          },
        },
        {
          message: "Unexpected additional argument to ADD instruction",
          srcLoc: {
            line: 0,
            startCol: 9,
            endCol: 10,
          },
        },
      ],
    });
  });
});
