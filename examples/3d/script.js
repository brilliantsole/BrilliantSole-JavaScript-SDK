import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: false });

/** @typedef {import("../utils/three/three.module.min").Vector3} TVector3 */
/** @typedef {import("../utils/three/three.module.min").Quaternion} TQuaternion */
/** @typedef {import("../utils/three/three.module.min").Euler} TEuler */

// GET DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById("availableDeviceTemplate");
const availableDevicesContainer = document.getElementById("availableDevices");
/** @param {BS.Device[]} availableDevices */
function onAvailableDevices(availableDevices) {
  availableDevicesContainer.innerHTML = "";
  if (availableDevices.length == 0) {
    availableDevicesContainer.innerText = "no devices available";
  } else {
    availableDevices.forEach((availableDevice) => {
      let availableDeviceContainer = availableDeviceTemplate.content.cloneNode(true).querySelector(".availableDevice");
      availableDeviceContainer.querySelector(".name").innerText = availableDevice.name;
      availableDeviceContainer.querySelector(".type").innerText = availableDevice.type;

      /** @type {HTMLButtonElement} */
      const toggleConnectionButton = availableDeviceContainer.querySelector(".toggleConnection");
      toggleConnectionButton.addEventListener("click", () => {
        availableDevice.toggleConnection();
      });
      const onConnectionStatusUpdate = () => {
        switch (availableDevice.connectionStatus) {
          case "connected":
          case "notConnected":
            toggleConnectionButton.disabled = false;
            toggleConnectionButton.innerText = availableDevice.isConnected ? "disconnect" : "connect";
            break;
          case "connecting":
          case "disconnecting":
            toggleConnectionButton.disabled = true;
            toggleConnectionButton.innerText = availableDevice.connectionStatus;
            break;
        }
      };
      availableDevice.addEventListener("connectionStatus", () => onConnectionStatusUpdate());
      onConnectionStatusUpdate();
      availableDevicesContainer.appendChild(availableDeviceContainer);
    });
  }
}
async function getDevices() {
  const availableDevices = await BS.DeviceManager.GetDevices();
  if (!availableDevices) {
    return;
  }
  onAvailableDevices(availableDevices);
}

BS.DeviceManager.AddEventListener("availableDevices", (event) => {
  const devices = event.message.availableDevices;
  onAvailableDevices(devices);
});
getDevices();

// ADD DEVICE

/** @type {HTMLButtonElement} */
const addDeviceButton = document.getElementById("addDevice");
addDeviceButton.addEventListener("click", () => {
  BS.Device.Connect();
});

const devicePair = BS.DevicePair.shared;
devicePair.addEventListener("isConnected", () => {
  addDeviceButton.disabled = devicePair.isConnected;
});

// 3D VISUALIZATION

const insolesContainer = document.getElementById("insoles");
/** @type {HTMLTemplateElement} */
const insoleTemplate = document.getElementById("insoleTemplate");

window.sensorRate = 20;
window.interpolationSmoothing = 0.4;
window.positionScalar = 0.4;

devicePair.sides.forEach((side) => {
  /** @type {HTMLElement} */
  const insoleContainer = insoleTemplate.content.cloneNode(true).querySelector(".insole");
  insoleContainer.classList.add(side);
  insoleContainer.dataset.side = side;
  /** @type {HTMLIFrameElement} */
  const iframe = insoleContainer.querySelector("iframe");
  iframe.addEventListener("load", () => {
    onIFrameLoaded(insoleContainer);
  });
  insolesContainer.appendChild(insoleContainer);
});

