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
/** @type {HTMLInputElement[]} */
const displayColorRadios = [];
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

    /** @type {HTMLInputElement} */
    const colorRadio = displayColorContainer.querySelector(".radio");
    displayColorRadios[colorIndex] = colorInput;
    colorRadio.addEventListener("input", () => {
      selectColorIndex(colorIndex);
    });

    if (colorIndex == selectedColorIndex) {
      colorRadio.checked = true;
      setDisplayColor(colorIndex, "#ffffff");
    }

    displayColorsContainer.appendChild(displayColorContainer);
  }
};
let selectedColorIndex = 1;
const selectColorIndex = async (newColorIndex) => {
  selectedColorIndex = newColorIndex;
  displayColorRadios[selectedColorIndex].checked = true;
  console.log({ selectedColorIndex });
  drawText();
};
displayCanvasHelper.addEventListener("numberOfColors", () => setupColors());
displayCanvasHelper.addEventListener("color", (event) => {
  const { colorHex, colorIndex } = event.message;
  displayColorInputs[colorIndex].value = colorHex;
});
setupColors();

// DRAW PARAMS

const drawXContainer = document.getElementById("drawX");
const drawXInput = drawXContainer.querySelector("input");
const drawXSpan = drawXContainer.querySelector("span.value");
let drawX = Number(drawXInput.value);

drawXInput.addEventListener("input", () => {
  drawX = Number(drawXInput.value);
  // console.log({ drawX });
  drawXSpan.innerText = drawX;
});
drawXInput.addEventListener("input", () => {
  drawText();
});

const drawYContainer = document.getElementById("drawY");
const drawYInput = drawYContainer.querySelector("input");
const drawYSpan = drawYContainer.querySelector("span.value");
let drawY = Number(drawYInput.value);

drawYInput.addEventListener("input", () => {
  drawY = Number(drawYInput.value);
  //console.log({ drawY });
  drawYSpan.innerText = drawY;
});
drawYInput.addEventListener("input", () => {
  drawText();
});

const drawLineSpacingContainer = document.getElementById("drawLineSpacing");
const drawLineSpacingInput = drawLineSpacingContainer.querySelector("input");
const drawLineSpacingSpan =
  drawLineSpacingContainer.querySelector("span.value");
let drawLineSpacing = Number(drawLineSpacingInput.value);

drawLineSpacingInput.addEventListener("input", () => {
  drawLineSpacing = Number(drawLineSpacingInput.value);
  //console.log({ drawLineSpacing });
  drawLineSpacingSpan.innerText = drawLineSpacing;
});
drawLineSpacingInput.addEventListener("input", () => {
  drawText();
});

const drawScaleContainer = document.getElementById("drawScale");
const drawScaleInput = drawScaleContainer.querySelector("input");
const drawScaleSpan = drawScaleContainer.querySelector("span.value");

drawScaleInput.addEventListener("input", () => {
  const drawScale = Number(drawScaleInput.value);
  //console.log({ drawScale });
  drawScaleSpan.innerText = drawScale;

  drawScaleYInput.value = drawScale;
  drawScaleYSpan.innerText = drawScale;

  drawScaleXInput.value = drawScale;
  drawScaleXSpan.innerText = drawScale;

  drawScaleX = drawScale;
  drawScaleY = drawScale;

  drawText();
});
drawScaleInput.addEventListener("input", () => {
  drawText();
});

const drawScaleXContainer = document.getElementById("drawScaleX");
const drawScaleXInput = drawScaleXContainer.querySelector("input");
const drawScaleXSpan = drawScaleXContainer.querySelector("span.value");
let drawScaleX = Number(drawScaleXInput.value);

drawScaleXInput.addEventListener("input", () => {
  drawScaleX = Number(drawScaleXInput.value);
  //console.log({ drawScaleX });
  drawScaleXSpan.innerText = drawScaleX;
});
drawScaleXInput.addEventListener("input", () => {
  drawText();
});

const drawScaleYContainer = document.getElementById("drawScaleY");
const drawScaleYInput = drawScaleYContainer.querySelector("input");
const drawScaleYSpan = drawScaleYContainer.querySelector("span.value");
let drawScaleY = Number(drawScaleYInput.value);

