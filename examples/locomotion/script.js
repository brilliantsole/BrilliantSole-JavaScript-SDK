import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
//BS.setAllConsoleLevelFlags({ log: true });

// THREE START
/** @type {import("three")} */
const THREE = window.THREE;
/** @typedef {import("three").Object3D} Object3D */
// THREE END

// CLIENT
const client = new BS.WebSocketClient();
console.log({ client });

window.client = client;

// WEBSOCKET URL SEARCH PARAMS

const url = new URL(location);
function setUrlParam(key, value) {
  if (history.pushState) {
    let searchParams = new URLSearchParams(window.location.search);
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    let newUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      searchParams.toString();
    window.history.pushState({ path: newUrl }, "", newUrl);
  }
}
client.addEventListener("isConnected", () => {
  if (client.isConnected) {
    setUrlParam("webSocketUrl", client.webSocket.url);
    webSocketUrlInput.value = client.webSocket.url;
    webSocketUrlInput.dispatchEvent(new Event("input"));
  } else {
    setUrlParam("webSocketUrl");
  }
});

// WEBSOCKET SERVER URL

/** @type {HTMLInputElement} */
const webSocketUrlInput = document.getElementById("webSocketUrl");
webSocketUrlInput.value = url.searchParams.get("webSocketUrl") || "";
webSocketUrlInput.dispatchEvent(new Event("input"));

// WEBSOCKET CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
  if (client.isConnected) {
    client.disconnect();
  } else {
    /** @type {string?} */
    let webSocketUrl;
    if (webSocketUrlInput.value.length > 0) {
      webSocketUrl = webSocketUrlInput.value;
    }
    client.connect(webSocketUrl);
  }
});
client.addEventListener("connectionStatus", () => {
  switch (client.connectionStatus) {
    case "connected":
    case "notConnected":
      toggleConnectionButton.disabled = false;
      toggleConnectionButton.innerText = client.isConnected
        ? "disconnect"
        : "connect";
      break;
    case "connecting":
    case "disconnecting":
      toggleConnectionButton.innerText = client.connectionStatus;
      toggleConnectionButton.disabled = true;
      break;
  }
});

// SCANNER

/** @type {HTMLInputElement} */
const isScanningAvailableCheckbox = document.getElementById(
  "isScanningAvailable"
);
client.addEventListener("isScanningAvailable", () => {
  isScanningAvailableCheckbox.checked = client.isScanningAvailable;
});

/** @type {HTMLButtonElement} */
const toggleScanButton = document.getElementById("toggleScan");
toggleScanButton.addEventListener("click", () => {
  client.toggleScan();
});
client.addEventListener("isScanningAvailable", () => {
  toggleScanButton.disabled = !client.isScanningAvailable;
});
client.addEventListener("isScanning", () => {
  toggleScanButton.innerText = client.isScanning ? "stop scanning" : "scan";
});

client.addEventListener("discoveredDevice", (event) => {
  if (devicePair.isConnected) {
    return;
  }
  const { discoveredDevice } = event.message;
  console.log("discoveredDevice", discoveredDevice);
  if (
    discoveredDevice.deviceType == "leftInsole" &&
    !devicePair.left?.isConnected
  ) {
    console.log("connecting to left insole");
    client.connectToDevice(discoveredDevice.bluetoothId);
  }
  if (
    discoveredDevice.deviceType == "rightInsole" &&
    !devicePair.right?.isConnected
  ) {
    console.log("connecting to right insole");
    client.connectToDevice(discoveredDevice.bluetoothId);
  }
});
BS.DeviceManager.AddEventListener("deviceConnected", (e) => console.log(e));

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

// CONNECTION START
const devicePair = BS.DevicePair.insoles;
window.devicePair = devicePair;

/** @type {HTMLButtonElement} */
const addDeviceButton = document.getElementById("addDevice");
devicePair.addEventListener("isConnected", () => {
  addDeviceButton.disabled = devicePair.isConnected;
});
addDeviceButton.addEventListener("click", () => {
  BS.Device.Connect();
});
// CONNECTION END

// PRESSURE START
let isPressureDataEnabled = false;

const sensorRate = 20;
const sensorRateScalar = sensorRate / 1000;

/** @type {HTMLButtonElement} */
const togglePressureDataButton = document.getElementById("togglePressureData");
devicePair.addEventListener("isConnected", () => {
  togglePressureDataButton.disabled = !devicePair.isPartiallyConnected;
});
togglePressureDataButton.addEventListener("click", () => {
  isPressureDataEnabled = !isPressureDataEnabled;
  console.log({ isPressureDataEnabled });
  togglePressureDataButton.innerText = isPressureDataEnabled
    ? "disable pressure data"
    : "enable pressure data";
  devicePair.setSensorConfiguration({
    pressure: isPressureDataEnabled ? sensorRate : 0,
  });
});

/** @type {HTMLButtonElement} */
const resetPressureRangeButton = document.getElementById("resetPressureRange");
devicePair.addEventListener("isConnected", () => {
  resetPressureRangeButton.disabled = !devicePair.isPartiallyConnected;
});
resetPressureRangeButton.addEventListener("click", () => {
  devicePair.resetPressureRange();
});

let pressureAutoRange = true;
/** @type {HTMLButtonElement} */
const togglePressureAutoRangeButton = document.getElementById(
  "togglePressureAutoRange"
);
devicePair.addEventListener("isConnected", () => {
  togglePressureAutoRangeButton.disabled = !devicePair.isPartiallyConnected;
});
togglePressureAutoRangeButton.addEventListener("click", () => {
  pressureAutoRange = !pressureAutoRange;
  devicePair.setPressureAutoRange(pressureAutoRange);
  togglePressureAutoRangeButton.innerText = pressureAutoRange
    ? "disable pressure autoRange"
    : "enable pressure autoRange";
});

let pressureMotionAutoRange = false;
/** @type {HTMLButtonElement} */
const togglePressureMotionAutoRangeButton = document.getElementById(
  "togglePressureMotionAutoRange"
);
devicePair.addEventListener("isConnected", () => {
  togglePressureMotionAutoRangeButton.disabled =
    !devicePair.isPartiallyConnected;
});
togglePressureMotionAutoRangeButton.addEventListener("click", () => {
  pressureMotionAutoRange = !pressureMotionAutoRange;
  devicePair.setPressureMotionAutoRange(pressureMotionAutoRange);
  togglePressureMotionAutoRangeButton.innerText = pressureMotionAutoRange
    ? "disable pressureMotion autoRange"
    : "enable pressureMotion autoRange";
});
// PRESSURE END

