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
displayCanvasHelper.addEventListener("deviceUpdated", () => {
  draw();
});
setupColors();
const getTextColorIndex = () => 1;
const getAbcColorIndex = () => 1;
const getWhiteKeyColorIndex = () => 1;
const getBlackKeyColorIndex = () => 2;
const getWhiteKeyDownColorIndex = () => 3;
const getBlackKeyDownColorIndex = () => 4;
const getCorrectNoteColorIndex = () => 5;
const getIncorrectNoteColorIndex = () => 6;
const getPitchHighlightedWhiteColorIndex = () => 7;
const getPitchHighlightedBlackColorIndex = () => 8;
const getHighlightedWhiteColorIndex = () => 9;
const getHighlightedBlackColorIndex = () => 10;
displayCanvasHelper.setColor(getWhiteKeyColorIndex(), "white");
displayCanvasHelper.setColor(getBlackKeyColorIndex(), "black");
displayCanvasHelper.setColor(getWhiteKeyDownColorIndex(), "yellow");
displayCanvasHelper.setColor(getBlackKeyDownColorIndex(), "#A0A018");
displayCanvasHelper.setColor(getCorrectNoteColorIndex(), "green");
displayCanvasHelper.setColor(getIncorrectNoteColorIndex(), "red");
displayCanvasHelper.setColor(getHighlightedWhiteColorIndex(), "00BFFF");
displayCanvasHelper.setColor(getHighlightedBlackColorIndex(), "blue");
displayCanvasHelper.setColor(getPitchHighlightedWhiteColorIndex(), "orange");
displayCanvasHelper.setColor(getPitchHighlightedBlackColorIndex(), "orange");
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

/**
 * @typedef {Object} VoiceConfig
 * @property {number} voiceIndex
 * @property {import("abcjs").VoiceItem} voice
 * @property {{
 *   pitch: number,
 *   name: string,
 *   verticalPos: number,
 *   highestVert: number,
 *   accidental: "sharp" | "flat" | "natural" | undefined
 * }[]} pitches
 * @property {Frequency[]} frequencies
 * @property {{ x: number, y: number }[]} notePositions
 * @property {number[]} frequencyMidis
 */

/** @type {VoiceConfig} */
let currentVoiceConfig = {};
/** @type {VoiceConfig} */
let previousVoiceConfig = {};

let currentSystemIndex = 0;
let numberOfSystems = 0;
const setCurrentSystemIndex = async (
  newCurrentSystemIndex,
  drawImmediately = true
) => {
  newCurrentSystemIndex = Math.max(
    0,
    Math.min(newCurrentSystemIndex, currentVoices.length)
  );
  if (newCurrentSystemIndex == numberOfSystems) {
    if (isPracticingNote) {
      learnedNotes.push(noteToLearn);
      addNoteToLearn();
      return;
    } else {
      currentSystemIndex = 0;
    }
  } else {
    currentSystemIndex = newCurrentSystemIndex;
  }
  currentVoices = allVoices[currentSystemIndex];
  console.log("currentVoices", currentVoices);

  console.log({ currentSystemIndex });
  setCurrentVoiceIndex(0, drawImmediately);
};

