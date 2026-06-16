import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: false });

/** @type {import("three")} */
const THREE = window.THREE;

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

// 3D VISUALIZATION

window.sensorRate = 20;
window.interpolationSmoothing = 0.4;
window.positionScalar = 0.1;

const scene = document.querySelector("a-scene");
const targetEntity = scene.querySelector(".target");
const targetPositionEntity = targetEntity.querySelector(".position");
const targetRotationEntity = targetEntity.querySelector(".rotation");
const modelEntities = Array.from(targetEntity.querySelectorAll("[gltf-model]"));

onCurrentDevice((device) => {
  modelEntities.forEach((entity) => {
    console.log(entity.dataset.type == device.type, entity);
    entity.setAttribute("visible", entity.dataset.type == device.type);
  });
});

/** @type {HTMLSelectElement} */
const orientationSelect = document.querySelector(".orientation");
orientationSelect.addEventListener("input", () => {
  /** @type {BS.SensorConfiguration} */
  const configuration = {
    gameRotation: 0,
    rotation: 0,
    gyroscope: 0,
    orientation: 0,
  };

  switch (orientationSelect.value) {
    case "none":
      break;
    case "gameRotation":
      configuration.gameRotation = sensorRate;
      break;
    case "rotation":
      configuration.rotation = sensorRate;
      break;
    case "orientation":
      configuration.orientation = sensorRate;
      break;
    case "gyroscope":
      configuration.gyroscope = sensorRate;
      break;
    default:
      console.error(
        `uncaught orientationSelect value "${orientationSelect.value}"`,
      );
      break;
  }

  currentDevice.setSensorConfiguration(configuration);
});
onCurrentDevice((device) => {
  orientationSelect.querySelectorAll("option").forEach((option) => {
    option.hidden =
      BS.SensorTypes.includes(option.value) &&
      !device.sensorTypes.includes(option.value);
  });
});

/** @type {HTMLButtonElement} */
const resetOrientationButton = document.querySelector(".resetOrientation");
resetOrientationButton.addEventListener("click", () => {
  resetOrientation();
});
onCurrentDevice((device) => {
  device.addEventListener(
    "isConnected",
    () => {
      resetOrientationButton.disabled = !device.isConnected;
    },
    { immediate: true },
  );
});

/** @type {HTMLSelectElement} */
const positionSelect = document.querySelector(".position");
positionSelect.addEventListener("input", () => {
  /** @type {BS.SensorConfiguration} */
  const configuration = {
    acceleration: 0,
    gravity: 0,
    linearAcceleration: 0,
  };

  switch (positionSelect.value) {
    case "none":
      break;
    case "acceleration":
      configuration.acceleration = sensorRate;
      break;
    case "gravity":
      configuration.gravity = sensorRate;
      break;
    case "linearAcceleration":
      configuration.linearAcceleration = sensorRate;
      break;
    default:
      console.error(`uncaught positionSelect value "${positionSelect.value}"`);
      break;
  }

  console.log({ configuration });

  currentDevice.setSensorConfiguration(configuration);
});
onCurrentDevice((device) => {
  device.addEventListener(
    "connected",
    () => {
      positionSelect.querySelectorAll("option").forEach((option) => {
        option.hidden =
          BS.SensorTypes.includes(option.value) &&
          !device.sensorTypes.includes(option.value);
      });
    },
    { immediate: true },
  );
});

onCurrentDevice((device) => {
  device.addEventListener(
    "isConnected",
    () => {
      orientationSelect.disabled = !device.isConnected;
      positionSelect.disabled = !device.isConnected;
    },
    { immediate: true },
  );
});

onCurrentDevice((device) => {
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      let newOrientationSelectValue = "none";
      let newPositionSelectValue = "none";

      for (const key in device.sensorConfiguration) {
        /** @type {BS.SensorType} */
        const sensorType = key;
        if (device.sensorConfiguration[sensorType] > 0) {
          switch (sensorType) {
            case "gameRotation":
            case "rotation":
            case "orientation":
            case "gyroscope":
              newOrientationSelectValue = sensorType;
              break;
            case "acceleration":
            case "gravity":
            case "linearAcceleration":
              newPositionSelectValue = sensorType;
              break;
          }
        }
      }

      orientationSelect.value = newOrientationSelectValue;
      positionSelect.value = newPositionSelectValue;
    },
    { immediate: true },
  );
});

const _position = new THREE.Vector3();

/** @param {BS.Vector3} position */
const updatePosition = (position) => {
  _position.copy(position).multiplyScalar(window.positionScalar);
  targetPositionEntity.object3D.position.lerp(
    _position,
    window.interpolationSmoothing,
  );
};
onCurrentDevice((device) => {
  device.addEventListener("acceleration", (event) => {
    const acceleration = event.message.acceleration;
    updatePosition(acceleration);
  });
  device.addEventListener("gravity", () => {
    const gravity = event.message.gravity;
    updatePosition(gravity);
  });
  device.addEventListener("linearAcceleration", (event) => {
    const linearAcceleration = event.message.linearAcceleration;
    updatePosition(linearAcceleration);
  });
});

const offsetQuaternion = new THREE.Quaternion();
const resetOrientation = () => {
  offsetQuaternion.copy(_quaternion).invert();
};

const _quaternion = new THREE.Quaternion();
const targetQuaternion = new THREE.Quaternion();

