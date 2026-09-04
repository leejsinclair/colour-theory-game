import { useId, type ReactElement } from "react";

/**
 * Labelled native `<select>` — one of the shared puzzle-control primitives
 * (contracts/puzzle-component.md rule 3). Native for keyboard + screen-reader
 * behaviour; the token focus ring is applied via `.ds-select` in `styles.css`.
 */

export type SelectOption = { value: string; label: string };

export type SelectProps = {
  label: string;
  hideLabel?: boolean;
  value: string;
  options: Array<SelectOption | string>;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function Select({
  label,
  hideLabel = false,
  value,
  options,
  disabled = false,
  onChange,
}: SelectProps): ReactElement {
  const id = useId();
  const normalised: SelectOption[] = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

  return (
    <div className="ds-field">
      {!hideLabel ? (
        <label htmlFor={id} className="ds-field__label">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className="ds-select"
        value={value}
        disabled={disabled}
        aria-label={hideLabel ? label : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        {normalised.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
