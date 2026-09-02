import { useId, type ReactElement, type ReactNode } from "react";

/**
 * Labelled native checkbox — one of the shared puzzle-control primitives
 * (contracts/puzzle-component.md rule 3). Real `<input type="checkbox">` with a
 * bound `<label>` so it is keyboard-operable and screen-reader-labelled.
 */

export type CheckboxProps = {
  label: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export function Checkbox({ label, checked, disabled = false, onChange }: CheckboxProps): ReactElement {
  const id = useId();
  return (
    <div className="ds-checkbox">
      <input
        id={id}
        type="checkbox"
        className="ds-checkbox__input ds-focusable"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label htmlFor={id} className="ds-checkbox__label">
        {label}
      </label>
    </div>
  );
}
