export type PuzzleRenderResult = {
  appended?: boolean;
};

export type PuzzleRenderDeps = {
  zone: HTMLDivElement;
  wrapper: HTMLDivElement;
  puzzleId: string;
  state: string;
  ensureState: <T>(puzzleId: string, initial: T) => T;
  addMiniLabel: (container: HTMLElement, text: string) => void;
  addSlider: (
    container: HTMLElement,
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onInput: (value: number) => void,
  ) => HTMLInputElement;
  addSelect: (
    container: HTMLElement,
    label: string,
    options: string[],
    current: string,
    onChange: (value: string) => void,
  ) => HTMLSelectElement;
  addCheckbox: (
    container: HTMLElement,
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
  ) => HTMLInputElement;
  addCheckButton: (wrapper: HTMLDivElement, puzzleId: string, inputFactory: () => unknown) => void;
  circularHueDistance: (a: number, b: number) => number;
  shuffleArray: <T>(items: T[]) => T[];
  render: () => void;
  renderArtStationMiniGame: (container: HTMLElement, wrapper: HTMLDivElement, puzzleId: string, state: string) => void;
  appendWrapper: () => void;
};

export type PuzzleRenderer = (deps: PuzzleRenderDeps) => PuzzleRenderResult | void;
