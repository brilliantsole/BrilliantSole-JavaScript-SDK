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
displayCanvasHelper.setColor(getTextColorIndex(), "white");
const cursorColor = "#009900";
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
    console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }
  isDrawing = true;

  await displayCanvasHelper.setVerticalAlignment("start");
  await displayCanvasHelper.setHorizontalAlignment("start");
  if (showCursor) {
    for (let i = 0; i < displayCanvasHelper.numberOfColors; i++) {
      await displayCanvasHelper.selectSpriteColor(i, i);
    }
  } else {
    for (let i = 0; i < 2; i++) {
      await displayCanvasHelper.selectSpriteColor(i, i);
    }
  }

  let drawnCursorIndex = 0;
  drawnCursors.length = 0;

  const spriteX = (displayCanvasHelper.width - osmdWidth) / 2;
  let spriteY = 0;
  for (let i = 0; i < systemsPerDisplay; i++) {
    const systemIndex = currentSystemIndex + i;
    const x = -osmdWidth / 2;

    const spriteSheet = spriteSheets[systemIndex];
    if (!spriteSheet) {
      continue;
    }
    const height = spriteSheet.sprites[0].height;

    console.log({ spriteX, spriteY });
    await displayCanvasHelper.startSprite(spriteX, spriteY, osmdWidth, height);

    let y = -height / 2;

    await displayCanvasHelper.setVerticalAlignment("start");
    await displayCanvasHelper.setHorizontalAlignment("start");

    let cursorsToDraw = cursors.filter(
      (cursor) => cursor.systemIndex == systemIndex
    );
    if (cursorsToDraw.includes(currentCursor)) {
      cursorsToDraw = cursorsToDraw.slice(cursorsToDraw.indexOf(currentCursor));
    } else if (drawnCursorIndex == 0) {
      cursorsToDraw.length = 0;
    }

    console.log("cursorsToDraw", cursorsToDraw);
    for (
      let cursorIndex = 0;
      cursorIndex < cursorsToDraw.length &&
      drawnCursorIndex + 2 < displayCanvasHelper.numberOfColors;
      cursorIndex++, drawnCursorIndex++
    ) {
      const spriteSheet = spriteSheets[systemIndex];
      if (!spriteSheet) {
        continue;
      }

      const cursor = cursorsToDraw[cursorIndex];
      const colorIndex = 2 + drawnCursorIndex;
      drawnCursors[colorIndex] = cursor;
      const { x: offsetX, width, height } = cursor.rect;
      const { localY: offsetY } = cursor;
      // console.log("drawing cursor", {
      //   width,
      //   height,
      //   x,
      //   y,
      //   offsetX,
      //   offsetY,
      // });
      //console.log({ drawnCursorIndex, colorIndex: 2 + drawnCursorIndex });
      await displayCanvasHelper.selectFillColor(colorIndex);
      await displayCanvasHelper.drawRect(
        x + offsetX,
        y + offsetY,
        width,
        height
      );
    }

    await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
    await displayCanvasHelper.drawSprite(x, y, "svg");
    spriteY += height;

    await displayCanvasHelper.endSprite();
  }

  latestDrawTime = Date.now();
  if (currentCursor && drawnCursors.includes(currentCursor)) {
    await displayCanvasHelper.setColor(
      drawnCursors.indexOf(currentCursor),
      cursorColor
    );
  }
  await displayCanvasHelper.show();
};
window.draw = draw;
let latestDrawTime = 0;

