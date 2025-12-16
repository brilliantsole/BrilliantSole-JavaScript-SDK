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
const getImageNumberOfColors = () => displayCanvasHelper.numberOfColors - 2;
const getTextColorIndex = () => displayCanvasHelper.numberOfColors - 1;
const getTextBackgroundColorIndex = () =>
  displayCanvasHelper.numberOfColors - 2;
displayCanvasHelper.setColor(getTextColorIndex(), "white");
displayCanvasHelper.setColor(getTextBackgroundColorIndex(), "black"); // can set later
displayCanvasHelper.flushContextCommands();

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
let drawnImageWidth = 120;
let cameraImageScale = 2;
let imagePadding = 10;
/** @type {BS.DisplaySpriteSheet} */
let cameraImageSpriteSheet;
let didUploadCameraImageSpriteSheet = false;
let isTakingPicture = false;
let isUploadingPicture = false;
const uploadPictureSpriteSheet = async () => {
  didUploadCameraImageSpriteSheet = false;
  isUploadingPicture = true;
  await draw();
  const aspectRatio = cameraImage.naturalWidth / cameraImage.naturalHeight;
  cameraImageSpriteSheet = await BS.imageToSpriteSheet(
    cameraImage,
    cameraImageName,
    cameraImageName,
    drawnImageWidth,
    drawnImageWidth / aspectRatio,
    getImageNumberOfColors(),
    cameraImageName
  );
  cameraImageSpriteSheet.palettes[0].colors[0] = "black";
  console.log("cameraImageSpriteSheet", cameraImageSpriteSheet);
  await displayCanvasHelper.uploadSpriteSheet(cameraImageSpriteSheet);
  isUploadingPicture = false;
  didUploadCameraImageSpriteSheet = true;
  await draw();
};
let cameraImageName = "*cameraImage*";
const draw = async () => {
  if (isUploading) {
    console.log("still uploading");
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

  console.log("drawing...");

  if (
    !isTakingPicture &&
    includePicture &&
    didUploadCameraImageSpriteSheet &&
    !isUploadingPicture &&
    displayCanvasHelper.spriteSheets[cameraImageName]
  ) {
    console.log("drawing camera image...");
    await displayCanvasHelper.saveContext();
    await displayCanvasHelper.setHorizontalAlignment("end");
    await displayCanvasHelper.setVerticalAlignment("start");
    await displayCanvasHelper.selectSpriteSheet(cameraImageName);
    await displayCanvasHelper.selectSpriteSheetPalette(
      cameraImageName,
      0,
      true
    );
    await displayCanvasHelper.setSpriteScale(cameraImageScale);
    await displayCanvasHelper.drawSprite(
      displayCanvasHelper.width,
      0,
      cameraImageName
    );
    await displayCanvasHelper.selectSpriteSheetPalette(cameraImageName, 0);
    await displayCanvasHelper.restoreContext();
  }

  {
    await displayCanvasHelper.saveContext();

    await displayCanvasHelper.setSpriteScale(fontScale);
    await displayCanvasHelper.selectSpriteColor(
      0,
      getTextBackgroundColorIndex()
    );
    await displayCanvasHelper.selectSpriteColor(1, getTextColorIndex());
    await displayCanvasHelper.selectBackgroundColor(
      getTextBackgroundColorIndex()
    );
    await displayCanvasHelper.setFillBackground(true);
    await displayCanvasHelper.setHorizontalAlignment("start");
    await displayCanvasHelper.setVerticalAlignment("start");

    let text = textarea.value;
    if (isTakingPicture) {
      text = "taking picture...";
    }
    if (isUploadingPicture) {
      text = "uploading picture...";
    }
    if (isPrompting && ignoreString) {
      text = "start speaking...";
    }
    if (isThinking) {
      text += " (Thinking...)";
    }
    await displayCanvasHelper.drawSpritesString(
      0,
      0,
      text,
      false,
      displayCanvasHelper.width -
        (includePicture ? drawnImageWidth * cameraImageScale + imagePadding : 0)
    );
    await displayCanvasHelper.restoreContext();
  }

  await displayCanvasHelper.show();
};
window.draw = draw;

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

async function getImageFromString(string) {
  if (!string) return null;

  // Handle data URLs directly (e.g. data:image/png;base64,...)
  if (string.startsWith("data:image/")) {
    try {
      const response = await fetch(string);
      return await response.blob();
    } catch (err) {
      console.error("Failed to parse data URL:", err);
      return null;
    }
  }

  // Validate normal URL
  if (!isValidUrl(string)) return null;

  try {
    const url = new URL(string);
    const extension = url.pathname.split(".").pop().toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];

    // Check file extension first
    if (imageExtensions.includes(extension)) {
      const response = await fetch(url);
      return await response.blob();
    }

    // Fallback: Check content-type via HEAD request
    const head = await fetch(url, { method: "HEAD" });
    const contentType = head.headers.get("content-type") || "";
    if (contentType.startsWith("image/")) {
      const response = await fetch(url);
      return await response.blob();
    }

    return null;
  } catch (err) {
    console.error("Error fetching image from string:", err);
    return null;
  }
}

