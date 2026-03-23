import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
//BS.setAllConsoleLevelFlags({ log: true });

// CONNECTION START
const devicePair = BS.DevicePair.insoles;

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

/** @type {HTMLButtonElement} */
const togglePressureDataButton = document.getElementById("togglePressureData");
devicePair.addEventListener("isConnected", () => {
  togglePressureDataButton.disabled = !devicePair.isConnected;
});
togglePressureDataButton.addEventListener("click", () => {
  isPressureDataEnabled = !isPressureDataEnabled;
  console.log({ isPressureDataEnabled });
  togglePressureDataButton.innerText = isPressureDataEnabled
    ? "disable pressure data"
    : "enable pressure data";
  devicePair.setSensorConfiguration({
    pressure: isPressureDataEnabled ? 20 : 0,
  });
});

/** @type {HTMLButtonElement} */
const resetPressureRangeButton = document.getElementById("resetPressureRange");
devicePair.addEventListener("isConnected", () => {
  resetPressureRangeButton.disabled = !devicePair.isConnected;
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
  togglePressureAutoRangeButton.disabled = !devicePair.isConnected;
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
  togglePressureMotionAutoRangeButton.disabled = !devicePair.isConnected;
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
  toggleGameRotationButton.disabled = !devicePair.isConnected;
});
toggleGameRotationButton.addEventListener("click", () => {
  isGameRotationDataEnabled = !isGameRotationDataEnabled;
  toggleGameRotationButton.innerText = isGameRotationDataEnabled
    ? "disable gameRotation"
    : "enable gameRotation";
  devicePair.setSensorConfiguration({
    gameRotation: isGameRotationDataEnabled ? 20 : 0,
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
/** @typedef {"centerOfPressure" | "stepping" | "sitStepping" | "sitSliding"} LocomotionMode */
/** @type {LocomotionMode[]} */
const locomotionModes = [
  "centerOfPressure",
  "stepping",
  "sitStepping",
  "sitSliding",
];
/** @type {LocomotionMode} */
let locomotionMode = "centerOfPressure";
/** @param {LocomotionMode} newLocomotionMode */
const setLocomotionMode = (newLocomotionMode) => {
  locomotionMode = newLocomotionMode;
  console.log({ locomotionMode });
};
const locomotionModeSelect = document.getElementById("locomotionMode");
const locomotionModeOptgroup = locomotionModeSelect.querySelector("optgroup");
locomotionModes.forEach((locomotionMode) => {
  locomotionModeOptgroup.appendChild(new Option(locomotionMode));
});
locomotionModeSelect.addEventListener("input", (event) => {
  setLocomotionMode(event.target.value);
});

/** @param {BS.CenterOfPressure} centerOfPressure */
const onCenterOfPressure = (centerOfPressure) => {
  //console.log("onCenterOfPressure", centerOfPressure);
  centerOfPressureInput.value = centerOfPressure;
  // FILL
};

/**
 * @param {BS.CenterOfPressure} centerOfPressure
 * @param {BS.Side} side
 */
const onSideCenterOfPressure = (centerOfPressure, side) => {
  //console.log("onSideCenterOfPressure", centerOfPressure, { side });
  centerOfPressureInputs[side].value = centerOfPressure;
  // FILL
};

devicePair.addEventListener("pressure", (event) => {
  const { normalizedCenter } = event.message.pressure;
  if (!normalizedCenter) {
    return;
  }
  onCenterOfPressure(normalizedCenter);
});
devicePair.addEventListener("devicePressure", (event) => {
  const { side, pressure } = event.message;
  const { normalizedCenter } = pressure;
  if (!normalizedCenter) {
    return;
  }
  onSideCenterOfPressure(normalizedCenter, side);
});
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

// THREE START
/** @type {import("three")} */
const THREE = window.THREE;
/** @typedef {import("three").Object3D} Object3D */
// THREE END

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
  localStorage.setItem(localStorageKey, urlString);
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
centerOfPressureInput.addEventListener("input", () => {
  onCenterOfPressure(centerOfPressureInput.value);
});
const leftCenterOfPressureInput = document.getElementById(
  "leftCenterOfPressureInput"
);
centerOfPressureInput.addEventListener("input", () => {
  onSideCenterOfPressure(leftCenterOfPressureInput.value, "left");
});
const rightCenterOfPressureInput = document.getElementById(
  "rightCenterOfPressureInput"
);
centerOfPressureInput.addEventListener("input", () => {
  onSideCenterOfPressure(rightCenterOfPressureInput.value, "right");
});
const centerOfPressureInputs = {
  left: leftCenterOfPressureInput,
  right: rightCenterOfPressureInput,
};
// CANVAS INPUT END

// GAMEPAD START
const gamepadScalar = 5;
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

window.addEventListener("gamepadtick", (event) => {
  if (!useGamepad) {
    return;
  }
  const { thumbsticks } = event.detail;
  const centerOfPressure = { x: 0, y: 0 };
  thumbsticks.forEach((thumbstick, index) => {
    const { x, y, angle, magnitude } = thumbstick;
    const side = index == 0 ? "left" : "right";
    // console.log({ side, x, y, magnitude, angle });
    const sideCenterOfPressure = {
      x: (x + 1) / 2,
      y: (y + 1) / 2,
    };
    onSideCenterOfPressure(sideCenterOfPressure, side);

    centerOfPressure.x += sideCenterOfPressure.x / 2;
    centerOfPressure.y += sideCenterOfPressure.y / 2;
  });
  onCenterOfPressure(centerOfPressure);
});
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
  }
});
// GAMEPAD END