displayCanvasHelper.addEventListener("ready", async () => {
  const now = Date.now();
  console.log(`drawTime: ${now - latestDrawTime}ms`);

  isDrawing = false;
  if (isWaitingToRedraw) {
    isWaitingToRedraw = false;
    await draw();
  }
  if (updateCurrentTime) {
    updateCurrentTime = false;
    onCurrentTimeUpdate();
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

/** @type {HTMLInputElement} */
const loadMusicXMLInput = document.getElementById("loadMusicXML");
loadMusicXMLInput.addEventListener("input", async () => {
  const file = loadMusicXMLInput.files[0];
  console.log("file", file);
  if (file) {
    await loadMusicXMLFile(file);
  }
  loadMusicXMLInput.value = "";
});

function isValidXml(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");

  // Parsing errors appear inside a <parsererror> element
  const errorNode = doc.querySelector("parsererror");

  return !errorNode;
}

const validMusicXMLExtensions = loadMusicXMLInput.accept.split(",");
console.log("validMusicXMLExtensions", validMusicXMLExtensions);
window.addEventListener("paste", async (event) => {
  const text = event.clipboardData.getData("text");
  if (!text || text.length == 0) {
    return;
  }
  console.log("paste", { text });

  if (isValidXml(text)) {
    await loadOsmd(text);
    return;
  }

  if (isValidUrl(text)) {
    if (validMusicXMLExtensions.some((extension) => text.endsWith(extension))) {
      await loadOsmd(text);
      return;
    }
  }
});
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log("item", item);
    if (item.kind == "file") {
      const file = item.getAsFile();
      console.log("file:", file);
      await loadMusicXMLFile(file);
    }
  }
});

const loadMusicXMLFile = async (file) => {
  if (
    validMusicXMLExtensions.some((extension) => file.name.endsWith(extension))
  ) {
    const reader = new FileReader();
    reader.onload = async (response) => {
      await loadOsmd(response.target.result);
    };

    if (file.name.endsWith(".mxl")) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  }
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
    loadMusicXMLFile(file);
  }
});

// SIZE

const checkSpriteSheetSizeButton = document.getElementById(
  "checkSpriteSheetSize"
);
const checkSpriteSheetSize = () => {
  if (!displayCanvasHelper.selectedSpriteSheet) {
    return;
  }
  const arrayBuffer = displayCanvasHelper.serializeSpriteSheet(
    displayCanvasHelper.selectedSpriteSheet
  );
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
    //console.log("item.type", item.type);
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
  //await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
  await displayCanvasHelper.setSpritesLineHeight(spritesLineHeight);
  await draw();
};

displayCanvasHelper.addEventListener("deviceUpdated", () => {
  draw();
});

await loadFontUrl("https://fonts.googleapis.com/css2?family=Noto+Serif");

// OPEN SHEET MUSIC DISPLAY

const osmdContainer = document.getElementById("osmd");
displayCanvasHelper.addEventListener("resize", () => {
  const { width, height } = displayCanvasHelper;
  osmdContainer.style.width = `${width}px`;
  osmdContainer.style.height = `${height}px`;
});
/** @type {import("../utils/opensheetmusicdisplay/opensheetmusicdisplay.js")} */
let OpenSheetMusicDisplay = opensheetmusicdisplay;
const osmd = new OpenSheetMusicDisplay.OpenSheetMusicDisplay(osmdContainer, {
  backend: "svg",
  autoResize: false,
  drawingParameters: "compacttight",

  darkMode: true,
  // defaultColorMusic: "white", // notes, stems, beams, slurs
  // pageBackgroundColor: "black",

  drawMeasureNumbers: false,
  drawLyrics: false,
  drawSlurs: false,
  drawTimeSignatures: false,
});
window.osmd = osmd;

//osmd.setOptions({ drawFromMeasureNumber: 1, drawUpToMeasureNumber: 3 });

let isLoading = false;
const loadOsmd = async (content) => {
  isLoading = true;
  for (let i = 2; i < displayCanvasHelper.numberOfColors; i++) {
    await displayCanvasHelper.setColor(i, "black");
  }
  await displayCanvasHelper.flushContextCommands();
  console.log("loadOsmd");
  await osmd.load(content);
  updateOsmdTitle();

  updateShowCursor();

  updateOsmdInstrument();
  setOsmdInstrumentIndex(0);

  setOsmdSystemIndex(0);
  setOsmdZoom(Number(osmdZoomInput.value));

  await renderOsmd(true);
  isLoading = false;
};

