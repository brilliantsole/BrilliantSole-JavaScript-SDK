import { createConsole } from "../utils/Console";
import NobleScanner from "./NobleScanner";
import BaseScanner from "./BaseScanner";

const _console = createConsole("Scanner", { log: false });

let scanner: BaseScanner | undefined;

if (NobleScanner.isSupported) {
  _console.log("using NobleScanner");
  scanner = new NobleScanner() as BaseScanner;
} else {
  _console.log("Scanner not available");
}

export default scanner;
