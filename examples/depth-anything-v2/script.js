import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

// DEVICE
/** @type {BS.Device?} */
let currentDevice;

/** @param {(device: BS.Device)=>void} callback */
const onCurrentDevice = (callback) => {
  BS.DeviceManager.addEventListener("deviceConnected", (event) => {
    if (event.message.device == currentDevice) {
      callback(currentDevice);
    }
  });
};

BS.DeviceManager.addEventListener("deviceConnected", (event) => {
  const { device } = event.message;
  if (!currentDevice?.isConnected) {
    onDevice(device);
  }
});
BS.DeviceManager.addEventListener("deviceNotConnected", (event) => {
  const { device } = event.message;
  if (currentDevice == device) {
    console.log("currentDevice is gone");
    currentDevice.removeAllEventListeners();
    const nextConnectedDevice = BS.DeviceManager.connectedDevices[0];
    console.log("nextConnectedDevice", nextConnectedDevice);
    if (nextConnectedDevice) {
      onDevice(nextConnectedDevice);
    }
  }
});

/** @param {BS.Device} device */
const onDevice = (device, replaceCurrentDevice = false) => {
  if (currentDevice?.isConnected) {
    if (!replaceCurrentDevice) {
      return;
    }
    currentDevice.removeAllEventListeners();
  }
  currentDevice = device;
  console.log("currentDevice", currentDevice);
};

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", async () => {
  if (currentDevice) {
    currentDevice.toggleConnection();
  } else {
    toggleConnectionButton.innerText = "connecting...";
    await BS.Device.Connect();
    if (!currentDevice) {
      toggleConnectionButton.innerText = "connect";
    }
  }
});

onCurrentDevice((device) => {
  device.addEventListener(
    "connectionStatus",
    () => {
      switch (device.connectionStatus) {
        case "connected":
        case "notConnected":
          toggleConnectionButton.disabled = false;
          toggleConnectionButton.innerText = device.isConnected
            ? "disconnect"
            : "connect";
          break;
        case "connecting":
        case "disconnecting":
          toggleConnectionButton.disabled = true;
          toggleConnectionButton.innerText = currentDevice.connectionStatus;
          break;
      }
    },
    { immediate: true },
  );
});

// CAMERA

onCurrentDevice(async (device) => {
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
onCurrentDevice((device) => {
  device.addEventListener("cameraStatus", () => {
    cameraStatusSpan.innerText = device.cameraStatus;
  });
});

/** @type {HTMLButtonElement} */
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  if (currentDevice.cameraStatus == "idle") {
    currentDevice.takePicture();
  } else {
    currentDevice.stopCamera();
  }
});
onCurrentDevice((device) => {
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      updateTakePictureButton();
    },
    { immediate: true },
  );
});

const updateTakePictureButton = () => {
  takePictureButton.disabled = !currentDevice.isConnected;
  // device.sensorConfiguration.camera == 0 ||
  // device.cameraStatus != "idle";
};
onCurrentDevice((device) => {
  device.addEventListener("cameraStatus", () => {
    updateTakePictureButton();
  });
});

/** @type {HTMLButtonElement} */
const focusCameraButton = document.getElementById("focusCamera");
focusCameraButton.addEventListener("click", () => {
  if (currentDevice.cameraStatus == "idle") {
    currentDevice.focusCamera();
  } else {
    currentDevice.stopCamera();
  }
});
onCurrentDevice((device) => {
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      updateFocusCameraButton();
    },
    { immediate: true },
  );
});

const updateFocusCameraButton = () => {
  focusCameraButton.disabled =
    !currentDevice.isConnected || currentDevice.cameraStatus != "idle";
};
onCurrentDevice((device) => {
  device.addEventListener("cameraStatus", (event) => {
    updateFocusCameraButton();
    if (
      device.cameraStatus == "idle" &&
      event.message.previousCameraStatus == "focusing"
    ) {
      device.takePicture();
    }
  });
});

/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");
const cameraImageParent = cameraImage.parentElement;
onCurrentDevice((device) => {
  device.addEventListener("cameraImage", (event) => {
    cameraImage.src = event.message.url;
  });
});

/** @type {HTMLProgressElement} */
const cameraImageProgress = document.getElementById("cameraImageProgress");
onCurrentDevice((device) => {
  device.addEventListener("cameraImageProgress", (event) => {
    if (event.message.type == "image") {
      cameraImageProgress.value = event.message.progress;
    }
  });
});

/** @type {HTMLInputElement} */
const autoPictureCheckbox = document.getElementById("autoPicture");
autoPictureCheckbox.addEventListener("input", () => {
  currentDevice.autoPicture = autoPictureCheckbox.checked;
});
onCurrentDevice((device) => {
  device.addEventListener("autoPicture", () => {
    autoPictureCheckbox.checked = device.autoPicture;
  });
});

// CAMERA RATE
/** @type {HTMLInputElement} */
const cameraRateInput = document.getElementById("cameraRate");
cameraRateInput.addEventListener("focusout", () => {
  currentDevice.setSensorConfiguration({ camera: +cameraRateInput.value });
});
onCurrentDevice((device) => {
  device.addEventListener(
    "isConnected",
    () => {
      cameraRateInput.disabled = !device.isConnected;
    },
    { immediate: true },
  );
  device.addEventListener(
    "getSensorConfiguration",
    (event) => {
      cameraRateInput.value = device.sensorConfiguration.camera ?? 0;
    },
    { immediate: true },
  );
});

// CAMERA RESOLUTION
/** @type {HTMLInputElement} */
const cameraResolutionInput = document.getElementById("cameraResolution");
cameraResolutionInput.addEventListener("focusout", () => {
  device.setCameraConfiguration({ resolution: +cameraResolutionInput.value });
});
onCurrentDevice((device) => {
  device.addEventListener(
    "isConnected",
    () => {
      cameraResolutionInput.disabled = !device.isConnected;
    },
    { immediate: true },
  );
  device.addEventListener(
    "getCameraConfiguration",
    () => {
      cameraResolutionInput.value = device.cameraConfiguration.resolution;
    },
    { immediate: true },
  );
});

// CAMERA QUALITY
/** @type {HTMLInputElement} */
const cameraQualityInput = document.getElementById("cameraQuality");
cameraQualityInput.addEventListener("focusout", () => {
  currentDevice.setCameraConfiguration({
    qualityFactor: +cameraQualityInput.value,
  });
});
onCurrentDevice((device) => {
  device.addEventListener(
    "isConnected",
    () => {
      cameraQualityInput.disabled = !device.isConnected;
    },
    { immediate: true },
  );
  device.addEventListener(
    "getCameraConfiguration",
    () => {
      cameraQualityInput.value = device.cameraConfiguration.qualityFactor;
    },
    { immediate: true },
  );
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
