import { isInBrowser, isInNode } from "../../utils/environment.js";
import { createConsole } from "../../utils/Console.js";

const _console = createConsole("bluetoothUUIDs", { log: false });

if (isInNode) {
    const webbluetooth = require("webbluetooth");
    var BluetoothUUID = webbluetooth.BluetoothUUID;
}
if (isInBrowser) {
    var BluetoothUUID = window.BluetoothUUID;
}

/**
 * @param {string} value
 * @returns {BluetoothServiceUUID}
 */
function generateBluetoothUUID(value) {
    _console.assertTypeWithError(value, "string");
    _console.assertWithError(value.length == 4, "value must be 4 characters long");
    return `ea6da725-${value}-4f9b-893d-c3913e33b39f`;
}

/** @param {string} identifier */
function stringToCharacteristicUUID(identifier) {
    return BluetoothUUID?.getCharacteristic?.(identifier);
}

/** @param {string} identifier */
function stringToServiceUUID(identifier) {
    return BluetoothUUID?.getService?.(identifier);
}

/** @typedef {"deviceInformation" | "battery" | "main" | "smp"} BluetoothServiceName */
/**
 * @typedef { "manufacturerName" |
 * "modelNumber" |
 * "hardwareRevision" |
 * "firmwareRevision" |
 * "softwareRevision" |
 * "pnpId" |
 * "serialNumber" |
 * "batteryLevel" |
 * "rx" |
 * "tx" |
 * "smp"
 * } BluetoothCharacteristicName
 */

const bluetoothUUIDs = Object.freeze({
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

    /** @type {BluetoothServiceUUID[]} */
    get serviceUUIDs() {
        return [this.services.main.uuid];
    },

    /** @type {BluetoothServiceUUID[]} */
    get optionalServiceUUIDs() {
        return [this.services.deviceInformation.uuid, this.services.battery.uuid, this.services.smp.uuid];
    },

    /**
     * @param {BluetoothServiceUUID} serviceUUID
     * @returns {BluetoothServiceName?}
     */
    getServiceNameFromUUID(serviceUUID) {
        serviceUUID = serviceUUID.toLowerCase();
        return Object.entries(this.services).find(([serviceName, serviceInfo]) => {
            let serviceInfoUUID = serviceInfo.uuid;
            if (serviceUUID.length == 4) {
                serviceInfoUUID = serviceInfoUUID.slice(4, 8);
            }
            if (!serviceUUID.includes("-")) {
                serviceInfoUUID = serviceInfoUUID.replaceAll("-", "");
            }
            return serviceUUID == serviceInfoUUID;
        })?.[0];
    },

    /**
     * @param {BluetoothCharacteristicUUID} characteristicUUID
     * @returns {BluetoothCharacteristicName?}
     */
    getCharacteristicNameFromUUID(characteristicUUID) {
        //_console.log({ characteristicUUID });
        characteristicUUID = characteristicUUID.toLowerCase();
        var characteristicName;
        Object.values(this.services).some((serviceInfo) => {
            characteristicName = Object.entries(serviceInfo.characteristics).find(
                ([characteristicName, characteristicInfo]) => {
                    let characteristicInfoUUID = characteristicInfo.uuid;
                    if (characteristicUUID.length == 4) {
                        characteristicInfoUUID = characteristicInfoUUID.slice(4, 8);
                    }
                    if (!characteristicUUID.includes("-")) {
                        characteristicInfoUUID = characteristicInfoUUID.replaceAll("-", "");
                    }
                    return characteristicUUID == characteristicInfoUUID;
                }
            )?.[0];
            return characteristicName;
        });
        return characteristicName;
    },
});

export const serviceUUIDs = bluetoothUUIDs.serviceUUIDs;
export const optionalServiceUUIDs = bluetoothUUIDs.optionalServiceUUIDs;
export const allServiceUUIDs = [...serviceUUIDs, ...optionalServiceUUIDs];

/** @param {BluetoothServiceUUID} serviceUUID */
export function getServiceNameFromUUID(serviceUUID) {
    return bluetoothUUIDs.getServiceNameFromUUID(serviceUUID);
}

/** @type {BluetoothCharacteristicUUID[]} */
export const characteristicUUIDs = [];
/** @type {BluetoothCharacteristicUUID[]} */
export const allCharacteristicUUIDs = [];

/** @type {BluetoothCharacteristicName[]} */
export const characteristicNames = [];
/** @type {BluetoothCharacteristicName[]} */
export const allCharacteristicNames = [];

Object.entries(bluetoothUUIDs.services).forEach(([serviceName, serviceInfo]) => {
    if (!serviceInfo.characteristics) {
        return;
    }
    Object.entries(serviceInfo.characteristics).forEach(([characteristicName, characteristicInfo]) => {
        if (serviceUUIDs.includes(serviceInfo.uuid)) {
            characteristicUUIDs.push(characteristicInfo.uuid);
            characteristicNames.push(characteristicName);
        }
        allCharacteristicUUIDs.push(characteristicInfo.uuid);
        allCharacteristicNames.push(characteristicName);
    });
}, []);

//_console.log({ characteristicUUIDs, allCharacteristicUUIDs });

/** @param {BluetoothCharacteristicUUID} characteristicUUID */
export function getCharacteristicNameFromUUID(characteristicUUID) {
    return bluetoothUUIDs.getCharacteristicNameFromUUID(characteristicUUID);
}

/**
 * @param {BluetoothCharacteristicName} characteristicName
 * @returns {BluetoothCharacteristicProperties}
 */
export function getCharacteristicProperties(characteristicName) {
    /** @type {BluetoothCharacteristicProperties} */
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

    // write
    switch (characteristicName) {
        case "tx":
        case "smp":
            properties.write = true;
            properties.writeWithoutResponse = true;
            properties.reliableWrite = true;
            break;
    }

    return properties;
}

export const serviceDataUUID = "0000";
