import { assertNever } from "assert-never";

export type AnimationSpeed = "OFF" | "SLOW" | "MEDIUM" | "FAST" | "INSTANT";

/**
 * @returns the duration in milliseconds of the given AnimationSpeed.
 */
export function animationSpeedDuration(animationSpeed: AnimationSpeed): number {
  switch (animationSpeed) {
    case "OFF":
      return 0;
    case "SLOW":
      return 1500;
    case "MEDIUM":
      return 750;
    case "FAST":
      return 300;
    case "INSTANT":
      return 0;
    default:
      return assertNever(animationSpeed);
  }
}
