import { Vec2 } from "../types/gameTypes";

export class Player {
  public collectedPets: string[] = [];

  constructor(public position: Vec2, public interactionRange: number) {}

  addPet(petId: string): void {
    if (!this.collectedPets.includes(petId)) {
      this.collectedPets.push(petId);
    }
  }
}
