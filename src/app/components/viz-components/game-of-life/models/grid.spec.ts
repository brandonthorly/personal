import {async, TestBed} from '@angular/core/testing';
import {ICoordinates} from '../../shared/coordinate.interface';
import {Grid} from './grid';

fdescribe('GameOfLifeComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Grid ]
    });
  }));

  beforeEach(() => { });

  it('should throw an error if width or height of grid is less than or equal to zero', () => {
    const expectedError = new RangeError('Grid width and height must be above zero');

    expect(() => new Grid(0, 1)).toThrow(expectedError);
    expect(() => new Grid(1, 0)).toThrow(expectedError);
    expect(() => new Grid(0, 0)).toThrow(expectedError);
    expect(() => new Grid(-1, 1)).toThrow(expectedError);
    expect(() => new Grid(1, -1)).toThrow(expectedError);
    expect(() => new Grid(-1, -1)).toThrow(expectedError);
  });

  it('should initialize a grid of all dead cells if "initializeLiving" arg is not true', () => {
    const grid = new Grid(10, 5);

    const livingCell = grid.getFlattenedMatrix().find(c => c.alive);

    expect(livingCell).toBe(void(0));

    const matrix = (grid as any)._matrix;

    expect(matrix.length).toBe(5);

    for (const row of matrix) {
      expect(row.length).toBe(10);
    }
  });

  it('should initialize a grid with living cells if "initializeLiving" arg is true', () => {
    const grid = new Grid(5, 10, true);

    const livingCell = grid.getFlattenedMatrix().find(c => c.alive);

    expect(livingCell).toBeTruthy();

    const matrix = (grid as any)._matrix;

    expect(matrix.length).toBe(10);

    for (const row of matrix) {
      expect(row.length).toBe(5);
    }
  });

  it('should return get live neighbor count ALL ALIVE', () => {
    /*
         OOO     C = target cell
         OCO     O = living
         OOO     X = dead
    */
    const grid = new Grid(3, 3);

    populateGrid(grid, [], true);

    const targetCell = grid.getCell({x: 1, y: 1});
    const livingNeighborCount = (grid as any)._getLivingNeighborCount(targetCell);

    expect(livingNeighborCount).toBe(8);
  });

  it('should return get live neighbor count CORNERS', () => {
    /*
         OXO     C = target cell
         XCX     O = living
         OXO     X = dead
    */
    const livingCoordinates: ICoordinates[] = [{x: 0, y: 0}, {x: 0, y: 2}, {x: 2, y: 0}, {x: 2, y: 2}];
    const grid = new Grid(3, 3);

    populateGrid(grid, livingCoordinates);

    const targetCell = grid.getCell({x: 1, y: 1});
    const livingNeighborCount = (grid as any)._getLivingNeighborCount(targetCell);

    expect(livingNeighborCount).toBe(4);
  });

  it('should return get live neighbor count SIDES', () => {
    /*
         XOX     C = target cell
         OCO     O = living
         XOX     X = dead
    */
    const livingCoordinates: ICoordinates[] = [{x: 0, y: 1}, {x: 1, y: 0}, {x: 1, y: 2}, {x: 2, y: 1}];
    const grid = new Grid(3, 3);

    populateGrid(grid, livingCoordinates);

    const targetCell = grid.getCell({x: 1, y: 1});
    const livingNeighborCount = (grid as any)._getLivingNeighborCount(targetCell);

    expect(livingNeighborCount).toBe(4);
  });

  it('should return get live neighbor count ALL LIVING corner bound target', () => {
    /*
         COO     C = target cell
         OOO     O = living
         OOO     X = dead
    */
    const grid = new Grid(3, 3);

    populateGrid(grid, [], true);

    const targetCell = grid.getCell({x: 0, y: 0});
    const livingNeighborCount = (grid as any)._getLivingNeighborCount(targetCell);

    expect(livingNeighborCount).toBe(3);
  });

  it('should return get live neighbor count ALL LIVING side bound target', () => {
    /*
         OOO     C = target cell
         COO     O = living
         OOO     X = dead
    */
    const grid = new Grid(3, 3);

    populateGrid(grid, [], true);

    const targetCell = grid.getCell({x: 0, y: 1});
    const livingNeighborCount = (grid as any)._getLivingNeighborCount(targetCell);

    expect(livingNeighborCount).toBe(5);
  });

  it('should return get live neighbor count NO LIVING center bound target', () => {
    /*
         XXX     C = target cell
         XCX     O = living
         XXX     X = dead
    */
    const grid = new Grid(3, 3);

    populateGrid(grid, [{x: 1, y: 1}]);

    const targetCell = grid.getCell({x: 1, y: 1});
    const livingNeighborCount = (grid as any)._getLivingNeighborCount(targetCell);

    expect(livingNeighborCount).toBe(0);
  });

  it('should return get live neighbor count NO LIVING corner bound target', () => {
    /*
         CXX     C = target cell
         XXX     O = living
         XXX     X = dead
    */
    const grid = new Grid(3, 3);

    populateGrid(grid, [{x: 0, y: 0}]);

    const targetCell = grid.getCell({x: 0, y: 0});
    const livingNeighborCount = (grid as any)._getLivingNeighborCount(targetCell);

    expect(livingNeighborCount).toBe(0);
  });

  it('should return get live neighbor count NO LIVING corner bound target', () => {
    /*
         XXX     C = target cell
         CCX     O = living
         XXX     X = dead
    */
    const grid = new Grid(3, 3);

    populateGrid(grid, [{x: 0, y: 1}]);

    const targetCell = grid.getCell({x: 0, y: 1});
    const livingNeighborCount = (grid as any)._getLivingNeighborCount(targetCell);

    expect(livingNeighborCount).toBe(0);
  });

  it('should determine living cell alive state correctly', () => {
    const grid = new Grid(3, 3);

    const alive0 = (grid as any)._liveCellPredicate(0);
    const alive1 = (grid as any)._liveCellPredicate(1);
    const alive2 = (grid as any)._liveCellPredicate(2);
    const alive3 = (grid as any)._liveCellPredicate(3);
    const alive4 = (grid as any)._liveCellPredicate(4);
    const alive100 = (grid as any)._liveCellPredicate(100);

    expect(alive0).toBeFalse();
    expect(alive1).toBeFalse();
    expect(alive2).toBeTrue();
    expect(alive3).toBeTrue();
    expect(alive4).toBeFalse();
    expect(alive100).toBeFalse();
  });

  it('should determine dead cell alive state correctly', () => {
    const grid = new Grid(3, 3);

    const alive0 = (grid as any)._deadCellPredicate(0);
    const alive1 = (grid as any)._deadCellPredicate(1);
    const alive2 = (grid as any)._deadCellPredicate(2);
    const alive3 = (grid as any)._deadCellPredicate(3);
    const alive4 = (grid as any)._deadCellPredicate(4);
    const alive100 = (grid as any)._deadCellPredicate(100);

    expect(alive0).toBeFalse();
    expect(alive1).toBeFalse();
    expect(alive2).toBeFalse();
    expect(alive3).toBeTrue();
    expect(alive4).toBeFalse();
    expect(alive100).toBeFalse();
  });

  // -------------------------- HELPERS -------------------------- //

  function populateGrid(grid: Grid, livingCoordinates: ICoordinates[] = [], allAlive = false): void {
    (grid as any)._matrix.forEach(row => {
      row.forEach(cell => {
        const cellCoords = cell.coordinates;

        if (allAlive) {
          cell.alive = true;
        } else {
          const alive = livingCoordinates.find(c => c.x === cellCoords.x && c.y === cellCoords.y);
          if (alive) {
            cell.alive = true;
          }
        }
      });
    });
  }
});
