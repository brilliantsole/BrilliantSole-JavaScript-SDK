import { createConsole } from "../utils/Console.ts";
import NobleScanner from "./NobleScanner.ts";
import NullScanner from "./NullScanner.ts";

const _console = createConsole("Scanner", { log: false });

export const Scanners = [NullScanner, NobleScanner] as const;
export type Scanner = InstanceType<(typeof Scanners)[number]>;

let scanner: Scanner;

if (NobleScanner.isSupported) {
  _console.log("using NobleScanner");
  scanner = new NobleScanner();
} else {
  _console.log("Scanner not available");
  scanner = new NullScanner();
}

export default scanner;
