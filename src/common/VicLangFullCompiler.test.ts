import { assertNever } from "assert-never";

import type { Result } from "./Functional/Result";
import type { SrcError } from "./SrcError";
import {
  compileVicProgram,
  prettyVicCompileResult,
  type VicCompileResult,
} from "./VicLangFullCompiler";

describe("compileVicProgram success", () => {
  test("empty string", () => {
    expect(compileVicProgram("")).toEqual<VicCompileResult>({
      statements: [],
      program: {
        kind: "Ok",
        value: [],
      },
    });
  });

  test("read instruction", () => {
    expect(
      compileVicProgram(
        [
          "read", // 0
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [800],
      },
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
      ],
    });
  });

  test("write instruction", () => {
    expect(
      compileVicProgram(
        [
          "write", // 0
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [900],
      },
      statements: [
        {
          kind: "NullaryInstruction",
          instruction: "write",
          instructionVal: "WRITE",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 5,
          },
        },
      ],
    });
  });

  test("stop instruction", () => {
    expect(
      compileVicProgram(
        [
          "stop", // 0
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [0],
      },
      statements: [
        {
          kind: "NullaryInstruction",
          instruction: "stop",
          instructionVal: "STOP",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 4,
          },
        },
      ],
    });
  });

  test("add instruction", () => {
    expect(
      compileVicProgram(
        [
          "store x", // 0
          "add x", // 1
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [490, 190],
      },
      statements: [
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 0,
              startCol: 6,
              endCol: 7,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 1,
              startCol: 4,
              endCol: 5,
            },
          },
          instruction: "add",
          instructionVal: "ADD",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
    });
  });

  test("sub instruction", () => {
    expect(
      compileVicProgram(
        [
          "store x", // 0
          "sub x", // 1
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [490, 290],
      },
      statements: [
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 0,
              startCol: 6,
              endCol: 7,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 1,
              startCol: 4,
              endCol: 5,
            },
          },
          instruction: "sub",
          instructionVal: "SUB",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
    });
  });

  test("load instruction", () => {
    expect(
      compileVicProgram(
        [
          "store x", // 0
          "load x", // 1
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [490, 390],
      },
      statements: [
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 0,
              startCol: 6,
              endCol: 7,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 1,
              startCol: 5,
              endCol: 6,
            },
          },
          instruction: "load",
          instructionVal: "LOAD",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 4,
          },
        },
      ],
    });
  });

  test("store instruction", () => {
    expect(
      compileVicProgram(
        [
          "store x", // 0
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [490],
      },
      statements: [
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 0,
              startCol: 6,
              endCol: 7,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 5,
          },
        },
      ],
    });
  });

  test("goto instruction", () => {
    expect(
      compileVicProgram(
        [
          "foo:", // 0
          "goto foo", // 1
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [500],
      },
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
          kind: "UnaryInstruction",
          arg: {
            name: "foo",
            srcLoc: {
              line: 1,
              startCol: 5,
              endCol: 8,
            },
          },
          instruction: "goto",
          instructionVal: "GOTO",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 4,
          },
        },
      ],
    });
  });

  test("gotoz instruction", () => {
    expect(
      compileVicProgram(
        [
          "foo:", // 0
          "gotoz foo", // 1
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [600],
      },
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
          kind: "UnaryInstruction",
          arg: {
            name: "foo",
            srcLoc: {
              line: 1,
              startCol: 6,
              endCol: 9,
            },
          },
          instruction: "gotoz",
          instructionVal: "GOTOZ",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 5,
          },
        },
      ],
    });
  });

  test("gotop instruction", () => {
    expect(
      compileVicProgram(
        [
          "foo:", // 0
          "gotop foo", // 1
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [700],
      },
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
          kind: "UnaryInstruction",
          arg: {
            name: "foo",
            srcLoc: {
              line: 1,
              startCol: 6,
              endCol: 9,
            },
          },
          instruction: "gotop",
          instructionVal: "GOTOP",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 5,
          },
        },
      ],
    });
  });

  test("minimal program", () => {
    expect(
      compileVicProgram(
        [
          "start:", // 0
          "goto loop", // 1
          "store x", // 2
          "loop:", // 3
          "add y", // 4
          "store y", //  5
          "read", // 6
          "gotoz start", // 7
          "load x", // 8
          "load y", // 9
          "stop", // 10
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [502, 490, 191, 491, 800, 600, 390, 391, 0],
      },
      statements: [
        {
          kind: "Label",
          labelName: "start",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "loop",
            srcLoc: {
              line: 1,
              startCol: 5,
              endCol: 9,
            },
          },
          instruction: "goto",
          instructionVal: "GOTO",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 4,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 2,
              startCol: 6,
              endCol: 7,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 2,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "Label",
          labelName: "loop",
          srcLoc: {
            line: 3,
            startCol: 0,
            endCol: 4,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "y",
            srcLoc: {
              line: 4,
              startCol: 4,
              endCol: 5,
            },
          },
          instruction: "add",
          instructionVal: "ADD",
          srcLoc: {
            line: 4,
            startCol: 0,
            endCol: 3,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "y",
            srcLoc: {
              line: 5,
              startCol: 6,
              endCol: 7,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 5,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "NullaryInstruction",
          instruction: "read",
          instructionVal: "READ",
          srcLoc: {
            line: 6,
            startCol: 0,
            endCol: 4,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "start",
            srcLoc: {
              line: 7,
              startCol: 6,
              endCol: 11,
            },
          },
          instruction: "gotoz",
          instructionVal: "GOTOZ",
          srcLoc: {
            line: 7,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 8,
              startCol: 5,
              endCol: 6,
            },
          },
          instruction: "load",
          instructionVal: "LOAD",
          srcLoc: {
            endCol: 4,
            line: 8,
            startCol: 0,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "y",
            srcLoc: {
              line: 9,
              startCol: 5,
              endCol: 6,
            },
          },
          instruction: "load",
          instructionVal: "LOAD",
          srcLoc: {
            line: 9,
            startCol: 0,
            endCol: 4,
          },
        },
        {
          kind: "NullaryInstruction",
          instruction: "stop",
          instructionVal: "STOP",
          srcLoc: {
            line: 10,
            startCol: 0,
            endCol: 4,
          },
        },
      ],
    });
  });

  test("label at end of program", () => {
    expect(
      compileVicProgram(
        [
          "start:", // 0
          "read", // 1
          "goto end", // 2
          "write", // 3
          "end:", // 4
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [800, 503, 900],
      },
      statements: [
        {
          kind: "Label",
          labelName: "start",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "NullaryInstruction",
          instruction: "read",
          instructionVal: "READ",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 4,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "end",
            srcLoc: {
              line: 2,
              startCol: 5,
              endCol: 8,
            },
          },
          instruction: "goto",
          instructionVal: "GOTO",
          srcLoc: {
            line: 2,
            startCol: 0,
            endCol: 4,
          },
        },
        {
          kind: "NullaryInstruction",
          instruction: "write",
          instructionVal: "WRITE",
          srcLoc: {
            line: 3,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "Label",
          labelName: "end",
          srcLoc: {
            line: 4,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
    });
  });

  test("multiple stores to same variable", () => {
    expect(
      compileVicProgram(
        [
          "store x", // 1
          "store y", // 2
          "store x", // 3
          "store z", // 4
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [490, 491, 490, 492],
      },
      statements: [
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 0,
              startCol: 6,
              endCol: 7,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "y",
            srcLoc: {
              line: 1,
              startCol: 6,
              endCol: 7,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 2,
              startCol: 6,
              endCol: 7,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 2,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "z",
            srcLoc: {
              line: 3,
              startCol: 6,
              endCol: 7,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 3,
            startCol: 0,
            endCol: 5,
          },
        },
      ],
    });
  });

  test("variables and labels with same name", () => {
    expect(
      compileVicProgram(
        [
          "bar:", // 0
          "read", // 1
          "add foo", // 2
          "store bar", // 3
          "foo:", // 4
          "write", // 5
          "store foo", // 6
          "load bar", // 7
          "goto foo", // 8
          "goto bar", // 9
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [800, 191, 490, 900, 491, 390, 503, 500],
      },
      statements: [
        {
          kind: "Label",
          labelName: "bar",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 3,
          },
        },
        {
          kind: "NullaryInstruction",
          instruction: "read",
          instructionVal: "READ",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 4,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "foo",
            srcLoc: {
              line: 2,
              startCol: 4,
              endCol: 7,
            },
          },
          instruction: "add",
          instructionVal: "ADD",
          srcLoc: {
            line: 2,
            startCol: 0,
            endCol: 3,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "bar",
            srcLoc: {
              line: 3,
              startCol: 6,
              endCol: 9,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 3,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "Label",
          labelName: "foo",
          srcLoc: {
            line: 4,
            startCol: 0,
            endCol: 3,
          },
        },
        {
          instruction: "write",
          instructionVal: "WRITE",
          kind: "NullaryInstruction",
          srcLoc: {
            line: 5,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "foo",
            srcLoc: {
              line: 6,
              startCol: 6,
              endCol: 9,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 6,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "bar",
            srcLoc: {
              line: 7,
              startCol: 5,
              endCol: 8,
            },
          },
          instruction: "load",
          instructionVal: "LOAD",
          srcLoc: {
            endCol: 4,
            line: 7,
            startCol: 0,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "foo",
            srcLoc: {
              line: 8,
              startCol: 5,
              endCol: 8,
            },
          },
          instruction: "goto",
          instructionVal: "GOTO",
          srcLoc: {
            line: 8,
            startCol: 0,
            endCol: 4,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "bar",
            srcLoc: {
              line: 9,
              startCol: 5,
              endCol: 8,
            },
          },
          instruction: "goto",
          instructionVal: "GOTO",
          srcLoc: {
            line: 9,
            startCol: 0,
            endCol: 4,
          },
        },
      ],
    });
  });

  test("case insensitive labels", () => {
    expect(
      compileVicProgram(
        [
          "read", // 0
          "start:", // 1
          "goto sTart", // 2
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [800, 501],
      },
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
          kind: "Label",
          labelName: "start",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "sTart",
            srcLoc: {
              line: 2,
              startCol: 5,
              endCol: 10,
            },
          },
          instruction: "goto",
          instructionVal: "GOTO",
          srcLoc: {
            line: 2,
            startCol: 0,
            endCol: 4,
          },
        },
      ],
    });
  });

  test("case insensitive variables", () => {
    expect(
      compileVicProgram(
        [
          "store blah", // 0
          "load bLah", // 1
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Ok",
        value: [490, 390],
      },
      statements: [
        {
          kind: "UnaryInstruction",
          arg: {
            name: "blah",
            srcLoc: {
              line: 0,
              startCol: 6,
              endCol: 10,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "bLah",
            srcLoc: {
              line: 1,
              startCol: 5,
              endCol: 9,
            },
          },
          instruction: "load",
          instructionVal: "LOAD",
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

describe("compileVicProgram errors", () => {
  test("invalid instruction", () => {
    expect(compileVicProgram("blah")).toEqual<VicCompileResult>({
      program: {
        kind: "Error",
        error: [
          {
            message: 'Unknown instruction "BLAH"',
            srcLoc: {
              endCol: 4,
              line: 0,
              startCol: 0,
            },
          },
        ],
      },
      statements: [],
    });
  });

  test("partial statements when errors", () => {
    expect(
      compileVicProgram(
        [
          "read", // 0
          "blah", // 1
          "write", // 2
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Error",
        error: [
          {
            message: 'Unknown instruction "BLAH"',
            srcLoc: {
              endCol: 4,
              line: 1,
              startCol: 0,
            },
          },
        ],
      },
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
    });
  });

  test("duplicate label", () => {
    expect(
      compileVicProgram(
        [
          "foo:", // 0
          "read", // 1
          "bar:", // 2
          "write", // 3
          "foo:", // 4
          "stop", // 5
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Error",
        error: [
          {
            message: 'Duplicate label "foo"',
            srcLoc: {
              endCol: 3,
              line: 4,
              startCol: 0,
            },
          },
        ],
      },
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
          kind: "NullaryInstruction",
          instruction: "read",
          instructionVal: "READ",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 4,
          },
        },
        {
          kind: "Label",
          labelName: "bar",
          srcLoc: {
            line: 2,
            startCol: 0,
            endCol: 3,
          },
        },
        {
          kind: "NullaryInstruction",
          instruction: "write",
          instructionVal: "WRITE",
          srcLoc: {
            line: 3,
            startCol: 0,
            endCol: 5,
          },
        },
        {
          kind: "Label",
          labelName: "foo",
          srcLoc: {
            line: 4,
            startCol: 0,
            endCol: 3,
          },
        },
        {
          kind: "NullaryInstruction",
          instruction: "stop",
          instructionVal: "STOP",
          srcLoc: {
            line: 5,
            startCol: 0,
            endCol: 4,
          },
        },
      ],
    });
  });

  test("no such label", () => {
    expect(
      compileVicProgram(
        [
          "foo:", // 0
          "goto bar", // 1
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Error",
        error: [
          {
            message: 'No such label "bar"',
            srcLoc: {
              line: 1,
              startCol: 5,
              endCol: 8,
            },
          },
        ],
      },
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
          kind: "UnaryInstruction",
          arg: {
            name: "bar",
            srcLoc: {
              line: 1,
              startCol: 5,
              endCol: 8,
            },
          },
          instruction: "goto",
          instructionVal: "GOTO",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 4,
          },
        },
      ],
    });
  });

  test("no such variable", () => {
    expect(
      compileVicProgram(
        [
          "add x", // 0
          "add y", // 1
          "store x", // 2
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Error",
        error: [
          {
            message: 'No such variable "y"',
            srcLoc: {
              line: 1,
              startCol: 4,
              endCol: 5,
            },
          },
        ],
      },
      statements: [
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 0,
              startCol: 4,
              endCol: 5,
            },
          },
          instruction: "add",
          instructionVal: "ADD",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 3,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "y",
            srcLoc: {
              line: 1,
              startCol: 4,
              endCol: 5,
            },
          },
          instruction: "add",
          instructionVal: "ADD",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 3,
          },
        },
        {
          kind: "UnaryInstruction",
          arg: {
            name: "x",
            srcLoc: {
              line: 2,
              startCol: 6,
              endCol: 7,
            },
          },
          instruction: "store",
          instructionVal: "STORE",
          srcLoc: {
            line: 2,
            startCol: 0,
            endCol: 5,
          },
        },
      ],
    });
  });

  test("missing variable argument", () => {
    expect(
      compileVicProgram(
        [
          "add", // 0
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Error",
        error: [
          {
            message: "Expected variable argument to ADD instruction",
            srcLoc: {
              line: 0,
              startCol: 0,
              endCol: 3,
            },
          },
        ],
      },
      statements: [
        {
          kind: "UnaryInstruction",
          arg: null,
          instruction: "add",
          instructionVal: "ADD",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
    });
  });

  test("missing label argument", () => {
    expect(
      compileVicProgram(
        [
          "goto", // 0
        ].join("\n"),
      ),
    ).toEqual<VicCompileResult>({
      program: {
        kind: "Error",
        error: [
          {
            message: "Expected label argument to GOTO instruction",
            srcLoc: {
              line: 0,
              startCol: 0,
              endCol: 4,
            },
          },
        ],
      },
      statements: [
        {
          kind: "UnaryInstruction",
          arg: null,
          instruction: "goto",
          instructionVal: "GOTO",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 4,
          },
        },
      ],
    });
  });
});

