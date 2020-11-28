import {gaussianRV} from '../../../shared/gaussian-rv';
import {EEventType} from '../enums/event-type.enum';
import {IEvent} from '../event.interface';
import {RandomVariable} from '../random-variable';
import {IRVParams} from '../rv-params.interface';
import {Shopper} from '../shopper';
import {ESimState} from '../enums/sim-states.enum';

export class StorePool {
  private _rv: RandomVariable;
  private _shoppers: { [key: string]: Shopper };

  constructor(rvParams?: IRVParams) {
    const params = rvParams || { mean: 30, stddev: 20};
    this._rv = new RandomVariable(gaussianRV, params);
    this._shoppers = {};
  }

  public enter(event: IEvent): IEvent[] {
    const shopper = event.shopper;
    this._shoppers[shopper.id] = shopper;

    const shopTime = shopper.itemsNeeded * this._rv.draw();
    shopper.state = ESimState.SHOPPING;
    shopper.enterStoreTime = event.time;

    return [
      {
        time: event.time + shopTime,
        type: EEventType.ENTER_QUEUE,
        releaseFn: this.exit.bind(this),
        shopper,
      }
    ];
  }

  public exit(shopper: Shopper): void {
    if (this._shoppers.hasOwnProperty(shopper.id)) {
      delete this._shoppers[shopper.id];
    }
  }
}
