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
const getWhiteKeyColorIndex = () => 1;
const getBlackKeyColorIndex = () => 2;
const getWhiteKeyDownColorIndex = () => 3;
const getBlackKeyDownColorIndex = () => 4;
displayCanvasHelper.setColor(getWhiteKeyColorIndex(), "white");
displayCanvasHelper.setColor(getBlackKeyColorIndex(), "black");
displayCanvasHelper.setColor(getWhiteKeyDownColorIndex(), "yellow");
displayCanvasHelper.setColor(getBlackKeyDownColorIndex(), "#A0A018");
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
let draw = async () => {
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

  console.log("drawing");

  // FILL - draw piano

  if (shouldDrawPiano) {
    const {
      whiteKeyHeight,
      whiteKeyWidth,
      octaves,
      whiteKeySpacing,
      x,
      y,
      startOctave,
    } = drawPianoConfig;
    const numberOfWhiteKeys = octaves * 7;

    const numberOfBlackKeys = octaves * 5;
    const blackKeyWidth = Math.round(whiteKeyWidth / 2 + whiteKeySpacing * 2);
    const blackKeyHeight = Math.round(whiteKeyHeight * 0.6);

    await displayCanvasHelper.setHorizontalAlignment("start");
    await displayCanvasHelper.setVerticalAlignment("start");

    let frequency = Tone.Frequency(`C${startOctave}`);
    let xOffset = 0;
    await displayCanvasHelper.selectFillColor(getWhiteKeyColorIndex());
    for (let i = 0; i < numberOfWhiteKeys; i++) {
      //console.log(`drawing white note ${frequency.toNote()}`);
      const isDown = getDownFrequencyIndex(frequency) != -1;
      if (isDown) {
        await displayCanvasHelper.selectFillColor(getWhiteKeyDownColorIndex());
      }
      await displayCanvasHelper.drawRect(
        x + xOffset,
        y,
        whiteKeyWidth,
        whiteKeyHeight
      );
      xOffset += whiteKeyWidth + whiteKeySpacing;
      do {
        frequency = frequency.transpose(1);
      } while (frequency.toNote().length == 3);
      if (isDown) {
        await displayCanvasHelper.selectFillColor(getWhiteKeyColorIndex());
      }
    }

    frequency = Tone.Frequency(`C#${startOctave}`);
    await displayCanvasHelper.setHorizontalAlignment("center");
    xOffset = Math.round(whiteKeyWidth + whiteKeySpacing / 2);
    const blackKeySpacing = whiteKeyWidth + whiteKeySpacing;
    await displayCanvasHelper.selectFillColor(getBlackKeyColorIndex());
    for (let i = 0; i < numberOfBlackKeys; i++) {
      //console.log(`drawing black note ${frequency.toNote()}`);
      const isDown = getDownFrequencyIndex(frequency) != -1;
      if (isDown) {
        await displayCanvasHelper.selectFillColor(getBlackKeyDownColorIndex());
      }
      await displayCanvasHelper.drawRect(
        x + xOffset,
        y,
        blackKeyWidth,
        blackKeyHeight
      );
      switch (i % 5) {
        case 1:
        case 4:
          xOffset += blackKeySpacing;
          break;
        default:
          break;
      }
      xOffset += blackKeySpacing;
      do {
        frequency = frequency.transpose(1);
      } while (frequency.toNote().length == 2);
      if (isDown) {
        await displayCanvasHelper.selectFillColor(getBlackKeyColorIndex());
      }
    }
  }

  latestDrawTime = Date.now();
  await displayCanvasHelper.show();
};
draw = BS.ThrottleUtils.debounce(draw, 20, false);
window.draw = draw;

let latestDrawTime = 0;
window.minDrawTime = 120;
displayCanvasHelper.addEventListener("ready", async () => {
  const now = Date.now();
  const drawTime = now - latestDrawTime;
  console.log(`drawTime: ${drawTime}ms`);

  const waitTime = minDrawTime - drawTime;
  if (waitTime > 0) {
    await BS.wait(waitTime);
  }

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

window.addEventListener("paste", (event) => {
  const string = event.clipboardData.getData("text");
  // FILL
});
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log("item.type", item.type);
    // FILL
  }
});

// DRAGOVER

window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    console.log(file.type);
    // FILL
  }
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

// TONEJS
/** @type {import("tone")} */
const Tone = window.Tone;
const audioContext = Tone.getContext().rawContext;
console.log(audioContext);
const checkAudioContextState = () => {
  const { state } = audioContext;
  console.log({ audioContextState: state });
  if (state != "running") {
    document.addEventListener("click", () => audioContext.resume(), {
      once: true,
    });
  }
};
audioContext.addEventListener("statechange", () => {
  checkAudioContextState();
});
checkAudioContextState();

