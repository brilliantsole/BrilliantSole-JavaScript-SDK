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

// DEVICE
BS.DeviceManager.AddEventListener("deviceConnected", (event) => {
  if (event.message.device.connectionType != "client") {
    return;
  }
  if (event.message.device.isDisplayAvailable) {
    clientDevice = event.message.device;
    if (client.isScanning) {
      client.stopScan();
    }
    displayCanvasHelper.device = clientDevice;
  } else {
    console.log("display not available");
    // event.message.device.disconnect();
  }
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

    const colorIndexSpan = displayColorContainer.querySelector(".colorIndex");
    colorIndexSpan.innerText = `color #${colorIndex}`;
    const colorInput = displayColorContainer.querySelector("input");
    displayColorInputs[colorIndex] = colorInput;
    colorInput.addEventListener("input", () => {
      setDisplayColor(colorIndex, colorInput.value);
    });
    displayColorsContainer.appendChild(displayColorContainer);
  }
};
setupColors();
displayCanvasHelper.addEventListener("numberOfColors", () => setupColors());
displayCanvasHelper.addEventListener("color", (event) => {
  const { colorHex, colorIndex } = event.message;
  displayColorInputs[colorIndex].value = colorHex;
});
displayCanvasHelper.setColor(1, "white", true);

// IMAGE PREVIEW

/** @type {HTMLInputElement} */
const imageInput = document.getElementById("imageInput");
/** @type {HTMLImageElement} */
const image = document.getElementById("image");
imageInput.addEventListener("input", () => {
  const file = imageInput.files[0];
  if (!file) return;
  loadImage(file);
  imageInput.value = "";
});
const loadImage = (file) => {
  const reader = new FileReader();
  reader.onload = () => {
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
};
image.addEventListener("load", () => {
  createSvgSpriteSheet();
});

// DRAGOVER
window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    if (file.type.startsWith("image/svg+xml")) {
      loadImage(file);
    }
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
  console.log("string", string);
  if (isValidUrl(string)) {
    image.src = string;
  } else if (BS.isValidSVG(string)) {
    image.src = "data:image/svg+xml;utf8," + encodeURIComponent(string);
  }
});
window.addEventListener("paste", (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith("image/svg+xml")) {
      const file = item.getAsFile();
      loadImage(file);
      return;
    }
  }
});

// DRAW PARAMS

const drawXContainer = document.getElementById("drawX");
const drawXInput = drawXContainer.querySelector("input");
const drawXSpan = drawXContainer.querySelector("span.value");
let drawX = Number(drawXInput.value);

drawXInput.addEventListener("input", () => {
  drawX = Number(drawXInput.value);
  //console.log({ drawX });
  drawXSpan.innerText = drawX;
  draw();
});

const drawYContainer = document.getElementById("drawY");
const drawYInput = drawYContainer.querySelector("input");
const drawYSpan = drawYContainer.querySelector("span.value");
let drawY = Number(drawYInput.value);

drawYInput.addEventListener("input", () => {
  drawY = Number(drawYInput.value);
  //console.log({ drawY });
  drawYSpan.innerText = drawY;
  draw();
});

const drawRotationContainer = document.getElementById("drawRotation");
const drawRotationInput = drawRotationContainer.querySelector("input");
const drawRotationSpan = drawRotationContainer.querySelector("span.value");
let drawRotation = Number(drawRotationInput.value);

drawRotationInput.addEventListener("input", () => {
  drawRotation = Number(drawRotationInput.value);
  //console.log({ drawRotation });
  drawRotationSpan.innerText = drawRotation;
  draw();
});

const drawScaleXContainer = document.getElementById("drawScaleX");
const drawScaleXInput = drawScaleXContainer.querySelector("input");
const drawScaleXSpan = drawScaleXContainer.querySelector("span.value");
let drawScaleX = Number(drawScaleXInput.value);

drawScaleXInput.addEventListener("input", () => {
  drawScaleX = Number(drawScaleXInput.value);
  //console.log({ drawScaleX });
  drawScaleXSpan.innerText = drawScaleX;
  draw();
});

const drawScaleYContainer = document.getElementById("drawScaleY");
const drawScaleYInput = drawScaleYContainer.querySelector("input");
const drawScaleYSpan = drawScaleYContainer.querySelector("span.value");
let drawScaleY = Number(drawScaleYInput.value);

drawScaleYInput.addEventListener("input", () => {
  drawScaleY = Number(drawScaleYInput.value);
  //console.log({ drawScaleY });
  drawScaleYSpan.innerText = drawScaleY;
  draw();
});

const drawScaleContainer = document.getElementById("drawScale");
const drawScaleInput = drawScaleContainer.querySelector("input");
const drawScaleSpan = drawScaleContainer.querySelector("span.value");

drawScaleInput.addEventListener("input", () => {
  const drawScale = Number(drawScaleInput.value);
  //console.log({ drawScale });
  drawScaleSpan.innerText = drawScale;

  drawScaleX = drawScaleY = drawScale;
  drawScaleXInput.value = drawScaleYInput.value = drawScale;
  drawScaleXSpan.innerText = drawScaleYSpan.innerText = drawScale;

  draw();
});

