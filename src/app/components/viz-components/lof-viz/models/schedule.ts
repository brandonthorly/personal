import {getRandomIntInRange} from '../../shared/random-int-in-range';
import {STATIONS} from '../constant';
import {Flight} from './flight';
import {Rotation} from './rotation';


export class Schedule {
  private _startDate: Date;
  private _endDate: Date;
  private _lofs: { [key: string]: Flight[] };

  constructor(startDate?: Date, endDate?: Date, lofs?: { [key: string]: Flight[] }) {
    if (startDate) {
      this._startDate = startDate;
    } else {
      const start = new Date();
      this._startDate = new Date(start.setHours(6, 0, 0, 0));
    }

    this._endDate = endDate || new Date(new Date(this._startDate).setDate(this._startDate.getDate() + 10));

    if (lofs) {
      this._lofs = lofs;
    } else {
      this.generateRandomSchedule();
    }
  }

  public get startDate(): Date {
    return this._startDate;
  }

  public get endDate(): Date {
    return this._endDate;
  }

  public get lofs(): { [key: string]: Flight[] } {
    return this._lofs;
  }

  private generateRandomSchedule(aircraftCount: number = 15): void {
    this._lofs = {};

    for (let i = 0; i < aircraftCount; i++) {
      const lof: Flight[] = [];
      const acId = i;

      const randomStartOffset = getRandomIntInRange(-30, 30);
      let startGMT = this.addMinutes(this._startDate, randomStartOffset);
      let previousInGMT: Date = void(0);

      const rotation = new Rotation(this.getRandomStations());
      let stationNode = rotation.head;

      while (startGMT < this._endDate) {
        const flightId = `FL${getRandomIntInRange(100, 999)}`;
        const origin = stationNode.station;
        const destination = stationNode.next.station;
        const outGMT = new Date(startGMT);
        const inGMT = this.addMinutes(outGMT, this.getRandomFlightMinutes());


        startGMT = this.addMinutes(inGMT, this.getRandomStationMinutes());
        const currentHour = startGMT.getHours();
        if (currentHour > 20 || currentHour < 5) {
          if (currentHour <= 24 && currentHour >= 5) {
            startGMT.setDate(startGMT.getDate() + 1);
          }
          startGMT.setHours(6);
        }

        const nextOutGMT = new Date(startGMT);

        lof.push(new Flight(acId, flightId, outGMT, inGMT, origin, destination, previousInGMT, nextOutGMT));

        previousInGMT = inGMT;
        stationNode = stationNode.next;
      }

      this._lofs[acId] = lof;
    }
  }

  private getRandomStations(): string[] {
    const stations = [...STATIONS];
    const stationCount = getRandomIntInRange(2, 6);

    const randomStations = [];

    for (let i = 0; i <= stationCount; i++) {
      const index = getRandomIntInRange(0, stations.length - 1);
      randomStations.push(stations.splice(index, 1));
    }

    return randomStations;
  }

  private getRandomFlightMinutes(): number {
    return getRandomIntInRange(200, 300);
  }

  private getRandomStationMinutes(): number {
    return getRandomIntInRange(45, 120);
  }

  private addMinutes(dt: Date, minutes: number): Date {
    const newDate = new Date(dt);

    return new Date(newDate.setMinutes(newDate.getMinutes() + minutes));
  }

}
