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
  draw();
};
displayCanvasHelper.addEventListener("numberOfColors", () => setupColors());
displayCanvasHelper.addEventListener("color", (event) => {
  const { colorHex, colorIndex } = event.message;
  displayColorInputs[colorIndex].value = colorHex;
});
setupColors();

// TEXTAREA

/** @type {HTMLTextAreaElement} */
const textarea = document.getElementById("textarea");
textarea.addEventListener("input", () => {
  draw();
});

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
    return;
  }

  if (isDrawing) {
    //console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }
  isDrawing = true;

  const text = textarea.value;
  console.log(`drawing "${text}"`);

  const {
    verticalAlignment,
    horizontalAlignment,
    scaleX,
    scaleY,
    spritesSpacing,
    spritesLineSpacing,
    x,
    y,
    spritesLineHeight,
    rotation,
    spritesDirection,
    spritesLineDirection,
    spritesLineAlignment,
  } = drawSpriteParams;

  await displayCanvasHelper.setSpritesLineAlignment(spritesLineAlignment);
  await displayCanvasHelper.setSpritesDirection(spritesDirection);
  await displayCanvasHelper.setSpritesLineDirection(spritesLineDirection);
  await displayCanvasHelper.setVerticalAlignment(verticalAlignment);
  await displayCanvasHelper.setHorizontalAlignment(horizontalAlignment);
  await displayCanvasHelper.setSpriteScaleX(scaleX);
  await displayCanvasHelper.setSpriteScaleY(scaleY);
  await displayCanvasHelper.setRotation(rotation);
  await displayCanvasHelper.setSpritesSpacing(spritesSpacing);
  await displayCanvasHelper.setSpritesLineSpacing(spritesLineSpacing);
  await displayCanvasHelper.setSpritesLineHeight(spritesLineHeight);
  await displayCanvasHelper.selectSpriteColor(1, selectedColorIndex);
  await displayCanvasHelper.drawSpritesString(x, y, text);
  await displayCanvasHelper.show();
};

displayCanvasHelper.addEventListener("ready", () => {
  isDrawing = false;
  if (isWaitingToRedraw) {
    isWaitingToRedraw = false;
    draw();
  }
});

// DRAW PARAMS

const drawSpriteParams = {
  x: 50,
  y: 50,

  rotation: 0,

  verticalAlignment: "center",
  horizontalAlignment: "center",

  scaleX: 1,
  scaleY: 1,

  spritesLineHeight: 0,

  spritesSpacing: 0,
  spritesLineSpacing: 0,

  spritesAlignment: "end",
  spritesLineAlignment: "start",

  spritesDirection: "right",
  spritesLineDirection: "down",
};

const drawSpriteXContainer = document.getElementById("drawSpriteX");
const drawSpriteXInput = drawSpriteXContainer.querySelector("input");
const drawSpriteXSpan = drawSpriteXContainer.querySelector(".value");
const setSpriteDrawX = (drawSpriteX) => {
  drawSpriteXInput.value = drawSpriteX;
  drawSpriteXSpan.innerText = drawSpriteX;
  drawSpriteParams.x = drawSpriteX;
  draw();
};
setSpriteDrawX(Number(drawSpriteXInput.value));
drawSpriteXInput.addEventListener("input", () => {
  setSpriteDrawX(Number(drawSpriteXInput.value));
});

const drawSpriteYContainer = document.getElementById("drawSpriteY");
const drawSpriteYInput = drawSpriteYContainer.querySelector("input");
const drawSpriteYSpan = drawSpriteYContainer.querySelector(".value");
const setSpriteDrawY = (drawSpriteY) => {
  drawSpriteYInput.value = drawSpriteY;
  drawSpriteYSpan.innerText = drawSpriteY;
  drawSpriteParams.y = drawSpriteY;
  draw();
};
drawSpriteYInput.addEventListener("input", () => {
  setSpriteDrawY(Number(drawSpriteYInput.value));
});
setSpriteDrawY(Number(drawSpriteYInput.value));

const drawSpriteRotationContainer =
  document.getElementById("drawSpriteRotation");
const drawSpriteRotationInput =
  drawSpriteRotationContainer.querySelector("input");
const drawSpriteRotationSpan =
  drawSpriteRotationContainer.querySelector(".value");
const setSpriteDrawRotation = (drawSpriteRotation) => {
  drawSpriteRotationInput.value = drawSpriteRotation;
  drawSpriteRotationSpan.innerText = drawSpriteRotation;
  drawSpriteParams.rotation = drawSpriteRotation;
  draw();
};
drawSpriteRotationInput.addEventListener("input", () => {
  setSpriteDrawRotation(Number(drawSpriteRotationInput.value));
});

const drawSpriteHorizontalAlignmentContainer = document.getElementById(
  "drawSpriteHorizontalAlignment"
);
const drawSpriteHorizontalAlignmentSelect =
  drawSpriteHorizontalAlignmentContainer.querySelector("select");
