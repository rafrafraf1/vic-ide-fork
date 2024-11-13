import "./AnimationSpeedSelector.css";

import * as React from "react";

import { assertNever } from "assert-never";
import classNames from "classnames";

import type { AnimationSpeed } from "../Simulator/AnimationSpeed";
import type { UIStrings } from "../UIStrings";

export interface AnimationSpeedSelectorProps {
  className?: string;
  uiString: UIStrings;
  animationSpeed: AnimationSpeed;
  onAnimationSpeedChange?: (value: AnimationSpeed) => void;
}

export const AnimationSpeedSelector = React.memo(
  React.forwardRef(function AnimationSpeedSelector(
    props: AnimationSpeedSelectorProps,
    ref: React.ForwardedRef<HTMLDivElement>,
  ): React.JSX.Element {
    const { className, uiString, animationSpeed, onAnimationSpeedChange } =
      props;

    const handleOnChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ): void => {
      const newAnimationSpeed = numberToAnimationSpeed(event.target.value);
      if (onAnimationSpeedChange !== undefined) {
        onAnimationSpeedChange(newAnimationSpeed);
      }
    };

    const handleOffClick = (): void => {
      if (animationSpeed === "OFF") {
        return;
      }
      if (onAnimationSpeedChange !== undefined) {
        onAnimationSpeedChange("OFF");
      }
    };

    const handleFastClick = (): void => {
      if (animationSpeed === "FAST") {
        return;
      }
      if (onAnimationSpeedChange !== undefined) {
        onAnimationSpeedChange("FAST");
      }
    };

    return (
      <div
        ref={ref}
        className={classNames(className, "AnimationSpeedSelector-Root")}
      >
        <div className="AnimationSpeedSelector-Label" onClick={handleOffClick}>
          {uiString("ANIMATION_OFF")}
        </div>
        <input
          type="range"
          min={MIN_ANIMATION_SPEED_NUMBER}
          max={MAX_ANIMATION_SPEED_NUMBER}
          value={animationSpeedToNumber(animationSpeed)}
          onChange={handleOnChange}
        />
        <div className="AnimationSpeedSelector-Label" onClick={handleFastClick}>
          {uiString("ANIMATION_FAST")}
        </div>
      </div>
    );
  }),
);

const MIN_ANIMATION_SPEED_NUMBER = 0;
const MAX_ANIMATION_SPEED_NUMBER = 4;

function numberToAnimationSpeed(number: string): AnimationSpeed {
  switch (number) {
    case "0":
      return "OFF";
    case "1":
      return "SLOW";
    case "2":
      return "MEDIUM";
    case "3":
      return "FAST";
    case "4":
      return "INSTANT";
    default:
      // This should never happen. See the constants above
      // "MIN_ANIMATION_SPEED_NUMBER" and "MAX_ANIMATION_SPEED_NUMBER"
      return "OFF";
  }
}

function animationSpeedToNumber(animationSpeed: AnimationSpeed): number {
  switch (animationSpeed) {
    case "OFF":
      return 0;
    case "SLOW":
      return 1;
    case "MEDIUM":
      return 2;
    case "FAST":
      return 3;
    case "INSTANT":
      return 4;
    default:
      return assertNever(animationSpeed);
  }
}
