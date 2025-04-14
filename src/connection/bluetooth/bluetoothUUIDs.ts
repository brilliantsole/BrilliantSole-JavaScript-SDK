import { isInBrowser, isInNode } from "../../utils/environment.ts";
import { createConsole } from "../../utils/Console.ts";

const _console = createConsole("bluetoothUUIDs", { log: false });

/** NODE_START */
import * as webbluetooth from "webbluetooth";
var BluetoothUUID = webbluetooth.BluetoothUUID;
/** NODE_END */
/** BROWSER_START */
if (isInBrowser) {
  var BluetoothUUID = window.BluetoothUUID;
}
/** BROWSER_END */

function generateBluetoothUUID(value: string): BluetoothServiceUUID {
  _console.assertTypeWithError(value, "string");
  _console.assertWithError(
    value.length == 4,
    "value must be 4 characters long"
  );
  return `ea6da725-${value}-4f9b-893d-c3913e33b39f`;
}

function stringToCharacteristicUUID(
  identifier: string
): BluetoothCharacteristicUUID {
  return BluetoothUUID?.getCharacteristic?.(identifier);
}

function stringToServiceUUID(identifier: string): BluetoothServiceUUID {
  return BluetoothUUID?.getService?.(identifier);
}

export type BluetoothServiceName =
  | "deviceInformation"
  | "battery"
  | "main"
  | "smp";
import { DeviceInformationType } from "../../DeviceInformationManager.ts";
export type BluetoothCharacteristicName =
  | DeviceInformationType
  | "batteryLevel"
  | "rx"
  | "tx"
  | "smp";

interface BluetoothCharacteristicInformation {
  uuid: BluetoothCharacteristicUUID;
}
interface BluetoothServiceInformation {
  uuid: BluetoothServiceUUID;
  characteristics: {
    [characteristicName in BluetoothCharacteristicName]?: BluetoothCharacteristicInformation;
  };
}
interface BluetoothServicesInformation {
  services: {
    [serviceName in BluetoothServiceName]: BluetoothServiceInformation;
  };
}
const bluetoothUUIDs: BluetoothServicesInformation = Object.freeze({
  services: {
    deviceInformation: {
      uuid: stringToServiceUUID("device_information"),
      characteristics: {
        manufacturerName: {
          uuid: stringToCharacteristicUUID("manufacturer_name_string"),
        },
        modelNumber: {
          uuid: stringToCharacteristicUUID("model_number_string"),
        },
        hardwareRevision: {
          uuid: stringToCharacteristicUUID("hardware_revision_string"),
        },
        firmwareRevision: {
          uuid: stringToCharacteristicUUID("firmware_revision_string"),
        },
        softwareRevision: {
          uuid: stringToCharacteristicUUID("software_revision_string"),
        },
        pnpId: {
          uuid: stringToCharacteristicUUID("pnp_id"),
        },
        serialNumber: {
          uuid: stringToCharacteristicUUID("serial_number_string"),
        },
      },
    },
    battery: {
      uuid: stringToServiceUUID("battery_service"),
      characteristics: {
        batteryLevel: {
          uuid: stringToCharacteristicUUID("battery_level"),
        },
      },
    },
    main: {
      uuid: generateBluetoothUUID("0000"),
      characteristics: {
        rx: { uuid: generateBluetoothUUID("1000") },
        tx: { uuid: generateBluetoothUUID("1001") },
      },
    },
    smp: {
      uuid: "8d53dc1d-1db7-4cd3-868b-8a527460aa84",
      characteristics: {
        smp: { uuid: "da2e7828-fbce-4e01-ae9e-261174997c48" },
      },
    },
  },
});

export const serviceUUIDs = [bluetoothUUIDs.services.main.uuid];
export const optionalServiceUUIDs = [
  bluetoothUUIDs.services.deviceInformation.uuid,
  bluetoothUUIDs.services.battery.uuid,
  bluetoothUUIDs.services.smp.uuid,
];
export const allServiceUUIDs = [...serviceUUIDs, ...optionalServiceUUIDs];

