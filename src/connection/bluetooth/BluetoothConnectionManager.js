import { createConsole } from "../../utils/Console.js";
import { isInNode, isInBrowser, isInBluefy, isInWebBLE } from "../../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import BaseConnectionManager from "../BaseConnectionManager.js";
import {
    serviceUUIDs,
    optionalServiceUUIDs,
    getServiceNameFromUUID,
    getCharacteristicNameFromUUID,
    getCharacteristicProperties,
} from "./bluetoothUUIDs.js";

const _console = createConsole("BluetoothConnectionManager", { log: true });

/** @typedef {import("./bluetoothUUIDs.js").BluetoothCharacteristicName} BluetoothCharacteristicName */
/** @typedef {import("./bluetoothUUIDs.js").BluetoothServiceName} BluetoothServiceName */

/** @typedef {import("../BaseConnectionManager.js").ConnectionMessageType} ConnectionMessageType */
/** @typedef {import("../BaseConnectionManager.js").ConnectionType} ConnectionType */

class BluetoothConnectionManager extends BaseConnectionManager {
    /**
     * @protected
     * @param {BluetoothCharacteristicName} characteristicName
     * @param {DataView} dataView
     */
    onCharacteristicValueChanged(characteristicName, dataView) {
        switch (characteristicName) {
            case "manufacturerName":
            case "modelNumber":
            case "softwareRevision":
            case "hardwareRevision":
            case "firmwareRevision":
            case "pnpId":
            case "serialNumber":
            case "batteryLevel":
            case "sensorData":
            case "pressurePositions":
            case "sensorScalars":

            case "maxFileLength":
            case "fileTransferStatus":

            case "tfliteModelIsReady":
            case "tfliteModelInference":
                this.onMessageReceived(characteristicName, dataView);
                break;
            case "name":
                this.onMessageReceived("getName", dataView);
                break;
            case "type":
                this.onMessageReceived("getType", dataView);
                break;
            case "sensorConfiguration":
                this.onMessageReceived("getSensorConfiguration", dataView);
                break;
            case "currentTime":
                this.onMessageReceived("getCurrentTime", dataView);
                break;
            case "fileTransferType":
                this.onMessageReceived("getFileTransferType", dataView);
                break;
            case "fileLength":
                this.onMessageReceived("getFileLength", dataView);
                break;
            case "fileChecksum":
                this.onMessageReceived("getFileChecksum", dataView);
                break;
            case "fileTransferBlock":
                this.onMessageReceived("getFileTransferBlock", dataView);
                break;
            case "tfliteModelName":
                this.onMessageReceived("getTfliteModelName", dataView);
                break;
            case "tfliteModelTask":
                this.onMessageReceived("getTfliteModelTask", dataView);
                break;
            case "tfliteModelSampleRate":
                this.onMessageReceived("getTfliteModelSampleRate", dataView);
                break;
            case "tfliteModelNumberOfSamples":
                this.onMessageReceived("getTfliteModelNumberOfSamples", dataView);
                break;
            case "tfliteModelSensorTypes":
                this.onMessageReceived("getTfliteModelSensorTypes", dataView);
                break;
            case "tfliteModelNumberOfClasses":
                this.onMessageReceived("getTfliteModelNumberOfClasses", dataView);
                break;
            case "tfliteCaptureDelay":
                this.onMessageReceived("getTfliteCaptureDelay", dataView);
                break;
            case "tfliteThreshold":
                this.onMessageReceived("getTfliteThreshold", dataView);
                break;
            case "tfliteInferencingEnabled":
                this.onMessageReceived("getTfliteInferencingEnabled", dataView);
                break;
            default:
                throw new Error(`uncaught characteristicName "${characteristicName}"`);
        }
    }

    /**
     * @param {ConnectionMessageType} messageType
     * @returns {BluetoothCharacteristicName}
     */
    characteristicNameForMessageType(messageType) {
        switch (messageType) {
            case "setName":
                return "name";
            case "setType":
                return "type";

            case "setSensorConfiguration":
                return "sensorConfiguration";
            case "setCurrentTime":
                return "currentTime";
            case "triggerVibration":
                return "vibration";

            case "setFileTransferType":
                return "fileTransferType";
            case "setFileLength":
                return "fileLength";
            case "setFileChecksum":
                return "fileChecksum";
            case "setFileTransferCommand":
                return "fileTransferCommand";
            case "setFileTransferBlock":
                return "fileTransferBlock";

            case "setTfliteModelName":
                return "tfliteModelName";
            case "setTfliteModelTask":
                return "tfliteModelTask";
            case "setTfliteModelSampleRate":
                return "tfliteModelSampleRate";
            case "setTfliteModelNumberOfSamples":
                return "tfliteModelNumberOfSamples";
            case "setTfliteModelSensorTypes":
                return "tfliteModelSensorTypes";
            case "setTfliteModelNumberOfClasses":
                return "tfliteModelNumberOfClasses";
            case "setTfliteCaptureDelay":
                return "tfliteCaptureDelay";
            case "setTfliteThreshold":
                return "tfliteThreshold";
            case "setTfliteInferencingEnabled":
                return "tfliteInferencingEnabled";

            default:
                throw Error(`no characteristicName for messageType "${messageType}"`);
        }
    }
}

export default BluetoothConnectionManager;
