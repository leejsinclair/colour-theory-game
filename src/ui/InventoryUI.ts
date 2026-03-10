import { Pet } from "../entities/Pet";

export class InventoryUI {
  renderPets(pets: Pet[]): string {
    if (pets.length === 0) {
      return "No Chromatic Pets collected yet.";
    }

    return pets.map((pet) => `- ${pet.name}`).join("\n");
  }

  renderCompletion(collected: number, total: number): string {
    const percent = Math.round((collected / Math.max(1, total)) * 100);
    return `Collection: ${collected}/${total} (${percent}%)`;
  }
}
