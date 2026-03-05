import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

const device = new BS.Device();
window.device = device;

// CONNECTION START
const deviceIpAddressInput = document.getElementById("deviceIpAddress");
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
  if (deviceIpAddressInput.value) {
    device.toggleConnection({
      type: "webSocket",
      ipAddress: deviceIpAddressInput.value,
    });
  } else {
    device.toggleConnection();
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
// CONNECTION END

// THREE START
/** @type {import("three")} */
const THREE = window.THREE;
/** @typedef {import("three").Object3D} Object3D */
// THREE END

// DEVICE CAMERA START
/** @type {HTMLImageElement} */
const deviceImage = document.getElementById("deviceImage");
device.addEventListener("cameraImage", (event) => {
  const { url } = event.message;
  deviceImage.src = url;
});
deviceImage.addEventListener("load", async () => {
  if (deviceImage.hasAttribute("hidden")) {
    deviceImage.removeAttribute("hidden");
  }
  if (autoPictureCheckbox.checked) {
    //console.log("retake");
    takePicture();
  }
});

const takePicture = () => {
  device.takePicture();
};
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  takePicture();
});
const updateTakePictureButton = () => {
  takePictureButton.disabled =
    !device.isConnected || device.cameraStatus != "idle" || !device.hasCamera;
  takePictureButton.innerText =
    device.cameraStatus == "takingPicture" ? "taking picture" : "take picture";
};
device.addEventListener("isConnected", () => {
  updateTakePictureButton();
});
device.addEventListener("cameraStatus", () => {
  updateTakePictureButton();
});
device.addEventListener("cameraStatus", (event) => {
  const { cameraStatus, previousCameraStatus } = event.message;
  if (cameraStatus == "idle" && previousCameraStatus == "focusing") {
    takePicture();
  }
});

const focusCameraButton = document.getElementById("focusCamera");
focusCameraButton.addEventListener("click", () => {
  device.focusCamera();
});
const updateFocusCameraButton = () => {
  focusCameraButton.innerText =
    device.cameraStatus == "focusing" ? "focusing" : "focus";
  focusCameraButton.disabled =
    !device.isConnected || device.cameraStatus != "idle";
};
device.addEventListener("isConnected", () => {
  updateFocusCameraButton();
});
device.addEventListener("cameraStatus", () => {
  updateFocusCameraButton();
});

/** @type {HTMLProgressElement} */
const deviceImageProgress = document.getElementById("deviceImageProgress");
device.addEventListener("cameraImageProgress", (event) => {
  if (event.message.type == "image") {
    deviceImageProgress.value = event.message.progress;
  }
});

const autoPictureCheckbox = document.getElementById("autoPicture");
// DEVICE CAMERA END

// GET USER MEDIA START
/** @type {HTMLCanvasElement} */
const cameraStreamCanvas = document.getElementById("cameraStreamCanvas");
cameraStreamCanvas.width = 320;
cameraStreamCanvas.height = 240;
const cameraStreamContext = cameraStreamCanvas.getContext("2d");
const cameraStreamVideo = document.getElementById("cameraStreamVideo");
/** @type {MediaStream} */
let cameraStream;

/** @param {MediaStreamConstraints} */
window.getUserMedia = async (constraints) => {
  // console.log("getUserMedia", constraints);

  if (!constraints.target) {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    cameraStream = cameraStreamCanvas.captureStream();
    // console.log("cameraStream", cameraStream);
    cameraStreamVideo.srcObject = cameraStream;
    return cameraStream;
  } else {
    return _getUserMedia(constraints);
  }
};

deviceImage.addEventListener("load", () => {
  if (cameraStreamCanvas.width != deviceImage.naturalWidth) {
    cameraStreamCanvas.width = deviceImage.naturalWidth;
  }
  if (cameraStreamCanvas.height != deviceImage.naturalHeight) {
    cameraStreamCanvas.height = deviceImage.naturalHeight;
  }
  cameraStreamContext.drawImage(deviceImage, 0, 0);
});
// GET USER MEDIA END

// CAMERA START
const cameraSelect = document.querySelector("[data-camera]");
/** @type {HTMLVideoElement} */
const cameraVideo = document.getElementById("cameraVideo");
/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");

