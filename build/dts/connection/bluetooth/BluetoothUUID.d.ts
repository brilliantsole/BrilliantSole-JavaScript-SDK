declare const BluetoothUUID: {
    /**
     * Converts a 16-bit or 32-bit UUID to a 128-bit UUID string
     */
    getService: (uuid: number | string) => string;
    getCharacteristic: (uuid: number | string) => string;
    getDescriptor: (uuid: number | string) => string;
    getCharacteristicName: (uuid: number | string) => string | null;
    getServiceName: (uuid: number | string) => string | null;
    getDescriptorName: (uuid: number | string) => string | null;
};
export { BluetoothUUID };
