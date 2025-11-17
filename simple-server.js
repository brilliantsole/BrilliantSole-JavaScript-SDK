import express from "express";
import https, { Server } from "https";
import http from "http";
const app = express();
import fs from "fs";
import ip from "ip";
import path from "path";
import * as BS from "./build/brilliantsole.node.module.js";
import { WebSocketServer } from "ws";
import * as dgram from "dgram";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

process.on("warning", (e) => console.warn(e.stack));

// BS.setAllConsoleLevelFlags({ log: true });
// BS.setConsoleLevelFlagsForType("EventDispatcher", { log: false });
// BS.setConsoleLevelFlagsForType("BaseScanner", { log: true });
// BS.setConsoleLevelFlagsForType("NobleScanner", { log: true });
// BS.setConsoleLevelFlagsForType("NobleConnectionManager", { log: true });

// HTTPS SERVER
app.use(function (req, res, next) {
  //res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  //res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  //res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Add CORS headers
  res.header("Access-Control-Allow-Origin", "http://localhost"); // Adjust this to your allowed origin
  res.header("Access-Control-Allow-Origin", "https://localhost"); // Adjust this to your allowed origin
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"); // Allowed HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allowed headers
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Allow cookies or other credentials if needed

  // Handle preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // No Content
  }

  next();
});

const useHttps = process.env.USE_HTTPS == "true";
const redirectToHttps = useHttps && process.env.REDIRECT_TO_HTTPS == "true";
app.use((req, res, next) => {
  const host = req.headers.host;
  if (redirectToHttps && req.protocol !== "https") {
    return res.redirect(301, "https://" + req.headers.host + req.url); // Always redirect to HTTPS
  }
  next();
});
app.use(express.static("./"));
app.use(express.json());

const httpServer = http.createServer(app);
httpServer.listen(80, () => {
  console.log(
    `server listening on http://localhost and http://${ip.address()}`
  );
});

/** @type {Server?} */
let httpsServer;
if (useHttps) {
  const serverOptions = {
    key: fs.readFileSync("./sec/key.pem"),
    cert: fs.readFileSync("./sec/cert.pem"),
  };
  httpsServer = https.createServer(serverOptions, app);
  httpsServer.listen(443, () => {
    console.log(
      `server listening on  https://localhost and https://${ip.address()}`
    );
  });
}

// WEBSOCKET
const ws = new WebSocketServer({ server: httpsServer ?? httpServer });
const webSocketServer = new BS.WebSocketServer();
webSocketServer.server = ws;

// UDP
const udpSocket = dgram.createSocket("udp4");
const udpServer = new BS.UDPServer();
udpServer.socket = udpSocket;
udpSocket.bind(3000);

// BLOB

async function saveBlobUrlContent(folderPath, blob, filename) {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = path.join(folderPath, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`File '${filename}' saved successfully in '${folderPath}'.`);
  } catch (err) {
    console.error(`Error saving blob URL content: ${err}`);
  }
}

// MICROPHONE

const saveMicrophoneRecordingsToFolder =
  process.env.SAVE_MICROPHONE_RECORDINGS_TO_FOLDER == "true";
/** @param {BS.DeviceEventMap["microphoneRecording"]} event */
function onMicrophoneRecording(event) {
  if (!saveMicrophoneRecordingsToFolder) {
    return;
  }
  saveBlobUrlContent(
    microphoneFolderPath,
    event.message.blob,
    `${new Date().toLocaleString().replaceAll("/", "-")}.wav`
  );
}

const microphoneFolderName = "microphoneRecordings";
const microphoneFolderPath = `./${microphoneFolderName}`;
if (saveMicrophoneRecordingsToFolder) {
  if (!fs.existsSync(microphoneFolderPath)) {
    fs.mkdirSync(microphoneFolderPath);
    console.log(`Folder '${microphoneFolderName}' created successfully.`);
  } else {
    console.log(`Folder '${microphoneFolderName}' already exists.`);
  }
}

