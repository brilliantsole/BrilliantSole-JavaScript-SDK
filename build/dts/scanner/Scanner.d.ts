import NobleScanner from "./NobleScanner.ts";
import NullScanner from "./NullScanner.ts";
export declare const Scanners: readonly [typeof NullScanner, typeof NobleScanner];
export type Scanner = InstanceType<(typeof Scanners)[number]>;
declare let scanner: Scanner;
export default scanner;