cameraSelect.addEventListener("cameraStreamStart", (event) => {
  const { cameraStream } = event.detail;
  //console.log("cameraStream", cameraStream);
  cameraVideo.srcObject = cameraStream;
});
cameraSelect.addEventListener("cameraStreamStop", () => {
  //console.log("stopCameraStream");
  cameraVideo.srcObject = undefined;
});

let drawCameraVideoIntervalId;
const startDrawingCameraVideo = () => {
  stopDrawingCameraVideo();
  drawCameraVideoIntervalId = setInterval(() => {
    // console.log("drawingCameraVideo");
    if (cameraStreamCanvas.width != cameraVideo.videoWidth) {
      cameraStreamCanvas.width = cameraVideo.videoWidth;
    }
    if (cameraStreamCanvas.height != cameraVideo.videoHeight) {
      cameraStreamCanvas.height = cameraVideo.videoHeight;
    }
    cameraStreamContext.drawImage(cameraVideo, 0, 0);
  }, 10);
};
const stopDrawingCameraVideo = () => {
  if (drawCameraVideoIntervalId == undefined) {
    return;
  }
  clearInterval(drawCameraVideoIntervalId);
  drawCameraVideoIntervalId = undefined;
};
cameraVideo.addEventListener("loadedmetadata", () => {
  // console.log("loadedmetadata");
  startDrawingCameraVideo();
});
cameraVideo.addEventListener("emptied", () => {
  // console.log("emptied");
  stopDrawingCameraVideo();
});

// CAMERA END

// DEVICE MOTION START
window.DeviceOrientationEvent_requestPermission = () => {
  // console.log("DeviceOrientationEvent_requestPermission");
  return "granted";
};
window.DeviceMotionEvent_requestPermission = () => {
  // console.log("DeviceMotionEvent_requestPermission");
  return "granted";
};

const absoluteOrientation = false;
const sensorRate = 20;
const toggleSensorData = async () => {
  latestSensorData = undefined;
  const _sensorRate = device.sensorConfiguration.acceleration ? 0 : sensorRate;
  await device.setSensorConfiguration({
    acceleration: _sensorRate,
    linearAcceleration: _sensorRate,
    gyroscope: _sensorRate,
    rotation: absoluteOrientation ? _sensorRate : 0,
    gameRotation: !absoluteOrientation ? _sensorRate : 0,
  });
};

const toggleSensorDataButton = document.getElementById("toggleSensorData");
toggleSensorDataButton.addEventListener("click", () => {
  toggleSensorData();
});

device.addEventListener("getSensorConfiguration", () => {
  const enabled = device.sensorConfiguration.acceleration;
  toggleSensorDataButton.innerText = enabled
    ? "disable motion"
    : "enable motion";
});
device.addEventListener("isConnected", () => {
  toggleSensorDataButton.disabled = !device.isConnected;
});

const gravityScalar = 9.81;
/** @type {{acceleration: BS.Vector3, linearAcceleration: BS.Vector3, gyroscope: BS.Vector3,  timestamp: number}} */
let latestSensorData;

const deviceOrientationEuler = new THREE.Euler(0, 0, 0, "YXZ");
const deviceOrientationQuaternion = new THREE.Quaternion();
window.order = "YXZ";
const deviceOrientationCorrectionQuaternion = new THREE.Quaternion(
  -Math.sqrt(0.5),
  0,
  0,
  Math.sqrt(0.5)
).invert();
/** @param {BS.Quaternion} quaternion */
const quaternionToDeviceOrientation = (quaternion) => {
  deviceOrientationQuaternion
    .copy(quaternion)
    .multiply(deviceOrientationCorrectionQuaternion);

  deviceOrientationEuler.order = window.order;
  deviceOrientationEuler.setFromQuaternion(deviceOrientationQuaternion);

  const euler = deviceOrientationEuler;
  const alpha = THREE.MathUtils.radToDeg(euler.y);
  const beta = THREE.MathUtils.radToDeg(euler.x);
  const gamma = -THREE.MathUtils.radToDeg(euler.z);
  return {
    alpha: (alpha + 360) % 360, // roll [0, 360] counterclockwise, 0 upright
    beta, // pitch [-180, 180] lowers to 0 when facing down, 90 upright
    gamma, // yaw [-90, 90], positive turning left if alpha/pitch<90
  };
};

