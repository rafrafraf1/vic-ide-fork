import "./AnimationSpeedSelector.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import type { AnimationSpeed } from "../Simulator/AnimationSpeed";
import classNames from "classnames";

export interface AnimationSpeedSelectorProps {
  className?: string;
  animationSpeed: AnimationSpeed;
  onAnimationSpeedChange?: (value: AnimationSpeed) => void;
}

export const AnimationSpeedSelector = React.memo(
  (props: AnimationSpeedSelectorProps): JSX.Element => {
    const { className, animationSpeed, onAnimationSpeedChange } = props;

    return (
      <div className={classNames(className, "AnimationSpeedSelector-Root")}>
        <div className="AnimationSpeedSelector-Title">Animation Speed</div>
        <Option
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={onAnimationSpeedChange}
          optionAnimationSpeed="OFF"
          label="Off"
          buttonCssClassName="AnimationSpeedSelector-Button-off"
          radioCssClassName="AnimationSpeedSelector-Radio-off"
          labelCssClassName="AnimationSpeedSelector-Label-off"
        />
        <Option
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={onAnimationSpeedChange}
          optionAnimationSpeed="SLOW"
          label="Slow"
          buttonCssClassName="AnimationSpeedSelector-Button-slow"
          radioCssClassName="AnimationSpeedSelector-Radio-slow"
          labelCssClassName="AnimationSpeedSelector-Label-slow"
        />
        <Option
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={onAnimationSpeedChange}
          optionAnimationSpeed="MEDIUM"
          label="Medium"
          buttonCssClassName="AnimationSpeedSelector-Button-medium"
          radioCssClassName="AnimationSpeedSelector-Radio-medium"
          labelCssClassName="AnimationSpeedSelector-Label-medium"
        />
        <Option
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={onAnimationSpeedChange}
          optionAnimationSpeed="FAST"
          label="Fast"
          buttonCssClassName="AnimationSpeedSelector-Button-fast"
          radioCssClassName="AnimationSpeedSelector-Radio-fast"
          labelCssClassName="AnimationSpeedSelector-Label-fast"
        />
      </div>
    );
  }
);

interface OptionProps {
  animationSpeed: AnimationSpeed;
  onAnimationSpeedChange?: (value: AnimationSpeed) => void;
  optionAnimationSpeed: AnimationSpeed;
  label: string;
  buttonCssClassName: string;
  radioCssClassName: string;
  labelCssClassName: string;
}

function Option(props: OptionProps): JSX.Element {
  const {
    animationSpeed,
    onAnimationSpeedChange,
    optionAnimationSpeed,
    label,
    buttonCssClassName,
    radioCssClassName,
    labelCssClassName,
  } = props;

  const handleClick = React.useCallback(() => {
    if (onAnimationSpeedChange !== undefined) {
      onAnimationSpeedChange(optionAnimationSpeed);
    }
  }, [onAnimationSpeedChange, optionAnimationSpeed]);

  return (
    <>
      <button
        className={classNames(
          "AnimationSpeedSelector-Button",
          buttonCssClassName
        )}
        onClick={handleClick}
      />
      <input
        className={radioCssClassName}
        type="radio"
        tabIndex={-1}
        readOnly={true}
        checked={animationSpeed === optionAnimationSpeed}
      />
      <label
        className={classNames(
          "AnimationSpeedSelector-Label",
          labelCssClassName
        )}
      >
        {label}
      </label>
    </>
  );
}
