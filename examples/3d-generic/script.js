import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: false });

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

// 3D VISUALIZATION

/** @typedef {import("../utils/three/three.module.min.js").Vector3} TVector3 */
/** @typedef {import("../utils/three/three.module.min.js").Quaternion} TQuaternion */
/** @typedef {import("../utils/three/three.module.min.js").Euler} TEuler */

window.sensorRate = 20;
window.interpolationSmoothing = 0.4;
window.positionScalar = 0.1;

const scene = document.querySelector("a-scene");
const targetEntity = scene.querySelector(".target");
const targetPositionEntity = targetEntity.querySelector(".position");
const targetRotationEntity = targetEntity.querySelector(".rotation");
const modelEntities = Array.from(targetEntity.querySelectorAll("[gltf-model]"));

device.addEventListener("connected", () => {
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
        `uncaught orientationSelect value "${orientationSelect.value}"`
      );
      break;
  }

  device.setSensorConfiguration(configuration);
});
device.addEventListener("connected", () => {
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
device.addEventListener("isConnected", () => {
  resetOrientationButton.disabled = !device.isConnected;
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

  device.setSensorConfiguration(configuration);
});
device.addEventListener("connected", () => {
  positionSelect.querySelectorAll("option").forEach((option) => {
    option.hidden =
      BS.SensorTypes.includes(option.value) &&
      !device.sensorTypes.includes(option.value);
  });
});

device.addEventListener("isConnected", () => {
  orientationSelect.disabled = !device.isConnected;
  positionSelect.disabled = !device.isConnected;
});

device.addEventListener("getSensorConfiguration", () => {
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
});

/** @type {TVector3} */
const _position = new THREE.Vector3();

/** @param {BS.Vector3} position */
const updatePosition = (position) => {
  _position.copy(position).multiplyScalar(window.positionScalar);
  targetPositionEntity.object3D.position.lerp(
    _position,
    window.interpolationSmoothing
  );
};

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

/** @type {TQuaternion} */
const offsetQuaternion = new THREE.Quaternion();
const resetOrientation = () => {
  offsetQuaternion.copy(_quaternion).invert();
};

/** @type {TQuaternion} */
const _quaternion = new THREE.Quaternion();
/** @type {TQuaternion} */
const targetQuaternion = new THREE.Quaternion();
/**
 * @param {BS.Quaternion} quaternion
 * @param {boolean} applyOffset
 */
const updateQuaternion = (quaternion, applyOffset = false) => {
  _quaternion.copy(quaternion);
  targetQuaternion.copy(_quaternion);
  if (applyOffset) {
    targetQuaternion.premultiply(offsetQuaternion);
  }
  targetRotationEntity.object3D.quaternion.slerp(
    targetQuaternion,
    window.interpolationSmoothing
  );
};
device.addEventListener("gameRotation", (event) => {
  let gameRotation = event.message.gameRotation;
  updateQuaternion(gameRotation, true);
});
device.addEventListener("rotation", (event) => {
  const rotation = event.message.rotation;
  updateQuaternion(rotation, true);
});

/** @type {TVector3} */
const orientationVector3 = new THREE.Vector3();
/** @type {TEuler} */
const orientationEuler = new THREE.Euler(0, 0, 0, "YXZ");
/** @type {TQuaternion} */
const orientationQuaternion = new THREE.Quaternion();
device.addEventListener("orientation", (event) => {
  const orientation = event.message.orientation;
  orientationVector3
    .set(orientation.pitch, orientation.heading, orientation.roll)
    .multiplyScalar(THREE.MathUtils.DEG2RAD);
  orientationEuler.setFromVector3(orientationVector3);
  orientationQuaternion.setFromEuler(orientationEuler);
  updateQuaternion(orientationQuaternion);
});

/** @type {TVector3} */
const gyroscopeVector3 = new THREE.Vector3();
/** @type {TEuler} */
const gyroscopeEuler = new THREE.Euler();
/** @type {TQuaternion} */
const gyroscopeQuaternion = new THREE.Quaternion();
device.addEventListener("gyroscope", (event) => {
  const gyroscope = event.message.gyroscope;
  gyroscopeVector3.copy(gyroscope).multiplyScalar(Math.PI / 180);
  gyroscopeEuler.setFromVector3(gyroscopeVector3);
  gyroscopeQuaternion.setFromEuler(gyroscopeEuler);
  updateQuaternion(gyroscopeQuaternion);
});
