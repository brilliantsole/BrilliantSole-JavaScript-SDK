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
      { resolution: 200, qualityFactor: 60 },
      false,
    );
    await device.setSensorConfiguration({ camera: 5 });
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
  grabWebcamFrame();
  // setMirrorCamera(true);
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

window.addEventListener("depthestimatorresult", () => {
  if (!webcamVideo.srcObject) {
    return;
  }
  grabWebcamFrame();
});

window.addEventListener("depthestimatorresult", (event) => {
  /** @type {import("../utils/huggingface/depth.js").DepthEstimatorResultEventDetail} */
  const { depthEstimatorResult } = event.detail;
  const { predicted_depth } = depthEstimatorResult;

  const { data } = predicted_depth;

  // find range
  let min = Infinity;
  let max = -Infinity;
  for (const v of data) {
    min = Math.min(min, v);
    max = Math.max(max, v);
  }

  const range = max - min;
  console.log({ min, max, range });
});
