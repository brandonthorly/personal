import {Cell} from './cell';
import {ICoordinates, INeighborBounds} from '../../shared/coordinate.interface';

export class Grid {
  private _width: number;
  private _height: number;
  private _matrix: Cell[][];

  private _smallStarts: ICoordinates[][] = [
    [{x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}],
    [{x: 2, y: 1}, {x: 3, y: 1}, {x: 4, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}],
    [{x: 1, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 3}, {x: 3, y: 4}, {x: 4, y: 4}],
  ];

  private _bigStarts: ICoordinates[][] = [
    // Gosper glider gun
    [{x: 1, y: 5}, {x: 2, y: 5}, {x: 1, y: 6}, {x: 2, y: 6}, {x: 11, y: 5}, {x: 11, y: 6}, {x: 11, y: 7}, {x: 12, y: 4},
      {x: 12, y: 8}, {x: 13, y: 3}, {x: 13, y: 9}, {x: 14, y: 3}, {x: 14, y: 9}, {x: 15, y: 6}, {x: 16, y: 4},
      {x: 16, y: 8}, {x: 17, y: 5}, {x: 17, y: 6}, {x: 17, y: 7}, {x: 18, y: 6}, {x: 21, y: 3}, {x: 21, y: 4},
      {x: 21, y: 5}, {x: 22, y: 3}, {x: 22, y: 4}, {x: 22, y: 5}, {x: 23, y: 2}, {x: 23, y: 6}, {x: 25, y: 1},
      {x: 25, y: 2}, {x: 25, y: 6}, {x: 25, y: 7}, {x: 35, y: 3}, {x: 35, y: 4}, {x: 36, y: 3}, {x: 36, y: 4}],
    // Simkin glider gun
    [{x: 4, y: 18}, {x: 4, y: 19}, {x: 5, y: 18}, {x: 5, y: 19}, {x: 8, y: 21}, {x: 8, y: 22}, {x: 9, y: 21},
     {x: 9, y: 22}, {x: 11, y: 18}, {x: 11, y: 19}, {x: 12, y: 18}, {x: 12, y: 19}, {x: 24, y: 29}, {x: 25, y: 28},
     {x: 25, y: 29}, {x: 25, y: 30}, {x: 26, y: 27}, {x: 26, y: 30}, {x: 26, y: 31}, {x: 30, y: 27}, {x: 30, y: 28},
     {x: 31, y: 28}, {x: 31, y: 29}, {x: 31, y: 30}, {x: 32, y: 29}, {x: 35, y: 29}, {x: 35, y: 30}, {x: 36, y: 29},
     {x: 36, y: 30}],
  ];


  constructor(width: number = 50, height: number = 50, initializeLiving = false) {
    if (width <= 0 || height <= 0) {
      throw new RangeError('Grid width and height must be above zero');
    }

    this._width = width;
    this._height = height;
    this._initializeMatrix(initializeLiving);
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  public getFlattenedMatrix(): Cell[] {
    return [].concat(...this._matrix);
  }

  public setCell(cell: Cell): void {
    const {x, y} = cell.coordinates;

    try {
      this._matrix[y][x] = cell;

    } catch (e) {
      console.error(`No cell found at coordinates: ${x}, ${y}`);
    }
  }

  public getCell(coordinates: ICoordinates): Cell {
    const {x, y} = coordinates;

    try {
      return this._matrix[y][x];

    } catch (e) {
      console.error(`No cell found at coordinates: ${x}, ${y}`);
    }
  }

  public updateGrid(): void {
    const newMatrix = [];

    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];

      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell({x, y});
        const liveNeighborCount = this._getLivingNeighborCount(cell);

        let isAlive = false;

        if (cell.alive) {
          isAlive = this._liveCellPredicate(liveNeighborCount);
        } else {
          isAlive = this._deadCellPredicate(liveNeighborCount);
        }

        row.push(new Cell({x, y}, isAlive));
      }

      newMatrix.push(row);
    }

    this._matrix = newMatrix;
  }

  private _initializeMatrix(initializeLiving = false): void {
    let initialLivingCoordinates: ICoordinates[] = void (0);

    if (initializeLiving) {
      const startSamples = this.width < 40 && this.height < 40 ? this._smallStarts : this._bigStarts;
      const randomIndex = Math.floor(Math.random() * Math.floor(startSamples.length));

      initialLivingCoordinates = startSamples[randomIndex];
    }

    this._matrix = [];

    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];

      for (let x = 0; x < this.width; x++) {
        const alive = initialLivingCoordinates && !!initialLivingCoordinates.find(c => c.x === x && c.y === y);

        row.push(new Cell({x, y}, alive));
      }

      this._matrix.push(row);
    }
  }

  private _liveCellPredicate(livingNeighborCount: number): boolean {
    return 2 <= livingNeighborCount && livingNeighborCount <= 3;
  }

  private _deadCellPredicate(livingNeighborCount: number): boolean {
    return livingNeighborCount === 3;
  }

  private _getLivingNeighborCount(cell: Cell): number {
    const {lowX, highX, lowY, highY} = this._getNeighborBounds(cell);
    let livingNeighborCount = 0;

    for (let x = lowX; x <= highX; x++) {
      for (let y = lowY; y <= highY; y++) {
        if (!(x === cell.coordinates.x && y === cell.coordinates.y) && this.getCell({x, y}).alive) {
          livingNeighborCount++;
        }
      }
    }

    return livingNeighborCount;
  }

  private _getNeighborBounds(cell: Cell): INeighborBounds {
    const coordinates: ICoordinates = cell.coordinates;
    const lowX: number = coordinates.x > 0 ? coordinates.x - 1 : 0;
    const highX: number = coordinates.x < this.width - 1 ? coordinates.x + 1 : this.width - 1;
    const lowY: number = coordinates.y > 0 ? coordinates.y - 1 : 0;
    const highY: number = coordinates.y < this.height - 1 ? coordinates.y + 1 : this.height - 1;

    return {lowX, highX, lowY, highY};
  }
}