let isRendering = false;
let isWaitingToRender = false;
const renderOsmd = async () => {
  if (isRendering) {
    console.warn("already rendering osmd");
    isWaitingToRender = true;
    return;
  }
  isRendering = true;

  console.log("renderOsmd");

  osmdContainer.style.width = osmdWidth;

  const rules = osmd.EngravingRules;
  rules.PageLeftMargin = 0;
  rules.PageRightMargin = 0;
  rules.PageTopMargin = 0; // optional
  rules.PageBottomMargin = 0; // optional
  rules.RenderTempoMarks = false;
  rules.RenderMetronomeMarks = false; // hides ♪ = 120
  rules.RenderRehearsalMarks = false; // hides A, B, C boxes
  rules.RenderWordsAboveStaff = false;

  rules.RepetitionAllowFirstMeasureBeginningRepeatBarline = false;

  rules.RenderExpressions = false; // “Zart”, “dolce”, etc.
  rules.RenderTempoMarks = false; // Allegro, ♩=120
  rules.RenderDynamics = false; // p, mf, ff

  rules.RenderArpeggios = false;
  rules.RenderFirstTempoExpression = false;
  rules.PageTopMarginNarrow = 0;

  osmd.render();
  updateShowCursor();
  updateOsmdSystem();
  updateOsmdZoom();
  updateOsmdWidth();
  updateCursorMetadata();
  updateMaxTime();
  setCurrentTime(0, false);
  spriteSheets.length = 0;
  for (let systemIndex = 0; systemIndex < numberOfSystems; systemIndex++) {
    //getSystemMetrics(0, systemIndex);
    await createOsmdSystemSpriteSheet(systemIndex);
  }

  await draw();

  isRendering = false;
  if (isWaitingToRender) {
    isWaitingToRender = false;
    await renderOsmd();
  }
};

const osmdTitleContainer = document.getElementById("osmdTitle");
const osmdTitleSpan = osmdTitleContainer.querySelector(".title");
const updateOsmdTitle = () => {
  osmdTitleContainer.classList.remove("hidden");
  osmdTitleSpan.innerText = osmd.Sheet?.TitleString;
};

let numberOfSystems = 0;
let currentSystemIndex = 0;
const osmdSystemContainer = document.getElementById("osmdSystem");
const osmdSystemValueSpan = osmdSystemContainer.querySelector(".value");
const osmdSystemTotalSpan = osmdSystemContainer.querySelector(".total");
const osmdSystemInput = osmdSystemContainer.querySelector("input");
const updateOsmdSystem = () => {
  numberOfSystems = osmd.GraphicSheet?.MusicPages[0].MusicSystems.length;
  console.log({ numberOfSystems });
  osmdSystemTotalSpan.innerText = numberOfSystems - 1;
  osmdSystemInput.max = numberOfSystems - 1;

  osmdSystemContainer.classList.remove("hidden");
};
const setOsmdSystemIndex = async (newIndex, render = false) => {
  currentSystemIndex = newIndex;
  currentSystemIndex = Math.max(
    0,
    Math.min(currentSystemIndex, numberOfSystems - 1)
  );
  console.log({
    currentSystemIndex,
    render,
  });
  osmdSystemInput.value = currentSystemIndex;
  osmdSystemValueSpan.innerText = currentSystemIndex;

  if (render) {
    await renderOsmd();
  } else if (spriteSheets.length > 0) {
    await draw();
  }
};
const goToNextSystemIndex = (offByOne = false, loop = true) => {
  let newSystemIndex = currentSystemIndex + (offByOne ? 1 : systemsPerDisplay);
  if (newSystemIndex >= numberOfSystems) {
    if (loop) {
      setOsmdSystemIndex(0);
    }
    return;
  }

  newSystemIndex = Math.min(newSystemIndex, numberOfSystems - 1);
  if (newSystemIndex != currentSystemIndex) {
    setOsmdSystemIndex(newSystemIndex);
  }
};
const goToPreviousSystemIndex = () => {
  const newSystemIndex = Math.max(currentSystemIndex - systemsPerDisplay, 0);
  if (newSystemIndex != currentSystemIndex) {
    setOsmdSystemIndex(newSystemIndex);
  }
};
document.addEventListener("keydown", (event) => {
  console.log(event.key);
  switch (event.key) {
    case "ArrowRight":
      goToNextSystemIndex();
      break;
    case "ArrowLeft":
      goToPreviousSystemIndex();
      break;
  }
});
osmdSystemInput.addEventListener("input", () => {
  setOsmdSystemIndex(Number(osmdSystemInput.value), false);
});