describe("compileVicProgram max variables", () => {
  test("too many variables 1", () => {
    expect(
      compileVicProgram(
        [
          "write", //
          "write", //
          "write", //
          "write", //
          "write", //
          "store v01", //
          "store v02", //
          "store v03", //
          "store v04", //
          "store v05", //
          "store v06", //
          "store v07", //
          "store v08", //
          "store v09", //
          "store v10", //
          "store v11", //
          "store v12", //
          "store v13", //
          "store v14", //
          "store v15", //
          "store v16", //
          "store v17", //
          "store v18", //
          "store v19", //
          "store v20", //
          "store v21", //
          "store v22", //
          "store v23", //
          "store v24", //
          "store v25", //
          "store v26", //
          "store v27", //
          "store v28", //
          "store v29", //
          "store v30", //
          "store v31", //
          "store v32", //
          "store v33", //
          "store v34", //
          "store v35", //
          "store v36", //
          "store v37", //
          "store v38", //
          "store v39", //
          "store v40", //
          "store v41", //
          "store v42", //
          "store v43", //
          "store v44", //
          "store v45", //
          "store v46", //
          "write", //
          "write", //
          "write", //
        ].join("\n"),
      ).program,
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Error",
      error: [
        {
          message: "Too many variables",
          srcLoc: {
            endCol: 9,
            line: 49,
            startCol: 6,
          },
        },
      ],
    });
  });
  test("too many variables 2", () => {
    expect(
      compileVicProgram(
        [
          "write", //
          "write", //
          "write", //
          "write", //
          "write", //
          "store v01", //
          "store v02", //
          "store v03", //
          "store v04", //
          "store v05", //
          "store v06", //
          "store v07", //
          "store v08", //
          "store v09", //
          "store v10", //
          "store v11", //
          "store v12", //
          "store v13", //
          "store v14", //
          "store v15", //
          "store v16", //
          "store v17", //
          "store v18", //
          "store v19", //
          "store v20", //
          "store v21", //
          "store v22", //
          "store v23", //
          "store v24", //
          "store v25", //
          "store v26", //
          "store v27", //
          "store v28", //
          "store v29", //
          "store v30", //
          "store v31", //
          "store v32", //
          "store v33", //
          "store v34", //
          "store v35", //
          "store v36", //
          "store v37", //
          "store v38", //
          "store v39", //
          "store v40", //
          "store v41", //
          "store v42", //
          "store v43", //
          "store v44", //
          "store v45", //
          "store v46", //
          "write", //
          "write", //
        ].join("\n"),
      ).program,
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Error",
      error: [
        {
          message: "Too many variables",
          srcLoc: {
            endCol: 9,
            line: 50,
            startCol: 6,
          },
        },
      ],
    });
  });

  test("max variables", () => {
    expect(
      compileVicProgram(
        [
          "write", //
          "write", //
          "write", //
          "write", //
          "write", //
          "store v01", //
          "store v02", //
          "store v03", //
          "store v04", //
          "store v05", //
          "store v06", //
          "store v07", //
          "store v08", //
          "store v09", //
          "store v10", //
          "store v11", //
          "store v12", //
          "store v13", //
          "store v14", //
          "store v15", //
          "store v16", //
          "store v17", //
          "store v18", //
          "store v19", //
          "store v20", //
          "store v21", //
          "store v22", //
          "store v23", //
          "store v24", //
          "store v25", //
          "store v26", //
          "store v27", //
          "store v28", //
          "store v29", //
          "store v30", //
          "store v31", //
          "store v32", //
          "store v33", //
          "store v34", //
          "store v35", //
          "store v36", //
          "store v37", //
          "store v38", //
          "store v39", //
          "store v40", //
          "store v41", //
          "store v42", //
          "store v43", //
          "store v44", //
          "store v45", //
          "store v46", //
          "write", //
        ].join("\n"),
      ).program,
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Ok",
      value: [
        900, 900, 900, 900, 900, 490, 491, 492, 493, 494, 495, 496, 497, 489,
        488, 487, 486, 485, 484, 483, 482, 481, 480, 479, 478, 477, 476, 475,
        474, 473, 472, 471, 470, 469, 468, 467, 466, 465, 464, 463, 462, 461,
        460, 459, 458, 457, 456, 455, 454, 453, 452, 900,
      ],
    });
  });
});

