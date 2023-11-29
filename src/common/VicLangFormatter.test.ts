import { type FormattingOptions, formatVicLine } from "./VicLangFormatter";

const defaultOptions: FormattingOptions = {
  tabSize: 4,
  insertSpaces: true,
};

describe("formatVicLine defaultOptions", () => {
  test("blank line", () => {
    expect(formatVicLine("", defaultOptions)).toEqual<string>("");
  });

  test("single space", () => {
    expect(formatVicLine(" ", defaultOptions)).toEqual<string>("");
  });

  test("only whitespace", () => {
    expect(formatVicLine(" \t  ", defaultOptions)).toEqual<string>("");
  });

  test("label", () => {
    expect(formatVicLine("start:", defaultOptions)).toEqual<string>("start:");
  });

  test("strip prefix label", () => {
    expect(formatVicLine("    start:", defaultOptions)).toEqual<string>(
      "start:",
    );
  });

  test("strip suffix label", () => {
    expect(formatVicLine("start: ", defaultOptions)).toEqual<string>("start:");
  });

  test("strip prefix and suffix label", () => {
    expect(formatVicLine("  start:  ", defaultOptions)).toEqual<string>(
      "start:",
    );
  });

  test("label with comment", () => {
    expect(formatVicLine("start: // comment", defaultOptions)).toEqual<string>(
      "start: // comment",
    );
  });

  test("label with comment format", () => {
    expect(
      formatVicLine(" start:   // comment", defaultOptions),
    ).toEqual<string>("start: // comment");
  });

  test("instruction stop", () => {
    expect(formatVicLine("stop", defaultOptions)).toEqual<string>("    stop");
  });

  test("instruction stop formatted", () => {
    expect(formatVicLine("    stop", defaultOptions)).toEqual<string>(
      "    stop",
    );
  });

  test("instruction add", () => {
    expect(formatVicLine("add zero", defaultOptions)).toEqual<string>(
      "    add zero",
    );
  });

  test("instruction add with inner whitespace", () => {
    expect(formatVicLine("    add  zero", defaultOptions)).toEqual<string>(
      "    add zero",
    );
  });

  test("instruction add with comment", () => {
    expect(
      formatVicLine("    add zero // comment", defaultOptions),
    ).toEqual<string>("    add zero // comment");
  });

  test("instruction add with comment fix whitespace", () => {
    expect(
      formatVicLine("    add zero  // comment", defaultOptions),
    ).toEqual<string>("    add zero // comment");
  });

  test("only comment", () => {
    expect(formatVicLine("// comment", defaultOptions)).toEqual<string>(
      "// comment",
    );
  });

  test("only comment format", () => {
    expect(formatVicLine(" // comment", defaultOptions)).toEqual<string>(
      "// comment",
    );
  });

  test("strip comment trailing whitespace", () => {
    expect(formatVicLine("// comment ", defaultOptions)).toEqual<string>(
      "// comment",
    );
  });

  test("preserve comment start whitespace", () => {
    expect(formatVicLine("//comment", defaultOptions)).toEqual<string>(
      "//comment",
    );
  });
});

describe("formatVicLine custom options", () => {
  test("two spaces", () => {
    expect(
      formatVicLine("add zero", {
        insertSpaces: true,
        tabSize: 2,
      }),
    ).toEqual<string>("  add zero");
  });

  test("tabs", () => {
    expect(
      formatVicLine("add zero", {
        insertSpaces: false,
        tabSize: 4,
      }),
    ).toEqual<string>("\tadd zero");
  });
});
