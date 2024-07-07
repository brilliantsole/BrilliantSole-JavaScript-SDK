import { createConsole } from "../utils/Console.js";
import NobleScanner from "./NobleScanner.js";
import BaseScanner from "./BaseScanner.js";

const _console = createConsole("Scanner", { log: false });

/** @type {BaseScanner?} */
let scanner;

if (NobleScanner.isSupported) {
    _console.log("using NobleScanner");
    scanner = new NobleScanner();
} else {
    _console.log("Scanner not available");
}

export default scanner;
