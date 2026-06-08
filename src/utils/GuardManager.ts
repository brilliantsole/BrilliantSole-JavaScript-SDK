type Guard<TArgs extends unknown[]> = (...args: TArgs) => boolean;

class GuardManager<TArgs extends unknown[]> {
  #guards: Guard<TArgs>[] = [];

  add(guard: Guard<TArgs>): void {
    if (this.#guards.includes(guard)) {
      return;
    }
    this.#guards.push(guard);
  }

  remove(guard: Guard<TArgs>): void {
    if (!this.#guards.includes(guard)) {
      return;
    }
    this.#guards.splice(this.#guards.indexOf(guard), 1);
  }

  evaluate(...args: TArgs): boolean {
    return this.#guards.every((guard) => guard(...args));
  }

  clear() {
    this.#guards.length = 0;
  }
}

export default GuardManager;
