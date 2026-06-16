import { createConsole } from "../utils/Console.ts";
import NobleScanner from "./NobleScanner.ts";
import BaseScanner from "./BaseScanner.ts";
import NullScanner from "./NullScanner.ts";

const _console = createConsole("Scanner", { log: false });

let scanner: BaseScanner;

if (NobleScanner.isSupported) {
  _console.log("using NobleScanner");
  scanner = new NobleScanner() as BaseScanner;
} else {
  _console.log("Scanner not available");
  scanner = new NullScanner() as BaseScanner;
}

export default scanner;
