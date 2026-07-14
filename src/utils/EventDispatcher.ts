import autoBind from "auto-bind";
import { createConsole } from "./Console.ts";
import { OneOrMany } from "./TypeScriptUtils.ts";

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

type BoundEventListener<
  Target,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
  K extends EventType | typeof wildcardEventType,
> = K extends typeof wildcardEventType
  ? (event: Event<Target, EventType, EventMessages>) => void
  : (
      event: SpecificEvent<Target, EventType, EventMessages, K & EventType>,
    ) => void;

export type BoundEventListeners<
  Target,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
> = {
  [K in EventType | typeof wildcardEventType]?: OneOrMany<
    BoundEventListener<Target, EventType, EventMessages, K>
  >;
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

export type EventDispatcherOptions = {
  once?: boolean;
  immediate?: boolean;
  signal?: AbortSignal;
};

export type EventDispatcherListener = {
  listener: Function;
  shouldRemove?: boolean;
} & EventDispatcherOptions;

class EventDispatcher<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
> {
  #listeners: Partial<
    Record<EventType | WildcardEventType, EventDispatcherListener[]>
  > = {};
  #latestEvents: Partial<{
    [K in EventType]: {
      type: K;
      target: Target;
      message: EventMessages[K];
    };
  }> = {};

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
    options: EventDispatcherOptions = { once: false, immediate: false },
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
        listenerObject.listener === listener &&
        listenerObject.once === options.once &&
        listenerObject.immediate === options.immediate
        // && listenerObject.signal == options.signal
      );
    });
    if (alreadyAdded) {
      _console.log("already added listener");
      return;
    }
    if (options.signal) {
      _console.log(`listening to "abort" signal`);
      options.signal.addEventListener(
        "abort",
        () => {
          _console.log(`removing listener after receiving "abort" signal`);
          this.removeEventListener(type, listener);
        },
        { once: true },
      );
    }
    const listenerObj: EventDispatcherListener = {
      listener,
      once: options.once,
      immediate: options.immediate,
      signal: options.signal,
    };
    _console.log(`adding "${type}" listener`, listenerObj);
    this.#listeners[type]!.push(listenerObj);

    _console.log(
      `currently have ${this.#listeners[type]!.length} "${type}" listeners`,
    );

    if (options.immediate && type != wildcardEventType) {
      const latestEvent = this.#latestEvents[type];

      if (latestEvent) {
        this.#invokeListener(
          listenerObj,
          latestEvent.type,
          latestEvent.message,
        );

        this.#updateEventListeners(type);
      }
    }
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
    let foundListener = false;
    this.#listeners[type]!.forEach((listenerObj) => {
      const isListenerToRemove = listenerObj.listener === listener;
      if (isListenerToRemove) {
        _console.log(`flagging "${type}" listener`, listener);
        listenerObj.shouldRemove = true;
        foundListener = true;
      }
    });

    if (foundListener) {
      this.#updateEventListeners(type);
    }
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

    this.#latestEvents[type] = {
      type,
      target: this.#target,
      message,
    };

    this.#dispatchEvent(type, message);
    this.#dispatchEvent(type, message, true);
  }
  #invokeListener<T extends EventType>(
    listenerObj: EventDispatcherListener,
    type: T,
    message: EventMessages[T],
  ) {
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
      this.#invokeListener(listenerObj, type, message);
    });

    this.#updateEventListeners(type);
  }

  waitForEvent<T extends EventType>(
    type: T,
    options: { immediate?: boolean } = {},
  ): Promise<ListenerEvent<Target, EventType, EventMessages, T>> {
    return new Promise((resolve) => {
      this.addEventListener(type, resolve, {
        once: true,
        immediate: options.immediate,
      });
    });
  }
}

export default EventDispatcher;
