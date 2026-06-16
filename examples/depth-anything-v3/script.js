import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

// DEVICE

const device = new BS.Device();
window.device = device;

// CONNECT

const isSecure =
  location.protocol.startsWith("https") ||
  (false && location.host == "localhost");
console.log({ isSecure });

const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
  if (ipAddressInput.value.length > 0) {
    device.toggleConnection({
      type: "webSocket",
      ipAddress: ipAddressInput.value,
    });
  } else {
    if (isSecure) {
      device.toggleConnection({ type: "webBluetooth" });
    } else {
      device.toggleConnection({ type: "webSocket" });
    }
  }
});
device.addEventListener("connectionStatus", () => {
  let disabled = false;
  let innerText = device.connectionStatus;
  switch (device.connectionStatus) {
    case "notConnected":
      innerText = "connect";
      break;
    case "connected":
      innerText = "disconnect";
      break;
  }
  toggleConnectionButton.disabled = disabled;
  toggleConnectionButton.innerText = innerText;
});

// IP ADDRESS

import { setupLocalStorage } from "../utils/misc/localStorage.js";

const ipAddressInput = document.getElementById("ipAddress");
device.addEventListener("isConnected", () => {
  ipAddressInput.disabled = device.isConnected;
});
const setIpAddress = (newIpAddress) => {
  console.log("setIpAddress", { newIpAddress });
  if (ipAddressInput.value == newIpAddress) {
    return;
  }
  ipAddressInput.value = newIpAddress;
  console.log({ ipAddress: ipAddressInput.value });
};
const {} = setupLocalStorage(
  "ipAddress",
  () => ipAddressInput.value,
  (newIpAddress) => setIpAddress(newIpAddress),
);

// CAMERA

device.addEventListener("connected", async () => {
  if (device.hasCamera) {
    await device.setCameraConfiguration(
      { resolution: 320, qualityFactor: 100 },
      false,
    );
    await device.setSensorConfiguration({ camera: 20 });
  } else {
    console.error("device doesn't have camera");
    device.disconnect();
  }
});

/** @type {HTMLSpanElement} */
const cameraStatusSpan = document.getElementById("cameraStatus");
device.addEventListener("cameraStatus", () => {
  cameraStatusSpan.innerText = device.cameraStatus;
});

/** @type {HTMLButtonElement} */
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  if (device.cameraStatus == "idle") {
    device.takePicture();
  } else {
    device.stopCamera();
  }
});
device.addEventListener("connected", () => {
  updateTakePictureButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateTakePictureButton();
});
const updateTakePictureButton = () => {
  takePictureButton.disabled = !device.isConnected;
  // device.sensorConfiguration.camera == 0 ||
  // device.cameraStatus != "idle";
};
device.addEventListener("cameraStatus", () => {
  updateTakePictureButton();
});

/** @type {HTMLButtonElement} */
const focusCameraButton = document.getElementById("focusCamera");
focusCameraButton.addEventListener("click", () => {
  if (device.cameraStatus == "idle") {
    device.focusCamera();
  } else {
    device.stopCamera();
  }
});
device.addEventListener("connected", () => {
  updateFocusCameraButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateFocusCameraButton();
});
const updateFocusCameraButton = () => {
  focusCameraButton.disabled =
    !device.isConnected || device.cameraStatus != "idle";
};
device.addEventListener("cameraStatus", (event) => {
  updateFocusCameraButton();
  if (
    device.cameraStatus == "idle" &&
    event.message.previousCameraStatus == "focusing"
  ) {
    device.takePicture();
  }
});

/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");
const cameraImageParent = cameraImage.parentElement;
device.addEventListener("cameraImage", (event) => {
  cameraImage.src = event.message.url;
});

/** @type {HTMLProgressElement} */
const cameraImageProgress = document.getElementById("cameraImageProgress");
device.addEventListener("cameraImageProgress", (event) => {
  if (event.message.type == "image") {
    cameraImageProgress.value = event.message.progress;
  }
});

