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

  console.log(displayCanvasHelper.selectedSpriteSheet);
  await displayCanvasHelper.selectSpriteSheetPalette("palette");
  // await displayCanvasHelper.selectBackgroundColor(1);
  // await displayCanvasHelper.setFillBackground(true);
  await displayCanvasHelper.setVerticalAlignment("start");
  await displayCanvasHelper.drawSprite(displayCanvasHelper.width / 2, 0, "svg");

  await displayCanvasHelper.show();
};

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

const loadOsmd = async (content) => {
  console.log("loadOsmd");
  await osmd.load(content);
  updateOsmdTitle();

  updateOsmdInstrument();
  setOsmdInstrumentIndex(0);

  setOsmdSystemIndex(0);
  setOsmdZoom(Number(osmdZoomInput.value));

  renderOsmd(true);
};

const renderOsmd = async () => {
  console.log("renderOsmd");

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
  updateOsmdSystem();
  updateOsmdZoom();
  await createOsmdSystemSpriteSheet();
  draw();
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
  console.log({ currentSystemIndex });
  osmdSystemInput.value = currentSystemIndex;
  osmdSystemValueSpan.innerText = currentSystemIndex;

  if (render) {
    await renderOsmd();
  }
};
osmdSystemInput.addEventListener("input", () => {
  setOsmdSystemIndex(Number(osmdSystemInput.value), true);
});

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

/** @type {Record<number, BS.DisplaySpriteSheet>} */
const spriteSheets = {};
const createOsmdSystemSpriteSheet = async () => {
  const { x, width, height } = getSystemMetrics(0, currentSystemIndex);
  let systemSvg = osmdContainer.querySelector("svg");
  systemSvg = systemSvg.cloneNode(true);
  /** @type {SVGGElement} */
  let staffLine;
  Array.from(systemSvg.querySelectorAll(".staffline")).forEach(
    (_staffLine, index) => {
      if (index == currentSystemIndex) {
        staffLine = _staffLine;
      } else {
        _staffLine.remove();
      }
    }
  );
  document.body.appendChild(systemSvg);
  console.log("staffLine", staffLine);
  const systemSvgBox = systemSvg.getBoundingClientRect();
  const staffLineBox = staffLine.getBoundingClientRect();
  systemSvg.setAttribute("display", "none");
  console.log("staffLineBox", staffLineBox);
  systemSvg.setAttribute("height", height);
  const viewBox = systemSvg.getAttribute("viewBox").split(" ");
  const svgWidth = systemSvg.getAttribute("width");
  const scale = viewBox[2] / svgWidth;
  console.log({ scale }, systemSvg);
  const y = staffLineBox.y - systemSvgBox.y;
  const newViewBox = [viewBox[0], y * scale, viewBox[2], height * scale];
  systemSvg.setAttribute("viewBox", newViewBox.join(" "));
  console.log("systemSvg", systemSvg);

  const box = systemSvg.getBoundingClientRect();
  testDiv.style.width = `${box.width}px`;
  testDiv.style.height = `${box.height}px`;
  testDiv.style.left = `${box.left + window.scrollX}px`;
  testDiv.style.top = `${box.top + window.scrollY}px`;

  const spriteSheet = await BS.svgToSpriteSheet(
    systemSvg,
    `system-${currentSystemIndex}`,
    "svg",
    2,
    "palette",
    {
      height: box.height,
      width: box.width,
    }
  );
  console.log("spriteSheet", spriteSheet);
  spriteSheets[currentSystemIndex] = spriteSheet;
  await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
  checkSpriteSheetSize();
  systemSvg.remove();
};

const testDiv = document.getElementById("test");
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

  console.log({ systemIndex, x, y, width, height });

  if (false) {
    const drawFromMeasureNumber = system.GraphicalMeasures[0][0].measureNumber;
    const drawUpToMeasureNumber =
      system.GraphicalMeasures.at(-1).at(-1).measureNumber;
    osmd.setOptions({ drawFromMeasureNumber, drawUpToMeasureNumber });
  }

  console.log("system", system);
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
        // console.log("staffEntry", staffEntry);
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
  // testDiv.style.width = `${width}px`;
  // testDiv.style.height = `${height}px`;
  // testDiv.style.left = `${x + box.left + window.scrollX}px`;
  // testDiv.style.top = `${y + box.top + window.scrollY}px`;

  return { x, y, width, height };
};

didLoad = true;

await loadOsmd(
  "https://raw.githubusercontent.com/opensheetmusicdisplay/opensheetmusicdisplay/refs/heads/develop/demo/BrahWiMeSample.musicxml"
);
