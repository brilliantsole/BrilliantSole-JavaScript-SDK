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
  const svgString = image.src;
  console.log({ svgString, overrideColors });
  const sprite = await BS.svgToSprite(
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
      displayManager: displayCanvasHelper,
      includeText: true,
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
const selectFont = async (newFontName) => {
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

didLoad = true;

image.src = "./music.svg";
