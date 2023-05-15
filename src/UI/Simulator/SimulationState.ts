export type SimulationState =
  | "IDLE"
  | "FETCH_INSTRUCTION"
  | "EXECUTE_INSTRUCTION"
  | "SINGLE_STEP"
  | "RUN"
  | "STOPPING";

export function simulationActive(simulationState: SimulationState): boolean {
  return simulationState !== "IDLE";
}
