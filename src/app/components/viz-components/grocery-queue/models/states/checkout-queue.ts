import {EEventType} from '../enums/event-type.enum';
import {IEvent} from '../event.interface';
import {Shopper} from '../shopper';
import {ESimState} from '../enums/sim-states.enum';

export class CheckoutQueue {
  private _queue: Shopper[] =[];

  constructor() { }

  public enter(event: IEvent): IEvent[] {
    const shopper = event.shopper;
    event.releaseFn(shopper);

    this._queue.push(shopper);
    shopper.state = ESimState.IN_QUEUE;
    shopper.enterQueueTime = event.time;
    shopper.queuePosition = this._queue.length - 1;

    if (this._queue.length === 1) {
      return [
        {
          time: event.time + 1,
          type: EEventType.ENTER_CHECKOUT,
          releaseFn: this.exit.bind(this),
          shopper
        }
      ];
    } else {
      return [];
    }
  }

  public exit(): Shopper {
    const shopper = this._queue.shift();
    shopper.queuePosition = void(0);

    if (this._queue.length > 0) {
      this.updateShopperQueuePositions();

      return this._queue[0];
    }
  }

  private updateShopperQueuePositions(): void {
    for (let i = 0; i < this._queue.length; i++) {
      this._queue[i].queuePosition = i;
    }
  }
}
