import { firstVariableSlot, nextVariableSlot } from "./VicLangAssembler";

describe("firstVariableSlot", () => {
  test("firstVariableSlot", () => {
    expect(firstVariableSlot()).toEqual<number>(90);
  });
});

describe("nextVariableSlot", () => {
  const testCases: [number, number][] = [
    [90, 91],
    [91, 92],
    [92, 93],
    [93, 94],
    [94, 95],
    [95, 96],
    [96, 97],
    [97, 89],
    [89, 88],
    [88, 87],
    [87, 86],
    [86, 85],
    [85, 84],
    [84, 83],
    // ...
    [5, 4],
    [4, 3],
    [3, 2],
    [2, 1],
    [1, 0],
    [0, 0],
  ];

  for (const testCase of testCases) {
    const [input, expected] = testCase;
    test(`nextVariableSlot ${input}`, () => {
      expect(nextVariableSlot(input)).toEqual<number>(expected);
    });
  }
});
