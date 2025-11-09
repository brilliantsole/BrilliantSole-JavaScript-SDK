import * as BS from "../../build/brilliantsole.module.js";

// DEVICE
const device = new BS.Device();
window.device = device;
window.BS = BS;

// CONNECT
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () =>
  device.toggleConnection()
);
device.addEventListener("connectionStatus", (event) => {
  const { connectionStatus } = event.message;

  let disabled = false;
  let innerText = connectionStatus;
  switch (connectionStatus) {
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

// CANVAS
/** @type {HTMLCanvasElement} */
const displayCanvas = document.getElementById("display");

// DISPLAY CANVAS HELPER
const displayCanvasHelper = new BS.DisplayCanvasHelper();
// displayCanvasHelper.setBrightness("veryLow");
displayCanvasHelper.canvas = displayCanvas;
window.displayCanvasHelper = displayCanvasHelper;

device.addEventListener("connected", () => {
  if (device.isDisplayAvailable) {
    displayCanvasHelper.device = device;
  } else {
    console.error("device doesn't have a display");
    device.disconnect();
  }
});

// BRIGHTNESS
/** @type {HTMLSelectElement} */
const setDisplayBrightnessSelect = document.getElementById(
  "setDisplayBrightnessSelect"
);
/** @type {HTMLOptGroupElement} */
const setDisplayBrightnessSelectOptgroup =
  setDisplayBrightnessSelect.querySelector("optgroup");
BS.DisplayBrightnesses.forEach((displayBrightness) => {
  setDisplayBrightnessSelectOptgroup.appendChild(new Option(displayBrightness));
});
setDisplayBrightnessSelect.addEventListener("input", () => {
  displayCanvasHelper.setBrightness(setDisplayBrightnessSelect.value);
});

setDisplayBrightnessSelect.value = displayCanvasHelper.brightness;

// COLORS
/** @type {HTMLTemplateElement} */
const displayColorTemplate = document.getElementById("displayColorTemplate");
const displayColorsContainer = document.getElementById("displayColors");
const setDisplayColor = BS.ThrottleUtils.throttle(
  (colorIndex, colorString) => {
    console.log({ colorIndex, colorString });
    displayCanvasHelper.setColor(colorIndex, colorString, true);
  },
  100,
  true
);
/** @type {HTMLInputElement[]} */
const displayColorInputs = [];
const setupColors = () => {
  displayColorsContainer.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    const displayColorContainer = displayColorTemplate.content
      .cloneNode(true)
      .querySelector(".displayColor");

    const colorInput = displayColorContainer.querySelector(".color");
    displayColorInputs[colorIndex] = colorInput;
    colorInput.addEventListener("input", () => {
      setDisplayColor(colorIndex, colorInput.value);
    });

    displayColorsContainer.appendChild(displayColorContainer);
  }
};
displayCanvasHelper.addEventListener("numberOfColors", () => setupColors());
displayCanvasHelper.addEventListener("color", (event) => {
  const { colorHex, colorIndex } = event.message;
  displayColorInputs[colorIndex].value = colorHex;
});
setupColors();
const getTextColorIndex = () => 1;
const getGraphColorIndex = () => 2;
displayCanvasHelper.setColor(getTextColorIndex(), "white");
displayCanvasHelper.setColor(getGraphColorIndex(), "white");
displayCanvasHelper.flushContextCommands();

// DRAW
let isDrawing = false;
let isWaitingToRedraw = false;

let isUploading = false;
displayCanvasHelper.addEventListener("deviceSpriteSheetUploadStart", () => {
  isUploading = true;
});
displayCanvasHelper.addEventListener("deviceSpriteSheetUploadComplete", () => {
  isUploading = false;
});

const graphParams = {
  width: 640,
  height: 350,
  range: { min: 0, max: 0.1 },
  offset: {
    x: 0,
    y: 0,
  },
};
window.graphParams = graphParams;

const graphRangeMinContainer = document.getElementById("graphRangeMin");
const graphRangeMinSpan = graphRangeMinContainer.querySelector("span.value");
const graphRangeMinInput = graphRangeMinContainer.querySelector("input");
graphRangeMinInput.addEventListener("input", () => {
  setGraphRangeMin(Number(graphRangeMinInput.value));
});
const setGraphRangeMin = (min) => {
  graphParams.range.min = min;
  console.log({ min });
  graphRangeMinSpan.innerText = min;
  graphRangeMinInput.value = min;
};
setGraphRangeMin(graphParams.range.min);

const graphRangeMaxContainer = document.getElementById("graphRangeMax");
const graphRangeMaxSpan = graphRangeMaxContainer.querySelector("span.value");
const graphRangeMaxInput = graphRangeMaxContainer.querySelector("input");
graphRangeMaxInput.addEventListener("input", () => {
  setGraphRangeMax(Number(graphRangeMaxInput.value));
});
const setGraphRangeMax = (max) => {
  graphParams.range.max = max;
  console.log({ max });
  graphRangeMaxSpan.innerText = max;
  graphRangeMaxInput.value = max;
};
setGraphRangeMax(graphParams.range.max);

let didLoad = false;
const draw = async () => {
  if (isUploading) {
    return;
  }
  if (!didLoad) {
    console.log("hasn't loaded yet");
    return;
  }

  if (isDrawing) {
    //console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }
  isDrawing = true;

  console.log("drawing...");

  if (positions.length > 1) {
    await displayCanvasHelper.setSegmentCap("round");
    await displayCanvasHelper.selectFillColor(getGraphColorIndex());
    await displayCanvasHelper.setSegmentRadius(2);
    await displayCanvasHelper.saveContext();
    /** @type {BS.Vector2[]} */
    const points = [];
    const { range, width, height, offset } = graphParams;
    const { min, max } = range;
    const span = max - min;
    console.log({ width, height, min, max, span });
    positions.forEach((position, index) => {
      const interpolation = {
        x: index / maxPositionsLength,
        y: 1 - three.MathUtils.clamp((position[axis] - min) / span, 0, 1),
      };
      const point = {
        x: interpolation.x * width + offset.x,
        y:
          displayCanvasHelper.height -
          height +
          interpolation.y * height +
          offset.y,
      };
      points.push(point);
    });
    // console.log("points", points);
    await displayCanvasHelper.drawSegments(points);
    await displayCanvasHelper.restoreContext();
  }

  await displayCanvasHelper.setHorizontalAlignment("start");
  await displayCanvasHelper.setVerticalAlignment("start");
  await displayCanvasHelper.selectSpriteColor(1, getTextColorIndex());
  await displayCanvasHelper.saveContext();
  let string = trackingState + ` (${axis})`;
  if (airTime != undefined) {
    const seconds = Math.floor(airTime / 1000);
    const millis = airTime % 1000;
    string += `\n${seconds}.${millis.toString().padEnd(4, "0")}`;
  }
  console.log({ string });
  await displayCanvasHelper.drawSpritesString(0, 0, string);
  await displayCanvasHelper.restoreContext();

  await displayCanvasHelper.show();
};
window.draw = draw;

displayCanvasHelper.addEventListener("ready", () => {
  isDrawing = false;
  if (isWaitingToRedraw) {
    isWaitingToRedraw = false;
    draw();
  }
});

// PROGRESS
/** @type {HTMLProgressElement} */
const fileTransferProgress = document.getElementById("fileTransferProgress");

device.addEventListener("fileTransferProgress", (event) => {
  const progress = event.message.progress;
  //console.log({ progress });
  fileTransferProgress.value = progress == 1 ? 0 : progress;
});
device.addEventListener("fileTransferStatus", () => {
  if (device.fileTransferStatus == "ready") {
    fileTransferProgress.value = 0;
  }
});

// PASTE
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

window.addEventListener("paste", (event) => {
  const string = event.clipboardData.getData("text");
  // FILL
});
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log("item.type", item.type);
    // FILL
  }
});

