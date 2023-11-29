import "./AnimationSpeedSelector.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects
import * as React from "react";
import type { AnimationSpeed } from "../Simulator/AnimationSpeed";
import type { UIStrings } from "../UIStrings";
import classNames from "classnames";

export interface AnimationSpeedSelectorProps {
  className?: string;
  uiString: UIStrings;
  animationSpeed: AnimationSpeed;
  onAnimationSpeedChange?: (value: AnimationSpeed) => void;
}

export const AnimationSpeedSelector = React.memo(
  (props: AnimationSpeedSelectorProps): JSX.Element => {
    const { className, uiString, animationSpeed, onAnimationSpeedChange } =
      props;

    return (
      <div className={classNames(className, "AnimationSpeedSelector-Root")}>
        <div className="AnimationSpeedSelector-Title">
          <div className="AnimationSpeedSelector-Title-Line" />
          <div>{uiString("ANIMATION_SPEED")}</div>
          <div className="AnimationSpeedSelector-Title-Line" />
        </div>
        <div className="AnimationSpeedSelector-ProgressionLine" />
        <Option
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={onAnimationSpeedChange}
          optionAnimationSpeed="OFF"
          label={uiString("ANIMATION_OFF")}
          buttonCssClassName="AnimationSpeedSelector-Button-off"
          radioCssClassName="AnimationSpeedSelector-Radio-off"
          labelCssClassName="AnimationSpeedSelector-Label-off"
        />
        <Option
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={onAnimationSpeedChange}
          optionAnimationSpeed="SLOW"
          label={uiString("ANIMATION_SLOW")}
          buttonCssClassName="AnimationSpeedSelector-Button-slow"
          radioCssClassName="AnimationSpeedSelector-Radio-slow"
          labelCssClassName="AnimationSpeedSelector-Label-slow"
        />
        <Option
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={onAnimationSpeedChange}
          optionAnimationSpeed="MEDIUM"
          label={uiString("ANIMATION_MEDIUM")}
          buttonCssClassName="AnimationSpeedSelector-Button-medium"
          radioCssClassName="AnimationSpeedSelector-Radio-medium"
          labelCssClassName="AnimationSpeedSelector-Label-medium"
        />
        <Option
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={onAnimationSpeedChange}
          optionAnimationSpeed="FAST"
          label={uiString("ANIMATION_FAST")}
          buttonCssClassName="AnimationSpeedSelector-Button-fast"
          radioCssClassName="AnimationSpeedSelector-Radio-fast"
          labelCssClassName="AnimationSpeedSelector-Label-fast"
        />
      </div>
    );
  },
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
          buttonCssClassName,
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
          labelCssClassName,
        )}
      >
        {label}
      </label>
    </>
  );
}