const onQuaternion = (quaternion, timestamp, absolute = false) => {
  const { alpha, gamma, beta } = quaternionToDeviceOrientation(quaternion);
  /** @type {DeviceOrientationEventInit} */
  const deviceOrientationInitData = {
    absolute,
    alpha,
    beta,
    gamma,
    timestamp,
  };
  if (true) {
    _windowEventListenerMap["deviceorientation"].forEach((listener) =>
      listener(deviceOrientationInitData)
    );
    if (absolute) {
      _windowEventListenerMap["deviceorientationabsolute"].forEach((listener) =>
        listener(deviceOrientationInitData)
      );
    }
  } else {
    window.dispatchEvent(
      new DeviceOrientationEvent(
        deviceOrientationEventType,
        deviceOrientationInitData
      )
    );
    if (absolute) {
      window.dispatchEvent(
        new DeviceOrientationEvent(
          deviceOrientationAbsoluteEventType,
          deviceOrientationInitData
        )
      );
    }
  }
};
device.addEventListener("sensorData", (event) => {
  const { message } = event;
  const { timestamp } = message;
  switch (message.sensorType) {
    case "gameRotation":
      onQuaternion(message.gameRotation, timestamp);
      break;
    case "rotation":
      onQuaternion(message.rotation, timestamp, true);
      break;
  }
});

device.addEventListener("sensorData", (event) => {
  const { message } = event;
  const { timestamp } = message;
  //console.log({ timestamp }, message.sensorType);

  switch (message.sensorType) {
    case "linearAcceleration":
    case "acceleration":
    case "gyroscope":
      break;
    default:
      return;
  }

  latestSensorData = latestSensorData ?? { timestamp };
  if (latestSensorData.timestamp != timestamp) {
    console.warn(
      `timestamp mismatch - updating from ${latestSensorData.timestamp} to ${timestamp}`
    );
    latestSensorData = { timestamp };
  }
  latestSensorData[message.sensorType] = message[message.sensorType];

  const { acceleration, linearAcceleration, gyroscope } = latestSensorData;
  if (linearAcceleration && acceleration && gyroscope) {
    /** @type {deviceMotionInitData} */
    const deviceMotionInitData = {
      timestamp,
      acceleration: {
        x: -linearAcceleration.x * gravityScalar,
        y: -linearAcceleration.y * gravityScalar,
        z: -linearAcceleration.z * gravityScalar,
      },
      accelerationIncludingGravity: {
        x: -acceleration.x * gravityScalar,
        y: -acceleration.y * gravityScalar,
        z: -acceleration.z * gravityScalar,
      },
      rotationRate: {
        alpha: gyroscope.x,
        beta: gyroscope.y,
        gamma: gyroscope.z,
      },
      interval: sensorRate,
    };
    if (true) {
      _windowEventListenerMap["devicemotion"].forEach((listener) =>
        listener(deviceMotionInitData)
      );
    } else {
      window.dispatchEvent(
        new DeviceMotionEvent(deviceMotionEventType, deviceMotionInitData)
      );
    }

    latestSensorData = undefined;
  }
});

/** @type {"devicemotion"} */
const deviceMotionEventType = _windowEventPrefix + "devicemotion";
/** @type {"deviceorientation"} */
const deviceOrientationEventType = _windowEventPrefix + "deviceorientation";
/** @type {"deviceorientationabsolute"} */
const deviceOrientationAbsoluteEventType =
  _windowEventPrefix + "deviceorientationabsolute";
window.addEventListener(deviceMotionEventType, (event) => {
  const { acceleration, accelerationIncludingGravity, rotationRate } = event;
  if (device.isConnected) {
    return;
  }
  // console.log("devicemotion", event);
  window.dispatchEvent(
    new DeviceMotionEvent(deviceMotionEventType, {
      acceleration,
      accelerationIncludingGravity,
      rotationRate,
    })
  );
});
window.addEventListener(deviceOrientationEventType, (event) => {
  const { absolute, alpha, beta, gamma } = event;
  if (device.isConnected) {
    return;
  }
  // console.log("deviceorientation", event);
  window.dispatchEvent(
    new DeviceOrientationEvent(deviceOrientationEventType, {
      absolute,
      alpha,
      beta,
      gamma,
    })
  );
});
window.addEventListener(deviceOrientationAbsoluteEventType, (event) => {
  const { absolute, alpha, beta, gamma } = event;
  if (device.isConnected) {
    return;
  }
  // console.log("deviceorientationabsolute", event);
  window.dispatchEvent(
    new DeviceOrientationEvent(deviceOrientationAbsoluteEventType, {
      absolute,
      alpha,
      beta,
      gamma,
    })
  );
});

