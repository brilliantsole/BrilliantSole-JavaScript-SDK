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

/** @typedef {"deviceInformation" | "battery" | "main" | "dfu"} BluetoothServiceName */
/**
 * @typedef { "manufacturerName" |
 * "modelNumber" |
 * "hardwareRevision" |
 * "firmwareRevision" |
 * "softwareRevision" |
 * "pnpId" |
 * "serialNumber" |
 * "batteryLevel" |
 * "name" |
 * "type" |
 * "sensorConfiguration" |
 * "pressurePositions" |
 * "sensorScalars" |
 * "sensorData" |
 * "currentTime" |
 * "vibration" |
 * "maxFileLength" |
 * "fileTransferType" |
 * "fileLength" |
 * "fileChecksum" |
 * "fileTransferCommand" |
 * "fileTransferStatus" |
 * "fileTransferBlock" |
 * "tfliteModelName" |
 * "tfliteModelTask" |
 * "tfliteModelSampleRate" |
 * "tfliteModelSensorTypes" |
 * "tfliteModelNumberOfClasses" |
 * "tfliteModelIsReady" |
 * "tfliteCaptureDelay" |
 * "tfliteThreshold" |
 * "tfliteInferencingEnabled" |
 * "tfliteModelInference" |
 * "dfu"
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
                name: { uuid: generateBluetoothUUID("1000") },
                type: { uuid: generateBluetoothUUID("1001") },

                sensorConfiguration: { uuid: generateBluetoothUUID("2000") },
                pressurePositions: { uuid: generateBluetoothUUID("2001") },
                sensorScalars: { uuid: generateBluetoothUUID("2002") },
                currentTime: { uuid: generateBluetoothUUID("2003") },
                sensorData: { uuid: generateBluetoothUUID("2004") },

                vibration: { uuid: generateBluetoothUUID("3000") },

                maxFileLength: { uuid: generateBluetoothUUID("4000") },
                fileTransferType: { uuid: generateBluetoothUUID("4001") },
                fileLength: { uuid: generateBluetoothUUID("4002") },
                fileChecksum: { uuid: generateBluetoothUUID("4003") },
                fileTransferCommand: { uuid: generateBluetoothUUID("4004") },
                fileTransferStatus: { uuid: generateBluetoothUUID("4005") },
                fileTransferBlock: { uuid: generateBluetoothUUID("4006") },

                tfliteModelName: { uuid: generateBluetoothUUID("5000") },
                tfliteModelTask: { uuid: generateBluetoothUUID("5001") },
                tfliteModelSampleRate: { uuid: generateBluetoothUUID("5002") },
                tfliteModelSensorTypes: { uuid: generateBluetoothUUID("5003") },
                tfliteModelNumberOfClasses: { uuid: generateBluetoothUUID("5004") },
                tfliteModelIsReady: { uuid: generateBluetoothUUID("5005") },
                tfliteCaptureDelay: { uuid: generateBluetoothUUID("5006") },
                tfliteThreshold: { uuid: generateBluetoothUUID("5007") },
                tfliteInferencingEnabled: { uuid: generateBluetoothUUID("5008") },
                tfliteModelInference: { uuid: generateBluetoothUUID("5009") },
            },
        },
        dfu: {
            uuid: "8d53dc1d-1db7-4cd3-868b-8a527460aa84",
            characteristics: {
                dfu: { uuid: "da2e7828-fbce-4e01-ae9e-261174997c48" },
            },
        },
    },

    /** @type {BluetoothServiceUUID[]} */
    get serviceUUIDs() {
        return [this.services.main.uuid];
    },

    /** @type {BluetoothServiceUUID[]} */
    get optionalServiceUUIDs() {
        return [this.services.deviceInformation.uuid, this.services.battery.uuid, this.services.dfu.uuid];
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
        case "vibration":
        case "sensorData":
        case "fileTransferCommand":
        case "fileTransferBlock":
            properties.read = false;
            break;
    }

    // notify
    switch (characteristicName) {
        case "batteryLevel":
        case "name":
        case "type":
        case "sensorConfiguration":
        case "sensorData":
        case "pressurePositions":
        case "currentTime":
        case "fileLength":
        case "fileChecksum":
        case "fileTransferType":
        case "fileTransferStatus":
        case "fileTransferBlock":
            properties.notify = true;
            break;
    }

    // write
    switch (characteristicName) {
        case "name":
        case "type":
        case "sensorConfiguration":
        case "vibration":
        case "fileLength":
        case "fileChecksum":
        case "fileTransferType":
        case "fileTransferCommand":
        case "fileTransferBlock":
            properties.write = true;
            properties.writeWithoutResponse = true;
            properties.reliableWrite = true;
            break;
    }

    return properties;
}

export const serviceDataUUID = "0000";
