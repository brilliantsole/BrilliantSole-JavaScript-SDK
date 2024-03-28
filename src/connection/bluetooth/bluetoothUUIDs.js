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
    return `ea6da725-2000-4f9b-893d-c3913e33b3e${offset}`;
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

/** @typedef {"deviceInformation" | "battery" | "main" | "dfu"} BluetoothServiceName */
/** @typedef { "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "batteryLevel" | "name" | "type" | "sensorConfiguration" | "sensorData" | "vibration"} BluetoothCharacteristicName */

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
            uuid: generateBluetoothUUID(0),
            characteristics: {
                name: { uuid: generateBluetoothUUID(1) },
                type: { uuid: generateBluetoothUUID(2) },
                sensorConfiguration: { uuid: generateBluetoothUUID(3) },
                sensorData: { uuid: generateBluetoothUUID(4) },
                vibration: { uuid: generateBluetoothUUID(5) },
            },
        },
        dfu: {
            uuid: "8d53dc1d-1db7-4cd3-868b-8a527460aa84",
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
        case "vibration":
        case "sensorData":
            properties.read = false;
            break;
    }

    // notify
    switch (characteristicName) {
        case "batteryLevel":
        case "sensorData":
            properties.notify = true;
            break;
    }

    // write
    switch (characteristicName) {
        case "name":
        case "type":
        case "sensorConfiguration":
        case "vibration":
            properties.write = true;
            properties.writeWithoutResponse = true;
            properties.reliableWrite = true;
            break;
    }

    return properties;
}
