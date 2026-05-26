import autoBind from "auto-bind";
import { createConsole } from "../utils/Console.ts";
import Device from "../Device.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";

export const TouchSensorTypes = ["touches"] as const;
export type TouchSensorType = (typeof TouchSensorTypes)[number];

export interface Touch {
  index: number;
  value: number;
  isDown: boolean;
}

export interface InternalTouch extends Touch {
  lastTimeDown?: number;
}

export interface TouchSensorDataEventMessages {
  touches: { touches: Touch[] };
}

export const TouchSensorEventTypes = [
  "numberOfTouches",
  "touch",
  "touchDown",
  "touchUp",
] as const;
export type TouchSensorEventType = (typeof TouchSensorEventTypes)[number];

export interface TouchSensorEventMessages {
  numberOfTouches: { numberOfTouches: number };
  touch: { touch: Touch };
  touchDown: { touch: Touch };
  touchUp: { touch: Touch; duration: number };
}

export type TouchSensorEventDispatcher = EventDispatcher<
  Device,
  TouchSensorEventType,
  TouchSensorEventMessages
>;

const _console = createConsole("TouchSensorDataManager", { log: true });

class TouchSensorDataManager {
  constructor() {
    autoBind(this);
  }

  #eventDispatcher!: TouchSensorEventDispatcher;
  get eventDispatcher() {
    return this.#eventDispatcher;
  }
  set eventDispatcher(eventDispatcher) {
    if (this.#eventDispatcher == eventDispatcher) {
      return;
    }
    _console.assertWithError(
      !this.#eventDispatcher,
      "eventDispatcher already defined",
    );
    this.#eventDispatcher = eventDispatcher;
  }
  get dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }

  parseData(dataView: DataView<ArrayBuffer>) {
    const touches: Touch[] = [];
    let offset = 0;
    while (offset < dataView.byteLength) {
      const index = dataView.getUint8(offset++);
      const value = dataView.getUint8(offset++);
      const isDown = value > 0;
      const touch: Touch = { index, isDown, value };
      _console.log("touch", touch);
      touches.push(touch);
    }

    touches.forEach((touch) => {
      _console.assertRangeWithError(
        "touch.index",
        touch.index,
        0,
        this.numberOfTouches - 1,
      );

      this.dispatchEvent("touch", { touch });

      const internalTouch = this.touches[touch.index];
      if (touch.isDown) {
        internalTouch.lastTimeDown = Date.now();
        this.dispatchEvent("touchDown", { touch });
      } else {
        let duration = 0;
        if (internalTouch.lastTimeDown != undefined) {
          duration = Date.now() - internalTouch.lastTimeDown;
        }
        this.dispatchEvent("touchUp", { touch, duration });
      }
    });

    return touches;
  }

  #numberOfTouches: number = 0;
  get numberOfTouches() {
    return this.#numberOfTouches;
  }
  set numberOfTouches(newNumberOfTouches) {
    this.#numberOfTouches = newNumberOfTouches;
    _console.log({ numberOfTouches: this.numberOfTouches });
    this.touches = Array.from({ length: this.numberOfTouches }, (_, index) => ({
      index,
      value: 0,
      isDown: false,
    }));
  }

  touches: InternalTouch[] = [];

  clear() {
    _console.log("clear");
    this.numberOfTouches = 1; // FIX
  }
}

export default TouchSensorDataManager;