let systemsPerDisplay = 2;
const osmdSystemsPerDisplayContainer = document.getElementById(
  "osmdSystemsPerDisplay"
);
const osmdSystemsPerDisplayInput =
  osmdSystemsPerDisplayContainer.querySelector("input");
osmdSystemsPerDisplayInput.addEventListener("input", (event) => {
  setSystemsPerDisplay(Number(event.target.value));
});
const setSystemsPerDisplay = async (newSystemsPerDisplay) => {
  systemsPerDisplay = newSystemsPerDisplay;
  console.log({ systemsPerDisplay });
  osmdSystemInput.step = systemsPerDisplay;
  osmdSystemsPerDisplayInput.value = systemsPerDisplay;
  await draw();
};
osmdSystemInput.step = systemsPerDisplay;
osmdSystemsPerDisplayInput.value = systemsPerDisplay;

let currentOsmdInstrumentIndex = 0;
const osmdInstrumentContainer = document.getElementById("osmdInstrument");
const osmdInstrumentSelect = osmdInstrumentContainer.querySelector("select");
const osmdInstrumentOptgroup = osmdInstrumentSelect.querySelector("optgroup");
const updateOsmdInstrument = () => {
  osmdInstrumentOptgroup.innerHTML = "";
  osmd.Sheet.Instruments.forEach((instrument, index) => {
    const { Name, IdString } = instrument;
    osmdInstrumentOptgroup.appendChild(
      new Option(`${Name} (${IdString})`, index)
    );
  });

  osmdInstrumentContainer.classList.remove("hidden");
};
const setOsmdInstrumentIndex = async (newInstrumentIndex, render = false) => {
  currentOsmdInstrumentIndex = newInstrumentIndex;
  console.log({ currentOsmdInstrumentIndex });
  osmdInstrumentSelect.value = currentOsmdInstrumentIndex;
  console.log("updated", osmdInstrumentSelect.value);

  osmd.Sheet.Instruments.forEach((instrument, index) => {
    instrument.Visible = index == currentOsmdInstrumentIndex;
  });

  if (render) {
    await renderOsmd();
  }
};
osmdInstrumentSelect.addEventListener("input", () => {
  setOsmdInstrumentIndex(Number(osmdInstrumentSelect.value), true);
});

const osmdZoomContainer = document.getElementById("osmdZoom");
const osmdZoomValueSpan = osmdZoomContainer.querySelector(".value");
const osmdZoomInput = osmdZoomContainer.querySelector("input");
const updateOsmdZoom = () => {
  osmdZoomInput.value = osmd.Zoom;
  osmdZoomValueSpan.innerText = osmd.Zoom;
  console.log({ zoom: osmd.Zoom });
  osmdZoomContainer.classList.remove("hidden");
};
const setOsmdZoom = async (newZoom, render = false) => {
  osmd.Zoom = newZoom;
  console.log({ zoom: osmd.Zoom });
  osmdZoomInput.value = osmd.Zoom;
  osmdZoomValueSpan.innerText = osmd.Zoom;

  if (render) {
    await renderOsmd();
  }
};
osmdZoomInput.addEventListener("input", () => {
  setOsmdZoom(Number(osmdZoomInput.value), true);
});

