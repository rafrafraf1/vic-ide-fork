import { samplePrograms } from "./SamplePrograms";

/**
 * A built-in sample program that can be loaded and may be helpful during
 * development.
 */
export interface SampleProgram {
  name: string;
  code: string;
}

/**
 * Get the list of all available sample programs.
 */
export function getSampleProgramNames(): string[] {
  return samplePrograms.map((x) => x.name);
}

/**
 * @returns the full contents of the given SampleProgram.
 */
export function lookupSampleProgram(name: string): SampleProgram | null {
  for (const sampleProgram of samplePrograms) {
    if (sampleProgram.name === name) {
      return sampleProgram;
    }
  }

  return null;
}
