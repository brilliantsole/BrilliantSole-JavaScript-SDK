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

// WEBSOCKET CLIENT

const client = new BS.WebSocketClient();
window.client = client;

// WEBSOCKET URL SEARCH PARAMS

const url = new URL(location);
function setUrlParam(key, value) {
  if (history.pushState) {
    let searchParams = new URLSearchParams(window.location.search);
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    let newUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      searchParams.toString();
    window.history.pushState({ path: newUrl }, "", newUrl);
  }
}
client.addEventListener("isConnected", () => {
  if (client.isConnected) {
    setUrlParam("webSocketUrl", client.webSocket.url);
    webSocketUrlInput.value = client.webSocket.url;
    webSocketUrlInput.dispatchEvent(new Event("input"));
  } else {
    setUrlParam("webSocketUrl");
  }
});

// WEBSOCKET SERVER URL

/** @type {HTMLInputElement} */
const webSocketUrlInput = document.getElementById("webSocketUrl");
webSocketUrlInput.value = url.searchParams.get("webSocketUrl") || "";
webSocketUrlInput.dispatchEvent(new Event("input"));

// WEBSOCKET CONNECTION

/** @type {HTMLButtonElement} */
const toggleClientConnectionButton = document.getElementById(
  "toggleClientConnection"
);
toggleClientConnectionButton.addEventListener("click", () => {
  if (client.isConnected) {
    client.disconnect();
  } else {
    /** @type {string?} */
    let webSocketUrl;
    if (webSocketUrlInput.value.length > 0) {
      webSocketUrl = webSocketUrlInput.value;
    }
    client.connect(webSocketUrl);
  }
});
client.addEventListener("connectionStatus", () => {
  switch (client.connectionStatus) {
    case "connected":
    case "notConnected":
      toggleClientConnectionButton.disabled = false;
      toggleClientConnectionButton.innerText = client.isConnected
        ? "disconnect from server"
        : "connect to server";
      break;
    case "connecting":
    case "disconnecting":
      toggleClientConnectionButton.innerText = client.connectionStatus;
      toggleClientConnectionButton.disabled = true;
      break;
  }
});

// WEBSOCKET SCANNER

/** @type {HTMLInputElement} */
const isScanningAvailableCheckbox = document.getElementById(
  "isScanningAvailable"
);
client.addEventListener("isScanningAvailable", () => {
  isScanningAvailableCheckbox.checked = client.isScanningAvailable;
});

/** @type {HTMLButtonElement} */
const toggleScanButton = document.getElementById("toggleScan");
toggleScanButton.addEventListener("click", () => {
  client.toggleScan();
});
client.addEventListener("isScanningAvailable", () => {
  toggleScanButton.disabled = !client.isScanningAvailable;
});
client.addEventListener("isScanning", () => {
  toggleScanButton.innerText = client.isScanning ? "stop scanning" : "scan";
});

/** @type {BS.Device?} */
let clientDevice;
client.addEventListener("discoveredDevice", (event) => {
  console.log(event);
  if (clientDevice) {
    return;
  }
  const { discoveredDevice } = event.message;
  if (discoveredDevice.deviceType == "glasses") {
    console.log("connecting to discoveredDevice", discoveredDevice);
    clientDevice = client.connectToDevice(discoveredDevice.bluetoothId);
  }
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
});
const loadImage = (file) => {
  const reader = new FileReader();
  reader.onload = () => {
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
};
image.addEventListener("load", () => {
  drawImage(image);
});

const redrawImageButton = document.getElementById("redrawImage");
redrawImageButton.addEventListener("click", () => {
  drawImage(image);
});

// DRAGOVER
window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    if (file.type.startsWith("image/")) {
      setPreviewMode("image");
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

  switch (previewMode) {
    case "image":
      image.src = string;
      break;
  }
});
window.addEventListener("paste", (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      loadImage(file);
      return;
    }
  }
});

// CAMERA
/** @type {HTMLVideoElement} */
const cameraVideo = document.getElementById("cameraVideo");
cameraVideo.addEventListener("loadedmetadata", () => {
  const { videoWidth, videoHeight } = cameraVideo;
});
const toggleMirrorCameraButton = document.getElementById("toggleMirrorCamera");
let mirrorCamera = false;
const setMirrorCamera = (newMirrorCamera) => {
  mirrorCamera = newMirrorCamera;
  // console.log({ mirrorCamera });
  cameraVideo.style.transform = mirrorCamera ? "scaleX(-1)" : "";
  toggleMirrorCameraButton.innerText = mirrorCamera
    ? "unmirror camera"
    : "mirror camera";
};
toggleMirrorCameraButton.addEventListener("click", () => {
  setMirrorCamera(!mirrorCamera);
});
setMirrorCamera(true);

const takeSnapshotButton = document.getElementById("takeSnapshot");
takeSnapshotButton.addEventListener("click", () => takeSnapshot());
const takeSnapshot = () => {
  // FILL - grab frame from video
};

/** @type {HTMLSelectElement} */
const cameraInput = document.getElementById("cameraInput");
const cameraInputOptgroup = cameraInput.querySelector("optgroup");
cameraInput.addEventListener("input", () => {
  selectCameraInput(cameraInput.value);
});
const updateCameraSources = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  cameraInputOptgroup.innerHTML = "";
  cameraInputOptgroup.appendChild(new Option("none"));
  devices
    .filter((device) => device.kind == "videoinput")
    .forEach((videoInputDevice) => {
      cameraInputOptgroup.appendChild(
        new Option(videoInputDevice.label, videoInputDevice.deviceId)
      );
    });
  cameraInput.value = "none";
  selectCameraInput(cameraInput.value);
};
/** @type {MediaStream?} */
let cameraStream;
const selectCameraInput = async (deviceId) => {
  stopCameraStream();
  if (deviceId != "none") {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        // width: { ideal: 1280 },
        // height: { ideal: 720 },
      },
    });

    cameraVideo.srcObject = cameraStream;
    console.log("got cameraStream", deviceId, cameraStream);
  }
};
const stopCameraStream = () => {
  if (cameraStream) {
    console.log("stopping cameraStream");
    cameraStream.getVideoTracks().forEach((track) => track.stop());
  }
  cameraStream = undefined;
};
navigator.mediaDevices.addEventListener("devicechange", () =>
  updateCameraSources()
);
updateCameraSources();

