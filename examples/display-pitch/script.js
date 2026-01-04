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
const getBackgroundColorIndex = () => 1;
const getTextColorIndex = () => 2;
const getGoodColorIndex = () => 3;
const getMediumColorIndex = () => 4;
const getBadColorIndex = () => 5;
displayCanvasHelper.setColor(getBackgroundColorIndex(), "#4f4f4f");
displayCanvasHelper.setColor(getTextColorIndex(), "white");
displayCanvasHelper.setColor(getGoodColorIndex(), "#00ff00");
displayCanvasHelper.setColor(getMediumColorIndex(), "orange");
displayCanvasHelper.setColor(getBadColorIndex(), "#ff4747");
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

const drawOffset = {
  x: 0.5,
  y: 0.5,
};
const drawSize = {
  width: 110,
  height: 110,
};
let drawLineWidth = 8;

let didLoad = false;
const draw = async (overrideIsMicrophoneLoaded = false) => {
  if (isUploading) {
    console.warn("busy uploading");
    return;
  }
  if (!didLoad) {
    console.warn("hasn't loaded yet");
    return;
  }

  if (!isMicrophoneLoaded && !overrideIsMicrophoneLoaded) {
    console.warn("microphone hasn't loaded");
    return;
  }

  if (isDrawing) {
    //console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }

  isDrawing = true;

  //console.log("draw");

  let spriteColorIndex;
  if (pitchOffsetAbs <= pitchOffsetThresholds.good) {
    spriteColorIndex = getGoodColorIndex();
  } else if (pitchOffsetAbs <= pitchOffsetThresholds.medium) {
    spriteColorIndex = getMediumColorIndex();
  } else {
    spriteColorIndex = getBadColorIndex();
  }
  await displayCanvasHelper.selectSpriteColor(0, getBackgroundColorIndex());
  await displayCanvasHelper.selectSpriteColor(1, spriteColorIndex);
  await displayCanvasHelper.selectBackgroundColor(getBackgroundColorIndex());
  await displayCanvasHelper.setFillBackground(true);
  await displayCanvasHelper.startSprite(
    drawOffset.x * displayCanvasHelper.width,
    drawOffset.y * displayCanvasHelper.height,
    drawSize.width,
    drawSize.height
  );
  await displayCanvasHelper.setIgnoreFill(true);
  await displayCanvasHelper.setLineWidth(drawLineWidth);
  await displayCanvasHelper.drawArc(
    0,
    0,
    drawSize.width / 2 - drawLineWidth,
    -90,
    normalizedPitchOffset * 145
  );
  await displayCanvasHelper.setSpriteScale(fontScale);
  await displayCanvasHelper.setSpritesLineHeight(spritesLineHeight);
  await displayCanvasHelper.drawSpritesString(
    0,
    0,
    frequency.toNote().slice(0, -1)
  );
  await displayCanvasHelper.endSprite();

  await displayCanvasHelper.show();
};
window.draw = draw;
displayCanvasHelper.addEventListener("ready", () => {
  isDrawing = false;
  if (isWaitingToRedraw || autoDraw) {
    isWaitingToRedraw = false;
    draw();
  }
});
const drawButton = document.getElementById("draw");
drawButton.addEventListener("click", () => {
  draw();
});

// AUTODRAW
const autoDrawCheckbox = document.getElementById("autoDraw");
autoDrawCheckbox.addEventListener("input", () => {
  setAutoDraw(autoDrawCheckbox.checked);
});
let autoDraw = autoDrawCheckbox.checked;
const setAutoDraw = (newAutoDraw) => {
  autoDraw = newAutoDraw;
  console.log({ autoDraw });
  autoDrawCheckbox.checked = autoDraw;
  if (autoDraw) {
    draw();
  }
};

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
setFontScale(1.3);

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
const fontSize = 42;
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

  console.log(`added font "${fullName}"`, { isEnglish });

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

// MICROPHONE AUDIO
/** @type {HTMLAudioElement} */
const microphoneAudio = document.getElementById("microphoneAudio");
let isMicrophoneLoaded = false;
microphoneAudio.addEventListener("loadstart", () => {
  isMicrophoneLoaded = true;
  if (autoDraw) {
    draw();
  }
});
microphoneAudio.addEventListener("emptied", () => {
  isMicrophoneLoaded = false;
});

// AUDIO CONTEXT
const audioContext = new (window.AudioContext || window.webkitAudioContext)({
  sampleRate: 16_000,
  latencyHint: "interactive",
});
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

// TONEJS
/** @type {import("tone")} */
const Tone = window.Tone;
Tone.setContext(audioContext);

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
let getPitch = () => {
  analyser.getFloatTimeDomainData(detectorInput);
  const [pitch, clarity] = detector.findPitch(
    detectorInput,
    audioContext.sampleRate
  );
  //console.log({ pitch, clarity });
  if (clarity < clarityThreshold) {
    return;
  }
  frequency?.dispose();
  perfectFrequency?.dispose();
  frequency = Tone.Frequency(pitch);
  perfectFrequency = Tone.Frequency(frequency.toNote());
  const perfectPitch = perfectFrequency.toFrequency();
  pitchOffset = 1200 * Math.log2(pitch / perfectPitch);
  pitchOffsetAbs = Math.abs(pitchOffset);
  normalizedPitchOffset = pitchOffset / 50;
  console.log({
    pitch,
    perfectPitch,
    pitchOffset,
    pitchOffsetAbs,
    normalizedPitchOffset,
  });
  draw();
};
window.getPitch = getPitch;

const getPitchButton = document.getElementById("getPitch");
getPitchButton.addEventListener("click", () => {
  getPitch();
});

const autoPitchCheckbox = document.getElementById("autoPitch");
let autoPitchIntervalId;
autoPitchCheckbox.addEventListener("input", () => {
  if (autoPitchIntervalId) {
    clearInterval(autoPitchIntervalId);
    autoPitchIntervalId = undefined;
  }
  if (autoPitchCheckbox.checked && isMicrophoneLoaded) {
    autoPitchIntervalId = setInterval(() => {
      getPitch();
    }, 50);
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
  if (autoPitchIntervalId) {
    clearInterval(autoPitchIntervalId);
  }
});

// MICROPHONE
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

didLoad = true;

draw(true);
