import React from "react";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";

type PuzzleSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  showLabel?: boolean;
};

export function PuzzleSlider({ label, value, min, max, step, onChange, showLabel = true }: PuzzleSliderProps): React.ReactElement {
  const precision = step >= 1 ? 0 : 2;

  return (
    <div className="mini-row">
      {showLabel ? <div className="mini-label">{label}: {value.toFixed(precision)}</div> : null}
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(_, next) => {
          const nextValue = Array.isArray(next) ? next[0] : next;
          onChange(nextValue);
        }}
      />
    </div>
  );
}

type PuzzleCheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function PuzzleCheckbox({ label, checked, onChange }: PuzzleCheckboxProps): React.ReactElement {
  return (
    <FormControlLabel
      className="mini-row"
      control={<Checkbox size="small" checked={checked} onChange={(event) => onChange(Boolean(event.target.checked))} />}
      label={label}
    />
  );
}

type PuzzleActionButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  small?: boolean;
};

export function PuzzleActionButton({ children, onClick, disabled = false, small = false }: PuzzleActionButtonProps): React.ReactElement {
  return (
    <Button
      variant="contained"
      color="secondary"
      size={small ? "small" : "medium"}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