const drawSpriteHorizontalAlignmentOptgroup =
  drawSpriteHorizontalAlignmentContainer.querySelector("optgroup");
BS.DisplayAlignments.forEach((horizontalAlignment) => {
  drawSpriteHorizontalAlignmentOptgroup.appendChild(
    new Option(horizontalAlignment)
  );
});
drawSpriteHorizontalAlignmentSelect.value =
  drawSpriteParams.horizontalAlignment;
const setSpriteDrawHorizontalAlignment = (drawSpriteHorizontalAlignment) => {
  console.log({ drawSpriteHorizontalAlignment });
  drawSpriteHorizontalAlignmentSelect.value = drawSpriteHorizontalAlignment;
  drawSpriteParams.horizontalAlignment = drawSpriteHorizontalAlignment;
  draw();
};
drawSpriteHorizontalAlignmentSelect.addEventListener("input", () => {
  setSpriteDrawHorizontalAlignment(drawSpriteHorizontalAlignmentSelect.value);
});

const drawSpriteVerticalAlignmentContainer = document.getElementById(
  "drawSpriteVerticalAlignment"
);
const drawSpriteVerticalAlignmentSelect =
  drawSpriteVerticalAlignmentContainer.querySelector("select");
const drawSpriteVerticalAlignmentOptgroup =
  drawSpriteVerticalAlignmentContainer.querySelector("optgroup");
BS.DisplayAlignments.forEach((verticalAlignment) => {
  drawSpriteVerticalAlignmentOptgroup.appendChild(
    new Option(verticalAlignment)
  );
});
drawSpriteVerticalAlignmentSelect.value = drawSpriteParams.verticalAlignment;
const setSpriteDrawVerticalAlignment = (drawSpriteVerticalAlignment) => {
  console.log({ drawSpriteVerticalAlignment });
  drawSpriteVerticalAlignmentSelect.value = drawSpriteVerticalAlignment;
  drawSpriteParams.verticalAlignment = drawSpriteVerticalAlignment;
  draw();
};
drawSpriteVerticalAlignmentSelect.addEventListener("input", () => {
  setSpriteDrawVerticalAlignment(drawSpriteVerticalAlignmentSelect.value);
});

const drawSpriteScaleXContainer = document.getElementById("drawSpriteScaleX");
const drawSpriteScaleXInput = drawSpriteScaleXContainer.querySelector("input");
const drawSpriteScaleXSpan = drawSpriteScaleXContainer.querySelector(".value");
const setSpriteDrawScaleX = (drawSpriteScaleX) => {
  drawSpriteScaleXInput.value = drawSpriteScaleX;
  drawSpriteScaleXSpan.innerText = drawSpriteScaleX;
  drawSpriteParams.scaleX = drawSpriteScaleX;
  draw();
};
drawSpriteScaleXInput.addEventListener("input", () => {
  setSpriteDrawScaleX(Number(drawSpriteScaleXInput.value));
});

const drawSpriteScaleYContainer = document.getElementById("drawSpriteScaleY");
const drawSpriteScaleYInput = drawSpriteScaleYContainer.querySelector("input");
const drawSpriteScaleYSpan = drawSpriteScaleYContainer.querySelector(".value");
const setSpriteDrawScaleY = (drawSpriteScaleY) => {
  drawSpriteScaleYInput.value = drawSpriteScaleY;
  drawSpriteScaleYSpan.innerText = drawSpriteScaleY;
  drawSpriteParams.scaleY = drawSpriteScaleY;
  draw();
};
drawSpriteScaleYInput.addEventListener("input", () => {
  setSpriteDrawScaleY(Number(drawSpriteScaleYInput.value));
});

const drawSpriteScaleContainer = document.getElementById("drawSpriteScale");
const drawSpriteScaleInput = drawSpriteScaleContainer.querySelector("input");
const drawSpriteScaleSpan = drawSpriteScaleContainer.querySelector(".value");
const setSpriteDrawScale = (drawSpriteScale) => {
  drawSpriteScaleInput.value = drawSpriteScale;
  drawSpriteScaleSpan.innerText = drawSpriteScale;

  drawSpriteScaleXInput.value = drawSpriteScale;
  drawSpriteScaleXSpan.innerText = drawSpriteScale;

  drawSpriteScaleYInput.value = drawSpriteScale;
  drawSpriteScaleYSpan.innerText = drawSpriteScale;

  drawSpriteParams.scaleX = drawSpriteScale;
  drawSpriteParams.scaleY = drawSpriteScale;
  draw();
};
drawSpriteScaleInput.addEventListener("input", () => {
  setSpriteDrawScale(Number(drawSpriteScaleInput.value));
});

const drawSpritesDirectionContainer = document.getElementById(
  "drawSpritesDirection"
);
const drawSpritesDirectionSelect =
  drawSpritesDirectionContainer.querySelector("select");
