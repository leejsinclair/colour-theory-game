import { memo, useReducer, useState, type ReactElement } from "react";
import { Button, Heading, announce } from "../design-system";
import { usePuzzle, useStation, useStations } from "../state/selectors";
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
  const station = useStation(stationId);
  const stations = useStations();
  const actions = useGameActions();
  const { state: session, dispatch } = useSession();
  const { navigate } = useHashRoute();
  const reducedMotion = useReducedMotion();

  const practice = session.practicePuzzleId === puzzleId;
  const gated = Boolean(puzzle?.learningRequired) && !practice;

  const [stage, dispatchStage] = useReducer(stageReducer, gated ? "intro" : "solve");
  // If the gate has cleared (quiz recorded, puzzle solved elsewhere), solve is
  // the only valid stage regardless of internal intro/quiz progress.
  const effectiveStage: Stage = gated ? stage : "solve";
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });

  const openInfo = (): void => dispatch({ type: "OPEN_INFO", puzzleId });

  const backRoute: Route = { view: "station", stationId };

  const handleSolved = (result: SubmitSuccess): void => {
    if (result.alreadySolved) {
      // Reached a solved, non-practice puzzle directly (e.g. browser Back) —
      // nothing new to celebrate, so just return to the station.
      navigate(backRoute);
      return;
    }

    if (practice) {
      announce(`Practice solved. ${result.scoreEvent.reason}`);
      setOutcome({ kind: "solved", result });
      return;
    }

    // One composed live-region message — the full-screen RewardReveal carries
    // the visual celebration, so no toasts here (they used to stack behind it).
    // Separate announce() calls would each overwrite the previous before a
    // screen reader could read it (FR-036, T087).
    const spoken: string[] = ["Correct — puzzle solved."];

    if (result.petId) {
      const petName = PET_NAMES[result.petId] ?? "a new pet";
      spoken.push(`${petName} freed.`);
    }
    if (result.stationCompleted) {
      spoken.push("Station complete.");
    }
    if (result.grandCanvasUnlocked) {
      spoken.push("The Grand Canvas is now unlocked.");
    }

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

  const destinationFor = (result: SubmitSuccess): string => {
    if (result.grandCanvasUnlocked) {
      return "the Grand Canvas";
    }
    if (result.stationCompleted && result.nextStationId) {
      return stations.find((s) => s.id === result.nextStationId)?.name ?? "the next station";
    }
    return station?.name ?? "the studio";
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

      {effectiveStage === "intro" ? (
        <LearningIntro
          puzzleId={puzzleId}
          onStartQuiz={() => dispatchStage({ type: "START_QUIZ" })}
        />
      ) : null}

      {effectiveStage === "quiz" ? (
        <LearningQuiz
          puzzleId={puzzleId}
          onBack={() => dispatchStage({ type: "BACK_TO_INTRO" })}
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

      {effectiveStage === "solve" && outcome.kind !== "solved" ? (
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
          points={outcome.result.scoreEvent.delta}
          scoreReason={outcome.result.scoreEvent.reason}
          reducedMotion={reducedMotion}
          destinationLabel={practice ? (station?.name ?? "the studio") : destinationFor(outcome.result)}
          autoReturnSeconds={9}
          continueLabel={practice ? "Try a different puzzle" : "Continue"}
          onContinue={() => (practice ? navigate(backRoute) : continueAfterSolve(outcome.result))}
          onStay={practice ? () => setOutcome({ kind: "idle" }) : undefined}
        />
      ) : null}
    </section>
  );
}

/** Memoised: the app shell re-renders on every HUD/progress change (T106). */
export const PuzzleScreen = memo(PuzzleScreenImpl);
