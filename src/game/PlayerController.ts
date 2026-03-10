import { Player } from "../entities/Player";
import { Station } from "../entities/Station";

export class PlayerController {
  constructor(private readonly player: Player) {}

  moveTo(x: number, y: number): void {
    this.player.position = { x, y };
  }

  interactStation(station: Station): boolean {
    const dx = station.location.x - this.player.position.x;
    const dy = station.location.y - this.player.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.player.interactionRange;
  }

  inspectPuzzle(puzzleTitle: string): string {
    return `Inspecting puzzle: ${puzzleTitle}`;
  }

  collectPet(petId: string): void {
    this.player.addPet(petId);
  }
}