const inputHeightContainer = document.getElementById("inputHeight");
const inputHeightInput = inputHeightContainer.querySelector("input");
const inputHeightSpan = inputHeightContainer.querySelector("span.value");
let inputHeight = Number(inputHeightInput.value);
inputHeightInput.addEventListener("input", () => {
  inputHeight = Number(inputHeightInput.value);
  //console.log({ inputHeight });
  inputHeightSpan.innerText = inputHeight;
  createSvgSpriteSheet();
});

let overrideColors = false;
const overrideColorsInput = document.getElementById("overrideColors");
overrideColorsInput.addEventListener("input", () => {
  overrideColors = overrideColorsInput.checked;
  //console.log({ overrideColors });
  createSvgSpriteSheet();
});
overrideColors = overrideColorsInput.checked;

// NUMBER OF COLORS

let numberOfColors = 2;
const setNumberOfColors = (newNumberOfColors) => {
  numberOfColors = newNumberOfColors;
  console.log({ numberOfColors });
  createSvgSpriteSheet();
};
const numberOfColorsSelect = document.getElementById("numberOfColors");
const numberOfColorsOptgroup = numberOfColorsSelect.querySelector("optgroup");
numberOfColorsSelect.addEventListener("input", () => {
  setNumberOfColors(Number(numberOfColorsSelect.value));
});
const updateNumberOfColorsSelect = () => {
  for (let i = 2; i < displayCanvasHelper.numberOfColors; i++) {
    numberOfColorsOptgroup.appendChild(new Option(i));
  }
};
displayCanvasHelper.addEventListener("numberOfColors", () => {
  updateNumberOfColorsSelect();
});
updateNumberOfColorsSelect();
numberOfColorsSelect.value = numberOfColors;

// SVG

const createSvgSpriteSheet = async () => {
  if (!image.src) {
    return;
  }
  console.log("createSvgSpriteSheet", image.src);
  const svgString = BS.getSvgStringFromDataUrl(image.src);
  console.log({ svgString, overrideColors });
  const sprite = BS.svgToSprite(
    svgString,
    "svg",
    numberOfColors,
    "svg",
    overrideColors,
    spriteSheet,
    0,
    {
      height: inputHeight,
      //colors: overrideColors ? undefined : displayCanvasHelper.colors,
    }
  );
  checkSpriteSheetSize();
  console.log("sprite", sprite);
  await displayCanvasHelper.resetSpriteColors();
  /** @type {BS.DisplaySpriteColorPair[]} */
  const spriteColorPairs = [];
  for (let i = 0; i < numberOfColors; i++) {
    spriteColorPairs.push({ colorIndex: i, spriteColorIndex: i });
  }
  await displayCanvasHelper.selectSpriteColors(spriteColorPairs);

  await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  await displayCanvasHelper.selectSpriteSheet("mySpriteSheet");

  for (let i = 0; i < displayCanvasHelper.numberOfColors; i++) {
    if (i >= numberOfColors) {
      await displayCanvasHelper.setColor(i, "black");
    }
  }
  await displayCanvasHelper.selectSpriteSheetPalette("svg");

  await draw();
};

// DRAW
let isDrawing = false;
/** @type {BS.DisplaySpriteSheet} */
const spriteSheet = {
  name: "mySpriteSheet",
  sprites: [],
  palettes: [
    {
      name: "svg",
      numberOfColors,
      colors: displayCanvasHelper.colors.slice(),
    },
  ],
};
displayCanvasHelper.addEventListener("color", (event) => {
  const { colorIndex, colorHex } = event.message;
  spriteSheet.palettes[0].colors[colorIndex] = colorHex;
});
window.spriteSheet = spriteSheet;
let drawWhenReady = false;

const draw = async () => {
  if (isDrawing) {
    //console.warn("busy drawing");
    drawWhenReady = true;
    return;
  }
  if (!displayCanvasHelper.spriteSheets["mySpriteSheet"]) {
    return;
  }
  isDrawing = true;

  //console.log("drawing...");

  await displayCanvasHelper.setSpriteScaleX(drawScaleX);
  await displayCanvasHelper.setSpriteScaleY(drawScaleY);
  await displayCanvasHelper.setRotation(drawRotation, false);
  await displayCanvasHelper.drawSprite(drawX, drawY, "svg");
  await displayCanvasHelper.show();
};

displayCanvasHelper.addEventListener("ready", () => {
  //console.log("ready");
  isDrawing = false;
  if (drawWhenReady) {
    drawWhenReady = false;
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

// SIZE

const checkSpriteSheetSizeButton = document.getElementById(
  "checkSpriteSheetSize"
);
const checkSpriteSheetSize = () => {
  const arrayBuffer = displayCanvasHelper.serializeSpriteSheet(spriteSheet);
  checkSpriteSheetSizeButton.innerText = `size: ${(
    arrayBuffer.byteLength / 1024
  ).toFixed(2)}kb`;
  if (displayCanvasHelper.device?.isConnected) {
    checkSpriteSheetSizeButton.innerText += ` (max ${(
      displayCanvasHelper.device.maxFileLength / 1024
    ).toFixed(2)}kb)`;
  }
};
checkSpriteSheetSizeButton.addEventListener("click", () => {
  checkSpriteSheetSize();
});
