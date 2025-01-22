export type HelpScreenState = "CLOSED" | "OPEN" | "PINNED";

export function newHelpScreenState(): HelpScreenState {
  return "CLOSED";
}
