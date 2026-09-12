import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";
const { litSignals, BW } = await waitForGlobals();
const { signal } = litSignals;

/** @typedef {import("../../../../../../../build/brilliantwear.module.js").Device} Device */
/** @typedef {import("../../../../../../../build/brilliantwear.module.js").DiscoveredDevice} DiscoveredDevice */

/** @typedef {Device | DiscoveredDevice} DeviceOrDiscoveredDevice */

/** @type {import("@lit-labs/signals").Signal.State<string[]>} */
export const deviceBluetoothIdsSignal = signal([]);

BW.DeviceManager.addEventListener("availableDevice", (event) => {
  const { device } = event.message;
  console.log("availableDevice", device);

  const deviceBluetoothIds = deviceBluetoothIdsSignal.get();
  if (deviceBluetoothIds.includes(device.bluetoothId)) {
    return;
  }
  deviceBluetoothIdsSignal.set([...deviceBluetoothIds, device.bluetoothId]);
});
BW.DeviceManager.addEventListener("unavailableDevice", (event) => {
  const { device } = event.message;
  console.log("unavailableDevice", device);

  const deviceBluetoothIds = deviceBluetoothIdsSignal.get();
  if (!deviceBluetoothIds.includes(device.bluetoothId)) {
    return;
  }
  deviceBluetoothIdsSignal.set(
    deviceBluetoothIds.filter(
      (bluetoothId) => device.bluetoothId != bluetoothId,
    ),
  );
});

BW.ScannerManager.addEventListener("scannerDiscoveredDevice", (event) => {
  const { discoveredDevice, firstTime } = event.message;
  if (!firstTime) {
    return;
  }
  console.log("scannerDiscoveredDevice", discoveredDevice);

  const deviceBluetoothIds = deviceBluetoothIdsSignal.get();
  if (deviceBluetoothIds.includes(discoveredDevice.bluetoothId)) {
    return;
  }
  deviceBluetoothIdsSignal.set([
    ...deviceBluetoothIds,
    discoveredDevice.bluetoothId,
  ]);
});
BW.ScannerManager.addEventListener(
  "scannerExpiredDiscoveredDevice",
  (event) => {
    const { discoveredDevice } = event.message;
    console.log("scannerExpiredDiscoveredDevice", discoveredDevice);

    const deviceBluetoothIds = deviceBluetoothIdsSignal.get();
    if (!deviceBluetoothIds.includes(discoveredDevice.bluetoothId)) {
      return;
    }
    deviceBluetoothIdsSignal.set(
      deviceBluetoothIds.filter(
        (bluetoothId) => bluetoothId != discoveredDevice.bluetoothId,
      ),
    );
  },
);