export function getServiceNameFromUUID(
  serviceUUID: BluetoothServiceUUID
): BluetoothServiceName | undefined {
  serviceUUID = serviceUUID.toString().toLowerCase();
  const serviceNames = Object.keys(
    bluetoothUUIDs.services
  ) as BluetoothServiceName[];
  return serviceNames.find((serviceName) => {
    const serviceInfo = bluetoothUUIDs.services[serviceName];
    let serviceInfoUUID = serviceInfo.uuid.toString();
    if (serviceUUID.length == 4) {
      serviceInfoUUID = serviceInfoUUID.slice(4, 8);
    }
    if (!serviceUUID.includes("-")) {
      serviceInfoUUID = serviceInfoUUID.replaceAll("-", "");
    }
    return serviceUUID == serviceInfoUUID;
  });
}

export const characteristicUUIDs: BluetoothCharacteristicUUID[] = [];
export const allCharacteristicUUIDs: BluetoothCharacteristicUUID[] = [];

export const characteristicNames: BluetoothCharacteristicName[] = [];
export const allCharacteristicNames: BluetoothCharacteristicName[] = [];

Object.values(bluetoothUUIDs.services).forEach((serviceInfo) => {
  if (!serviceInfo.characteristics) {
    return;
  }
  const characteristicNames = Object.keys(
    serviceInfo.characteristics
  ) as BluetoothCharacteristicName[];
  characteristicNames.forEach((characteristicName) => {
    const characteristicInfo = serviceInfo.characteristics[characteristicName]!;
    if (serviceUUIDs.includes(serviceInfo.uuid)) {
      characteristicUUIDs.push(characteristicInfo.uuid);
      characteristicNames.push(characteristicName);
    }
    allCharacteristicUUIDs.push(characteristicInfo.uuid);
    allCharacteristicNames.push(characteristicName);
  });
}, []);

//_console.log({ characteristicUUIDs, allCharacteristicUUIDs });

export function getCharacteristicNameFromUUID(
  characteristicUUID: BluetoothCharacteristicUUID
): BluetoothCharacteristicName | undefined {
  //_console.log({ characteristicUUID });
  characteristicUUID = characteristicUUID.toString().toLowerCase();
  var characteristicName: BluetoothCharacteristicName | undefined;
  Object.values(bluetoothUUIDs.services).some((serviceInfo) => {
    const characteristicNames = Object.keys(
      serviceInfo.characteristics
    ) as BluetoothCharacteristicName[];
    characteristicName = characteristicNames.find((_characteristicName) => {
      const characteristicInfo =
        serviceInfo.characteristics[_characteristicName]!;
      let characteristicInfoUUID = characteristicInfo.uuid.toString();
      if (characteristicUUID.length == 4) {
        characteristicInfoUUID = characteristicInfoUUID.slice(4, 8);
      }
      if (!characteristicUUID.includes("-")) {
        characteristicInfoUUID = characteristicInfoUUID.replaceAll("-", "");
      }
      return characteristicUUID == characteristicInfoUUID;
    });
    return characteristicName;
  });
  return characteristicName;
}

export function getCharacteristicProperties(
  characteristicName: BluetoothCharacteristicName
): BluetoothCharacteristicProperties {
  const properties = {
    broadcast: false,
    read: true,
    writeWithoutResponse: false,
    write: false,
    notify: false,
    indicate: false,
    authenticatedSignedWrites: false,
    reliableWrite: false,
    writableAuxiliaries: false,
  };

  // read
  switch (characteristicName) {
    case "rx":
    case "tx":
    case "smp":
      properties.read = false;
      break;
  }

  // notify
  switch (characteristicName) {
    case "batteryLevel":
    case "rx":
    case "smp":
      properties.notify = true;
      break;
  }

  // write without response
  switch (characteristicName) {
    case "smp":
      properties.writeWithoutResponse = true;
      break;
  }

  // write
  switch (characteristicName) {
    case "tx":
      properties.write = true;
      break;
  }

  return properties;
}

export const serviceDataUUID = "0000";