/** @type {HTMLPreElement} */
const deviceMotionPre = document.getElementById("deviceMotion");
/** @type {HTMLPreElement} */
const deviceOrientationPre = document.getElementById("deviceOrientation");

window.addEventListener("devicemotion", (event) => {
  const {
    timeStamp,
    interval,
    acceleration,
    accelerationIncludingGravity,
    rotationRate,
  } = event;
  // console.log(event);
  deviceMotionPre.textContent = JSON.stringify(
    {
      timeStamp,
      interval,
      acceleration,
      accelerationIncludingGravity,
      rotationRate,
    },
    (_, value) => {
      if (value === null) {
        return value;
      } else if (typeof value != "object") {
        return value;
      } else if ("x" in value) {
        const { x, y, z } = value;
        return {
          x,
          y,
          z,
        };
      } else if ("alpha" in value) {
        const { alpha, beta, gamma } = value;
        return {
          alpha,
          beta,
          gamma,
        };
      } else {
        return value;
      }
    },
    2
  );
});
window.addEventListener("deviceorientation", (event) => {
  const { timeStamp, absolute, alpha, beta, gamma } = event;
  deviceOrientationPre.textContent = JSON.stringify(
    {
      timeStamp,
      absolute,
      alpha,
      beta,
      gamma,
    },
    null,
    2
  );
});
// DEVICE MOTION END

// AFRAME START
const cameraEntity = document.getElementById("camera");
const modelEntity = document.getElementById("model");

/** @type {HTMLPreElement} */
const cameraPosePre = document.getElementById("cameraPose");

setInterval(() => {
  if (!device.isConnected) {
    return;
  }
  if (!device.sensorConfiguration.acceleration) {
    return;
  }
  /** @type {Object3D} */
  const object3D = cameraEntity.object3D;
  cameraPosePre.textContent = JSON.stringify(
    {
      position: object3D.position,
      rotation: object3D.rotation,
    },
    null,
    2
  );
}, sensorRate);

document.addEventListener("keydown", (event) => {
  let preventDefault = false;
  switch (event.key) {
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp":
    case "ArrowDown":
      preventDefault = true;
      break;
    default:
      break;
  }
  if (preventDefault) {
    event.preventDefault();
  }
});
// AFRAME END

// AFRAME INSPECTOR START
const getIsInspectorOpen = () => {
  return AFRAME.INSPECTOR?.opened;
};
const toggleInspector = () => {
  if (AFRAME.INSPECTOR) {
    AFRAME.INSPECTOR.toggle();
  } else {
    AFRAME.scenes[0].components.inspector.openInspector();
  }
};
const openInspectorButton = document.getElementById("openInspector");
openInspectorButton.addEventListener("click", () => {
  toggleInspector();
});
// AFRAME INSPECTOR END

// FILE UPLOAD START
window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  //console.log("dropped file", file);
  if (file) {
    await onFile(file);
  }
});

const acceptedFileTypes = ["glb", "gltf"];
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    //console.log("pasted item", item);
    const file = item.getAsFile();
    if (!file) {
      return;
    }
    //console.log("pasted file", file);
    await onFile(file);
  }
});

const modelFileInput = document.getElementById("modelFile");
modelFileInput.addEventListener("input", async () => {
  for (let i = 0; i < modelFileInput.files.length; i++) {
    const file = modelFileInput.files[i];
    if (!file) {
      continue;
    }
    //console.log("input file", file);
    await onFile(file);
  }
  modelFileInput.value = "";
});

/** @param {File} file */
const onFile = async (file) => {
  if (acceptedFileTypes.includes(file.name.split(".")[1])) {
    await loadModelFile(file);
  }
};
/** @param {File} file */
const loadModelFile = async (file) => {
  //console.log("loadModelFile", file);
  const src = URL.createObjectURL(file);
  modelEntity.setAttribute("gltf-model", src);
};
// FILE UPLOAD STOP
