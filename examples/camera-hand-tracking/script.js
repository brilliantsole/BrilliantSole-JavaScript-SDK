import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log(BS);

// DEVICE

const device = new BS.Device();
console.log({ device });
window.device = device;

// CONNECT

const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () =>
  device.toggleConnection()
);
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

// CAMERA

device.addEventListener("connected", () => {
  if (device.hasCamera) {
    //device.setSensorConfiguration({camera:20})
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
    !device.isConnected ||
    device.sensorConfiguration.camera == 0 ||
    device.cameraStatus != "idle";
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

/** @type {HTMLButtonElement} */
const sleepCameraButton = document.getElementById("sleepCamera");
sleepCameraButton.addEventListener("click", () => {
  if (device.cameraStatus == "asleep") {
    device.wakeCamera();
  } else {
    device.sleepCamera();
  }
});
device.addEventListener("connected", () => {
  updateSleepCameraButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateSleepCameraButton();
});
const updateSleepCameraButton = () => {
  let disabled = !device.isConnected || !device.hasCamera;
  switch (device.cameraStatus) {
    case "asleep":
      sleepCameraButton.innerText = "wake camera";
      break;
    case "idle":
      sleepCameraButton.innerText = "sleep camera";
      break;
    default:
      disabled = true;
      break;
  }
  sleepCameraButton.disabled = disabled;
};
device.addEventListener("cameraStatus", () => {
  updateSleepCameraButton();
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

/** @type {HTMLPreElement} */
const cameraConfigurationPre = document.getElementById(
  "cameraConfigurationPre"
);
device.addEventListener("getCameraConfiguration", () => {
  cameraConfigurationPre.textContent = JSON.stringify(
    device.cameraConfiguration,
    null,
    2
  );
});

const cameraConfigurationContainer = document.getElementById(
  "cameraConfiguration"
);
/** @type {HTMLTemplateElement} */
const cameraConfigurationTypeTemplate = document.getElementById(
  "cameraConfigurationTypeTemplate"
);
BS.CameraConfigurationTypes.forEach((cameraConfigurationType) => {
  const cameraConfigurationTypeContainer =
    cameraConfigurationTypeTemplate.content
      .cloneNode(true)
      .querySelector(".cameraConfigurationType");

  cameraConfigurationContainer.appendChild(cameraConfigurationTypeContainer);

  cameraConfigurationTypeContainer.querySelector(".type").innerText =
    cameraConfigurationType;

  /** @type {HTMLInputElement} */
  const input = cameraConfigurationTypeContainer.querySelector("input");

  /** @type {HTMLSpanElement} */
  const span = cameraConfigurationTypeContainer.querySelector("span");

  device.addEventListener("isConnected", () => {
    updateIsInputDisabled();
  });
  device.addEventListener("connected", () => {
    updateContainerVisibility();
  });
  device.addEventListener("cameraStatus", () => {
    updateIsInputDisabled();
  });
  const updateIsInputDisabled = () => {
    input.disabled =
      !device.isConnected || !device.hasCamera || device.cameraStatus != "idle";
  };

  const updateContainerVisibility = () => {
    const isVisible = cameraConfigurationType in device.cameraConfiguration;
    cameraConfigurationTypeContainer.style.display = isVisible ? "" : "none";
  };

  const updateInput = () => {
    const value = device.cameraConfiguration[cameraConfigurationType];
    span.innerText = value;
    input.value = value;
  };

  device.addEventListener("connected", () => {
    if (!device.hasCamera) {
      return;
    }
    const range = device.cameraConfigurationRanges[cameraConfigurationType];
    input.min = range.min;
    input.max = range.max;

    updateInput();
  });

  device.addEventListener("getCameraConfiguration", () => {
    updateInput();
  });

  input.addEventListener("change", () => {
    const value = Number(input.value);
    // console.log(`updating ${cameraConfigurationType} to ${value}`);
    device.setCameraConfiguration({
      [cameraConfigurationType]: value,
    });
    if (takePictureAfterUpdate) {
      device.addEventListener(
        "getCameraConfiguration",
        () => {
          setTimeout(() => device.takePicture()), 100;
        },
        { once: true }
      );
    }
  });
});

/** @type {HTMLInputElement} */
const takePictureAfterUpdateCheckbox = document.getElementById(
  "takePictureAfterUpdate"
);
let takePictureAfterUpdate = false;
takePictureAfterUpdateCheckbox.addEventListener("input", () => {
  takePictureAfterUpdate = takePictureAfterUpdateCheckbox.checked;
  console.log({ takePictureAfterUpdate });
});

// ROTATE PICTURE

/** @type {import("three")} */
const THREE = window.THREE;

const orientationVector3 = new THREE.Vector3();

const euler = new THREE.Euler();
euler.order = "YXZ";
const quaternion = new THREE.Quaternion();
let cameraRoll = 0;

let rotationEnabled = false;
const toggleRotationCheckbox = document.getElementById("toggleRotation");
toggleRotationCheckbox.addEventListener("input", () => {
  rotationEnabled = toggleRotationCheckbox.checked;
  console.log({ rotatePicture: rotationEnabled });
  updateRotation();
});
device.addEventListener("isConnected", () => {
  const enabled =
    device.isConnected &&
    (device.hasSensorType("gameRotation") ||
      device.hasSensorType("orientation"));
  toggleRotationCheckbox.disabled = !enabled;
});
device.addEventListener("connected", () => {
  updateRotation();
});
const updateRotation = () => {
  if (!rotationEnabled) {
    cameraImageParent.style.transform = `rotate(${0}rad)`;
  }
  if (!device.isConnected) {
    return;
  }
  /** @type {BS.SensorType} */
  const sensorType = device.hasSensorType("gameRotation")
    ? "gameRotation"
    : "orientation";
  device.setSensorConfiguration({ [sensorType]: rotationEnabled ? 20 : 0 });
};
device.addEventListener("gameRotation", (event) => {
  quaternion.copy(event.message.gameRotation);
  euler.setFromQuaternion(quaternion);
  console.log({ cameraRoll: euler.z });
});
device.addEventListener("orientation", (event) => {
  const { heading, pitch, roll } = event.message.orientation;
  orientationVector3.set(pitch, heading, roll).multiplyScalar(Math.PI / 180);
  euler.setFromVector3(orientationVector3);
  console.log({ cameraRoll: euler.z });
});

device.addEventListener("cameraStatus", () => {
  if (rotationEnabled && device.cameraStatus == "takingPicture") {
    cameraRoll = euler.z;
    console.log({ cameraRoll });
  }
});
cameraImage.addEventListener("load", () => {
  if (rotationEnabled) {
    cameraImageParent.style.transform = `rotate(${-cameraRoll}rad)`;
  } else {
    cameraImageParent.style.transform = `rotate(${0}rad)`;
  }
});

// HAND TRACKING

/** @type {HTMLCanvasElement} */
const imageOverlay = document.getElementById("imageOverlay");
const imageOverlayContext = imageOverlay.getContext("2d");

import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
);
const handLandmarker = await HandLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
    delegate: "GPU",
  },
  runningMode: "VIDEO",
  numHands: 2,
  /**
   * The minimum confidence score for the hand detection to be considered successful in palm detection model.
   */
  minHandDetectionConfidence: 0.5,
  /**
   * The minimum confidence score for the hand presence score in the hand landmark detection model.
   * In Video mode and Live stream mode, if the hand presence confidence score from the hand landmark model is below this threshold,
   * Hand Landmarker triggers the palm detection model.
   * Otherwise, a lightweight hand tracking algorithm determines the location of the hand(s) for subsequent landmark detections.
   */
  minHandPresenceConfidence: 0.5,
  /**
   * The minimum confidence score for the hand tracking to be considered successful.
   * This is the bounding box IoU threshold between hands in the current frame and the last frame.
   * In Video mode and Stream mode of Hand Landmarker, if the tracking fails, Hand Landmarker triggers hand detection.
   * Otherwise, it skips the hand detection.
   */
  minTrackingConfidence: 0.5,
});
console.log("created handLandmarker", handLandmarker);

cameraImage.addEventListener("load", () => {
  imageOverlayContext.clearRect(0, 0, imageOverlay.width, imageOverlay.height);

  const handLandmarkerResult = handLandmarker.detectForVideo(
    cameraImage,
    performance.now()
  );

  //console.log("handLandmarkerResult", handLandmarkerResult);

  for (const landmarks of handLandmarkerResult.landmarks) {
    drawConnectors(imageOverlayContext, landmarks, HAND_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 3,
    });
    drawLandmarks(imageOverlayContext, landmarks, {
      color: "#FF0000",
      lineWidth: 0,
      radius: 3,
    });
  }

  scene.emit("handLandmarkerResult", { handLandmarkerResult });
});