window.addEventListener("paste", async (event) => {
  const string = event.clipboardData.getData("text");
  const blob = await getImageFromString(string);
  console.log({ string }, blob);
  if (!blob) {
    return;
  }
  await onImageBlob(blob);
});
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log("item.type", item.type);
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      console.log("file", file);
      if (file) {
        onImageBlob(file);
      }
    }
  }
});

// DRAGOVER

window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", async (e) => {
  e.preventDefault();
  for (const file of e.dataTransfer.files) {
    console.log(file.type);
    if (file.type.startsWith("image/")) {
      await onImageBlob(file);
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
setMirrorCamera(false);

/** @type {HTMLSelectElement} */
const cameraInput = document.getElementById("cameraInput");
const cameraInputOptgroup = cameraInput.querySelector("optgroup");
cameraInput.addEventListener("input", () => {
  selectCameraInput(cameraInput.value);
});

cameraInput.addEventListener("click", async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind == "videoinput");
  console.log("videoDevices", videoDevices);
  if (videoDevices.length == 1 && videoDevices[0].deviceId == "") {
    console.log("getting camera");
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    cameraStream.getVideoTracks().forEach((track) => track.stop());
    updateCameraSources();
  }
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
        // height: { ideal: 1280 },
      },
    });

    setShowCameraVideo(true);
    setIncludePicture(true);
    cameraVideo.srcObject = cameraStream;
    console.log("got cameraStream", deviceId, cameraStream);
  }
  updateTakePictureButton();
  updateToggleIncludePictureCheckbox();
};
const stopCameraStream = () => {
  if (cameraStream) {
    console.log("stopping cameraStream");
    cameraStream.getVideoTracks().forEach((track) => track.stop());
  }
  cameraStream = undefined;
  cameraVideo.srcObject = undefined;
  setShowCameraVideo(false);
  setIncludePicture(device.isConnected);
};
navigator.mediaDevices.addEventListener("devicechange", () =>
  updateCameraSources()
);
updateCameraSources();

// DEVICE CAMERA

const imageHeight = 720;
const getImageHeight = () =>
  device.isConnected ? device.cameraConfiguration.resolution : imageHeight;
device.addEventListener("cameraImage", (event) => {
  cameraImage.src = event.message.url;
});

/** @type {HTMLProgressElement} */
const cameraImageProgress = document.getElementById("cameraImageProgress");
device.addEventListener("cameraImageProgress", (event) => {
  if (event.message.type == "image") {
    cameraImageProgress.value = event.message.progress;
  }
});

device.addEventListener("connected", async () => {
  if (device.hasCamera) {
    console.log("setting camera configuration");
    await device.setCameraConfiguration({ resolution: imageHeight });
  }
});