let osmdWidth = 640;
const osmdWidthContainer = document.getElementById("osmdWidth");
const osmdWidthValueSpan = osmdWidthContainer.querySelector(".value");
const osmdWidthInput = osmdWidthContainer.querySelector("input");
const updateOsmdWidth = () => {
  osmdWidthInput.value = osmdWidth;
  osmdWidthValueSpan.innerText = osmdWidth;
  console.log({ osmdWidth });
};
const setOsmdWidth = async (newWidth, render = false) => {
  osmdWidth = newWidth;
  console.log({ osmdWidth });
  osmdWidthInput.value = osmdWidth;
  osmdWidthValueSpan.innerText = osmdWidth;

  if (render) {
    await renderOsmd();
  }
};
osmdWidthInput.addEventListener("input", () => {
  setOsmdWidth(Number(osmdWidthInput.value), true);
});
setOsmdWidth(osmdWidth);

// SHOW CURSOR
let showCursor = false;
const showCursorContainer = document.getElementById("osmdShowCursor");
const showCursorInput = showCursorContainer.querySelector("input");
showCursorInput.addEventListener("input", () => {
  setShowCursor(showCursorInput.checked);
});
const updateShowCursor = () => {
  showCursorContainer.classList.remove("hidden");
  if (showCursor) {
    osmd.cursor?.show();
  } else {
    osmd.cursor?.hide();
  }
};
const setShowCursor = async (newShowCursor) => {
  if (newShowCursor == showCursor) {
    return;
  }
  showCursor = newShowCursor;
  console.log({ showCursor });
  showCursorInput.checked = showCursor;

  for (let i = 2; i < displayCanvasHelper.numberOfColors; i++) {
    await displayCanvasHelper.setColor(i, "black");
  }
  if (showCursor && drawnCursors.includes(currentCursor)) {
    await displayCanvasHelper.setColor(
      drawnCursors.indexOf(currentCursor),
      cursorColor
    );
  }
  await displayCanvasHelper.flushContextCommands();

  if (showCursor) {
    osmd.cursor?.show();
  } else {
    osmd.cursor?.hide();
  }
};
setShowCursor(false);

// TIME
let currentTime = 0;
const currentTimeContainer = document.getElementById("osmdTime");
const currentTimeInput = currentTimeContainer.querySelector("input");
const currentTimeSpan = currentTimeContainer.querySelector("span.value");
const currentTimeTotalSpan = currentTimeContainer.querySelector("span.total");
currentTimeInput.addEventListener("input", () => {
  setCurrentTime(Number(currentTimeInput.value));
});
let maxTime = 0;
const updateMaxTime = () => {
  maxTime = cursors.at(-1).time;
  console.log({ maxTime });
  currentTimeTotalSpan.innerText = Math.round(maxTime);
  currentTimeInput.max = maxTime;
};
/** @type {CursorMetadata} */
let currentCursor;
let updateCurrentTime = false;
const setCurrentTime = async (newCurrentTime, render = true) => {
  currentTime = Math.min(newCurrentTime, maxTime);
  console.log({ currentTime });
  currentTimeSpan.innerText = Math.round(currentTime);
  currentTimeInput.value = currentTime;

  if (isDrawing) {
    updateCurrentTime = true;
    return;
  }
  await onCurrentTimeUpdate(render);
};
const onCurrentTimeUpdate = async (render = true) => {
  const _currentCursor = currentCursor;
  currentCursor = getCursorByTime(currentTime);
  if (currentCursor == _currentCursor) {
    return;
  }

  if (currentCursor) {
    const { cursor } = osmd;
    cursor.reset();
    while (!cursor.iterator.EndReached) {
      const ts = cursor.iterator.currentTimeStamp;
      const time = ts.RealValue * msPerQuarter;
      if (currentCursor.time == time) {
        break;
      }
      cursor.next();
    }
    cursor.cursorElement.off;
    osmdContainer.scrollTo({
      top: osmd.cursor.cursorElement.offsetTop - 40,
      behavior: "smooth",
    });
  }

  console.log("currentCursor", cursors.indexOf(currentCursor), currentCursor);
  if (_currentCursor && drawnCursors.includes(_currentCursor)) {
    await displayCanvasHelper.setColor(
      drawnCursors.indexOf(_currentCursor),
      "black",
      true
    );
  }

  let shouldDraw = false;

  if (
    currentCursor.systemIndex < currentSystemIndex ||
    currentSystemIndex + systemsPerDisplay <= currentCursor.systemIndex
  ) {
    setOsmdSystemIndex(currentCursor.systemIndex);
    return;
  }

  if (!drawnCursors.includes(currentCursor)) {
    shouldDraw = true;
  }

  console.log({ shouldDraw });

  if (shouldDraw) {
    if (render) {
      await draw();
    }
  } else {
    await displayCanvasHelper.setColor(
      drawnCursors.indexOf(currentCursor),
      cursorColor
    );
    await displayCanvasHelper.flushContextCommands();
  }
};

