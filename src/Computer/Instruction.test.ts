import {
  assembleInstruction,
  parseInstruction,
  type Instruction,
} from "./Instruction";

describe("Instruction parsing", () => {
  test("ADD 100", () => {
    expect(parseInstruction(100)).toEqual<Instruction>({
      kind: "ADD",
      address: 0,
    });
  });

  test("ADD 101", () => {
    expect(parseInstruction(101)).toEqual<Instruction>({
      kind: "ADD",
      address: 1,
    });
  });

  test("ADD 199", () => {
    expect(parseInstruction(199)).toEqual<Instruction>({
      kind: "ADD",
      address: 99,
    });
  });

  test("SUB 200", () => {
    expect(parseInstruction(200)).toEqual<Instruction>({
      kind: "SUB",
      address: 0,
    });
  });

  test("SUB 201", () => {
    expect(parseInstruction(201)).toEqual<Instruction>({
      kind: "SUB",
      address: 1,
    });
  });

  test("SUB 299", () => {
    expect(parseInstruction(299)).toEqual<Instruction>({
      kind: "SUB",
      address: 99,
    });
  });

  test("LOAD 300", () => {
    expect(parseInstruction(300)).toEqual<Instruction>({
      kind: "LOAD",
      address: 0,
    });
  });

  test("LOAD 301", () => {
    expect(parseInstruction(301)).toEqual<Instruction>({
      kind: "LOAD",
      address: 1,
    });
  });

  test("LOAD 399", () => {
    expect(parseInstruction(399)).toEqual<Instruction>({
      kind: "LOAD",
      address: 99,
    });
  });

  test("STORE 400", () => {
    expect(parseInstruction(400)).toEqual<Instruction>({
      kind: "STORE",
      address: 0,
    });
  });

  test("STORE 401", () => {
    expect(parseInstruction(401)).toEqual<Instruction>({
      kind: "STORE",
      address: 1,
    });
  });

  test("STORE 499", () => {
    expect(parseInstruction(499)).toEqual<Instruction>({
      kind: "STORE",
      address: 99,
    });
  });

  test("GOTO 500", () => {
    expect(parseInstruction(500)).toEqual<Instruction>({
      kind: "GOTO",
      address: 0,
    });
  });

  test("GOTO 501", () => {
    expect(parseInstruction(501)).toEqual<Instruction>({
      kind: "GOTO",
      address: 1,
    });
  });

  test("GOTO 599", () => {
    expect(parseInstruction(599)).toEqual<Instruction>({
      kind: "GOTO",
      address: 99,
    });
  });

  test("GOTOZ 600", () => {
    expect(parseInstruction(600)).toEqual<Instruction>({
      kind: "GOTOZ",
      address: 0,
    });
  });

  test("GOTOZ 601", () => {
    expect(parseInstruction(601)).toEqual<Instruction>({
      kind: "GOTOZ",
      address: 1,
    });
  });

  test("GOTOZ 699", () => {
    expect(parseInstruction(699)).toEqual<Instruction>({
      kind: "GOTOZ",
      address: 99,
    });
  });

  test("GOTOP 700", () => {
    expect(parseInstruction(700)).toEqual<Instruction>({
      kind: "GOTOP",
      address: 0,
    });
  });

  test("GOTOP 701", () => {
    expect(parseInstruction(701)).toEqual<Instruction>({
      kind: "GOTOP",
      address: 1,
    });
  });

  test("GOTOP 799", () => {
    expect(parseInstruction(799)).toEqual<Instruction>({
      kind: "GOTOP",
      address: 99,
    });
  });

  test("READ", () => {
    expect(parseInstruction(800)).toEqual<Instruction>({
      kind: "READ",
    });
  });

  test("WRITE", () => {
    expect(parseInstruction(900)).toEqual<Instruction>({
      kind: "WRITE",
    });
  });

  test("STOP", () => {
    expect(parseInstruction(0)).toEqual<Instruction>({
      kind: "STOP",
    });
  });

  describe("Roundtrip tests", () => {
    for (let i = 0; i <= 999; i++) {
      test(`Roundtrip Instruction ${i}`, () => {
        const instr = parseInstruction(i);

        if (instr === null) {
          return;
        }

        const code = assembleInstruction(instr);
        expect(parseInstruction(code)).toEqual<Instruction>(instr);
      });
    }
  });
});
