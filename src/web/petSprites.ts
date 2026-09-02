export const PET_SPRITE_HREF = "assets/pets/pets.png";
export const PET_SPRITE_NATURAL_WIDTH = 680;
export const PET_SPRITE_NATURAL_HEIGHT = 386;

/** Sprite centres in the 680x386 pets sprite viewBox. */
export const PET_SPRITE_CENTRES: Record<string, { cx: number; cy: number }> = {
  "pet-01": { cx: 48, cy: 62 },
  "pet-02": { cx: 145, cy: 62 },
  "pet-03": { cx: 243, cy: 62 },
  "pet-04": { cx: 340, cy: 62 },
  "pet-05": { cx: 437, cy: 62 },
  "pet-06": { cx: 535, cy: 62 },
  "pet-07": { cx: 632, cy: 62 },
  "pet-08": { cx: 48, cy: 182 },
  "pet-09": { cx: 145, cy: 182 },
  "pet-10": { cx: 243, cy: 182 },
  "pet-11": { cx: 340, cy: 182 },
  "pet-12": { cx: 437, cy: 182 },
  "pet-13": { cx: 535, cy: 182 },
  "pet-14": { cx: 632, cy: 182 },
  "pet-15": { cx: 48, cy: 302 },
  "pet-16": { cx: 145, cy: 302 },
  "pet-17": { cx: 243, cy: 302 },
  "pet-18": { cx: 340, cy: 302 },
  "pet-19": { cx: 437, cy: 302 },
  "pet-20": { cx: 535, cy: 302 },
  "pet-21": { cx: 632, cy: 302 },
  // pet-22 coordinates are reserved for when the sprite is added to pets.png (row 4, col 1).
  // Until then, createPetSpriteDiv uses the standalone pet-22.svg placeholder.
  "pet-22": { cx: 48, cy: 422 },
};

/** Pets with lower extents that benefit from a larger crop. */
export const PET_SPRITE_LARGE_CROP = new Set(["pet-02", "pet-10", "pet-13"]);

/** All 22 pet IDs in order. */
export const ALL_PET_IDS = Array.from({ length: 22 }, (_, i) => `pet-${String(i + 1).padStart(2, "0")}`);

/** Pet display names for tooltips. */
export const PET_NAMES: Record<string, string> = {
  "pet-01": "Glow Sprite",
  "pet-02": "Ink Octopus",
  "pet-03": "Shadow Cat",
  "pet-04": "Shadow Mouse",
  "pet-05": "Gradient Hedgehog",
  "pet-06": "Chroma Gecko",
  "pet-07": "Prism Fox",
  "pet-08": "Palette Parrot",
  "pet-09": "Mood Bat",
  "pet-10": "Chameleon Lizard",
  "pet-11": "Contrast Frog",
  "pet-12": "Neutral Turtle",
  "pet-13": "Sky Jelly",
  "pet-14": "Air Sprite",
  "pet-15": "Sun Finch",
  "pet-16": "Paint Slime",
  "pet-17": "Mud Blob",
  "pet-18": "Dot Bee",
  "pet-19": "Harmony Dove",
  "pet-20": "Empathy Moth",
  "pet-21": "Vibration Hummingbird",
  "pet-22": "Constancy Chameleon",
};

export type PetSpriteDescriptor = {
  id: string;
  name: string;
  /** Inline style props for a `<div>`/`<span>` sprite tile — the React path (T030, data-model §1). */
  style: {
    backgroundImage: string;
    backgroundRepeat: "no-repeat";
    backgroundSize: string;
    backgroundPosition: string;
  };
  /** Accessible label for the sprite element (`role="img"`). */
  ariaLabel: string;
};

/**
 * React-friendly counterpart to `createPetSpriteDiv` — returns the same sprite
 * crop as inline style props for `<PetBadge>` (T030). The DOM builder stays for
 * the legacy shell until it is retired.
 */
