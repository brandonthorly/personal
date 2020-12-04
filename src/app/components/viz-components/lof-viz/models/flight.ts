export class Flight {
  _acId: number;
  _flightId: string;
  _outGMT: Date;
  _inGMT: Date;
  _origin: string;
  _destination: string;
  _previousInGMT: Date;
  _nextOutGMT: Date;
  _cancelled = false;

  constructor(acId: number, flightId: string, outGMT: Date, inGMT: Date, origin: string, destination: string,
              previousInGMT: Date, nextOutGMT: Date) {
    this._acId = acId;
    this._flightId = flightId;
    this._outGMT = outGMT;
    this._inGMT = inGMT;
    this._origin = origin;
    this._destination = destination;
    this._previousInGMT = previousInGMT;
    this._nextOutGMT = nextOutGMT;
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

  public set outGMT(date: Date) {
    this._outGMT = date;
  }

  public get inGMT(): Date {
    return this._inGMT;
  }

  public set inGMT(date: Date) {
    this._inGMT = date;
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

    public get nextOutGMT(): Date {
    return this._nextOutGMT;
  }

  public get cancelled(): boolean {
    return this._cancelled;
  }

  public set cancelled(cancelled: boolean) {
    this._cancelled = cancelled;
  }
}
