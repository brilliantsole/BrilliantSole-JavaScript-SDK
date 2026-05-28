import autoBind from "auto-bind";
import { createConsole } from "../utils/Console.ts";
import Device from "../Device.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";

export const ButtonSensorTypes = ["buttons"] as const;
export type ButtonSensorType = (typeof ButtonSensorTypes)[number];

export interface Button {
  index: number;
  value: number;
  isDown: boolean;
}

export interface InternalButton extends Button {
  lastTimeDown?: number;
}

export interface ButtonSensorDataEventMessages {
  buttons: { buttons: Button[] };
}

export const ButtonSensorEventTypes = [
  "numberOfButtons",
  "button",
  "buttonDown",
  "buttonUp",
] as const;
export type ButtonSensorEventType = (typeof ButtonSensorEventTypes)[number];

export interface ButtonSensorEventMessages {
  numberOfButtons: { numberOfButtons: number };
  button: { button: Button };
  buttonDown: { button: Button };
  buttonUp: { button: Button; duration: number };
}

export type ButtonSensorEventDispatcher = EventDispatcher<
  Device,
  ButtonSensorEventType,
  ButtonSensorEventMessages
>;

const _console = createConsole("ButtonSensorDataManager", { log: false });

class ButtonSensorDataManager {
  constructor() {
    autoBind(this);
  }

  #eventDispatcher!: ButtonSensorEventDispatcher;
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
    const buttons: Button[] = [];
    let offset = 0;
    while (offset < dataView.byteLength) {
      const index = dataView.getUint8(offset++);
      const value = dataView.getUint8(offset++);
      const isDown = value > 0;
      const button: Button = { index, isDown, value };
      _console.log("button", button);
      buttons.push(button);
    }

    buttons.forEach((button) => {
      _console.assertRangeWithError(
        "button.index",
        button.index,
        0,
        this.numberOfButtons - 1,
      );

      this.dispatchEvent("button", { button });

      const internalButton = this.buttons[button.index];
      if (button.isDown) {
        internalButton.lastTimeDown = Date.now();
        this.dispatchEvent("buttonDown", { button });
      } else {
        let duration = 0;
        if (internalButton.lastTimeDown != undefined) {
          duration = Date.now() - internalButton.lastTimeDown;
        }
        this.dispatchEvent("buttonUp", { button, duration });
      }
    });

    return buttons;
  }

  #numberOfButtons: number = 0;
  get numberOfButtons() {
    return this.#numberOfButtons;
  }
  set numberOfButtons(newNumberOfButtons) {
    this.#numberOfButtons = newNumberOfButtons;
    _console.log({ numberOfButtons: this.numberOfButtons });
    this.buttons = Array.from({ length: this.numberOfButtons }, (_, index) => ({
      index,
      value: 0,
      isDown: false,
    }));

    this.dispatchEvent("numberOfButtons", {
      numberOfButtons: this.numberOfButtons,
    });
  }

  buttons: InternalButton[] = [];

  clear() {
    _console.log("clear");
  }
}

export default ButtonSensorDataManager;