// SPEED
let speed = 1;
const speedContainer = document.getElementById("osmdSpeed");
const speedInput = speedContainer.querySelector("input");
const speedSpan = speedContainer.querySelector("span.value");
speedInput.addEventListener("input", () => {
  setSpeed(Number(speedInput.value));
});
const setSpeed = (newSpeed) => {
  if (newSpeed == speed) {
    return;
  }
  speed = newSpeed;
  console.log({ speed });
  speedSpan.innerText = speed;
  speedInput.value = speed;
};
setSpeed(1);

// PLAYBACK
let isPlaying = false;
const togglePlaybackButton = document.getElementById("togglePlayback");
togglePlaybackButton.addEventListener("click", () => {
  togglePlayback();
});
const togglePlayback = () => setIsPlaying(!isPlaying);
let startPlayingTime = 0;
let startPlayingCurrentTime = 0;
let updateCurrentTimeIntervalId;
const setIsPlaying = async (newIsPlaying) => {
  if (newIsPlaying == isPlaying) {
    return;
  }
  isPlaying = newIsPlaying;
  console.log({ isPlaying });
  togglePlaybackButton.innerText = isPlaying ? "pause" : "play";
  if (isPlaying) {
    if (currentTime >= maxTime) {
      await setCurrentTime(0);
    }
    startPlayingCurrentTime = currentTime;
    startPlayingTime = Date.now();
    updateCurrentTimeIntervalId = setInterval(() => {
      const timeOffset = (Date.now() - startPlayingTime) * speed;
      const newCurrentTime = startPlayingCurrentTime + timeOffset;
      setCurrentTime(newCurrentTime);
      if (currentTime == maxTime) {
        setIsPlaying(false);
      }
    }, 20);
  } else {
    clearInterval(updateCurrentTimeIntervalId);
  }
};

// SPRITE SHEET

/** @type {Record<number, BS.DisplaySpriteSheet>} */
const spriteSheets = [];
/** @param {number} systemIndex */
const createOsmdSystemSpriteSheet = async (systemIndex) => {
  console.log("createOsmdSystemSpriteSheet", systemIndex);
  let systemSvg = osmdContainer.querySelector("svg");
  systemSvg = systemSvg.cloneNode(true);
  /** @type {SVGGElement} */
  let staffLine;
  Array.from(systemSvg.querySelectorAll(".staffline")).forEach(
    (_staffLine, index) => {
      if (index == systemIndex) {
        staffLine = _staffLine;
      } else {
        _staffLine.remove();
      }
    }
  );
  document.body.appendChild(systemSvg);
  //console.log("staffLine", staffLine);
  const systemSvgBox = systemSvg.getBoundingClientRect();
  const staffLineBox = staffLine.getBoundingClientRect();
  staffLineBox.y -= systemSvgBox.y;
  staffLineBox.x -= systemSvgBox.x;
  systemSvg.setAttribute("display", "none");
  //console.log("staffLineBox", staffLineBox);
  systemSvg.setAttribute("height", staffLineBox.height);
  const viewBox = systemSvg.getAttribute("viewBox").split(" ");
  const svgWidth = systemSvg.getAttribute("width");
  const scale = viewBox[2] / svgWidth;
  //console.log({ scale }, systemSvg);
  const y = staffLineBox.y;
  const newViewBox = [
    viewBox[0],
    y * scale,
    viewBox[2],
    staffLineBox.height * scale,
  ];
  systemSvg.setAttribute("viewBox", newViewBox.join(" "));
  //console.log("systemSvg", systemSvg);

  cursors.forEach((cursor) => {
    if (
      cursor.rect.y >= staffLineBox.y &&
      cursor.rect.bottom <= staffLineBox.bottom
    ) {
      cursor.systemIndex = systemIndex;
      cursor.localY = cursor.rect.y - staffLineBox.y;
    }
  });

  const box = systemSvg.getBoundingClientRect();
  // testDiv.style.width = `${box.width}px`;
  // testDiv.style.height = `${box.height}px`;
  // testDiv.style.left = `${box.left + window.scrollX}px`;
  // testDiv.style.top = `${box.top + window.scrollY}px`;

  const spriteSheet = await BS.svgToSpriteSheet(
    systemSvg,
    `system-${systemIndex}`,
    "svg",
    2,
    "palette",
    {
      height: box.height,
      width: box.width,
    }
  );
  //console.log("spriteSheet", spriteSheet);
  spriteSheets[systemIndex] = spriteSheet;
  await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
  checkSpriteSheetSize();
  systemSvg.remove();
};