// A-FRAME

const scene = document.querySelector("a-scene");
const camera = scene.querySelector("a-camera");

const sceneCameraImage = document.getElementById("sceneCameraImage");
cameraImage.addEventListener("load", () => {
  sceneCameraImage.src = cameraImage.src;
});

const _quaternion = new THREE.Quaternion();
const targetQuaternion = new THREE.Quaternion();
window.interpolationSmoothing = 0.4;

const offsetQuaternion = new THREE.Quaternion();
const offsetEuler = new THREE.Euler("YXZ");
const resetRotation = () => {
  offsetEuler.setFromQuaternion(_quaternion);
  offsetEuler.x = offsetEuler.z = 0;
  offsetEuler.y = -offsetEuler.y;
  offsetQuaternion.setFromEuler(offsetEuler);
};
window.resetRotation = resetRotation;
const resetRotationButton = document.getElementById("resetRotation");
resetRotationButton.addEventListener("click", () => {
  resetRotation();
});

/**
 * @param {BS.Quaternion} quaternion
 * @param {boolean} applyOffset
 */
const updateQuaternion = (quaternion, applyOffset = true) => {
  _quaternion.copy(quaternion);
  targetQuaternion.copy(_quaternion);
  if (applyOffset) {
    targetQuaternion.multiply(offsetQuaternion);
  }
  camera.object3D.quaternion.slerp(
    targetQuaternion,
    window.interpolationSmoothing
  );
};

