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
const getTempoColorIndex = () => 2;
const getGraphColorIndex = () => 3;
displayCanvasHelper.setColor(getTextColorIndex(), "white");
displayCanvasHelper.setColor(getTempoColorIndex(), "white");
displayCanvasHelper.setColor(getGraphColorIndex(), "red");
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

  {
    await displayCanvasHelper.setSegmentCap("round");

    await displayCanvasHelper.saveContext();
    await displayCanvasHelper.selectFillColor(getTempoColorIndex());
    await displayCanvasHelper.setSegmentRadius(3);
    await displayCanvasHelper.drawSegments(tempoPoints);
    await displayCanvasHelper.restoreContext();
  }

  // TODO - draw graph
  if (false) {
    await displayCanvasHelper.saveContext();
    await displayCanvasHelper.selectFillColor(getGraphColorIndex());
    await displayCanvasHelper.setSegmentRadius(2);
    await displayCanvasHelper.drawSegments(graphPoints);
    await displayCanvasHelper.restoreContext();
  }

  if (didCalibrate && isSensorDataEnabled) {
    let x = 0;
    let y = quaternionInterpolation;

    if (state == "set") {
      secondsSinceRepUpdate = getSecondsSinceRepUpdate();
      x = THREE.MathUtils.clamp(secondsSinceRepUpdate / tempoSum, 0, 1);
    }

    ({ x, y } = tempoCurveParams.transform({ x, y }));

    await displayCanvasHelper.saveContext();
    await displayCanvasHelper.selectFillColor(getGraphColorIndex());
    await displayCanvasHelper.drawCircle(x, y, 20);
    await displayCanvasHelper.restoreContext();
  }

  await displayCanvasHelper.selectSpriteColor(1, getTextColorIndex());
  await displayCanvasHelper.saveContext();
  await displayCanvasHelper.setHorizontalAlignment("start");
  await displayCanvasHelper.setVerticalAlignment("start");
  let string = "";
  switch (state) {
    case "idle":
      if (didCalibrate) {
        string = "ready";
      }
      break;
    case "calibrationCountDown":
      string = `${calibrationSecondsLeft}`;
      break;
    case "calibrating":
      string = "calibrating";
      break;
    case "setCountdown":
      string = `${setCountdownSecondsLeft}`;
      break;
    case "set":
      string = `${repIndex}/${numberOfReps}`;

      {
        const timeSinceRepUpdate = getTimeSinceRepUpdate();
        const seconds = (timeSinceRepUpdate / 1000).toFixed(2);
        string += `\n${seconds}`;
      }
      break;
  }
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
const requiredSensorTypes = ["gameRotation"];
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
let sensorRate = senseSensorRates[2];
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

  updateCalibrateRepButton();
  updateToggleSetButton();
};

// REPS

let numberOfReps = 1;
const numberOfRepsContainer = document.getElementById("numberOfReps");
const numberOfRepsInput = numberOfRepsContainer.querySelector("input");
const numberOfRepsSpan = numberOfRepsContainer.querySelector(".value");
numberOfRepsInput.addEventListener("input", () => {
  setNumberOfReps(Number(numberOfRepsInput.value));
});
const setNumberOfReps = (newNumberOfReps) => {
  numberOfReps = newNumberOfReps;
  console.log({ numberOfReps });
  numberOfRepsSpan.innerText = numberOfReps;
  numberOfRepsInput.value = numberOfReps;
  draw();
};
setNumberOfReps(12);

// TEMPO

const tempo = [0, 0, 0, 0];
let tempoSum = 0;
window.tempo = tempo;
/** @type {{span: HTMLSpanElement, input: HTMLInputElement}[]} */
const tempoContainers = [];
for (let tempoIndex = 0; tempoIndex < 4; tempoIndex++) {
  const tempoContainer = document.querySelector(`[data-tempo="${tempoIndex}"]`);
  const span = tempoContainer.querySelector(".value");
  const input = tempoContainer.querySelector("input");
  input.addEventListener("input", () => {
    const value = Number(input.value);
    setTempoValue(tempoIndex, value, true);
  });
  tempoContainers[tempoIndex] = { span, input };
}

const tempoPresetsSelect = document.getElementById("tempoPresets");
const tempoPresetsOptgroup = tempoPresetsSelect.querySelector("optgroup");
tempoPresetsSelect.addEventListener("input", () => {
  const value = tempoPresetsSelect.value;
  if (value) {
    const newTempo = value.split("-").map(Number);
    setTempo(newTempo);
  }

  tempoContainers.forEach(({ input }) => {
    input.disabled = Boolean(value);
  });
});

