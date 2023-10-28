import { assertNever } from "assert-never";

/**
 * All of the available strings that appear in the user interface of the app.
 */
export type UIStringKey =
  | "DARK_MODE"
  | "LIGHT_MODE"
  | "LOAD_EXAMPLE"
  | "FETCH"
  | "EXECUTE"
  | "ANIMATION_SPEED"
  | "ANIMATION_OFF"
  | "ANIMATION_SLOW"
  | "ANIMATION_MEDIUM"
  | "ANIMATION_FAST"
  | "RESET"
  | "SINGLE_STEP"
  | "RUN"
  | "STOP"
  | "STOPPING"
  | "HELP"
  | "NO_FILE_AVAILABLE"
  | "USE_THE_FILE_EXPLORER_TO_OPEN_A_FILE"
  | "LOAD"
  | "COMPILE"
  | "AND_LOAD_IT_INTO_THE_SIMULATOR"
  | "CONTAINS_ERRORS_THAT_MUST_BE_FIXED"
  | "CLICK_TO_VIEW_THE_ERRORS"
  | "FILE_IS_OF_TYPE"
  | "CHANGE_THE_LANGUAGE_MODE_OF_THE_FILE_TO"
  | "I_O_UNITS"
  | "CPU"
  | "MEMORY"
  | "INPUT"
  | "OUTPUT"
  | "INSTRUCTION_REGISTER"
  | "DATA_REGISTER"
  | "PROGRAM_COUNTER"
  | "CPU_STATUS"
  | "CPU_IDLE"
  | "CPU_FETCHING"
  | "CPU_EXECUTING"
  | "CPU_STOP"
  | "CPU_NO_INPUT"
  | "CPU_INVALID_INSTRUCTION"
  | "CPU_INVALID_WRITE"
  | "READONLY_MEMORY_ADDRESS";

/**
 * A collection of UI strings for a given human (spoken) language.
 */
export type UIStrings = (key: UIStringKey) => string;

/**
 * All of the UI strings with their English language translation.
 */
export function EnglishStrings(key: UIStringKey): string {
  switch (key) {
    case "DARK_MODE":
      return "Dark Mode";
    case "LIGHT_MODE":
      return "Light Mode";
    case "LOAD_EXAMPLE":
      return "Load Example";
    case "FETCH":
      return "Fetch";
    case "EXECUTE":
      return "Execute";
    case "ANIMATION_SPEED":
      return "Animation Speed";
    case "ANIMATION_OFF":
      return "Off";
    case "ANIMATION_SLOW":
      return "Slow";
    case "ANIMATION_MEDIUM":
      return "Medium";
    case "ANIMATION_FAST":
      return "Fast";
    case "RESET":
      return "Reset";
    case "SINGLE_STEP":
      return "Single Step";
    case "RUN":
      return "Run";
    case "STOP":
      return "Stop";
    case "STOPPING":
      return "Stopping";
    case "HELP":
      return "Help";
    case "NO_FILE_AVAILABLE":
      return "No File Available";
    case "USE_THE_FILE_EXPLORER_TO_OPEN_A_FILE":
      return "Use the File Explorer to open a file";
    case "LOAD":
      return "Load";
    case "COMPILE":
      return "Compile";
    case "AND_LOAD_IT_INTO_THE_SIMULATOR":
      return "and load it into the Simulator";
    case "CONTAINS_ERRORS_THAT_MUST_BE_FIXED":
      return "contains errors that must be fixed";
    case "CLICK_TO_VIEW_THE_ERRORS":
      return "Click to view the errors";
    case "FILE_IS_OF_TYPE":
      return "file is of type";
    case "CHANGE_THE_LANGUAGE_MODE_OF_THE_FILE_TO":
      return "Change the Language mode of the file to";
    case "I_O_UNITS":
      return "I/O Units";
    case "CPU":
      return "CPU";
    case "MEMORY":
      return "Memory";
    case "INPUT":
      return "Input";
    case "OUTPUT":
      return "Output";
    case "INSTRUCTION_REGISTER":
      return "Instruction Register";
    case "DATA_REGISTER":
      return "Data Register";
    case "PROGRAM_COUNTER":
      return "Program Counter";
    case "CPU_STATUS":
      return "CPU Status";
    case "CPU_IDLE":
      return "Idle";
    case "CPU_FETCHING":
      return "Fetching...";
    case "CPU_EXECUTING":
      return "Executing...";
    case "CPU_STOP":
      return "STOP";
    case "CPU_NO_INPUT":
      return "No Input";
    case "CPU_INVALID_INSTRUCTION":
      return "Invalid instruction";
    case "CPU_INVALID_WRITE":
      return "Invalid write to read-only memory address";
    case "READONLY_MEMORY_ADDRESS":
      return "Read-only memory address";
    default:
      return assertNever(key);
  }
}

/**
 * A special language where all the UI strings are the reversed result of the
 * English translation.
 *
 * Useful during development to see if there are any parts of the UI that are
 * not using the UIStrings framework.
 */
export function ReverseEnglishStrings(key: UIStringKey): string {
  const str = EnglishStrings(key);
  return str.split("").reverse().join("");
}

export const AvailableLanguages = {
  English: EnglishStrings,
  ReverseEnglishStrings: ReverseEnglishStrings,
};
