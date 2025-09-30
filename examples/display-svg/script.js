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
  if (!isValidUrl(string)) {
    return;
  }
  image.src = string;
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
  console.log({ drawX });
  drawXSpan.innerText = drawX;
  draw();
});

const drawYContainer = document.getElementById("drawY");
const drawYInput = drawYContainer.querySelector("input");
const drawYSpan = drawYContainer.querySelector("span.value");
let drawY = Number(drawYInput.value);

drawYInput.addEventListener("input", () => {
  drawY = Number(drawYInput.value);
  console.log({ drawY });
  drawYSpan.innerText = drawY;
  draw();
});

// FILL - rotation, input height/width, svg scaleX/Y, etc

let overridePalette = false;
const overridePaletteInput = document.getElementById("overridePalette");
overridePaletteInput.addEventListener("input", () => {
  overridePalette = overridePaletteInput.checked;
  _console.log({ overridePalette });
  createSvgSpriteSheet();
});
overridePalette = overridePaletteInput.checked;

// PIXEL DEPTH

let pixelDepth = BS.DisplayPixelDepths[2];
const setPixelDepth = (newPixelDepth) => {
  pixelDepth = newPixelDepth;
  console.log({ pixelDepth });
  createSvgSpriteSheet();
};
const pixelDepthSelect = document.getElementById("pixelDepth");
const pixelDepthOptgroup = pixelDepthSelect.querySelector("optgroup");
pixelDepthSelect.addEventListener("input", () => {
  setPixelDepth(pixelDepthSelect.value);
});
BS.DisplayPixelDepths.forEach((pixelDepth) => {
  pixelDepthOptgroup.appendChild(
    new Option(
      `${BS.pixelDepthToNumberOfColors(pixelDepth)} colors`,
      pixelDepth
    )
  );
});
pixelDepthSelect.value = pixelDepth;

// SVG

function getSvgStringFromDataUrl(img) {
  if (!img.src.startsWith("data:image/svg+xml"))
    throw new Error("Not a data URL");

  // Data URL might be base64 or URI encoded
  const data = img.src.split(",")[1];
  if (img.src.includes("base64")) {
    return atob(data);
  } else {
    return decodeURIComponent(data);
  }
}

const createSvgSpriteSheet = async () => {
  if (!image.src) {
    return;
  }
  console.log("createSvgSpriteSheet", image.src);
  const svgString = getSvgStringFromDataUrl(image);
  console.log({ svgString });
  const sprite = BS.svgToSprite(
    svgString,
    "svg",
    "svg",
    overridePalette,
    spriteSheet,
    {
      height: 200,
      // FILL
    }
  );
  console.log("sprite", sprite);
  await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  await displayCanvasHelper.selectSpriteSheet("mySpriteSheet");
  // FILL - update colors
  await draw();
};

// DRAW
let isDrawing = false;
/** @type {BS.DisplaySpriteSheet} */
const spriteSheet = {
  name: "mySpriteSheet",
  sprites: [],
  palettes: [],
};
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

  console.log("drawing...");

  // FILL - rotation, scale, etc
  await displayCanvasHelper.drawSprite(drawX, drawY, "svg");
  await displayCanvasHelper.show();
};

displayCanvasHelper.addEventListener("ready", () => {
  console.log("ready");
  isDrawing = false;
  if (drawWhenReady) {
    drawWhenReady = false;
    //draw();
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

displayCanvasHelper.setFillBackground(true);
displayCanvasHelper.selectSpriteColor(1, 1, true);
displayCanvasHelper.selectBackgroundColor(2);