const setTempoValue = (index, value, shouldUpdateTempoPoints = true) => {
  tempo[index] = value;
  //console.log({ index, value }, tempo);
  tempoContainers[index].input.value = value;
  tempoContainers[index].span.innerText = value;

  if (shouldUpdateTempoPoints) {
    updateTempoPoints();
  }
};
const setTempo = (newTempo) => {
  console.log("setTempo", newTempo);
  tempo.forEach((_, index) => {
    setTempoValue(index, newTempo[index], false);
  });
  updateTempoPoints();
};

const tempoCurveParams = {
  size: {
    width: 600 - 100,
    height: 300 - 150,
  },
  offset: {
    x: 30,
    y: 400 - 150,
  },
  transform({ x, y }) {
    const { size, offset } = this;

    y *= -1;

    x *= size.width;
    y *= size.height;

    x += offset.x;
    y += offset.y;

    return { x, y };
  },
};
window.tempoCurveParams = tempoCurveParams;

/** @type {BS.Vector2[]} */
const tempoPoints = [];
const tempoYValues = [1, 1, 0, 0];
const updateTempoPoints = () => {
  tempoSum = tempo.reduce((sum, value) => sum + value, 0);
  console.log({ tempoSum });
  let tempoValue = 0;
  tempoPoints[0] = { x: 0, y: 0 };
  tempo.forEach((value, index) => {
    tempoValue += value;
    let x = tempoValue / tempoSum;
    let y = tempoYValues[index];

    tempoPoints[index + 1] = { x, y };
  });

  console.log("temp tempoPoints", ...tempoPoints);

  tempoPoints.forEach(({ x, y }, index) => {
    tempoPoints[index] = tempoCurveParams.transform({ x, y });
  });

  console.log("tempoPoints", ...tempoPoints);

  draw();
};
window.updateTempoPoints = updateTempoPoints;

setTempo([2, 1, 2, 1]);

// STATE

/** @typedef {"idle" | "calibrationCountDown" | "calibrating" | "setCountdown" | "set"} State */

/** @type {State} */
let state = "idle";
let latestStateUpdateTime = 0;
const timeSinceStateUpdate = () => Date.now() - latestStateUpdateTime;
/** @param {State} newState */
const setState = (newState) => {
  if (state == newState) {
    return;
  }
  latestStateUpdateTime = Date.now();
  clearCalibrationCountDown();

  state = newState;
  console.log({ state });

  switch (state) {
    case "idle":
      break;
    case "calibrationCountDown":
      countDownCalibration();
      break;
    case "calibrating":
      onCalibrationStart();
      break;
    case "setCountdown":
      countDownSet();
      break;
    case "set":
      onSetStart();
      break;
  }

  updateToggleSetButton();

  draw();
};

const toggleSetButton = document.getElementById("toggleSet");
toggleSetButton.addEventListener("click", () => {
  if (state == "set") {
    stopSet();
  } else {
    startSet();
  }
});
const updateToggleSetButton = () => {
  const enabled = isSensorDataEnabled && didCalibrate;
  toggleSetButton.disabled = !enabled;
  toggleSetButton.innerText = state == "set" ? "stop" : "start";
};
senseDevice.addEventListener("isConnected", () => {
  updateToggleSetButton();
});

let repIndex = 0;
let latestRepUpdateTime = 0;
const getTimeSinceRepUpdate = () => Date.now() - latestRepUpdateTime;
const getSecondsSinceRepUpdate = () => getTimeSinceRepUpdate() / 1000;
let secondsSinceRepUpdate = 0;
const setRepIndex = (newRepIndex) => {
  repIndex = newRepIndex;
  console.log({ repIndex });
  latestRepUpdateTime = Date.now();

  if (repIndex >= numberOfReps) {
    stopSet();
  }
};
const incrementRepIndex = () => setRepIndex(repIndex + 1);

const startSet = () => {
  console.log("startSet");
  setState("setCountdown");
};
const stopSet = () => {
  console.log("stopSet");
  setState("idle");
};