device.addEventListener("gameRotation", (event) => {
  const { gameRotation } = event.message;
  updateQuaternion(gameRotation);
});

// CAMERA

/** @type {HTMLVideoElement} */
const cameraVideo = document.getElementById("cameraVideo");
cameraVideo.volume = 0.0001;
const cameraCanvas = document.createElement("canvas");
const cameraContext = cameraCanvas.getContext("2d");
cameraVideo.addEventListener("loadedmetadata", () => {
  const { videoWidth, videoHeight } = cameraVideo;
  //cameraVideo.removeAttribute("hidden");
  cameraCanvas.width = videoWidth;
  cameraCanvas.height = videoHeight;
});
cameraVideo.addEventListener("emptied", () => {
  cameraVideo.setAttribute("hidden", "");
});

cameraVideo.addEventListener("playing", () => {
  drawCameraVideo();
});
const drawCameraVideo = () => {
  if (cameraVideo.paused) {
    return;
  }
  cameraContext.drawImage(
    cameraVideo,
    0,
    0,
    cameraCanvas.width,
    cameraCanvas.height
  );
  cameraImage.src = cameraCanvas.toDataURL("image/png");
  requestAnimationFrame(drawCameraVideo);
};

const mediaContainer = document.getElementById("mediaContainer");
const toggleMirrorCameraButton = document.getElementById("toggleMirrorCamera");
let mirrorCamera = false;
const setMirrorCamera = (newMirrorCamera) => {
  mirrorCamera = newMirrorCamera;
  // console.log({ mirrorCamera });
  mediaContainer.style.transform = mirrorCamera ? "scaleX(-1)" : "";
  toggleMirrorCameraButton.innerText = mirrorCamera
    ? "unmirror camera"
    : "mirror camera";
};
toggleMirrorCameraButton.addEventListener("click", () => {
  setMirrorCamera(!mirrorCamera);
});
setMirrorCamera(true);

/** @type {HTMLSelectElement} */
const cameraInput = document.getElementById("cameraInput");
const cameraInputOptgroup = cameraInput.querySelector("optgroup");
cameraInput.addEventListener("input", () => {
  selectCameraInput(cameraInput.value);
});

cameraInput.addEventListener("click", async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind == "videoinput");
  console.log("videoDevices", videoDevices);
  if (videoDevices.length == 1 && videoDevices[0].deviceId == "") {
    console.log("getting camera");
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    cameraStream.getVideoTracks().forEach((track) => track.stop());
    updateCameraSources();
  }
});

const updateCameraSources = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  cameraInputOptgroup.innerHTML = "";
  cameraInputOptgroup.appendChild(new Option("none"));
  devices
    .filter((device) => device.kind == "videoinput")
    .forEach((videoInputDevice) => {
      cameraInputOptgroup.appendChild(
        new Option(videoInputDevice.label, videoInputDevice.deviceId)
      );
    });
  cameraInput.value = "none";
  selectCameraInput(cameraInput.value);
};
/** @type {MediaStream?} */
let cameraStream;
const selectCameraInput = async (deviceId) => {
  stopCameraStream();
  if (deviceId != "none") {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        aspectRatio: 4 / 3,
        // width: { ideal: 1280 },
        // height: { ideal: 1280 },
      },
    });
    cameraVideo.srcObject = cameraStream;
    console.log("got cameraStream", deviceId, cameraStream);
  }
};
const stopCameraStream = () => {
  if (cameraStream) {
    console.log("stopping cameraStream");
    cameraStream.getVideoTracks().forEach((track) => track.stop());
  }
  cameraStream = undefined;
  cameraVideo.srcObject = undefined;
};
navigator.mediaDevices.addEventListener("devicechange", () =>
  updateCameraSources()
);
updateCameraSources();
