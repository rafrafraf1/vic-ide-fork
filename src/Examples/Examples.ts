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
    memory: [800, 450, 150, 900, 0],
  },
  {
    name: "Multiply",
    input: [9, 7],
    memory: [
      800,
      450,
      800,
      451,
      398,
      452,
      351,
      712,
      352,
      900,
      0,
      null,
      352,
      150,
      452,
      351,
      299,
      451,
      506,
    ],
  },
];