let countDownSetTimeoutId;
const clearSetCountDown = () => {
  if (countDownSetTimeoutId != undefined) {
    clearTimeout(countDownSetTimeoutId);
  }
  countDownSetTimeoutId = undefined;
};
let setCountdownSecondsLeft = 0;
const countDownSet = (secondsLeft = 3) => {
  console.log({ secondsLeft });
  setCountdownSecondsLeft = secondsLeft;
  draw();
  clearSetCountDown();
  countDownSetTimeoutId = setTimeout(() => {
    const newSecondsLeft = secondsLeft - 1;
    console.log({ newSecondsLeft });
    if (newSecondsLeft == 0) {
      setState("set");
    } else {
      countDownSet(newSecondsLeft);
    }
  }, 1000);
};

const onSetStart = () => {
  console.log("onSetStart");
  setRepIndex(0);
  updateToggleSetButton();
  setState("set");
};

// THREE

import * as three from "../utils/three/three.module.min.js";
/** @type {import("../utils/three/three.module.min")} */
const THREE = three;
window.THREE = THREE;

// CALIBRATION

const startQuaternion = new THREE.Quaternion();
const endQuaternion = new THREE.Quaternion();
let endQuaternionAngleToStart = 0;
const quaternion = new THREE.Quaternion();
let quaternionAngleToStart = 0;

let didCalibrate = false;

function quaternionInterpolationParameter(qStart, qEnd, q) {
  const qSE = qStart.clone().conjugate().multiply(qEnd); // rotation from start to end
  const qSC = qStart.clone().conjugate().multiply(q); // rotation from start to current

  // Convert to "log" (axis-angle representation)
  const logSE = new THREE.Vector3();
  const logSC = new THREE.Vector3();

  qToLog(qSE, logSE);
  qToLog(qSC, logSC);

  // Project SC onto SE to get t
  const t = logSE.dot(logSC) / logSE.lengthSq();
  return THREE.MathUtils.clamp(t, 0, 1);
}

function qToLog(q, outVec) {
  const angle = 2 * Math.acos(q.w);
  const s = Math.sqrt(1 - q.w * q.w);
  if (s < 1e-6) {
    outVec.set(q.x, q.y, q.z).multiplyScalar(2);
  } else {
    outVec.set(q.x / s, q.y / s, q.z / s).multiplyScalar(angle);
  }
}

function removeTwist(q, twistAxis) {
  const ra = new THREE.Vector3(q.x, q.y, q.z);
  const proj = twistAxis.clone().multiplyScalar(ra.dot(twistAxis)); // projection onto twist axis
  const twist = new THREE.Quaternion(proj.x, proj.y, proj.z, q.w).normalize();
  const swing = q.clone().multiply(twist.clone().invert()).normalize();
  return swing;
}

function curlProgress(
  qStart,
  qEnd,
  qCurrent,
  twistAxis = new THREE.Vector3(1, 0, 0)
) {
  const qs = removeTwist(qStart.clone().normalize(), twistAxis);
  const qe = removeTwist(qEnd.clone().normalize(), twistAxis);
  const qc = removeTwist(qCurrent.clone().normalize(), twistAxis);

  // Now compute t using your earlier angular ratio method
  const dotStartEnd = Math.abs(qs.dot(qe));
  const dotStartCurr = Math.abs(qs.dot(qc));

  const angleTotal = 2 * Math.acos(Math.min(1, Math.max(-1, dotStartEnd)));
  const angleCurrent = 2 * Math.acos(Math.min(1, Math.max(-1, dotStartCurr)));

  let t = angleTotal === 0 ? 0 : angleCurrent / angleTotal;
  return THREE.MathUtils.clamp(t, 0, 1);
}

let quaternionInterpolation = 0;
const updateQuaternionInterpolation = () => {
  if (true) {
    quaternionInterpolation = quaternionInterpolationParameter(
      startQuaternion,
      endQuaternion,
      quaternion
    );
  } else {
    quaternionInterpolation = THREE.MathUtils.clamp(
      quaternionAngleToStart / endQuaternionAngleToStart,
      0,
      1
    );
  }
  console.log({ quaternionInterpolation });
};

const finishCalibrationAngle = 20;
const finishCalibrationAngleRadians = THREE.MathUtils.degToRad(
  finishCalibrationAngle
);

let minCalibrationAngleThreshold = 0;
let minCalibrationAngleThresholdRadians = 0;
const minCalibrationAngleThresholdContainer = document.getElementById(
  "minCalibrationAngleThreshold"
);
const minCalibrationAngleThresholdInput =
  minCalibrationAngleThresholdContainer.querySelector("input");
