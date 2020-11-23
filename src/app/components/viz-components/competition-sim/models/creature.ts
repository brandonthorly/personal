import {ICoordinates} from '../../shared/coordinate.interface';
import {getRandomInRange} from '../../shared/random-in-range';
import {getRandomIntInRange} from '../../shared/random-int-in-range';
import {uuid} from '../../shared/simple-uuid';


export class Creature {
  private _id;
  private _alive = true;
  private _childOffsetMax: number;
  private _coordinates: ICoordinates;
  private _replicationChance: number;
  private _deathChance: number;
  private _crowdingCoefficient: number;

  private _replicationBounds = [0.01, 0.25];
  private _deathBounds = [0.01, 0.25];

  constructor(coordinates: ICoordinates = void(0),
              replicationChance = 0.1,
              deathChance = 0.05,
              crowdingCoefficient = 0.001,
              childOffsetMax = 0) {
    this._coordinates = coordinates;
    this._replicationChance = replicationChance;
    this._deathChance = deathChance;
    this._crowdingCoefficient = crowdingCoefficient;
    this._childOffsetMax = childOffsetMax;
    this._id = uuid();
  }

  get alive(): boolean {
    return this._alive;
  }

  get coordinates(): ICoordinates {
    return this._coordinates;
  }

  get replicationChance(): number {
    return this._replicationChance;
  }

  get deathChance(): number {
    return this._deathChance;
  }

  get crowdingCoefficient(): number {
    return this._crowdingCoefficient;
  }

  set coordinates(coords: ICoordinates) {
    this._coordinates = coords;
  }

  public attemptReproduction(): void | Creature {
    if (!this.alive) return;

    const draw = Math.random();

    if (draw <= this._replicationChance) {
      return new Creature(
        this.coordinates,
        this.getChildReplicationChance(),
        this.getChildDeathChance(),
        this._crowdingCoefficient,
        this._childOffsetMax
      );
    }
  }

  public attempSurvival(populationSize: number): void {
    if (!this.alive) return;

    const draw = Math.random();
    const populationAdjustedDeathChance = this._deathChance + (this._crowdingCoefficient * populationSize);

    if (draw <= populationAdjustedDeathChance) {
      this._alive = false;
    }
  }

  public move(upperX: number, upperY: number): void {
    const maxMoveDistance = 20;
    const {x, y} = this._coordinates;
    const newX = getRandomIntInRange(
      x - maxMoveDistance >= 0 ? x - maxMoveDistance : 0,
      x + maxMoveDistance <= upperX ? x + maxMoveDistance : upperX
    );
    const newY = getRandomIntInRange(
      y - maxMoveDistance >= 0 ? y - maxMoveDistance : 0,
      y + maxMoveDistance <= upperY ? y + maxMoveDistance : upperY
    );

    this._coordinates = {x: newX, y: newY};
  }

  private getChildReplicationChance(): number {
    const {low, high} = this.getNumberInBound(this._replicationChance, this._childOffsetMax, this._replicationBounds);

    return getRandomInRange(low, high);
  }

  private getChildDeathChance(): number {
    const {low, high} = this.getNumberInBound(this._deathChance, this._childOffsetMax, this._deathBounds);

    return getRandomInRange(low, high);
  }

  private getNumberInBound(start: number, offset: number, bounds: number[]): {[key: string]: number} {
    const min = bounds[0];
    const max = bounds[1];
    const low = start - offset > min ? start - offset : min;
    const high = start + offset < max ? start + offset : max;

    return {low, high};
  }
}
