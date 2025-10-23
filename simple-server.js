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