let currentVoiceIndex = 0;
const setCurrentVoiceIndex = async (
  newCurrentVoiceIndex,
  drawImmediately = true
) => {
  newCurrentVoiceIndex = Math.max(
    0,
    Math.min(newCurrentVoiceIndex, currentVoices.length)
  );
  if (newCurrentVoiceIndex == currentVoices.length) {
    setCurrentSystemIndex(currentSystemIndex + 1, drawImmediately);
    return;
  } else {
    currentVoiceIndex = newCurrentVoiceIndex;
  }
  console.log({ currentVoiceIndex });

  previousVoiceConfig = currentVoiceConfig;

  currentVoiceConfig = {};
  currentVoiceConfig.voiceIndex = currentVoiceIndex;
  currentVoiceConfig.voice = currentVoices[currentVoiceIndex];
  currentVoiceConfig.pitches = currentVoiceConfig.voice.pitches;
  currentVoiceConfig.frequencies = currentVoiceConfig.pitches.map((pitch) =>
    abcPitchToToneFrequency(pitch)
  );
  currentVoiceConfig.frequencyMidis = currentVoiceConfig.frequencies.map(
    (frequency) => frequency.toMidi()
  );
  currentVoiceConfig.notePositions =
    currentVoiceConfig.voice.abselem.notePositions.map(({ x, y }) => ({
      x,
      y: y - currentSystemIndex * 92.347,
    }));
  console.log("currentVoiceConfig", currentVoiceConfig);

  if (drawImmediately) {
    await draw();
  }
};
window.setCurrentVoiceIndex = setCurrentVoiceIndex;
document.addEventListener("keydown", (event) => {
  const { key } = event;
  console.log("keydown", key);

  let preventDefault = true;
  switch (key) {
    case "ArrowLeft":
      setCurrentVoiceIndex(currentVoiceIndex - 1);
      break;
    case "ArrowRight":
      setCurrentVoiceIndex(currentVoiceIndex + 1);
      break;
    default:
      preventDefault = false;
      break;
  }
  if (preventDefault) {
    event.preventDefault();
  }
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

  if (!abcSpriteSheets[currentSystemIndex]) {
    return;
  }

  if (isDrawing) {
    console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }
  isDrawing = true;

  console.log("drawing");

  if (shouldDrawSheet) {
    const spriteSheet = abcSpriteSheets[currentSystemIndex];
    const sprite = spriteSheet.sprites[0];
    await displayCanvasHelper.selectSpriteColor(1, getAbcColorIndex());
    await displayCanvasHelper.selectSpriteColor(2, getWhiteKeyDownColorIndex());
    await displayCanvasHelper.selectSpriteColor(3, getCorrectNoteColorIndex());
    await displayCanvasHelper.selectSpriteColor(
      4,
      getIncorrectNoteColorIndex()
    );
    await displayCanvasHelper.selectSpriteColor(
      5,
      getPitchHighlightedWhiteColorIndex()
    );

    const { width, height } = sprite;
    await displayCanvasHelper.setHorizontalAlignment("start");
    await displayCanvasHelper.setVerticalAlignment("start");
    await displayCanvasHelper.startSprite(0, 0, width, height);
    await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
    // await displayCanvasHelper.selectBackgroundColor(getAbcColorIndex());
    // await displayCanvasHelper.setFillBackground(1);
    await displayCanvasHelper.drawSprite(0, 0, spriteSheet.sprites[0].name);

    const overlaySpriteSheet = abcSpriteSheets["overlay"];
    await displayCanvasHelper.selectSpriteSheet(overlaySpriteSheet.name);

    for (let i = 0; i <= downFrequencies.length; i++) {
      const downFrequency = downFrequencies[i] ?? pitchDetectionFrequency;
      if (!downFrequency) {
        continue;
      }
      const isPitchDetectionFrequency =
        downFrequency == pitchDetectionFrequency;
      if (
        pitchDetectionFrequency &&
        downFrequency.toMidi() == pitchDetectionFrequency.toMidi() &&
        !isPitchDetectionFrequency
      ) {
        continue;
      }
      /** @type {VoiceConfig} */
      const voiceConfig = downFrequency.voiceConfig;
      const { isCorrect } = downFrequency;
      // console.log("voiceConfig", voiceConfig);
      const { frequencyMidis, notePositions, frequencies } = voiceConfig;

      console.log({ isCorrect, isPitchDetectionFrequency });

      const pitchIndex = frequencyMidis.indexOf(downFrequency.toMidi());

      // await displayCanvasHelper.selectFillColor(isCorrect ? 3 : 4);

      //const hasDash = isOffStaff(downFrequency);
      const hasDash = ["C4", "C#4"].includes(downFrequency.toNote());
      let spriteIndex = hasDash ? 2 : 4;
      if (!isCorrect) {
        spriteIndex++;
      }
      if (isPitchDetectionFrequency) {
        spriteIndex = overlaySpriteSheet.sprites.findIndex(
          (sprite) => sprite.name == "pitchHighlightedNote"
        );
      }

      const sprite = overlaySpriteSheet.sprites[spriteIndex];

      //console.log(downFrequency.toNote(), { pitchIndex, isCorrect }, sprite);

      let { x, y } = notePositions[isCorrect ? pitchIndex : 0];
      let yOffset = 0;
      let semitoneDifference = 0;
      let staffDistance = 0;
      if (!isCorrect) {
        let closestFrequency = frequencies[0];
        let closestFrequencyIndex = 0;
        let closestDistance =
          downFrequency.toMidi() - closestFrequency.toMidi();
        frequencies.slice(1).forEach((_frequency, frequencyIndex) => {
          const distance = downFrequency.toMidi() - _frequency.toMidi();
          if (Math.abs(distance) < Math.abs(closestDistance)) {
            closestDistance = distance;
            closestFrequency = _frequency;
            closestFrequencyIndex = frequencyIndex + 1;
          }
        });

        // console.log({ closestFrequencyIndex });
        ({ x, y } = notePositions[closestFrequencyIndex]);

        staffDistance = getStaffDistance(downFrequency, closestFrequency);
        yOffset = -staffDistance * 0.5 * (sprite.height - 1);

        semitoneDifference = downFrequency.toMidi() - closestFrequency.toMidi();
      }

      await displayCanvasHelper.drawSprite(
        2 * x - width / 2 - 0.037064552307128906,
        2 * y - height / 2 - 15.5494384765625 + yOffset,
        sprite.name
      );

      let drawSharp = downFrequency.toNote().includes("#");
      if (drawSharp) {
        let sharpSprite = overlaySpriteSheet.sprites.at(isCorrect ? -3 : -2);
        if (isPitchDetectionFrequency) {
          sharpSprite = overlaySpriteSheet.sprites.find(
            (sprite) => sprite.name == "pitchHighlightedSharp"
          );
        }
        await displayCanvasHelper.drawSprite(
          2 * x - width / 2 - 0.037064552307128906 - 21,
          2 * y - height / 2 - 15.5494384765625 + yOffset,
          sharpSprite.name
        );
      }

      //console.log({ staffDistance, semitoneDifference });
    }
    await displayCanvasHelper.endSprite();

    if (shouldDrawCurrentMarker) {
      const { notePositions } = currentVoiceConfig;
      console.log({ shouldDrawCurrentMarker });
      let { x, y } = notePositions[0];
      await displayCanvasHelper.setRotation(30, false);
      await displayCanvasHelper.selectFillColor(getTextColorIndex());
      await displayCanvasHelper.drawRegularPolygon(
        2 * x - 0.037064552307128906,
        sprite.height + 20,
        10,
        3
      );
      await displayCanvasHelper.clearRotation();
    }

    if (shouldDrawNoteName) {
      const { notePositions, pitches, frequencies } = currentVoiceConfig;
      console.log({ shouldDrawNoteName });
      let { x, y } = notePositions[0];
      await displayCanvasHelper.setHorizontalAlignment("center");
      await displayCanvasHelper.selectSpriteSheet("english");
      await displayCanvasHelper.selectFillColor(getTextColorIndex());
      await displayCanvasHelper.drawSpritesString(
        2 * x - 3,
        sprite.height + 20 + 10,
        frequencies[0].toNote().slice(0, -1)
      );
    }
  }

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

    const { frequencyMidis } = currentVoiceConfig;

    let frequency = Tone.Frequency(`C${startOctave}`);
    let xOffset = 0;
    await displayCanvasHelper.selectFillColor(getWhiteKeyColorIndex());
    for (let i = 0; i < numberOfWhiteKeys; i++) {
      //console.log(`drawing white note ${frequency.toNote()}`);

      const isCorrect = frequencyMidis.includes(frequency.toMidi());
      const downFrequency = getDownFrequency(frequency);
      const isCurrent =
        downFrequency &&
        downFrequency.voiceConfig.voiceIndex == currentVoiceIndex;
      if (
        pitchDetectionFrequency &&
        pitchDetectionFrequency.toMidi() == frequency.toMidi()
      ) {
        await displayCanvasHelper.selectFillColor(
          getPitchHighlightedWhiteColorIndex()
        );
      } else if (downFrequency) {
        if (isCurrent && shouldCorrectDrawnPianoDownKeys) {
          await displayCanvasHelper.selectFillColor(
            isCorrect
              ? getCorrectNoteColorIndex()
              : getIncorrectNoteColorIndex()
          );
        } else {
          await displayCanvasHelper.selectFillColor(
            getWhiteKeyDownColorIndex()
          );
        }
      } else {
        if (shouldHighlightCurrentVoiceNotes && isCorrect) {
          await displayCanvasHelper.selectFillColor(
            getHighlightedWhiteColorIndex()
          );
        } else {
          await displayCanvasHelper.selectFillColor(getWhiteKeyColorIndex());
        }
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
      if (downFrequency) {
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
      const isCorrect = frequencyMidis.includes(frequency.toMidi());
      const downFrequency = getDownFrequency(frequency);
      const isCurrent =
        downFrequency &&
        downFrequency.voiceConfig.voiceIndex == currentVoiceIndex;
      if (
        pitchDetectionFrequency &&
        pitchDetectionFrequency.toMidi() == frequency.toMidi()
      ) {
        await displayCanvasHelper.selectFillColor(
          getPitchHighlightedBlackColorIndex()
        );
      } else if (downFrequency) {
        if (isCurrent && shouldCorrectDrawnPianoDownKeys) {
          await displayCanvasHelper.selectFillColor(
            isCorrect
              ? getCorrectNoteColorIndex()
              : getIncorrectNoteColorIndex()
          );
        } else {
          await displayCanvasHelper.selectFillColor(
            getBlackKeyDownColorIndex()
          );
        }
      } else {
        if (shouldHighlightCurrentVoiceNotes && isCorrect) {
          await displayCanvasHelper.selectFillColor(
            getHighlightedBlackColorIndex()
          );
        } else {
          await displayCanvasHelper.selectFillColor(getBlackKeyColorIndex());
        }
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
      if (downFrequency) {
        await displayCanvasHelper.selectFillColor(getBlackKeyColorIndex());
      }
    }
  }

  latestDrawTime = Date.now();
  await displayCanvasHelper.show();
};
const debouncedDraw = false ? draw : BS.ThrottleUtils.debounce(draw, 40, false);
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
});
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log("item.type", item.type);
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

// TONEJS
/** @type {import("tone")} */
const Tone = window.Tone;
const audioContext = Tone.getContext().rawContext._nativeAudioContext;
device.audioContext = audioContext;
device.microphoneGainNode.gain.value = 5;
window.audioContext = audioContext;
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

const analyser = audioContext.createAnalyser();
analyser.fftSize = 1024;

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
let shouldHighlightCurrentVoiceNotes = true;
let shouldDrawCurrentMarker = true;
let shouldDrawNoteName = false;
const drawPianoConfig = {
  whiteKeyWidth: 34,
  whiteKeyHeight: 60,
  octaves: 2,
  whiteKeySpacing: 10,
  x: 0,
  y: 400 - 80,
  startOctave: 4,
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
/** @param {Frequency} frequency */
const getDownFrequency = (frequency) => {
  return downFrequencies.find(
    (_frequency) => _frequency.toMidi() == frequency.toMidi()
  );
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

let checkCorrectNotesOnPress = false;
const checkAreCorrectNotesPlayed = () => {
  const areCorrectNotesPlayed =
    //downFrequencies.length == frequencyMidis.length &&
    downFrequencies.length > 0 &&
    downFrequencies.every((downFrequency) => downFrequency.isCorrect);
  if (areCorrectNotesPlayed) {
    console.log("areCorrectNotesPlayed", areCorrectNotesPlayed);
    setCurrentVoiceIndex(currentVoiceIndex + 1, false);
  }
  return areCorrectNotesPlayed;
};

let ignoreMidi = false;
/** @param {Frequency} frequency */
const onFrequency = (frequency) => {
  sampler.triggerAttack(frequency.toNote());

  if (ignoreMidi) {
    return;
  }
  const index = getDownFrequencyIndex(frequency);
  if (index != -1) {
    return;
  }

  frequency.voiceConfig = currentVoiceConfig;
  frequency.isCorrect = currentVoiceConfig.frequencyMidis.includes(
    frequency.toMidi()
  );
  downFrequencies.push(frequency);
  console.log({ note: frequency.toNote(), downFrequencies });

  if (checkCorrectNotesOnPress) {
    checkAreCorrectNotesPlayed();
  }

  debouncedDraw();
};
/** @param {Frequency} frequency */
const offFrequency = (frequency) => {
  sampler.triggerRelease(frequency.toNote());

  const index = getDownFrequencyIndex(frequency);
  const downFrequency = downFrequencies[index];

  const shouldPracticeNote =
    isLearningNote && downFrequency?.isCorrect && !isPracticingNote;

  if (!checkCorrectNotesOnPress) {
    checkAreCorrectNotesPlayed();
  }

  if (index != -1) {
    downFrequencies.splice(index, 1);
  } else {
    console.error("downFrequency not found", frequency);
    return;
  }

  console.log({ note: frequency.toNote(), downFrequencies });

  if (shouldPracticeNote) {
    practiceNote();
  } else {
    debouncedDraw();
  }
};

const keyToNote = {
  a: "C4",
  s: "D4",
  d: "E4",
  f: "F4",
  g: "G4",
  h: "A4",
  j: "B4",
  k: "C5",
  l: "D5",
  ";": "E5",
  "'": "F5",

  w: "C#4",
  e: "D#4",

  t: "F#4",
  y: "G#4",
  u: "A#4",

  o: "C#5",
  p: "D#5",

  "]": "F#5",
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
    if (ignoreMidi) {
      return;
    }
    webMidiInput.addListener("noteon", onWebMidiNoteOn);
    webMidiInput.addListener("noteoff", onWebMidiNoteOff);
  });
} catch (error) {
  console.error(error);
}

// ABCJS
/** @type {import("abcjs")} */
const abcjs = window.ABCJS;

const DIATONIC_TO_SEMITONE = [0, 2, 4, 5, 7, 9, 11];
function abcPitchToMidi(note) {
  const middleCMidi = 60;

  const diatonic = ((note.pitch % 7) + 7) % 7;
  const octaves = Math.floor(note.pitch / 7);

  let midi = middleCMidi + octaves * 12 + DIATONIC_TO_SEMITONE[diatonic];

  // accidentals
  if (note.accidental === "sharp") midi += 1;
  if (note.accidental === "flat") midi -= 1;
  if (note.accidental === "dblsharp") midi += 2;
  if (note.accidental === "dblflat") midi -= 2;

  return midi;
}
function abcPitchToToneFrequency(note) {
  return Tone.Frequency(abcPitchToMidi(note), "midi");
}
const LETTER_INDEX = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

function toDiatonicIndex(input) {
  const note = input.toNote();

  const match = note.match(/^([A-G])([#b]?)(\d+)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);

  const [, letter, , octaveStr] = match;
  const octave = Number(octaveStr);

  return octave * 7 + LETTER_INDEX[letter];
}

function getStaffDistance(a, b) {
  return toDiatonicIndex(a) - toDiatonicIndex(b);
}

const STAFF_RANGES = {
  treble: {
    min: Tone.Frequency("E4").toMidi(), // bottom line
    max: Tone.Frequency("F5").toMidi(), // top line
  },
  bass: {
    min: Tone.Frequency("G2").toMidi(),
    max: Tone.Frequency("A3").toMidi(),
  },
};
function isOffStaff(freq, clef = "treble") {
  const midi = freq.toMidi();
  const { min, max } = STAFF_RANGES[clef];
  return midi < min || midi > max;
}

let shouldDrawSheet = true;
let shouldCorrectDrawnPianoDownKeys = true;

/** @type {Record<string, BS.DisplaySpriteSheet>} */
const abcSpriteSheets = {};
window.abcSpriteSheets = abcSpriteSheets;

const abcScale = 2;
const abcContainer = document.getElementById("abc");
const classesToRemove = [
  "abcjs-staff",
  "abcjs-staff-extra",
  "abcjs-stem",
  "abcjs-beam-elem",
  "abcjs-bar",
];
const dataNamesToRemove = ["flags.u8th", "rests.8th", "rests.quarter"];
/** @type {import("abcjs").AbcVisualParams} */
const abcVisualParams = {
  paddingbottom: 0,
  paddingleft: 0,
  paddingright: 0,
  paddingtop: 0,

  foregroundColor: "white",
  add_classes: true,

  staffwidth: displayCanvasHelper.width - 20,

  scale: abcScale,

  oneSvgPerLine: true,
};

/**
 * @param {SVGElement} svg
 * @param {string} spriteSheetName
 * @param {string} spriteName
 */
const svgToSpriteSheet = async (svg, spriteSheetName, spriteName) => {
  const systemSvg = svg.cloneNode(true);
  document.body.appendChild(systemSvg);

  const staffWrapper = systemSvg.querySelector(".abcjs-staff-wrapper");

  let systemSvgBox = systemSvg.getBoundingClientRect();
  const staffWrapperBox = staffWrapper.getBoundingClientRect();

  staffWrapperBox.y -= systemSvgBox.y;
  staffWrapperBox.x -= systemSvgBox.x;

  //console.log("systemSvgBox", systemSvgBox);
  //console.log("staffWrapperBox", staffWrapperBox);

  systemSvg.setAttribute("height", staffWrapperBox.height);
  systemSvg.setAttribute("width", staffWrapperBox.width);

  const viewBox = systemSvg.getAttribute("viewBox").split(" ").map(Number);
  //console.log("viewBox", viewBox);
  const newViewBox = [
    viewBox[0] + staffWrapperBox.x / abcScale,
    viewBox[1] + staffWrapperBox.y / abcScale,
    staffWrapperBox.width / abcScale,
    staffWrapperBox.height / abcScale,
  ];

  //console.log("newViewBox", newViewBox);
  systemSvg.setAttribute("viewBox", newViewBox.join(" "));

  systemSvgBox = systemSvg.getBoundingClientRect();
  //console.log("systemSvgBox", systemSvgBox);

  let spriteSheet = abcSpriteSheets[spriteSheetName];
  /** @type {BS.DisplaySprite?} */
  let sprite;
  if (!spriteSheet) {
    spriteSheet = await BS.svgToSpriteSheet(
      systemSvg,
      spriteSheetName,
      spriteName,
      2,
      "palette",
      {
        height: systemSvgBox.height / abcScale,
        width: systemSvgBox.width / abcScale,
      }
    );
    sprite = spriteSheet.sprites.find((sprite) => sprite.name == spriteName);
  } else {
    sprite = await BS.svgToSprite(
      systemSvg,
      spriteName,
      2,
      "palette",
      false,
      spriteSheet,
      0,
      {
        height: systemSvgBox.height / abcScale,
        width: systemSvgBox.width / abcScale,
      }
    );
  }

  if (spriteSheetName == "overlay") {
    console.log("sprite", sprite, spriteSheet, spriteName);
    sprite.commands.forEach((command) => {
      switch (command.type) {
        case "selectFillColor":
          if (command.fillColorIndex != 0) {
            command.fillColorIndex = 2;
          }
          break;
        case "selectLineColor":
          if (command.lineColorIndex != 0) {
            command.lineColorIndex = 2;
          }
          break;
      }
    });
  }

  systemSvg.remove();
  //console.log("spriteSheet", spriteSheet);
  abcSpriteSheets[spriteSheetName] = spriteSheet;
  await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
  checkSpriteSheetSize();
  return spriteSheet;
};

const renderAbcOverlay = async () => {
  const tuneObjectArray = abcjs.renderAbc(
    abcContainer.id,
    "X:1\nK:C\nC2",
    abcVisualParams
  );
  //console.log("tuneObjectArray", tuneObjectArray);

  const svgs = abcContainer.querySelectorAll("svg");
  //console.log("svgs", svgs);

  const svg = svgs[0];
  svg
    .querySelectorAll(classesToRemove.map((_) => "." + _).join(","))
    .forEach((e) => e.remove());
  svg
    .querySelectorAll(
      dataNamesToRemove.map((_) => `[data-name="${_}"]`).join(",")
    )
    .forEach((e) => e.remove());
  await svgToSpriteSheet(svg, "overlay", "noteWithDash");

  svg.querySelector(".abcjs-ledger").remove();

  await svgToSpriteSheet(svg, "overlay", "noteWithoutDash");

  const spriteSheet = abcSpriteSheets["overlay"];

  const noteWithDashSprite = spriteSheet.sprites[0];
  const noteWithoutDashSprite = spriteSheet.sprites[1];

  const spriteSheetIndex = displayCanvasHelper.spriteSheetIndices["overlay"];

  /**
   * @param {boolean} isCorrect
   * @param {boolean} hasDash
   * @param {number|undefined} colorIndexOverride
   * @returns {BS.DisplayContextCommand[]}
   */
  const createCommands = (isCorrect, hasDash, colorIndexOverride) => {
    const comamnds = spriteSheet.sprites[hasDash ? 0 : 1].commands.filter(
      (command) => {
        switch (command.type) {
          case "selectFillColor":
          case "selectLineColor":
            return false;
          default:
            return true;
        }
      }
    );
    return [
      {
        type: "selectFillColor",
        fillColorIndex: colorIndexOverride ?? (isCorrect ? 3 : 4),
      },
      {
        type: "selectLineColor",
        lineColorIndex: colorIndexOverride ?? (isCorrect ? 3 : 4),
      },
      // { type: "drawRect", x: 0, y: 0, width: 20, height: 17 },
      ...comamnds,
    ];
  };

  const correctNoteWithDashSprite = { ...noteWithDashSprite };
  correctNoteWithDashSprite.name = "correctNoteWithDash";
  correctNoteWithDashSprite.commands = createCommands(true, true);
  const incorrectNoteWithDashSprite = { ...noteWithDashSprite };
  incorrectNoteWithDashSprite.name = "incorrectNoteWithDash";
  incorrectNoteWithDashSprite.commands = createCommands(false, true);

  const correctNoteWithoutDashSprite = { ...noteWithoutDashSprite };
  correctNoteWithoutDashSprite.name = "correctNoteWithoutDash";
  correctNoteWithoutDashSprite.commands = createCommands(true, false);
  const incorrectNoteWithoutDashSprite = { ...noteWithoutDashSprite };
  incorrectNoteWithoutDashSprite.name = "incorrectNoteWithoutDash";
  incorrectNoteWithoutDashSprite.commands = createCommands(false, false);
  spriteSheet.sprites.push(
    correctNoteWithDashSprite,
    incorrectNoteWithDashSprite,
    correctNoteWithoutDashSprite,
    incorrectNoteWithoutDashSprite
  );

  const pitchHighlightedNote = { ...noteWithoutDashSprite };
  pitchHighlightedNote.name = "pitchHighlightedNote";
  pitchHighlightedNote.commands = createCommands(true, false, 5);
  spriteSheet.sprites.push(pitchHighlightedNote);

  console.log("overlay", spriteSheet);

  await renderAbcOverlaySymbols();

  await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
  checkSpriteSheetSize();
};
const renderAbcOverlaySymbols = async () => {
  const tuneObjectArray = abcjs.renderAbc(
    abcContainer.id,
    "X:1\nK:C\n^C2",
    abcVisualParams
  );
  //console.log("tuneObjectArray", tuneObjectArray);

  const svgs = abcContainer.querySelectorAll("svg");
  //console.log("svgs", svgs);

  const svg = svgs[0];
  svg
    .querySelectorAll(classesToRemove.map((_) => "." + _).join(","))
    .forEach((e) => e.remove());
  svg
    .querySelectorAll(
      dataNamesToRemove.map((_) => `[data-name="${_}"]`).join(",")
    )
    .forEach((e) => e.remove());
  svg.querySelector(".abcjs-ledger").remove();
  svg.querySelector(".abcjs-notehead").remove();
  await svgToSpriteSheet(svg, "overlay", "sharp");

  const spriteSheet = abcSpriteSheets["overlay"];
  const sharpSprite = spriteSheet.sprites.at(-1);

  /**
   * @param {boolean} isCorrect
   * @param {number|undefined} colorIndexOverride
   * @returns {BS.DisplayContextCommand[]}
   */
  const createCommands = (isCorrect, colorIndexOverride) => {
    const comamnds = sharpSprite.commands.filter((command, index) => {
      switch (command.type) {
        case "selectFillColor":
          return command.fillColorIndex == 0;
          break;
        case "selectLineColor":
          return command.lineColorIndex == 0;
        default:
          return true;
      }
    });
    return [
      {
        type: "selectFillColor",
        fillColorIndex: colorIndexOverride ?? (isCorrect ? 3 : 4),
      },
      {
        type: "selectLineColor",
        lineColorIndex: colorIndexOverride ?? (isCorrect ? 3 : 4),
      },
      // { type: "drawRect", x: 0, y: 0, width: 20, height: 17 },
      ...comamnds,
    ];
  };

  const correctSharpSprite = { ...sharpSprite };
  correctSharpSprite.name = "correctSharp";
  correctSharpSprite.commands = createCommands(true);
  const incorrectSharpSprite = { ...sharpSprite };
  incorrectSharpSprite.name = "incorrectSharp";
  incorrectSharpSprite.commands = createCommands(false);

  const pitchHighlightedSharp = { ...sharpSprite };
  pitchHighlightedSharp.name = "pitchHighlightedSharp";
  pitchHighlightedSharp.commands = createCommands(false, 5);

  spriteSheet.sprites.push(
    correctSharpSprite,
    incorrectSharpSprite,
    pitchHighlightedSharp
  );
};
await renderAbcOverlay();

/** @type {import("abcjs").TuneObjectArray} */
let tuneObjectArray;
/** @type {import("abcjs").VoiceItem[]} */
let currentVoices = [];
/** @type {import("abcjs").VoiceItem[][]} */
let allVoices = [];
console.log("currentVoices", currentVoices);
/** @param {string} string */
const renderAbc = async (string) => {
  console.log("renderAbc", string);
  tuneObjectArray = abcjs.renderAbc(abcContainer.id, string, abcVisualParams);
  console.log(
    "tuneObjectArray",
    tuneObjectArray,
    tuneObjectArray[0].getKeySignature()
  );
  allVoices = tuneObjectArray[0].lines.map((line) =>
    line.staff[0].voices[0].filter((_) => _.pitches)
  );
  console.log("allVoices", allVoices);

  const svgs = abcContainer.querySelectorAll("svg");
  //console.log("svgs", svgs);

  numberOfSystems = svgs.length;
  for (let systemIndex = 0; systemIndex < numberOfSystems; systemIndex++) {
    const svg = svgs[systemIndex];
    await svgToSpriteSheet(svg, systemIndex.toString(), "svg");
  }
  await setCurrentSystemIndex(0);
};

didLoad = true;

draw();

// MICROPHONE
device.audioContext;
device.microphoneGainNode.connect(analyser);

/** @type {HTMLSelectElement} */
const selectMicrophoneSelect = document.getElementById("selectMicrophone");
/** @type {HTMLOptGroupElement} */
const selectMicrophoneOptgroup =
  selectMicrophoneSelect.querySelector("optgroup");
selectMicrophoneSelect.addEventListener("input", () => {
  selectMicrophone(selectMicrophoneSelect.value);
});

selectMicrophoneSelect.addEventListener("click", async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioDevices = devices.filter((device) => device.kind == "audioinput");
  console.log("audioDevices", audioDevices);
  if (audioDevices.length == 1 && audioDevices[0].deviceId == "") {
    console.log("getting audio");
    const microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    microphoneStream.getAudioTracks().forEach((track) => track.stop());
    updateMicrophoneSources();
  }
});
const updateMicrophoneSources = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioDevices = devices.filter((device) => device.kind == "audioinput");
  selectMicrophoneOptgroup.innerHTML = "";
  selectMicrophoneOptgroup.appendChild(new Option("none"));
  if (device.hasMicrophone) {
    selectMicrophoneOptgroup.appendChild(new Option("device"));
  }
  audioDevices.forEach((audioInputDevice) => {
    selectMicrophoneOptgroup.appendChild(
      new Option(audioInputDevice.label, audioInputDevice.deviceId)
    );
  });
  selectMicrophone.value = "none";
  selectMicrophone(selectMicrophone.value);
};
/** @type {MediaStream?} */
let microphoneStream;
/** @type {MediaStreamAudioSourceNode?} */
let microphoneMediaStreamSource;
const selectMicrophone = async (deviceId) => {
  stopMicrophoneStream();
  if (deviceId == "none") {
    microphoneAudio.setAttribute("hidden", "");
    if (device.hasMicrophone) {
      await device.stopMicrophone();
    }
  } else {
    if (deviceId == "device") {
      microphoneStream = device.microphoneMediaStreamDestination.stream;
      console.log("starting microphone");
      await device.startMicrophone();
    } else {
      microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          sampleRate: audioContext.sampleRate,
          noiseSuppression: false,
          echoCancellation: false,
          autoGainControl: false,
        },
      });
      microphoneMediaStreamSource =
        audioContext.createMediaStreamSource(microphoneStream);
      microphoneMediaStreamSource.connect(analyser);
      if (!usePitchy) {
        loadPitchDetection();
      }
    }
    microphoneAudio.srcObject = microphoneStream;
    microphoneAudio.removeAttribute("hidden");
    console.log("got microphoneStream", deviceId, microphoneStream);
  }
};
const stopMicrophoneStream = () => {
  if (microphoneStream) {
    console.log("stopping microphoneStream");
    microphoneStream.getAudioTracks().forEach((track) => track.stop());
    microphoneStream = undefined;
  }
  if (microphoneMediaStreamSource) {
    microphoneMediaStreamSource.disconnect();
    microphoneMediaStreamSource = undefined;
  }
  microphoneAudio.srcObject = undefined;
  microphoneAudio.setAttribute("hidden", "");
};
navigator.mediaDevices.addEventListener("devicechange", () =>
  updateMicrophoneSources()
);
device.addEventListener("isConnected", () => {
  updateMicrophoneSources();
});
updateMicrophoneSources();

