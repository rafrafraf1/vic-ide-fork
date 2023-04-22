import "./Button.css"; // eslint-disable-line @typescript-eslint/no-import-type-side-effects

export interface ButtonProps {
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export function Button(props: ButtonProps): JSX.Element {
  const { children, disabled, onClick } = props;
  return (
    <button disabled={disabled} className="Button" onClick={onClick}>
      {children}
    </button>
  );
}

export interface ButtonLabelProps {
  children?: React.ReactNode;
}

export function ButtonLabel(props: ButtonLabelProps): JSX.Element {
  const { children } = props;

  return <span className="Button-Label">{children}</span>;
}