// GAME ROTATION START
let isGameRotationDataEnabled = false;

/** @type {HTMLButtonElement} */
const toggleGameRotationButton = document.getElementById("toggleGameRotation");
devicePair.addEventListener("isConnected", () => {
  toggleGameRotationButton.disabled = !devicePair.isPartiallyConnected;
});
toggleGameRotationButton.addEventListener("click", () => {
  isGameRotationDataEnabled = !isGameRotationDataEnabled;
  toggleGameRotationButton.innerText = isGameRotationDataEnabled
    ? "disable gameRotation"
    : "enable gameRotation";
  devicePair.setSensorConfiguration({
    gameRotation: isGameRotationDataEnabled ? sensorRate : 0,
  });
});
// GAME ROTATION END

// SPARK START
import AFRAME from "aframe";
import { SplatMesh, SparkRenderer } from "@sparkjsdev/spark";
AFRAME.registerComponent("splat", {
  schema: {
    src: { default: "" },
  },
  init: function () {
    this.splat = new SplatMesh({ url: this.data.src });
    this.splat.quaternion.set(1, 0, 0, 0);

    this.el.setObject3D("mesh", this.splat);
  },
  remove: function () {
    // Remove from A-Frame / Three.js scene graph
    this.el.removeObject3D("mesh");

    // Dispose if supported (important for GPU memory)
    if (this.splat) {
      if (typeof this.splat.dispose === "function") {
        this.splat.dispose();
      }
      this.splat = null;
    }
  },
});

AFRAME.registerSystem("splat", {
  init: function () {
    const sparkRenderer = new SparkRenderer({ renderer: this.el.renderer });
    this.sceneEl.object3D.add(sparkRenderer);
  },
});
// SPARK END

// LOCOMOTION START
let useStrafing = true;
const setUseStrafing = (newUseStrafing) => {
  useStrafing = newUseStrafing;
  console.log({ useStrafing });
  useStrafingCheckbox.checked = useStrafing;
};
const toggleUseStrafing = () => {
  setUseStrafing(!useStrafing);
};
const useStrafingCheckbox = document.getElementById("useStrafing");
useStrafingCheckbox.addEventListener("input", () => {
  setUseStrafing(useStrafingCheckbox.checked);
});

const didStep = {
  left: true,
  right: true,
  /**
   * @param {boolean} newDidStep
   * @param {BS.Side} side
   */
  set(newDidStep, side) {
    if (this[side] == newDidStep) {
      return;
    }
    this[side] = newDidStep;
    if (this[side]) {
      this.takeStep(side);
    }
  },
  stepOffset: {
    left: new THREE.Vector2(),
    right: new THREE.Vector2(),
  },
  latestStepTime: {
    left: 0,
    right: 0,
  },
  /** @param {BS.Side} side */
  async takeStep(side) {
    const now = Date.now();
    this.latestStepTime[side] = now;
    console.log("takeStep", { side });
    const stepOffset = this.stepOffset[side];
    stepOffset.set(0, locomotionParams.stepLength);
    if (moveRelativeToInsoles && isGameRotationDataEnabled) {
      const relativeYaw = this.getRelativeYaw(side);
      stepOffset.rotateAround(
        { x: 0, y: 0 },
        THREE.MathUtils.degToRad(relativeYaw)
      );
    }

    stepOffset.y *= 0.5;
    while (stepOffset.length() > 0.001 && this.latestStepTime[side] == now) {
      const { x, y } = stepOffset;
      applyCameraOffset(x, y);
      stepOffset.multiplyScalar(0.9);
      await BS.wait(10);
    }
    applyCameraOffset(0, 0);
  },
  offsetYaw: {
    left: 0,
    right: 0,
  },
  latestYaw: {
    left: 0,
    right: 0,
  },
  didSetYawOnce: {
    left: false,
    right: false,
  },
  /** @param {BS.Side} side */
  getRelativeYaw(side) {
    return this.latestYaw[side] - this.offsetYaw[side];
  },
  /**
   * @param {number} yaw
   * @param {BS.Side} side
   */
  setYaw(yaw, side) {
    this.latestYaw[side] = yaw;
    if (!this.didSetYawOnce[side]) {
      this.didSetYawOnce[side] = true;
      this.tareYaw(side);
    }
  },
  /** @param {BS.Side?} side */
  tareYaw(side) {
    console.log("tareYaw");
    BS.Sides.forEach((_side) => {
      if (side && side != _side) {
        return;
      }
      this.offsetYaw[_side] = this.latestYaw[_side];
    });
  },
  /** @param {BS.Side?} side */
  tarePitch(side) {
    console.log("tarePitch");
    BS.Sides.forEach((_side) => {
      if (side && side != _side) {
        return;
      }
      this.pitchThreshold[_side] = this.latestPitch[_side];
    });
  },
  latestPitch: { left: 0, right: 0 },
  pitchThreshold: { left: -2, right: -2 },
  reset() {
    this.left = this.right = true;
    this.didSetYawOnce.left = this.didSetYawOnce.right = false;
    this.offsetYaw.left = this.offsetYaw.right = 0;
  },
};
window.didStep = didStep;

const tarePitchButton = document.getElementById("tarePitch");
tarePitchButton.addEventListener("click", () => {
  didStep.tarePitch();
});

const tareYawButton = document.getElementById("tareYaw");
tareYawButton.addEventListener("click", () => {
  didStep.tareYaw();
});

/** @typedef {"none" | "centerOfPressure" | "pressureStepping" | "pitchStepping" | "pedals"} LocomotionMode */
/** @type {LocomotionMode[]} */
const locomotionModes = [
  "none",
  "centerOfPressure",
  "pressureStepping",
  "pitchStepping",
  "pedals",
];
/** @type {LocomotionMode} */
let locomotionMode = "none";
/** @type {LocomotionMode?} */
let _locomotionMode;
/** @param {LocomotionMode} newLocomotionMode */
const setLocomotionMode = (newLocomotionMode) => {
  if (newLocomotionMode == "none") {
    _locomotionMode = locomotionMode;
  } else {
    _locomotionMode = undefined;
  }
  didStep.reset();
  locomotionMode = newLocomotionMode;
  console.log({ locomotionMode });
  locomotionModeSelect.value = locomotionMode;
};
const cycleLocomotionMode = () => {
  // console.log("cycleLocomotionMode");
  let index = locomotionModes.indexOf(locomotionMode);
  index++;
  index %= locomotionModes.length;
  setLocomotionMode(locomotionModes[index]);
};
window.cycleLocomotionMode = cycleLocomotionMode;
const locomotionModeSelect = document.getElementById("locomotionMode");
const locomotionModeOptgroup = locomotionModeSelect.querySelector("optgroup");
locomotionModes.forEach((locomotionMode) => {
  locomotionModeOptgroup.appendChild(new Option(locomotionMode));
});
locomotionModeSelect.addEventListener("input", (event) => {
  setLocomotionMode(event.target.value);
});
setLocomotionMode("none");