/** @param {HTMLElement} insoleContainer */
function onIFrameLoaded(insoleContainer) {
  const side = insoleContainer.dataset.side;
  /** @type {HTMLIFrameElement} */
  const iframe = insoleContainer.querySelector("iframe");
  const scene = iframe.contentDocument.querySelector("a-scene");
  const targetEntity = scene.querySelector(".target");
  const targetPositionEntity = targetEntity.querySelector(".position");
  const targetRotationEntity = targetEntity.querySelector(".rotation");
  const insoleEntity = targetEntity.querySelector(".insole");
  insoleEntity.setAttribute("gltf-model", `#${side}Insole`);
  scene.addEventListener("loaded", () => {
    if (side == "right") {
      //insoleEntity.object3D.scale.x = -1;
    }
  });

  /** @type {HTMLButtonElement} */
  const toggleConnectionButton = insoleContainer.querySelector(".toggleConnection");
  toggleConnectionButton.addEventListener("click", () => {
    devicePair[side].toggleConnection();
  });
  devicePair.addEventListener("deviceIsConnected", (event) => {
    /** @type {BS.Device} */
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }

    if (device.isConnected) {
      toggleConnectionButton.disabled = false;
    }
    toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "reconnect";
  });

  devicePair.addEventListener("deviceConnectionStatus", (event) => {
    /** @type {BS.Device} */
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }

    switch (device.connectionStatus) {
      case "connected":
      case "notConnected":
        toggleConnectionButton.disabled = false;
        toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "reconnect";
        break;
      case "connecting":
      case "disconnecting":
        toggleConnectionButton.disabled = true;
        toggleConnectionButton.innerText = device.connectionStatus;
        break;
    }
  });

  /** @type {HTMLSelectElement} */
  const orientationSelect = insoleContainer.querySelector(".orientation");
  orientationSelect.addEventListener("input", () => {
    /** @type {BS.SensorConfiguration} */
    const configuration = { gameRotation: 0, rotation: 0, gyroscope: 0, orientation: 0 };

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
        console.error(`uncaught orientationSelect value "${orientationSelect.value}"`);
        break;
    }

    devicePair[side].setSensorConfiguration(configuration);
  });

  /** @type {HTMLButtonElement} */
  const resetOrientationButton = insoleContainer.querySelector(".resetOrientation");
  resetOrientationButton.addEventListener("click", () => {
    resetOrientation();
  });
  devicePair.addEventListener("deviceIsConnected", (event) => {
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }

    resetOrientationButton.disabled = !device.isConnected;
  });

  /** @type {HTMLSelectElement} */
  const positionSelect = insoleContainer.querySelector(".position");
  positionSelect.addEventListener("input", () => {
    /** @type {BS.SensorConfiguration} */
    const configuration = { acceleration: 0, gravity: 0, linearAcceleration: 0 };

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

    devicePair[side].setSensorConfiguration(configuration);
  });
  devicePair.addEventListener("deviceIsConnected", (event) => {
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }

    orientationSelect.disabled = !device.isConnected;
    positionSelect.disabled = !device.isConnected;
  });

  devicePair.addEventListener("deviceGetSensorConfiguration", (event) => {
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }

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
    targetPositionEntity.object3D.position.lerp(_position, window.interpolationSmoothing);
  };

  devicePair.addEventListener("deviceAcceleration", (event) => {
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }
    /** @type {BS.Vector3} */
    const acceleration = event.message.acceleration;
    updatePosition(acceleration);
  });
  devicePair.addEventListener("deviceGravity", (event) => {
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }

    /** @type {BS.Vector3} */
    const gravity = event.message.gravity;
    updatePosition(gravity);
  });
  devicePair.addEventListener("deviceLinearAcceleration", (event) => {
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }

    /** @type {BS.Vector3} */
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
    targetRotationEntity.object3D.quaternion.slerp(targetQuaternion, window.interpolationSmoothing);
  };
  devicePair.addEventListener("deviceGameRotation", (event) => {
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }

    /** @type {BS.Quaternion} */
    const gameRotation = event.message.gameRotation;
    //permuteQuaternion(gameRotation);
    updateQuaternion(gameRotation, true);
  });
  devicePair.addEventListener("deviceRotation", (event) => {
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }

    /** @type {BS.Quaternion} */
    const rotation = event.message.rotation;
    //permuteQuaternion(rotation);
    updateQuaternion(rotation, true);
  });

  /** @type {TVector3} */
  const orientationVector3 = new THREE.Vector3();
  /** @type {TEuler} */
  const orientationEuler = new THREE.Euler(0, 0, 0, "YXZ");
  /** @type {TQuaternion} */
  const orientationQuaternion = new THREE.Quaternion();
  devicePair.addEventListener("deviceOrientation", (event) => {
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }

    /** @type {BS.Euler} */
    const orientation = event.message.orientation;
    orientationVector3.set(orientation.pitch, orientation.heading, orientation.roll).multiplyScalar(Math.PI / 180);
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
  devicePair.addEventListener("deviceGyroscope", (event) => {
    const device = event.message.device;
    if (device.insoleSide != side) {
      return;
    }

    /** @type {BS.Vector3} */
    const gyroscope = event.message.gyroscope;
    gyroscopeVector3.copy(gyroscope).multiplyScalar(Math.PI / 180);
    gyroscopeEuler.setFromVector3(gyroscopeVector3);
    gyroscopeQuaternion.setFromEuler(gyroscopeEuler);
    updateQuaternion(gyroscopeQuaternion);
  });
}

// SERVER

const websocketClient = new BS.WebSocketClient();
/** @type {HTMLButtonElement} */
const toggleServerConnectionButton = document.getElementById("toggleServerConnection");
toggleServerConnectionButton.addEventListener("click", () => {
  websocketClient.toggleConnection();
});
websocketClient.addEventListener("isConnected", () => {
  toggleServerConnectionButton.innerText = websocketClient.isConnected ? "disconnect from server" : "connect to server";
});
websocketClient.addEventListener("connectionStatus", () => {
  let disabled;
  switch (websocketClient.connectionStatus) {
    case "notConnected":
    case "connected":
      disabled = false;
      break;
    case "connecting":
    case "disconnecting":
      disabled = true;
      break;
  }
  toggleServerConnectionButton.disabled = disabled;
});