// MICROPHONE AUDIO

/** @type {HTMLAudioElement} */
const microphoneAudio = document.getElementById("microphoneAudio");
let isMicrophoneLoaded = false;
microphoneAudio.addEventListener("loadstart", () => {
  isMicrophoneLoaded = true;
});
microphoneAudio.addEventListener("emptied", () => {
  isMicrophoneLoaded = false;
});

// PITCHY
import * as Pitchy from "https://esm.sh/pitchy@4";

/** @type {import("pitchy")} */
const pitchy = Pitchy;
window.pitchy = pitchy;
const { PitchDetector } = pitchy;

const detector = PitchDetector.forFloat32Array(analyser.fftSize);
detector.minVolumeDecibels = -50;
const detectorInput = new Float32Array(detector.inputLength);

window.clarityThreshold = 0.98;
/** @type {import("tone").FrequencyClass?} */
let frequency = Tone.Frequency("B-3");
/** @type {import("tone").FrequencyClass?} */
let perfectFrequency;
/** [-50, 50] */
let pitchOffset = 50;
let pitchOffsetAbs = Math.abs(pitchOffset);
/** [-1, 1] */
let normalizedPitchOffset = pitchOffset / 50;
const pitchOffsetThresholds = {
  medium: 10,
  good: 5,
};
let getPitchyPitch = () => {
  analyser.getFloatTimeDomainData(detectorInput);
  const [pitch, clarity] = detector.findPitch(
    detectorInput,
    audioContext.sampleRate
  );
  //console.log({ pitch, clarity });
  if (clarity < clarityThreshold) {
    onPitch();
  } else {
    onPitch(pitch);
  }
};

