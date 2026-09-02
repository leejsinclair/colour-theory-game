/**
 * Puzzle 23 – Colour Constancy Across Light
 *
 * Players compare the same object under warm, cool and neutral light and pick
 * the swatch that best represents its true surface colour for each round.
 */
import { useState, type ReactElement } from "react";
import type { PuzzleComponentProps } from "./types";
import { PUZZLE23_ROUNDS } from "./puzzle-23-data";
import { Button } from "../design-system";

export type Puzzle23Input = {
  selectedIndices: Array<number | null>;
};

export default function Puzzle23View({
  value,
  onChange,
  disabled,
}: PuzzleComponentProps<Puzzle23Input>): ReactElement {
  const [activeRound, setActiveRound] = useState(0);
  const round = PUZZLE23_ROUNDS[activeRound];
  const completed = value.selectedIndices.filter((v) => v !== null).length;

  const choose = (optionIndex: number): void => {
    const next = [...value.selectedIndices];
    next[activeRound] = optionIndex;
    onChange({ selectedIndices: next });
  };

  return (
    <>
      <div className="mini-label">
        Compare the object across warm, cool and neutral light. Choose one swatch per round, then press Check.
      </div>

      <div className="chip-row" role="group" aria-label="Rounds">
        {PUZZLE23_ROUNDS.map((r, index) => (
          <button
            key={r.id}
            type="button"
            className={`tod-palette-btn${index === activeRound ? " --selected" : ""}`}
            aria-pressed={index === activeRound}
            aria-label={`${r.title}${value.selectedIndices[index] !== null ? " — selection made" : " — pending"}`}
            onClick={() => setActiveRound(index)}
          >
            {r.title}
          </button>
        ))}
      </div>

      <div className="mini-label">{round.difficulty} {round.hint}</div>

      <div className="mood-match-options" aria-hidden="true">
        {Object.values(round.panels).map((panel) => (
          <div key={panel.name} style={{ borderRadius: "var(--radius-md)", padding: "var(--space-sm)", background: panel.background }}>
            <div style={{ fontWeight: 700, fontSize: "0.75rem" }}>{panel.name}</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.72, marginBottom: "0.5rem" }}>{panel.caption}</div>
            <div style={{ height: "56px", borderRadius: "var(--radius-sm)", background: panel.objectColor }} />
          </div>
        ))}
      </div>

      <div className="chip-row" role="group" aria-label={`${round.title} surface colour options`}>
        {round.options.map((option, optionIndex) => {
          const selected = value.selectedIndices[activeRound] === optionIndex;
          return (
            <button
              key={`${round.id}-${option.label}`}
              type="button"
              className={`tod-palette-btn${selected ? " --selected" : ""}`}
              aria-pressed={selected}
              aria-label={`Choose ${option.label} for ${round.title}`}
              disabled={disabled}
              onClick={() => choose(optionIndex)}
            >
              <span aria-hidden="true" className="tod-swatch" style={{ background: option.swatch, width: "2.25rem", height: "2.25rem" }} />
              <span>{selected ? "Selected" : option.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "var(--space-xs)", alignItems: "center", flexWrap: "wrap" }}>
        <div className="mini-label" aria-live="polite">
          {completed}/{PUZZLE23_ROUNDS.length} rounds selected{completed === PUZZLE23_ROUNDS.length ? " — ready to check." : "."}
        </div>
        <Button variant="ghost" size="sm" disabled={activeRound === 0} onClick={() => setActiveRound((p) => Math.max(0, p - 1))}>
          Previous round
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={activeRound === PUZZLE23_ROUNDS.length - 1}
          onClick={() => setActiveRound((p) => Math.min(PUZZLE23_ROUNDS.length - 1, p + 1))}
        >
          Next round
        </Button>
      </div>
    </>
  );
}