export function getPetSprite(
  petId: string,
  collected: boolean,
  options: { includeLabel?: boolean } = {},
): PetSpriteDescriptor {
  const name = PET_NAMES[petId] ?? petId;
  const ariaLabel = `${name}${collected ? " (collected)" : ""}`;
  const includeLabel = options.includeLabel ?? false;

  if (petId === "pet-22") {
    return {
      id: petId,
      name,
      ariaLabel,
      style: {
        backgroundImage: "url(assets/pets/pet-22.svg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: `center ${includeLabel ? "4px" : "center"}`,
      },
    };
  }

  const centre = PET_SPRITE_CENTRES[petId] ?? { cx: 48, cy: 62 };
  const cropHalf = PET_SPRITE_LARGE_CROP.has(petId) ? 44 : 40;
  const cropWidth = cropHalf * 2;
  const cropHeight = cropWidth + (includeLabel ? 24 : 0);
  const cropX = centre.cx - cropHalf;
  const cropY = centre.cy - cropHalf;
  const scaleX = PET_SPRITE_NATURAL_WIDTH / cropWidth;
  const scaleY = PET_SPRITE_NATURAL_HEIGHT / cropHeight;
  const posX = ((-cropX / cropWidth) / (1 - scaleX)) * 100;
  const posY = ((-cropY / cropHeight) / (1 - scaleY)) * 100;

  return {
    id: petId,
    name,
    ariaLabel,
    style: {
      backgroundImage: `url(${PET_SPRITE_HREF})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${scaleX * 100}% ${scaleY * 100}%`,
      backgroundPosition: `${posX}% ${posY}%`,
    },
  };
}

/** Build a CSS-sprite div for one pet slot. */
export function createPetSpriteDiv(
  petId: string,
  collected: boolean,
  options: { includeLabel?: boolean } = {},
): HTMLDivElement {
  const sprite = document.createElement("div");
  const centre = PET_SPRITE_CENTRES[petId] ?? { cx: 48, cy: 62 };
  const includeLabel = options.includeLabel ?? true;
  const cropHalf = PET_SPRITE_LARGE_CROP.has(petId) ? 44 : 40;
  const cropWidth = cropHalf * 2;
  const cropHeight = cropWidth + (includeLabel ? 24 : 0);

  sprite.className = "pet-sprite";
  if (!collected) {
    sprite.classList.add("pet-sprite--locked");
  }
  sprite.setAttribute("role", "img");
  sprite.setAttribute("aria-label", `${PET_NAMES[petId] ?? petId}${collected ? " (collected)" : ""}`);
  sprite.style.backgroundColor = collected ? "#ffffff" : "#d8dbe3";

  // pet-22 uses a standalone SVG placeholder until its sprite is added to pets.png.
  if (petId === "pet-22") {
    sprite.style.backgroundImage = "url(assets/pets/pet-22.svg)";
    sprite.style.backgroundRepeat = "no-repeat";
    sprite.style.backgroundSize = "contain";
    sprite.style.backgroundPosition = `center ${includeLabel ? "4px" : "center"}`;
    return sprite;
  }

  const cropX = centre.cx - cropHalf;
  const cropY = centre.cy - cropHalf;
  const scaleX = PET_SPRITE_NATURAL_WIDTH / cropWidth;
  const scaleY = PET_SPRITE_NATURAL_HEIGHT / cropHeight;
  // Position based on crop rectangle origin so labels remain in frame.
  const posX = ((-cropX / cropWidth) / (1 - scaleX)) * 100;
  const posY = ((-cropY / cropHeight) / (1 - scaleY)) * 100;

  sprite.style.backgroundImage = `url(${PET_SPRITE_HREF})`;
  sprite.style.backgroundRepeat = "no-repeat";
  sprite.style.backgroundSize = `${scaleX * 100}% ${scaleY * 100}%`;
  sprite.style.backgroundPosition = `${posX}% ${posY}%`;
  sprite.style.backgroundColor = collected ? "#ffffff" : "#d8dbe3";

  return sprite;
}
