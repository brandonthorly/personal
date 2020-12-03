import {uuid} from '../../shared/simple-uuid';
import {EDensityFn} from '../../shared/density-fn.enum';
import {ESimState} from './enums/sim-states.enum';
import {RandomVariable} from './random-variable';

export class Shopper {
  private _id: string;
  private _itemsNeeded: number;
  private _state: ESimState;
  private _checkoutIndex: number;
  private _queuePosition: number;
  private _enterStoreTime: number;
  private _enterQueueTime: number;
  private _enterCheckoutTime: number;
  private _exitCheckoutTime: number;

  constructor(rv?: RandomVariable) {
    rv = rv || new RandomVariable(EDensityFn.NORMAL, { alpha: 15, beta: 20 });
    this._id = uuid();
    this._itemsNeeded = rv.draw();
    this._state = ESimState.INIT;
  }

  public get id(): string {
    return this._id;
  }

  public get itemsNeeded(): number {
    return this._itemsNeeded;
  }

  public get state(): ESimState {
    return this._state;
  }

  public set state(state: ESimState) {
    this._state = state;
  }

  public set enterStoreTime(time: number) {
    this._enterStoreTime = time;
  }

  public set enterQueueTime(time: number) {
    this._enterQueueTime = time;
  }

  public get enterCheckoutTime(): number {
    return this._enterCheckoutTime;
  }

  public set enterCheckoutTime(time: number) {
    this._enterCheckoutTime = time;
  }

  public set exitCheckoutTime(time: number) {
    this._exitCheckoutTime = time;
  }

  public get queuePosition(): number {
    return this._queuePosition;
  }

  public set queuePosition(position: number) {
    this._queuePosition = position;
  }

  public get checkoutIndex(): number {
    return this._checkoutIndex;
  }

  public set checkoutIndex(index: number) {
    this._checkoutIndex = index;
  }

  public getTimeInQueue(): number {
    if (this._enterCheckoutTime) {
      return this._enterCheckoutTime - this._enterQueueTime;
    }
  }
}