const getSystemMetrics = (pageIndex, systemIndex) => {
  const system =
    osmd.GraphicSheet.MusicPages[pageIndex].MusicSystems[systemIndex];

  const yOffset = system.boundingBox.borderTop;

  const { AbsolutePosition, Size } = system.PositionAndShape;

  const { Zoom } = osmd;
  const scalar = Zoom * 10;

  let { x, y } = AbsolutePosition;
  let { width, height } = Size;

  y += yOffset;

  x *= scalar;
  y *= scalar;

  width += 0.1;

  width *= scalar;
  height *= scalar;

  //console.log({ systemIndex, x, y, width, height });

  if (false) {
    const drawFromMeasureNumber = system.GraphicalMeasures[0][0].measureNumber;
    const drawUpToMeasureNumber =
      system.GraphicalMeasures.at(-1).at(-1).measureNumber;
    osmd.setOptions({ drawFromMeasureNumber, drawUpToMeasureNumber });
  }

  //console.log("system", system);
  system.StaffLines.forEach((staffLine) => {
    staffLine.AbstractExpressions.forEach((abstractExpression) => {
      // console.log("abstractExpression", abstractExpression);
    });
  });
  system.GraphicalMeasures.forEach((graphicalMeasures) => {
    // console.log("graphicalMeasures", graphicalMeasures);
    graphicalMeasures.forEach((graphicalMeasure) => {
      // console.log("graphicalMeasure", graphicalMeasure);
      // console.log(
      //   "graphicalMeasure.MeasureNumber",
      //   graphicalMeasure.MeasureNumber
      // );
      // console.log(
      //   "graphicalMeasure.InitiallyActiveClef",
      //   graphicalMeasure.InitiallyActiveClef
      // );
      graphicalMeasure.staffEntries.forEach((staffEntry) => {
        //console.log("staffEntry", staffEntry);
        staffEntry.FingeringEntries.forEach((fingeringEntry) => {
          // console.log("fingeringEntry", fingeringEntry);
        });
        staffEntry.graphicalVoiceEntries.forEach((graphicalVoiceEntry) => {
          // console.log("graphicalVoiceEntry", graphicalVoiceEntry);
          graphicalVoiceEntry.notes.forEach((note) => {
            // console.log("note", note);
            // note.setVisible(false);
          });
        });
        staffEntry.LyricsEntries.forEach((lyricEntry) => {
          //console.log("lyricEntry", lyricEntry);
        });
      });
    });
  });

  // const box = osmd.container.getBoundingClientRect();
  // const testDiv = document.getElementById("test");
  // testDiv.style.width = `${width}px`;
  // testDiv.style.height = `${height}px`;
  // testDiv.style.left = `${x + box.left + window.scrollX}px`;
  // testDiv.style.top = `${y + box.top + window.scrollY}px`;
};