const autoRecordMicrophone = process.env.AUTO_RECORD_MICROPHONE == "true";
/** @param {BS.DeviceEventMap["microphoneStatus"]} event */
function onMicrophoneStatus(event) {
  if (!autoRecordMicrophone) {
    return;
  }
  const device = event.target;
  const { microphoneStatus } = event.message;
  if (microphoneStatus == "streaming") {
    device.startRecordingMicrophone();
  } else {
    if (device.isRecordingMicrophone) {
      device.stopRecordingMicrophone();
    }
  }
}

// CAMERA

const saveCameraImagesToFolder =
  process.env.SAVE_CAMERA_IMAGES_TO_FOLDER == "true";

const cameraFolderName = "cameraImages";
const cameraFolderPath = `./${cameraFolderName}`;
if (saveCameraImagesToFolder) {
  if (!fs.existsSync(cameraFolderPath)) {
    fs.mkdirSync(cameraFolderPath);
    console.log(`Folder '${cameraFolderPath}' created successfully.`);
  } else {
    console.log(`Folder '${cameraFolderPath}' already exists.`);
  }
}

/** @param {BS.DeviceEventMap["cameraImage"]} event */
function onCameraImage(event) {
  if (!saveCameraImagesToFolder) {
    return;
  }
  saveBlobUrlContent(
    cameraFolderPath,
    event.message.blob,
    `${new Date().toLocaleString().replaceAll("/", "-")}.jpg`
  );
}

// DEVICE LISTENERS

/** @param {BS.DeviceEventMap["acceleration"]} event */
function onAcceleration(event) {
  const device = event.target;
  const { acceleration, timestamp } = event.message;
  console.log(
    `[${timestamp}] received acceleration data from "${device.name}"`,
    acceleration
  );
}

/** @param {BS.DeviceEventMap["microphoneData"]} event */
function onMicrophoneData(event) {
  //console.log(event.message.samples);
}

/** @type {BS.BoundDeviceEventListeners} */
const boundDeviceEventListeners = {
  acceleration: onAcceleration,

  microphoneData: onMicrophoneData,
  microphoneRecording: onMicrophoneRecording,
  microphoneStatus: onMicrophoneStatus,

  cameraImage: onCameraImage,

  fileTransferStatus: onFileTransferStatus,
  fileTransferProgress: onFileTransferProgress,
  fileTransferComplete: onFileTransferComplete,

  tfliteIsReady: onTfliteIsReady,
  getTfliteInferencingEnabled: onTfliteInferencingEnabled,
  tfliteInference: onTfliteInference,
};

BS.DeviceManager.AddEventListener("deviceIsConnected", (event) => {
  const { device } = event.message;
  console.log(
    `device "${device.name}" ${
      device.isConnected ? "connected" : "disconnected"
    }`
  );
  if (device.isConnected) {
    BS.EventUtils.addEventListeners(device, boundDeviceEventListeners);
  } else {
    BS.EventUtils.removeEventListeners(device, boundDeviceEventListeners);
  }
});

// TFLITE
const sendTfliteModel = process.env.SEND_TFLITE_MODEL == "true";
if (sendTfliteModel) {
  try {
    const file = fs.readFileSync(process.env.TFLITE_MODEL_PATH);
    const fileName =
      process.env.TFLITE_MODEL_PATH.split("/").pop().split(".")[0] ?? "model";

    /** @type {BS.TfliteFileConfiguration} */
    const tfliteConfiguration = {
      type: "tflite",
      name: fileName,
      sensorTypes: ["gyroscope", "linearAcceleration"],
      task: "classification",
      sampleRate: 20,
      captureDelay: 500,
      threshold: 0.7,
      classes: ["idle", "kick", "stomp", "tap"],
      file,
    };

    BS.DeviceManager.AddEventListener("deviceConnected", async (event) => {
      const { device } = event.message;
      if (
        tfliteConfiguration.sensorTypes.every(
          (sensorType) => sensorType in device.sensorConfiguration
        )
      ) {
        console.log(
          `sending tfliteConfiguration "${tfliteConfiguration.name}" to "${device.name}"...`
        );
        try {
          await device.sendTfliteConfiguration(tfliteConfiguration);
        } catch (error) {
          console.error(
            `error sending tfliteConfiguration "${tfliteConfiguration.name}" to "${device.name}"`,
            error
          );
        }
      } else {
        console.log(
          `device "${
            device.name
          }" doesn't contain all required sensorTypes ${tfliteConfiguration.sensorTypes.join(
            ","
          )} for tflite model "${tfliteConfiguration.name}"`
        );
      }
    });
  } catch (error) {
    console.error(
      `failed to get tflite model file at "${process.env.TFLITE_MODEL_PATH}"`
    );
  }
}

