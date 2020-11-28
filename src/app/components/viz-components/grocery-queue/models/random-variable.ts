import {IRVParams} from './rv-params.interface';

export class RandomVariable {
  private _densityFn: any;
  private _fnParams: IRVParams;

  constructor(densityFn: any, fnParams: IRVParams) {
    this._densityFn = densityFn;
    this._fnParams = fnParams;
  }

  public draw(): number {
    // IRVParams only works with gaussian right now
    const draw =  Math.floor(this._densityFn(this._fnParams.mean, this._fnParams.stddev));

    return draw > 0 ? draw : 1;
  }
}
