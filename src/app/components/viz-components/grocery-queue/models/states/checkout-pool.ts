import {gaussianRV} from '../../../shared/gaussian-rv';
import {EEventType} from '../enums/event-type.enum';
import {IEvent} from '../event.interface';
import {RandomVariable} from '../random-variable';
import {ESimState} from '../enums/sim-states.enum';
import {IRVParams} from '../rv-params.interface';

export class CheckoutPool {
  private _rv: RandomVariable;
  private _checkoutCount: number;
  private _pool: any[];
  private _waitTime = 30;
  private _payTime = 60;

  constructor(checkoutCount: number, rvParams: IRVParams) {
    const params = rvParams || { mean: 15, stddev: 10};
    this._rv = new RandomVariable(gaussianRV, params);
    this._checkoutCount = checkoutCount;
    this._pool = Array(this._checkoutCount);
  }

  public enter(event: IEvent): IEvent[] {
    const newEvents = [];
    const freeIndex: number = this.findFreeIndex();

    if (freeIndex !== -1) {
      const shopper = event.shopper;
      const nextShopper = event.releaseFn(shopper);

      if (nextShopper) {
        newEvents.push(
          {time: event.time + 1, shopper: nextShopper, type: EEventType.ENTER_CHECKOUT, releaseFn: event.releaseFn }
        );
      }

      this._pool[freeIndex] = shopper.id;
      shopper.state = ESimState.CHECKING_OUT;
      shopper.enterCheckoutTime = event.time;
      shopper.checkoutIndex = freeIndex;

      newEvents.push(this.createExitCheckoutEvent(event));
    } else {
      newEvents.push(this.createRetryEvent(event));
    }

    return newEvents;
  }

  public exit(event: IEvent): void {
    const shopper = event.shopper;
    const shopperIndex = this.findShopperIndex(shopper.id);

    if (shopperIndex !== -1) {
      this._pool[shopperIndex] = void(0);
      shopper.state = ESimState.GONE_HOME;
      shopper.exitCheckoutTime = event.time;
      shopper.checkoutIndex = void(0);
    }
  }

  private findFreeIndex(): number {
    for (let i = 0; i < this._pool.length; i++) {
      if (!this._pool[i]) return i;
    }

    return -1;
  }

  private findShopperIndex(id: string): number {
    for (let i = 0; i < this._pool.length; i++) {
      if (this._pool[i] && this._pool[i] === id) return i;
    }

    return -1;
  }

  private createExitCheckoutEvent(event: IEvent): IEvent {
    const shopper = event.shopper;
    const checkoutTime = (shopper.itemsNeeded * this._rv.draw()) + this._payTime;

    return {
      time: event.time + checkoutTime,
      type: EEventType.EXIT_CHECKOUT,
      shopper: event.shopper
    };
  }

  private createRetryEvent(event: IEvent): IEvent {
    return {
      ...event,
      time: event.time + this._waitTime,
    };
  }
}