describe("compileVicProgram max instructions", () => {
  test("too many instructions 1", () => {
    expect(
      compileVicProgram(
        [
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
        ].join("\n"),
      ).program,
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Error",
      error: [
        {
          message: "Too many instructions",
          srcLoc: {
            endCol: 9,
            line: 90,
            startCol: 0,
          },
        },
      ],
    });
  });

  test("too many instructions 2", () => {
    expect(
      compileVicProgram(
        [
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
          "read", //
        ].join("\n"),
      ).program,
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Error",
      error: [
        {
          message: "Too many instructions",
          srcLoc: {
            endCol: 4,
            line: 90,
            startCol: 0,
          },
        },
      ],
    });
  });

  test("too many instructions 3", () => {
    expect(
      compileVicProgram(
        [
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load", //
        ].join("\n"),
      ).program,
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Error",
      error: [
        {
          message: "Expected variable argument to LOAD instruction",
          srcLoc: {
            line: 90,
            startCol: 0,
            endCol: 4,
          },
        },
        {
          message: "Too many instructions",
          srcLoc: {
            endCol: 4,
            line: 90,
            startCol: 0,
          },
        },
      ],
    });
  });

  test("max instructions", () => {
    expect(
      compileVicProgram(
        [
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
          "load zero", //
        ].join("\n"),
      ).program,
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Ok",
      value: [
        398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398,
        398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398,
        398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398,
        398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398,
        398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398,
        398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398, 398,
        398, 398, 398, 398, 398, 398,
      ],
    });
  });
});

