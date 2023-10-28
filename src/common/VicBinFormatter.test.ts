import { formatVicBinLine } from "./VicBinFormatter";

describe("formatVicBinLine", () => {
  test("blank line", () => {
    expect(formatVicBinLine("")).toEqual<string>("");
  });

  test("single space", () => {
    expect(formatVicBinLine(" ")).toEqual<string>("");
  });

  test("only whitespace", () => {
    expect(formatVicBinLine(" \t  ")).toEqual<string>("");
  });

  test("value", () => {
    expect(formatVicBinLine("100")).toEqual<string>("100");
  });

  test("strip prefix value", () => {
    expect(formatVicBinLine(" 100")).toEqual<string>("100");
  });

  test("strip suffix value", () => {
    expect(formatVicBinLine("100  ")).toEqual<string>("100");
  });

  test("strip prefix and suffix value", () => {
    expect(formatVicBinLine("  100  ")).toEqual<string>("100");
  });
});