// DRAGOVER
window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    console.log(file.type);
    // FILL
  }
});

// SENSE

const senseDevice = new BS.Device();
window.senseDevice = senseDevice;

// SENSE CONNECTION
const toggleSenseConnectionButton = document.getElementById(
  "toggleSenseConnection"
);
toggleSenseConnectionButton.addEventListener("click", () =>
  senseDevice.toggleConnection()
);
senseDevice.addEventListener("connectionStatus", (event) => {
  const { connectionStatus } = event.message;

  let disabled = false;
  let innerText = connectionStatus;
  switch (connectionStatus) {
    case "notConnected":
      innerText = "connect sense";
      break;
    case "connected":
      innerText = "disconnect sense";
      break;
  }
  toggleSenseConnectionButton.disabled = disabled;
  toggleSenseConnectionButton.innerText = innerText;
});

// SENSE SENSOR CONFIGURATION
/** @type {BS.SensorType[]} */
const requiredSensorTypes = ["linearAcceleration", "gameRotation"];
senseDevice.addEventListener("connected", () => {
  const hasAllSensorTypes = requiredSensorTypes.every((sensorType) =>
    senseDevice.sensorTypes.includes(sensorType)
  );
  if (!hasAllSensorTypes) {
    console.error(
      `senseDevice "${senseDevice.name}" doesn't have requiredSensorTypes`,
      requiredSensorTypes
    );
    senseDevice.disconnect();
  }
});

