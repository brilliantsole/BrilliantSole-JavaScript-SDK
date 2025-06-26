import * as BS from "../../build/brilliantsole.module.js";

// DEVICE
const device = new BS.Device();
window.device = device;

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

// OPACITIES

/** @type {HTMLTemplateElement} */
const displayColorOpacityTemplate = document.getElementById(
  "displayColorOpacityTemplate"
);
const displayColorOpacitiesContainer = document.getElementById(
  "displayColorOpacities"
);
const setDisplayColorOpacity = BS.ThrottleUtils.throttle(
  (colorIndex, opacity) => {
    console.log({ colorIndex, opacity });
    displayCanvasHelper.setColorOpacity(colorIndex, opacity, true);
  },
  100,
  true
);
const setupColorOpacities = () => {
  displayColorOpacitiesContainer.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    const displayColorOpacityContainer = displayColorOpacityTemplate.content
      .cloneNode(true)
      .querySelector(".displayColorOpacity");

    const displayColorOpacityIndex =
      displayColorOpacityContainer.querySelector(".colorIndex");
    displayColorOpacityIndex.innerText = `color opacity #${colorIndex}`;
    const displayColorOpacityInput =
      displayColorOpacityContainer.querySelector("input");
    const displayColorOpacitySpan =
      displayColorOpacityContainer.querySelector(".opacity");
    displayColorOpacityInput.addEventListener("input", () => {
      const opacity = Number(displayColorOpacityInput.value);
      displayColorOpacitySpan.innerText = Math.round(opacity * 100);
      setDisplayColorOpacity(colorIndex, opacity);
    });
    displayColorOpacitiesContainer.appendChild(displayColorOpacityContainer);
  }
};
displayCanvasHelper.addEventListener("numberOfColors", () =>
  setupColorOpacities()
);
setupColorOpacities();

const displayOpacityContainer = document.getElementById("displayOpacity");
const displayOpacitySpan = displayOpacityContainer.querySelector("span");
const displayOpacityInput = displayOpacityContainer.querySelector("input");

const setDisplayOpacity = BS.ThrottleUtils.throttle(
  (opacity) => {
    console.log({ opacity });
    displayCanvasHelper.setOpacity(opacity, true);
  },
  100,
  true
);
displayOpacityInput.addEventListener("input", () => {
  const opacity = Number(displayOpacityInput.value);
  displayOpacitySpan.innerText = Math.round(opacity * 100);
  setDisplayOpacity(opacity);
  displayColorOpacitiesContainer
    .querySelectorAll(".displayColorOpacity")
    .forEach((container) => {
      const input = container.querySelector("input");
      const span = container.querySelector("span");
      input.value = opacity;
      span.innerText = Math.round(opacity * 100);
    });
});

// PREVIEW MODE

/** @type {HTMLInputElement} */
const imageInput = document.getElementById("imageInput");
/** @type {HTMLImageElement} */
const image = document.getElementById("image");
imageInput.addEventListener("input", (event) => {
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

/** @type {HTMLInputElement} */
const videoInput = document.getElementById("videoInput");
/** @type {HTMLVideoElement} */
const video = document.getElementById("video");
videoInput.addEventListener("input", (event) => {
  const file = videoInput.files[0];
  if (!file) return;
  loadVideo(file);
});
const loadVideo = (file) => {
  const reader = new FileReader();
  reader.onload = () => {
    video.src = reader.result;
  };
  reader.readAsDataURL(file);
};

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
    } else if (file.type.startsWith("video/")) {
      setPreviewMode("video");
      loadVideo(file);
    } else if (file.name.endsWith("glb")) {
      setPreviewMode("vr");
      loadModel(file);
    }
  }
});

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
    case "video":
      video.src = string;
      break;
    case "vr":
      modelEntity.setAttribute("gltf-model", string);
      break;
  }
});
window.addEventListener("paste", (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    switch (previewMode) {
      case "image":
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          loadImage(file);
          return;
        }
        break;
      case "video":
        if (item.type.startsWith("video/")) {
          const file = item.getAsFile();
          loadVideo(file);
          return;
        }
        break;
      case "vr":
        const file = item.getAsFile();
        if (["glb"].some((extension) => file.name.endsWith(extension))) {
          loadModel(file);
          return;
        }
        break;
    }
  }
});