// ML5.js PITCH DETECTION

let pitchDetection;

const onModelLoaded = () => {
  console.log("onModelLoaded");
};

/** @type {Frequency?} */
let pitchDetectionFrequency;
let pitchDetectionInterval = 50;
let lastTimePitchDetected = 0;
const onMl5Pitch = async (error, pitch) => {
  if (error) {
    console.error(error);
    onPitch();
  } else if (pitch) {
    onPitch(pitch);
  } else {
    onPitch();
  }
};

/** @param {number?} pitch */
const onPitch = async (pitch) => {
  const _lastTimePitchDetected = lastTimePitchDetected;
  lastTimePitchDetected = Date.now();
  //console.log({ pitch });
  let newPitchDetectionFrequency;
  if (pitch != undefined) {
    newPitchDetectionFrequency = Tone.Frequency(pitch).transpose(24);
  }

  if (
    Boolean(pitchDetectionFrequency) != Boolean(newPitchDetectionFrequency) ||
    pitchDetectionFrequency?.toMidi() != newPitchDetectionFrequency?.toMidi()
  ) {
    pitchDetectionFrequency = newPitchDetectionFrequency;
    if (pitchDetectionFrequency) {
      pitchDetectionFrequency.voiceConfig = currentVoiceConfig;
      console.log({
        frequency: pitchDetectionFrequency.toFrequency(),
        midi: pitchDetectionFrequency.toMidi(),
        note: pitchDetectionFrequency.toNote(),
      });
    }
    draw();
  }

  if (autoPitchCheckbox.checked) {
    const timeSinceLastTimePitchDetected =
      lastTimePitchDetected - _lastTimePitchDetected;
    //console.log({ timeSinceLastTimePitchDetected });
    if (timeSinceLastTimePitchDetected < pitchDetectionInterval) {
      const timeToWait =
        pitchDetectionInterval - timeSinceLastTimePitchDetected;
      //console.log("timeToWait", timeToWait);
      await BS.wait(timeToWait);
    }
    getPitch();
  }
};