const toggleNone = () => {
  if (_locomotionMode) {
    setLocomotionMode(_locomotionMode);
  } else {
    setLocomotionMode("none");
  }
};

let centerOfPressureOffset = {
  x: 0.5,
  y: 0.5,
};
let centerOfPressureOffsets = {
  left: {
    x: 0.5,
    y: 0.5,
  },
  right: {
    x: 0.5,
    y: 0.5,
  },
};
/** @type {BS.CenterOfPressure?}  */
let latestCenterOfPressure;
/** @type {Record<BS.Side, BS.CenterOfPressure>?}  */
let latestCentersOfPressure;
const setCenterOfPressureOffset = async () => {
  if (!latestCenterOfPressure || !latestCentersOfPressure) {
    return;
  }
  console.log("setCenterOfPressureOffset");
  setCenterOfPressureOffsetButton.disabled = true;
  if (false) {
    for (let i = 3; i > 0; i--) {
      setCenterOfPressureOffsetButton.innerText = i;
      await BS.wait(1000);
    }
  }
  setCenterOfPressureOffsetButton.innerText = "set centerOfPressure offset";

  centerOfPressureOffset = latestCenterOfPressure;
  centerOfPressureOffsets = latestCentersOfPressure;

  setCenterOfPressureOffsetButton.disabled = false;
};
const setCenterOfPressureOffsetButton = document.getElementById(
  "setCenterOfPressureOffset"
);
devicePair.addEventListener("isConnected", () => {
  setCenterOfPressureOffsetButton.disabled = !devicePair.isPartiallyConnected;
});
setCenterOfPressureOffsetButton.addEventListener("click", () => {
  setCenterOfPressureOffset();
});
/**
 * @param {BS.CenterOfPressure} centerOfPressure
 * @param {BS.CenterOfPressure} offset
 */
const applyCenterOfPressureOffset = (
  centerOfPressure,
  offset,
  normalize = true
) => {
  const _centerOfPressure = {
    x: centerOfPressure.x - offset.x,
    y: centerOfPressure.y - offset.y,
  };
  if (normalize) {
    const offsetScalars = {
      x: [offset.x, 1 - offset.x],
      y: [offset.y, 1 - offset.y],
    };
    const offsetScalar = {
      x: 1 / offsetScalars.x[_centerOfPressure.x < offset.x ? 0 : 1],
      y: 1 / offsetScalars.y[_centerOfPressure.y < offset.y ? 0 : 1],
    };
    //console.log("offsetScalar", offsetScalar);
    _centerOfPressure.x *= offsetScalar.x;
    _centerOfPressure.y *= offsetScalar.y;
    // console.log("_centerOfPressure", _centerOfPressure);
  }
  return _centerOfPressure;
};
/** @param {BS.CenterOfPressure} */
const getCenterOfPressureAngle = (centerOfPressure, useDegrees = true) => {
  let angle = Math.atan2(centerOfPressure.y, centerOfPressure.x);
  angle -= Math.PI / 2;
  while (angle < Math.PI) {
    angle += 2 * Math.PI;
  }
  while (angle > Math.PI) {
    angle -= 2 * Math.PI;
  }
  if (useDegrees) {
    angle = THREE.MathUtils.radToDeg(angle);
  }
  return angle;
};
/** @param {BS.CenterOfPressure} centerOfPressure */
const getCenterOfPressureMagnitude = (centerOfPressure) => {
  const { x, y } = centerOfPressure;
  const magnitude = Math.sqrt(x ** 2 + y ** 2);
  return magnitude;
};
/** @typedef {{angle: number, magnitude: number, centerOfPressure: BS.CenterOfPressure}} PolarCenterOfPressure */
/**
 * @param {BS.CenterOfPressure} centerOfPressure
 * @param {BS.Side?} side
 */
const getPolarCenterOfPressure = (centerOfPressure, side) => {
  centerOfPressure = applyCenterOfPressureOffset(
    centerOfPressure,
    centerOfPressureOffsets[side] ?? centerOfPressureOffset
  );
  return {
    angle: getCenterOfPressureAngle(centerOfPressure),
    magnitude: getCenterOfPressureMagnitude(centerOfPressure),
    centerOfPressure,
  };
};

const locomotionParams = {
  angleDifferenceThreshold: { min: 120, max: 120 },
  magnitudeThreshold: 0.4,
  offsetScalar: {
    x: 1,
    y: 1,
  },
  turnScalar: 0.8,
  turnScalar2: 0.4,
  stepLength: 0.2,
  scaledSumThreshold: { left: 0.1, right: 0.1 },
};
window.locomotionParams = locomotionParams;
/**
 * @param {BS.CenterOfPressure} centerOfPressure
 * @param {Record<BS.Side, BS.CenterOfPressure>} centersOfPressure
 */
