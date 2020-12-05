import {ICoordinates} from '../../shared/coordinate.interface';

export class Cell {
  private _alive: boolean;
  private _coordinates: ICoordinates;

  constructor(coordinates: ICoordinates, isAlive: boolean = false) {
    this._alive = isAlive;
    this._coordinates = coordinates;
  }

  set alive(isAlive: boolean) {
    this._alive = isAlive;
  }

  get alive(): boolean {
    return this._alive;
  }

  get coordinates(): ICoordinates {
    return this._coordinates;
  }
}
