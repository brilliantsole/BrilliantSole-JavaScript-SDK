import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

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

// CONNECTION
const devicePair = BS.DevicePair.insoles;

/** @type {HTMLButtonElement} */
const addDeviceButton = document.getElementById("addDevice");
devicePair.addEventListener("isConnected", () => {
  addDeviceButton.disabled = devicePair.isConnected;
});
addDeviceButton.addEventListener("click", () => {
  BS.Device.Connect();
});

// PRESSURE VISUALIZATION

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

// GAME ROTATION
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

const centerOfPressureElement = document.getElementById("centerOfPressure");
function updateCenterOfPressureElement() {
  centerOfPressureElement.style.left = `${currentCenter.x * 100}%`;
  centerOfPressureElement.style.top = `${(1 - currentCenter.y) * 100}%`;
}
window.updateCenterOfPressureElement = updateCenterOfPressureElement;

let isPlayingGame = false;

/** @type {HTMLButtonElement} */
const toggleGameButton = document.getElementById("toggleGame");
devicePair.addEventListener("isConnected", () => {
  //toggleGameButton.disabled = !devicePair.isConnected;
});
toggleGameButton.addEventListener("click", () => {
  isPlayingGame = !isPlayingGame;
  toggleGameButton.innerText = isPlayingGame ? "stop game" : "start game";
  if (isPlayingGame) {
    target.reset();
    target.element.style.display = "block";
  } else {
    target.element.style.display = "none";
  }
  drawGlassesDisplay();
});

/**
 * @param {number} min
 * @param {number} max
 */
function randomValueBetween(min, max) {
  const range = max - min;
  return min + Math.random() * range;
}

const target = {
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  bottom: 0,
  element: document.getElementById("target"),

  get isInside() {
    return (
      currentCenter.x >= this.left &&
      currentCenter.x <= this.left + this.width &&
      currentCenter.y <= this.bottom &&
      currentCenter.y >= this.bottom - this.height
    );
  },

  reset() {
    clearTimeout(insideTargetTimeoutId);
    insideTargetTimeoutId = undefined;

    this.element.classList.remove("hover");

    this.width = randomValueBetween(0.2, 0.3);
    this.height = randomValueBetween(0.2, 0.3);

    this.left = randomValueBetween(0, 1 - this.width);
    this.top = randomValueBetween(0, 1 - this.height);
    this.bottom = 1 - this.top;

    console.log("target", { ...target });

    this.element.style.width = `${this.width * 100}%`;
    this.element.style.height = `${this.height * 100}%`;

    this.element.style.left = `${this.left * 100}%`;
    this.element.style.top = `${this.top * 100}%`;

    drawGlassesDisplay();
  },
};

let isCenterOfPressureInsideTarget = false;
let insideTargetTimeoutId;

devicePair.addEventListener("pressure", (event) => {
  /** @type {BS.DevicePairPressureData} */
  const pressure = event.message.pressure;
  // console.log({ pressure });
  if (pressure.normalizedCenter) {
    //console.log(pressure.normalizedCenter);
    onCenterOfPressure(pressure.normalizedCenter);
  }
});

/** @type {BS.CenterOfPressure} */
let currentCenter = { x: 0, y: 0 };
let isInsideStartTime = 0;
const insideTimeDuration = 1500;
/** @param {BS.CenterOfPressure} center */
function onCenterOfPressure(center) {
  currentCenter = center;
  updateCenterOfPressureElement();

  if (isPlayingGame) {
    isCenterOfPressureInsideTarget = target.isInside;
    // console.log({ isCenterOfPressureInsideTarget });
    if (isCenterOfPressureInsideTarget) {
      if (insideTargetTimeoutId == undefined) {
        isInsideStartTime = Date.now();
        target.element.classList.add("hover");
        insideTargetTimeoutId = setTimeout(() => {
          target.reset();
        }, insideTimeDuration);
      }
    } else {
      if (insideTargetTimeoutId != undefined) {
        target.element.classList.remove("hover");
        clearTimeout(insideTargetTimeoutId);
        insideTargetTimeoutId = undefined;
      }
    }
  }
  drawGlassesDisplay();
}
window.onCenterOfPressure = onCenterOfPressure;

/** @type {HTMLInputElement} */
const centerOfPressureInput = document.getElementById("centerOfPressureInput");
centerOfPressureInput.addEventListener("input", () => {
  onCenterOfPressure(centerOfPressureInput.value);
});