/** @type {HTMLSelectElement} */
const senseSensorRateSelect = document.getElementById("senseSensorRate");
const senseSensorRateOptgroup = senseSensorRateSelect.querySelector("optgroup");
const senseSensorRates = [5, 10, 20];
senseSensorRates.forEach((sensorRate) => {
  senseSensorRateOptgroup.appendChild(
    new Option(`${sensorRate}ms`, sensorRate)
  );
});
let sensorRate = senseSensorRates[1];
senseSensorRateSelect.addEventListener("input", () => {
  setSensorRate(Number(senseSensorRateSelect.value));
});
const setSensorRate = (newSensorRate) => {
  sensorRate = newSensorRate;
  console.log({ sensorRate });
  senseSensorRateSelect.value = sensorRate;

  if (senseDevice.isConnected && isSensorDataEnabled) {
    setSenseSensorData(true);
  }
};
setSensorRate(sensorRate);

/** @type {HTMLInputElement} */
const toggleSenseSensorDataInput = document.getElementById(
  "toggleSenseSensorData"
);
senseDevice.addEventListener("isConnected", () => {
  toggleSenseSensorDataInput.disabled = !senseDevice.isConnected;
  if (!senseDevice.isConnected) {
    toggleSenseSensorDataInput.checked = false;
  }
});
toggleSenseSensorDataInput.addEventListener("input", () => {
  toggleSenseSensorData();
});
const toggleSenseSensorData = () => {
  setSenseSensorData(!isSensorDataEnabled);
};
const setSenseSensorData = (enable) => {
  if (enable) {
    /** @type {BS.SensorConfiguration} */
    const newSensorConfiguration = {};
    requiredSensorTypes.forEach((sensorType) => {
      newSensorConfiguration[sensorType] = sensorRate;
    });
    console.log("newSensorConfiguration", newSensorConfiguration);
    senseDevice.setSensorConfiguration(newSensorConfiguration);
  } else {
    senseDevice.clearSensorConfiguration();
  }
};

let isSensorDataEnabled = false;
senseDevice.addEventListener("getSensorConfiguration", () => {
  const newIsSensorDataEnabled =
    senseDevice.sensorConfiguration[requiredSensorTypes[0]] > 0;
  setIsSensorDataEnabled(newIsSensorDataEnabled);
});
const setIsSensorDataEnabled = (newIsSensorDataEnabled) => {
  isSensorDataEnabled = newIsSensorDataEnabled;
  console.log({ isSensorDataEnabled });
  toggleSenseSensorDataInput.checked = isSensorDataEnabled;
};

import * as three from "../utils/three/three.module.min.js";
/** @type {import("../utils/three/three.module.min")} */
const THREE = three;
window.THREE = THREE;

// SENSE SENSOR DATA

const quaternion = new THREE.Quaternion();
const euler = new THREE.Euler();
euler.order = "YXZ";

const yawQuaternion = new THREE.Quaternion();
let latestPositionTimestamp = 0;
const linearAccelerationVector = new THREE.Vector3();
const linearAccelerationVelocity = new THREE.Vector3();
const linearAccelerationPosition = new THREE.Vector3();
const peakLinearAccelerationPosition = new THREE.Vector3();
const finalLinearAccelerationPosition = new THREE.Vector3();

const linearAccelerationTrackingThresholds = {
  ready: { min: 0.4, max: 6 },
  tracking: { min: 0.4, max: 3 },
  resetting: { min: 0.3, max: 3 },
};

window.linearAccelerationTrackingThresholds =
  linearAccelerationTrackingThresholds;
/** @typedef {"ready" | "tracking" | "resetting"} TrackingState */
/** @type {TrackingState} */
let trackingState = "ready";
let trackingStateStartTime = 0;
let airTime;
const getTrackingStateDuration = () => Date.now() - trackingStateStartTime;

