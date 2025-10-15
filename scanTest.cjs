const noble = require("@abandonware/noble");

const TARGET_NAME = process.env.TARGET_NAME || "";
const TARGET_ID = (process.env.TARGET_ID || "").toLowerCase();

function log(msg, ...args) {
  const ts = new Date().toISOString();
  console.log(`[noble-scan][${ts}] ${msg}`, ...args);
}

async function main() {
  // Recommend helpful env for Linux
  const hints = {
    NOBLE_HCI_DEVICE_ID: process.env.NOBLE_HCI_DEVICE_ID || "0",
    NOBLE_REPORT_ALL_HCI_EVENTS: process.env.NOBLE_REPORT_ALL_HCI_EVENTS || "1",
    NOBLE_MULTI_ROLE: process.env.NOBLE_MULTI_ROLE || "1",
    NOBLE_SCAN_DUPLICATES: process.env.NOBLE_SCAN_DUPLICATES || "1",
  };
  log("Env hints:", hints);

  noble.on("stateChange", async (state) => {
    log("Adapter stateChange:", state);
    if (state === "poweredOn") {
      try {
        await noble.startScanningAsync([], true); // any services, allow duplicates
        log("Scanning started...");
      } catch (e) {
        log("Failed to start scan:", e?.message || e);
        process.exit(1);
      }
    } else {
      try {
        await noble.stopScanningAsync();
      } catch {}
    }
  });

  noble.on("discover", (peripheral) => {
    const id = (peripheral.id || "").toLowerCase();
    const addr = (peripheral.address || "").toLowerCase();
    const name = peripheral.advertisement?.localName || "";
    const rssi = peripheral.rssi;
    if (TARGET_ID && id !== TARGET_ID && addr !== TARGET_ID) return;
    if (TARGET_NAME && name !== TARGET_NAME) return;
    log(`Found: name='${name}' id=${id} addr=${addr} rssi=${rssi}`);
  });

  // Safety exit after a while if run standalone
  const timeoutMs = Number(process.env.SCAN_TIMEOUT_MS || 20000);
  setTimeout(async () => {
    try {
      await noble.stopScanningAsync();
    } catch {}
    log("Scan timeout reached. Exiting.");
    process.exit(0);
  }, timeoutMs);
}

main().catch((e) => {
  log("Fatal:", e?.stack || e?.message || String(e));
  process.exit(1);
});