/**
 * @param {BS.Quaternion} quaternion
 * @param {boolean} applyOffset
 */
const updateQuaternion = (quaternion, applyOffset = false) => {
  _quaternion.copy(quaternion);
  targetQuaternion.copy(_quaternion);
  if (applyOffset) {
    targetQuaternion.multiply(offsetQuaternion);
  }
  targetRotationEntity.object3D.quaternion.slerp(
    targetQuaternion,
    window.interpolationSmoothing,
  );
};

onCurrentDevice((device) => {
  device.addEventListener("gameRotation", (event) => {
    let gameRotation = event.message.gameRotation;
    updateQuaternion(gameRotation, true);
  });
  device.addEventListener("rotation", (event) => {
    const rotation = event.message.rotation;
    updateQuaternion(rotation, true);
  });
});

const orientationVector3 = new THREE.Vector3();
const orientationEuler = new THREE.Euler(0, 0, 0, "YXZ");
const orientationQuaternion = new THREE.Quaternion();
onCurrentDevice((device) => {
  device.addEventListener("orientation", (event) => {
    const orientation = event.message.orientation;
    orientationVector3
      .set(orientation.pitch, orientation.heading, orientation.roll)
      .multiplyScalar(THREE.MathUtils.DEG2RAD);
    orientationEuler.setFromVector3(orientationVector3);
    orientationQuaternion.setFromEuler(orientationEuler);
    updateQuaternion(orientationQuaternion);
  });
});

const gyroscopeVector3 = new THREE.Vector3();
const gyroscopeEuler = new THREE.Euler();
const gyroscopeQuaternion = new THREE.Quaternion();
onCurrentDevice((device) => {
  device.addEventListener("gyroscope", (event) => {
    const gyroscope = event.message.gyroscope;
    gyroscopeVector3.copy(gyroscope).multiplyScalar(Math.PI / 180);
    gyroscopeEuler.setFromVector3(gyroscopeVector3);
    gyroscopeQuaternion.setFromEuler(gyroscopeEuler);
    updateQuaternion(gyroscopeQuaternion);
  });
});

// LED

const { lerp, inverseLerp, clamp } = THREE.MathUtils;

THREE.MathUtils.inverseLerp;

window.pitchMax = 30;
/** @param {BS.Euler} orientation */
const getTilt = (orientation) => {
  const { pitch, roll } = orientation;
  const pitchAbs = Math.abs(pitch);
  const pitchLerp = inverseLerp(0, window.pitchMax, pitchAbs);
  const clampedPitchLerp = clamp(pitchLerp, 0, 1);
  const tilt = clampedPitchLerp;
  // console.log({ pitch, pitchAbs, pitchLerp, clampedPitchLerp, tilt });
  // console.log({ tilt });
  return tilt;
};

/** @type {BS.Led[]} */
let colorLeds = [];
onCurrentDevice((device) => {
  device.addEventListener(
    "getLedInformation",
    (event) => {
      colorLeds = event.message.leds.filter((led) => led.type == "analogRGB");
      console.log(colorLeds);
    },
    { immediate: true },
  );
});

const ledColorInput = document.getElementById("ledColor");
ledColorInput.addEventListener("focusin", () => {
  console.log("focusin", ledColorInput);
  ledColorInput.isChanging = true;
});
ledColorInput.addEventListener("focusout", () => {
  console.log("focusout", ledColorInput);
  ledColorInput.isChanging = false;
});
ledColorInput.addEventListener("change", (event) => {
  console.log("change", ledColorInput);
  ledColorInput.isChanging = false;
});

ledColorInput.addEventListener("input", (event) => {
  setColor(ledColorInput.value);
});

/** @param {BS.DisplayColorRGBOrString} color */
let setColor = (color, overwrite = false) => {
  if (!device.isConnected) {
    return;
  }
  if (!ledColorInput.isChanging && !overwrite) {
    return;
  }
  if (colorLeds.length == 0) {
    return;
  }
  device.setLeds(colorLeds.map((led) => ({ index: led.index, color })));
  ledColorInput.value = color;
};
setColor = BS.ThrottleUtils.throttle(setColor, 20, true);

onCurrentDevice((device) => {
  device.addEventListener("orientation", (event) => {
    const { orientation } = event.message;
    const tilt = getTilt(orientation);
    /** @type {BS.DisplayColorRGBOrString} */
    const color = `hsl(${lerp(120, 0, tilt)}, 100%, ${lerp(0, 50, tilt)}%)`;
    setColor(color, true);
  });
});

// VIBRATION

let vibrationInterval = 1000;
onCurrentDevice((device) => {
  device.addEventListener("orientation", (event) => {
    const { orientation } = event.message;
    const tilt = getTilt(orientation);
    if (false && tilt == 1) {
      const amplitude = 1;
      const duration = 500;

      vibrate({
        type: "waveform",
        segments: [{ amplitude, duration }],
      });
    }
  });
});

/** @param {BS.VibrationConfiguration} vibrationConfiguration */
let vibrate = (vibrationConfiguration) => {
  if (!currentDevice.isConnected) {
    return;
  }
  if (!currentDevice.hasVibration) {
    return;
  }
  currentDevice.triggerVibration(vibrationConfiguration);
};
vibrate = BS.ThrottleUtils.throttle(vibrate, vibrationInterval, true);