/** @param {TrackingState} newTrackingState */
const setTrackingState = (newTrackingState) => {
  if (newTrackingState == trackingState) {
    return;
  }
  trackingStateStartTime = Date.now();

  trackingState = newTrackingState;
  console.log({ trackingState });

  switch (trackingState) {
    case "ready":
      break;
    case "tracking":
      positions.length = 0;
      linearAccelerationVelocity.setScalar(0);
      linearAccelerationPosition.setScalar(0);
      peakLinearAccelerationPosition.setScalar(0);
      break;
    case "resetting":
      finalLinearAccelerationPosition
        .copy(linearAccelerationPosition)
        .multiplyScalar(9.8);
      console.log(
        "finalLinearAccelerationPosition",
        finalLinearAccelerationPosition
      );
      peakLinearAccelerationPosition.multiplyScalar(9.8);
      console.log(
        "peakLinearAccelerationPosition",
        peakLinearAccelerationPosition
      );
      break;
  }
  draw();
};

/** @typedef {"below" | "middle" | "above"} ThresholdState */
/** @type {ThresholdState} */
let thresholdState = "below";
let thresholdStateStartTime = 0;
const getThresholdStateDuration = () => Date.now() - thresholdStateStartTime;

/**
 * @param {ThresholdState} newThresholdState
 * @param {number} length
 */
const setThresholdState = (newThresholdState, length) => {
  if (newThresholdState != thresholdState) {
    thresholdStateStartTime = Date.now();
    console.log({ thresholdState: newThresholdState, length });
  }
  thresholdState = newThresholdState;

  const thresholdDuration = getThresholdStateDuration();
  const stateDuration = getTrackingStateDuration();

  switch (trackingState) {
    case "ready":
      if (thresholdState != "below") {
        setTrackingState("tracking");
      }
      break;
    case "tracking":
      if (
        (thresholdState == "below" && thresholdDuration > 200) ||
        (thresholdState == "above" && stateDuration > 300)
      ) {
        setTrackingState("resetting");
      }
      break;
    case "resetting":
      if (thresholdState == "below" && thresholdDuration > 500) {
        setTrackingState("ready");
      }
      break;
  }

  if (trackingState == "tracking") {
    airTime = getTrackingStateDuration();
  }
};

let shouldResetLinearAccelerationPosition = false;
window.resetLinearAccelerationPosition = () => {
  console.log("resetLinearAccelerationPosition");
  shouldResetLinearAccelerationPosition = true;
};

let shouldResetQuaternionYaw = false;
window.resetQuaternionYaw = () => {
  console.log("shouldResetQuaternionYaw");
  shouldResetQuaternionYaw = true;
};

/** @param {BS.Quaternion} _quaternion */
const onQuaternion = (_quaternion) => {
  quaternion.copy(_quaternion);
  euler.setFromQuaternion(quaternion);

  if (shouldResetQuaternionYaw) {
    shouldResetQuaternionYaw = false;
    euler.x = euler.z = 0;
    yawQuaternion.setFromEuler(euler).invert();
  }
  quaternion.copy(quaternion).multiply(yawQuaternion);
};
senseDevice.addEventListener("gameRotation", (event) => {
  onQuaternion(event.message.gameRotation);
});
senseDevice.addEventListener("rotation", (event) => {
  onQuaternion(event.message.rotation);
});

const resetYawButton = document.getElementById("resetYaw");
resetYawButton.addEventListener("click", () => {
  resetQuaternionYaw();
});
senseDevice.addEventListener("isConnected", () => {
  resetYawButton.disabled = !senseDevice.isConnected;
});

let maxPositionsLength = 100;
/** @type {three.Vector3[]} */
const positions = [];
/** @param {three.Vector3} newPosition */
const addPosition = (newPosition) => {
  positions.push(newPosition);
  while (positions.length > maxPositionsLength) {
    positions.shift();
  }
  draw();
};

const maxPositionsLengthContainer =
  document.getElementById("maxPositionsLength");
const maxPositionsLengthSpan =
  maxPositionsLengthContainer.querySelector("span.value");
const maxPositionsLengthInput =
  maxPositionsLengthContainer.querySelector("input");
maxPositionsLengthInput.addEventListener("input", () => {
  setMaxPositionsLength(Number(maxPositionsLengthInput.value));
});
const setMaxPositionsLength = (newMaxPositionsLength) => {
  maxPositionsLength = newMaxPositionsLength;
  console.log({ maxPositionsLength });
  maxPositionsLengthSpan.innerText = maxPositionsLength;
  maxPositionsLengthInput.value = maxPositionsLength;
};
setMaxPositionsLength(maxPositionsLength);