const onCenterOfPressure = (centerOfPressure, centersOfPressure) => {
  // console.log("onCenterOfPressure", centerOfPressure, centersOfPressure);
  centerOfPressureInput.value = centerOfPressure;
  BS.Sides.forEach((side) => {
    centerOfPressureInputs[side].value = centersOfPressure[side];
  });

  latestCenterOfPressure = centerOfPressure;
  latestCentersOfPressure = centersOfPressure;

  const polarCenterOfPressure = getPolarCenterOfPressure(centerOfPressure);
  /** @type {Record<BS.Side, PolarCenterOfPressure>} */
  const polarCentersOfPressure = {};
  BS.Sides.forEach((side) => {
    polarCentersOfPressure[side] = getPolarCenterOfPressure(
      centersOfPressure[side],
      side
    );
  });

  // console.log("polarCenterOfPressure", polarCenterOfPressure);

  let yaw = 0;
  let x = 0;
  let y = 0;

  if (locomotionMode == "centerOfPressure") {
    let angleDifference = Math.abs(
      polarCentersOfPressure.left.angle - polarCentersOfPressure.right.angle
    );
    angleDifference = Math.min(angleDifference, 360 - angleDifference);
    // console.log({ angleDifference });

    const areCentersAligned =
      angleDifference < locomotionParams.angleDifferenceThreshold.min;
    const areCentersOpposed =
      angleDifference > locomotionParams.angleDifferenceThreshold.max;
    const isMagnitudePositive =
      polarCenterOfPressure.magnitude > locomotionParams.magnitudeThreshold;

    const areMagnitudesPositive = BS.Sides.every((side) => {
      return (
        polarCentersOfPressure[side].magnitude >
        locomotionParams.magnitudeThreshold
      );
    });

    // console.log({
    //   areCentersAligned,
    //   isMagnitudePositive,
    //   areMagnitudesPositive,
    // });

    if (areCentersAligned && isMagnitudePositive && areMagnitudesPositive) {
      x =
        polarCenterOfPressure.centerOfPressure.x *
        locomotionParams.offsetScalar.x *
        sensorRateScalar;
      y =
        polarCenterOfPressure.centerOfPressure.y *
        locomotionParams.offsetScalar.y *
        sensorRateScalar;

      if (!useStrafing) {
        yaw = -x;
        yaw *= locomotionParams.turnScalar;
        // FIX - tweak yaw
        x = 0;
      }
    }
    // console.log({ areCentersOpposed, areMagnitudesPositive, useStrafing });
    if (areCentersOpposed && areMagnitudesPositive && useStrafing) {
      yaw = 0;
      // FIX - tweak yaw
      BS.Sides.forEach((side) => {
        const scalar = side == "left" ? -1 : 1;
        const { centerOfPressure, magnitude } = polarCentersOfPressure[side];
        yaw +=
          centerOfPressure.y *
          scalar *
          magnitude *
          locomotionParams.turnScalar2 *
          sensorRateScalar;
      });
    }
  }

  // console.log({ yaw,x,y });
  applyCameraYaw(yaw);
  applyCameraOffset(x, y);
};

devicePair.addEventListener("pressure", (event) => {
  const { normalizedCenter, sides } = event.message.pressure;
  if (!normalizedCenter) {
    return;
  }

  const normalizedCenters = {
    left: sides.left.normalizedCenter,
    right: sides.right.normalizedCenter,
  };

  BS.Sides.forEach((side) => {
    const { normalizedCenter, motionCenter, calibratedCenter } = sides[side];
    normalizedCenters[side] =
      calibratedCenter ?? motionCenter ?? normalizedCenter;
  });
  onCenterOfPressure(normalizedCenter, normalizedCenters);
});

let moveRelativeToInsoles = false;
const setMoveRelativeToInsoles = (newMoveRelativeToInsoles) => {
  moveRelativeToInsoles = newMoveRelativeToInsoles;
  console.log({ moveRelativeToInsoles });
  moveRelativeToInsolesCheckbox.checked = moveRelativeToInsoles;
};
const toggleMoveRelativeToInsoles = () => {
  setMoveRelativeToInsoles(!moveRelativeToInsoles);
};
const moveRelativeToInsolesCheckbox = document.getElementById(
  "moveRelativeToInsoles"
);
moveRelativeToInsolesCheckbox.addEventListener("input", () => {
  setMoveRelativeToInsoles(moveRelativeToInsolesCheckbox.checked);
});

const rightFootDominantCheckbox = document.getElementById("rightFootDominant");
rightFootDominantCheckbox.addEventListener("input", () => {
  setDominantFoot(rightFootDominantCheckbox.checked ? "right" : "left");
});
/** @param {BS.Side} side */
const setDominantFoot = (side) => {
  pedalsParams.dominantFoot = side;
  rightFootDominantCheckbox.checked = side == "right";
  console.log("pedalsParams.dominantFoot", pedalsParams.dominantFoot);
};

const pedalsParams = {
  /** @type {BS.Side} */
  dominantFoot: "right",
  scalar: {
    y: 3,
    x: 3,
    yaw: 50,
  },
};
window.pedalsParams = pedalsParams;
devicePair.addEventListener("devicePressure", (event) => {
  const { side, pressure } = event.message;

  const { normalizedCenter, motionCenter, calibratedCenter } = pressure;
  const center = calibratedCenter ?? motionCenter ?? normalizedCenter;

  let yaw = 0;
  let x = 0;
  let y = 0;

  if (locomotionMode == "pressureStepping") {
    const isFootDown =
      pressure.scaledSum > locomotionParams.scaledSumThreshold[side];
    // console.log("pressure", pressure.scaledSum, { side, isFootDown });
    didStep.set(isFootDown, side);
  } else if (locomotionMode == "pedals") {
    if (center) {
      const polarCenterOfPressure = getPolarCenterOfPressure(center, side);
      if (
        polarCenterOfPressure.magnitude > locomotionParams.magnitudeThreshold
      ) {
        let offset = polarCenterOfPressure.centerOfPressure.y;
        offset *= sensorRateScalar;
        const isDominant = pedalsParams.dominantFoot == side;
        if (isDominant) {
          offset *= pedalsParams.scalar.y;
          y = offset;
        } else {
          if (useStrafing) {
            offset *= pedalsParams.scalar.x;
            x = offset;
          } else {
            offset *= pedalsParams.scalar.yaw;
            yaw = offset;
          }
        }
      }
    }
  }

  applyCameraYaw(yaw, true);
  applyCameraOffset(x, y);
});
devicePair.addEventListener("deviceGameRotation", (event) => {
  const { side, gameRotationEuler } = event.message;

  didStep.latestYaw[side] = gameRotationEuler.heading;
  didStep.latestPitch[side] = gameRotationEuler.pitch;

  if (locomotionMode == "pitchStepping") {
    const isFootDown = gameRotationEuler.pitch > didStep.pitchThreshold[side];
    // console.log("pitch", gameRotationEuler.pitch, { side, isFootDown });
    didStep.set(isFootDown, side);
  }
});

/**
 * @param {BS.Euler} euler
 * @param {BS.Side} side
 */
const onSideEuler = (euler, side) => {
  //console.log("onSideEuler", euler, { side });
  gameRotationInputs[side].value = {
    x: -euler.roll,
    y: -euler.pitch,
  };
};

devicePair.addEventListener("deviceGameRotation", (event) => {
  const { side, gameRotationEuler } = event.message;
  onSideEuler(gameRotationEuler, side);
});

