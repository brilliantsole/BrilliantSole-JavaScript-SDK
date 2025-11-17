let didLoad = false;

import * as BS from "../../build/brilliantsole.module.js";

import * as three from "../utils/three/three.module.min.js";
/** @type {import("../utils/three/three.module.min")} */
const THREE = three;
window.THREE = THREE;

// DEVICE
const device = new BS.Device();
window.device = device;
window.BS = BS;

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
const getGraphIndex1 = () => 2;
const getGraphIndex2 = () => 3;
const getGraphIndex3 = () => 4;
displayCanvasHelper.setColor(getTextColorIndex(), "white");
displayCanvasHelper.setColor(getGraphIndex1(), "red");
displayCanvasHelper.setColor(getGraphIndex2(), "limegreen");
displayCanvasHelper.setColor(getGraphIndex3(), "aqua");
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

/** @type {GraphType[]} */
const graphTypes = [
  "pressure",
  "gyroscope",
  "linearAcceleration",
  "orientation",
  "magnetometer",
];
/** @type {Record<GraphType, BS.ContinuousSensorType[]>} */
const graphSensorTypes = {
  pressure: ["pressure"],
  linearAcceleration: ["linearAcceleration", "gameRotation"],
  gyroscope: ["gyroscope", "gameRotation"],
  magnetometer: ["magnetometer", "gameRotation"],
  orientation: ["gameRotation"],
};

/** @typedef {BS.ContinuousSensorType | "pressureMetadata" | "gameRotationEuler" | "rotationEuler" | "linearAccelerationCorrected" | "gyroscopeCorrected" | "magnetometerCorrected"} GraphType */
/** @type {GraphType[]} */
const allGraphTypes = [
  "pressure",
  "linearAcceleration",
  "gyroscope",
  "magnetometer",
  "gameRotation",
  "rotation",
];

/** @type {Record<GraphType, {min: number, max: number}>} */
const graphRanges = {
  pressure: { min: 0, max: 1 },
  acceleration: { min: -2, max: 2 },
  gravity: { min: -1, max: 1 },
  linearAcceleration: { min: -4, max: 4 },
  gyroscope: { min: -360, max: 360 },
  magnetometer: { min: -100, max: 100 },
  gameRotation: { min: -1, max: 1 },
  rotation: { min: -1, max: 1 },
  orientation: { min: -360, max: 360 },

  gameRotationEuler: { min: -Math.PI, max: Math.PI },
  rotationEuler: { min: -Math.PI, max: Math.PI },

  linearAccelerationCorrected: { min: -2, max: 2 },
  gyroscopeCorrected: { min: -360, max: 360 },
  magnetometerCorrected: { min: -100, max: 100 },

  pressureMetadata: { min: 0, max: 1 },
};

/** @type {Record<GraphType, string[]>} */
const sensorLabels = {
  pressure: [],
  acceleration: ["x", "y", "z"],
  gravity: ["x", "y", "z"],
  linearAcceleration: ["x", "y", "z"],
  gyroscope: ["x", "y", "z"],
  magnetometer: ["x", "y", "z"],
  gameRotation: ["x", "y", "z", "w"],
  rotation: ["x", "y", "z", "w"],
  orientation: ["heading", "pitch", "roll"],

  gameRotationEuler: ["yaw", "pitch", "roll"],
  rotationEuler: ["yaw", "pitch", "roll"],

  linearAccelerationCorrected: ["x", "y", "z"],
  gyroscopeCorrected: ["x", "y", "z"],
  magnetometerCorrected: ["x", "y", "z"],

  pressureMetadata: ["sum", "x", "y"],
};

const rangeHelper = new BS.RangeHelper();

/** @type {GraphType} */
let graphType = "linearAcceleration";

