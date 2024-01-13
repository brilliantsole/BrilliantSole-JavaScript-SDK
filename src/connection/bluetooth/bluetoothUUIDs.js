/**
 * @param {string|number} value
 * @returns {BluetoothServiceUUID}
 */
function generateBluetoothUUID(value) {
    return `6e40000${value}-b5a3-f393-e0a9-e50e24dcca9e`;
}

const bluetoothUUIDs = Object.freeze({
    deviceInformationService: {
        uuid: "device_information", // 0x180a
        characteristics: {
            manufacturerName: {
                uuid: "manufacturer_name_string",
            },
            modelNumber: {
                uuid: "model_number_string",
            },
            hardwareRevision: {
                uuid: "hardware_revision_string",
            },
            firmwareRevision: {
                uuid: "firmware_revision_string",
            },
            softwareRevision: {
                uuid: "software_revision_string",
            },
        },
    },
    batteryService: {
        uuid: "battery_service", // 0x180f
        characteristics: {
            batteryLevel: {
                uuid: "battery_level", // 0x2a19
            },
        },
    },
    dataService: {
        uuid: generateBluetoothUUID("1"),
        characteristics: {
            write: { uuid: generateBluetoothUUID("2") },
            notify: { uuid: generateBluetoothUUID("3") },
        },
    },
    unknownService: {
        uuid: 0xfe59,
        characteristics: {},
    },

    /** @type {BluetoothServiceUUID[]} */
    get serviceUUIDs() {
        return [
            this.deviceInformationService.uuid,
            this.batteryService.uuid,
            this.dataService.uuid,
            this.unknownService.uuid,
        ];
    },
});

export default bluetoothUUIDs;