/** @typedef {"x" | "y" | "z"} Axis */
/** @type {Axis} */
let axis = "y";
const axisContainer = document.getElementById("axis");
const axisSelect = axisContainer.querySelector("select");
axisSelect.addEventListener("input", () => {
  setAxis(axisSelect.value);
});
const setAxis = (newAxis) => {
  axis = newAxis;
  console.log({ axis });
  axisSelect.value = axis;
};
setAxis(axis);

senseDevice.addEventListener("linearAcceleration", (event) => {
  let { timestamp, linearAcceleration } = event.message;

  if (shouldResetLinearAccelerationPosition) {
    shouldResetLinearAccelerationPosition = false;
    linearAccelerationVector.setScalar(0);
    linearAccelerationVelocity.setScalar(0);
    linearAccelerationPosition.setScalar(0);
    peakLinearAccelerationPosition.setScalar(0);
  }

  linearAccelerationVector.copy(linearAcceleration);
  linearAccelerationVector.applyQuaternion(quaternion);

  //console.log("linearAccelerationVector", linearAccelerationVector);

  const timestampDifference =
    latestPositionTimestamp == 0
      ? device.sensorConfiguration.linearAcceleration
      : timestamp - latestPositionTimestamp;
  latestPositionTimestamp = timestamp;
  const timestampDifferenceScalar = timestampDifference / 1000;

  const linearAccelerationLength = linearAccelerationVector.length();
  const { min, max } = linearAccelerationTrackingThresholds[trackingState];
  const belowMin = linearAccelerationLength < min;
  const aboveMax = linearAccelerationLength > max;
  setThresholdState(
    belowMin ? "below" : aboveMax ? "above" : "middle",
    linearAccelerationLength
  );

  if (trackingState == "tracking") {
    linearAccelerationVelocity.addScaledVector(
      linearAccelerationVector,
      timestampDifferenceScalar
    );
    linearAccelerationPosition.addScaledVector(
      linearAccelerationVelocity,
      timestampDifferenceScalar
    );

    peakLinearAccelerationPosition.x = Math.max(
      peakLinearAccelerationPosition.x,
      linearAccelerationPosition.x
    );
    peakLinearAccelerationPosition.y = Math.max(
      peakLinearAccelerationPosition.y,
      linearAccelerationPosition.y
    );
    peakLinearAccelerationPosition.z = Math.max(
      peakLinearAccelerationPosition.z,
      linearAccelerationPosition.z
    );

    addPosition(linearAccelerationPosition.clone());
  }
});

// FONT

/** @type {HTMLInputElement} */
const loadFontInput = document.getElementById("loadFont");
loadFontInput.addEventListener("input", async () => {
  for (let i = 0; i < loadFontInput.files.length; i++) {
    const file = loadFontInput.files[i];
    if (!file) {
      continue;
    }
    const arrayBuffer = await file.arrayBuffer();
    await loadFont(arrayBuffer);
  }
  loadFontInput.value = "";
});

let fontScale = 1;
const fontScaleContainer = document.getElementById("fontScale");
const fontScaleInput = fontScaleContainer.querySelector("input");
const fontScaleSpan = fontScaleContainer.querySelector(".value");
fontScaleInput.addEventListener("input", () => {
  setFontScale(Number(fontScaleInput.value));
});
const setFontScale = (newFontScale) => {
  fontScale = newFontScale;
  console.log({ fontScale });
  fontScaleSpan.innerText = fontScale;
  fontScaleInput.value = fontScale;
  draw();
};
setFontScale(1);

const loadFont = async (arrayBuffer) => {
  if (!arrayBuffer) {
    return;
  }
  const font = await BS.parseFont(arrayBuffer);
  if (font) {
    await addFont(font);
  }
};

