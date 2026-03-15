import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

// UTILS START
import { setupLocalStorage } from "../utils/misc/localStorage.js";
import { setupIndexedDB } from "../utils/misc/indexedDB.js";
// UTILS END

// DEVICE PAIR START
/** @type {HTMLButtonElement} */
const addDeviceButton = document.getElementById("addDevice");
addDeviceButton.addEventListener("click", () => {
  BS.Device.Connect();
});

const devicePair = BS.DevicePair.insoles;
devicePair.addEventListener("isConnected", () => {
  addDeviceButton.disabled = devicePair.isConnected;
});

let isPressureDataEnabled = false;
let pressureSensorRate = 20;
const togglePressure = async () => {
  if (!devicePair.isConnected) {
    return;
  }
  isPressureDataEnabled = !isPressureDataEnabled;
  updateTogglePressureDataButton();
  devicePair.setSensorConfiguration({
    pressure: isPressureDataEnabled ? pressureSensorRate : 0,
  });
};

const toggleDevicePairPressureDataButton = document.getElementById(
  "toggleDevicePairPressureData"
);
toggleDevicePairPressureDataButton.addEventListener("click", () => {
  togglePressure();
});
const updateTogglePressureDataButton = () => {
  toggleDevicePairPressureDataButton.disabled = !devicePair.isConnected;
  toggleDevicePairPressureDataButton.innerText = isPressureDataEnabled
    ? "disable pressure"
    : "enable pressure";
};
devicePair.addEventListener("isConnected", () => {
  updateTogglePressureDataButton();
});

/** @type {HTMLPreElement} */
const devicePairPressurePre = document.getElementById("devicePairPressure");
devicePair.addEventListener("pressure", (event) => {
  const { sensors } = event.message.pressure;
  const devicePairPressureData = {};
  for (const [side, _sensors] of Object.entries(sensors)) {
    devicePairPressureData[side] = _sensors.map((sensor) => sensor.rawValue);
  }

  devicePairPressurePre.textContent = JSON.stringify(
    devicePairPressureData,
    (key, value) => {
      if (Array.isArray(value)) {
        return value.map((value) => value.toFixed(2)).join(", ");
      }
      return value;
    },
    2
  );
});
// DEVICE PAIR END

// CENTER OF PRESSURE START
/** @type {HTMLInputElement} */
const centerOfPressureInput = document.getElementById("centerOfPressure");
window.addEventListener("load", () => {
  wiiBalanceBoard.onWeights((event) => {
    const weightData = event.detail;
    centerOfPressureInput.value = weightData.centerOfPressure;
  });
});
// CENTER OF PRESSURE END

// DATA COLLECTION START
/** @typedef {Record<BS.Side, BS.PressureSensorValue>} PairPressureData */
/** @typedef {{pressureData: PairPressureData, position: BS.Vector2}} PairPressureDataMap */

/** @type {PairPressureDataMap[]} */
let pairPressureDataMaps = [];

const maxPairPressureDataMapsLength = 10000;
/**
 * @param {PairPressureData} pressureData
 * @param {BS.Vector2} position
 */
const addPairPressureDataMap = (pressureData, position) => {
  pairPressureDataMaps.push({ pressureData, position });
  while (pairPressureDataMaps.length > maxPairPressureDataMapsLength) {
    pairPressureDataMaps.shift();
  }
  console.log(
    "addPairPressureData",
    pressureData,
    position,
    pairPressureDataMaps.length
  );
  didPairPressureDataMapsUpdate = true;
  updateClearPressureDataButton();
  updateDownloadPressureDataButton();
};
devicePair.addEventListener("pressure", (event) => {
  if (!isRecordingPressureData) {
    return;
  }
  const { sensors } = event.message.pressure;
  addPairPressureDataMap(sensors, centerOfPressureInput.value);
});

let isRecordingPressureData = false;
const toggleRecordPressureData = () => {
  isRecordingPressureData = !isRecordingPressureData;
  console.log({ isRecordingPressureData });
  updateToggleRecordPressureDataButton();
};
const toggleRecordPressureDataButton = document.getElementById(
  "toggleRecordPressureData"
);
toggleRecordPressureDataButton.addEventListener("click", () => {
  toggleRecordPressureData();
});
const updateToggleRecordPressureDataButton = () => {
  const enabled = devicePair.isConnected && isPressureDataEnabled;
  toggleRecordPressureDataButton.disabled = !enabled;
};
devicePair.addEventListener("isConnected", () => {
  updateToggleRecordPressureDataButton();
});
devicePair.addEventListener("deviceGetSensorConfiguration", () => {
  updateToggleRecordPressureDataButton();
});

const clearPressureDataButton = document.getElementById("clearPressureData");
const updateClearPressureDataButton = () => {
  const enabled = pairPressureDataMaps.length > 0;
  clearPressureDataButton.disabled = !enabled;
};
clearPressureDataButton.addEventListener("click", () => {
  clearPressureData();
});
const downloadPressureDataButton = document.getElementById(
  "downloadPressureData"
);
const updateDownloadPressureDataButton = () => {
  const enabled = pairPressureDataMaps.length > 0;
  downloadPressureDataButton.disabled = !enabled;
};
downloadPressureDataButton.addEventListener("click", () => {
  downloadPressureData();
});