/** @type {HTMLInputElement} */
const autoPictureCheckbox = document.getElementById("autoPicture");
autoPictureCheckbox.addEventListener("input", () => {
  device.autoPicture = autoPictureCheckbox.checked;
});
device.addEventListener("autoPicture", () => {
  autoPictureCheckbox.checked = device.autoPicture;
});

// CAMERA RATE
/** @type {HTMLInputElement} */
const cameraRateInput = document.getElementById("cameraRate");
cameraRateInput.addEventListener("focusout", () => {
  device.setSensorConfiguration({ camera: +cameraRateInput.value });
});
device.addEventListener("isConnected", () => {
  cameraRateInput.disabled = !device.isConnected;
});
device.addEventListener("getSensorConfiguration", (event) => {
  cameraRateInput.value = device.sensorConfiguration.camera ?? 0;
});

// CAMERA RESOLUTION
/** @type {HTMLInputElement} */
const cameraResolutionInput = document.getElementById("cameraResolution");
cameraResolutionInput.addEventListener("focusout", () => {
  device.setCameraConfiguration({ resolution: +cameraResolutionInput.value });
});
device.addEventListener("isConnected", () => {
  cameraResolutionInput.disabled = !device.isConnected;
});
device.addEventListener("getCameraConfiguration", () => {
  cameraResolutionInput.value = device.cameraConfiguration.resolution;
});

// CAMERA QUALITY
/** @type {HTMLInputElement} */
const cameraQualityInput = document.getElementById("cameraQuality");
cameraQualityInput.addEventListener("focusout", () => {
  device.setCameraConfiguration({ qualityFactor: +cameraQualityInput.value });
});
device.addEventListener("isConnected", () => {
  cameraQualityInput.disabled = !device.isConnected;
});
device.addEventListener("getCameraConfiguration", () => {
  cameraQualityInput.value = device.cameraConfiguration.qualityFactor;
});

// WEBCAM
const webcamSelect = document.querySelector("[data-camera]");
const webcamVideo = document.getElementById("cameraVideo");

webcamSelect.addEventListener("cameraStreamStart", (event) => {
  const { cameraStream } = event.detail;
  console.log("cameraStream", cameraStream);
  webcamVideo.srcObject = cameraStream;

  webcamVideo.addEventListener(
    "loadeddata",
    async () => {
      await BS.wait(100);
      grabWebcamFrame();
      // setMirrorCamera(true);
    },
    { once: true },
  );
});
webcamSelect.addEventListener("cameraStreamStop", () => {
  console.log("stopCameraStream");
  webcamVideo.srcObject = undefined;
  // setMirrorCamera(false);
});

const webcamCanvas = document.createElement("canvas");
const webcamContext = webcamCanvas.getContext("2d");
webcamVideo.addEventListener("loadedmetadata", () => {
  const { videoWidth, videoHeight } = webcamVideo;
  webcamCanvas.width = videoWidth;
  webcamCanvas.height = videoHeight;
  console.log({ videoWidth, videoHeight });
});
webcamVideo.addEventListener("emptied", () => {
  // cameraImage.src = undefined;
});

const grabWebcamFrame = () => {
  // console.log("grabWebcamFrame");
  webcamContext.drawImage(
    webcamVideo,
    0,
    0,
    webcamCanvas.width,
    webcamCanvas.height,
  );
  cameraImage.src = webcamCanvas.toDataURL("image/png");
  // console.log("cameraImage.src", cameraImage.src);
};
window.grabWebcamFrame = grabWebcamFrame;

const imageContainer = document.getElementById("imageContainer");
const toggleMirrorCameraButton = document.getElementById("toggleMirrorCamera");
let mirrorCamera = false;
const setMirrorCamera = (newMirrorCamera) => {
  mirrorCamera = newMirrorCamera;
  // console.log({ mirrorCamera });
  imageContainer.style.transform = mirrorCamera ? "scaleX(-1)" : "";
  toggleMirrorCameraButton.innerText = mirrorCamera
    ? "unmirror camera"
    : "mirror camera";
};
toggleMirrorCameraButton.addEventListener("click", () => {
  setMirrorCamera(!mirrorCamera);
});