const drawSpritesDirectionOptgroup =
  drawSpritesDirectionContainer.querySelector("optgroup");
BS.DisplayDirections.forEach((horizontalAlignment) => {
  drawSpritesDirectionOptgroup.appendChild(new Option(horizontalAlignment));
});
drawSpritesDirectionSelect.value = drawSpriteParams.spritesDirection;
const setSpritesDirection = (drawSpritesDirection) => {
  console.log({ drawSpritesDirection });
  drawSpritesDirectionSelect.value = drawSpritesDirection;
  drawSpriteParams.spritesDirection = drawSpritesDirection;
  draw();
};
drawSpritesDirectionSelect.addEventListener("input", () => {
  setSpritesDirection(drawSpritesDirectionSelect.value);
});

const drawSpritesLineDirectionContainer = document.getElementById(
  "drawSpritesLineDirection"
);
const drawSpritesLineDirectionSelect =
  drawSpritesLineDirectionContainer.querySelector("select");
const drawSpritesLineDirectionOptgroup =
  drawSpritesLineDirectionContainer.querySelector("optgroup");
BS.DisplayDirections.forEach((horizontalAlignment) => {
  drawSpritesLineDirectionOptgroup.appendChild(new Option(horizontalAlignment));
});
drawSpritesLineDirectionSelect.value = drawSpriteParams.spritesLineDirection;
const setSpritesLineDirection = (drawSpritesLineDirection) => {
  console.log({ drawSpritesLineDirection });
  drawSpritesLineDirectionSelect.value = drawSpritesLineDirection;
  drawSpriteParams.spritesLineDirection = drawSpritesLineDirection;
  if (shouldDrawAllSprites) {
    draw();
  }
};
drawSpritesLineDirectionSelect.addEventListener("input", () => {
  setSpritesLineDirection(drawSpritesLineDirectionSelect.value);
});

const drawSpritesLineAlignmentContainer = document.getElementById(
  "drawSpritesLineAlignment"
);
const drawSpritesLineAlignmentSelect =
  drawSpritesLineAlignmentContainer.querySelector("select");
const drawSpritesLineAlignmentOptgroup =
  drawSpritesLineAlignmentContainer.querySelector("optgroup");
BS.DisplayAlignments.forEach((horizontalAlignment) => {
  drawSpritesLineAlignmentOptgroup.appendChild(new Option(horizontalAlignment));
});
drawSpritesLineAlignmentSelect.value = drawSpriteParams.spritesLineAlignment;
const setSpritesLineAlignment = (drawSpritesLineAlignment) => {
  console.log({ drawSpritesLineAlignment });
  drawSpritesLineAlignmentSelect.value = drawSpritesLineAlignment;
  drawSpriteParams.spritesLineAlignment = drawSpritesLineAlignment;
  draw();
};
drawSpritesLineAlignmentSelect.addEventListener("input", () => {
  setSpritesLineAlignment(drawSpritesLineAlignmentSelect.value);
});

const drawSpritesSpacingContainer =
  document.getElementById("drawSpritesSpacing");
const drawSpritesSpacingInput =
  drawSpritesSpacingContainer.querySelector("input");
const drawSpritesSpacingSpan =
  drawSpritesSpacingContainer.querySelector(".value");
const setSpritesSpacing = (drawSpritesSpacing) => {
  drawSpritesSpacingInput.value = drawSpritesSpacing;
  drawSpritesSpacingSpan.innerText = drawSpritesSpacing;
  drawSpriteParams.spritesSpacing = drawSpritesSpacing;
  console.log({ drawSpritesSpacing });
  draw();
};
drawSpritesSpacingInput.addEventListener("input", () => {
  setSpritesSpacing(Number(drawSpritesSpacingInput.value));
});

const drawSpritesLineSpacingContainer = document.getElementById(
  "drawSpritesLineSpacing"
);
const drawSpritesLineSpacingInput =
  drawSpritesLineSpacingContainer.querySelector("input");
const drawSpritesLineSpacingSpan =
  drawSpritesLineSpacingContainer.querySelector(".value");
const setSpritesLineSpacing = (drawSpritesLineSpacing) => {
  drawSpritesLineSpacingInput.value = drawSpritesLineSpacing;
  drawSpritesLineSpacingSpan.innerText = drawSpritesLineSpacing;
  drawSpriteParams.spritesLineSpacing = drawSpritesLineSpacing;
  console.log({ drawSpritesLineSpacing });
  draw();
};
drawSpritesLineSpacingInput.addEventListener("input", () => {
  setSpritesLineSpacing(Number(drawSpritesLineSpacingInput.value));
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
drawSpriteParams.spritesLineHeight = fontSize;
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
    await updateFontSelect();
    await selectFont(fullName);
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
  selectFontSelect.value = newFontName;
  await displayCanvasHelper.uploadSpriteSheet(
    englishFontSpriteSheets[newFontName],
    true
  );
  await draw();
};

// DRAGOVER
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

didLoad = true;
