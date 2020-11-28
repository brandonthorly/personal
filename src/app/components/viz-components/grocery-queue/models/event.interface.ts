import {EEventType} from './enums/event-type.enum';
import {Shopper} from './shopper';

export interface IEvent {
  time: number;
  type: EEventType;
  shopper: Shopper;
  releaseFn?: any;
}