// DEPTH

window.addEventListener("depthanything3result", () => {
  if (!webcamVideo.srcObject) {
    return;
  }
  grabWebcamFrame();
});

window.addEventListener("depthanything3result", (event) => {
  /** @type {import("./depth-anything-v3.js").DepthAnything3ResultEventDetail} */
  const { depthAnything3Result } = event.detail;
  const { closestDepth } = depthAnything3Result;
  console.log({ closestDepth });
  depthSpan.innerText = closestDepth.toFixed(3);

  const depthLerp = depthThresholds.lerp(closestDepth);
  // console.log({ depthLerp });
  depthFeedbackMeter.value = closestDepth;

  /** @type {DepthStatus} */
  let newDepthStatus;
  const { low, high } = depthFeedbackMeter;
  if (closestDepth < low) {
    newDepthStatus = "too close";
  } else if (closestDepth < high) {
    newDepthStatus = "close";
  } else {
    newDepthStatus = "safe";
  }
  console.log({ newDepthStatus });
  setDepthStatus(newDepthStatus);
});

/** @typedef {"safe" | "close" | "too close"} DepthStatus */
/** @type {DepthStatus} */
let depthStatus = "safe";
/** @param {DepthStatus} newDepthStatus */
const setDepthStatus = (newDepthStatus) => {
  if (newDepthStatus == depthStatus) {
    // return;
  }
  depthStatus = newDepthStatus;
  console.log({ depthStatus });
  setLEDs(false);
  setVibration(true);
};
window.setDepthStatus = setDepthStatus;

/** @param {boolean} sendImmediately */
const setLEDs = async (sendImmediately) => {
  if (!device.isConnected) {
    return;
  }
  if (!device.hasLeds) {
    return;
  }

  let color;
  switch (depthStatus) {
    case "safe":
      color = "green";
      break;
    case "close":
      color = "yellow";
      break;
    case "too close":
      color = "red";
      break;
    default:
      console.log(`uncaught depthStatus "${depthStatus}"`);
      break;
  }

  /** @type {BS.LedConfiguration[]} */
  const ledConfigs = device.leds
    .filter((led) => led.isRGB)
    .map((led) => ({ index: led.index, color }));
  await device.setLeds(ledConfigs, sendImmediately);
};
/** @param {boolean} sendImmediately */
const setVibration = async (sendImmediately) => {
  if (!device.isConnected) {
    return;
  }
  if (!device.hasVibration) {
    return;
  }

  /** @type {BS.VibrationWaveformSegment[]} */
  const segments = [];
  switch (depthStatus) {
    case "safe":
      break;
    case "close":
      segments.push({ amplitude: 1, duration: 100 });
      break;
    case "too close":
      segments.push({ amplitude: 1, duration: 300 });
      break;
    default:
      console.log(`uncaught depthStatus "${depthStatus}"`);
      break;
  }

  device.triggerVibration({ type: "waveform", segments }, sendImmediately);
};

/** @type {HTMLSpanElement} */
const depthSpan = document.getElementById("depth");
/** @type {HTMLInputElement} */
const depthMinThresholdInput = document.getElementById("depthMinThreshold");
/** @type {HTMLInputElement} */
const depthMaxThresholdInput = document.getElementById("depthMaxThreshold");

const depthThresholds = {
  min: +depthMinThresholdInput.value,
  max: +depthMaxThresholdInput.value,
  lerp(value) {
    return Math.max(0, Math.min(1, (value - this.min) / (this.max - this.min)));
  },
};
window.depthThresholds = depthThresholds;

depthMinThresholdInput.addEventListener("input", () => {
  depthThresholds.min = +depthMinThresholdInput.value;
  depthFeedbackMeter.low = depthThresholds.min;
});
depthMaxThresholdInput.addEventListener("input", () => {
  depthThresholds.max = +depthMaxThresholdInput.value;
  depthFeedbackMeter.high = depthThresholds.max;
});

/** @type {HTMLMeterElement} */
const depthFeedbackMeter = document.getElementById("depthFeedback");