let moveRelativeToCamera = true;
const setMoveRelativeToCamera = (newMoveRelativeToCamera) => {
  moveRelativeToCamera = newMoveRelativeToCamera;
  console.log({ moveRelativeToCamera });
  moveRelativeToCameraCheckbox.checked = moveRelativeToCamera;
};
const toggleMoveRelativeToCamera = () => {
  setMoveRelativeToCamera(!moveRelativeToCamera);
};
const moveRelativeToCameraCheckbox = document.getElementById(
  "moveRelativeToCamera"
);
moveRelativeToCameraCheckbox.addEventListener("click", () => {
  setMoveRelativeToCamera(moveRelativeToCameraCheckbox.checked);
});

const cameraQuaternion = new THREE.Quaternion();
const cameraEuler = new THREE.Euler(0, 0, 0, "YXZ");
const cameraOffsetVector = new THREE.Vector3();
/**
 * @param {number} x
 * @param {number} y
 */
const applyCameraOffset = (x, y) => {
  // console.log("applyCameraOffset", { x, y });
  if (useVRChat) {
    x /= sensorRateScalar;
    y /= sensorRateScalar;
    setVrChat2DInput(x, y);
  } else {
    if (x == 0 && y == 0) {
      return;
    }
    /** @type {Object3D} */
    const cameraRig = cameraRigEntity.object3D;
    const { position } = cameraRig;

    /** @type {Object3D} */
    const camera = cameraEntity.object3D;

    cameraOffsetVector.set(x, 0, -y);
    if (moveRelativeToCamera) {
      camera.getWorldQuaternion(cameraQuaternion);
    } else {
      cameraRig.getWorldQuaternion(cameraQuaternion);
    }

    cameraEuler.setFromQuaternion(cameraQuaternion);
    cameraEuler.x = cameraEuler.z = 0;
    cameraOffsetVector.applyEuler(cameraEuler);
    position.add(cameraOffsetVector);
  }
};
window.applyCameraOffset = applyCameraOffset;

const vrChatScalars = {
  yaw: 1.0,
};
window.vrChatScalars = vrChatScalars;
/** @param {number} yaw */
const applyCameraYaw = (yaw, isDegrees = false) => {
  if (useVRChat) {
    yaw /= sensorRateScalar;
    yaw *= -1;
    yaw *= vrChatScalars.yaw;
    setVrChatLookHorizontal(yaw);
  } else {
    if (yaw == 0) {
      return;
    }
    /** @type {Object3D} */
    const cameraRig = cameraRigEntity.object3D;
    const { rotation } = cameraRig;
    if (isDegrees) {
      yaw = THREE.MathUtils.degToRad(yaw);
    }
    rotation.y += yaw;
  }
};
window.applyCameraYaw = applyCameraYaw;
// LOCOMOTION END

// MODELS START
/** @typedef {{src: string, position?: BS.Vector3, scale?: number}} Model */
/** @type {Model[]} */
const models = [
  {
    src: "https://storage.googleapis.com/forge-dev-public/painted_bedroom.spz",
    position: { x: 0, y: 1.6, z: 0 },
    scale: 1,
  },
  {
    src: "https://sparkjs.dev/assets/splats/valley.spz",
  },
  {
    src: "https://sparkjs.dev/assets/models/table.glb",
  },
];

const modelsSelect = document.getElementById("models");
const modelsOptgroup = modelsSelect.querySelector("optgroup");
modelsOptgroup.appendChild(new Option("none"));
/** @param {Model} model */
const appendModel = (model) => {
  const name = model.src.split("/").at(-1);
  modelsOptgroup.appendChild(new Option(name, model.src));
};
models.forEach((model) => {
  appendModel(model);
});
modelsOptgroup.value = "none";

const clearModelSelect = () => {
  modelsSelect.value = "none";
  saveToLocalStorage();
};

modelsSelect.addEventListener("input", (event) => {
  const model = models.find((model) => model.src == event.target.value);
  selectModel(model);
});
/** @param {Model} model */
const selectModel = (model) => {
  if (!model) {
    clearModel();
    return;
  }
  modelsSelect.value = model.src;
  onFileURL(model.src);
};
// MODELS END

// AFRAME START
const sceneEntity = document.getElementById("scene");
const cameraEntity = document.getElementById("camera");
const cameraRigEntity = document.getElementById("cameraRig");
const modelEntity = document.getElementById("model");

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

