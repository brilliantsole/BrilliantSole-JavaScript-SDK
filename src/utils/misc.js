import { isAndroid } from "./environment.js";
import { createConsole } from "./Console.js";

const _console = createConsole("misc", { log: true });

/**
 * @param {number} delay ms
 */
async function promiseThatResolvesWithADelay(delay) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), delay);
    });
}

/**
 * Android browsers don't wait until a gatt operation is complete, so we'll need to manually wait
 * [solution source](https://github.com/LedgerHQ/ledgerjs/issues/352#issuecomment-615917351)
 */
async function waitIfAndroid() {
    if (isAndroid) {
        await promiseThatResolvesWithADelay(100);
    }
}

export { promiseThatResolvesWithADelay, waitIfAndroid };