// DRAW PARAMS

const drawXContainer = document.getElementById("drawX");
const drawXInput = drawXContainer.querySelector("input");
const drawXSpan = drawXContainer.querySelector("span.value");
let drawX = Number(drawXInput.value);

drawXInput.addEventListener("input", () => {
  drawX = Number(drawXInput.value);
  //console.log({ drawX });
  drawXSpan.innerText = drawX;
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

const drawInputHeightContainer = document.getElementById("drawInputHeight");
const drawInputHeightInput = drawInputHeightContainer.querySelector("input");
const drawInputHeightSpan =
  drawInputHeightContainer.querySelector("span.value");
let drawInputHeight = Number(drawInputHeightInput.value);

drawInputHeightInput.addEventListener("input", () => {
  drawInputHeight = Number(drawInputHeightInput.value);
  //console.log({ drawInputHeight });
  drawInputHeightSpan.innerText = drawInputHeight;
});

const drawOutputHeightContainer = document.getElementById("drawOutputHeight");
const drawOutputHeightInput = drawOutputHeightContainer.querySelector("input");
const drawOutputHeightSpan =
  drawOutputHeightContainer.querySelector("span.value");
let drawOutputHeight = Number(drawOutputHeightInput.value);

drawOutputHeightInput.addEventListener("input", () => {
  drawOutputHeight = Number(drawOutputHeightInput.value);
  //console.log({ drawOutputHeight });
  drawOutputHeightSpan.innerText = drawOutputHeight;
});

// PIXEL DEPTH

let pixelDepth = BS.DisplayPixelDepths[2];
const setPixelDepth = (newPixelDepth) => {
  pixelDepth = newPixelDepth;
  console.log({ pixelDepth });
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

// PICTURE
let defaultMaxFileLength = 10 * 1024; // 10kb
let isDrawingImage = false;
let debugWholeImage = false;
/** @param {HTMLImageElement} image */
const drawImage = async (image) => {
  if (!image.naturalHeight || !image.naturalWidth) {
    return;
  }
  if (isDrawingImage) {
    console.warn("busy drawing image");
    return;
  }
  isDrawingImage = true;

  console.log("drawImage", image);

  const { naturalWidth, naturalHeight } = image;
  let inputImageScale = 1;
  inputImageScale = drawInputHeight / naturalHeight;
  const inputImageWidth = Math.round(naturalWidth * inputImageScale);
  const inputImageHeight = Math.round(naturalHeight * inputImageScale);

  console.log({ inputImageScale, inputImageHeight, inputImageWidth });

  let spriteScale = 1;
  spriteScale = drawOutputHeight / inputImageHeight;

  const outputImageWidth = Math.round(inputImageWidth * spriteScale);
  const outputImageHeight = Math.round(inputImageHeight * spriteScale);

  console.log({ spriteScale, outputImageHeight, outputImageWidth });

  const numberOfColors = 2 ** pixelDepth;

  const maxFileLength = displayCanvasHelper.device?.isConnected
    ? displayCanvasHelper.device.maxFileLength
    : defaultMaxFileLength;

  const spriteSheet = await BS.imageToSpriteSheet(
    image,
    "image",
    inputImageWidth,
    inputImageHeight,
    numberOfColors,
    "image",
    maxFileLength
  );
  console.log("spriteSheet", spriteSheet);

  await displayCanvasHelper.setSpriteScale(spriteScale);

  await displayCanvasHelper.resetSpriteColors();
  /** @type {BS.DisplaySpriteColorPair[]} */
  const spriteColorPairs = [];
  for (let i = 0; i < numberOfColors; i++) {
    spriteColorPairs.push({ colorIndex: i, spriteColorIndex: i });
  }
  await displayCanvasHelper.selectSpriteColors(spriteColorPairs);

  if (debugWholeImage) {
    await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
    await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
  }
  const offsetX = drawX;
  let offsetYTop = drawY - (spriteScale * inputImageHeight) / 2;
  for (let i = 0; i < spriteSheet.sprites.length; i++) {
    const sprite = spriteSheet.sprites[i];
    const scaledSpriteHeight = sprite.height * spriteScale;
    let offsetY = offsetYTop + scaledSpriteHeight / 2;
    console.log("drawing sprite", sprite, { offsetX, offsetY });
    if (debugWholeImage) {
      await displayCanvasHelper.drawSprite(offsetX, offsetY, sprite.name);
    } else {
      await displayCanvasHelper.drawSpriteFromSpriteSheet(
        offsetX,
        offsetY,
        sprite.name,
        spriteSheet,
        true
      );
    }
    offsetYTop += scaledSpriteHeight;
  }

  for (let i = 0; i < displayCanvasHelper.numberOfColors; i++) {
    if (i >= numberOfColors) {
      await displayCanvasHelper.setColor(i, "black");
    }
  }
  await displayCanvasHelper.selectSpriteSheetPalette("image");
  await displayCanvasHelper.show();

  isDrawingImage = false;
};