// META TOUCH CONTROLS START
const controllers = {
  left: document.getElementById("leftController"),
  right: document.getElementById("rightController"),
};
/** @typedef {"dominant" | "nonDominant"} MetaTouchControlSide */
/** @typedef {"upperButton" | "lowerButton" | "grip" | "trigger"} MetaTouchControlType */
/** @type {MetaTouchControlType[]} */
const metaTouchControlTypes = ["trigger", "upperButton", "lowerButton", "grip"];
/** @typedef {{callback: () => boolean, string: string | () => string}} MetaTouchControl */
/** @typedef {"tarePitch" | "tareYaw" | "setCenterOfPressureOffset" | "toggleMoveRelativeToCamera" | "toggleMoveRelativeToInsoles" | "toggleUseStrafing" | "toggleNone" | "cycleLocomotionMode"} MetaTouchControlName */
/** @type {Record<MetaTouchControlName, MetaTouchControl>} */
const controlMaps = {
  tarePitch: {
    callback: () => {
      didStep.tarePitch();
    },
    string: "tare pitch",
  },
  tareYaw: {
    callback: () => {
      didStep.tareYaw();
    },
    string: "tare yaw",
  },
  setCenterOfPressureOffset: {
    callback: () => {
      setCenterOfPressureOffset();
    },
    string: "offset cop",
  },
  toggleMoveRelativeToCamera: {
    callback: () => {
      toggleMoveRelativeToCamera();
      return true;
    },
    string: () => {
      return moveRelativeToCamera ? "~cameraForward" : "cameraForward";
    },
  },
  toggleMoveRelativeToInsoles: {
    callback: () => {
      toggleMoveRelativeToInsoles();
      return true;
    },
    string: () => {
      return moveRelativeToInsoles ? "~insolesForward" : "insolesForward";
    },
  },
  toggleUseStrafing: {
    callback: () => {
      toggleUseStrafing();
      return true;
    },
    string: () => {
      return useStrafing ? "~strafing" : "strafing";
    },
  },
  toggleNone: {
    callback: () => {
      toggleNone();
      return true;
    },
    string: () => {
      return locomotionMode == "none" ? "resume" : "pause";
    },
  },
  cycleLocomotionMode: {
    callback: () => {
      cycleLocomotionMode();
      return true;
    },
    string: () => {
      return `mode: ${locomotionMode}`;
    },
  },
};
/** @typedef {Record<MetaTouchControlType, MetaTouchControl>} MetaTouchControlMap */
const controls = {
  /** @type {Record<"true"|"false", MetaTouchControlMap>} */
  maps: {
    true: {
      trigger: controlMaps.toggleMoveRelativeToCamera,
      upperButton: controlMaps.toggleUseStrafing,
      lowerButton: controlMaps.setCenterOfPressureOffset,
      grip: controlMaps.toggleMoveRelativeToInsoles,
    },
    false: {
      trigger: controlMaps.cycleLocomotionMode,
      upperButton: controlMaps.tarePitch,
      lowerButton: controlMaps.tareYaw,
      grip: controlMaps.toggleNone,
    },
  },
  /**
   * @param {MetaTouchControlType} type
   * @param {boolean} isDominant
   */
  onControl(type, isDominant) {
    const string = isDominant ? "true" : "false";
    console.log("onControl", { type, isDominant });
    const shouldUpdateEntity = this.maps[string][type]?.callback();
    if (shouldUpdateEntity) {
      this.updateEntity();
    }
  },
  /**
   * @param {MetaTouchControlType} type
   * @param {boolean} isDominant
   */
  getPrefix(type, isDominant) {
    const side = this.getSide(isDominant);
    switch (type) {
      case "upperButton":
        return side == "left" ? "Y" : "B";
      case "lowerButton":
        return side == "left" ? "X" : "A";
      case "grip":
        return "G";
      case "trigger":
        return "T";
    }
  },
  /** @type {BS.Side} */
  dominantSide: "right",
  get nonDominantSide() {
    return this.dominantSide == "right" ? "left" : "right";
  },
  /** @param {boolean} isDominant */
  getSide(isDominant) {
    return isDominant ? this.dominantSide : this.nonDominantSide;
  },
  /** @param {boolean} isDominant */
  toString(isDominant) {
    const map = this.maps[isDominant];
    const strings = [];
    metaTouchControlTypes
      .filter((type) => map[type])
      .forEach((type) => {
        let { string } = map[type];
        if (typeof string == "function") {
          string = string();
        }
        if (string) {
          const prefix = this.getPrefix(type, isDominant);
          if (prefix) {
            string = [prefix, string].join(": ");
          }
          strings.push(string);
        } else {
          console.warn("no string found for control", { isDominant, type });
        }
      });
    // console.log({ isDominant }, strings);
    const string = strings.join("\n");
    return string;
  },
  updateEntity() {
    sceneEntity.setAttribute("meta-touch-controls-ui", {
      dominantText: this.toString(true),
      nonDominantText: this.toString(false),
      dominantSide: this.dominantSide,
    });
  },
};
sceneEntity.addEventListener("loaded", () => {
  controls.updateEntity();
});
// console.log("controllers", controllers);
sceneEntity.addEventListener("controller-button", (event) => {
  const { isDominant, side, pressed, isUpper } = event.detail;
  if (!pressed) {
    return;
  }
  if (isUpper) {
    controls.onControl("upperButton", isDominant);
  } else {
    controls.onControl("lowerButton", isDominant);
  }
});
sceneEntity.addEventListener("controller-trigger", (event) => {
  const { isDominant, side, pressed } = event.detail;
  if (!pressed) {
    return;
  }
  controls.onControl("trigger", isDominant);
});
sceneEntity.addEventListener("controller-grip", (event) => {
  const { isDominant, side, pressed } = event.detail;
  if (!pressed) {
    return;
  }
  controls.onControl("grip", isDominant);
});
const thumbstickScalars = {
  x: 100,
  y: -100,
  yaw: -50,
};
window.thumbstickScalars = thumbstickScalars;
sceneEntity.addEventListener("controller-thumbstick-tick", (event) => {
  let { isDominant, side, x, y, timeDelta } = event.detail;
  const timeDeltaScaler = timeDelta / 1000;
  x *= timeDeltaScaler;
  y *= timeDeltaScaler;

  if (isDominant) {
    const yaw = x * thumbstickScalars.yaw;
    applyCameraYaw(yaw);
  } else {
    x *= thumbstickScalars.x;
    y *= thumbstickScalars.y;
    applyCameraOffset(x, y);
  }
});

// META TOUCH CONTROLS END

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

// MODEL START
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

/** @type {HTMLInputElement} */
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

/** @typedef {"glb" | "gltf" | "ply" | "spz" | "splat" | "ksplat"} ModelType */

/** @type {ModelType[]} */
const acceptedFileTypes = ["glb", "gltf", "ply", "spz", "splat", "ksplat"];
modelFileInput.accept = acceptedFileTypes
  .map((fileType) => "." + fileType)
  .join(",");
// console.log("acceptedFileTypes", acceptedFileTypes);
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // console.log("pasted item", item);
    const file = item.getAsFile();
    if (!file) {
      return;
    }
    //console.log("pasted file", file);
    await onFile(file);
  }
});

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
window.addEventListener("paste", (event) => {
  const urlString = event.clipboardData.getData("text");
  if (!isValidUrl(urlString)) {
    return;
  }
  console.log(urlString);
  onFileURL(urlString);
});

/** @type {string} */
let latestCreateObjectUrl;
const revokeObjectURL = () => {
  if (latestCreateObjectUrl) {
    URL.revokeObjectURL(latestCreateObjectUrl);
    latestCreateObjectUrl = undefined;
  }
};
/** @param {File} file */
const createObjectUrl = (file) => {
  revokeObjectURL();
  latestCreateObjectUrl = URL.createObjectURL(file);
  return latestCreateObjectUrl;
};
/** @param {File} file */
const onFile = async (file) => {
  // console.log("onFile", file);
  const fileExtension = file.name.split(".").at(-1);
  if (acceptedFileTypes.includes(fileExtension)) {
    clearModelSelect();
    const src = createObjectUrl(file);
    loadModelFileUrl(src, fileExtension);
  } else {
    console.error("invalid file", file);
  }
};

/** @param {string} fileUrlString */
const onFileURL = (fileUrlString) => {
  // console.log("onFileURL", fileUrlString);
  const fileExtension = fileUrlString.split(".").at(-1);
  if (acceptedFileTypes.includes(fileExtension)) {
    loadModelFileUrl(fileUrlString, fileExtension, true);
  } else {
    console.error("invalid fileUrlString", fileUrlString);
  }
};
const clearModel = () => {
  modelEntity.removeAttribute("gltf-model");
  modelEntity.removeAttribute("splat");
  saveToLocalStorage();
};

/**
 * @param {string} fileUrlString
 * @param {ModelType} modelType
 */
