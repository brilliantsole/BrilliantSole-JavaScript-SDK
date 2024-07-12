import { PressureData } from "../sensor/PressureSensorDataManager";
import { CenterOfPressure } from "../utils/CenterOfPressureHelper";
import { InsoleSide } from "../InformationManager";
import { SpecificDeviceEvent } from "../Device";
export type DevicePairRawPressureData = {
    [insoleSide in InsoleSide]: PressureData;
};
export interface DevicePairPressureData {
    rawSum: number;
    normalizedSum: number;
    center?: CenterOfPressure;
    normalizedCenter?: CenterOfPressure;
}
export interface DevicePairPressureDataEventMessage {
    pressure: DevicePairPressureData;
}
export interface DevicePairPressureDataEventMessages {
    pressure: DevicePairPressureDataEventMessage;
}
declare class DevicePairPressureSensorDataManager {
    #private;
    resetPressureRange(): void;
    onDevicePressureData(event: SpecificDeviceEvent<"pressure">): DevicePairPressureData | undefined;
}
export default DevicePairPressureSensorDataManager;
