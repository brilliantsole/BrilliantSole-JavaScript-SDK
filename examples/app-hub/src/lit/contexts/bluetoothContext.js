import { createContext } from "./createContext.js";
import { waitForGlobals } from "../../utils/cross-origin-storage-utils.js";
const { BW } = await waitForGlobals();

/** @typedef {{isWebBluetoothAvailable: boolean, isBluetoothAvailable: boolean, isBluetoothEnabled: boolean, isBluetoothScanningAvailable: boolean}} BluetoothContextState */

/** @returns {Promise<BluetoothContextState>} */
const getBluetoothState = async () => {
  const scanner = BW.ScannerManager.scanners.find(
    (scanner) => scanner.isScanningAvailable && !scanner.isClient,
  );
  const isBluetoothScanningAvailable = Boolean(scanner);

  const isWebBluetoothAvailable = Boolean(
    await navigator.bluetooth?.getAvailability(),
  );

  const isBluetoothAvailable =
    isWebBluetoothAvailable || isBluetoothScanningAvailable;
  const isBluetoothEnabled =
    isWebBluetoothAvailable || isBluetoothScanningAvailable;

  return {
    isWebBluetoothAvailable,
    isBluetoothAvailable,
    isBluetoothEnabled,
    isBluetoothScanningAvailable,
  };
};

const {
  createContextProvider: createBluetoothContextProvider,
  createContextConsumer: createBluetoothContextConsumer,
} = await createContext("bluetooth", {
  defaultState: await getBluetoothState(),
  onProviderHostConnection: (provider, abortController) => {
    const update = async () => {
      const bluetoothState = await getBluetoothState();
      // console.log({ bluetoothState });
      provider.value.update(bluetoothState);
    };

    /** @type {AddEventListenerOptions} */
    const options = { signal: abortController.signal };

    navigator.bluetooth?.addEventListener(
      "availabilitychanged",
      async (event) => {
        // console.log("availabilitychanged");
        await update();
      },
      options,
    );
    BW.ScannerManager.addEventListener(
      "scannerIsScanningAvailable",
      async (event) => {
        // console.log("scannerIsScanningAvailable");
        await update();
      },
      options,
    );
  },
});

export { createBluetoothContextProvider, createBluetoothContextConsumer };