const loadModelFileUrl = (fileUrlString, modelType, isUrl = false) => {
  modelType = modelType ?? fileUrlString.split(".").at(-1);
  // console.log("loadModelFileUrl", fileUrlString, modelType);

  clearModel();

  switch (modelType) {
    case "glb":
    case "gltf":
      modelEntity.setAttribute("gltf-model", fileUrlString);
      break;
    case "ply":
    case "spz":
    case "splat":
    case "ksplat":
      modelEntity.setAttribute("splat", { src: fileUrlString });
      break;
  }

  if (isUrl) {
    let model = models.find(({ src }) => src == fileUrlString);
    if (model) {
      modelsSelect.value = model.src;
    } else {
      model = { src: fileUrlString };
      appendModel(model);
      modelsSelect.value = fileUrlString;
    }

    /** @type {Object3D} */
    const object3D = modelEntity.object3D;

    if (model.position) {
      modelEntity.setAttribute("position", model.position);
    } else {
      object3D.position.setScalar(0);
    }

    if (model.scale != undefined) {
      modelEntity.setAttribute("scale", {
        x: model.scale,
        y: model.scale,
        z: model.scale,
      });
    } else {
      object3D.scale.setScalar(1);
    }
    saveToLocalStorage(fileUrlString);
  }
};

const localStorageKey = "bs.locomotion";
const saveToLocalStorage = (urlString) => {
  if (urlString) {
    localStorage.setItem(localStorageKey, urlString);
  } else {
    localStorage.removeItem(localStorageKey);
  }
};
const loadFromLocalStorage = () => {
  const urlString = localStorage.getItem(localStorageKey);
  if (!urlString) {
    return;
  }
  onFileURL(urlString);
};
loadFromLocalStorage();
// MODEL END

// CANVAS INPUT START
const centerOfPressureInput = document.getElementById("centerOfPressureInput");
const leftCenterOfPressureInput = document.getElementById(
  "leftCenterOfPressureInput"
);
const rightCenterOfPressureInput = document.getElementById(
  "rightCenterOfPressureInput"
);
const centerOfPressureInputs = {
  left: leftCenterOfPressureInput,
  right: rightCenterOfPressureInput,
};

const leftGameRotationInput = document.getElementById("leftGameRotationInput");
const rightGameRotationInput = document.getElementById(
  "rightGameRotationInput"
);
const gameRotationInputs = {
  left: leftGameRotationInput,
  right: rightGameRotationInput,
};
// CANVAS INPUT END

// GAMEPAD START
const gamepadScalar = {
  yaw: 2,
  offset: 0.05,
};
let useGamepad = true;
/** @param {boolean} newUseGamepad */
const setUseGamepad = (newUseGamepad) => {
  useGamepad = newUseGamepad;
  console.log({ useGamepad });
  useGamepadCheckbox.checked = useGamepad;
};
const toggleUseGamepad = () => setUseGamepad(!useGamepad);

const useGamepadCheckbox = document.getElementById("useGamepad");
useGamepadCheckbox.addEventListener("input", () => {
  setUseGamepad(useGamepadCheckbox.checked);
});

let onGamepadTick = (event) => {
  const { thumbsticks } = event.detail;

  if (!useGamepad) {
    thumbsticks.forEach((thumbstick, index) => {
      const { x, y, angle, magnitude } = thumbstick;
      const side = index == 0 ? "left" : "right";
      if (magnitude > 0) {
        if (side == "right") {
          applyCameraYaw(-x * gamepadScalar.yaw, true);
        } else {
          applyCameraOffset(x * gamepadScalar.offset, y * gamepadScalar.offset);
        }
      } else {
        applyCameraYaw(0);
        applyCameraOffset(0, 0);
      }
    });
  }

  if (useGamepad) {
    const centerOfPressure = { x: 0, y: 0 };
    const centersOfPressure = {};
    thumbsticks.forEach((thumbstick, index) => {
      const { x, y, angle, magnitude } = thumbstick;
      const side = index == 0 ? "left" : "right";
      // console.log({ side, x, y, magnitude, angle });
      const sideCenterOfPressure = {
        x: (x + 1) / 2,
        y: (y + 1) / 2,
      };
      centersOfPressure[side] = sideCenterOfPressure;

      centerOfPressure.x += sideCenterOfPressure.x / 2;
      centerOfPressure.y += sideCenterOfPressure.y / 2;
    });

    onCenterOfPressure(centerOfPressure, centersOfPressure);
  }
};
onGamepadTick = BS.ThrottleUtils.throttle(onGamepadTick, sensorRate);
window.addEventListener("gamepadtick", onGamepadTick);
window.addEventListener("gamepadbuttonchange", (event) => {
  const { buttonChange } = event.detail;
  //console.log("buttonChange", buttonChange);
  const { index, pressed } = buttonChange;

  switch (index) {
    case 0: // X
      if (pressed) {
        toggleUseGamepad();
      }
      break;
    case 1: // O
      if (pressed) {
        toggleNone();
      }
      break;
    default:
      console.log("uncaught button", { index, pressed });
      break;
  }
});
// GAMEPAD END

// VRCHAT START
const vrChatContainer = document.getElementById("vrChat");

let useVRChat = false;
const setUseVRChat = (newUseVRChat) => {
  useVRChat = newUseVRChat;
  console.log({ useVRChat });
  useVRChatCheckbox.checked = useVRChat;
  if (useVRChat) {
    vrChatContainer.removeAttribute("hidden");
  } else {
    vrChatContainer.setAttribute("hidden", "");
  }
};
const useVRChatCheckbox = document.getElementById("useVRChat");
useVRChatCheckbox.addEventListener("input", () => {
  setUseVRChat(useVRChatCheckbox.checked);
});

let vrChatAddress = "";
const setVrChatAddress = (newVrChatAddress, isVrChatMessageResponse) => {
  if (vrChatAddress == newVrChatAddress) {
    return;
  }
  if (isVrChatMessageResponse) {
    // setUseVRChat(true);
  }
  vrChatAddress = newVrChatAddress;
  console.log({ vrChatAddress });
  vrChatAddressInput.value = vrChatAddress;
  if (!isVrChatMessageResponse) {
    sendVrChatMessage({
      type: "setAddress",
      message: { address: vrChatAddress },
    });
  }
};
const vrChatAddressInput = document.getElementById("vrChatAddress");
vrChatAddressInput.addEventListener("focusout", () => {
  setVrChatAddress(vrChatAddressInput.value);
});

const vrChatControls = {
  vertical: 0,
  horizontal: 0,
  lookHorizontal: 0,
};

