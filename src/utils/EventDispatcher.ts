export type Event<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>,
  T extends EventType
> = { type: T; target: Target; message: EventMessages[T] };

export type GenericEvent<Target extends any, EventType extends string> = {
  type: EventType;
  target: Target;
  message: any;
};

class EventDispatcher<
  Target extends any,
  EventType extends string,
  EventMessages extends Partial<Record<EventType, any>>
> {
  private listeners: {
    [T in EventType]?: {
      listener: (event: { type: T; target: Target; message: EventMessages[T] }) => void;
      once: boolean;
    }[];
  } = {};

  constructor(private target: Target, private validEventTypes: readonly EventType[]) {}

  private isValidEventType(type: any): type is EventType {
    return this.validEventTypes.includes(type);
  }

  addEventListener<T extends EventType>(
    type: T,
    listener: (event: { type: T; target: Target; message: EventMessages[T] }) => void,
    options: { once: boolean } = { once: false }
  ): void {
    if (!this.isValidEventType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type]!.push({ listener, once: options.once });
  }

  removeEventListener<T extends EventType>(
    type: T,
    listener: (event: { type: T; target: Target; message: EventMessages[T] }) => void
  ): void {
    if (!this.isValidEventType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    if (!this.listeners[type]) return;

    this.listeners[type] = this.listeners[type]!.filter((l) => l.listener !== listener);
  }

  dispatchEvent<T extends EventType>(type: T, message: EventMessages[T]): void {
    if (!this.isValidEventType(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    if (!this.listeners[type]) return;

    const listeners = this.listeners[type]!;
    listeners.forEach((listenerObj, index) => {
      listenerObj.listener({ type, target: this.target, message });
      if (listenerObj.once) {
        listeners.splice(index, 1);
      }
    });
  }

  waitForEvent<T extends EventType>(type: T): Promise<{ type: T; target: Target; message: EventMessages[T] }> {
    return new Promise((resolve) => {
      const onceListener = (event: { type: T; target: Target; message: EventMessages[T] }) => {
        resolve(event);
      };

      this.addEventListener(type, onceListener, { once: true });
    });
  }
}

export default EventDispatcher;
