import { puzzleLearningContent } from "../../content/puzzleLearningContent";
import type { LearningQuizQuestion } from "../../content/puzzleLearningContent";
import type { LearningProgress } from "../localProgress";

export type LearningStage = "intro" | "quiz" | "puzzle";

export type LearningUiState = {
  stage: LearningStage;
  selections: number[];
  feedback: string;
};

type ToastOptions = {
  kind?: "default" | "success";
  icon?: string;
  petId?: string;
};

type LearningIntroOptions = {
  zone: HTMLDivElement;
  puzzleId: string;
  onStartQuiz: () => void;
  onOpenInfoModal: (puzzleId: string) => void;
  createChromaTreeActionButton: () => HTMLButtonElement;
};

type LearningQuizOptions = {
  zone: HTMLDivElement;
  puzzleId: string;
  uiState: LearningUiState;
  render: () => void;
  onOpenInfoModal: (puzzleId: string) => void;
  showToast: (message: string, options?: ToastOptions) => void;
  learningProgressByPuzzle: LearningProgress;
};

export function getLearningUiState(
  stateMap: Map<string, LearningUiState>,
  puzzleId: string,
  initialStage: LearningStage,
  questionCount: number,
): LearningUiState {
  const existing = stateMap.get(puzzleId);
  if (existing) {
    return existing;
  }

  const next: LearningUiState = {
    stage: initialStage,
    selections: new Array(questionCount).fill(-1),
    feedback: "",
  };

  stateMap.set(puzzleId, next);
  return next;
}

export function addReviewIntroButton(
  container: HTMLElement,
  puzzleId: string,
  onOpenInfoModal: (puzzleId: string) => void,
): void {
  const reviewButton = document.createElement("button");
  reviewButton.className = "btn btn-secondary learning-review-btn";
  reviewButton.textContent = "Review Introduction";
  reviewButton.addEventListener("click", () => onOpenInfoModal(puzzleId));
  container.appendChild(reviewButton);
}

export function addChromaTreeButton(
  container: HTMLElement,
  createChromaTreeActionButton: () => HTMLButtonElement,
): void {
  container.appendChild(createChromaTreeActionButton());
}

export function renderLearningIntro(options: LearningIntroOptions): void {
  const { zone, puzzleId, onStartQuiz, onOpenInfoModal, createChromaTreeActionButton } = options;
  const learning = puzzleLearningContent[puzzleId];
  if (!learning) {
    return;
  }

  const card = document.createElement("div");
  card.className = "learning-card learning-card--intro";

  const title = document.createElement("h4");
  title.className = "learning-title";
  title.textContent = learning.title;
  card.appendChild(title);

  const illustration = document.createElement("div");
  illustration.className = "learning-illustration";
  illustration.innerHTML = learning.illustrationSvg;
  card.appendChild(illustration);

  learning.intro.forEach((paragraph) => {
    const p = document.createElement("p");
    p.className = "learning-paragraph";
    p.textContent = paragraph;
    card.appendChild(p);
  });

  if (learning.howToWin) {
    const row = document.createElement("p");
    row.className = "learning-meta learning-meta--how";
    row.innerHTML = `<strong>How to win:</strong> ${learning.howToWin}`;
    card.appendChild(row);
  }

  if (learning.whyFailed) {
    const row = document.createElement("p");
    row.className = "learning-meta learning-meta--why";
    row.innerHTML = `<strong>Why this fails:</strong> ${learning.whyFailed}`;
    card.appendChild(row);
  }

  if (learning.tooltips && learning.tooltips.length > 0) {
    const row = document.createElement("p");
    row.className = "learning-meta learning-meta--tooltips";
    row.innerHTML = `<strong>Key terms:</strong> ${learning.tooltips.join(" · ")}`;
    card.appendChild(row);
  }

  const controls = document.createElement("div");
  controls.className = "action-row";

  const startButton = document.createElement("button");
  startButton.className = "btn btn-primary";
  startButton.textContent = "Start Quiz";
  startButton.addEventListener("click", onStartQuiz);
  controls.appendChild(startButton);

  const learnButton = document.createElement("button");
  learnButton.className = "btn btn-secondary";
  learnButton.textContent = "Learn";
  learnButton.addEventListener("click", () => onOpenInfoModal(puzzleId));
  controls.appendChild(learnButton);

  if (puzzleId === "puzzle-06") {
    controls.appendChild(createChromaTreeActionButton());
  }

  card.appendChild(controls);
  zone.appendChild(card);
}