const vrChat2DInput = document.getElementById("vrChat2D");
vrChat2DInput.addEventListener("input", () => {
  const { x: horizontal, y: vertical } = vrChat2DInput.value;
  setVrChat2DInput(horizontal, vertical);
});
vrChat2DInput.addEventListener("change", () => {
  setVrChat2DInput(0, 0);
});
const throttledSetVrChat2DInput = BS.ThrottleUtils.throttle(
  (horizontal, vertical) =>
    sendVrChatMessage({
      type: "set2DInput",
      message: { horizontal, vertical },
    }),
  sensorRate,
  true
);
const setVrChat2DInput = (horizontal, vertical, isVrChatMessageResponse) => {
  Object.assign(vrChatControls, { horizontal, vertical });
  // console.log("setVrChat2DInput", {
  //   horizontal,
  //   vertical,
  //   isVrChatMessageResponse,
  // });
  vrChat2DInput.value = { x: horizontal, y: vertical };
  if (!isVrChatMessageResponse) {
    if (horizontal == 0 && vertical == 0) {
      sendVrChatMessage({
        type: "set2DInput",
        message: { horizontal, vertical },
      });
    } else {
      throttledSetVrChat2DInput(horizontal, vertical);
    }
  }
};

const vrChatLookHorizontalInput = document.getElementById(
  "vrChatLookHorizontal"
);
vrChatLookHorizontalInput.addEventListener("input", () => {
  const lookHorizontal = +vrChatLookHorizontalInput.value;
  setVrChatLookHorizontal(lookHorizontal);
});
vrChatLookHorizontalInput.addEventListener("change", () => {
  setVrChatLookHorizontal(0);
});
const throttledSetVrChatLookHorizontal = BS.ThrottleUtils.throttle(
  (lookHorizontal) =>
    sendVrChatMessage({
      type: "setLookHorizontal",
      message: { lookHorizontal },
    }),
  sensorRate,
  true
);
const setVrChatLookHorizontal = (lookHorizontal, isVrChatMessageResponse) => {
  Object.assign(vrChatControls, { lookHorizontal });
  // console.log("setVrChatLookHorizontal", {
  //   lookHorizontal,
  //   isVrChatMessageResponse,
  // });
  vrChatLookHorizontalInput.value = lookHorizontal;
  if (!isVrChatMessageResponse) {
    if (lookHorizontal == 0) {
      sendVrChatMessage({
        type: "setLookHorizontal",
        message: { lookHorizontal },
      });
    } else {
      throttledSetVrChatLookHorizontal(lookHorizontal);
    }
  }
};

/** @typedef {{type: "getAddress"}} GetAddressVRChatMessage */
/** @typedef {{type: "setAddress", message: {address: string}}} SetAddressVRChatMessage */
/** @typedef {{type: "getLookHorizontal"}} GetLookHorizontalVRChatMessage */
/** @typedef {{type: "setLookHorizontal", message: {lookHorizontal: number}}} SetLookHorizontalVRChatMessage */
/** @typedef {{type: "get2DInput"}} Get2DInputVRChatMessage */
/** @typedef {{type: "set2DInput", message: {vertical?: number, horizontal?: number}}} Set2DInputVRChatMessage */
/** @typedef { GetAddressVRChatMessage | SetAddressVRChatMessage | GetLookHorizontalVRChatMessage | SetLookHorizontalVRChatMessage | Get2DInputVRChatMessage | Set2DInputVRChatMessage } VRChatMessage */

/** @typedef {VRChatMessage["type"]} VRChatMessageType */
/** @typedef {{type: VRChatMessageType, error?: string}} VRChatMessageResponse */

/** @param {VRChatMessage} sendVrChatMessage */
const sendVrChatMessage = async (sendVrChatMessage) => {
  // console.log("sendVrChatMessage", sendVrChatMessage);
  const response = await fetch("https://localhost/vrchat/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendVrChatMessage),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(error);
    return;
  }

  /** @type {VRChatMessageResponse} */
  const json = await response.json();
  // console.log("json", json);
  switch (json.type) {
    case "getAddress":
      {
        const { address } = json.message;
        setVrChatAddress(address, true);
      }
      break;
    case "get2DInput":
      {
        const { horizontal, vertical } = json.message;
        setVrChat2DInput(horizontal, vertical, true);
      }
      break;
    case "getLookHorizontal":
      {
        const { lookHorizontal } = json.message;
        setVrChatLookHorizontal(lookHorizontal, true);
      }
      break;
    default:
      break;
  }
};
window.sendVrChatMessage = sendVrChatMessage;
sendVrChatMessage({
  type: "getAddress",
});
sendVrChatMessage({
  type: "get2DInput",
});
sendVrChatMessage({
  type: "getLookHorizontal",
});
// VRCHAT END

// TF MODEL
const getBasePressureCalibrationModelKey = (side) =>
  `bs.${side}.centerOfPressure.model`;
const getPressureCalibrationModelIndexeddbKey = (side) =>
  `indexeddb://${getBasePressureCalibrationModelKey(side)}`;

devicePair.addEventListener("deviceIsConnected", async (event) => {
  const { device, side } = event.message;

  if (device.isConnected) {
    const isTensorFlowModelAvailable = await BS.isTensorFlowModelAvailable(
      getPressureCalibrationModelIndexeddbKey(side)
    );
    console.log({ isTensorFlowModelAvailable, side });
    if (isTensorFlowModelAvailable) {
      loadPressureCalibratonModelButton.disabled = false;
    }
  }
});

const loadPressureCalibratonModelButton = document.getElementById(
  "loadPressureCalibratonModel"
);
loadPressureCalibratonModelButton.addEventListener("click", () => {
  loadPressureCalibratonModel();
});
const loadPressureCalibratonModel = async () => {
  console.log("loadPressureCalibratonModel");
  loadPressureCalibratonModelButton.disabled = true;
  for (const side of devicePair.sides) {
    console.log({ side }, !devicePair[side]?.isConnected);
    if (!devicePair[side]?.isConnected) {
      continue;
    }
    const isTensorFlowModelAvailable = await BS.isTensorFlowModelAvailable(
      getPressureCalibrationModelIndexeddbKey(side)
    );
    console.log({ isTensorFlowModelAvailable, side });
    if (isTensorFlowModelAvailable) {
      const didLoad = await devicePair[side].loadPressureCalibrationModel(
        getPressureCalibrationModelIndexeddbKey(side)
      );
      console.log({ didLoad, side });
    }
  }
};