// FILE TRANSFER LISTENERS

/** @param {BS.DeviceEventMap["fileTransferStatus"]} event */
function onFileTransferStatus(event) {
  const device = event.target;
  const { fileTransferStatus } = event.message;
  console.log(`fileTransferStatus for "${device.name}": ${fileTransferStatus}`);
}

/** @param {BS.DeviceEventMap["fileTransferProgress"]} event */
function onFileTransferProgress(event) {
  const device = event.target;
  const { progress } = event.message;
  console.log(`fileTransferProgress for "${device.name}": ${progress}%`);
}

/** @param {BS.DeviceEventMap["fileTransferComplete"]} event */
function onFileTransferComplete(event) {
  const device = event.target;
  console.log(`fileTransferComplete for "${device.name}"`);
}

// TFLITE LISTENERS

/** @param {BS.DeviceEventMap["tfliteIsReady"]} event */
async function onTfliteIsReady(event) {
  const device = event.target;
  const { tfliteIsReady } = event.message;
  console.log(`tfliteIsReady for "${device.name}"? ${tfliteIsReady}`);
  if (tfliteIsReady) {
    console.log(`enabling tfliteInferencing for "${device.name}"...`);
    await device.enableTfliteInferencing();
  }
}

/** @param {BS.DeviceEventMap["getTfliteInferencingEnabled"]} event */
function onTfliteInferencingEnabled(event) {
  const device = event.target;
  const { tfliteInferencingEnabled } = event.message;
  console.log(
    `tfliteInferencingEnabled for "${device.name}"? ${tfliteInferencingEnabled}`
  );
}

/** @param {BS.DeviceEventMap["tfliteInference"]} event */
function onTfliteInference(event) {
  const device = event.target;
  const { tfliteInference } = event.message;
  console.log(`tfliteInference for "${device.name}"`, tfliteInference);
}

// AUTO SCAN

const autoScan = process.env.AUTO_SCAN == "true";
const autoEnableSensorData = process.env.AUTO_ENABLE_SENSOR_DATA == "true";
if (autoScan) {
  BS.Scanner.addEventListener("scanningAvailable", (event) => {
    console.log("scanningAvailable");
    // automatically scan when available
    BS.Scanner.startScan();
  });
  BS.Scanner.addEventListener("isScanning", (event) => {
    const { isScanning } = event.message;
    console.log(`isScanning? ${isScanning}`);
  });
  BS.Scanner.addEventListener("discoveredDevice", (event) => {
    const { discoveredDevice } = event.message;
    // connect to first available device
    BS.Scanner.connectToDevice(discoveredDevice.bluetoothId);
    console.log("connecting to discoveredDevice...", discoveredDevice);
  });
  BS.DeviceManager.AddEventListener("deviceConnected", (event) => {
    console.log("device connected - stopping scan...");
    BS.Scanner.stopScan();

    const { device } = event.message;
    console.log(`connected to "${device.name}"`);
    if (autoEnableSensorData) {
      console.log("setting configuration...");
      device.setSensorConfiguration({ acceleration: 20 });
    }
  });
  BS.DeviceManager.AddEventListener("deviceDisconnected", (event) => {
    console.log("device disconnected - restarting scan...");
    BS.Scanner.startScan();
  });
}