export function evaluateLearningQuiz(
  questions: LearningQuizQuestion[],
  selections: number[],
): { passed: boolean; score: number; outOf: number; feedback: string } {
  let correct = 0;

  for (let i = 0; i < questions.length; i += 1) {
    if (selections[i] === questions[i].correctIndex) {
      correct += 1;
    }
  }

  const passed = correct === questions.length;
  const feedback = passed
    ? `Perfect score: ${correct}/${questions.length}. Puzzle unlocked.`
    : `Score ${correct}/${questions.length}. You need 100% to unlock this puzzle.`;

  return { passed, score: correct, outOf: questions.length, feedback };
}

export function renderLearningQuiz(options: LearningQuizOptions): void {
  const { zone, puzzleId, uiState, render, onOpenInfoModal, showToast, learningProgressByPuzzle } = options;
  const learning = puzzleLearningContent[puzzleId];
  if (!learning) {
    return;
  }

  const card = document.createElement("div");
  card.className = "learning-card learning-card--quiz";

  const title = document.createElement("h4");
  title.className = "learning-title";
  title.textContent = `Quiz: ${learning.title}`;
  card.appendChild(title);

  learning.quiz.forEach((question, questionIndex) => {
    const block = document.createElement("fieldset");
    block.className = "learning-question";

    const legend = document.createElement("legend");
    legend.textContent = `${questionIndex + 1}. ${question.prompt}`;
    block.appendChild(legend);

    question.options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      label.className = "learning-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `${puzzleId}-q-${questionIndex}`;
      input.checked = uiState.selections[questionIndex] === optionIndex;
      input.addEventListener("change", () => {
        uiState.selections[questionIndex] = optionIndex;
      });

      const text = document.createElement("span");
      text.textContent = option;

      label.appendChild(input);
      label.appendChild(text);
      block.appendChild(label);
    });

    if (uiState.feedback) {
      const explanation = document.createElement("div");
      explanation.className = "learning-explanation";
      explanation.textContent = `Tip: ${question.explanation}`;
      block.appendChild(explanation);
    }

    card.appendChild(block);
  });

  const controls = document.createElement("div");
  controls.className = "action-row";

  const submitButton = document.createElement("button");
  submitButton.className = "btn btn-primary";
  submitButton.textContent = "Submit Quiz";
  submitButton.addEventListener("click", () => {
    const unanswered = uiState.selections.some((value) => value < 0);
    if (unanswered) {
      uiState.feedback = "Answer every question before submitting.";
      render();
      return;
    }

    const result = evaluateLearningQuiz(learning.quiz, uiState.selections);
    uiState.feedback = result.feedback;

    if (result.passed) {
      learningProgressByPuzzle[puzzleId] = { quizPassed: true };
      uiState.stage = "puzzle";
      showToast("Quiz passed. Puzzle unlocked.", { kind: "success", icon: "📘" });
    }

    render();
  });
  controls.appendChild(submitButton);

  const learnButton = document.createElement("button");
  learnButton.className = "btn btn-secondary";
  learnButton.textContent = "Learn";
  learnButton.addEventListener("click", () => onOpenInfoModal(puzzleId));
  controls.appendChild(learnButton);

  const backButton = document.createElement("button");
  backButton.className = "btn btn-secondary";
  backButton.textContent = "Back to Intro";
  backButton.addEventListener("click", () => {
    uiState.stage = "intro";
    uiState.feedback = "";
    render();
  });
  controls.appendChild(backButton);

  card.appendChild(controls);

  const feedback = document.createElement("div");
  feedback.className = "mini-label learning-feedback";
  feedback.textContent = uiState.feedback || "Get every answer correct to unlock puzzle play.";
  card.appendChild(feedback);

  zone.appendChild(card);
}