const minCalibrationAngleThresholdSpan =
  minCalibrationAngleThresholdContainer.querySelector(".value");
minCalibrationAngleThresholdInput.addEventListener("input", () => {
  setMinCalibrationAngleThreshold(
    Number(minCalibrationAngleThresholdInput.value)
  );
});
const setMinCalibrationAngleThreshold = (newMinCalibrationAngleThreshold) => {
  minCalibrationAngleThreshold = newMinCalibrationAngleThreshold;
  minCalibrationAngleThresholdRadians = THREE.MathUtils.degToRad(
    minCalibrationAngleThreshold
  );
  console.log({
    minCalibrationAngleThreshold,
    minCalibrationAngleThresholdRadians,
  });
  minCalibrationAngleThresholdSpan.innerText = minCalibrationAngleThreshold;
  minCalibrationAngleThresholdInput.value = minCalibrationAngleThreshold;
  draw();
};
setMinCalibrationAngleThreshold(30);

const updateCalibration = () => {
  console.log({ quaternionAngleToStart, minCalibrationAngleThresholdRadians });

  if (
    quaternionAngleToStart > minCalibrationAngleThresholdRadians &&
    quaternionAngleToStart > endQuaternionAngleToStart
  ) {
    endQuaternionAngleToStart = quaternionAngleToStart;
    console.log(
      "updating endQuaternionAngleToStart",
      endQuaternionAngleToStart
    );
    endQuaternion.copy(quaternion);
  }

  didCalibrate =
    endQuaternionAngleToStart != 0 &&
    quaternionAngleToStart < finishCalibrationAngleRadians;
  if (didCalibrate) {
    endCalibration();
  }
};

/** @param {BS.Quaternion} _quaternion */
const onQuaternion = (_quaternion) => {
  quaternion.copy(_quaternion);
  quaternionAngleToStart = startQuaternion.angleTo(quaternion);

  switch (state) {
    case "idle":
      if (didCalibrate) {
        updateQuaternionInterpolation();
        draw();
      }
      break;
    case "calibrating":
      updateCalibration();
      break;
    case "set":
      updateQuaternionInterpolation();
      secondsSinceRepUpdate = getSecondsSinceRepUpdate();
      console.log({ secondsSinceRepUpdate });
      if (secondsSinceRepUpdate >= tempoSum && quaternionInterpolation < 0.1) {
        incrementRepIndex();
      }
      draw();
      break;
    case "setCountdown":
      updateQuaternionInterpolation();
      draw();
      break;
  }
};

senseDevice.addEventListener("gameRotation", (event) => {
  onQuaternion(event.message.gameRotation);
});
senseDevice.addEventListener("rotation", (event) => {
  onQuaternion(event.message.rotation);
});

const calibrateRepButton = document.getElementById("calibrateRep");
calibrateRepButton.addEventListener("click", () => {
  if (state == "calibrating") {
    endCalibration();
  } else {
    startCalibration();
  }
});

const updateCalibrateRepButton = () => {
  calibrateRepButton.disabled = !isSensorDataEnabled;
  calibrateRepButton.innerText =
    state == "calibrating" ? "stop calibration" : "calibrate rep";
};

const startCalibration = () => {
  console.log("startCalibration");
  setState("calibrationCountDown");
};
const endCalibration = () => {
  console.log("endCalibration");
  setState("idle");
  updateCalibrateRepButton();
};

let countDownCalibrationTimeoutId;
const clearCalibrationCountDown = () => {
  if (countDownCalibrationTimeoutId != undefined) {
    clearTimeout(countDownCalibrationTimeoutId);
  }
  countDownCalibrationTimeoutId = undefined;
};
let calibrationSecondsLeft = 0;
const countDownCalibration = (secondsLeft = 3) => {
  console.log({ secondsLeft });
  calibrationSecondsLeft = secondsLeft;
  draw();
  clearCalibrationCountDown();
  countDownCalibrationTimeoutId = setTimeout(() => {
    const newSecondsLeft = secondsLeft - 1;
    console.log({ newSecondsLeft });
    if (newSecondsLeft == 0) {
      setState("calibrating");
    } else {
      countDownCalibration(newSecondsLeft);
    }
  }, 1000);
};

const onCalibrationStart = () => {
  console.log("onCalibrationStart");
  didCalibrate = false;
  endQuaternionAngleToStart = 0;
  startQuaternion.copy(quaternion);
  updateCalibrateRepButton();
};

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