const uploadPressureDataButton = document.getElementById("uploadPressureData");

const uploadPressureDataInput = document.createElement("input");
uploadPressureDataInput.type = "file";
uploadPressureDataInput.accept = "application/json";
uploadPressureDataInput.multiple = true;
uploadPressureDataInput.addEventListener("input", async (event) => {
  for (const file of event.target.files) {
    await uploadPressureData(file);
  }
  uploadPressureDataInput.value = "";
});

uploadPressureDataButton.addEventListener("click", () => {
  uploadPressureDataInput.click();
});

let didPairPressureDataMapsUpdate = false;
const {
  clear: clearPressureData,
  upload: uploadPressureData,
  download: downloadPressureData,
} = setupIndexedDB(
  "pressure.calibration",
  () => pairPressureDataMaps,
  (newPairPressureDataMaps) => {
    pairPressureDataMaps = newPairPressureDataMaps ?? [];
    console.log("pairPressureDataMaps", pairPressureDataMaps);
    updateClearPressureDataButton();
    updateDownloadPressureDataButton();
  },
  () => didPairPressureDataMapsUpdate
);
// DATA COLLECTION END

// PAIR PRESSURE VISUALIZATION START
/** @type {Record<BS.Side, {canvas: HTMLCanvasElement, context: CanvasRenderingContext2D}>} */
const pairPressureVisualizationCanvases = {};
BS.Sides.forEach((side) => {
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector(`canvas.${side}`);
  const context = canvas.getContext("2d");
  pairPressureVisualizationCanvases[side] = { canvas, context };
});

/** @param {BS.Side} side */
const drawPairPressureVisualization = (side) => {
  const { canvas, context } = pairPressureVisualizationCanvases[side];
  context.clearRect(0, 0, canvas.width, canvas.height);
  // FILL - draw circles at centers
};
devicePair.addEventListener("devicePressure", (event) => {
  drawPairPressureVisualization(event.message.side);
});
const drawPairPressureVisualizations = () => {
  BS.Sides.forEach((side) => {
    drawPairPressureVisualization(side);
  });
};
// PAIR PRESSURE VISUALIZATION END

// WII BALANCE BOARD START
import WiiBalanceBoard from "../utils/wiibalanceboard/wiibalanceboard.js";

const wiiBalanceBoard = new WiiBalanceBoard();
window.wiiBalanceBoard = wiiBalanceBoard;

const toggleWiiBalanceBoardConnectionButton = document.getElementById(
  "toggleWiiBalanceBoardConnection"
);
toggleWiiBalanceBoardConnectionButton.addEventListener("click", () => {
  wiiBalanceBoard.toggleConnection();
});
wiiBalanceBoard.onConnectionStatus((event) => {
  const { connectionStatus } = event.detail;
  let innerText = connectionStatus;
  switch (connectionStatus) {
    case "not connected":
      innerText = "connect to board";
      break;
    case "connected":
      innerText = "disconnect from board";
      break;
    case "connecting":
      innerText = "connecting to board";
      break;
    case "disconnecting":
      innerText = "disconnecting from board";
      break;
  }
  toggleWiiBalanceBoardConnectionButton.innerText = innerText;
});

const tareWiiBalanceBoardButton = document.getElementById(
  "tareWiiBalanceBoard"
);
tareWiiBalanceBoardButton.addEventListener("click", () => {
  wiiBalanceBoard.tareWeight();
});

/** @type {HTMLPreElement} */
const wiiBalanceBoardWeightsPre = document.getElementById(
  "wiiBalanceBoardWeights"
);
wiiBalanceBoard.onWeights((event) => {
  const weightData = event.detail;
  wiiBalanceBoardWeightsPre.textContent = JSON.stringify(weightData, null, 2);
});

/** @type {HTMLCanvasElement} */
const wiiBalanceBoardVisualizationCanvas = document.querySelector(
  "canvas.wiiBalanceBoard"
);
const wiiBalanceBoardVisualizationContext =
  wiiBalanceBoardVisualizationCanvas.getContext("2d");
/** @param {import("./WiiBalanceBoard.js").WeightData} weightData */
const drawWiiBalanceBoardVisualization = (weightData) => {
  const canvas = wiiBalanceBoardVisualizationCanvas;
  const context = wiiBalanceBoardVisualizationContext;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "red";
  context.beginPath();
  let { x, y } = weightData.centerOfPressure;
  x = (x + 1) / 2;
  y = (y + 1) / 2;
  context.arc(x * canvas.width, (1 - y) * canvas.height, 10, 0, Math.PI * 2);
  context.fill();
};
wiiBalanceBoard.onWeights((event) => {
  const weightData = event.detail;
  drawWiiBalanceBoardVisualization(weightData);
});
// WII BALANCE BOARD END
