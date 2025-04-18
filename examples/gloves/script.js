import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: false });

/** @typedef {import("../utils/three/three.module.min").Vector2} TVector2 */
/** @typedef {import("../utils/three/three.module.min").Vector3} TVector3 */
/** @typedef {import("../utils/three/three.module.min").Quaternion} TQuaternion */
/** @typedef {import("../utils/three/three.module.min").Euler} TEuler */

// GET DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById(
  "availableDeviceTemplate"
);
const availableDevicesContainer = document.getElementById("availableDevices");
/** @param {BS.Device[]} availableDevices */
function onAvailableDevices(availableDevices) {
  availableDevicesContainer.innerHTML = "";
  if (availableDevices.length == 0) {
    availableDevicesContainer.innerText = "no devices available";
  } else {
    availableDevices.forEach((availableDevice) => {
      let availableDeviceContainer = availableDeviceTemplate.content
        .cloneNode(true)
        .querySelector(".availableDevice");
      availableDeviceContainer.querySelector(".name").innerText =
        availableDevice.name;
      availableDeviceContainer.querySelector(".type").innerText =
        availableDevice.type;

      /** @type {HTMLButtonElement} */
      const toggleConnectionButton =
        availableDeviceContainer.querySelector(".toggleConnection");
      toggleConnectionButton.addEventListener("click", () => {
        availableDevice.toggleConnection();
      });
      const onConnectionStatusUpdate = () => {
        switch (availableDevice.connectionStatus) {
          case "connected":
          case "notConnected":
            toggleConnectionButton.disabled = false;
            toggleConnectionButton.innerText = availableDevice.isConnected
              ? "disconnect"
              : "connect";
            break;
          case "connecting":
          case "disconnecting":
            toggleConnectionButton.disabled = true;
            toggleConnectionButton.innerText = availableDevice.connectionStatus;
            break;
        }
      };
      availableDevice.addEventListener("connectionStatus", () =>
        onConnectionStatusUpdate()
      );
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

const devicePair = BS.DevicePair.gloves;
devicePair.addEventListener("isConnected", () => {
  addDeviceButton.disabled = devicePair.isConnected;
});

// 3D VISUALIZATION

const glovesContainer = document.getElementById("gloves");
/** @type {HTMLTemplateElement} */
const gloveTemplate = document.getElementById("gloveTemplate");

window.sensorRate = 20;
window.interpolationSmoothing = 0.4;
window.positionScalar = 0.1;

devicePair.sides.forEach((side) => {
  /** @type {HTMLElement} */
  const gloveContainer = gloveTemplate.content
    .cloneNode(true)
    .querySelector(".glove");
  gloveContainer.classList.add(side);
  gloveContainer.dataset.side = side;
  /** @type {HTMLIFrameElement} */
  const iframe = gloveContainer.querySelector("iframe");
  iframe.addEventListener("load", () => {
    onIFrameLoaded(gloveContainer);
  });
  glovesContainer.appendChild(gloveContainer);
});

/** @param {HTMLElement} gloveContainer */
function onIFrameLoaded(gloveContainer) {
  /** @type {BS.Side} */
  const side = gloveContainer.dataset.side;
  /** @type {HTMLIFrameElement} */
  const iframe = gloveContainer.querySelector("iframe");
  const scene = iframe.contentDocument.querySelector("a-scene");
  const targetEntity = scene.querySelector(".target");
  const targetPositionEntity = targetEntity.querySelector(".position");
  const targetRotationEntity = targetEntity.querySelector(".rotation");
  const gloveEntity = targetEntity.querySelector(".glove");
  const pressureEntities = Array.from(
    targetEntity.querySelectorAll("[data-pressure]")
  )
    .sort((a, b) => a.dataset.pressure - b.dataset.pressure)
    .map((entity) => entity.querySelector("a-sphere"));
  //pressureEntities.forEach((entity) => entity.setAttribute("opacity", "0.0"));
  scene.addEventListener("loaded", () => {
    if (side == "left") {
      targetEntity.object3D.scale.x *= -1;
    }
  });

  /** @type {HTMLButtonElement} */
  const toggleConnectionButton =
    gloveContainer.querySelector(".toggleConnection");
  toggleConnectionButton.addEventListener("click", () => {
    devicePair[side].toggleConnection();
  });
  devicePair.addEventListener("deviceIsConnected", (event) => {
    const device = event.message.device;
    if (device.side != side) {
      return;
    }

    if (device.isConnected) {
      toggleConnectionButton.disabled = false;
    }
    toggleConnectionButton.innerText = device.isConnected
      ? "disconnect"
      : "reconnect";
  });

  devicePair.addEventListener("deviceConnectionStatus", (event) => {
    const device = event.message.device;
    if (device.side != side) {
      return;
    }

    switch (device.connectionStatus) {
      case "connected":
      case "notConnected":
        toggleConnectionButton.disabled = false;
        toggleConnectionButton.innerText = device.isConnected
          ? "disconnect"
          : "reconnect";
        break;
      case "connecting":
      case "disconnecting":
        toggleConnectionButton.disabled = true;
        toggleConnectionButton.innerText = device.connectionStatus;
        break;
    }
  });

  /** @type {HTMLSelectElement} */
  const orientationSelect = gloveContainer.querySelector(".orientation");
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

    devicePair[side].setSensorConfiguration(configuration);
  });

  /** @type {HTMLButtonElement} */
  const resetOrientationButton =
    gloveContainer.querySelector(".resetOrientation");
  resetOrientationButton.addEventListener("click", () => {
    resetOrientation();
  });
  devicePair.addEventListener("deviceIsConnected", (event) => {
    const device = event.message.device;
    if (device.side != side) {
      return;
    }

    resetOrientationButton.disabled = !device.isConnected;
  });

  /** @type {HTMLSelectElement} */
  const positionSelect = gloveContainer.querySelector(".position");
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
        console.error(
          `uncaught positionSelect value "${positionSelect.value}"`
        );
        break;
    }

    console.log({ configuration });

    devicePair[side].setSensorConfiguration(configuration);
  });
  devicePair.addEventListener("deviceIsConnected", (event) => {
    const device = event.message.device;
    if (device.side != side) {
      return;
    }

    orientationSelect.disabled = !device.isConnected;
    positionSelect.disabled = !device.isConnected;
  });

  devicePair.addEventListener("deviceGetSensorConfiguration", (event) => {
    const device = event.message.device;
    if (device.side != side) {
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
    targetPositionEntity.object3D.position.lerp(
      _position,
      window.interpolationSmoothing
    );
  };

  devicePair.addEventListener("deviceAcceleration", (event) => {
    const device = event.message.device;
    if (device.side != side) {
      return;
    }
    const acceleration = event.message.acceleration;
    updatePosition(acceleration);
  });
  devicePair.addEventListener("deviceGravity", (event) => {
    const device = event.message.device;
    if (device.side != side) {
      return;
    }

    const gravity = event.message.gravity;
    updatePosition(gravity);
  });
  devicePair.addEventListener("deviceLinearAcceleration", (event) => {
    const device = event.message.device;
    if (device.side != side) {
      return;
    }

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
  devicePair.addEventListener("deviceGameRotation", (event) => {
    const device = event.message.device;
    if (device.side != side) {
      return;
    }

    const gameRotation = event.message.gameRotation;
    updateQuaternion(gameRotation, true);
  });
  devicePair.addEventListener("deviceRotation", (event) => {
    const device = event.message.device;
    if (device.side != side) {
      return;
    }

    const rotation = event.message.rotation;
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
    if (device.side != side) {
      return;
    }

    const orientation = event.message.orientation;
    orientationVector3
      .set(orientation.pitch, orientation.heading, orientation.roll)
      .multiplyScalar(Math.PI / 180);
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
    if (device.side != side) {
      return;
    }

    const gyroscope = event.message.gyroscope;
    gyroscopeVector3.copy(gyroscope).multiplyScalar(Math.PI / 180);
    gyroscopeEuler.setFromVector3(gyroscopeVector3);
    gyroscopeQuaternion.setFromEuler(gyroscopeEuler);
    updateQuaternion(gyroscopeQuaternion);
  });

  // PRESSURE

  /** @type {HTMLButtonElement} */
  const togglePressureButton = gloveContainer.querySelector(".togglePressure");
  togglePressureButton.addEventListener("click", () => {
    togglePressure();
  });
  const setIsPressureEnabled = (newIsPressureEnabled) => {
    /** @type {BS.SensorConfiguration} */
    const configuration = { pressure: newIsPressureEnabled ? 20 : 0 };
    devicePair[side].setSensorConfiguration(configuration);
  };
  const togglePressure = () => {
    const isPressureEnabled =
      devicePair[side].sensorConfiguration.pressure != 0;
    setIsPressureEnabled(!isPressureEnabled);
  };
  devicePair.addEventListener("deviceGetSensorConfiguration", (event) => {
    if (event.message.side != side) {
      return;
    }
    const { sensorConfiguration } = event.message;
    togglePressureButton.innerText =
      sensorConfiguration.pressure == 0
        ? "enable pressure"
        : "disable pressure";
  });
  /** @type {HTMLButtonElement} */
  const resetPressureButton = gloveContainer.querySelector(".resetPressure");
  resetPressureButton.addEventListener("click", () => {
    devicePair[side].resetPressureRange();
  });
  devicePair.addEventListener("deviceIsConnected", (event) => {
    const device = event.message.device;
    if (device.side != side) {
      return;
    }

    togglePressureButton.disabled = !device.isConnected;
    resetPressureButton.disabled = !device.isConnected;
  });

  devicePair.addEventListener("devicePressure", (event) => {
    if (event.message.side != side) {
      return;
    }
    const { pressure } = event.message;
    pressure.sensors.forEach((sensor, index) => {
      pressureEntities[index]?.setAttribute("opacity", sensor.normalizedValue);
    });
  });

  // CURSOR MODE
  let isCursorEnabled = false;
  /** @type {HTMLButtonElement} */
  const toggleCursorButton = gloveContainer.querySelector(".toggleCursor");
  toggleCursorButton.addEventListener("click", () => {
    setIsCursorEnabled(!isCursorEnabled);
  });
  const setIsCursorEnabled = (newIsCursorEnabled) => {
    isCursorEnabled = newIsCursorEnabled;
    toggleCursorButton.innerText = isCursorEnabled
      ? "disable cursor"
      : "enable cursor";
    if (isCursorEnabled) {
      orientationSelect.value = "gyroscope";
    } else {
      orientationSelect.value = "none";
    }
    orientationSelect.dispatchEvent(new Event("input"));
    setIsPressureEnabled(isCursorEnabled);
    onCursorIsEnabled();
  };
  const onCursorIsEnabled = () => {
    if (isCursorEnabled) {
      targetEntity.setAttribute("visible", "false");
      cursorExample.setAttribute("visible", "true");
      cameraEntity.setAttribute("orbit-controls", { enabled: false });
      cameraEntity.setAttribute("camera", { active: false });
      cursorCameraEntity.setAttribute("camera", { active: true });
    } else {
      targetEntity.setAttribute("visible", "true");
      cursorExample.setAttribute("visible", "false");
      cursorCameraEntity.setAttribute("camera", { active: false });
      cameraEntity.setAttribute("camera", { active: true });
      cameraEntity.setAttribute("orbit-controls", { enabled: true });
    }
  };

  devicePair.addEventListener("deviceIsConnected", (event) => {
    const device = event.message.device;
    if (device.side != side) {
      return;
    }
    toggleCursorButton.disabled = !device.isConnected;
  });

  const cameraEntity = scene.querySelector(".camera");
  const cursorCameraEntity = scene.querySelector(".cursorCamera");
  const cursorEntity = scene.querySelector(".cursor");
  const cursorHandleEntity = scene.querySelector(".cursorHandle");
  const cursorMeshEntity = cursorEntity.querySelector(".mesh");
  const cursorExample = scene.querySelector(".cursorExample");
  devicePair.addEventListener("deviceGyroscope", (event) => {
    if (event.message.side != side) {
      return;
    }
    if (!isCursorEnabled) {
      return;
    }
    const { gyroscope } = event.message;
    const { x: yawDegrees, y: pitchDegrees, z: rollDegrees } = gyroscope;
    // console.log({ yawDegrees, pitchDegrees, rollDegrees });
    setCursorPosition(yawDegrees * 0.001, pitchDegrees * 0.001, true);
  });
  const cursorRaycaster = new THREE.Raycaster();
  const cursor2DPosition = new THREE.Vector2();
  const cursor3DPosition = new THREE.Vector3();
  const setCursorPosition = (x, y, isOffset = false) => {
    if (isOffset) {
      cursor2DPosition.x += x;
      cursor2DPosition.y += y;
    } else {
      cursor2DPosition.set(x, y);
    }
    cursor2DPosition.clampScalar(-1, 1);
    updateCursorEntity();
    if (!isCursorDown) {
      intersectEntities();
    }
    if (isCursorDown && draggingEntity) {
      dragEntity();
    }
  };
  const updateCursorEntity = () => {
    cursorRaycaster.setFromCamera(
      cursor2DPosition,
      cursorCameraEntity.object3D.children[0]
    );
    cursorRaycaster.ray.at(1, cursor3DPosition);
    cursorEntity.object3D.position.copy(cursor3DPosition);
  };
  const cursorIntersectableEntities = Array.from(
    scene.querySelectorAll(".intersectable")
  );

  const dragEntityPosition = new THREE.Vector3();
  const dragEntity = () => {
    cursorRaycaster.ray.at(20, dragEntityPosition);
    //draggingEntity.object3D.position.copy(dragEntityPosition);
    cursorHandleEntity.object3D.position.copy(dragEntityPosition);
  };

  let intersectedEntities = [];
  const intersectEntities = () => {
    intersectedEntities.length = 0;
    cursorIntersectableEntities.forEach((entity) => {
      const intersections = cursorRaycaster.intersectObject(
        entity.object3D,
        true
      );
      const intersection = intersections[0];
      if (intersection) {
        intersectedEntities.push(entity);
        entity.setAttribute("color", "lightgreen");
      } else {
        entity.setAttribute("color", entity.dataset.color);
      }
    });
  };

  let isCursorDown = false;
  scene.addEventListener("mousemove", (event) => {
    const canvas = scene.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    setCursorPosition(x, y);
  });
  scene.addEventListener("mousedown", () => {
    setIsCursorDown(true);
  });
  scene.addEventListener("mouseup", () => {
    setIsCursorDown(false);
  });
  let draggingEntity;
  const setIsCursorDown = (newIsCursorDown) => {
    isCursorDown = newIsCursorDown;
    cursorMeshEntity.setAttribute(
      "color",
      isCursorDown ? "black" : cursorMeshEntity.dataset.color
    );
    if (isCursorDown && intersectedEntities[0]) {
      draggingEntity = intersectedEntities[0];
      console.log("dragging entity");
      draggingEntity.setAttribute("color", "green");
      cursorHandleEntity.setAttribute("static-body", "");
      draggingEntity.setAttribute(
        "constraint",
        "target: .cursorHandle; collideConnected: false; type: pointToPoint;"
      );
    }
    if (!isCursorDown && draggingEntity) {
      console.log("removing draggingEntity");
      draggingEntity.setAttribute("color", draggingEntity.dataset.color);

      draggingEntity.removeAttribute("constraint");
      cursorHandleEntity.removeAttribute("static-body");
      draggingEntity = undefined;
    }
  };
  devicePair.addEventListener("devicePressure", (event) => {
    if (event.message.side != side) {
      return;
    }
    const { pressure } = event.message;
    const pinchPressure = pressure.sensors[4];
    const isPinching = pinchPressure.normalizedValue > 0.5;
    setIsCursorDown(isPinching);
  });
  onCursorIsEnabled();
}

// SERVER

const websocketClient = new BS.WebSocketClient();
/** @type {HTMLButtonElement} */
const toggleServerConnectionButton = document.getElementById(
  "toggleServerConnection"
);
toggleServerConnectionButton.addEventListener("click", () => {
  websocketClient.toggleConnection();
});
websocketClient.addEventListener("isConnected", () => {
  toggleServerConnectionButton.innerText = websocketClient.isConnected
    ? "disconnect from server"
    : "connect to server";
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
