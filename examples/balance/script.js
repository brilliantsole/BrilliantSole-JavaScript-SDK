import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

// GET DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById(
  "availableDeviceTemplate",
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
        onConnectionStatusUpdate(),
      );
      onConnectionStatusUpdate();
      availableDevicesContainer.appendChild(availableDeviceContainer);
    });
  }
}
async function getDevices() {
  const availableDevices = await BS.DeviceManager.getDevices();
  if (!availableDevices) {
    return;
  }
  onAvailableDevices(availableDevices);
}

BS.DeviceManager.addEventListener("availableDevices", (event) => {
  const { availableDevices } = event.message;
  onAvailableDevices(availableDevices);
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

// BALANCE VISUALIZATION

const balanceContainer = document.getElementById("balanceContainer");
/** @type {HTMLTemplateElement} */
const balanceSideTemplate = document.getElementById("balanceSideTemplate");

const balanceSideElements = {};
window.balanceSideElements = balanceSideElements;

devicePair.sides.forEach((side) => {
  /** @type {HTMLElement} */
  const balanceSideContainer = balanceSideTemplate.content
    .cloneNode(true)
    .querySelector(".balanceSide");
  balanceSideContainer.classList.add(side);
  balanceContainer.appendChild(balanceSideContainer);
  const target = balanceSideContainer.querySelector(".target");
  const fill = balanceSideContainer.querySelector(".fill");
  balanceSideElements[side] = { target, fill };
});

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
  "togglePressureAutoRange",
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
  "togglePressureMotionAutoRange",
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

function updateUIOnCenterOfPressure() {
  devicePair.sides.forEach((side) => {
    let height = currentCenter.x;
    if (side == "left") {
      height = 1 - height;
    }
    balanceSideElements[side].fill.style.height = `${height * 100}%`;
  });
}
window.updateUIOnCenterOfPressure = updateUIOnCenterOfPressure;

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
    balanceContainer.classList.add("game");
  } else {
    balanceContainer.classList.remove("game");
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
  height: 0,
  start: 0,

  get isInside() {
    // console.log(currentCenter, this);
    return !this.isBelow && !this.isAbove;
  },
  get isBelow() {
    return currentCenter.x < this.start;
  },
  get isAbove() {
    return currentCenter.x > this.start + this.height;
  },
  get insideInterpolation() {
    if (!this.isInside) {
      return 0;
    }
    return (currentCenter.x - this.start) / this.height;
  },

  reset() {
    clearTimeout(insideTargetTimeoutId);
    insideTargetTimeoutId = undefined;
    balanceContainer.classList.remove("hover");

    this.height = randomValueBetween(0.1, 0.2);
    this.start = randomValueBetween(0, 1 - this.height);

    devicePair.sides.forEach((side) => {
      let bottom = this.start;
      if (side == "left") {
        bottom = 1 - bottom - this.height;
      }
      balanceSideElements[side].target.style.bottom = `${bottom * 100}%`;
      balanceSideElements[side].target.style.height = `${this.height * 100}%`;
    });

    drawGlassesDisplay();
  },
};

let isCenterOfPressureInsideTarget = false;
let insideTargetTimeoutId;

devicePair.addEventListener("pressure", (event) => {
  const { pressure } = event.message;
  console.log({ pressure });
  if (pressure.normalizedCenter) {
    console.log("center", pressure.normalizedCenter);
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
  updateUIOnCenterOfPressure();

  if (isPlayingGame) {
    isCenterOfPressureInsideTarget = target.isInside;
    // console.log({ isCenterOfPressureInsideTarget });
    if (isCenterOfPressureInsideTarget) {
      if (insideTargetTimeoutId == undefined) {
        isInsideStartTime = Date.now();
        balanceContainer.classList.add("hover");
        insideTargetTimeoutId = setTimeout(() => {
          target.reset();
        }, 1750);
      }
    } else {
      if (insideTargetTimeoutId != undefined) {
        balanceContainer.classList.remove("hover");
        clearTimeout(insideTargetTimeoutId);
        insideTargetTimeoutId = undefined;
      }
    }
  }
  drawGlassesDisplay();
}
window.onCenterOfPressure = onCenterOfPressure; // for manual testing

// SERVER

const websocketClient = new BS.WebSocketClient();
/** @type {HTMLButtonElement} */
const toggleServerConnectionButton = document.getElementById(
  "toggleServerConnection",
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

/** @type {HTMLInputElement} */
const centerOfPressureInput = document.getElementById("centerOfPressureInput");
centerOfPressureInput.addEventListener("input", () => {
  onCenterOfPressure(centerOfPressureInput.value);
});

// GLASSES START
const glassesDisplayTargetColors = ["yellow", "limegreen"];
const glassesDisplayCanvasHelper = new BS.DisplayCanvasHelper();
const glassesDisplayCanvas = document.getElementById("glassesDisplay");
glassesDisplayCanvasHelper.canvas = glassesDisplayCanvas;
window.glassesDisplayCanvasHelper = glassesDisplayCanvasHelper;

const glassesDevice = new BS.Device();
const toggleGlassesConnectionButton = document.getElementById(
  "toggleGlassesConnection",
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
  "glassesFileTransferProgress",
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
  },
);
glassesDisplayCanvasHelper.addEventListener(
  "deviceSpriteSheetUploadComplete",
  () => {
    isUploadingToGlasses = false;
  },
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
    width: 60,
    height: 200,
  },
  padding: 30,
  innerPadding: 0,
  lineWidth: 7,
  lineWidth2: 3,
  borderRadius: 12,
  borderRadius2: 5,
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

  await displayCanvasHelper.setColor(1, "white");
  await displayCanvasHelper.setColor(2, "red");
  await displayCanvasHelper.setColor(3, glassesDisplayTargetColors[0]);
  await displayCanvasHelper.setColor(4, "blue");

  const {
    offset,
    size,
    padding,
    lineWidth,
    lineWidth2,
    borderRadius,
    borderRadius2,
    innerPadding,
  } = drawGlassesParams;

  const innerWidth = size.width - innerPadding;

  await displayCanvasHelper.setHorizontalAlignment("center");
  await displayCanvasHelper.setVerticalAlignment("center");

  const interpolation = currentCenter.x;

  await glassesDisplayCanvasHelper.setColor(
    3,
    glassesDisplayTargetColors[target.isInside ? 1 : 0],
  );

  for (let i = 0; i < 2; i++) {
    const side = i == 0 ? "left" : "right";

    if (false) {
      await displayCanvasHelper.setFillBackground(true);
      await displayCanvasHelper.selectBackgroundColor(2);
    }

    await displayCanvasHelper.setVerticalAlignment("center");

    let xOffset = (size.width + padding) / 2;
    if (side == "left") {
      xOffset *= -1;
    }
    const x = offset.x + xOffset;
    await displayCanvasHelper.selectSpriteColor(1, 1);
    await displayCanvasHelper.selectSpriteColor(2, 2);
    await displayCanvasHelper.startSprite(
      x,
      offset.y,
      size.width + lineWidth,
      size.height + lineWidth,
    );

    let yInterpolation = interpolation;
    if (side == "left") {
      yInterpolation = 1 - yInterpolation;
    }

    await displayCanvasHelper.setLineWidth(0);
    await displayCanvasHelper.selectFillColor(2);
    await displayCanvasHelper.setIgnoreFill(false);
    await displayCanvasHelper.setVerticalAlignment("end");
    await displayCanvasHelper.drawRect(
      0,
      size.height / 2 - lineWidth / 2,
      innerWidth,
      (size.height - lineWidth) * yInterpolation,
    );

    await displayCanvasHelper.setVerticalAlignment("center");
    await displayCanvasHelper.setLineWidth(lineWidth);
    await displayCanvasHelper.selectLineColor(1);
    await displayCanvasHelper.setIgnoreFill(true);
    await displayCanvasHelper.drawRoundRect(
      0,
      0,
      innerWidth,
      size.height,
      borderRadius,
    );

    await displayCanvasHelper.endSprite();

    if (isPlayingGame) {
      let targetY = size.height / 2;
      targetY += -size.height * target.start;
      if (side == "left") {
        targetY *= -1;
      }
      targetY += offset.y;

      await displayCanvasHelper.setVerticalAlignment(
        side == "left" ? "start" : "end",
      );

      await displayCanvasHelper.selectSpriteColor(1, 2);
      await displayCanvasHelper.selectSpriteColor(2, 3);
      await displayCanvasHelper.selectSpriteColor(3, 4);
      await displayCanvasHelper.startSprite(
        x,
        targetY,
        size.width + 20,
        size.height * target.height,
      );

      await displayCanvasHelper.setLineWidth(0);
      await displayCanvasHelper.selectFillColor(2);
      await displayCanvasHelper.drawRoundRect(
        0,
        0,
        size.width + 20,
        size.height * target.height,
        borderRadius2,
      );

      let targetInterpolation = 0;
      if (target.isInside) {
        targetInterpolation = target.insideInterpolation;
        if (side == "left") {
          targetInterpolation = 1 - targetInterpolation;
        }
      } else {
        if (target.isAbove) {
          targetInterpolation = side == "left" ? 0 : 1;
        } else {
          targetInterpolation = side == "left" ? 1 : 0;
        }
      }

      await displayCanvasHelper.setIgnoreFill(false);
      await displayCanvasHelper.setLineWidth(0);
      await displayCanvasHelper.setVerticalAlignment("end");
      await displayCanvasHelper.selectFillColor(1);
      await displayCanvasHelper.drawRect(
        0,
        (target.height * size.height) / 2,
        size.width - Math.floor(padding / 4),
        target.height * size.height * targetInterpolation,
      );

      if (target.isInside) {
        const now = Date.now();
        let timeInterpolation =
          (now - isInsideStartTime) / (insideTimeDuration + 100);
        timeInterpolation = Math.max(0, Math.min(1, timeInterpolation));
        console.log({ timeInterpolation });

        await displayCanvasHelper.setVerticalAlignment("center");
        await displayCanvasHelper.setLineWidth(lineWidth);
        await displayCanvasHelper.selectLineColor(3);
        await displayCanvasHelper.setIgnoreFill(true);
        await displayCanvasHelper.drawRoundRect(
          0,
          0,
          (size.width + 20) * (1 - timeInterpolation),
          size.height * target.height * (1 - timeInterpolation),
          0.5 * borderRadius2 * (1 + timeInterpolation * 1),
        );
      }

      await displayCanvasHelper.endSprite();
    }
  }

  await displayCanvasHelper.show();
};
window.draw = drawGlassesDisplay;

glassesDisplayCanvasHelper.addEventListener("ready", () => {
  isDrawingToGlassesDisplay = false;
  if (isWaitingToRedrawToGlassesDisplay || (isPlayingGame && target.isInside)) {
    isWaitingToRedrawToGlassesDisplay = false;
    drawGlassesDisplay();
  }
});

/** @type {HTMLSelectElement} */
const setGlassesDisplayBrightnessSelect = document.getElementById(
  "setGlassesDisplayBrightness",
);

/** @type {HTMLOptGroupElement} */
const setGlassesDisplayBrightnessOptgroup =
  setGlassesDisplayBrightnessSelect.querySelector("optgroup");
BS.DisplayBrightnesses.forEach((displayBrightness) => {
  setGlassesDisplayBrightnessOptgroup.appendChild(
    new Option(displayBrightness),
  );
});
setGlassesDisplayBrightnessSelect.addEventListener("input", (event) => {
  glassesDisplayCanvasHelper.setBrightness(event.target.value);
});
setGlassesDisplayBrightnessSelect.value = glassesDisplayCanvasHelper.brightness;
// GLASSES END