drawScaleYInput.addEventListener("input", () => {
  drawScaleY = Number(drawScaleYInput.value);
  //console.log({ drawScaleY });
  drawScaleYSpan.innerText = drawScaleY;
});
drawScaleYInput.addEventListener("input", () => {
  drawText();
});

const textAlignSelect = document.getElementById("textAlign");
let textAlign = textAlignSelect.value;

textAlignSelect.addEventListener("input", () => {
  textAlign = textAlignSelect.value;
  console.log({ textAlign });
  drawText();
});
console.log({ textAlign });

// DRAW
let defaultMaxFileLength = 10 * 1024; // 10kb
let isDrawing = false;
let isWaitingToRedraw = false;

const drawText = async () => {
  if (isDrawing) {
    //console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }
  isDrawing = true;

  const text = textarea.value;
  console.log(`drawing "${text}"`);

  let x = drawX;
  let y = drawY;
  let lineSpacing = drawLineSpacing;
  let scaleX = drawScaleX;
  let scaleY = drawScaleY;

  await displayCanvasHelper.setSpriteScaleX(scaleX);
  await displayCanvasHelper.setSpriteScaleY(scaleY);
  await displayCanvasHelper.selectSpriteColor(1, selectedColorIndex);

  /** @type {BS.DisplaySprite} */
  const sprites = [];

  const textLineWidths = [0];
  let textLineIndex = 0;

  for (let i in text) {
    const char = text[i];
    // console.log(char);

    if (char == `\n`) {
      textLineWidths.push(0);
      textLineIndex++;
      continue;
    }

    let sprite = displayCanvasHelper.spriteSheets["english"].sprites.find(
      (sprite) => sprite.name == char
    );
    const isEnglish = sprite != undefined;

    if (!isEnglish) {
      // FILL - add to nonEnglish sprites
    }

    if (!sprite) {
      console.error(`no sprite found for char "${char}"`);
      continue;
    }

    textLineWidths[textLineIndex] += sprite.width * scaleX;

    sprites[i] = sprite;
  }

  // console.log("textLineWidths", textLineWidths);
  textLineIndex = 0;
  let maxTextLineWidth = 0;
  textLineWidths.forEach((textLineWidth) => {
    maxTextLineWidth = Math.max(maxTextLineWidth, textLineWidth);
  });

  const textLineWidth = textLineWidths[0];
  x = drawX;
  switch (textAlign) {
    case "left":
      break;
    case "center":
      x -= textLineWidth / 2;
      break;
    case "right":
      x -= textLineWidth;
      break;
  }

  for (let i in text) {
    const char = text[i];
    if (char == `\n`) {
      y += lineSpacing * scaleY;
      textLineIndex++;
      const textLineWidth = textLineWidths[textLineIndex];
      x = drawX;
      switch (textAlign) {
        case "left":
          break;
        case "center":
          x -= textLineWidth / 2;
          break;
        case "right":
          x -= textLineWidth;
          break;
      }
      continue;
    }

    const sprite = sprites[i];
    if (!sprite) {
      console.error(`no sprite found for char "${char}"`);
      continue;
    }

    const isEnglish =
      displayCanvasHelper.spriteSheets["english"].sprites.includes(sprite);

    x += (sprite.width * scaleX) / 2;

    if (isEnglish) {
      await displayCanvasHelper.selectSpriteSheet("english");
      await displayCanvasHelper.drawSprite(x, y, char, false);
    } else {
      // FILL - use other sprites
      // await displayCanvasHelper.drawSpriteFromSpriteSheet(
      //   x,
      //   y,
      //   char,
      //   nonEnglishSpriteSheet,
      //   false
      // );
    }

    x += (sprite.width * scaleX) / 2;
  }

  await displayCanvasHelper.show();
};

displayCanvasHelper.addEventListener("ready", () => {
  isDrawing = false;
  if (isWaitingToRedraw) {
    isWaitingToRedraw = false;
    drawText();
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

// FONTS

/** @type {HTMLInputElement} */
const loadFontInput = document.getElementById("loadFont");
loadFontInput.addEventListener("input", async () => {
  for (let i = 0; i < loadFontInput.files.length; i++) {
    const file = loadFontInput.files[i];
    if (!file) {
      continue;
    }
    console.log(file, loadFontInput.files);
    const arrayBuffer = await file.arrayBuffer();
    await loadFont(arrayBuffer);
  }
  loadFontInput.value = "";
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

const loadFont = async (arrayBuffer) => {
  if (!arrayBuffer) {
    return;
  }
  const font = await BS.parseFont(arrayBuffer);
  if (font) {
    await addFont(font);
  }
};

/** @type {Object.<string, BS.Font[]>} */
const fonts = {};
/** @type {Object.<string, BS.Font[]>} */
const englishFonts = {};
/** @type {Object.<string, BS.DisplaySpriteSheet[]>} */
const englishFontSpriteSheets = {};
window.englishFontSpriteSheets = englishFontSpriteSheets;

/** @type {Map.<BS.Font, {min: number, max: number}>} */
const fontUnicodeRanges = new Map();
const fontSize = 36;
window.fonts = fonts;
/** @param {BS.Font} font */
const addFont = async (font) => {
  const range = BS.getFontUnicodeRange(font);
  if (!range) {
    return;
  }
  fontUnicodeRanges.set(font, range);

  const fullName = font.getEnglishName("fullName");

  fonts[fullName] = fonts[fullName] || [];
  fonts[fullName].push(font);

  console.log(`added font "${fullName}"`, range);

  const isEnglish = range.min <= 65 && range.max >= 122;
  if (isEnglish) {
    7;
    englishFonts[fullName] = englishFonts[fullName] || [];
    englishFonts[fullName].push(font);
    console.log(`added english font "${fullName}"`);

    const spriteSheet = await displayCanvasHelper.fontToSpriteSheet(
      font,
      fontSize,
      "english"
    );
    englishFontSpriteSheets[fullName] = spriteSheet;
    console.log(`added english font spriteSheet "${fullName}"`, spriteSheet);
    updateFontSelect();
  }
};

/** @type {HTMLSelectElement} */
const selectFontSelect = document.getElementById("selectFont");
const selectFontOptgroup = selectFontSelect.querySelector("optgroup");
const updateFontSelect = async () => {
  selectFontOptgroup.innerHTML = "";
  for (const fullName in englishFonts) {
    selectFontOptgroup.appendChild(new Option(fullName));
  }
  if (!selectedFont) {
    await selectFont(selectFontSelect.value);
  }
};

selectFontSelect.addEventListener("input", async () => {
  const fontName = selectFontSelect.value;
  await selectFont(fontName);
});

/** @type {BS.Font?} */
let selectedFont;
const selectFont = async (newFontName) => {
  const newFont = englishFonts[newFontName][0];
  selectedFont = newFont;
  console.log(`selected font "${newFontName}"`, selectedFont);
  await displayCanvasHelper.uploadSpriteSheet(
    englishFontSpriteSheets[newFontName],
    true
  );
  await drawText();
};

// TEXTAREA

/** @type {HTMLTextAreaElement} */
const textarea = document.getElementById("textarea");

textarea.addEventListener("input", () => {
  drawText();
});

const checkTextareaCursorPosition = () => {
  const { selectionStart, selectionEnd, selectionDirection } = textarea;
  console.log({ selectionStart, selectionEnd, selectionDirection });
};
textarea.addEventListener("keyup", () => {
  checkTextareaCursorPosition();
});
textarea.addEventListener("mouseup", () => {
  checkTextareaCursorPosition();
});

// INITIAL FONTS

await loadFontUrl("https://fonts.googleapis.com/css2?family=Roboto");
await loadFontUrl("https://fonts.googleapis.com/css2?family=Mozilla+Text");
await loadFontUrl("https://fonts.googleapis.com/css2?family=Inter");
// await loadFontUrl(
//   "https://fonts.googleapis.com/css2?family=Noto+Sans+JP",
//   false
// );
// await loadFontUrl(
//   "https://fonts.googleapis.com/css2?family=Noto+Sans+KR",
//   false
// );
// await loadFontUrl(
//   "https://fonts.googleapis.com/css2?family=Noto+Sans+SC",
//   false
// );
