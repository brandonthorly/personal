export class StationNode {
  _station: string;
  _next: StationNode;

  constructor(station: string) {
    this._station = station;
  }

  public get next(): StationNode {
    return this._next;
  }

  public set next(station: StationNode) {
    this._next = station;
  }

  public get station(): string {
    return this._station;
  }
}

export class Rotation {
  private _head: StationNode;


  constructor(stations: string[]) {
    for (let i = 0; i < stations.length; i++) {
      const stationNode = new StationNode(stations[i]);

      if (!this._head) {
        this._head = stationNode;

      } else {
        let last = this._head;

        while (last.next) {
          last = last.next;
        }

        last.next = stationNode;
      }

      // last node point to head for infinite lof
      if (i === stations.length - 1) {
        stationNode.next = this._head;
      }
    }
  }

  public get head(): StationNode {
    return this._head;
  }
}
