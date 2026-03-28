export enum SceneType {
  StudioScene = "StudioScene",
  PuzzleScene = "PuzzleScene",
  FinalCanvasScene = "FinalCanvasScene",
}

export enum PuzzleState {
  Locked = "locked",
  Available = "available",
  InProgress = "in_progress",
  Solved = "solved",
}

export enum PuzzleType {
  RGB_LIGHT = "RGB_LIGHT",
  CMY_PRINT = "CMY_PRINT",
  CHROMATIC_BLACK = "CHROMATIC_BLACK",
  VALUE_PAINT = "VALUE_PAINT",
  VALUE_SORT = "VALUE_SORT",
  CHROMA_TREE = "CHROMA_TREE",
  COLOR_COMPLEMENT = "COLOR_COMPLEMENT",
  COLOR_TRIAD = "COLOR_TRIAD",
  MOOD_PALETTE = "MOOD_PALETTE",
  SQUARE_ILLUSION = "SQUARE_ILLUSION",
  GREY_SHIFT = "GREY_SHIFT",
  NEUTRAL_POP = "NEUTRAL_POP",
  LANDSCAPE_DEPTH = "LANDSCAPE_DEPTH",
  RAYLEIGH_SCATTER = "RAYLEIGH_SCATTER",
  TIME_OF_DAY = "TIME_OF_DAY",
  PIGMENT_MIX = "PIGMENT_MIX",
  MUD_PREVENTION = "MUD_PREVENTION",
  POINTILLISM = "POINTILLISM",
  COLOR_BALANCE = "COLOR_BALANCE",
  COLOR_PSYCHOLOGY = "COLOR_PSYCHOLOGY",
  COLOR_VIBRATION = "COLOR_VIBRATION",
  COLOR_CONSTANCY = "COLOR_CONSTANCY",
}

export enum StationType {
  LightLaboratory = "LightLaboratory",
  ValueSketchboard = "ValueSketchboard",
  ColorWheelTable = "ColorWheelTable",
  OpticalIllusionWall = "OpticalIllusionWall",
  WindowLandscape = "WindowLandscape",
  PaintWorkbench = "PaintWorkbench",
  DesignStudio = "DesignStudio",
}

export enum PetType {
  GlowSprite = "GlowSprite",
  InkOctopus = "InkOctopus",
  ShadowCat = "ShadowCat",
  ShadowMouse = "ShadowMouse",
  GradientHedgehog = "GradientHedgehog",
  ChromaGecko = "ChromaGecko",
  PrismFox = "PrismFox",
  PaletteParrot = "PaletteParrot",
  MoodBat = "MoodBat",
  ChameleonLizard = "ChameleonLizard",
  ContrastFrog = "ContrastFrog",
  NeutralTurtle = "NeutralTurtle",
  SkyJelly = "SkyJelly",
  AirSprite = "AirSprite",
  SunFinch = "SunFinch",
  PaintSlime = "PaintSlime",
  MudBlob = "MudBlob",
  DotBee = "DotBee",
  HarmonyDove = "HarmonyDove",
  EmpathyMoth = "EmpathyMoth",
  VibrationHummingbird = "VibrationHummingbird",
  ConstancyChameleon = "ConstancyChameleon",
}

export type Vec2 = {
  x: number;
  y: number;
};
