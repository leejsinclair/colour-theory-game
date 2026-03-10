import { PetType } from "../types/gameTypes";

export interface PetBehavior {
  idle(): string;
  wander(): string;
  reactToColor(color: string): string;
  interactWithPlayer(): string;
}

export class DefaultPetBehavior implements PetBehavior {
  constructor(private readonly petName: string) {}

  idle(): string {
    return `${this.petName} is idling in the studio.`;
  }

  wander(): string {
    return `${this.petName} wanders around its favorite station.`;
  }

  reactToColor(color: string): string {
    return `${this.petName} reacts to ${color} tones.`;
  }

  interactWithPlayer(): string {
    return `${this.petName} chirps happily at the player.`;
  }
}

export class Pet {
  public unlocked: boolean;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: PetType,
    public readonly sprite: string,
    public readonly behavior: PetBehavior,
    unlocked = false,
  ) {
    this.unlocked = unlocked;
  }

  unlock(): void {
    this.unlocked = true;
  }
}
