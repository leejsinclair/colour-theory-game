export type Puzzle23OptionKind = "warm-shifted" | "surface" | "cool-shifted" | "incorrect-hue";

type Puzzle23Option = {
  swatch: string;
  kind: Puzzle23OptionKind;
  label: string;
};

type Puzzle23Panel = {
  name: string;
  caption: string;
  objectColor: string;
  background: string;
  glow: string;
};

export type Puzzle23Round = {
  id: string;
  title: string;
  difficulty: string;
  hint: string;
  panels: {
    warm: Puzzle23Panel;
    cool: Puzzle23Panel;
    neutral: Puzzle23Panel;
  };
  options: Puzzle23Option[];
  correctIndex: number;
};

export const PUZZLE23_ROUNDS: Puzzle23Round[] = [
  {
    id: "round-1",
    title: "Round 1 — Obvious Shift",
    difficulty: "Strong warm/cool casts with a clear neutral reference.",
    hint: "Look for the swatch that best explains every panel, not just the warm one.",
    panels: {
      warm: {
        name: "Warm Light",
        caption: "Tungsten orange cast",
        objectColor: "#ad9f5f",
        background: "linear-gradient(180deg, #f7e1bf 0%, #e2a45b 100%)",
        glow: "rgba(245, 158, 11, 0.28)",
      },
      cool: {
        name: "Cool Light",
        caption: "Blue daylight cast",
        objectColor: "#6d9f88",
        background: "linear-gradient(180deg, #dbeafe 0%, #8ec5ff 100%)",
        glow: "rgba(59, 130, 246, 0.24)",
      },
      neutral: {
        name: "Neutral Light",
        caption: "Grey-balanced reference",
        objectColor: "#7f9b73",
        background: "linear-gradient(180deg, #f3f4f6 0%, #d1d5db 100%)",
        glow: "rgba(148, 163, 184, 0.18)",
      },
    },
    options: [
      { swatch: "#ab9557", kind: "warm-shifted", label: "Warm-shifted olive" },
      { swatch: "#7f9b73", kind: "surface", label: "True surface sage" },
      { swatch: "#6a9986", kind: "cool-shifted", label: "Cool-shifted sage" },
      { swatch: "#8f748f", kind: "incorrect-hue", label: "Muted mauve" },
    ],
    correctIndex: 1,
  },
  {
    id: "round-2",
    title: "Round 2 — Moderate Shift",
    difficulty: "Less saturated lighting and closer distractors.",
    hint: "Ignore the orange cast and compare how the hue pivots under both warm and cool light.",
    panels: {
      warm: {
        name: "Warm Light",
        caption: "Indoor amber bias",
        objectColor: "#c78c76",
        background: "linear-gradient(180deg, #f6ddcf 0%, #d39a7a 100%)",
        glow: "rgba(234, 88, 12, 0.22)",
      },
      cool: {
        name: "Cool Light",
        caption: "Window light bias",
        objectColor: "#b48b95",
        background: "linear-gradient(180deg, #dfe9f8 0%, #afc7ec 100%)",
        glow: "rgba(96, 165, 250, 0.2)",
      },
      neutral: {
        name: "Neutral Light",
        caption: "Reference panel",
        objectColor: "#bc8a87",
        background: "linear-gradient(180deg, #f7f2f2 0%, #d9ced0 100%)",
        glow: "rgba(148, 163, 184, 0.16)",
      },
    },
    options: [
      { swatch: "#c89178", kind: "warm-shifted", label: "Warm coral" },
      { swatch: "#b48b95", kind: "cool-shifted", label: "Cool dusty rose" },
      { swatch: "#7fa0a4", kind: "incorrect-hue", label: "Muted teal" },
      { swatch: "#bc8a87", kind: "surface", label: "True surface rose clay" },
    ],
    correctIndex: 3,
  },
  {
    id: "round-3",
    title: "Round 3 — Subtle Shift",
    difficulty: "Minimal neutral cue and tighter, lower-contrast options.",
    hint: "The apparent colour changes only slightly here, so trust the option that sits between the warm and cool appearances.",
    panels: {
      warm: {
        name: "Warm Light",
        caption: "Soft amber haze",
        objectColor: "#8f959f",
        background: "linear-gradient(180deg, #efe4d7 0%, #d7c5b4 100%)",
        glow: "rgba(251, 146, 60, 0.18)",
      },
      cool: {
        name: "Cool Light",
        caption: "Soft skylight haze",
        objectColor: "#7d8fa9",
        background: "linear-gradient(180deg, #e5eef8 0%, #bfd3eb 100%)",
        glow: "rgba(59, 130, 246, 0.16)",
      },
      neutral: {
        name: "Neutral Light",
        caption: "Faint neutral cue",
        objectColor: "#8690a4",
        background: "linear-gradient(180deg, #eef0f4 0%, #d1d6df 100%)",
        glow: "rgba(148, 163, 184, 0.14)",
      },
    },
    options: [
      { swatch: "#8690a4", kind: "surface", label: "True surface blue-grey" },
      { swatch: "#908f98", kind: "warm-shifted", label: "Warm fog grey" },
      { swatch: "#7d8fa9", kind: "cool-shifted", label: "Cool steel blue" },
      { swatch: "#948ba1", kind: "incorrect-hue", label: "Lilac grey" },
    ],
    correctIndex: 0,
  },
];