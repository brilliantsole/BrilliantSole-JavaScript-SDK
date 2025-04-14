import { createConsole } from "../../utils/Console.ts";
import { isInNode } from "../../utils/environment.ts";
import BaseConnectionManager, {
  ConnectionType,
} from "../BaseConnectionManager.ts";

const _console = createConsole("UDPConnectionManager", { log: false });

class UDPConnectionManager extends BaseConnectionManager {
  get bluetoothId() {
    return ""; // FILL
  }

  get isAvailable() {
    return true;
  }
  static get isSupported() {
    return isInNode;
  }
  static get type(): ConnectionType {
    return "udp";
  }

  async sendSmpMessage(data: ArrayBuffer) {
    super.sendSmpMessage(data);
    // FILL
  }

  async sendTxData(data: ArrayBuffer) {
    super.sendTxData(data);
    if (data.byteLength == 0) {
      return;
    }
    // FILL
  }
}

export default UDPConnectionManager;
