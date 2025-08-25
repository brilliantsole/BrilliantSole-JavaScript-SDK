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
  drawImage();
});

const redrawImageButton = document.getElementById("redrawImage");
redrawImageButton.addEventListener("click", () => {
  drawImage();
});

const tempCanvas = document.createElement("canvas");
const tempCtx = tempCanvas.getContext("2d");
const drawImage = async () => {
  let srcWidth, srcHeight, src;
  let useCameraVideo = cameraVideo.srcObject;
  if (useCameraVideo) {
    srcWidth = cameraVideo.videoWidth;
    srcHeight = cameraVideo.videoHeight;
    src = cameraVideo;
  } else {
    srcWidth = image.naturalWidth;
    srcHeight = image.naturalHeight;
    src = image;
  }

  let inputImageScale = 1;
  inputImageScale = drawInputHeight / srcHeight;
  const inputImageWidth = Math.round(srcWidth * inputImageScale);
  const inputImageHeight = Math.round(srcHeight * inputImageScale);

  canvas.width = inputImageWidth;
  canvas.height = inputImageHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (useGrayscale) {
    ctx.filter = "grayscale(100%)";
  }
  ctx.resetTransform();
  if (useCameraVideo && mirrorCamera) {
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
  }

  if (useImageSegmentation && imageSegmenter) {
    tempCanvas.width = srcWidth;
    tempCanvas.height = srcHeight;

    tempCtx.drawImage(
      src,
      0,
      0,
      srcWidth,
      srcHeight,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
    );

    const result = imageSegmenter.segmentForVideo(
      tempCanvas,
      performance.now()
    );
    console.log("imageSegmenter result", result);

    const { width, height } = result.categoryMask;
    let imageData = tempCtx.getImageData(0, 0, width, height).data;
    tempCanvas.width = width;
    tempCanvas.height = height;
    const mask = result.categoryMask.getAsUint8Array();
    for (let i in mask) {
      const isPerson = mask[i] == 0 ? 1 : 0;
      imageData[i * 4] *= isPerson;
      imageData[i * 4 + 1] *= isPerson;
      imageData[i * 4 + 2] *= isPerson;
      //imageData[i * 4 + 3] = 255;
    }
    const uint8Array = new Uint8ClampedArray(imageData.buffer);
    const dataNew = new ImageData(uint8Array, width, height);
    tempCtx.putImageData(dataNew, 0, 0);
    src = tempCanvas;
  }

  ctx.drawImage(
    src,
    0,
    0,
    srcWidth,
    srcHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  draw();
};

// DRAGOVER
window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    if (file.type.startsWith("image/")) {
      loadImage(file);
    }
  }
});

// CONTEXT FILTER
let useGrayscale = false;
const useGrayscaleInput = document.getElementById("useGrayscale");
useGrayscaleInput.addEventListener("input", () => {
  setUseGrayscale(useGrayscaleInput.checked);
});
const setUseGrayscale = (newUseGrayscale) => {
  useGrayscale = newUseGrayscale;
  console.log({ useGrayscale });
  useGrayscaleInput.checked = useGrayscale;
  if (redrawOnChange) {
    drawImage();
  }
};

// REDRAW ON CHANGE
let redrawOnChange = false;
const redrawOnChangeInput = document.getElementById("redrawOnChange");
redrawOnChangeInput.addEventListener("input", () => {
  setRedrawOnChange(redrawOnChangeInput.checked);
});
const setRedrawOnChange = (newRedrawOnChange) => {
  redrawOnChange = newRedrawOnChange;
  console.log({ redrawOnChange });
  redrawOnChangeInput.checked = redrawOnChange;
};

