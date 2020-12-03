import jStat from 'jstat';
import {EDensityFn} from '../../shared/density-fn.enum';
import {IRVParams} from './rv-params.interface';


export class RandomVariable {
  private _densityFn: EDensityFn;
  private _fnParams: IRVParams;

  constructor(densityFn: EDensityFn, fnParams: IRVParams) {
    this._densityFn = densityFn;
    this._fnParams = fnParams;
  }

  public get densityFn(): EDensityFn {
    return this._densityFn;
  }

  public get fnParams(): IRVParams {
    return this._fnParams;
  }

  public draw(): number {
    const fn = this.getDensityFn();
    let draw =  Math.floor(fn.sample(this._fnParams.alpha, this._fnParams.beta));

    if (this._fnParams.shift) {
      draw += this._fnParams.shift;
    }

    return draw > 0 ? draw : 1;
  }

  private getDensityFn(): any {
    switch (this._densityFn) {
      case EDensityFn.NORMAL:
        return jStat.normal;

      case EDensityFn.GAMMA:
        return jStat.gamma;

    }
  }
}
