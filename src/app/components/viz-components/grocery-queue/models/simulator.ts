import {Observable, Subject} from 'rxjs';
import {IRVParams} from './rv-params.interface';
import {CheckoutPool} from './states/checkout-pool';
import {CheckoutQueue} from './states/checkout-queue';
import {EEventType} from './enums/event-type.enum';
import {IEvent} from './event.interface';
import {Shopper} from './shopper';
import {StorePool} from './states/store-pool';

export class Simulator {
  private _running = false;
  private _time = 0;
  private _endTime = 60 * 60 * 24;
  private _store: StorePool;
  private _checkoutQueue: CheckoutQueue;
  private _checkoutPool: CheckoutPool;
  private _shoppers: Shopper[];
  private _shopperItemsRVParams: IRVParams;

  private _entranceFrequency = 60 * 5;
  private _eventQueue: IEvent[];

  _timeSubject = new Subject<number>();


  constructor(checkoutCount: number, entranceFrequency: number, initialShopperCount: number,
              shopperItemsRVParams: IRVParams, getItemRVParams: IRVParams, scanItemRVParams: IRVParams) {
    this._entranceFrequency = entranceFrequency;
    this._shopperItemsRVParams = shopperItemsRVParams;

    this._store = new StorePool(getItemRVParams);
    this._checkoutQueue = new CheckoutQueue();
    this._checkoutPool = new CheckoutPool(checkoutCount, scanItemRVParams);
    this._eventQueue = [];
    this._shoppers = [];

    for (let i = 0; i < initialShopperCount; i++) {
      this.addNewShopper();
    }
  }

  public listen(): Observable<number> {
    return this._timeSubject.asObservable();
  }

  public get shoppers(): Shopper[] {
    return this._shoppers;
  }

  public run(): void {
    this._running = true;

    const runInterval = setInterval(() => {
      if (!this._running || this._time >= this._endTime) {
        clearInterval(runInterval);
      }

      if (this._time && this._time % this._entranceFrequency === 0) {
        this.addNewShopper();
      }

      this.step();
      this._time++;

      // update viz every 30 'seconds'
      if (this._time % 30 === 0) this._timeSubject.next(this._time);
    }, 10);
  }

  public stop(): void {
    this._running = false;
  }

  private getEventsForTime(): IEvent[] {
    const events = [];

    while (this._eventQueue.length > 0) {
      if (this._eventQueue[0].time <= this._time) {
        events.push(this._eventQueue.shift());
      } else {
        break;
      }
    }

    return events;
  }

  private sortEvents(): void {
    this._eventQueue.sort((a, b) => a.time < b.time ? -1 : 1);
  }

  private step(): void {
    const eventsToExecute = this.getEventsForTime();

    eventsToExecute.forEach((e: IEvent) => {
      const type: EEventType = e.type;

      switch (type) {
        case EEventType.ENTER_STORE:
          this._eventQueue = this._eventQueue.concat(this._store.enter(e));
          break;

        case EEventType.ENTER_QUEUE:
          this._eventQueue = this._eventQueue.concat(this._checkoutQueue.enter(e));
          break;

        case EEventType.ENTER_CHECKOUT:
          this._eventQueue = this._eventQueue.concat(this._checkoutPool.enter(e));
          break;

        case EEventType.EXIT_CHECKOUT:
          this._checkoutPool.exit(e);
          break;

        default:
          console.error(`Error, unknown event type ${type}`);
      }
    });

    this.sortEvents();
  }

  private addNewShopper(): void {
    const shopper = new Shopper(this._shopperItemsRVParams);
    this._shoppers.push(shopper);

    this._eventQueue.push(
      {
        shopper,
        time: this._time,
        type: EEventType.ENTER_STORE,
      }
    );
  }
}