/** @typedef {{time: number, displayIndex: number?, systemIndex: number, rect: DOMRect, localY: number, pageIndex: number, measureIndex: number}} CursorMetadata */
/** @type {CursorMetadata[]} */
const cursors = [];
/** @type {CursorMetadata[]} */
const drawnCursors = [];
let bpm = 0;
let msPerQuarter = 0;
const updateCursorMetadata = () => {
  bpm = osmd.Sheet.DefaultStartTempoInBpm;
  msPerQuarter = 60000 / bpm;

  const { cursor } = osmd;

  cursors.length = 0;
  cursor.reset();

  const parentRect = osmdContainer.querySelector("svg").getBoundingClientRect();

  while (!cursor.iterator.EndReached) {
    const ts = cursor.iterator.currentTimeStamp;
    const time = ts.RealValue * msPerQuarter;

    const rect = cursor.cursorElement.getBoundingClientRect();
    rect.x -= parentRect.x;
    rect.y -= parentRect.y;

    cursors.push({
      time,
      measureIndex: cursor.iterator.CurrentMeasureIndex,
      pageIndex: cursor.currentPageNumber,
      rect,
    });

    cursor.next();
  }

  console.log("cursors", cursors);
  cursor.reset();
};

const getCursorByTime = (time) => {
  /** @type {CursorMetadata} */
  let cursor;
  cursors.some((_cursor) => {
    if (time < _cursor.time) {
      return true;
    }
    cursor = _cursor;
  });
  return cursor;
};
window.getCursorByTime = getCursorByTime;

// INSOLE
const insoleDevice = new BS.Device();
const toggleInsoleConnectionButton = document.getElementById(
  "toggleInsoleConnection"
);
toggleInsoleConnectionButton.addEventListener("click", () => {
  insoleDevice.toggleConnection();
});
insoleDevice.addEventListener("connectionStatus", (event) => {
  const { connectionStatus } = event.message;
  let text = connectionStatus;
  switch (event.message.connectionStatus) {
    case "notConnected":
      text = "connect";
      break;
    case "connected":
      text = "disconnect";
      break;
  }
  toggleInsoleConnectionButton.innerText = text;
});
/** @type {BS.TfliteFileConfiguration} */
const tfliteConfiguration = {
  name: "kickStompTap",
  task: "classification",
  sensorTypes: ["gyroscope", "linearAcceleration"],
  sampleRate: 20,
  captureDelay: 500,
  threshold: 0,
  classes: ["idle", "kick", "stomp", "tap"],
};
fetch("./kickStompTap.tflite")
  .then((response) => response.arrayBuffer())
  .then((buffer) => {
    tfliteConfiguration.file = buffer;
    console.log("updated tfliteConfiguration", tfliteConfiguration);
  })
  .catch((err) => {
    console.error("Error loading kick model:", err);
  });

insoleDevice.addEventListener("connected", () => {
  if (insoleDevice.isInsole) {
    insoleDevice.sendTfliteConfiguration(tfliteConfiguration);
  } else {
    console.error(`expected insole, got ${insoleDevice.type}`);
    insoleDevice.disconnect();
  }
});

/** @type {HTMLProgressElement} */
const modelFileTransferProgress = document.getElementById(
  "modelFileTransferProgress"
);
insoleDevice.addEventListener("fileTransferProgress", (event) => {
  const { progress } = event.message;
  console.log({ progress });
  modelFileTransferProgress.value = progress;
});

insoleDevice.addEventListener("tfliteIsReady", (event) => {
  if (event.message.tfliteIsReady) {
    insoleDevice.enableTfliteInferencing();
  }
});

insoleDevice.addEventListener("tfliteInference", (event) => {
  const { maxClass } = event.message.tfliteInference;
  console.log({ maxClass });
  if (maxClass == "tap") {
    goToNextSystemIndex();
  }
});

didLoad = true;

await loadOsmd(
  "https://raw.githubusercontent.com/opensheetmusicdisplay/opensheetmusicdisplay/refs/heads/develop/demo/BrahWiMeSample.musicxml"
);