const graphTypeSelect = document.getElementById("graphType");
const graphTypeOptgroup = graphTypeSelect.querySelector("optgroup");
graphTypes.forEach((graphType) => {
  graphTypeOptgroup.appendChild(new Option(graphType));
});
graphTypeSelect.addEventListener("input", () => {
  selectGraphType(graphTypeSelect.value);
});
const selectGraphType = async (newGraphType) => {
  graphType = newGraphType;
  graphTypeSelect.value = graphType;
  console.log({ graphType });
  let range = graphRanges[graphType];
  if (graphType == "orientation") {
    range = graphRanges["gameRotationEuler"];
  }
  rangeHelper.min = range.min;
  rangeHelper.max = range.max;

  if (!didLoad) {
    return;
  }

  const newSensorTypes = graphSensorTypes[graphType];

  /** @type {BS.SensorConfiguration} */
  const newSensorConfiguration = {};
  newSensorTypes.forEach((sensorType) => {
    newSensorConfiguration[sensorType] = 40;
  });
  console.log("newSensorConfiguration", newSensorConfiguration);
  for (let deviceId in senseGraphData) {
    const { device, sensorTypes } = senseGraphData[deviceId];
    sensorTypes.length = 0;
    sensorTypes.push(...newSensorTypes);
    await device.setSensorConfiguration(newSensorConfiguration, true);
  }
};
selectGraphType(graphType);

const drawGraphParams = {
  size: {
    width: 200,
    height: 100,
  },
  offset: {
    x: 0,
    y: 0,
  },
};
window.drawGraphParams = drawGraphParams;
/**
 * @param {number} x
 * @param {number} y
 * @param {SenseGraphData} senseGraphData
 */
const drawGraph = async (x, y, senseGraphData) => {
  //console.log("drawGraph", { x, y }, senseGraphData);
  const { graphData, sensorTypes, numberOfSamples } = senseGraphData;

  // await displayCanvasHelper.setFillBackground(true);
  // await displayCanvasHelper.selectBackgroundColor(1);

  await displayCanvasHelper.selectSpriteColors([
    { spriteColorIndex: 1, colorIndex: getGraphIndex1() },
    { spriteColorIndex: 2, colorIndex: getGraphIndex2() },
    { spriteColorIndex: 3, colorIndex: getGraphIndex3() },
  ]);
  await displayCanvasHelper.setHorizontalAlignment("start");
  await displayCanvasHelper.setVerticalAlignment("start");
  const { size } = drawGraphParams;
  await displayCanvasHelper.startSprite(x, y, size.width, size.height);

  let _sensorLabels = sensorLabels[graphType];

  /** @type {GraphData} */
  let _graphData;
  switch (graphType) {
    case "pressure":
      _graphData = graphData["pressureMetadata"];
      _sensorLabels = sensorLabels["pressureMetadata"];
      break;
    case "linearAcceleration":
      _graphData = graphData["linearAccelerationCorrected"];
      break;
    case "gyroscope":
      _graphData = graphData["gyroscopeCorrected"];
      break;
    case "magnetometer":
      _graphData = graphData["magnetometerCorrected"];
      break;
    case "orientation":
      _graphData =
        graphData[
          sensorTypes.includes("gameRotation")
            ? "gameRotationEuler"
            : "rotationEuler"
        ];
      _sensorLabels =
        sensorLabels[
          sensorTypes.includes("gameRotation")
            ? "gameRotationEuler"
            : "rotationEuler"
        ];
      break;
  }

  //console.log("_graphData", _graphData);
  if (_graphData) {
    if (_graphData.length > 1) {
      await displayCanvasHelper.setVerticalAlignment("end");
      await displayCanvasHelper.setHorizontalAlignment("start");
      await displayCanvasHelper.setSpritesLineHeight(spritesLineHeight);
      await displayCanvasHelper.setSpriteScale(fontScale);

      let labelOffset = { x: 0, y: size.height / 2 };

      if (graphType != "pressure") {
        const metrics = displayCanvasHelper.stringToSpriteLinesMetrics(
          graphType == "pressure" ? "sum" : _sensorLabels.join("")
        );
        await displayCanvasHelper.selectFillColor(0);
        await displayCanvasHelper.drawRect(
          -size.width / 2,
          labelOffset.y,
          metrics.size.width,
          metrics.size.height * 0.8
        );
      }

      for (let labelIndex in _sensorLabels) {
        labelIndex = Number(labelIndex);
        const label = _sensorLabels[labelIndex];

        if (graphType == "pressure") {
          continue;
        }

        await displayCanvasHelper.selectSpriteColor(1, labelIndex + 1);
        let x = 0;
        let y = 0;

        x -= size.width / 2;

        x += labelOffset.x;
        y += labelOffset.y;

        const metrics = displayCanvasHelper.stringToSpriteLinesMetrics(label);
        labelOffset.x += metrics.size.width;

        await displayCanvasHelper.drawSpritesString(x, y, label);
      }
      await displayCanvasHelper.selectSpriteColor(1, 1); // reset

      await displayCanvasHelper.setSegmentCap("round");
      await displayCanvasHelper.setSegmentRadius(2);

      for (let labelIndex in _sensorLabels) {
        labelIndex = Number(labelIndex);
        const label = _sensorLabels[labelIndex];

        if (graphType == "pressure" && label != "sum") {
          continue;
        }

        //console.log({ label, labelIndex, labelIndexPlus1: labelIndex + 1 });
        await displayCanvasHelper.selectFillColor(labelIndex + 1);

        /** @type {BS.Vector2} */
        const points = [];

        _graphData.forEach(({ timestamp, data }, index) => {
          const normalizedX = index / numberOfSamples;
          let x = normalizedX * size.width;

          const value = data[label];
          const normalizedValue = 1 - rangeHelper.getNormalization(value);
          let y = size.height * normalizedValue;

          x -= size.width / 2;
          y -= size.height / 2;
          //console.log({ label, timestamp, value, x, y });
          points.push({ x, y });
        });
        await displayCanvasHelper.drawSegments(points);
      }
    }
  } else {
    console.error("no graph data found");
  }
  // FILL - draw device name
  await displayCanvasHelper.endSprite();
};