/**
 * Helper function used in "prettyVicBinaryWithSource" test.
 */
function compilePretty(source: string): string {
  const compileResult = compileVicProgram(source);
  switch (compileResult.program.kind) {
    case "Error":
      throw new Error(
        `Unexpected errors: ${JSON.stringify(compileResult.program.error)}`,
      );
    case "Ok":
      return prettyVicCompileResult(
        compileResult.program.value,
        compileResult.statements,
      );
    default:
      return assertNever(compileResult.program);
  }
}

describe("prettyVicBinaryWithSource", () => {
  test("empty", () => {
    expect(compilePretty("")).toEqual<string>("");
  });

  test("read instruction", () => {
    expect(
      compilePretty(
        [
          "read", // 0
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "800", // 0
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("add instruction", () => {
    expect(
      compilePretty(
        [
          "store x", // 0
          "add x", // 1
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "490", // 0
        "190", // 1
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("goto instruction", () => {
    expect(
      compilePretty(
        [
          "foo:", // 0
          "goto foo", // 1
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "", // 0
        "500", // 1
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("minimal program", () => {
    expect(
      compilePretty(
        [
          "start:", // 0
          "goto loop", // 1
          "store x", // 2
          "loop:", // 3
          "add y", // 4
          "store y", //  5
          "read", // 6
          "gotoz start", // 7
          "load x", // 8
          "load y", // 9
          "stop", // 10
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "", // 0
        "502", // 1
        "490", // 2
        "", // 3
        "191", // 4
        "491", // 5
        "800", // 6
        "600", // 7
        "390", // 8
        "391", // 9
        "0", // 10
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("label at end of program", () => {
    expect(
      compilePretty(
        [
          "start:", // 0
          "read", // 1
          "goto end", // 2
          "write", // 3
          "end:", // 4
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "", // 0
        "800", // 1
        "503", // 2
        "900", // 3
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("blank line at beginning", () => {
    expect(
      compilePretty(
        [
          "", // 0
          "read", // 1
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "", // 0
        "800", // 1
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("two blank lines at beginning", () => {
    expect(
      compilePretty(
        [
          "", // 0
          "", // 1
          "read", // 2
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "", // 0
        "", // 1
        "800", // 2
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("blank line at end", () => {
    expect(
      compilePretty(
        [
          "read", // 0
          "", // 1
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "800", // 0
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("two blank lines at end", () => {
    expect(
      compilePretty(
        [
          "read", // 0
          "", // 1
          "", // 2
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "800", // 0
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("blank line in middle", () => {
    expect(
      compilePretty(
        [
          "store x", // 0
          "", // 1
          "add x", // 2
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "490", // 0
        "", // 1
        "190", // 2
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("two blank lines in middle", () => {
    expect(
      compilePretty(
        [
          "store x", // 0
          "", // 1
          "", // 2
          "add x", // 3
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "490", // 0
        "", // 1
        "", // 2
        "190", // 3
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("comment line at beginning", () => {
    expect(
      compilePretty(
        [
          "// comment", // 0
          "store x", // 1
          "add x", // 2
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "", // 0
        "490", // 1
        "190", // 2
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("comment line at end", () => {
    expect(
      compilePretty(
        [
          "store x", // 0
          "add x", // 1
          "// comment", // 2
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "490", // 0
        "190", // 1
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });

  test("comment line in middle", () => {
    expect(
      compilePretty(
        [
          "store x", // 0
          "// comment", // 1
          "add x", // 2
        ].join("\n"),
      ),
    ).toEqual<string>(
      [
        "490", // 0
        "", // 1
        "190", // 2
      ]
        .map((l) => `${l}\n`)
        .join(""),
    );
  });
});
