import { Station } from "../entities/Station";

export class StationManager {
  private readonly stations = new Map<string, Station>();

  registerStations(stations: Station[]): void {
    stations.forEach((station) => this.stations.set(station.id, station));
  }

  unlockStation(stationId: string): boolean {
    const station = this.stations.get(stationId);
    if (!station) {
      return false;
    }

    station.unlock();
    return true;
  }

  refreshCompletion(stationId: string): void {
    const station = this.stations.get(stationId);
    if (station) {
      station.refreshCompletionState();
    }
  }

  getStation(stationId: string): Station | undefined {
    return this.stations.get(stationId);
  }

  getUnlockedStations(): Station[] {
    return [...this.stations.values()].filter((station) => station.unlocked);
  }

  getAllStations(): Station[] {
    return [...this.stations.values()];
  }
}
