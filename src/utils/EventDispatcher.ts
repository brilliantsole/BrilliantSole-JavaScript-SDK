import { createConsole } from "./Console.ts";
import { deepEqual } from "./ObjectUtils.ts";

const _console = createConsole("EventDispatcher", { log: false });

export type EventMap<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>
> = {
  [T in keyof EventMessages]: {
    type: T;
    target: Target;
    message: EventMessages[T];
  };
};
export type EventListenerMap<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>
> = {
  [T in keyof EventMessages]: (event: {
    type: T;
    target: Target;
    message: EventMessages[T];
  }) => void;
};

export type Event<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>
> = EventMap<Target, EventType, EventMessages>[keyof EventMessages];

type SpecificEvent<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
  SpecificEventType extends EventType
> = {
  type: SpecificEventType;
  target: Target;
  message: EventMessages[SpecificEventType];
};

export type BoundEventListeners<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>
> = {
  [SpecificEventType in keyof EventMessages]?: (
    // @ts-expect-error
    event: SpecificEvent<Target, EventType, EventMessages, SpecificEventType>
  ) => void;
};

class EventDispatcher<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>
> {
  private listeners: {
    [T in EventType]?: {
      listener: (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
      }) => void;
      once?: boolean;
      shouldRemove?: boolean;
    }[];
  } = {};

  constructor(
    private target: Target,
    private validEventTypes: readonly EventType[]
  ) {
    this.addEventListener = this.addEventListener.bind(this);
    this.removeEventListener = this.removeEventListener.bind(this);
    this.removeEventListeners = this.removeEventListeners.bind(this);
    this.removeAllEventListeners = this.removeAllEventListeners.bind(this);
    this.dispatchEvent = this.dispatchEvent.bind(this);
    this.waitForEvent = this.waitForEvent.bind(this);
  }

  private isValidEventType(type: any): type is EventType {
    return this.validEventTypes.includes(type);
  }

  private updateEventListeners(type: EventType) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type]!.filter((listenerObj) => {
      if (listenerObj.shouldRemove) {
        _console.log(`removing "${type}" eventListener`, listenerObj);
      }
      return !listenerObj.shouldRemove;
    });
  }

  addEventListener<T extends EventType>(
    type: T,
    listener: (event: {
      type: T;
      target: Target;
      message: EventMessages[T];
    }) => void,
    options: { once?: boolean } = { once: false }
  ): void {
    if (!this.isValidEventType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    if (!this.listeners[type]) {
      this.listeners[type] = [];
      _console.log(`creating "${type}" listeners array`, this.listeners[type]!);
    }
    const alreadyAdded = this.listeners[type].find((listenerObject) => {
      return (
        listenerObject.listener == listener &&
        listenerObject.once == options.once
      );
    });
    if (alreadyAdded) {
      _console.log("already added listener");
      return;
    }
    _console.log(`adding "${type}" listener`, listener, options);
    this.listeners[type]!.push({ listener, once: options.once });

    _console.log(
      `currently have ${this.listeners[type]!.length} "${type}" listeners`
    );
  }

  removeEventListener<T extends EventType>(
    type: T,
    listener: (event: {
      type: T;
      target: Target;
      message: EventMessages[T];
    }) => void
  ): void {
    if (!this.isValidEventType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    if (!this.listeners[type]) return;

    _console.log(`removing "${type}" listener...`, listener);
    this.listeners[type]!.forEach((listenerObj) => {
      const isListenerToRemove = listenerObj.listener === listener;
      if (isListenerToRemove) {
        _console.log(`flagging "${type}" listener`, listener);
        listenerObj.shouldRemove = true;
      }
    });

    this.updateEventListeners(type);
  }

  removeEventListeners<T extends EventType>(type: T): void {
    if (!this.isValidEventType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    if (!this.listeners[type]) return;

    _console.log(`removing "${type}" listeners...`);
    this.listeners[type] = [];
  }

  removeAllEventListeners(): void {
    _console.log(`removing listeners...`);
    this.listeners = {};
  }

  dispatchEvent<T extends EventType>(type: T, message: EventMessages[T]): void {
    if (!this.isValidEventType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    if (!this.listeners[type]) return;

    this.listeners[type]!.forEach((listenerObj) => {
      if (listenerObj.shouldRemove) {
        return;
      }

      _console.log(`dispatching "${type}" listener`, listenerObj);
      try {
        listenerObj.listener({ type, target: this.target, message });
      } catch (error) {
        console.error(error);
      }

      if (listenerObj.once) {
        _console.log(`flagging "${type}" listener`, listenerObj);
        listenerObj.shouldRemove = true;
      }
    });
    this.updateEventListeners(type);
  }

  waitForEvent<T extends EventType>(
    type: T
  ): Promise<{ type: T; target: Target; message: EventMessages[T] }> {
    return new Promise((resolve) => {
      const onceListener = (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
      }) => {
        resolve(event);
      };

      this.addEventListener(type, onceListener, { once: true });
    });
  }
}

export default EventDispatcher;
