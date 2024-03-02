import { isInBrowser, isInNode } from "../../utils/environment.js";

if (isInNode) {
    const webbluetooth = require("webbluetooth");
    var BluetoothUUID = webbluetooth.BluetoothUUID;
}
if (isInBrowser) {
    var BluetoothUUID = window.BluetoothUUID;
}

/**
 * @param {number} offset
 * @returns {BluetoothServiceUUID}
 */
function generateBluetoothUUID(offset) {
    return `ea6da725-2000-4f9b-893d-${(0xc3913e33b3e3 + offset).toString("16")}`;
}

/**
 * @param {string} identifier
 */
function stringToCharacteristicUUID(identifier) {
    return BluetoothUUID.getCharacteristic(identifier);
}

/**
 * @param {string} identifier
 */
function stringToServiceUUID(identifier) {
    return BluetoothUUID.getService(identifier);
}

/** @typedef {"deviceInformation" | "battery" | "main"} BrilliantSoleBluetoothServiceName */
/** @typedef { "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "batteryLevel" | "name" | "type" | "sensorConfiguration" | "sensorData" | "vibration"} BrilliantSoleBluetoothCharacteristicName */

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
            uuid: generateBluetoothUUID(0),
            characteristics: {
                name: { uuid: generateBluetoothUUID(1) },
                type: { uuid: generateBluetoothUUID(2) },
                sensorConfiguration: { uuid: generateBluetoothUUID(3) },
                sensorData: { uuid: generateBluetoothUUID(4) },
                vibration: { uuid: generateBluetoothUUID(5) },
            },
        },
    },

    /** @type {BluetoothServiceUUID[]} */
    get serviceUUIDs() {
        return [this.services.main.uuid];
    },

    /** @type {BluetoothServiceUUID[]} */
    get optionalServiceUUIDs() {
        return [this.services.deviceInformation.uuid, this.services.battery.uuid];
    },

    /**
     * @param {BluetoothServiceUUID} serviceUUID
     * @returns {BrilliantSoleBluetoothServiceName?}
     */
    getServiceNameFromUUID(serviceUUID) {
        return Object.entries(this.services).find(([serviceName, serviceInfo]) => {
            return serviceUUID == serviceInfo.uuid;
        })?.[0];
    },

    /**
     * @param {BluetoothCharacteristicUUID} characteristicUUID
     * @returns {BrilliantSoleBluetoothCharacteristicName?}
     */
    getCharacteristicNameFromUUID(characteristicUUID) {
        var characteristicName;
        Object.values(this.services).some((serviceInfo) => {
            characteristicName = Object.entries(serviceInfo.characteristics).find(
                ([characteristicName, characteristicInfo]) => {
                    return characteristicUUID == characteristicInfo.uuid;
                }
            )?.[0];
            return characteristicName;
        });
        return characteristicName;
    },
});

export const serviceUUIDs = bluetoothUUIDs.serviceUUIDs;
export const optionalServiceUUIDs = bluetoothUUIDs.optionalServiceUUIDs;

/** @param {BluetoothServiceUUID} serviceUUID */
export function getServiceNameFromUUID(serviceUUID) {
    return bluetoothUUIDs.getServiceNameFromUUID(serviceUUID);
}

/** @param {BluetoothCharacteristicUUID} characteristicUUID */
export function getCharacteristicNameFromUUID(characteristicUUID) {
    return bluetoothUUIDs.getCharacteristicNameFromUUID(characteristicUUID);
}
