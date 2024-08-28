import type { ExampleProgram } from "./ExampleProgram";

/**
 * Some example programs that can be loaded and are helpful during
 * development.
 */
export const examplePrograms: ExampleProgram[] = [
  {
    name: "Hello World",
    input: [],
    memory: [303, 900, 0, 42],
  },
  {
    name: "Double",
    input: [73],
    memory: [800, 490, 190, 900, 0],
  },
  {
    name: "Multiply",
    input: [9, 7],
    memory: [
      800,
      490,
      800,
      491,
      398,
      492,
      391,
      712,
      392,
      900,
      0,
      null,
      392,
      190,
      492,
      391,
      299,
      491,
      506,
    ],
  },
];