// GLASSES START
const glassesDisplayTargetColors = ["yellow", "limegreen"];
const glassesDisplayCanvasHelper = new BS.DisplayCanvasHelper();
glassesDisplayCanvasHelper.setColor(1, "white");
glassesDisplayCanvasHelper.setColor(2, "red");
glassesDisplayCanvasHelper.setColor(3, glassesDisplayTargetColors[0]);
glassesDisplayCanvasHelper.setColor(4, "blue");
const glassesDisplayCanvas = document.getElementById("glassesDisplay");
glassesDisplayCanvasHelper.canvas = glassesDisplayCanvas;
window.glassesDisplayCanvasHelper = glassesDisplayCanvasHelper;

const glassesDevice = new BS.Device();
const toggleGlassesConnectionButton = document.getElementById(
  "toggleGlassesConnection"
);
toggleGlassesConnectionButton.addEventListener("click", () => {
  glassesDevice.toggleConnection(false);
});
glassesDevice.addEventListener("connectionStatus", (event) => {
  const { connectionStatus } = event.message;
  let innerText = connectionStatus;
  switch (connectionStatus) {
    case "notConnected":
      innerText = "connect";
      break;
    case "connected":
      innerText = "disconnect";
      break;
  }
  toggleGlassesConnectionButton.innerText = innerText;
});
glassesDevice.addEventListener("connected", () => {
  if (!glassesDevice.isGlasses || !glassesDevice.isDisplayAvailable) {
    glassesDevice.disconnect();
  }
  glassesDisplayCanvasHelper.device = glassesDevice;
});

/** @type {HTMLProgressElement} */
const glassesFileTransferProgress = document.getElementById(
  "glassesFileTransferProgress"
);
glassesDevice.addEventListener("fileTransferProgress", (event) => {
  const progress = event.message.progress;
  //console.log({ progress });
  glassesFileTransferProgress.value = progress == 1 ? 0 : progress;
});
glassesDevice.addEventListener("fileTransferStatus", () => {
  if (glassesDevice.fileTransferStatus == "ready") {
    glassesFileTransferProgress.value = 0;
  }
});

glassesDisplayCanvasHelper.addEventListener(
  "deviceSpriteSheetUploadStart",
  () => {
    isUploadingToGlasses = true;
  }
);
glassesDisplayCanvasHelper.addEventListener(
  "deviceSpriteSheetUploadComplete",
  () => {
    isUploadingToGlasses = false;
  }
);
glassesDisplayCanvasHelper.addEventListener("deviceUpdated", () => {
  drawGlassesDisplay();
});

let isUploadingToGlasses = false;
let isDrawingToGlassesDisplay = false;
let isWaitingToRedrawToGlassesDisplay = false;

const drawGlassesParams = {
  offset: {
    x: 640 / 2,
    y: 400 / 2,
  },
  size: {
    width: 200,
    height: 200,
  },
  padding: {
    x: 40,
    y: 40,
  },
};

let drawGlassesDisplay = async () => {
  if (isUploadingToGlasses) {
    return;
  }
  if (isDrawingToGlassesDisplay) {
    //console.warn("busy drawing");
    isWaitingToRedrawToGlassesDisplay = true;
    return;
  }
  isDrawingToGlassesDisplay = true;

  // console.log("drawGlassesDisplay");
  const displayCanvasHelper = glassesDisplayCanvasHelper;

  const { offset, size, padding } = drawGlassesParams;

  const width = size.width - padding.x;
  const height = size.height - padding.y;

  const width2 = size.width - padding.x / 2;
  const height2 = size.height - padding.y / 2;

  await displayCanvasHelper.setHorizontalAlignment("center");
  await displayCanvasHelper.setVerticalAlignment("center");

  await displayCanvasHelper.setIgnoreFill(true);
  await displayCanvasHelper.setIgnoreLine(false);
  await displayCanvasHelper.setLineWidth(8);
  await displayCanvasHelper.selectFillColor(1);
  await displayCanvasHelper.drawRoundRect(
    offset.x,
    offset.y,
    size.width,
    size.height,
    20
  );

  if (isPlayingGame) {
    await glassesDisplayCanvasHelper.setColor(
      3,
      glassesDisplayTargetColors[target.isInside ? 1 : 0]
    );
    await displayCanvasHelper.selectSpriteColor(1, 3);
    await displayCanvasHelper.selectSpriteColor(2, 4);
    if (false) {
      await displayCanvasHelper.setFillBackground(true);
      await displayCanvasHelper.selectBackgroundColor(2);
    }
    await displayCanvasHelper.setVerticalAlignment("start");
    await displayCanvasHelper.setHorizontalAlignment("start");
    await displayCanvasHelper.startSprite(
      offset.x - width2 * 0.5 + width2 * target.left,
      offset.y - height2 * 0.5 + height2 * target.top,
      width2 * target.width,
      height2 * target.height
    );

    await displayCanvasHelper.setLineWidth(0);
    await displayCanvasHelper.setVerticalAlignment("center");
    await displayCanvasHelper.setHorizontalAlignment("center");
    await displayCanvasHelper.selectFillColor(1);
    await displayCanvasHelper.selectLineColor(2);
    await displayCanvasHelper.drawRoundRect(
      0,
      0,
      target.width * width2,
      target.height * height2,
      10
    );

    if (target.isInside) {
      const now = Date.now();
      let interpolation =
        (now - isInsideStartTime) / (insideTimeDuration + 100);
      interpolation = Math.max(0, Math.min(1, interpolation));
      // console.log({ interpolation });
      await displayCanvasHelper.setLineWidth(5);
      await displayCanvasHelper.setIgnoreFill(true);
      await displayCanvasHelper.drawRoundRect(
        0,
        0,
        target.width * width2 * (1 - interpolation),
        target.height * height2 * (1 - interpolation),
        10 + interpolation * 10
      );
    }

    await displayCanvasHelper.endSprite();
    await displayCanvasHelper.setFillBackground(false);
  }

  await displayCanvasHelper.setLineWidth(0);
  await displayCanvasHelper.setHorizontalAlignment("center");
  await displayCanvasHelper.setVerticalAlignment("center");
  await displayCanvasHelper.setIgnoreFill(false);
  await displayCanvasHelper.setIgnoreLine(true);
  await displayCanvasHelper.selectFillColor(2);
  await displayCanvasHelper.drawCircle(
    offset.x + width * (currentCenter.x - 0.5),
    offset.y - height * (currentCenter.y - 0.5),
    8
  );

  await displayCanvasHelper.show();
};
window.draw = drawGlassesDisplay;

