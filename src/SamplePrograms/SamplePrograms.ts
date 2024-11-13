import type { SampleProgram } from "./SampleProgram";

/**
 * Some sample programs that can be loaded and are helpful during
 * development.
 */
export const samplePrograms: SampleProgram[] = [
  {
    name: "Hello World",
    memory: [303, 900, 0, 42],
  },
  {
    name: "Double",
    memory: [800, 490, 190, 900, 0],
  },
  {
    name: "Multiply",
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
