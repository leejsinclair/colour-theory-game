import React, { useState, useRef, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

// ─── Colour model helpers ─────────────────────────────────────────────────────

// Cosine approximation: Yellow (60°) peaks near 8.5, Violet (270°) peaks near 3.5.
function getPeakValue(hue: number): number {
  const h = ((hue % 360) + 360) % 360;
  // Clamped to [2, 9.5]; base 6, amplitude 2.5, hue offset 60° (yellow at top).
  return Math.max(2, Math.min(9.5, 6 + 2.5 * Math.cos(((h - 60) * Math.PI) / 180)));
}

// Returns 0–1 representing the maximum reachable chroma fraction at a given hue+value.
function maxChromaAtValue(hue: number, value: number): number {
  const peak = getPeakValue(hue);
  const dist = Math.abs(value - peak);
  // Falloff: distance of 5 value steps drops to zero; exponent 1.4 softens the shoulder.
  const falloff = Math.max(0, 1 - (dist / 5) ** 1.4);
  const h = ((hue % 360) + 360) % 360;
  // Hue boost: warm hues (near 30°) are slightly more chromatic than cool hues.
  const hueBoost = 0.85 + 0.15 * Math.cos(((h - 30) * Math.PI) / 180);
  return falloff * hueBoost;
}

function toCSS(hue: number, value: number, chroma: number): string {
  const l = (value / 10) * 100;
  const sFactor = Math.sin((value / 10) * Math.PI);
  const s = chroma * sFactor * 100;
  return `hsl(${hue}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NUM_CHROMA_COLS = 14;
const RING_SIZE = 200;
const RING_RADIUS = 80;
const RING_CENTER = RING_SIZE / 2;

const HUE_PRESETS = [
  { name: "Red", hue: 0, munsell: "R" },
  { name: "Orange", hue: 30, munsell: "YR" },
  { name: "Yellow", hue: 60, munsell: "Y" },
  { name: "Yellow-Green", hue: 90, munsell: "GY" },
  { name: "Green", hue: 120, munsell: "G" },
  { name: "Teal", hue: 180, munsell: "BG" },
  { name: "Blue", hue: 210, munsell: "B" },
  { name: "Violet", hue: 270, munsell: "PB" },
  { name: "Purple", hue: 300, munsell: "P" },
  { name: "Magenta", hue: 330, munsell: "RP" },
] as const;

function getMunsellHueCode(hue: number): string {
  const normalizedHue = ((hue % 360) + 360) % 360;
  let nearestPreset: (typeof HUE_PRESETS)[number] = HUE_PRESETS[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const preset of HUE_PRESETS) {
    const distance = Math.min(
      Math.abs(normalizedHue - preset.hue),
      360 - Math.abs(normalizedHue - preset.hue),
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestPreset = preset;
    }
  }

  return nearestPreset.munsell;
}

function formatMunsellCode(hue: number, value: number, chroma: number): string {
  return `${getMunsellHueCode(hue)} ${value} - ${chroma}`;
}

// ─── Tooltip state ────────────────────────────────────────────────────────────

type TooltipInfo =
  | { reachable: true; value: number; chroma: number; chromaPercent: number; color: string; munsellCode: string }
  | { reachable: false; value: number; chroma: number; munsellCode: string };

// ─── Component ────────────────────────────────────────────────────────────────

export function ChromaTreeExplorer(): React.ReactElement {
  const [hue, setHue] = useState(60); // default: Yellow
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const draggingRef = useRef(false);
  const ringRef = useRef<HTMLDivElement>(null);

  const updateHueFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!ringRef.current) return;
    const rect = ringRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angleRad = Math.atan2(clientY - cy, clientX - cx);
    const newHue = (((angleRad * 180) / Math.PI + 90) % 360 + 360) % 360;
    setHue(Math.round(newHue));
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (draggingRef.current) updateHueFromPointer(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      draggingRef.current = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (draggingRef.current && e.touches.length > 0) {
        e.preventDefault();
        updateHueFromPointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      draggingRef.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [updateHueFromPointer]);

  // Derived values
  const peakValue = getPeakValue(hue);
  const peakValueRow = Math.max(0, Math.min(10, Math.round(peakValue)));
  const peakCol = Math.min(
    NUM_CHROMA_COLS - 1,
    Math.floor(maxChromaAtValue(hue, peakValueRow) * (NUM_CHROMA_COLS - 1)),
  );

  const activePreset = HUE_PRESETS.find((p) => p.hue === hue) ?? null;
  const hueName = activePreset?.name ?? `${Math.round(hue)}°`;
  const hueAccent = `hsl(${hue}, 80%, 55%)`;

  const peakNote =
    peakValue > 7
      ? "This hue reaches its most vivid form in the light-value range."
      : peakValue < 4.5
        ? "This hue reaches its most vivid form in the dark-value range."
        : "This hue reaches its most vivid form near the middle value range.";

  // Hue ring thumb position
  const thumbAngle = ((hue - 90) * Math.PI) / 180;
  const thumbX = RING_CENTER + RING_RADIUS * Math.cos(thumbAngle);
  const thumbY = RING_CENTER + RING_RADIUS * Math.sin(thumbAngle);

  return (
    <div className="chroma-tree-explorer">
      {/* Hue ring */}
      <div className="chroma-tree-hue-ring-wrap">
        <div
          className="chroma-tree-hue-ring"
          ref={ringRef}
          onMouseDown={(e) => {
            draggingRef.current = true;
            updateHueFromPointer(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            draggingRef.current = true;
            if (e.touches.length > 0) {
              updateHueFromPointer(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
        >
          <svg
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            style={{ display: "block", width: RING_SIZE, height: RING_SIZE, overflow: "visible" }}
          >
            {/* Colour wheel ring made of arc segments */}
            {Array.from({ length: 360 }, (_, i) => {
              const a1 = ((i - 90) * Math.PI) / 180;
              const a2 = ((i - 89) * Math.PI) / 180;
              const x1 = RING_CENTER + RING_RADIUS * Math.cos(a1);
              const y1 = RING_CENTER + RING_RADIUS * Math.sin(a1);
              const x2 = RING_CENTER + RING_RADIUS * Math.cos(a2);
              const y2 = RING_CENTER + RING_RADIUS * Math.sin(a2);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={`hsl(${i}, 90%, 55%)`}
                  strokeWidth={18}
                  strokeLinecap="butt"
                />
              );
            })}
            {/* Thumb */}
            <circle cx={thumbX} cy={thumbY} r={9} fill="white" stroke="#333" strokeWidth={2} />
          </svg>
        </div>
      </div>

      {/* Quick-pick chips */}
      <div className="chroma-tree-chips">
        {HUE_PRESETS.map((preset) => (
          <button
            key={preset.name}
            className={`chroma-tree-chip${hue === preset.hue ? " chroma-tree-chip--active" : ""}`}
            style={{ "--chip-hue": `hsl(${preset.hue}, 80%, 50%)` } as React.CSSProperties}
            onClick={() => setHue(preset.hue)}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Insight card */}
      <div className="chroma-tree-insight-card">
        <strong>{hueName}</strong>: Peak chroma sits at value {peakValue.toFixed(1)} out of 10.{" "}
        {peakNote}
      </div>

      {/* Cross-section grid */}
      <div className="chroma-tree-grid">
        {Array.from({ length: 11 }, (_, rowIdx) => {
          const valueInt = 10 - rowIdx;
          return (
            <div key={valueInt} className="chroma-tree-grid-row">
              {Array.from({ length: NUM_CHROMA_COLS }, (_, col) => {
                const chromaRatio = col / (NUM_CHROMA_COLS - 1);
                const maxChroma = maxChromaAtValue(hue, valueInt);
                const reachable = chromaRatio <= maxChroma;
                const isPeak = valueInt === peakValueRow && col === peakCol;
                const cellColor = reachable ? toCSS(hue, valueInt, chromaRatio) : "#1a1a2e";
                const munsellCode = formatMunsellCode(hue, valueInt, col);
                const classNames = [
                  "chroma-tree-cell",
                  !reachable ? "chroma-tree-cell--unreachable" : "",
                  isPeak ? "chroma-tree-cell--peak" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    key={col}
                    className={classNames}
                    style={{ background: cellColor, position: "relative" }}
                    onMouseEnter={() => {
                      setTooltip(
                        reachable
                          ? {
                              reachable: true,
                              value: valueInt,
                              chroma: col,
                              chromaPercent: Math.round(chromaRatio * 100),
                              color: cellColor,
                              munsellCode,
                            }
                          : { reachable: false, value: valueInt, chroma: col, munsellCode },
                      );
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {isPeak && (
                      <span
                        style={{
                          position: "absolute",
                          top: -4,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "white",
                          display: "block",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      <div className="chroma-tree-tooltip">
        {tooltip ? (
          tooltip.reachable ? (
            <>
              Munsell {tooltip.munsellCode} &middot; Value {tooltip.value} &middot; Chroma {tooltip.chroma} ({tooltip.chromaPercent}%) &middot;{" "}
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: tooltip.color,
                  verticalAlign: "middle",
                  border: "1px solid rgba(0,0,0,0.2)",
                }}
              />{" "}
              accessible
            </>
          ) : (
            `Munsell ${tooltip.munsellCode} is not reachable for this hue. Value ${tooltip.value}, chroma ${tooltip.chroma}.`
          )
        ) : (
          "Hover a cell to see its Munsell code, value, and chroma information."
        )}
      </div>

      {/* Three callout cards */}
      <div className="chroma-tree-callout-row">
        <div className="chroma-tree-callout">
          <div className="chroma-tree-callout__icon" style={{ color: hueAccent }}>
            ↗
          </div>
          <strong>The tree leans</strong>
          <p>Different hues peak at different value levels. Yellow peaks light; violet peaks dark.</p>
        </div>
        <div className="chroma-tree-callout">
          <div className="chroma-tree-callout__icon" style={{ color: hueAccent }}>
            ⬛
          </div>
          <strong>Dark cells = impossible</strong>
          <p>Dimmed cells show chroma levels that can&apos;t exist for this hue at that value.</p>
        </div>
        <div className="chroma-tree-callout">
          <div className="chroma-tree-callout__icon" style={{ color: hueAccent }}>
            ⚪
          </div>
          <strong>White dot = peak</strong>
          <p>The white-bordered cell marks where this hue reaches its maximum chroma.</p>
        </div>
      </div>
    </div>
  );
}

/** Mount the ChromaTreeExplorer into the given container element. */
export function mountChromaTreeExplorer(container: HTMLElement): () => void {
  const root = createRoot(container);
  root.render(<ChromaTreeExplorer />);
  return () => {
    root.unmount();
  };
}
