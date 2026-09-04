import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LearningQuiz } from "../../src/web/components/LearningQuiz";
import { puzzleLearningContent } from "../../src/content/puzzleLearningContent";

/**
 * T065 (US3) — component test of the quiz gate, replacing the pure-scorer
 * `tests/learningFlow.test.ts` (the scorer keeps its own unit coverage in
 * `tests/evaluateLearningQuiz.test.ts`).
 */

const PUZZLE = "puzzle-01";
const quiz = puzzleLearningContent[PUZZLE].quiz;

function renderQuiz(overrides: Partial<Parameters<typeof LearningQuiz>[0]> = {}) {
  const props = {
    puzzleId: PUZZLE,
    onPass: vi.fn(),
    onBack: vi.fn(),
    announce: vi.fn(),
    ...overrides,
  };
  render(<LearningQuiz {...props} />);
  return props;
}

async function answerEach(pick: (correctIndex: number) => number): Promise<void> {
  const user = userEvent.setup();
  const fieldsets = screen.getAllByRole("group");
  for (const [questionIndex, fieldset] of fieldsets.entries()) {
    const radios = within(fieldset).getAllByRole("radio");
    await user.click(radios[pick(quiz[questionIndex].correctIndex)]);
  }
}

describe("LearningQuiz", () => {
  it("does not pass until every answer is correct, and shows tips on a miss", async () => {
    const user = userEvent.setup();
    const { onPass, announce } = renderQuiz();

    await answerEach((correctIndex) => (correctIndex === 0 ? 1 : 0));
    await user.click(screen.getByRole("button", { name: "Submit quiz" }));

    expect(onPass).not.toHaveBeenCalled();
    expect(screen.getByText(/You need 100%/)).toBeInTheDocument();
    expect(screen.getAllByText(/^Tip:/)).toHaveLength(quiz.length);

    await answerEach((correctIndex) => correctIndex);
    await user.click(screen.getByRole("button", { name: "Submit quiz" }));

    expect(onPass).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith(expect.stringMatching(/Puzzle unlocked/));
  });

  it("asks for every answer before submitting", async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getByRole("button", { name: "Submit quiz" }));
    expect(screen.getByText("Answer every question before submitting.")).toBeInTheDocument();
  });
});
