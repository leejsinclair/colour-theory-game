import { SceneType } from "../types/gameTypes";

export class SceneManager {
  private currentScene: SceneType = SceneType.StudioScene;

  loadScene(scene: SceneType): void {
    this.currentScene = scene;
  }

  unloadScene(_scene: SceneType): void {
    // Stub for renderer/system cleanup hooks.
  }

  transitionScene(to: SceneType): void {
    const previous = this.currentScene;
    this.unloadScene(previous);
    this.loadScene(to);
  }

  getCurrentScene(): SceneType {
    return this.currentScene;
  }
}