/** @type {HTMLButtonElement} */
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  takePicture();
});
const takePicture = async () => {
  if (isTakingPicture) {
    console.warn("already taking picture");
    return;
  }
  isTakingPicture = true;
  await draw();
  const promise = new Promise((resolve) => {
    cameraImage.addEventListener("load", () => resolve());
  });
  if (device.isConnected && device.cameraStatus == "idle") {
    device.takePicture();
  } else if (cameraStream) {
    const imageBlob = await getMediaElementBlob(cameraVideo);
    setShowCameraVideo(false);
    onImageBlob(imageBlob);
  }
  await promise;
  isTakingPicture = false;
};
const setShowCameraVideo = (showCamera) => {
  return;
  if (showCamera) {
    cameraVideo.removeAttribute("hidden");
  } else {
    cameraVideo.setAttribute("hidden", "");
  }
};
device.addEventListener("connected", () => {
  updateTakePictureButton();
  updateToggleIncludePictureCheckbox();
});
device.addEventListener("getSensorConfiguration", () => {
  updateTakePictureButton();
  updateToggleIncludePictureCheckbox();
});
const updateTakePictureButton = () => {
  takePictureButton.disabled = !device.isConnected && !cameraStream;
};
device.addEventListener("cameraStatus", () => {
  updateTakePictureButton();
  updateToggleIncludePictureCheckbox();
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

/** @type {HTMLTemplateElement} */
const cameraConfigurationTypeTemplate = document.getElementById(
  "cameraConfigurationTypeTemplate"
);

BS.CameraConfigurationTypes.forEach((cameraConfigurationType) => {
  switch (cameraConfigurationType) {
    case "redGain":
    case "greenGain":
    case "blueGain":
      return;
  }
  const cameraConfigurationTypeContainer =
    cameraConfigurationTypeTemplate.content
      .cloneNode(true)
      .querySelector(".cameraConfigurationType");

  device.addEventListener("isConnected", () => {
    if (device.isConnected) {
      cameraConfigurationTypeContainer.classList.remove("hidden");
    } else {
      cameraConfigurationTypeContainer.classList.add("hidden");
    }
  });

  cameraConfigurationTypeTemplate.parentNode.insertBefore(
    cameraConfigurationTypeContainer,
    cameraConfigurationTypeTemplate.nextSibling
  );

  /** @type {HTMLInputElement} */
  const input = cameraConfigurationTypeContainer.querySelector("input");

  /** @type {HTMLSpanElement} */
  const typeSpan = cameraConfigurationTypeContainer.querySelector("span.type");
  /** @type {HTMLSpanElement} */
  const valueSpan =
    cameraConfigurationTypeContainer.querySelector("span.value");

  typeSpan.innerText = cameraConfigurationType;

  device.addEventListener("isConnected", () => {
    updateisInputDisabled();
  });
  device.addEventListener("connected", () => {
    updateContainerVisibility();
  });
  device.addEventListener("cameraStatus", () => {
    updateisInputDisabled();
  });
  const updateisInputDisabled = () => {
    input.disabled =
      !device.isConnected || !device.hasCamera || device.cameraStatus != "idle";
  };

  const updateContainerVisibility = () => {
    const isVisible = cameraConfigurationType in device.cameraConfiguration;
    cameraConfigurationTypeContainer.style.display = isVisible ? "" : "none";
  };

  const updateInput = () => {
    const value = device.cameraConfiguration[cameraConfigurationType];
    valueSpan.innerText = value;
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
    setIncludePicture(true);
  });

  device.addEventListener("getCameraConfiguration", () => {
    updateInput();
  });

  input.addEventListener("change", () => {
    const value = Number(input.value);
    console.log(`updating ${cameraConfigurationType} to ${value}`);
    device.setCameraConfiguration({
      [cameraConfigurationType]: value,
    });
    if (true) {
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

// IMAGE UTILS

async function getMediaElementBlob(element, type = "image/png", maxHeight) {
  maxHeight = maxHeight ?? getImageHeight();
  console.log({ maxHeight });
  return new Promise((resolve, reject) => {
    try {
      const width = element.videoWidth || element.naturalWidth || element.width;
      const height =
        element.videoHeight || element.naturalHeight || element.height;

      if (!width || !height) {
        reject(new Error("Invalid element dimensions"));
        return;
      }

      // Scale dimensions to maintain aspect ratio
      const scale = Math.min(1, maxHeight / height);
      const newWidth = Math.round(width * scale);
      const newHeight = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext("2d");
      if (mirrorCamera) {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      }
      ctx.drawImage(element, 0, 0, newWidth, newHeight);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
        } else {
          resolve(blob);
        }
      }, type);
    } catch (err) {
      reject(err);
    }
  });
}

async function resizeImageBlob(blob, maxHeight) {
  maxHeight = maxHeight ?? getImageHeight();
  // Create an image element from the blob
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(blob);
  });

  // Calculate new dimensions while keeping aspect ratio
  const scale = Math.min(1, maxHeight / img.naturalHeight);
  const width = img.naturalWidth * scale;
  const height = img.naturalHeight * scale;

  // Draw the resized image onto a canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  // Convert the canvas back to a blob
  return await new Promise((resolve) => {
    return canvas.toBlob(resolve, blob.type || "image/png");
  });
}

// PROMPT

/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");

/** @param {Blob} imageBlob */
const onImageBlob = async (imageBlob, resize = true) => {
  console.log("onImageBlob", imageBlob);
  if (resize) {
    imageBlob = await resizeImageBlob(imageBlob, getImageHeight());
  }
  cameraImage.src = URL.createObjectURL(imageBlob);
};

let includePicture = false;
const setIncludePicture = (newIncludePicture) => {
  includePicture = newIncludePicture;
  console.log({ includePicture });
  toggleIncludePictureCheckbox.checked = includePicture;
};
const toggleIncludePictureCheckbox = document.getElementById(
  "toggleIncludePicture"
);
toggleIncludePictureCheckbox.addEventListener("input", () => {
  setIncludePicture(toggleIncludePictureCheckbox.checked);
});
setIncludePicture(false);
const updateToggleIncludePictureCheckbox = () => {
  const enabled = device.isConnected || cameraStream;
  toggleIncludePictureCheckbox.disabled = !enabled;
  if (!enabled && includePicture) {
    setIncludePicture(false);
  }
};

const togglePromptButton = document.getElementById("togglePrompt");
let isPrompting = false;
let togglePrompt = async () => {
  //console.log({ isPrompting, mediaRecorder });
  if (mediaRecorder && isPrompting) {
    await stopPrompting();
  } else if (microphoneStream) {
    await startPrompting();
  }
};
togglePrompt = BS.ThrottleUtils.throttle(togglePrompt, 2000, true);
const startPrompting = async () => {
  console.log("starting prompting");
  textarea.value = "";
  if (includePicture) {
    await takePicture();
    await uploadPictureSpriteSheet();
  }
  isPrompting = true;
  await startTranscribing();
};
const stopPrompting = async () => {
  console.log("stopping prompting");
  isPrompting = false;
  await stopTranscribing();
  await createPrompt();
};
togglePromptButton.addEventListener("click", async () => {
  togglePrompt();
});
const updateTogglePromptButton = () => {
  togglePromptButton.disabled = !microphoneStream;
  togglePromptButton.innerText = isPrompting ? "stop prompt" : "start prompt";
};

let promptAvailability = await LanguageModel.availability();
console.log({ promptAvailability });

let isThinking = false;
const createPrompt = async () => {
  isThinking = true;
  draw();
  try {
    const expectedInputs = [];
    if (includePicture) {
      expectedInputs.push({ type: "image" });
    }
    const session = await LanguageModel.create({
      expectedInputs,
    });
    const prompt = `${textarea.value}`;

    const content = [{ type: "text", value: prompt }];
    if (includePicture) {
      content.push({ type: "image", value: cameraImage });
    }

    const stream = session.promptStreaming([
      {
        role: "system",
        content:
          "You are a helpful and friendly assistant whose responses appear in smart glasses. Your response must be a single paragraph (no emojis) containing max 200 characters (including spaces).",
      },
      {
        role: "user",
        content: content,
      },
    ]);
    let didDrawFirstChunk = false;
    for await (let chunk of stream) {
      chunk = chunk.replaceAll("\n", "");
      if (!didDrawFirstChunk) {
        isThinking = false;
        textarea.value = "";
        didDrawFirstChunk = true;
      }
      textarea.value += chunk;
      draw();
    }
  } catch (error) {
    console.error(error);
  }
  isThinking = false;
};

device.addEventListener("connected", () => {
  device.setSensorConfiguration({ tapDetector: 40 });
});
device.addEventListener("tapDetector", (event) => {
  console.log("tap");
  togglePrompt();
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
/** @type {MediaRecorder} */
let mediaRecorder;
const selectFont = async (newFontName) => {
  let wasTranscribing = Boolean(mediaRecorder);
  if (wasTranscribing) {
    await stopTranscribing();
  }

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
  console.log({ spritesLineHeight }, selectedFont, fontSize);
  await displayCanvasHelper.setSpritesLineHeight(spritesLineHeight);
  await draw();
};

await loadFontUrl("https://fonts.googleapis.com/css2?family=Roboto");

// MICROPHONE

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
const selectMicrophone = async (deviceId) => {
  stopMicrophoneStream();
  if (deviceId == "none") {
    await stopTranscribing();
    microphoneAudio.setAttribute("hidden", "");
    if (device.hasMicrophone) {
      await device.stopMicrophone();
    }
  } else {
    await loadModel();

    if (deviceId == "device") {
      microphoneStream = device.microphoneMediaStreamDestination.stream;
      console.log("starting microphone");
      await device.startMicrophone();
    } else {
      microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          noiseSuppression: false,
          echoCancellation: false,
          autoGainControl: false,
        },
      });
    }
    microphoneAudio.srcObject = microphoneStream;
    microphoneAudio.removeAttribute("hidden");
    console.log("got microphoneStream", deviceId, microphoneStream);
    updateToggleTranscriptionButton();
    updateTogglePromptButton();
  }
};
const stopMicrophoneStream = () => {
  if (microphoneStream) {
    console.log("stopping microphoneStream");
    microphoneStream.getAudioTracks().forEach((track) => track.stop());
  }
  microphoneStream = undefined;
  microphoneAudio.srcObject = undefined;
  microphoneAudio.setAttribute("hidden", "");
  updateToggleTranscriptionButton();
  updateTogglePromptButton();
};
navigator.mediaDevices.addEventListener("devicechange", () =>
  updateMicrophoneSources()
);
updateMicrophoneSources();