glassesDisplayCanvasHelper.addEventListener("ready", () => {
  isDrawingToGlassesDisplay = false;
  if (isWaitingToRedrawToGlassesDisplay || target.isInside) {
    isWaitingToRedrawToGlassesDisplay = false;
    drawGlassesDisplay();
  }
});
if (false) {
  const fontSize = 42;
  /** @type {BS.DisplaySpriteSheet} */
  let englishSpriteSheet;
  let englishFontLineHeight = 0;

  const fontName = "roboto.ttf";
  const fontSpriteSheetLocalStorageKey = `fontSpriteSheet.${fontName}.${fontSize}`;
  console.log({ fontSpriteSheetLocalStorageKey });
  try {
    const fontSpriteSheetString = localStorage.getItem(
      fontSpriteSheetLocalStorageKey
    );
    if (fontSpriteSheetString) {
      englishSpriteSheet = JSON.parse(fontSpriteSheetString);
    } else {
      const response = await fetch(`../../assets/font/${fontName}`);
      const arrayBuffer = await response.arrayBuffer();
      const englishFont = await BS.parseFont(arrayBuffer);

      englishSpriteSheet = await BS.fontToSpriteSheet(
        englishFont,
        fontSize,
        "english"
      );
      localStorage.setItem(
        fontSpriteSheetLocalStorageKey,
        JSON.stringify(englishSpriteSheet)
      );
    }
    console.log("englishSpriteSheet", englishSpriteSheet);

    englishFontLineHeight = englishSpriteSheet.sprites[0].height;
    //console.log({ englishFontLineHeight });

    await glassesDisplayCanvasHelper.uploadSpriteSheet(englishSpriteSheet);
    await glassesDisplayCanvasHelper.selectSpriteSheet(englishSpriteSheet.name);
    await glassesDisplayCanvasHelper.setSpritesLineHeight(
      englishFontLineHeight
    );
    await drawGlassesDisplay();
  } catch (error) {
    console.error("error parsing font", error);
  }
}

/** @type {HTMLSelectElement} */
const setGlassesDisplayBrightnessSelect = document.getElementById(
  "setGlassesDisplayBrightness"
);

/** @type {HTMLOptGroupElement} */
const setGlassesDisplayBrightnessOptgroup =
  setGlassesDisplayBrightnessSelect.querySelector("optgroup");
BS.DisplayBrightnesses.forEach((displayBrightness) => {
  setGlassesDisplayBrightnessOptgroup.appendChild(
    new Option(displayBrightness)
  );
});
setGlassesDisplayBrightnessSelect.addEventListener("input", (event) => {
  glassesDisplayCanvasHelper.setBrightness(event.target.value);
});
setGlassesDisplayBrightnessSelect.value = glassesDisplayCanvasHelper.brightness;
// GLASSES END
