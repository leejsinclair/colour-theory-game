import { Game } from "./game/Game";

const game = new Game();
game.initialize();

console.log("Chromatic Mastery initialized.");
console.log("Use `npm run play` to launch the CLI prototype.");
console.log(game.getProgress());