const loadPitchDetection = async () => {
  if (!microphoneStream) {
    return;
  }
  console.log("audioContext", audioContext);
  pitchDetection = ml5.pitchDetection(
    "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/",
    audioContext,
    microphoneStream,
    onModelLoaded
  );
};

const getMl5Pitch = () => {
  pitchDetection.getPitch(onMl5Pitch);
};

let usePitchy = true;
const getPitch = () => {
  if (usePitchy) {
    getPitchyPitch();
  } else {
    getMl5Pitch();
  }
};

const getPitchButton = document.getElementById("getPitch");
getPitchButton.addEventListener("click", () => {
  getPitch();
});

const autoPitchCheckbox = document.getElementById("autoPitch");
autoPitchCheckbox.addEventListener("input", () => {
  if (autoPitchCheckbox.checked && isMicrophoneLoaded) {
    getPitch();
  }
});

microphoneAudio.addEventListener("loadstart", () => {
  getPitchButton.disabled = false;
  autoPitchCheckbox.disabled = false;
});
microphoneAudio.addEventListener("emptied", () => {
  getPitchButton.disabled = true;
  autoPitchCheckbox.disabled = true;

  autoPitchCheckbox.checked = false;
});

// LEARNING NOTES
/** @type {Frequency[]} */
const learnedNotes = [];
/** @type {Frequency} */
let noteToLearn;
/** @type {Frequency[]} */
const allNotesToLearn = ["C", "D", "E", "F", "G", "A", "B"].flatMap((note) => {
  return [4].map((number) => Tone.Frequency(`${note}${number}`));
});
let isLearningNote = false;
let isPracticingNote = false;