let graphTypeScale = 1;

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

  //console.log("drawing...");

  {
    await displayCanvasHelper.setVerticalAlignment("start");
    await displayCanvasHelper.setHorizontalAlignment("start");
    await displayCanvasHelper.saveContext();
    await displayCanvasHelper.setSpriteScale(graphTypeScale);
    await displayCanvasHelper.selectSpriteColor(1, getTextColorIndex());
    let string = graphType;
    switch (graphType) {
      case "linearAcceleration":
        string = "acceleration";
        break;
    }
    await displayCanvasHelper.drawSpritesString(0, 0, string);
    await displayCanvasHelper.restoreContext();
  }

  {
    const { size, offset } = drawGraphParams;
    let x = offset.x;
    let y = offset.y + spritesLineHeight * graphTypeScale;
    for (let deviceId in senseGraphData) {
      const { numberOfSamples, isSensorDataEnabled, graphData, device } =
        senseGraphData[deviceId];

      // console.log(`drawing "${device.name}" sensor data...`);
      await drawGraph(x, y, senseGraphData[deviceId]);
      y += size.height;
    }
  }

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
  if (device.fileTransferStatus == "idle") {
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

// SENSE

const sensorRates = [5, 10, 20, 40];

const sensesContainer = document.getElementById("senses");
/** @type {HTMLTemplateElement} */
const senseTemplate = document.getElementById("senseTemplate");
/** @type {Record<string, HTMLElement>} */
const senseContainers = {};
/** @typedef {{timestamp: number, data: any}[]} GraphData */
/** @typedef {Record<GraphType, GraphData>} AllGraphData */
/** @typedef { {device: BS.Device, numberOfSamples: number, sensorTypes: BS.ContinuousSensorType[], isSensorDataEnabled: boolean, graphData: AllGraphData }} SenseGraphData */
/** @type {Record<string, SenseGraphData>} */
const senseGraphData = {};
BS.DeviceManager.AddEventListener("deviceIsConnected", (event) => {
  const { device } = event.message;

  if (device.type == "glasses") {
    return;
  }

  let senseContainer = senseContainers[device.id];

  if (device.isConnected) {
    senseContainer = senseContainers[device.id] = senseTemplate.content
      .cloneNode(true)
      .querySelector(".sense");

    /** @type {AllGraphData} */
    const graphData = {
      pressureMetadata: [],

      gyroscopeCorrected: [],
      magnetometerCorrected: [],
      linearAccelerationCorrected: [],

      rotationEuler: [],
      gameRotationEuler: [],
    };
    console.log("graphData", graphData);

    /** @type {BS.ContinuousSensorType[]} */
    const sensorTypes = [];

    const _senseGraphData = (senseGraphData[device.id] = {
      device,
      numberOfSamples: 100,
      isSensorDataEnabled: false,
      graphData,
      sensorTypes,
    });

    senseContainer
      .querySelector(".disconnect")
      .addEventListener("click", () => device.disconnect(), {
        once: true,
      });
    senseContainer.querySelector(".name").innerText = device.name;
    senseContainer.querySelector(".type").innerText = device.type;

    let numberOfSamples = 30;
    const numberOfSamplesContainer =
      senseContainer.querySelector(".numberOfSamples");
    const numberOfSamplesSpan =
      numberOfSamplesContainer.querySelector("span.value");
    const numberOfSamplesInput =
      numberOfSamplesContainer.querySelector("input");
    numberOfSamplesInput.addEventListener("input", () => {
      setNumberOfSamples(Number(numberOfSamplesInput.value));
    });
    const setNumberOfSamples = (newNumberOfSamples) => {
      numberOfSamples = newNumberOfSamples;
      _senseGraphData.numberOfSamples = numberOfSamples;
      console.log({ numberOfSamples });
      numberOfSamplesSpan.innerText = numberOfSamples;
      numberOfSamplesInput.value = numberOfSamples;
    };
    setNumberOfSamples(numberOfSamples);

    let isSensorDataEnabled = false;

    /** @type {HTMLSelectElement} */
    const sensorRateSelect = senseContainer.querySelector(".sensorRate");
    const sensorRateOptgroup = sensorRateSelect.querySelector("optgroup");
    sensorRates.forEach((sensorRate) => {
      sensorRateOptgroup.appendChild(new Option(`${sensorRate}ms`, sensorRate));
    });
    let sensorRate = sensorRates[3];
    sensorRateSelect.addEventListener("input", () => {
      setSensorRate(Number(sensorRateSelect.value));
    });
    const setSensorRate = (newSensorRate) => {
      sensorRate = newSensorRate;
      console.log({ sensorRate });
      sensorRateSelect.value = sensorRate;

      if (device.isConnected && isSensorDataEnabled) {
        setSenseSensorData(true);
      }
    };
    setSensorRate(sensorRate);

    /** @type {HTMLTemplateElement} */
    const sensorTypeTemplate = senseContainer.querySelector(
      ".sensorTypeTemplate"
    );

    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    euler.order = "YXZ";
    let offsetYaw = 0;

    let shouldResetQuaternionYaw = false;
    const yawQuaternion = new THREE.Quaternion();
    const linearAccelerationVector = new THREE.Vector3();
    const gyroscopeVector = new THREE.Vector3();
    const magnetometerVector = new THREE.Vector3();

    const resetYawButton = senseContainer.querySelector(".resetYaw");
    resetYawButton.addEventListener("click", () => {
      // console.log("shouldResetQuaternionYaw");
      shouldResetQuaternionYaw = true;
    });

    device.continuousSensorTypes
      .filter((sensorType) => allGraphTypes.includes(sensorType))
      .forEach((sensorType) => {
        const sensorTypeContainer = sensorTypeTemplate.content
          .cloneNode(true)
          .querySelector(".sensorType");
        sensorTypeContainer.querySelector(".name").innerText = sensorType;
        sensorTypeContainer
          .querySelector("input")
          .addEventListener("input", (event) => {
            if (event.target.checked) {
              if (!sensorTypes.includes(sensorType)) {
                sensorTypes.push(sensorType);
              }
            } else {
              if (sensorTypes.includes(sensorType)) {
                sensorTypes.splice(sensorTypes.indexOf(sensorType), 1);
              }
            }
            toggleSenseSensorDataInput.disabled =
              !isSensorDataEnabled && sensorTypes.length == 0;
            console.log("sensorTypes", sensorTypes);
          });
        sensorTypeTemplate.parentElement.insertBefore(
          sensorTypeContainer,
          sensorTypeTemplate
        );

        graphData[sensorType] = [];

        const addData = (sensorType, timestamp, data) => {
          graphData[sensorType].push({ timestamp, data });
          while (graphData[sensorType].length > numberOfSamples) {
            graphData[sensorType].shift();
          }
        };

        device.addEventListener(sensorType, (event) => {
          let { timestamp, isLast, [sensorType]: data } = event.message;

          //console.log({ timestamp, sensorType, data, isLast });

          if (sensorType == "pressure") {
            /** @type {BS.PressureData} */
            let pressure = data;
            data = pressure.sensors.map((sensor) => sensor.normalizedValue);
          }

          addData(sensorType, timestamp, data);

          switch (event.message.sensorType) {
            case "pressure":
              {
                const { pressure } = event.message;
                addData("pressureMetadata", timestamp, {
                  sum: pressure.normalizedSum,
                  x: pressure.normalizedCenter?.x || 0,
                  y: pressure.normalizedCenter?.y || 0,
                });
              }
              break;
          }

          switch (sensorType) {
            case "gameRotation":
            case "rotation":
              {
                quaternion.copy(data);
                euler.setFromQuaternion(quaternion);

                if (shouldResetQuaternionYaw) {
                  console.log("resetting yaw");
                  shouldResetQuaternionYaw = false;
                  offsetYaw = euler.y;
                  euler.x = euler.z = 0;
                  yawQuaternion.setFromEuler(euler).invert();
                }
                quaternion.multiply(yawQuaternion);

                euler.y -= offsetYaw;
                if (euler.y < -Math.PI) {
                  euler.y += 2 * Math.PI;
                } else if (euler.y > Math.PI) {
                  euler.y -= 2 * Math.PI;
                }

                addData(sensorType + "Euler", timestamp, {
                  pitch: euler.x,
                  yaw: euler.y,
                  roll: euler.z,
                });
              }
              break;
          }

          if (
            device.sensorConfiguration.gameRotation ||
            device.sensorConfiguration.rotation
          ) {
            switch (sensorType) {
              case "linearAcceleration":
                {
                  linearAccelerationVector.copy(data);
                  linearAccelerationVector.applyQuaternion(quaternion);

                  //console.log("linearAccelerationVector", linearAccelerationVector);

                  addData(sensorType + "Corrected", timestamp, {
                    x: linearAccelerationVector.x,
                    y: linearAccelerationVector.y,
                    z: linearAccelerationVector.z,
                  });
                }
                break;
              case "gyroscope":
                {
                  gyroscopeVector.copy(data);
                  gyroscopeVector.applyQuaternion(quaternion);

                  //console.log("gyroscopeVector", gyroscopeVector);

                  addData(sensorType + "Corrected", timestamp, {
                    x: gyroscopeVector.x,
                    y: gyroscopeVector.y,
                    z: gyroscopeVector.z,
                  });
                }
                break;
              case "magnetometer":
                {
                  magnetometerVector.copy(data);
                  magnetometerVector.applyQuaternion(quaternion);

                  //console.log("magnetometerVector", magnetometerVector);

                  addData(sensorType + "Corrected", timestamp, {
                    x: magnetometerVector.x,
                    y: magnetometerVector.y,
                    z: magnetometerVector.z,
                  });
                }
                break;
            }
          }

          if (isLast) {
            let shouldDraw = false;

            const includesQuaternion =
              sensorTypes.includes("gameRotation") ||
              sensorTypes.includes("rotation");

            switch (graphType) {
              case "pressure":
                if (sensorTypes.includes("pressure")) {
                  shouldDraw = true;
                }
                break;
              case "linearAcceleration":
              case "gyroscope":
              case "magnetometer":
                if (sensorTypes.includes(graphType) && includesQuaternion) {
                  shouldDraw = true;
                }
                break;
              case "orientation":
                if (includesQuaternion) {
                  shouldDraw = true;
                }
                break;
            }

            if (shouldDraw) {
              draw();
            }
          }
        });
      });

    /** @type {HTMLInputElement} */
    const toggleSenseSensorDataInput = senseContainer.querySelector(
      ".toggleSenseSensorData"
    );
    device.addEventListener("isConnected", () => {
      toggleSenseSensorDataInput.disabled = !device.isConnected;
      if (!device.isConnected) {
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
      if (enable && sensorTypes.length == 0) {
        return;
      }
      if (enable) {
        /** @type {BS.SensorConfiguration} */
        const newSensorConfiguration = {};
        sensorTypes.forEach((sensorType) => {
          newSensorConfiguration[sensorType] = sensorRate;
        });
        console.log("newSensorConfiguration", newSensorConfiguration);
        device.setSensorConfiguration(newSensorConfiguration);
      } else {
        device.clearSensorConfiguration();
      }

      senseContainer
        .querySelectorAll(".sensorType input")
        .forEach((input) => (input.disabled = enable));
    };

    device.addEventListener("getSensorConfiguration", () => {
      const newIsSensorDataEnabled =
        device.sensorConfiguration[sensorTypes[0]] > 0;
      setIsSensorDataEnabled(newIsSensorDataEnabled);
      // FILL - update sensorType checkboxes (disabled and checked)
      // FILL - update toggleSenseSensorDataInput
    });
    const setIsSensorDataEnabled = (newIsSensorDataEnabled) => {
      isSensorDataEnabled = newIsSensorDataEnabled;
      _senseGraphData.isSensorDataEnabled = isSensorDataEnabled;
      console.log({ isSensorDataEnabled });
      toggleSenseSensorDataInput.checked = isSensorDataEnabled;
    };

    sensesContainer.appendChild(senseContainer);
  } else {
    senseContainer.remove();
    delete senseContainers[device.id];
    delete senseGraphData[device.id];
  }
});

const addSenseButton = document.getElementById("addSense");
addSenseButton.addEventListener("click", () => {
  addSense();
});
const addSense = () => {
  BS.Device.Connect();
};

document.addEventListener("keydown", (event) => {
  let preventDefault = true;

  switch (event.key) {
    case "ArrowRight":
      cycleGraphType(true);
      break;
    case "ArrowLeft":
      cycleGraphType(false);
      break;
    default:
      preventDefault = false;
      break;
  }

  if (preventDefault) {
    event.preventDefault();
  }
});

let cycleGraphType = async (isPositive) => {
  //console.log("cycleGraphType", { isPositive });

  let graphTypeIndex = graphTypes.indexOf(graphType) + (isPositive ? 1 : -1);
  if (graphTypeIndex < 0) {
    graphTypeIndex += graphTypes.length;
  }
  graphTypeIndex %= graphTypes.length;
  const newGraphType = graphTypes[graphTypeIndex];
  await selectGraphType(newGraphType);
};
cycleGraphType = BS.ThrottleUtils.throttle(cycleGraphType, 400);
didLoad = true;
