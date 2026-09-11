import { Client } from "../server/Client.ts";
import NobleScanner from "./NobleScanner.ts";
import NullScanner from "./NullScanner.ts";
export type ScannerLike = Scanner | Client;
export declare const Scanners: readonly [typeof NullScanner, typeof NobleScanner];
export type Scanner = InstanceType<(typeof Scanners)[number]>;
declare let scanner: Scanner;
export default scanner;