const modelEntity = document.getElementById("model");
const loadModel = (file) => {
  const reader = new FileReader();
  reader.onload = () => {
    modelEntity.setAttribute("gltf-model", reader.result);
  };
  reader.readAsDataURL(file);
};

/** @type {HTMLVideoElement} */
const cameraVideo = document.getElementById("cameraVideo");
/** @type {HTMLSelectElement} */
const cameraInput = document.getElementById("cameraInput");
const cameraInputOptgroup = cameraInput.querySelector("optgroup");
cameraInput.addEventListener("input", () => {
  selectCameraInput(cameraInput.value);
});
const updateCameraSources = async () => {
  cameraInputOptgroup.innerHTML = "";
  const devices = await navigator.mediaDevices.enumerateDevices();
  devices
    .filter((device) => device.kind == "videoinput")
    .forEach((videoInputDevice) => {
      cameraInputOptgroup.appendChild(
        new Option(videoInputDevice.label, videoInputDevice.deviceId)
      );
    });
  if (previewMode == "camera") {
    selectCameraInput(cameraInput.value);
  }
};
/** @type {MediaStream?} */
let cameraStream;
const selectCameraInput = async (deviceId) => {
  stopCameraStream();
  cameraStream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: { exact: deviceId } },
  });

  cameraVideo.srcObject = cameraStream;
  console.log("got cameraStream", deviceId, cameraStream);
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

/** @type {HTMLSelectElement} */
const previewModeSelect = document.getElementById("previewMode");
/** @typedef {"none" | "image" | "video" | "camera" | "vr" | "ar"} PreviewMode */
/** @type {PreviewMode} */
let previewMode = "none";
previewModeSelect.addEventListener("input", () => {
  setPreviewMode(previewModeSelect.value);
});
const displayContainer = document.getElementById("displayContainer");
/** @param {PreviewMode} newPreviewMode */
const setPreviewMode = (newPreviewMode) => {
  previewMode = newPreviewMode;
  if (previewModeSelect.value != previewMode) {
    previewModeSelect.value = previewMode;
  }
  console.log({ previewMode });
  document.querySelectorAll("[data-preview-mode]").forEach((container) => {
    container.style.display =
      container.dataset.previewMode == previewMode ? "" : "none";
  });

  cameraVideo.style.display = previewMode == "camera" ? "" : "none";
  video.style.display = previewMode == "video" ? "" : "none";
  image.style.display = previewMode == "image" ? "" : "none";
  modelEntity.object3D.visible = previewMode == "vr";

  switch (previewMode) {
    case "camera":
    case "image":
    case "video":
      displayContainer.classList.add("shrink");
      break;
    default:
      displayContainer.classList.remove("shrink");
      break;
  }

  image.style.display = previewMode == "image" ? "" : "none";

  if (previewMode == "camera") {
    selectCameraInput(cameraInput.value);
  } else {
    stopCameraStream();
  }

  displayCanvasHelper.applyTransparency = previewMode != "none";
};
setPreviewMode("none");

// TEST

window.test = (centerX, centerY, width, height) => {
  displayCanvasHelper.setLineWidth(0);
  displayCanvasHelper.setColor(0, "black");
  displayCanvasHelper.setColor(1, "red");
  displayCanvasHelper.setColor(2, "blue");
  displayCanvasHelper.selectLineColor(2);
  //displayCanvasHelper.setRotation(45);
  //displayCanvasHelper.setCropTop(80);
  //displayCanvasHelper.setRotationCropTop(50);
  //displayCanvasHelper.drawRect(200, 200, 50, 50);
  displayCanvasHelper.setColor(3, "yellow");
  displayCanvasHelper.selectLineColor(3);
  displayCanvasHelper.setCropTop(0);
  displayCanvasHelper.setRotationCropTop(0);
  displayCanvasHelper.setLineWidth(5);
  displayCanvasHelper.setSegmentStartRadius(30);
  displayCanvasHelper.setSegmentEndRadius(0);
  displayCanvasHelper.setSegmentStartCap("round");
  displayCanvasHelper.setSegmentEndCap("round");
  displayCanvasHelper.setRotation(30);
  displayCanvasHelper.drawCircle(centerX, centerY, 50);
  displayCanvasHelper.drawSegment(centerX, centerY, 300, 300);
  displayCanvasHelper.showDisplay();
};
test(100, 100, 50, 80);
