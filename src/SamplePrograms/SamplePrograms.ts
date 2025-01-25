import type { SampleProgram } from "./SampleProgram";

/**
 * Some sample programs that can be loaded and are helpful during
 * development.
 */
export const samplePrograms: SampleProgram[] = [
  {
    name: "Hello World",
    code: `// Hello World
LOAD one
WRITE
STOP
`,
  },
  {
    name: "Double",
    code: `// Double
READ
STORE x
ADD x
WRITE
STOP
`,
  },
  {
    name: "Multiply",
    code: `// Multiply
    READ
    STORE step
    READ
    STORE count
    LOAD zero
    STORE result
loop:
    LOAD count
    GOTOP done
    LOAD result
    WRITE
    STOP
done:
    LOAD result
    ADD step
    STORE result
    LOAD count
    SUB one
    STORE count
    GOTO loop
`,
  },
  {
    name: "Fibonacci",
    code: `// Fibonacci Sequence
//
// Reads a single input that specifies
// the number of iterations.
//
// A good example input is "10".
    read
    store count
    load zero
    store a
    write
    load one
    store b
    write
iteration:
    load a
    add b
    store c
    write
    load b
    store a
    load c
    store b
    load count
    gotoz done
    sub one
    store count
    goto iteration
done:
    stop
`,
  },
];
