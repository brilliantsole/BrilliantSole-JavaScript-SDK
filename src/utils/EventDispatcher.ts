import autoBind from "auto-bind";
import { createConsole } from "./Console.ts";

const _console = createConsole("EventDispatcher", { log: false });

export const wildcardEventType = "*" as const;
export type WildcardEventType = typeof wildcardEventType;

export type EventMap<
  Target,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
> = {
  [T in keyof EventMessages]: {
    type: T;
    target: Target;
    message: EventMessages[T];
  };
} & {
  [wildcardEventType]: {
    [T in keyof EventMessages]: {
      type: T;
      target: Target;
      message: EventMessages[T];
    };
  }[keyof EventMessages];
};

export type EventListenerMap<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
> = {
  [T in keyof EventMessages]: (event: {
    type: T;
    target: Target;
    message: EventMessages[T];
  }) => void;
} & {
  [wildcardEventType]: (event: Event<Target, EventType, EventMessages>) => void;
};

export type Event<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
> = EventMap<Target, EventType, EventMessages>[keyof EventMessages];

type SpecificEvent<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
  SpecificEventType extends EventType,
> = {
  type: SpecificEventType;
  target: Target;
  message: EventMessages[SpecificEventType];
};

export type ListenerEvent<
  Target,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
  T extends EventType | WildcardEventType,
> = T extends WildcardEventType
  ? Event<Target, EventType, EventMessages>
  : SpecificEvent<Target, EventType, EventMessages, T & EventType>;

export type ListenerObject<
  Target,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
  T extends EventType | WildcardEventType,
> = {
  listener: (event: ListenerEvent<Target, EventType, EventMessages, T>) => void;
  once?: boolean;
  shouldRemove?: boolean;
};

export type BoundEventListeners<
  Target,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
> = {
  [K in
    | EventType
    | typeof wildcardEventType]?: K extends typeof wildcardEventType
    ? (event: Event<Target, EventType, EventMessages>) => void
    : (
        event: SpecificEvent<Target, EventType, EventMessages, K & EventType>,
      ) => void;
};

export type EventDispatcherTypes<
  Target,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
> = {
  Event: Event<Target, EventType, EventMessages>;
  EventMap: EventMap<Target, EventType, EventMessages>;
  EventListenerMap: EventListenerMap<Target, EventType, EventMessages>;
  BoundEventListeners: BoundEventListeners<Target, EventType, EventMessages>;
  EventDispatcher: EventDispatcher<Target, EventType, EventMessages>;
};

class EventDispatcher<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
> {
  #listeners: Partial<
    Record<
      EventType | WildcardEventType,
      {
        listener: Function;
        once?: boolean;
        shouldRemove?: boolean;
      }[]
    >
  > = {};

  #target!: Target;
  #validEventTypes!: readonly EventType[];

  constructor(target: Target, validEventTypes: readonly EventType[]) {
    autoBind(this);

    this.#target = target;
    this.#validEventTypes = validEventTypes;

    _console.assertWithError(
      // @ts-expect-error
      !validEventTypes.includes(wildcardEventType),
      `eventTypes cannot include the wildcardSymbol "${wildcardEventType}"`,
    );
  }

  #isValidEventType(type: any): type is EventType {
    return this.#validEventTypes.includes(type);
  }
  #isValidListenerType(
    type: EventType | WildcardEventType,
  ): type is EventType | WildcardEventType {
    return (
      type === wildcardEventType ||
      this.#validEventTypes.includes(type as EventType)
    );
  }

  #updateEventListeners<T extends EventType | WildcardEventType>(type: T) {
    if (!this.#listeners[type]) return;
    this.#listeners[type] = this.#listeners[type]!.filter(
      (listenerObj) => !listenerObj.shouldRemove,
    );
  }

  addEventListener<T extends EventType | WildcardEventType>(
    type: T,
    listener: (
      event: ListenerEvent<Target, EventType, EventMessages, T>,
    ) => void,
    options: { once?: boolean } = { once: false },
  ): void {
    if (!this.#isValidListenerType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    if (!this.#listeners[type]) {
      this.#listeners[type] = [];
      _console.log(
        `creating "${type}" listeners array`,
        this.#listeners[type]!,
      );
    }
    const alreadyAdded = this.#listeners[type].find((listenerObject) => {
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
    this.#listeners[type]!.push({ listener, once: options.once });

    _console.log(
      `currently have ${this.#listeners[type]!.length} "${type}" listeners`,
    );
  }

  removeEventListener<T extends EventType | WildcardEventType>(
    type: T,
    listener: (
      event: ListenerEvent<Target, EventType, EventMessages, T>,
    ) => void,
  ): void {
    if (!this.#isValidListenerType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    if (!this.#listeners[type]) return;

    _console.log(`removing "${type}" listener...`, listener);
    this.#listeners[type]!.forEach((listenerObj) => {
      const isListenerToRemove = listenerObj.listener === listener;
      if (isListenerToRemove) {
        _console.log(`flagging "${type}" listener`, listener);
        listenerObj.shouldRemove = true;
      }
    });

    this.#updateEventListeners(type);
  }

  removeEventListeners<T extends EventType | WildcardEventType>(type: T): void {
    if (!this.#isValidListenerType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    if (!this.#listeners[type]) return;

    _console.log(`removing "${type}" listeners...`);
    this.#listeners[type] = [];
  }

  removeAllEventListeners(): void {
    _console.log(`removing listeners...`);
    this.#listeners = {};
  }

  dispatchEvent<T extends EventType>(type: T, message: EventMessages[T]): void {
    if (!this.#isValidEventType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    this.#dispatchEvent(type, message);
    this.#dispatchEvent(type, message, true);
  }
  #dispatchEvent<T extends EventType>(
    type: T,
    message: EventMessages[T],
    isWildcard = false,
  ): void {
    if (!this.#isValidEventType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    const listenersType = isWildcard ? wildcardEventType : type;

    if (!this.#listeners[listenersType]) return;

    // Take a snapshot of listeners at this moment
    const listenersSnapshot = [...this.#listeners[listenersType]!];

    listenersSnapshot.forEach((listenerObj) => {
      if (listenerObj.shouldRemove) {
        return;
      }

      _console.log(`dispatching "${type}" listener`, listenerObj);
      try {
        listenerObj.listener({ type, target: this.#target, message });
      } catch (error) {
        console.error(error);
      }

      if (listenerObj.once) {
        _console.log(`flagging "${type}" listener`, listenerObj);
        listenerObj.shouldRemove = true;
      }
    });

    this.#updateEventListeners(type);
  }

  waitForEvent<T extends EventType>(
    type: T,
  ): Promise<ListenerEvent<Target, EventType, EventMessages, T>> {
    return new Promise((resolve) => {
      const onceListener = (
        event: ListenerEvent<Target, EventType, EventMessages, T>,
      ) => {
        resolve(event);
      };

      this.addEventListener(type, onceListener, { once: true });
    });
  }
}

export default EventDispatcher;
