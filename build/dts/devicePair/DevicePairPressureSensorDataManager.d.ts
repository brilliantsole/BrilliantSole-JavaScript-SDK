import { PressureData, PressureSensorValue } from "../sensor/PressureSensorDataManager.ts";
import { CenterOfPressure } from "../utils/CenterOfPressureHelper.ts";
import { Side } from "../InformationManager.ts";
import { DeviceEventMap } from "../Device.ts";
export type DevicePairRawPressureData = {
    [side in Side]: PressureData;
};
export interface DevicePairPressureData {
    sensors: {
        [key in Side]: PressureSensorValue[];
    };
    scaledSum: number;
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
    constructor();
    resetPressureRange(): void;
    onDevicePressureData(event: DeviceEventMap["pressure"]): DevicePairPressureData | undefined;
}
export default DevicePairPressureSensorDataManager;
