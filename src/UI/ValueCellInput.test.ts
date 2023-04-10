import { sanitizeValue } from "./ValueCellInput";

describe("sanitizeValue", () => {
  test("sanitizeValue('')", () => {
    expect(sanitizeValue("")).toEqual<string>("");
  });
  test("sanitizeValue('-')", () => {
    expect(sanitizeValue("-")).toEqual<string>("-");
  });
  test("sanitizeValue('--')", () => {
    expect(sanitizeValue("--")).toEqual<string>("-");
  });
  test("sanitizeValue('1a')", () => {
    expect(sanitizeValue("1a")).toEqual<string>("1");
  });
  test("sanitizeValue('a1')", () => {
    expect(sanitizeValue("a1")).toEqual<string>("1");
  });
  test("sanitizeValue('a123')", () => {
    expect(sanitizeValue("a123")).toEqual<string>("123");
  });
  test("sanitizeValue('a1234')", () => {
    expect(sanitizeValue("a1234")).toEqual<string>("123");
  });
  test("sanitizeValue('1a2')", () => {
    expect(sanitizeValue("1a2")).toEqual<string>("12");
  });
  test("sanitizeValue('1abc2')", () => {
    expect(sanitizeValue("1abc2")).toEqual<string>("12");
  });

  test("sanitizeValue('0')", () => {
    expect(sanitizeValue("0")).toEqual<string>("0");
  });
  test("sanitizeValue('00')", () => {
    expect(sanitizeValue("00")).toEqual<string>("00");
  });
  test("sanitizeValue('000')", () => {
    expect(sanitizeValue("000")).toEqual<string>("000");
  });
  test("sanitizeValue('1')", () => {
    expect(sanitizeValue("1")).toEqual<string>("1");
  });
  test("sanitizeValue('01')", () => {
    expect(sanitizeValue("01")).toEqual<string>("01");
  });
  test("sanitizeValue('001')", () => {
    expect(sanitizeValue("001")).toEqual<string>("001");
  });
  test("sanitizeValue('0001')", () => {
    expect(sanitizeValue("0001")).toEqual<string>("000");
  });
  test("sanitizeValue('100')", () => {
    expect(sanitizeValue("100")).toEqual<string>("100");
  });
  test("sanitizeValue('999')", () => {
    expect(sanitizeValue("999")).toEqual<string>("999");
  });
  test("sanitizeValue('9999')", () => {
    expect(sanitizeValue("9999")).toEqual<string>("999");
  });
  test("sanitizeValue('1000')", () => {
    expect(sanitizeValue("1000")).toEqual<string>("100");
  });

  test("sanitizeValue('-0')", () => {
    expect(sanitizeValue("-0")).toEqual<string>("-0");
  });
  test("sanitizeValue('-00')", () => {
    expect(sanitizeValue("-00")).toEqual<string>("-00");
  });
  test("sanitizeValue('-000')", () => {
    expect(sanitizeValue("-000")).toEqual<string>("-000");
  });
  test("sanitizeValue('-1')", () => {
    expect(sanitizeValue("-1")).toEqual<string>("-1");
  });
  test("sanitizeValue('-01')", () => {
    expect(sanitizeValue("-01")).toEqual<string>("-01");
  });
  test("sanitizeValue('-001')", () => {
    expect(sanitizeValue("-001")).toEqual<string>("-001");
  });
  test("sanitizeValue('-0001')", () => {
    expect(sanitizeValue("-0001")).toEqual<string>("-000");
  });
  test("sanitizeValue('-100')", () => {
    expect(sanitizeValue("-100")).toEqual<string>("-100");
  });
  test("sanitizeValue('-999')", () => {
    expect(sanitizeValue("-999")).toEqual<string>("-999");
  });
  test("sanitizeValue('-9999')", () => {
    expect(sanitizeValue("-9999")).toEqual<string>("-999");
  });
  test("sanitizeValue('-1000')", () => {
    expect(sanitizeValue("-1000")).toEqual<string>("-100");
  });
});
