import Device from "./Device";
import EventDispatcher from "./utils/EventDispatcher";
export interface PnpId {
    source: "Bluetooth" | "USB";
    vendorId: number;
    productId: number;
    productVersion: number;
}
export interface DeviceInformation {
    manufacturerName: string;
    modelNumber: string;
    softwareRevision: string;
    hardwareRevision: string;
    firmwareRevision: string;
    pnpId: PnpId;
    serialNumber: string;
}
export declare const DeviceInformationMessageTypes: readonly ["manufacturerName", "modelNumber", "softwareRevision", "hardwareRevision", "firmwareRevision", "pnpId", "serialNumber"];
export type DeviceInformationMessageType = (typeof DeviceInformationMessageTypes)[number];
export declare const DeviceInformationEventTypes: readonly ["manufacturerName", "modelNumber", "softwareRevision", "hardwareRevision", "firmwareRevision", "pnpId", "serialNumber", "deviceInformation"];
export type DeviceInformationEventType = (typeof DeviceInformationEventTypes)[number];
export interface DeviceInformationEventMessages {
    manufacturerName: {
        manufacturerName: string;
    };
    modelNumber: {
        modelNumber: string;
    };
    softwareRevision: {
        softwareRevision: string;
    };
    hardwareRevision: {
        hardwareRevision: string;
    };
    firmwareRevision: {
        firmwareRevision: string;
    };
    pnpId: {
        pnpId: PnpId;
    };
    serialNumber: {
        serialNumber: string;
    };
    deviceInformation: {
        deviceInformation: DeviceInformation;
    };
}
export type DeviceInformationEventDispatcher = EventDispatcher<Device, DeviceInformationEventType, DeviceInformationEventMessages>;
declare class DeviceInformationManager {
    #private;
    eventDispatcher: DeviceInformationEventDispatcher;
    get information(): DeviceInformation;
    clear(): void;
    parseMessage(messageType: DeviceInformationMessageType, dataView: DataView): void;
}
export default DeviceInformationManager;