const sampler = new Tone.Sampler({
  urls: {
    A0: "A0.mp3",
    C1: "C1.mp3",
    "D#1": "Ds1.mp3",
    "F#1": "Fs1.mp3",
    A1: "A1.mp3",
    C2: "C2.mp3",
    "D#2": "Ds2.mp3",
    "F#2": "Fs2.mp3",
    A2: "A2.mp3",
    C3: "C3.mp3",
    "D#3": "Ds3.mp3",
    "F#3": "Fs3.mp3",
    A3: "A3.mp3",
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
    C5: "C5.mp3",
    "D#5": "Ds5.mp3",
    "F#5": "Fs5.mp3",
    A5: "A5.mp3",
    C6: "C6.mp3",
    "D#6": "Ds6.mp3",
    "F#6": "Fs6.mp3",
    A6: "A6.mp3",
    C7: "C7.mp3",
    "D#7": "Ds7.mp3",
    "F#7": "Fs7.mp3",
    A7: "A7.mp3",
    C8: "C8.mp3",
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

// WEBMIDI
let shouldDrawPiano = true;
const drawPianoConfig = {
  whiteKeyWidth: 34,
  whiteKeyHeight: 60,
  octaves: 2,
  whiteKeySpacing: 10,
  x: 0,
  y: 400 - 80,
  startOctave: 3,
};
window.drawPianoConfig = drawPianoConfig;

/** @typedef {import("webmidi").WebMidi} WebMidi */
/** @typedef {import("webmidi").InputEventMap} InputEventMap */

/** @type {WebMidi} */
const WebMidi = window.WebMidi;

/** @typedef {import("tone").FrequencyClass} Frequency */
/** @type {Frequency[]} */
const downFrequencies = [];
/** @param {Frequency} frequency */
const getDownFrequencyIndex = (frequency) => {
  const index = downFrequencies.findIndex(
    (_frequency) => _frequency.toMidi() == frequency.toMidi()
  );
  return index;
};
/** @type {InputEventMap["noteon"]} */
const onWebMidiNoteOn = (event) => {
  const { value, note } = event;
  const frequency = Tone.Midi(note.number);
  onFrequency(frequency);
};
/** @type {InputEventMap["noteoff"]} */
const onWebMidiNoteOff = (event) => {
  const { value, note } = event;
  const frequency = Tone.Midi(note.number);
  offFrequency(frequency);
};

/** @param {Frequency} frequency */
const onFrequency = (frequency) => {
  const index = getDownFrequencyIndex(frequency);
  if (index != -1) {
    return;
  }
  downFrequencies.push(frequency);
  sampler.triggerAttack(frequency.toNote());
  console.log({ note: frequency.toNote(), downFrequencies });
  if (shouldDrawPiano) {
    draw();
  }
};
/** @param {Frequency} frequency */
const offFrequency = (frequency) => {
  const index = getDownFrequencyIndex(frequency);
  downFrequencies.splice(index, 1);
  sampler.triggerRelease(frequency.toNote());
  console.log({ note: frequency.toNote(), downFrequencies });
  if (shouldDrawPiano) {
    draw();
  }
};

const keyToNote = {
  a: "C3",
  s: "D3",
  d: "E3",
  f: "F3",
  g: "G3",
  h: "A3",
  j: "B3",
  k: "C4",
  l: "D4",
  ";": "E4",
  "'": "F4",

  w: "C#3",
  e: "D#3",

  t: "F#3",
  y: "G#3",
  u: "A#3",

  o: "C#4",
  p: "D#4",

  "]": "F#4",
};
document.addEventListener("keydown", (event) => {
  const { key } = event;
  console.log("keyDown", key);

  const note = keyToNote[key];

  if (note) {
    onFrequency(Tone.Frequency(note));
    event.preventDefault();
  }
});
document.addEventListener("keyup", (event) => {
  const { key } = event;
  console.log("keyup", key);

  const note = keyToNote[key];

  if (note) {
    offFrequency(Tone.Frequency(note));
    event.preventDefault();
  }
});

try {
  await WebMidi.enable();
  WebMidi.inputs.forEach((webMidiInput) => {
    webMidiInput.addListener("noteon", onWebMidiNoteOn);
    webMidiInput.addListener("noteoff", onWebMidiNoteOff);
  });
} catch (error) {
  console.error(error);
}

draw();