// AUTO DRAW VIDEO
let autoDrawVideo = false;
const autoDrawVideoInput = document.getElementById("autoDrawVideo");
autoDrawVideoInput.addEventListener("input", () => {
  setAutoDrawVideo(autoDrawVideoInput.checked);
});
const setAutoDrawVideo = (newAutoDrawVideo) => {
  autoDrawVideo = newAutoDrawVideo;
  console.log({ autoDrawVideo });
  autoDrawVideoInput.checked = autoDrawVideo;
};

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
  image.src = string;
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
cameraVideo.volume = 0.0001;
cameraVideo.addEventListener("loadedmetadata", () => {
  const { videoWidth, videoHeight } = cameraVideo;
  cameraVideo.removeAttribute("hidden");
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
        width: { ideal: 1280 },
        height: { ideal: 1280 },
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
  cameraVideo.srcObject = undefined;
  cameraVideo.setAttribute("hidden", "");
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
  // console.log({ drawX });
  drawXSpan.innerText = drawX;
});
drawXInput.addEventListener("input", () => {
  if (redrawOnChange) {
    drawImage();
  }
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
drawYInput.addEventListener("change", () => {
  if (redrawOnChange) {
    drawImage();
  }
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
drawInputHeightInput.addEventListener("change", () => {
  if (redrawOnChange) {
    drawImage();
  }
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
drawOutputHeightInput.addEventListener("change", () => {
  if (redrawOnChange) {
    drawImage();
  }
});

// PIXEL DEPTH

let pixelDepth = BS.DisplayPixelDepths[2];
const setPixelDepth = (newPixelDepth) => {
  pixelDepth = newPixelDepth;
  console.log({ pixelDepth });
  if (redrawOnChange) {
    drawImage();
  }
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

// DRAW
let defaultMaxFileLength = 10 * 1024; // 10kb
let currentSpriteIndexBeingDrawn = 0;
let isDrawing = false;
/** @type {BS.DisplaySpriteSheet} */
let spriteSheet;
let debugWholeImage = false;
let drawWhenReady = false;

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const draw = async () => {
  if (!canvas.height || !canvas.width) {
    return;
  }
  if (isDrawing) {
    console.warn("busy drawing");
    drawWhenReady = true;
    return;
  }
  isDrawing = true;

  console.log("drawing...");

  canvas.removeAttribute("hidden");
  cameraVideo.setAttribute("hidden", "");

  const { width, height } = canvas;

  let spriteScale = 1;
  spriteScale = drawOutputHeight / height;

  const outputImageWidth = Math.round(width * spriteScale);
  const outputImageHeight = Math.round(height * spriteScale);

  console.log({ spriteScale, outputImageHeight, outputImageWidth });

  const numberOfColors = 2 ** pixelDepth;

  const maxFileLength = displayCanvasHelper.device?.isConnected
    ? displayCanvasHelper.device.maxFileLength
    : defaultMaxFileLength;

  spriteSheet = await BS.canvasToSpriteSheet(
    canvas,
    "image",
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
  let offsetYTop = drawY - outputImageHeight / 2;
  drawProgress.value = 0;

  for (
    currentSpriteIndexBeingDrawn = 0;
    currentSpriteIndexBeingDrawn < spriteSheet.sprites.length;
    currentSpriteIndexBeingDrawn++
  ) {
    const sprite = spriteSheet.sprites[currentSpriteIndexBeingDrawn];
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
  drawProgress.value = 0;

  for (let i = 0; i < displayCanvasHelper.numberOfColors; i++) {
    if (i >= numberOfColors) {
      await displayCanvasHelper.setColor(i, "black");
    }
  }
  await displayCanvasHelper.selectSpriteSheetPalette("image");
  await displayCanvasHelper.show();

  canvas.setAttribute("hidden", "");
  if (cameraVideo.srcObject) {
    cameraVideo.removeAttribute("hidden");
  }
};

displayCanvasHelper.addEventListener("ready", () => {
  isDrawing = false;
  if (drawWhenReady) {
    drawWhenReady = false;
    //drawImage();
  }
  if (cameraVideo.srcObject && autoDrawVideo) {
    console.log("redrawing video");
    drawImage();
  }
  if (autoPicture && device.isConnected) {
    device.takePicture();
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

/** @type {HTMLProgressElement} */
const drawProgress = document.getElementById("drawProgress");

device.addEventListener("fileTransferProgress", (event) => {
  const progress = event.message.progress;
  console.log({ progress });
  const baseProgress =
    (currentSpriteIndexBeingDrawn + progress) / spriteSheet.sprites.length;
  drawProgress.value = baseProgress;
});

// FRAME CAMERA

/** @type {HTMLButtonElement} */
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  if (device.cameraStatus == "idle") {
    device.takePicture(10);
  } else {
    device.stopCamera();
  }
});
device.addEventListener("connected", () => {
  updateTakePictureButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateTakePictureButton();
});
const updateTakePictureButton = () => {
  takePictureButton.disabled =
    !device.isConnected || device.cameraStatus != "idle";
};
device.addEventListener("cameraStatus", () => {
  updateTakePictureButton();
});

/** @type {HTMLProgressElement} */
const cameraImageProgress = document.getElementById("cameraImageProgress");
device.addEventListener("cameraImageProgress", (event) => {
  if (event.message.type == "image") {
    cameraImageProgress.value = event.message.progress;
  }
});

device.addEventListener("cameraImage", (event) => {
  image.src = event.message.url;
});

/** @type {HTMLButtonElement} */
const focusCameraButton = document.getElementById("focusCamera");
focusCameraButton.addEventListener("click", () => {
  if (device.cameraStatus == "idle") {
    device.focusCamera();
  } else {
    device.stopCamera();
  }
});
device.addEventListener("connected", () => {
  updateFocusCameraButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateFocusCameraButton();
});
const updateFocusCameraButton = () => {
  focusCameraButton.disabled =
    !device.isConnected || device.cameraStatus != "idle";
};
device.addEventListener("cameraStatus", (event) => {
  updateFocusCameraButton();
  if (
    device.cameraStatus == "idle" &&
    event.message.previousCameraStatus == "focusing"
  ) {
    device.takePicture();
  }
});

// CAMERA CONFIG

/** @type {HTMLInputElement} */
const autoPictureCheckbox = document.getElementById("autoPicture");
let autoPicture = autoPictureCheckbox.checked;
autoPictureCheckbox.addEventListener("input", () => {
  autoPicture = autoPictureCheckbox.checked;
});

/** @type {HTMLPreElement} */
const cameraConfigurationPre = document.getElementById(
  "cameraConfigurationPre"
);
device.addEventListener("getCameraConfiguration", () => {
  cameraConfigurationPre.textContent = JSON.stringify(
    device.cameraConfiguration,
    null,
    2
  );
});

const cameraConfigurationContainer = document.getElementById(
  "cameraConfiguration"
);
/** @type {HTMLTemplateElement} */
const cameraConfigurationTypeTemplate = document.getElementById(
  "cameraConfigurationTypeTemplate"
);
BS.CameraConfigurationTypes.forEach((cameraConfigurationType) => {
  const cameraConfigurationTypeContainer =
    cameraConfigurationTypeTemplate.content
      .cloneNode(true)
      .querySelector(".cameraConfigurationType");

  cameraConfigurationContainer.appendChild(cameraConfigurationTypeContainer);

  cameraConfigurationTypeContainer.querySelector(".type").innerText =
    cameraConfigurationType;

  /** @type {HTMLInputElement} */
  const input = cameraConfigurationTypeContainer.querySelector("input");

  /** @type {HTMLSpanElement} */
  const span = cameraConfigurationTypeContainer.querySelector("span");

  device.addEventListener("isConnected", () => {
    updateisInputDisabled();
  });
  device.addEventListener("cameraStatus", () => {
    updateisInputDisabled();
  });
  const updateisInputDisabled = () => {
    input.disabled =
      !device.isConnected || !device.hasCamera || device.cameraStatus != "idle";
  };

  const updateInput = () => {
    const value = device.cameraConfiguration[cameraConfigurationType];
    span.innerText = value;
    input.value = value;
  };

  device.addEventListener("connected", () => {
    if (!device.hasCamera) {
      return;
    }
    const range = device.cameraConfigurationRanges[cameraConfigurationType];
    input.min = range.min;
    input.max = range.max;

    updateInput();
  });

  device.addEventListener("getCameraConfiguration", () => {
    updateInput();
  });

  input.addEventListener("change", () => {
    const value = Number(input.value);
    // console.log(`updating ${cameraConfigurationType} to ${value}`);
    device.setCameraConfiguration({
      [cameraConfigurationType]: value,
    });
    if (takePictureAfterUpdate) {
      device.addEventListener(
        "getCameraConfiguration",
        () => {
          setTimeout(() => device.takePicture()), 100;
        },
        { once: true }
      );
    }
  });
});

/** @type {HTMLInputElement} */
const takePictureAfterUpdateCheckbox = document.getElementById(
  "takePictureAfterUpdate"
);
let takePictureAfterUpdate = false;
takePictureAfterUpdateCheckbox.addEventListener("input", () => {
  takePictureAfterUpdate = takePictureAfterUpdateCheckbox.checked;
  console.log({ takePictureAfterUpdate });
});

/** @type {HTMLInputElement} */
const cameraWhiteBalanceInput = document.getElementById("cameraWhiteBalance");
const updateWhiteBalance = BS.ThrottleUtils.throttle(
  (config) => {
    if (device.cameraStatus != "idle") {
      return;
    }

    device.setCameraConfiguration(config);

    if (takePictureAfterUpdate) {
      device.addEventListener(
        "getCameraConfiguration",
        () => {
          setTimeout(() => device.takePicture()), 100;
        },
        { once: true }
      );
    }
  },
  200,
  true
);
cameraWhiteBalanceInput.addEventListener("input", () => {
  let [redGain, greenGain, blueGain] = cameraWhiteBalanceInput.value
    .replace("#", "")
    .match(/.{1,2}/g)
    .map((value) => Number(`0x${value}`))
    .map((value) => value / 255)
    .map((value) => value * device.cameraConfigurationRanges.blueGain.max)
    .map((value) => Math.round(value));

  updateWhiteBalance({ redGain, greenGain, blueGain });
});
const updateCameraWhiteBalanceInput = () => {
  if (!device.hasCamera) {
    return;
  }
  cameraWhiteBalanceInput.disabled =
    !device.isConnected || !device.hasCamera || device.cameraStatus != "idle";

  const { redGain, blueGain, greenGain } = device.cameraConfiguration;

  cameraWhiteBalanceInput.value = `#${[redGain, blueGain, greenGain]
    .map((value) => value / device.cameraConfigurationRanges.redGain.max)
    .map((value) => value * 255)
    .map((value) => Math.round(value))
    .map((value) => value.toString(16))
    .join("")}`;
};
device.addEventListener("connected", () => {
  updateCameraWhiteBalanceInput();
});
device.addEventListener("getCameraConfiguration", () => {
  updateCameraWhiteBalanceInput();
});

// IMAGE SEGMENTATION

let imageSegmenter = undefined;
let runningMode = "LIVE_STREAM";
let labels;

import {
  ImageSegmenter,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2";

let useImageSegmentation = false;
const useImageSegmentationInput = document.getElementById(
  "useImageSegmentation"
);
useImageSegmentationInput.addEventListener("input", () => {
  setUseImageSegmentation(useImageSegmentationInput.checked);
});
const setUseImageSegmentation = (newUseImageSegmentation) => {
  useImageSegmentation = newUseImageSegmentation;
  console.log({ useImageSegmentation });
  useImageSegmentationInput.checked = useImageSegmentation;

  if (!imageSegmenter) {
    createImageSegmenter();
  }
};

const modelAssetPaths = {
  selfieMulticlass:
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite",
  hairSegmenter:
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite",
  selfieSegmenter:
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
  deeplab:
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/latest/deeplab_v3.tflite",
};
const createImageSegmenter = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
  );

  imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: modelAssetPaths.selfieSegmenter,
      delegate: "GPU",
    },

    runningMode: runningMode,
    outputCategoryMask: true,
    outputConfidenceMasks: false,
  });
  labels = imageSegmenter.getLabels();
  console.log("created imageSegmenter", imageSegmenter, labels);
};
createImageSegmenter();