/** @type {HTMLAudioElement} */
const microphoneAudio = document.getElementById("microphoneAudio");

const toggleTranscriptionButton = document.getElementById(
  "toggleTranscription"
);
toggleTranscriptionButton.addEventListener("click", async () => {
  if (mediaRecorder) {
    await stopTranscribing();
  } else {
    await startTranscribing();
  }
});
const updateToggleTranscriptionButton = () => {
  toggleTranscriptionButton.disabled = !microphoneStream;

  toggleTranscriptionButton.innerText = mediaRecorder
    ? "stop transcribing"
    : "start transcribing";
};

// WHISPER

const maxAudioLengthContainer = document.getElementById("maxAudioLength");
const maxAudioLengthInput = maxAudioLengthContainer.querySelector("input");
const maxAudioLengthSpan = maxAudioLengthContainer.querySelector(".value");
let maxAudioLength;
const setMaxAudioLength = (newMaxAudioLength) => {
  maxAudioLength = newMaxAudioLength;
  console.log({ maxAudioLength });
  maxAudioLengthInput.value = maxAudioLength;
  maxAudioLengthSpan.innerText = maxAudioLength;
};
maxAudioLengthInput.addEventListener("input", () => {
  setMaxAudioLength(Number(maxAudioLengthInput.value));
});
setMaxAudioLength(Number(maxAudioLengthInput.value));

