import {EDensityFn} from '../../../shared/density-fn.enum';
import {EEventType} from '../enums/event-type.enum';
import {ESimState} from '../enums/sim-states.enum';
import {IEvent} from '../event.interface';
import {RandomVariable} from '../random-variable';
import {Shopper} from '../shopper';

export class StorePool {
  private _rv: RandomVariable;
  private _shoppers: { [key: string]: Shopper };

  constructor(rv?: RandomVariable) {
    this._rv = rv || new RandomVariable(EDensityFn.NORMAL, { alpha: 30, beta: 20});
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