const validFontExtensions = loadFontInput.accept.split(",");
function isGoogleFontsUrl(string) {
  try {
    const url = new URL(string);
    return (
      url.hostname === "fonts.googleapis.com" &&
      (url.pathname.startsWith("/css") || url.pathname.startsWith("/css2"))
    );
  } catch {
    return false;
  }
}
async function getGoogleFontUrls(cssUrl, isEnglish = true) {
  const filterFn = isEnglish ? (r) => /U\+0000-00FF/i.test(r) : undefined;

  const res = await fetch(cssUrl);
  if (!res.ok) throw new Error(`Failed to fetch CSS: ${res.status}`);
  const cssText = await res.text();

  // Capture url and unicode-range
  const regex = /src:\s*url\(([^)]+\.woff2)\)[^}]*unicode-range:\s*([^;]+);/gi;
  const results = [];
  let match;

  while ((match = regex.exec(cssText)) !== null) {
    const url = match[1].replace(/["']/g, "");
    const range = match[2].trim();

    if (!filterFn || filterFn(range)) {
      results.push(url);
    }
  }

  return [...new Set(results)];
}
const loadFontUrl = async (string, isEnglish = true) => {
  if (!isValidUrl(string)) {
    return;
  }

  if (isGoogleFontsUrl(string)) {
    const googleFontUrls = await getGoogleFontUrls(string, isEnglish);
    for (const index in googleFontUrls) {
      const response = await fetch(googleFontUrls[index]);
      const arrayBuffer = await response.arrayBuffer();
      await loadFont(arrayBuffer);
    }
  } else {
    if (validFontExtensions.every((extension) => !string.endsWith(extension))) {
      return;
    }
    const response = await fetch(string);
    const arrayBuffer = await response.arrayBuffer();
    await loadFont(arrayBuffer);
  }
};
window.addEventListener("paste", (event) => {
  const string = event.clipboardData.getData("text");
  loadFontUrl(string);
});
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log("item.type", item.type);
    if (item.type.startsWith("font/")) {
      const file = item.getAsFile();
      const arrayBuffer = await file.arrayBuffer();
      await loadFont(arrayBuffer);
    }
  }
});

window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    console.log(file.type);
    if (
      file.type.startsWith("font/") ||
      file.type.includes("font") ||
      file.name.endsWith("woff2")
    ) {
      const arrayBuffer = await file.arrayBuffer();
      await loadFont(arrayBuffer);
    }
  }
});

/** @type {Record<string, BS.Font[]>} */
const fonts = {};
window.fonts = fonts;
const fontSize = 36;
/** @type {Record<string, BS.DisplaySpriteSheet>} */
const fontSpriteSheets = {};
window.fonts = fonts;
let fontMetrics;
/** @type {BS.FontToSpriteSheetOptions} */
const fontOptions = {
  usePath: true,
  englishOnly: true,
};
/** @param {BS.Font} font */
const addFont = async (font) => {
  const range = BS.getFontUnicodeRange(font);
  if (!range) {
    return;
  }
  const isEnglish = range.min <= 65 && range.max >= 122;

  const fullName = font.getEnglishName("fullName");
  fonts[fullName] = fonts[fullName] || [];
  if (isEnglish) {
    fonts[fullName].unshift(font);
  } else {
    fonts[fullName].push(font);
  }

  console.log(`added font "${fullName}"`);

  if (isEnglish) {
    const spriteSheet = await BS.fontToSpriteSheet(
      font,
      fontSize,
      "english",
      fontOptions
    );
    fontSpriteSheets[fullName] = spriteSheet;
    await updateFontSelect();
    await selectFont(fullName);
  }
};

/** @type {HTMLSelectElement} */
const selectFontSelect = document.getElementById("selectFont");
const selectFontOptgroup = selectFontSelect.querySelector("optgroup");
const updateFontSelect = async () => {
  selectFontOptgroup.innerHTML = "";
  for (const fullName in fonts) {
    selectFontOptgroup.appendChild(new Option(fullName));
  }
};

selectFontSelect.addEventListener("input", async () => {
  const fontName = selectFontSelect.value;
  await selectFont(fontName);
});

/** @type {BS.Font?} */
let selectedFont;
let spritesLineHeight = 0;
/** @type {MediaRecorder} */
let mediaRecorder;
const selectFont = async (newFontName) => {
  let wasTranscribing = Boolean(mediaRecorder);
  if (wasTranscribing) {
    await stopTranscribing();
  }

  const newFont = fonts[newFontName][0];
  selectedFont = newFont;

  if (didLoad) {
    console.log(`selected font "${newFontName}"`, selectedFont);
    //console.log(`selected fonts`, selectedFonts);
  }
  selectFontSelect.value = newFontName;
  const spriteSheet = fontSpriteSheets[newFontName];
  fontMetrics = BS.getFontMetrics(selectedFont, fontSize, fontOptions);
  spritesLineHeight = BS.getFontMaxHeight(selectedFont, fontSize);
  await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
  await displayCanvasHelper.setSpritesLineHeight(spritesLineHeight);
  await draw();
};

await loadFontUrl("https://fonts.googleapis.com/css2?family=Noto+Sans");

// DID LOAD
didLoad = true;
draw();
