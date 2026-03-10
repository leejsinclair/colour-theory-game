import { Pet } from "../entities/Pet";

export class PetManager {
  private readonly pets = new Map<string, Pet>();

  registerPets(pets: Pet[]): void {
    pets.forEach((pet) => this.pets.set(pet.id, pet));
  }

  unlockPet(petId: string): Pet | null {
    const pet = this.pets.get(petId);
    if (!pet) {
      return null;
    }

    pet.unlock();
    return pet;
  }

  spawnPetAnimation(petId: string): string {
    const pet = this.pets.get(petId);
    return pet ? `Spawn animation for ${pet.name}` : `Missing pet: ${petId}`;
  }

  updateStudioPopulation(): string[] {
    return this.getUnlockedPets().map((pet) => pet.behavior.wander());
  }

  getUnlockedPets(): Pet[] {
    return [...this.pets.values()].filter((pet) => pet.unlocked);
  }
}