import {
  AutoTokenizer,
  AutoProcessor,
  WhisperForConditionalGeneration,
  TextStreamer,
  full,
  pipeline,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.4";

const WHISPER_SAMPLING_RATE = 16_000;
const MAX_NEW_TOKENS = 64;

let model_id = null;
let tokenizer = null;
let processor = null;
let model = null;
let loadedModel = false;
let isProcessing = false;
let chunks = [];
let isRunning = false;

const progress_callback = (progress) => {
  //console.log("progress_callback", progress);
};

const loadModel = async () => {
  if (loadedModel) {
    return;
  }
  console.log("creating model");
  model_id = "onnx-community/whisper-base";

  tokenizer = await AutoTokenizer.from_pretrained(model_id, {
    progress_callback,
  });
  processor = await AutoProcessor.from_pretrained(model_id, {
    progress_callback,
  });

  model = await WhisperForConditionalGeneration.from_pretrained(model_id, {
    dtype: {
      encoder_model: "fp32", // 'fp16' works too
      decoder_model_merged: "q4", // or 'fp32' ('fp16' is broken)
    },
    device: "webgpu",
    progress_callback,
  });

  console.log(model);

  await model.generate({
    input_features: full([1, 80, 3000], 0.0),
    max_new_tokens: 1,
  });
  loadedModel = true;
  console.log("created model", model);
};

let latestLowercaseString;
let latestStringRepetition = 0;
let latestStringRepetitionThreshold = 5;
let transcription = "";
let formattedTranscription = "";
let ignoreString = true;
const ignoreStrings = ["[BLANK_AUDIO]", "[inaudible]"].map((string) =>
  string.toLowerCase()
);
const startTranscribing = async () => {
  if (!loadedModel) {
    await loadModel();
  }
  if (mediaRecorder) {
    await stopTranscribing();
  }
  latestLowercaseString = undefined;
  formattedTranscription = "";
  ignoreString = true;
  mediaRecorder = new MediaRecorder(microphoneStream);
  console.log("mediaRecorder", mediaRecorder.mimeType);
  mediaRecorder.ondataavailable = (e) => {
    const MAX_SAMPLES = WHISPER_SAMPLING_RATE * maxAudioLength;

    // console.log("ondataavailable", e);
    if (e.data.size > 0) {
      chunks = [...chunks, e.data];

      if (chunks.length > 0) {
        // Generate from data
        const blob = new Blob(chunks, { type: "wav" });

        const fileReader = new FileReader();

        fileReader.onloadend = async () => {
          const arrayBuffer = fileReader.result;
          const decoded = await audioContext.decodeAudioData(arrayBuffer);
          let audio = decoded.getChannelData(0);
          if (audio.length > MAX_SAMPLES) {
            // Get last MAX_SAMPLES
            audio = audio.slice(-MAX_SAMPLES);
          }

          if (isProcessing) return;
          isProcessing = true;

          let startTime;
          let numTokens = 0;
          const callback_function = (output) => {
            startTime ??= performance.now();

            let tps;
            if (numTokens++ > 0) {
              tps = (numTokens / (performance.now() - startTime)) * 1000;
            }
            //console.log({ output, tps, numTokens });
          };

          const streamer = new TextStreamer(tokenizer, {
            skip_prompt: true,
            skip_special_tokens: true,
            callback_function,
          });

          const inputs = await processor(audio);

          const outputs = await model.generate({
            ...inputs,
            max_new_tokens: MAX_NEW_TOKENS,
            language: "en",
            streamer,
          });

          const outputText = tokenizer.batch_decode(outputs, {
            skip_special_tokens: true,
          });

          //console.log("outputText", outputText);

          transcription = outputText[outputText.length - 1].trim();
          console.log({ transcription });
          formattedTranscription = transcription;
          const lowercaseTranscription = transcription.toLowerCase();
          ignoreString = ignoreStrings.some((string) =>
            lowercaseTranscription.includes(string)
          );
          if (
            (!ignoreString &&
              !isDrawing &&
              latestLowercaseString != lowercaseTranscription) ||
            isPrompting
          ) {
            textarea.value = formattedTranscription;
            if (isPrompting) {
              if (latestLowercaseString == lowercaseTranscription) {
                latestStringRepetition++;
              } else {
                latestStringRepetition = 0;
              }
              console.log({ latestStringRepetition });
              if (latestStringRepetition == latestStringRepetitionThreshold) {
                await stopPrompting();
              } else {
                await draw();
              }
            } else {
              await draw();
            }
          }
          latestLowercaseString = lowercaseTranscription;
          isProcessing = false;
        };
        fileReader.readAsArrayBuffer(blob);
      } else {
        mediaRecorder?.requestData();
      }
    } else {
      // Empty chunk received, so we request new data after a short timeout
      setTimeout(() => {
        mediaRecorder.requestData();
      }, 25);
    }
  };
  mediaRecorder.onstart = () => {
    isRunning = true;
    console.log({ isRunning });
    chunks = [];
    draw();
  };
  mediaRecorder.onstop = () => {
    isRunning = false;
    console.log({ isRunning });
    mediaRecorder = undefined;
  };
  console.log("starting mediaRecorder", mediaRecorder);
  mediaRecorder.start(500);
  updateToggleTranscriptionButton();
  updateTogglePromptButton();
};
const stopTranscribing = async () => {
  if (mediaRecorder) {
    await new Promise((resolve) => {
      mediaRecorder.onstop = resolve;
      mediaRecorder.stop();
    });
  }
  isRunning = false;
  console.log({ isRunning });
  mediaRecorder = undefined;
  updateToggleTranscriptionButton();
  updateTogglePromptButton();
};

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

device.audioContext = audioContext;
device.microphoneGainNode.gain.value = 10;

didLoad = true;
