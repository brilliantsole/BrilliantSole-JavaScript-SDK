export { setAllConsoleLevelFlags, setConsoleLevelFlagsForType } from "./utils/Console.ts";
export { default as Device, DeviceEvent, DeviceEventMap, StaticDeviceEvent, StaticDeviceEventMap } from "./Device.ts";
export * as Environment from "./utils/environment.ts";

export { SensorType, SensorTypes, ContinuousSensorType, ContinuousSensorTypes } from "./sensor/SensorDataManager.ts";
export { DefaultNumberOfPressureSensors, PressureData } from "./sensor/PressureSensorDataManager.ts";
export { Vector2, Vector3, Quaternion, Euler } from "./utils/MathUtils.ts";
export { DeviceType, DeviceTypes, MinNameLength, MaxNameLength } from "./InformationManager.ts";
export {
  VibrationConfiguration,
  VibrationLocation,
  VibrationLocations,
  VibrationType,
  VibrationTypes,
  MaxNumberOfVibrationWaveformEffectSegments,
  MaxVibrationWaveformSegmentDuration,
  MaxVibrationWaveformEffectSegmentDelay,
  MaxVibrationWaveformEffectSegmentLoopCount,
  MaxNumberOfVibrationWaveformSegments,
  MaxVibrationWaveformEffectSequenceLoopCount,
} from "./vibration/VibrationManager.ts";
export { VibrationWaveformEffect, VibrationWaveformEffects } from "./vibration/VibrationWaveformEffects.ts";
export { DeviceInformation } from "./DeviceInformationManager.ts";
export { FileType, FileTypes, FileTransferDirection, FileTransferDirections } from "./FileTransferManager.ts";
export { TfliteSensorType, TfliteSensorTypes, TfliteTask, TfliteTasks } from "./TfliteManager.ts";
export { MaxSensorRate, SensorRateStep } from "./sensor/SensorConfigurationManager.ts";
export { DiscoveredDevice } from "./scanner/BaseScanner.ts";

/** NODE_START */
export { default as Scanner } from "./scanner/Scanner.ts";
export { default as WebSocketServer } from "./server/websocket/WebSocketServer.ts";
/** NODE_END */
export { default as DevicePair } from "./devicePair/DevicePair.ts";
/** BROWSER_START */
export { default as WebSocketClient } from "./server/websocket/WebSocketClient.ts";
/** BROWSER_END */
