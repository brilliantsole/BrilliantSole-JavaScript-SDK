import { createConsole } from "./Console.ts";

const _console = createConsole("Timer", { log: false });

export async function wait(delay: number) {
  _console.log(`waiting for ${delay}ms`);
  return new Promise((resolve: Function) => {
    setTimeout(() => resolve(), delay);
  });
}

class Timer {
  #callback!: Function;
  get callback() {
    return this.#callback;
  }
  set callback(newCallback) {
    _console.assertTypeWithError(newCallback, "function");
    _console.log({ newCallback });
    this.#callback = newCallback;
    if (this.isRunning) {
      this.restart();
    }
  }

  #interval!: number;
  get interval() {
    return this.#interval;
  }
  set interval(newInterval) {
    _console.assertTypeWithError(newInterval, "number");
    _console.assertWithError(newInterval > 0, "interval must be above 0");
    _console.log({ newInterval });
    this.#interval = newInterval;
    if (this.isRunning) {
      this.restart();
    }
  }

  constructor(callback: Function, interval: number) {
    this.interval = interval;
    this.callback = callback;
  }

  #intervalId: number | undefined;
  get isRunning() {
    return this.#intervalId != undefined;
  }

  start(immediately = false) {
    if (this.isRunning) {
      _console.log("interval already running");
      return;
    }
    _console.log(`starting interval every ${this.#interval}ms`);
    this.#intervalId = setInterval(this.#callback, this.#interval);
    if (immediately) {
      this.#callback();
    }
  }
  stop() {
    if (!this.isRunning) {
      _console.log("interval already not running");
      return;
    }
    _console.log("stopping interval");
    clearInterval(this.#intervalId);
    this.#intervalId = undefined;
  }
  restart(startImmediately = false) {
    this.stop();
    this.start(startImmediately);
  }
}
export default Timer;
