import { memo, useEffect, useReducer, useState, type ReactElement } from "react";
import { Button, Heading, announce } from "../design-system";
import { usePuzzle } from "../state/selectors";
import { useGameActions, useSession } from "../state/contexts";
import { useHashRoute } from "../app/useHashRoute";
import { useReducedMotion } from "../state/useReducedMotion";
import { LearningIntro } from "../components/LearningIntro";
import { LearningQuiz } from "../components/LearningQuiz";
import { PuzzlePlayer } from "../components/PuzzlePlayer";
import { ResultPanel } from "../components/ResultPanel";
import { RewardReveal } from "../components/RewardReveal";
import { PET_NAMES } from "../petSprites";
import type { Route } from "../app/routes";
import type { FailureDiagnosis, SubmitSuccess } from "../state/actions";
import type { Toast } from "../state/sessionReducer";

/**
 * The full puzzle lifecycle in React (FR-031): learning intro → quiz → play →
 * Check → feedback → reward → continue. The puzzle body is a native controlled
 * `PuzzleComponent` hosted by `<PuzzlePlayer>` (US3) — no legacy adapter.
 */

type Stage = "intro" | "quiz" | "solve";
type StageAction = { type: "START_QUIZ" } | { type: "BACK_TO_INTRO" } | { type: "TO_SOLVE" };

function stageReducer(_stage: Stage, action: StageAction): Stage {
  switch (action.type) {
    case "START_QUIZ":
      return "quiz";
    case "BACK_TO_INTRO":
      return "intro";
    case "TO_SOLVE":
      return "solve";
  }
}

type Outcome =
  | { kind: "idle" }
  | { kind: "failed"; diagnosis: FailureDiagnosis }
  | { kind: "solved"; result: SubmitSuccess };

function makeToast(message: string, kind: Toast["kind"], extra: Partial<Toast> = {}): Toast {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return { id, message, kind, ...extra };
}

function PuzzleScreenImpl({
  stationId,
  puzzleId,
}: {
  stationId: string;
  puzzleId: string;
}): ReactElement {
  const puzzle = usePuzzle(puzzleId);
  const actions = useGameActions();
  const { state: session, dispatch } = useSession();
  const { navigate } = useHashRoute();
  const reducedMotion = useReducedMotion();

  const practice = session.practicePuzzleId === puzzleId;
  const gated = Boolean(puzzle?.learningRequired) && !practice;

  const [stage, dispatchStage] = useReducer(stageReducer, gated ? "intro" : "solve");
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });

  // If the gate clears (quiz recorded, puzzle solved elsewhere) move to solve.
  useEffect(() => {
    if (!gated && stage !== "solve") {
      dispatchStage({ type: "TO_SOLVE" });
    }
  }, [gated, stage]);

  const openInfo = (): void => dispatch({ type: "OPEN_INFO", puzzleId });

  const backRoute: Route = { view: "station", stationId };

  const handleSolved = (result: SubmitSuccess): void => {
    if (practice) {
      dispatch({ type: "PUSH_TOAST", toast: makeToast(result.scoreEvent.reason, "success", { icon: "🎯" }) });
      announce(`Practice solved. ${result.scoreEvent.reason}`);
      return;
    }

    // One composed live-region message — separate announce() calls would each
    // overwrite the previous before a screen reader could read it (FR-036, T087).
    const toasts: Toast[] = [makeToast(result.scoreEvent.reason, "success", { icon: "🏆" })];
    const spoken: string[] = ["Correct — puzzle solved."];

    if (result.petId) {
      const petName = PET_NAMES[result.petId] ?? "a new pet";
      toasts.push(makeToast(`Pet freed: ${petName}`, "success", { petId: result.petId }));
      spoken.push(`${petName} freed.`);
    }
    if (result.stationCompleted) {
      toasts.push(makeToast("Station complete", "success", { icon: "✅" }));
      spoken.push("Station complete.");
    }
    if (result.grandCanvasUnlocked) {
      toasts.push(makeToast("Grand Canvas unlocked", "success", { icon: "🎨" }));
      spoken.push("The Grand Canvas is now unlocked.");
    }

    dispatch({ type: "SUBMIT_RESULT", toasts });
    announce(spoken.join(" "));
    setOutcome({ kind: "solved", result });
  };

  const handleFailed = (diagnosis: FailureDiagnosis): void => {
    setOutcome({ kind: "failed", diagnosis });
  };

  const continueAfterSolve = (result: SubmitSuccess): void => {
    if (result.grandCanvasUnlocked) {
      navigate({ view: "grand-canvas" });
    } else if (result.stationCompleted && result.nextStationId) {
      navigate({ view: "station", stationId: result.nextStationId });
    } else {
      navigate(backRoute);
    }
  };

  if (!puzzle) {
    return (
      <section className="screen">
        <Heading level={1}>Puzzle</Heading>
        <Button variant="ghost" onClick={() => navigate(backRoute)}>
          Back
        </Button>
      </section>
    );
  }

  return (
    <section className="screen puzzle-stage">
      <Heading level={1}>{puzzle.title}</Heading>
      <div className="screen__actions">
        <Button variant="ghost" onClick={() => navigate(backRoute)}>
          Back
        </Button>
        <Button variant="ghost" onClick={openInfo}>
          How this works
        </Button>
      </div>

      {practice ? <p role="status">Practice mode — this puzzle is already solved.</p> : null}

      {stage === "intro" ? (
        <LearningIntro
          puzzleId={puzzleId}
          onStartQuiz={() => dispatchStage({ type: "START_QUIZ" })}
          onOpenInfo={openInfo}
        />
      ) : null}

      {stage === "quiz" ? (
        <LearningQuiz
          puzzleId={puzzleId}
          onBack={() => dispatchStage({ type: "BACK_TO_INTRO" })}
          onOpenInfo={openInfo}
          announce={announce}
          onPass={() => {
            actions.recordQuizPass(puzzleId);
            dispatch({
              type: "PUSH_TOAST",
              toast: makeToast("Quiz passed — puzzle unlocked", "success", { icon: "📘" }),
            });
            dispatchStage({ type: "TO_SOLVE" });
          }}
        />
      ) : null}

      {stage === "solve" && outcome.kind !== "solved" ? (
        <PuzzlePlayer
          key={practice ? "practice" : "play"}
          puzzleId={puzzleId}
          disabled={false}
          practice={practice}
          onSolved={handleSolved}
          onFailed={handleFailed}
        />
      ) : null}

      {outcome.kind === "failed" ? (
        <ResultPanel
          diagnosis={outcome.diagnosis}
          onRetry={() => setOutcome({ kind: "idle" })}
        />
      ) : null}

      {outcome.kind === "solved" ? (
        <RewardReveal
          petId={outcome.result.petId}
          petName={outcome.result.petId ? PET_NAMES[outcome.result.petId] ?? "New pet" : null}
          scoreReason={outcome.result.scoreEvent.reason}
          reducedMotion={reducedMotion}
          onContinue={() => continueAfterSolve(outcome.result)}
        />
      ) : null}
    </section>
  );
}

/** Memoised: the app shell re-renders on every HUD/progress change (T106). */
export const PuzzleScreen = memo(PuzzleScreenImpl);
