import {getRandomIntInRange} from '../../shared/random-int-in-range';
import {Flight} from './flight';

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

    this._endDate = endDate || new Date(new Date(this._startDate).setDate(this._startDate.getDate() + 3));

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
    const defaultStations = ['ATL', 'LGA', 'SEA'];
    this._lofs = {};

    for (let i = 0; i < aircraftCount; i++) {
      const lof: Flight[] = [];
      const acId = i;

      const randomStartOffset = getRandomIntInRange(-30, 30);
      let startGMT = this.addMinutes(this._startDate, randomStartOffset);
      let previousInGMT: Date = void(0);

      while (startGMT < this._endDate) {
        const flightId = `FL${getRandomIntInRange(100, 999)}`;
        const origin = defaultStations[i % defaultStations.length];
        const destination = defaultStations[(i + 1) % defaultStations.length];
        const outGMT = new Date(startGMT);
        const inGMT = this.addMinutes(outGMT, this.getRandomFlightMinutes());

        lof.push(new Flight(acId, flightId, outGMT, inGMT, origin, destination, previousInGMT));

        previousInGMT = inGMT;
        startGMT = this.addMinutes(inGMT, this.getRandomStationMinutes());
      }

      this._lofs[acId] = lof;
    }
  }

  private getRandomFlightMinutes(): number {
    return getRandomIntInRange(200, 300);
  }

  private getRandomStationMinutes(): number {
    return getRandomIntInRange(30, 120);
  }

  private addMinutes(dt: Date, minutes: number): Date {
    const newDate = new Date(dt);

    return new Date(newDate.setMinutes(newDate.getMinutes() + minutes));
  }

}
