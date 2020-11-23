export class Flight {
  _acId: number;
  _flightId: string;
  _outGMT: Date;
  _inGMT: Date;
  _origin: string;
  _destination: string;
  _previousInGMT: Date;

  constructor(acId: number, flightId: string, outGMT: Date, inGMT: Date, origin: string, destination: string,
              previousInGMT: Date) {
    this._acId = acId;
    this._flightId = flightId;
    this._outGMT = outGMT;
    this._inGMT = inGMT;
    this._origin = origin;
    this._destination = destination;
    this._previousInGMT = previousInGMT;
  }

  public get acId(): number {
    return this._acId;
  }

  public get flightId(): string {
    return this._flightId;
  }

  public get outGMT(): Date {
    return this._outGMT;
  }

  public get inGMT(): Date {
    return this._inGMT;
  }

  public get origin(): string {
    return this._origin;
  }

  public get destination(): string {
    return this._destination;
  }

  public get previousInGMT(): Date {
    return this._previousInGMT;
  }
}
