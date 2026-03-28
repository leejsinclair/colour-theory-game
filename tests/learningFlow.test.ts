import { describe, expect, test } from "vitest";
import { evaluateLearningQuiz } from "../src/web/legacy/learningFlow";

describe("evaluateLearningQuiz", () => {
  test("returns passed with perfect score", () => {
    const questions = [
      { prompt: "q1", options: ["a", "b"], correctIndex: 0, explanation: "e1" },
      { prompt: "q2", options: ["a", "b"], correctIndex: 1, explanation: "e2" },
    ];

    const result = evaluateLearningQuiz(questions, [0, 1]);

    expect(result).toEqual({
      passed: true,
      score: 2,
      outOf: 2,
      feedback: "Perfect score: 2/2. Puzzle unlocked.",
    });
  });

  test("returns failed when any answer is incorrect", () => {
    const questions = [
      { prompt: "q1", options: ["a", "b"], correctIndex: 0, explanation: "e1" },
      { prompt: "q2", options: ["a", "b"], correctIndex: 1, explanation: "e2" },
      { prompt: "q3", options: ["a", "b"], correctIndex: 1, explanation: "e3" },
    ];

    const result = evaluateLearningQuiz(questions, [0, 0, 1]);

    expect(result.passed).toBe(false);
    expect(result.score).toBe(2);
    expect(result.outOf).toBe(3);
    expect(result.feedback).toBe("Score 2/3. You need 100% to unlock this puzzle.");
  });
});
