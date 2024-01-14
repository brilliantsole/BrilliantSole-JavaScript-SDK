/**
 * @param {string|number} value
 * @returns {BluetoothServiceUUID}
 */
function generateBluetoothUUID(value) {
    return `6e40000${value}-b5a3-f393-e0a9-e50e24dcca9e`;
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

/** @typedef {"deviceInformation" | "battery" | "data" | "unknown"} BrilliantSoleBluetoothServiceName */
/** @typedef { "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "batteryLevel" | "command" | "data" | "firmware"} BrilliantSoleBluetoothCharacteristicName */

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
        data: {
            uuid: generateBluetoothUUID("1"),
            characteristics: {
                command: { uuid: generateBluetoothUUID("2") },
                data: { uuid: generateBluetoothUUID("3") },
            },
        },
        firmware: {
            uuid: stringToCharacteristicUUID(0xfe59),
            characteristics: {
                firmware: { uuid: "8ec90003-f315-4f60-9fb8-838830daea50" },
            },
        },
    },

    /** @type {BluetoothServiceUUID[]} */
    get serviceUUIDs() {
        return [
            this.services.deviceInformation.uuid,
            this.services.battery.uuid,
            this.services.data.uuid,
            this.services.firmware.uuid,
        ];
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

/** @param {BluetoothServiceUUID} serviceUUID */
export function getServiceNameFromUUID(serviceUUID) {
    return bluetoothUUIDs.getServiceNameFromUUID(serviceUUID);
}

/** @param {BluetoothCharacteristicUUID} characteristicUUID */
export function getCharacteristicNameFromUUID(characteristicUUID) {
    return bluetoothUUIDs.getCharacteristicNameFromUUID(characteristicUUID);
}
