import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

const device = new BS.Device();
window.device = device;

// CONNECTION START
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
// CONNECTION END

// THREE START
/** @type {import("three")} */
const THREE = window.THREE;
/** @typedef {import("three").Object3D} Object3D */
// THREE END

// GET USER MEDIA START
/** @param {MediaStreamConstraints} */
window.getUserMedia = async (constraints) => {
  console.log("getUserMedia", constraints);
  // FILL
  return _getUserMedia(constraints);
};
// GET USER MEDIA END

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
  if (device.sensorConfiguration.acceleration) {
    await device.clearSensorConfiguration();
  } else {
    await device.setSensorConfiguration({
      acceleration: sensorRate,
      linearAcceleration: sensorRate,
      gyroscope: sensorRate,
      rotation: absoluteOrientation ? sensorRate : 0,
      gameRotation: !absoluteOrientation ? sensorRate : 0,
    });
  }
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

const onQuaternion = (quaternion, absolute = false) => {
  const { alpha, gamma, beta } = quaternionToDeviceOrientation(quaternion);
  window.dispatchEvent(
    new DeviceOrientationEvent(deviceOrientationEventType, {
      absolute,
      alpha,
      beta,
      gamma,
    })
  );
  if (absolute) {
    window.dispatchEvent(
      new DeviceOrientationEvent(deviceOrientationAbsoluteEventType, {
        absolute,
        alpha,
        beta,
        gamma,
      })
    );
  }
};
device.addEventListener("sensorData", (event) => {
  const { message } = event;
  switch (message.sensorType) {
    case "gameRotation":
      onQuaternion(message.gameRotation);
      break;
    case "rotation":
      onQuaternion(message.rotation, true);
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
    window.dispatchEvent(
      new DeviceMotionEvent(deviceMotionEventType, {
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
      })
    );
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
      if (value instanceof DeviceMotionEventAcceleration) {
        const { x, y, z } = value;
        return {
          x,
          y,
          z,
        };
      } else if (value instanceof DeviceMotionEventRotationRate) {
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
