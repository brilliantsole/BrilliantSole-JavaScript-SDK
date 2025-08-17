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
const selectColorIndex = (newColorIndex) => {
  selectedColorIndex = newColorIndex;
  displayColorRadios[selectedColorIndex].checked = true;
  console.log({ selectedColorIndex });
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
});
drawYInput.addEventListener("input", () => {
  draw();
});

const drawFontSizeContainer = document.getElementById("drawFontSize");
const drawFontSizeInput = drawFontSizeContainer.querySelector("input");
const drawFontSizeSpan = drawFontSizeContainer.querySelector("span.value");
let drawFontSize = Number(drawFontSizeInput.value);

drawFontSizeInput.addEventListener("input", () => {
  drawFontSize = Number(drawFontSizeInput.value);
  //console.log({ drawFontSize });
  drawFontSizeSpan.innerText = drawFontSize;
});
drawFontSizeInput.addEventListener("input", () => {
  draw();
});

// DRAW
let defaultMaxFileLength = 10 * 1024; // 10kb
let isDrawing = false;
let isWaitingToRedraw = false;
/** @type {BS.DisplaySpriteSheet} */
let spriteSheet;

const draw = async () => {
  if (isDrawing) {
    //console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }
  isDrawing = true;

  // FILL
  const text = textarea.value;
  console.log(`drawing "${text}"`);

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

// FONTS

/** @type {HTMLInputElement} */
const loadFontInput = document.getElementById("loadFont");
loadFontInput.addEventListener("input", async () => {
  const file = loadFontInput.files[0];
  if (!file) return;
  const arrayBuffer = await file.arrayBuffer();
  loadFont(arrayBuffer);
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
async function getGoogleFonts(cssUrl) {
  const res = await fetch(cssUrl);
  if (!res.ok) throw new Error(`Failed to fetch CSS: ${res.status}`);
  const cssText = await res.text();

  // Regex to match @font-face with normal style and weight 400
  const regex =
    /@font-face\s*{[^}]*font-style:\s*normal;[^}]*font-weight:\s*400;[^}]*src:\s*url\(([^)]+\.woff2)\)/gi;
  const urls = [];
  let match;

  while ((match = regex.exec(cssText)) !== null) {
    const url = match[1].replace(/["']/g, ""); // Remove quotes if any
    urls.push(url);
  }

  return urls.slice(-1);
}
const loadFontUrl = async (string) => {
  if (!isValidUrl(string)) {
    return;
  }

  if (isGoogleFontsUrl(string)) {
    const fonts = await getGoogleFonts(string);
    console.log("google fonts", fonts);
    for (const index in fonts) {
      const response = await fetch(fonts[index]);
      const arrayBuffer = await response.arrayBuffer();
      loadFont(arrayBuffer);
    }
  } else {
    if (validFontExtensions.every((extension) => !string.endsWith(extension))) {
      return;
    }
    const response = await fetch(string);
    const arrayBuffer = await response.arrayBuffer();
    loadFont(arrayBuffer);
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
      loadFont(arrayBuffer);
    }
  }
});

const loadFont = async (arrayBuffer) => {
  if (!arrayBuffer) {
    return;
  }
  const font = await displayCanvasHelper.parseFont(arrayBuffer);
  if (font) {
    addFont(font);
  }
};

/** @type {BS.Font[]} */
let fonts = [];
/** @param {BS.Font} font */
const addFont = (font) => {
  const fullName = font.getEnglishName("fullName");
  const existingFont = fonts.find(
    (_font) => _font.getEnglishName("fullName") == fullName
  );
  if (existingFont) {
    console.log(`replacing "${fullName}" font`);
    fonts[fonts.indexOf(existingFont)] = font;
  } else {
    fonts.push(font);
    console.log(`added "${fullName}" font`);
  }
  updateFontSelect();
};

/** @type {HTMLSelectElement} */
const selectFontSelect = document.getElementById("selectFont");
const selectFontOptgroup = selectFontSelect.querySelector("optgroup");
const updateFontSelect = () => {
  selectFontOptgroup.innerHTML = "";
  fonts.forEach((font) => {
    selectFontOptgroup.appendChild(new Option(font.getEnglishName("fullName")));
  });
  if (!selectedFont) {
    selectFont(selectFontSelect.value);
  }
};

selectFontSelect.addEventListener("input", () => {
  const fontName = selectFontSelect.value;
  selectFont(fontName);
});

/** @type {BS.Font?} */
let selectedFont;
const selectFont = (newFontName) => {
  const newFont = fonts[newFontName];
  selectedFont = newFont;
  console.log(`selected font "${newFontName}"`, selectedFont);
};

// TEXTAREA

/** @type {HTMLTextAreaElement} */
const textarea = document.getElementById("textarea");

textarea.addEventListener("input", () => {
  draw();
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

// FONTS

loadFontUrl("https://fonts.googleapis.com/css2?family=Roboto");
loadFontUrl("https://fonts.googleapis.com/css2?family=Mozilla+Text");
loadFontUrl("https://fonts.googleapis.com/css2?family=Inter");
loadFontUrl("https://fonts.googleapis.com/css2?family=Noto+Sans+JP");
