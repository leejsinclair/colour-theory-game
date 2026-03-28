import type { FailureReasonCode } from "../puzzles/failureReasons";

/**
 * Remove any existing Result Analysis panel from a puzzle wrapper.
 * Called at the start of each new attempt so stale feedback is cleared.
 */
export function clearResultAnalysis(wrapper: HTMLDivElement): void {
  wrapper.querySelector(".result-analysis")?.remove();
}

/**
 * Render a Result Analysis panel inside the puzzle wrapper.
 */
export function showResultAnalysis(
  wrapper: HTMLDivElement,
  reasons: FailureReasonCode[],
  explanations: Record<FailureReasonCode, string>,
): void {
  if (reasons.length === 0) {
    return;
  }

  const panel = document.createElement("div");
  panel.className = "result-analysis";

  const title = document.createElement("div");
  title.className = "result-analysis__title";
  title.textContent = "Result Analysis";
  panel.appendChild(title);

  const list = document.createElement("ul");
  list.className = "result-analysis__list";

  for (const code of reasons) {
    const item = document.createElement("li");
    item.className = "result-analysis__item";
    item.textContent = explanations[code];
    list.appendChild(item);
  }

  panel.appendChild(list);
  wrapper.appendChild(panel);
}

/**
 * Trigger the failure animation and show Result Analysis content.
 */
export function triggerFailFeedback(
  wrapper: HTMLDivElement,
  button: HTMLButtonElement,
  reasons: FailureReasonCode[],
  explanations: Record<FailureReasonCode, string>,
): void {
  button.textContent = "Try Again";
  wrapper.classList.remove("--failed");
  wrapper.getBoundingClientRect(); // force reflow
  wrapper.classList.add("--failed");
  showResultAnalysis(wrapper, reasons, explanations);

  setTimeout(() => {
    button.textContent = "Check";
    wrapper.classList.remove("--failed");
  }, 900);
}