let notesPerSystem = 6;
let systemsPerPractice = 3;
const practiceNote = async () => {
  if (isPracticingNote) {
    return;
  }
  isPracticingNote = true;
  shouldDrawNoteName = false;
  shouldDrawPiano = false;
  console.log({ isPracticingNote });

  //await BS.wait(500);

  const _learnedNotes = [...learnedNotes, noteToLearn];
  /** @type {Frequency[][]} */
  const systems = [];
  let _systemsPerPractice = systemsPerPractice;
  if (_learnedNotes.length == 1) {
    _systemsPerPractice = 1;
  }
  for (let systemIndex = 0; systemIndex < _systemsPerPractice; systemIndex++) {
    /** @type {Frequency[]} */
    const system = [];
    for (let i = 0; i < notesPerSystem; i++) {
      const note =
        _learnedNotes[Math.floor(Math.random() * _learnedNotes.length)];
      system.push(Tone.Frequency(note));
    }
    systems.push(system);
  }
  console.log("systems", systems);
  await renderAbc(`
    X:1
    K:C
    L:1/4
    ${systems
      .map((system) =>
        system.map((note) => note.toNote().slice(0, -1).toLowerCase()).join(" ")
      )
      .join(`\n`)}
  `);
};

const addNoteToLearn = async () => {
  const notesToLearn = allNotesToLearn.filter(
    (noteToLearn) => !learnedNotes.includes(noteToLearn)
  );
  console.log("notesToLearn", notesToLearn);
  noteToLearn = notesToLearn[0];
  console.log("noteToLearn", noteToLearn);

  isLearningNote = true;
  isPracticingNote = false;
  shouldDrawNoteName = true;
  shouldDrawPiano = true;
  noteToLearn.toNote().slice(0, -1).toLowerCase();
  await renderAbc(`
    X:1
    K:C
    L:1/4
    ${noteToLearn.toNote().slice(0, -1).toLowerCase()}
  `);
};
addNoteToLearn();
