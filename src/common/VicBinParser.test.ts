import { parseVicBin, parseVicBinLine } from "./VicBinParser";
import type { Result } from "./Functional/Result";
import type { SrcError } from "./SrcError";

describe("parseVicBinLine success", () => {
  test("empty string", () => {
    expect(parseVicBinLine("", 0)).toEqual<Result<SrcError, number | null>>({
      kind: "Ok",
      value: null,
    });
  });

  test("valid value 100", () => {
    expect(parseVicBinLine("100", 0)).toEqual<Result<SrcError, number | null>>({
      kind: "Ok",
      value: 100,
    });
  });

  test("valid value -100", () => {
    expect(parseVicBinLine("-100", 0)).toEqual<Result<SrcError, number | null>>(
      {
        kind: "Ok",
        value: -100,
      },
    );
  });

  test("valid value with whitespace before 100", () => {
    expect(parseVicBinLine(" 100", 0)).toEqual<Result<SrcError, number | null>>(
      {
        kind: "Ok",
        value: 100,
      },
    );
  });

  test("valid value with whitespace after 100", () => {
    expect(parseVicBinLine("100 ", 0)).toEqual<Result<SrcError, number | null>>(
      {
        kind: "Ok",
        value: 100,
      },
    );
  });

  test("valid zero value", () => {
    expect(parseVicBinLine("0", 0)).toEqual<Result<SrcError, number | null>>({
      kind: "Ok",
      value: 0,
    });
  });

  test("valid max value", () => {
    expect(parseVicBinLine("999", 0)).toEqual<Result<SrcError, number | null>>({
      kind: "Ok",
      value: 999,
    });
  });

  test("valid min value", () => {
    expect(parseVicBinLine("-999", 0)).toEqual<Result<SrcError, number | null>>(
      {
        kind: "Ok",
        value: -999,
      },
    );
  });
});

describe("parseVicBinLine errors", () => {
  test("invalid char", () => {
    expect(parseVicBinLine("a", 0)).toEqual<Result<SrcError, number | null>>({
      kind: "Error",
      error: {
        message: 'Invalid Value: "a"',
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 1,
        },
      },
    });
  });

  test("invalid char after whitespace", () => {
    expect(parseVicBinLine(" a", 0)).toEqual<Result<SrcError, number | null>>({
      kind: "Error",
      error: {
        message: 'Invalid Value: "a"',
        srcLoc: {
          line: 0,
          startCol: 1,
          endCol: 2,
        },
      },
    });
  });

  test("invalid word", () => {
    expect(parseVicBinLine("a1", 0)).toEqual<Result<SrcError, number | null>>({
      kind: "Error",
      error: {
        message: 'Invalid Value: "a1"',
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 2,
        },
      },
    });
  });

  test("invalid char followed by number", () => {
    expect(parseVicBinLine("a 1", 0)).toEqual<Result<SrcError, number | null>>({
      kind: "Error",
      error: {
        message: 'Invalid Value: "a"',
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 1,
        },
      },
    });
  });

  test("invalid word followed by number", () => {
    expect(parseVicBinLine("a1 1", 0)).toEqual<Result<SrcError, number | null>>(
      {
        kind: "Error",
        error: {
          message: 'Invalid Value: "a1"',
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 2,
          },
        },
      },
    );
  });

  test("invalid word followed by word", () => {
    expect(parseVicBinLine("aa bb", 0)).toEqual<
      Result<SrcError, number | null>
    >({
      kind: "Error",
      error: {
        message: 'Invalid Value: "aa"',
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 2,
        },
      },
    });
  });

  test("invalid number followed by number", () => {
    expect(parseVicBinLine("100 200", 0)).toEqual<
      Result<SrcError, number | null>
    >({
      kind: "Error",
      error: {
        message: 'Unexpected value: "200"',
        srcLoc: {
          line: 0,
          startCol: 4,
          endCol: 7,
        },
      },
    });
  });

  test("Value too large", () => {
    expect(parseVicBinLine("1000", 0)).toEqual<Result<SrcError, number | null>>(
      {
        kind: "Error",
        error: {
          message: "Value out of range: 1000",
          srcLoc: {
            line: 0,
            startCol: 0,
            endCol: 4,
          },
        },
      },
    );
  });

  test("Value too small", () => {
    expect(parseVicBinLine("-1000", 0)).toEqual<
      Result<SrcError, number | null>
    >({
      kind: "Error",
      error: {
        message: "Value out of range: -1000",
        srcLoc: {
          line: 0,
          startCol: 0,
          endCol: 5,
        },
      },
    });
  });
});

describe("parseVicBin success", () => {
  test("empty string", () => {
    expect(parseVicBin("")).toEqual<Result<SrcError[], number[]>>({
      kind: "Ok",
      value: [],
    });
  });

  test("read instruction", () => {
    expect(
      parseVicBin(
        [
          "800", // 0
        ].join("\n"),
      ),
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Ok",
      value: [800],
    });
  });

  test("Just whitespace", () => {
    expect(parseVicBin(" ")).toEqual<Result<SrcError[], number[]>>({
      kind: "Ok",
      value: [],
    });
  });

  test("Just whitespace multiple lines", () => {
    expect(parseVicBin(" \n\n  \n")).toEqual<Result<SrcError[], number[]>>({
      kind: "Ok",
      value: [],
    });
  });

  test("blank lines", () => {
    expect(
      parseVicBin(
        [
          "800", // 0
          "", // 1
          "900", // 2
        ].join("\n"),
      ),
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Ok",
      value: [800, 900],
    });
  });

  test("first line blank", () => {
    expect(
      parseVicBin(
        [
          "", // 0
          "800", // 1
        ].join("\n"),
      ),
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Ok",
      value: [800],
    });
  });

  test("negative values", () => {
    expect(
      parseVicBin(
        [
          "301", // 0
          "-5", // 1
        ].join("\n"),
      ),
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Ok",
      value: [301, -5],
    });
  });
});

describe("parseVicBin errors", () => {
  test("invalid value", () => {
    expect(parseVicBin("blah")).toEqual<Result<SrcError[], number[]>>({
      kind: "Error",
      error: [
        {
          message: 'Invalid Value: "blah"',
          srcLoc: {
            endCol: 4,
            line: 0,
            startCol: 0,
          },
        },
      ],
    });
  });

  test("value out of range", () => {
    expect(
      parseVicBin(
        [
          "301", // 0
          "1000", // 1
        ].join("\n"),
      ),
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Error",
      error: [
        {
          message: "Value out of range: 1000",
          srcLoc: {
            endCol: 4,
            line: 1,
            startCol: 0,
          },
        },
      ],
    });
  });

  test("negative value out of range", () => {
    expect(
      parseVicBin(
        [
          "301", // 0
          "-1000", // 1
        ].join("\n"),
      ),
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Error",
      error: [
        {
          message: "Value out of range: -1000",
          srcLoc: {
            line: 1,
            startCol: 0,
            endCol: 5,
          },
        },
      ],
    });
  });
});

describe("parseVicBin max length", () => {
  test("program too long", () => {
    expect(
      parseVicBin(
        [
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
        ].join("\n"),
      ),
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Error",
      error: [
        {
          message: "Program too long to fit into memory",
          srcLoc: {
            line: 98,
            startCol: 0,
            endCol: 3,
          },
        },
      ],
    });
  });

  test("max program length", () => {
    expect(
      parseVicBin(
        [
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
          "100", //
        ].join("\n"),
      ),
    ).toEqual<Result<SrcError[], number[]>>({
      kind: "Ok",
      value: [
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
      ],
    });
  });
});
