import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getDemoSolution } from "./content/demoSolutions";
import { Game } from "./game/Game";

function printHelp(): void {
  console.log("\nCommands:");
  console.log("  help                Show commands");
  console.log("  status              Show game progress and current scene");
  console.log("  list                Show all puzzles with state");
  console.log("  solve <puzzle-id>   Submit a known-valid demo solution");
  console.log("  auto                Solve all puzzles using demo inputs");
  console.log("  exit                Quit\n");
}

async function runCli(): Promise<void> {
  const game = new Game();
  game.initialize();

  const rl = createInterface({ input, output });
  console.log("Chromatic Mastery CLI Prototype");
  printHelp();

  while (true) {
    const raw = (await rl.question("> ")).trim();
    const [command, arg] = raw.split(/\s+/, 2);

    if (!command) {
      continue;
    }

    if (command === "exit") {
      rl.close();
      return;
    }

    if (command === "help") {
      printHelp();
      continue;
    }

    if (command === "status") {
      const progress = game.getProgress();
      console.log(progress);
      console.log(`Scene: ${game.sceneManager.getCurrentScene()}`);
      if (progress.finalCanvasUnlocked) {
        console.log(game.getFinalCanvasPrompt());
      }
      continue;
    }

    if (command === "list") {
      const puzzles = game.stationManager
        .getAllStations()
        .flatMap((station) => station.puzzles)
        .map((puzzle) => `${puzzle.id} | ${puzzle.title} | ${puzzle.state}`);
      console.log(puzzles.join("\n"));
      continue;
    }

    if (command === "solve") {
      if (!arg) {
        console.log("Usage: solve <puzzle-id>");
        continue;
      }

      const solved = game.completePuzzle(arg, getDemoSolution(arg));
      if (!solved) {
        console.log(`Could not solve ${arg}. It may be locked, invalid, or already solved.`);
      } else {
        console.log(`Solved ${arg}.`);
      }
      continue;
    }

    if (command === "auto") {
      const totalPuzzles = game.getProgress().total;
      for (let i = 1; i <= totalPuzzles; i += 1) {
        const puzzleId = `puzzle-${String(i).padStart(2, "0")}`;
        game.completePuzzle(puzzleId, getDemoSolution(puzzleId));
      }
      console.log("Auto-solve complete.");
      continue;
    }

    console.log("Unknown command. Use `help`.");
  }
}

runCli().catch((error: unknown) => {
  console.error("CLI error:", error);
  process.exitCode = 1;
});
