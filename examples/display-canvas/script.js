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
        ? "disconnect"
        : "connect";
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

// IMAGE PREVIEW

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

// VIDEO PREVIEW
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
    } else if (file.type.startsWith("video/")) {
      setPreviewMode("video");
      loadVideo(file);
    } else if (file.name.endsWith("glb")) {
      setPreviewMode("vr");
      loadModel(file);
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

// VR/AR
const sceneEntity = document.getElementById("scene");
const modelEntity = document.getElementById("model");
window.addEventListener(
  "keydown",
  function (e) {
    if (previewMode != "ar" && previewMode != "vr") {
      return;
    }
    const keysToPrevent = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
    ];

    if (keysToPrevent.includes(e.key)) {
      e.preventDefault();
    }
  },
  { passive: false }
);
const sampleModelEntity = document.getElementById("sampleModel");
modelEntity.addEventListener("model-loaded", () => {
  sampleModelEntity.remove();
});
const displayPlaneEntity = document.getElementById("displayPlane");
const redrawDisplayPlaneEntity = () => {
  let material = displayPlaneEntity.getObject3D("mesh").material;
  if (!material.map) return;
  else material.map.needsUpdate = true;
};
const resizeDisplayPlaneEntity = () => {
  displayPlaneEntity.setAttribute(
    "width",
    displayPlaneEntityHeight * displayCanvasHelper.aspectRatio
  );
  displayPlaneEntity.setAttribute("height", displayPlaneEntityHeight);
};
let displayPlaneEntityHeight = 0.2;
displayPlaneEntity.addEventListener("loaded", () => {
  displayCanvasHelper.addEventListener("update", () => {
    redrawDisplayPlaneEntity();
  });
  displayCanvasHelper.addEventListener("resize", () => {
    resizeDisplayPlaneEntity();
  });
});

const loadModel = (file) => {
  const reader = new FileReader();
  reader.onload = () => {
    modelEntity.setAttribute("gltf-model", reader.result);
  };
  reader.readAsDataURL(file);
};
/** @type {HTMLInputElement} */
const modelInput = document.getElementById("modelInput");
modelInput.addEventListener("input", (event) => {
  const file = modelInput.files[0];
  if (!file) return;
  loadModel(file);
});

// CAMERA
/** @type {HTMLVideoElement} */
const cameraVideo = document.getElementById("cameraVideo");
cameraVideo.addEventListener("loadedmetadata", () => {
  const { videoWidth, videoHeight } = cameraVideo;
  cameraVideoFaceTrackingCanvas.width = videoWidth;
  cameraVideoFaceTrackingCanvas.height = videoHeight;
});
/** @type {HTMLCanvasElement} */
const cameraVideoFaceTrackingCanvas = document.getElementById(
  "cameraVideoFaceTracking"
);
const cameraVideoFaceTrackingContext =
  cameraVideoFaceTrackingCanvas.getContext("2d");
const toggleMirrorCameraButton = document.getElementById("toggleMirrorCamera");
let mirrorCamera = false;
const setMirrorCamera = (newMirrorCamera) => {
  mirrorCamera = newMirrorCamera;
  console.log({ mirrorCamera });
  cameraVideo.style.transform = mirrorCamera ? "scaleX(-1)" : "";
  cameraVideoFaceTrackingCanvas.style.transform = mirrorCamera
    ? "scaleX(-1)"
    : "";
  toggleMirrorCameraButton.innerText = mirrorCamera
    ? "unmirror camera"
    : "mirror camera";
};
toggleMirrorCameraButton.addEventListener("click", () => {
  setMirrorCamera(!mirrorCamera);
});
const toggleCanvasButton = document.getElementById("toggleCanvas");
let showCanvas = true;
const setShowCanvas = (newShowCanvas) => {
  showCanvas = newShowCanvas;
  console.log({ showCanvas });
  displayCanvas.style.display = showCanvas ? "" : "none";
  toggleCanvasButton.innerText = showCanvas ? "hide canvas" : "show canvas";
};
toggleCanvasButton.addEventListener("click", () => {
  setShowCanvas(!showCanvas);
});

/** @type {HTMLSelectElement} */
const cameraInput = document.getElementById("cameraInput");
const cameraInputOptgroup = cameraInput.querySelector("optgroup");
cameraInput.addEventListener("input", () => {
  selectCameraInput(cameraInput.value);
});
const updateCameraSources = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  cameraInputOptgroup.innerHTML = "";
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
    video: {
      deviceId: { exact: deviceId },
      // width: { ideal: 1280 },
      // height: { ideal: 720 },
    },
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

// PREVIEW MODE
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
  cameraVideoFaceTrackingCanvas.style.display =
    previewMode == "camera" && faceTrackingEnabled ? "" : "none";

  video.style.display = previewMode == "video" ? "" : "none";
  image.style.display = previewMode == "image" ? "" : "none";
  modelEntity.object3D.visible = previewMode == "vr";
  sampleModelEntity.object3D.visible = previewMode == "vr";

  if (previewMode == "vr" || previewMode == "ar") {
    sceneEntity.style.visibility = "visible";
    displayCanvas.style.display = "none";
  } else {
    sceneEntity.style.visibility = "hidden";
    displayCanvas.style.display = "";
  }

  switch (previewMode) {
    case "camera":
    case "image":
    case "video":
    case "vr":
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

window.test = (offsetX, offsetY, width, height) => {
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
  displayCanvasHelper.setSegmentEndRadius(10);
  displayCanvasHelper.setSegmentStartCap("round");
  displayCanvasHelper.setSegmentEndCap("round");
  displayCanvasHelper.setRotation(30);
  //displayCanvasHelper.drawCircle(offsetX, offsetY, 50);
  //displayCanvasHelper.drawSegment(50, 50, 75, 100);
  displayCanvasHelper.drawSegment(50, 50, 300, 50);
  //displayCanvasHelper.drawSegment(offsetX, offsetY, 300, 300);
  displayCanvasHelper.show();
};

// SAMPLE ANIMATION LOOP
let baseColorIndex = 0;
const backgroundColorIndex = baseColorIndex++;
const whiteColorIndex = baseColorIndex++;
displayCanvasHelper.setColor(whiteColorIndex, "white");
const pupilColorIndex = baseColorIndex++;
displayCanvasHelper.setColor(pupilColorIndex, "#cc9a04");
const pupilOutlineColorIndex = baseColorIndex++;
displayCanvasHelper.setColor(pupilOutlineColorIndex, "#00f008");
const hairColorIndex = baseColorIndex++;
displayCanvasHelper.setColor(hairColorIndex, "#bd6e00");
const hairOutlineColorIndex = baseColorIndex++;
displayCanvasHelper.setColor(hairOutlineColorIndex, "#803e00");
const skinColorIndex = baseColorIndex++;
displayCanvasHelper.setColor(skinColorIndex, "#f2bb45");

/** @type {import("../utils/three/three.module.min")} */
const THREE = window.THREE;

/** @typedef {import("../utils/three/three.module.min").Vector2} TVector2 */
/** @typedef {import("../utils/three/three.module.min").Vector3} TVector3 */
/** @typedef {import("../utils/three/three.module.min").Quaternion} TQuaternion */
/** @typedef {import("../utils/three/three.module.min").Euler} TEuler */

const faceParams = {
  lookAt: { x: 0, y: 0, z: 0.3 },
  position: new THREE.Vector2(0, 0),
  rotation: {
    yaw: 0,
    roll: 0,
  },
  yawXScalars: { min: -10, max: 80 },
  yawWidthScalars: { min: 0.6, max: 0.1 },
  pupilYawWidthScalars: { min: 0.4, max: 0.1 },
  cheekCap: {
    /** @type {BS.DisplaySegmentCap} */
    start: "round",
    /** @type {BS.DisplaySegmentCap} */
    end: "round",
  },
  eyebrowCap: {
    /** @type {BS.DisplaySegmentCap} */
    start: "round",
    /** @type {BS.DisplaySegmentCap} */
    end: "round",
  },
  eyebrowRadius: {
    start: { min: 10, max: 15 },
    end: { min: 2, max: 5 },
  },
  cheekRadius: {
    start: 5,
    end: 2,
  },
  eyeLineWidth: 7,
  pupilLineWidth: 5,
  eyebrowLineWidth: 5,
  eyeTilt: 0.1,
  eyeSpacing: 215,
  blink: {
    isBlinking: false,
    lastUpdateTime: 0,
    offset: 0,
    offsetRange: { min: 15, max: 15 },
    /** @type {Side} */
    dominantSide: "left",
    nextTime: 0,
    timeRange: { min: 1000, max: 5000 },
    duration: 0,
    durationRange: { min: 2, max: 2 },
  },
  lookAround: {
    lastUpdateTime: 0,
    nextTime: 0,
    timeRange: { min: 2000, max: 3000 },
    duration: 0,
    durationRange: { min: 3, max: 3 },
    isMoving: false,
    startLookAt: { x: 0, y: 0, z: 0 },
    targetLookAt: { x: 0, y: 0, z: 0 },
  },
  turnAround: {
    lastUpdateTime: 0,
    nextTime: 0,
    timeRange: { min: 4000, max: 6000 },
    duration: 0,
    durationRange: { min: 4, max: 4 },
    isTurning: false,
    startRotation: { yaw: 0, roll: 0 },
    targetRotation: { yaw: 0, roll: 0 },
  },
  pose: {
    eyebrowRotationRange: { min: -0.1, max: 0.1 },
    eyebrowYRange: { min: -55, max: -105 },
    eyebrowYRange2: { min: -55, max: -90 },
    cheekRotationRange: { min: -0.1, max: 0.1 },
    cheekYRange: { min: 60, max: 70 },
    lastUpdateTime: 0,
    nextTime: 0,
    timeRange: { min: 3000, max: 5000 },
    duration: 0,
    durationRange: { min: 3, max: 3 },
    isMoving: false,
    startPose: {
      cheeks: {
        left: { y: 0, rotation: 0, show: false },
        right: { y: 0, rotation: 0, show: false },
      },
      eyebrows: {
        left: {
          y: 0,
          rotation: 0,
        },
        right: {
          y: 0,
          rotation: 0,
        },
      },
    },
    targetPose: {
      cheeks: {
        left: { y: 0, rotation: 0, show: false },
        right: { y: 0, rotation: 0, show: false },
      },
      eyebrows: {
        left: {
          y: 0,
          rotation: 0,
        },
        right: {
          y: 0,
          rotation: 0,
        },
      },
    },
  },
  refocus: {
    scalar: 1,
    scalarX: 0.025,
    scalarY: 0.05,
    scalarZ: 0.025,
    lastUpdateTime: 0,
    zRange: { min: 0.8, max: 1 },
    timeRange: { min: 50, max: 500 },
    nextTime: 0,
    offset: { x: 0, y: 0, z: 0 },
  },
  cheekLineWidth: 5,
  eyes: {
    left: {
      cheek: {
        position: {
          x: 0,
          y: 80,
        },
        rotation: 0,
        widthScalar: 0.9,
        lineWidth: 0,
      },
      open: 1,
      maxHeight: 50,
      maxWidth: 80,
      topCrop: 0,
      bottomCrop: 0,
      pupil: {
        maxRadius: 15,
        position: {
          x: 0,
          y: 0,
        },
      },
      eyebrow: {
        position: {
          x: 0,
          y: -80,
        },
        rotation: -0.0,
        maxLength: 160,
      },
    },
    right: {
      cheek: {
        position: {
          x: 0,
          y: 80,
        },
        rotation: 0,
        widthScalar: 1,
        lineWidth: 0,
      },
      open: 1,
      maxHeight: 55,
      maxWidth: 75,
      topCrop: 0,
      bottomCrop: 0,
      pupil: {
        maxRadius: 15,
        position: {
          x: 0,
          y: 0,
        },
      },
      eyebrow: {
        position: {
          x: 0,
          y: -80,
        },
        rotation: 0.0,
        maxLength: 160,
      },
    },
  },
};
window.faceParams = faceParams;

/** @param {{x:number,y:number,z:number}} target */
const lookAt = (target) => {
  faceXInput.value = target.x;
  faceYInput.value = target.y;
  faceZInput.value = target.z;

  const leftPosition = faceParams.eyes.left.pupil.position;
  const rightPosition = faceParams.eyes.right.pupil.position;

  leftPosition.y = target.y;
  rightPosition.y = target.y;

  const eyeSeparation = 0.06; // 6 cm eye distance; adjust as needed
  const maxAngle = Math.PI / 4; // 45 degrees range maps to x ∈ [-1, 1]

  // Eye centers in face-space
  const leftEyeX = -eyeSeparation / 2;
  const rightEyeX = eyeSeparation / 2;

  // Function to calculate normalized gaze angle for one eye
  const computePupilX = (eyeX) => {
    const dx = target.x - eyeX;
    const dz = target.z;
    const angle = Math.atan2(dx, dz);
    return Math.max(-1, Math.min(1, angle / maxAngle));
  };

  leftPosition.x = computePupilX(leftEyeX);
  rightPosition.x = computePupilX(rightEyeX);
};
window.lookAt = lookAt;

const autoAnimateInput = document.getElementById("autoAnimate");
let autoAnimate = true;
const setAutoAnimate = (newAutoAnimate) => {
  autoAnimate = newAutoAnimate;
  console.log({ autoAnimate });
  autoAnimateInput.checked = autoAnimate;
};
autoAnimateInput.checked = autoAnimate;
autoAnimateInput.addEventListener("input", () => {
  setAutoAnimate(autoAnimateInput.checked);
});
const faceYawInput = document.getElementById("faceYaw");
faceYawInput.addEventListener("input", () => {
  const yaw = Number(faceYawInput.value);
  faceParams.rotation.yaw = yaw;
  draw();
});
const faceRollInput = document.getElementById("faceRoll");
faceRollInput.addEventListener("input", () => {
  const roll = Number(faceRollInput.value);
  faceParams.rotation.roll = roll;
  draw();
});
const faceXInput = document.getElementById("faceX");
faceXInput.addEventListener("input", () => {
  const x = Number(faceXInput.value);
  faceParams.lookAt.x = x;
  updateLookAt();
  draw();
});
const faceYInput = document.getElementById("faceY");
faceYInput.addEventListener("input", () => {
  const y = Number(faceYInput.value);
  faceParams.lookAt.y = y;
  updateLookAt();
  draw();
});
const faceZInput = document.getElementById("faceZ");
faceZInput.addEventListener("input", () => {
  const z = Number(faceZInput.value);
  faceParams.lookAt.z = z;
  updateLookAt();
  draw();
});

/** @typedef {"left" | "right"} Side */

let lastDrawTime = 0;
const ctx = displayCanvasHelper;

/**
 * @param {Side} side
 * @param {{min: number, max: number}} range
 */
const getYawInterpolation = (side, range) => {
  const isLeft = side == "left";
  let { yaw } = faceParams.rotation;
  let yawScalar = 1;
  if ((yaw < 0 && isLeft) || (yaw > 0 && !isLeft)) {
    yawScalar = range.min;
  } else {
    yawScalar = range.max;
  }
  const yawInterpolation = Math.abs(yaw) * yawScalar;

  return yawInterpolation;
};
/**
 * @param {Side} side
 * @param {TVector2} center
 */
const getEyePosition = (side, center) => {
  const isLeft = side == "left";
  const eyePosition = new THREE.Vector2(faceParams.eyeSpacing / 2, 0);
  eyePosition.x *= isLeft ? -1 : 1;

  let yawXOffset = getYawInterpolation(side, faceParams.yawXScalars);
  if (!isLeft) {
    yawXOffset *= -1;
  }
  eyePosition.x += yawXOffset;

  eyePosition.add(center);
  return eyePosition;
};
/**
 * @param {Side} side
 * @param {TVector2} center
 */
const drawEye = async (side, center) => {
  const { pitch, roll, yaw } = faceParams.rotation;
  const { maxHeight, maxWidth, open, topCrop, bottomCrop } =
    faceParams.eyes[side];

  const isLeft = side == "left";
  const eyePosition = getEyePosition(side, center);
  eyePosition.rotateAround(center, roll);
  await ctx.selectFillColor(backgroundColorIndex);
  await ctx.selectLineColor(whiteColorIndex);
  await ctx.setLineWidth(faceParams.eyeLineWidth);
  await ctx.setRotationCropTop(topCrop);
  await ctx.setRotationCropBottom(bottomCrop);
  await ctx.setRotation(faceParams.eyeTilt * (isLeft ? 1 : -1) + roll, true);

  const widthScalar = 1 - getYawInterpolation(side, faceParams.yawWidthScalars);

  await ctx.drawEllipse(
    eyePosition.x,
    eyePosition.y,
    maxWidth * widthScalar,
    maxHeight * open
  );
  await ctx.clearRotationCrop();
};
/**
 * @param {Side} side
 * @param {TVector2} center
 */
const drawPupil = async (side, center) => {
  const { open, pupil, maxWidth, maxHeight } = faceParams.eyes[side];

  const { maxRadius, position } = pupil;
  const isLeft = side == "left";

  if (open < 0.4) {
    return;
  }

  const widthScalar =
    1 - getYawInterpolation(side, faceParams.pupilYawWidthScalars);

  const radiusX = maxRadius * widthScalar;
  const radiusY = maxRadius;

  const eyeWidthScalar =
    1 - getYawInterpolation(side, faceParams.yawWidthScalars);
  const eyeWidth = eyeWidthScalar * (maxWidth - radiusX * 2);

  const eyeHeight = open * (maxHeight - radiusY * 1.5);

  const eyePosition = getEyePosition(side, center);
  const pupilPosition = new THREE.Vector2(
    position.x * eyeWidth,
    position.y * eyeHeight
  );
  pupilPosition.add(eyePosition);
  pupilPosition.rotateAround(center, faceParams.rotation.roll);

  await ctx.selectFillColor(backgroundColorIndex);
  await ctx.selectLineColor(pupilOutlineColorIndex);
  await ctx.setLineWidth(faceParams.pupilLineWidth);

  await ctx.drawEllipse(
    pupilPosition.x,
    pupilPosition.y,
    maxRadius * widthScalar,
    maxRadius
  );
};
/**
 * @param {Side} side
 * @param {TVector2} center
 */
const drawEyebrow = async (side, center) => {
  const { eyebrowCap, eyebrowLineWidth, eyebrowRadius, eyes } = faceParams;
  const { open, eyebrow } = eyes[side];
  const { isBlinking } = faceParams.blink;
  let { position, rotation, maxLength } = eyebrow;

  const isLeft = side == "left";
  const eyePosition = getEyePosition(side, center);

  const blinkInterpolation = 1 - open;

  if (isBlinking) {
    const sign = isLeft ? 1 : -1;
    rotation += sign * blinkInterpolation * 0.03;
  }

  const eyebrowPosition = new THREE.Vector2(position.x, position.y);
  eyebrowPosition.add(eyePosition);
  if (isBlinking) {
    eyebrowPosition.y += blinkInterpolation * 5;
  }
  const eyebrowLength = maxLength;

  const sign = isLeft ? 1 : -1;
  const eyebrowStartPosition = new THREE.Vector2((sign * eyebrowLength) / 2, 0);
  const eyebrowEndPosition = new THREE.Vector2((-sign * eyebrowLength) / 2, 0);

  const eyebrowMidpoint = new THREE.Vector2()
    .addVectors(eyebrowStartPosition, eyebrowEndPosition)
    .multiplyScalar(0.5);
  eyebrowStartPosition.rotateAround(eyebrowMidpoint, rotation);
  eyebrowEndPosition.rotateAround(eyebrowMidpoint, rotation);

  const yawInterpolation = getYawInterpolation(
    side,
    faceParams.yawWidthScalars
  );

  const widthScalar = 1 - yawInterpolation;

  let eyebrowStartXOffset = eyebrowStartPosition.x - eyebrowMidpoint.x;
  eyebrowStartXOffset *= widthScalar;
  eyebrowStartPosition.x = eyebrowStartXOffset + eyebrowMidpoint.x;

  let eyebrowEndXOffset = eyebrowEndPosition.x - eyebrowMidpoint.x;
  eyebrowEndXOffset *= widthScalar;
  eyebrowEndPosition.x = eyebrowEndXOffset + eyebrowMidpoint.x;

  eyebrowStartPosition.add(eyebrowPosition);
  eyebrowEndPosition.add(eyebrowPosition);

  eyebrowStartPosition.rotateAround(center, faceParams.rotation.roll);
  eyebrowEndPosition.rotateAround(center, faceParams.rotation.roll);

  await ctx.selectFillColor(hairColorIndex);
  await ctx.selectLineColor(hairOutlineColorIndex);
  await ctx.setLineWidth(eyebrowLineWidth);

  await ctx.setSegmentStartCap(eyebrowCap.start);
  await ctx.setSegmentEndCap(eyebrowCap.end);
  const eyebrowRadiusInterpolation = 1 - yawInterpolation;
  const startRadius = THREE.MathUtils.lerp(
    eyebrowRadius.start.min,
    eyebrowRadius.start.max,
    eyebrowRadiusInterpolation
  );
  const endRadius = THREE.MathUtils.lerp(
    eyebrowRadius.end.min,
    eyebrowRadius.end.max,
    eyebrowRadiusInterpolation
  );
  await ctx.setSegmentStartRadius(startRadius);
  await ctx.setSegmentEndRadius(endRadius);

  await ctx.drawSegment(
    eyebrowStartPosition.x,
    eyebrowStartPosition.y,
    eyebrowEndPosition.x,
    eyebrowEndPosition.y
  );
};
/**
 * @param {Side} side
 * @param {TVector2} center
 */
const drawCheek = async (side, center) => {
  const { eyes, cheekCap, cheekRadius } = faceParams;
  const { roll } = faceParams.rotation;
  const { open, cheek, maxWidth, maxHeight } = eyes[side];
  const { isBlinking } = faceParams.blink;
  let { position, widthScalar, rotation, lineWidth } = cheek;

  if (lineWidth == 0) {
    return;
  }

  const isLeft = side == "left";
  const eyePosition = getEyePosition(side, center);

  const blinkInterpolation = 1 - open;

  const cheekPosition = new THREE.Vector2(position.x, position.y);
  cheekPosition.add(eyePosition);

  const sign = isLeft ? 1 : -1;

  const eyeWidthScalar =
    1 - getYawInterpolation(side, faceParams.yawWidthScalars);
  const eyeWidth = maxWidth * eyeWidthScalar;
  const cheekLength = eyeWidth * widthScalar;

  if (isBlinking || faceTrackingEnabled) {
    cheekPosition.y -= blinkInterpolation * maxHeight;
  }

  if (true) {
    cheekPosition.rotateAround(center, roll);

    const height = maxHeight * 0.4;

    await ctx.selectFillColor(backgroundColorIndex);
    await ctx.selectLineColor(skinColorIndex);
    await ctx.setLineWidth(lineWidth);
    await ctx.setRotationCropBottom(height * 1.5);

    await ctx.setRotation(
      faceParams.eyeTilt * (isLeft ? 1 : -1) + roll + rotation,
      true
    );

    await ctx.drawEllipse(
      cheekPosition.x,
      cheekPosition.y,
      cheekLength,
      height
    );
    await ctx.clearRotationCrop();
  } else {
    const cheekStartPosition = new THREE.Vector2(sign * cheekLength, 0);
    const cheekEndPosition = new THREE.Vector2(-sign * cheekLength, 0);

    const cheekMidpoint = new THREE.Vector2()
      .addVectors(cheekStartPosition, cheekEndPosition)
      .multiplyScalar(0.5);
    cheekStartPosition.rotateAround(cheekMidpoint, rotation);
    cheekEndPosition.rotateAround(cheekMidpoint, rotation);

    let cheekStartXOffset = cheekStartPosition.x - cheekMidpoint.x;
    cheekStartXOffset *= eyeWidthScalar;
    cheekStartPosition.x = cheekStartXOffset + cheekMidpoint.x;

    let cheekEndXOffset = cheekEndPosition.x - cheekMidpoint.x;
    cheekEndXOffset *= eyeWidthScalar;
    cheekEndPosition.x = cheekEndXOffset + cheekMidpoint.x;

    cheekStartPosition.add(cheekPosition);
    cheekEndPosition.add(cheekPosition);

    cheekStartPosition.rotateAround(center, faceParams.rotation.roll);
    cheekEndPosition.rotateAround(center, faceParams.rotation.roll);

    ctx.selectFillColor(skinColorIndex);
    ctx.setLineWidth(0);

    ctx.setSegmentStartCap(cheekCap.start);
    ctx.setSegmentEndCap(cheekCap.end);
    ctx.setSegmentStartRadius(cheekRadius.start);
    ctx.setSegmentEndRadius(cheekRadius.end);

    ctx.drawSegment(
      cheekStartPosition.x,
      cheekStartPosition.y,
      cheekEndPosition.x,
      cheekEndPosition.y
    );
  }
};
function generateSineSegments(
  numberOfSegments,
  xSpacing,
  yRange,
  angleScalar = 1,
  angleOffset = 0
) {
  const segments = [];
  for (let i = 0; i < numberOfSegments; i++) {
    const x = xSpacing * i;
    const y = (Math.sin(i * angleScalar + angleOffset) + 1) * yRange;
    segments.push({ x, y });
  }
  return segments;
}
const draw = async () => {
  if (!ctx.isReady) {
    return;
  }

  if (false) {
    await displayCanvasHelper.drawSegments(
      generateSineSegments(
        90,
        5,
        100,
        0.2,
        ((Date.now() % 1000) / 1000) * Math.PI * 2
      )
    );
  } else {
    const { width, height } = ctx;
    const center = new THREE.Vector2(
      width / 2 + faceParams.position.x,
      height / 2 + faceParams.position.y
    );

    await drawEye("left", center);
    await drawEye("right", center);
    await drawPupil("left", center);
    await drawPupil("right", center);
    await drawEyebrow("left", center);
    await drawEyebrow("right", center);
    await drawCheek("left", center);
    await drawCheek("right", center);
  }

  await ctx.show();
};
function easeInOut(t) {
  return t * t * (3 - 2 * t);
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
const tick = () => {
  if (!autoAnimate) {
    return;
  }
  const now = Date.now();
  const timeSinceLastDrawTime = now - lastDrawTime;
  lastDrawTime = now;

  const { refocus } = faceParams;
  {
    let {
      timeRange,
      nextTime,
      offset,
      scalar,
      scalarX,
      scalarY,
      scalarZ,
      zRange,
    } = refocus;
    if (now >= nextTime) {
      refocus.lastUpdateTime = now;
      const interval = THREE.MathUtils.lerp(
        timeRange.min,
        timeRange.max,
        Math.random()
      );
      const intervalInterpolation = THREE.MathUtils.inverseLerp(
        0,
        timeRange.max,
        interval
      );
      refocus.nextTime = now + interval;
      scalar *= 1 - intervalInterpolation;

      const zScalar = THREE.MathUtils.lerp(
        zRange.min,
        zRange.max,
        faceParams.lookAt.z
      );

      const x =
        THREE.MathUtils.lerp(-scalarX, scalarX, Math.random()) *
        scalar *
        zScalar;
      const y =
        THREE.MathUtils.lerp(-scalarY, scalarY, Math.random()) *
        scalar *
        zScalar;
      const z = THREE.MathUtils.lerp(-scalarZ, scalarZ, Math.random()) * scalar;
      offset.x = x;
      offset.y = y;
      //offset.z = z;

      updateLookAt();
    }
  }

  let startedBlinking = false;
  const { blink } = faceParams;
  {
    let { timeRange, nextTime, isBlinking, durationRange, offsetRange } = blink;
    if (now >= nextTime) {
      blink.lastUpdateTime = now;
      const interval = THREE.MathUtils.lerp(
        timeRange.min,
        timeRange.max,
        Math.random()
      );
      blink.nextTime = now + interval;

      blink.dominantSide = Math.round(Math.random()) ? "left" : "right";
      blink.offset = THREE.MathUtils.lerp(
        offsetRange.min,
        offsetRange.max,
        Math.random()
      );

      blink.duration =
        THREE.MathUtils.lerp(
          durationRange.min,
          durationRange.max,
          Math.random()
        ) *
          frameLength *
          2 +
        blink.offset;

      blink.isBlinking = true;
      startedBlinking = true;
    }

    if (isBlinking) {
      let { duration, lastUpdateTime, offset, dominantSide } = blink;

      let blinkInterpolation = THREE.MathUtils.inverseLerp(
        lastUpdateTime,
        lastUpdateTime + duration,
        now
      );
      blinkInterpolation = THREE.MathUtils.clamp(blinkInterpolation, 0, 1);
      //blinkInterpolation = easeInOutCubic(blinkInterpolation);

      if (blinkInterpolation >= 1) {
        blink.isBlinking = false;
        faceParams.eyes.left.open = 1;
        faceParams.eyes.right.open = 1;
        return;
      }

      const getOpen = (isDominant) => {
        let _blinkInterpolation = THREE.MathUtils.inverseLerp(
          lastUpdateTime + (isDominant ? 0 : offset),
          lastUpdateTime + duration - (isDominant ? offset : 0),
          now
        );
        _blinkInterpolation = THREE.MathUtils.clamp(_blinkInterpolation, 0, 1);
        _blinkInterpolation = easeInOutCubic(_blinkInterpolation);

        let open = 1;
        if (_blinkInterpolation < 0.5) {
          open = _blinkInterpolation;
          open *= 2;
          open = 1 - open;
        } else {
          open = _blinkInterpolation - 0.5;
          open *= 2;
        }
        return open;
      };

      let leftOpen = getOpen(dominantSide == "left");
      let rightOpen = getOpen(dominantSide == "right");

      faceParams.eyes.left.open = leftOpen;
      faceParams.eyes.right.open = rightOpen;
    }
  }

  const { lookAround } = faceParams;
  {
    let {
      timeRange,
      nextTime,
      isMoving,
      durationRange,
      targetLookAt,
      startLookAt,
    } = lookAround;
    if (!isMoving && now >= nextTime) {
      lookAround.lastUpdateTime = now;
      const interval = THREE.MathUtils.lerp(
        timeRange.min,
        timeRange.max,
        Math.random()
      );
      lookAround.nextTime = now + interval;

      lookAround.duration =
        THREE.MathUtils.lerp(
          durationRange.min,
          durationRange.max,
          Math.random()
        ) * frameLength;

      lookAround.isMoving = true;

      targetLookAt.x = THREE.MathUtils.lerp(-0.5, 0.5, Math.random());
      targetLookAt.y = THREE.MathUtils.lerp(-0.7, 0.7, Math.random());
      targetLookAt.z = THREE.MathUtils.lerp(0.2, 0.9, Math.random());

      Object.assign(startLookAt, faceParams.lookAt);
    }

    if (isMoving) {
      let { duration, lastUpdateTime } = lookAround;
      const { lookAt } = faceParams;

      let interpolation = THREE.MathUtils.inverseLerp(
        lastUpdateTime,
        lastUpdateTime + duration,
        now
      );
      interpolation = THREE.MathUtils.clamp(interpolation, 0, 1);
      interpolation = easeOutCubic(interpolation);

      if (interpolation >= 1) {
        lookAround.isMoving = false;
        Object.assign(lookAt, targetLookAt);
        return;
      }

      lookAt.x = THREE.MathUtils.lerp(
        startLookAt.x,
        targetLookAt.x,
        interpolation
      );
      lookAt.y = THREE.MathUtils.lerp(
        startLookAt.y,
        targetLookAt.y,
        interpolation
      );
      lookAt.z = THREE.MathUtils.lerp(
        startLookAt.z,
        targetLookAt.z,
        interpolation
      );
      updateLookAt();
    }
  }

  const { turnAround } = faceParams;
  {
    let {
      timeRange,
      nextTime,
      isTurning,
      durationRange,
      targetRotation,
      startRotation,
    } = turnAround;
    if (!isTurning && now >= nextTime && startedBlinking) {
      turnAround.lastUpdateTime = now;
      const interval = THREE.MathUtils.lerp(
        timeRange.min,
        timeRange.max,
        Math.random()
      );
      turnAround.nextTime = now + interval;

      turnAround.duration =
        THREE.MathUtils.lerp(
          durationRange.min,
          durationRange.max,
          Math.random()
        ) * frameLength;

      turnAround.isTurning = true;

      targetRotation.roll = THREE.MathUtils.lerp(-0.1, 0.1, Math.random());
      targetRotation.yaw = THREE.MathUtils.lerp(-1, 1, Math.random());

      Object.assign(startRotation, faceParams.rotation);
    }

    if (isTurning) {
      let { duration, lastUpdateTime } = turnAround;
      const { rotation } = faceParams;

      let interpolation = THREE.MathUtils.inverseLerp(
        lastUpdateTime,
        lastUpdateTime + duration,
        now
      );
      interpolation = THREE.MathUtils.clamp(interpolation, 0, 1);
      interpolation = easeOutCubic(interpolation);

      if (interpolation >= 1) {
        turnAround.isTurning = false;
        Object.assign(rotation, targetRotation);
        faceYawInput.value = rotation.yaw;
        faceRollInput.value = rotation.roll;
        return;
      }

      rotation.yaw = THREE.MathUtils.lerp(
        startRotation.yaw,
        targetRotation.yaw,
        interpolation
      );
      faceYawInput.value = rotation.yaw;
      rotation.roll = THREE.MathUtils.lerp(
        startRotation.roll,
        targetRotation.roll,
        interpolation
      );
      faceRollInput.value = rotation.roll;
    }
  }

  const { pose } = faceParams;
  {
    let { timeRange, nextTime, isMoving, durationRange } = pose;
    const { cheekLineWidth } = faceParams;
    if (!isMoving && now >= nextTime && startedBlinking) {
      pose.lastUpdateTime = now;
      const interval = THREE.MathUtils.lerp(
        timeRange.min,
        timeRange.max,
        Math.random()
      );
      pose.nextTime = now + interval;

      pose.duration =
        THREE.MathUtils.lerp(
          durationRange.min,
          durationRange.max,
          Math.random()
        ) * frameLength;

      pose.isMoving = true;

      const { eyebrows, cheeks } = pose.targetPose;
      eyebrows.left.rotation = THREE.MathUtils.lerp(
        pose.eyebrowRotationRange.min,
        pose.eyebrowRotationRange.max,
        Math.random()
      );
      eyebrows.right.rotation = THREE.MathUtils.lerp(
        pose.eyebrowRotationRange.min,
        pose.eyebrowRotationRange.max,
        Math.random()
      );

      eyebrows.left.y = THREE.MathUtils.lerp(
        pose.eyebrowYRange.min,
        pose.eyebrowYRange.max,
        Math.random()
      );
      eyebrows.right.y = THREE.MathUtils.lerp(
        pose.eyebrowYRange.min,
        pose.eyebrowYRange.max,
        Math.random()
      );

      cheeks.left.rotation = THREE.MathUtils.lerp(
        pose.eyebrowRotationRange.min,
        pose.eyebrowRotationRange.max,
        Math.random()
      );
      cheeks.right.rotation = THREE.MathUtils.lerp(
        pose.cheekRotationRange.min,
        pose.cheekRotationRange.max,
        Math.random()
      );

      cheeks.left.y = THREE.MathUtils.lerp(
        pose.cheekYRange.min,
        pose.cheekYRange.max,
        Math.random()
      );
      cheeks.right.y = THREE.MathUtils.lerp(
        pose.cheekYRange.min,
        pose.cheekYRange.max,
        Math.random()
      );

      cheeks.left.show = Math.round(Math.random() * 0.7);
      cheeks.right.show = Math.round(Math.random() * 0.7);
    }

    if (isMoving) {
      let { duration, lastUpdateTime, targetPose, startPose } = pose;

      let interpolation = THREE.MathUtils.inverseLerp(
        lastUpdateTime,
        lastUpdateTime + duration,
        now
      );
      interpolation = THREE.MathUtils.clamp(interpolation, 0, 1);
      interpolation = easeOutCubic(interpolation);

      if (interpolation >= 1) {
        pose.isMoving = false;
        faceParams.eyes.left.eyebrow.position.y = targetPose.eyebrows.left.y;
        faceParams.eyes.right.eyebrow.position.y = targetPose.eyebrows.right.y;

        faceParams.eyes.left.eyebrow.rotation =
          targetPose.eyebrows.left.rotation;
        faceParams.eyes.right.eyebrow.rotation =
          targetPose.eyebrows.right.rotation;

        faceParams.eyes.left.cheek.rotation = targetPose.cheeks.left.rotation;
        faceParams.eyes.right.cheek.rotation = targetPose.cheeks.right.rotation;

        faceParams.eyes.left.cheek.position.y = targetPose.cheeks.left.y;
        faceParams.eyes.right.cheek.position.y = targetPose.cheeks.right.y;

        faceParams.eyes.left.cheek.lineWidth = targetPose.cheeks.left.show
          ? cheekLineWidth
          : 0;
        faceParams.eyes.right.cheek.lineWidth = targetPose.cheeks.right.show
          ? cheekLineWidth
          : 0;
        return;
      }

      faceParams.eyes.left.eyebrow.position.y = THREE.MathUtils.lerp(
        startPose.eyebrows.left.y,
        targetPose.eyebrows.left.y,
        interpolation
      );
      faceParams.eyes.right.eyebrow.position.y = THREE.MathUtils.lerp(
        startPose.eyebrows.right.y,
        targetPose.eyebrows.right.y,
        interpolation
      );

      faceParams.eyes.left.eyebrow.rotation = THREE.MathUtils.lerp(
        startPose.eyebrows.left.rotation,
        targetPose.eyebrows.left.rotation,
        interpolation
      );
      faceParams.eyes.right.eyebrow.rotation = THREE.MathUtils.lerp(
        startPose.eyebrows.right.rotation,
        targetPose.eyebrows.right.rotation,
        interpolation
      );

      faceParams.eyes.left.cheek.position.y = THREE.MathUtils.lerp(
        startPose.cheeks.left.y,
        targetPose.cheeks.left.y,
        interpolation
      );
      faceParams.eyes.right.cheek.position.y = THREE.MathUtils.lerp(
        startPose.cheeks.right.y,
        targetPose.cheeks.right.y,
        interpolation
      );

      faceParams.eyes.left.cheek.rotation = THREE.MathUtils.lerp(
        startPose.cheeks.left.rotation,
        targetPose.cheeks.left.rotation,
        interpolation
      );
      faceParams.eyes.right.cheek.rotation = THREE.MathUtils.lerp(
        startPose.cheeks.right.rotation,
        targetPose.cheeks.right.rotation,
        interpolation
      );

      faceParams.eyes.left.cheek.lineWidth = THREE.MathUtils.lerp(
        startPose.cheeks.left.show ? cheekLineWidth : 0,
        targetPose.cheeks.left.show ? cheekLineWidth : 0,
        interpolation
      );
      faceParams.eyes.right.cheek.lineWidth = THREE.MathUtils.lerp(
        startPose.cheeks.right.show ? cheekLineWidth : 0,
        targetPose.cheeks.right.show ? cheekLineWidth : 0,
        interpolation
      );
    }
  }
};
const updateLookAt = () => {
  const target = { ...faceParams.lookAt };
  target.x += faceParams.refocus.offset.x;
  target.y += faceParams.refocus.offset.y;
  target.z += faceParams.refocus.offset.z;
  lookAt(target);
};
const tickAndDraw = () => {
  tick();
  draw();
};
displayCanvasHelper.addEventListener("ready", async () => {
  console.log("ready");
  if (!isDrawing) {
    return;
  }
  tickAndDraw();
});
let isDrawing = false;
const startDrawing = () => {
  isDrawing = true;
  if (displayCanvasHelper.isReady) {
    tickAndDraw();
  }
};
const stopDrawing = () => {
  isDrawing = false;
};
let frameLength = 110;
window.draw = draw;
window.tickAndDraw = tickAndDraw;
window.startDrawing = startDrawing;
window.stopDrawing = stopDrawing;

// FACE TRACKING

import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

let faceLandmarker;
const createFaceLandmarker = async () => {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFacialTransformationMatrixes: false,
  });
  console.log("created faceLandmarker", faceLandmarker);
};

/** @type {HTMLButtonElement} */
const toggleFaceTrackingButton = document.getElementById("toggleFaceTracking");
let faceTrackingEnabled = false;
const setFaceTrackingEnabled = async (newFaceTrackingEnabled) => {
  faceTrackingEnabled = newFaceTrackingEnabled;
  console.log({ faceTrackingEnabled });
  toggleFaceTrackingButton.innerText = faceTrackingEnabled
    ? "disable face tracking"
    : "enable face tracking";

  cameraVideoFaceTrackingCanvas.style.display = faceTrackingEnabled
    ? ""
    : "none";

  if (faceTrackingEnabled && !faceLandmarker) {
    toggleFaceTrackingButton.disabled = true;
    await createFaceLandmarker();
    toggleFaceTrackingButton.disabled = false;
  }

  if (faceTrackingEnabled && faceLandmarker) {
    faceTrackingRenderLoop();
  }

  if (faceTrackingEnabled) {
    setAutoAnimate(false);
  }
};
toggleFaceTrackingButton.addEventListener("click", () => {
  setFaceTrackingEnabled(!faceTrackingEnabled);
});

/** @type {HTMLButtonElement} */
const toggleShowFaceTrackingButton = document.getElementById(
  "toggleShowFaceTracking"
);
let showFaceTracking = true;
const setShowFaceTracking = (newShowFaceTracking) => {
  showFaceTracking = newShowFaceTracking;
  console.log({ showFaceTracking });
  toggleShowFaceTrackingButton.innerText = showFaceTracking
    ? "hide face tracking"
    : "show face tracking";
};
toggleShowFaceTrackingButton.addEventListener("click", () => {
  setShowFaceTracking(!showFaceTracking);
});
setShowFaceTracking(true);

let lastFaceTrackingTime;
let drawingUtils;
const eyeBlinkRangeHelpers = {
  left: new BS.RangeHelper(),
  right: new BS.RangeHelper(),
};
eyeBlinkRangeHelpers.left.update(0.01);
eyeBlinkRangeHelpers.right.update(0.01);
eyeBlinkRangeHelpers.left.update(0.6);
eyeBlinkRangeHelpers.right.update(0.6);
const eyebrowRangeHelpers = {
  left: new BS.RangeHelper(),
  right: new BS.RangeHelper(),
};
eyebrowRangeHelpers.left.update(0.0);
eyebrowRangeHelpers.right.update(0.0);
eyebrowRangeHelpers.left.update(0.6);
eyebrowRangeHelpers.right.update(0.6);

const cheekRangeHelpers = {
  left: new BS.RangeHelper(),
  right: new BS.RangeHelper(),
};
cheekRangeHelpers.left.update(0.0);
cheekRangeHelpers.left.update(0.032);
cheekRangeHelpers.right.update(0.0);
cheekRangeHelpers.right.update(0.032);
const faceTrackingRenderLoop = () => {
  if (
    cameraVideo.currentTime !== lastFaceTrackingTime &&
    cameraStream &&
    !cameraVideo.paused
  ) {
    const results = faceLandmarker.detectForVideo(
      cameraVideo,
      performance.now()
    );
    // console.log("results", results);
    lastFaceTrackingTime = cameraVideo.currentTime;

    const context = cameraVideoFaceTrackingContext;
    const canvas = cameraVideoFaceTrackingCanvas;

    drawingUtils = drawingUtils || new DrawingUtils(context);
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (results.faceLandmarks) {
      if (showFaceTracking) {
        for (const landmarks of results.faceLandmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: "#C0C0C070", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
            { color: "#FF3030", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
            { color: "#FF3030", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
            { color: "#30FF30", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
            { color: "#30FF30", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
            { color: "#E0E0E0", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LIPS,
            { color: "#E0E0E0", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
            { color: "#FF3030", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
            { color: "#30FF30", lineWidth: 1 }
          );
        }
      }

      let shouldDraw = false;
      if (results.faceLandmarks[0]) {
        const faceLandmarks = results.faceLandmarks[0];
        const leftEye = faceLandmarks[33];
        const rightEye = faceLandmarks[263];

        const dx = rightEye.x - leftEye.x;
        const dz = rightEye.z - leftEye.z;

        let yaw = Math.atan2(dz, dx);
        yaw *= 1.8;
        yaw = THREE.MathUtils.clamp(yaw, -1, 1);
        if (mirrorCamera) {
          yaw *= -1;
        }

        faceYawInput.value = yaw;
        faceParams.rotation.yaw = yaw;

        const dy = rightEye.y - leftEye.y;
        const dxRoll = rightEye.x - leftEye.x;

        let roll = Math.atan2(dy, dxRoll);
        roll = THREE.MathUtils.clamp(roll, -1, 1);
        if (mirrorCamera) {
          roll *= -1;
        }
        faceRollInput.value = roll;
        faceParams.rotation.roll = roll;

        if (true) {
          const rightPupil = getIrisOffsetXy(
            faceLandmarks,
            468,
            33,
            133,
            159,
            145,
            roll,
            mirrorCamera
              ? faceParams.eyes.left.open
              : faceParams.eyes.right.open
          );

          const leftPupil = getIrisOffsetXy(
            faceLandmarks,
            473,
            362,
            263,
            386,
            374,
            roll,
            mirrorCamera
              ? faceParams.eyes.right.open
              : faceParams.eyes.left.open
          );

          if (mirrorCamera) {
            Object.assign(faceParams.eyes.left.pupil.position, rightPupil);
            Object.assign(faceParams.eyes.right.pupil.position, leftPupil);
          } else {
            Object.assign(faceParams.eyes.left.pupil.position, leftPupil);
            Object.assign(faceParams.eyes.right.pupil.position, rightPupil);
          }
        }

        shouldDraw = true;
      }
      if (results.faceBlendshapes[0]) {
        const blendShapeCategories = results.faceBlendshapes[0].categories;
        //console.log("blendShapeCategories", blendShapeCategories);

        let eyeBlinkLeft = blendShapeCategories[9].score;
        let eyeBlinkRight = blendShapeCategories[10].score;

        eyeBlinkLeft = eyeBlinkRangeHelpers.left.getNormalization(eyeBlinkLeft);
        eyeBlinkRight =
          eyeBlinkRangeHelpers.right.getNormalization(eyeBlinkRight);

        eyeBlinkLeft = THREE.MathUtils.clamp(eyeBlinkLeft, 0, 1);
        eyeBlinkRight = THREE.MathUtils.clamp(eyeBlinkRight, 0, 1);

        if (mirrorCamera) {
          faceParams.eyes.right.open = 1 - eyeBlinkRight;
          faceParams.eyes.left.open = 1 - eyeBlinkLeft;
        } else {
          faceParams.eyes.right.open = 1 - eyeBlinkLeft;
          faceParams.eyes.left.open = 1 - eyeBlinkRight;
        }

        let browDownLeft = blendShapeCategories[1].score;
        let browDownRight = blendShapeCategories[2].score;
        let browInnerUp = blendShapeCategories[3].score;
        let browOuterUpLeft = blendShapeCategories[4].score;
        let browOuterUpRight = blendShapeCategories[5].score;

        browDownLeft = eyebrowRangeHelpers.left.getNormalization(browDownLeft);
        browDownRight =
          eyebrowRangeHelpers.right.getNormalization(browDownRight);

        let browLeftY = THREE.MathUtils.lerp(
          faceParams.pose.eyebrowYRange2.min,
          faceParams.pose.eyebrowYRange2.max,
          1 - browDownLeft
        );
        let browRightY = THREE.MathUtils.lerp(
          faceParams.pose.eyebrowYRange2.min,
          faceParams.pose.eyebrowYRange2.max,
          1 - browDownRight
        );

        if (mirrorCamera) {
          faceParams.eyes.right.eyebrow.position.y = browRightY;
          faceParams.eyes.left.eyebrow.position.y = browLeftY;
        } else {
          faceParams.eyes.right.eyebrow.position.y = browLeftY;
          faceParams.eyes.left.eyebrow.position.y = browRightY;
        }

        // Simulate coordinates (x, y) for each eyebrow
        const pOuterLeft = { x: -1, y: browOuterUpLeft };
        const pInnerLeft = { x: 0, y: browInnerUp };
        const pInnerRight = { x: 0, y: browInnerUp };
        const pOuterRight = { x: 1, y: browOuterUpRight };

        // Calculate angles in radians using atan2
        const angleLeft = Math.atan2(
          pInnerLeft.y - pOuterLeft.y,
          pInnerLeft.x - pOuterLeft.x
        );
        const angleRight = Math.atan2(
          pOuterRight.y - pInnerRight.y,
          pOuterRight.x - pInnerRight.x
        );

        if (mirrorCamera) {
          faceParams.eyes.right.eyebrow.rotation = angleRight;
          faceParams.eyes.left.eyebrow.rotation = angleLeft;
        } else {
          faceParams.eyes.right.eyebrow.rotation = angleRight;
          faceParams.eyes.left.eyebrow.rotation = angleLeft;
        }

        let cheekPuff = blendShapeCategories[6].score;
        let cheekSquintLeft = blendShapeCategories[7].score;
        let cheekSquintRight = blendShapeCategories[8].score;
        let mouthSmileLeft = blendShapeCategories[44].score;
        let mouthSmileRight = blendShapeCategories[45].score;
        let eyeSquintLeft = blendShapeCategories[19].score;
        let eyeSquintRight = blendShapeCategories[20].score;
        let mouthUpperUpLeft = blendShapeCategories[48].score;
        let mouthUpperUpRight = blendShapeCategories[49].score;
        let mouthDimpleLeft = blendShapeCategories[28].score;
        let mouthDimpleRight = blendShapeCategories[29].score;
        let mouthPressLeft = blendShapeCategories[36].score;
        let mouthPressRight = blendShapeCategories[37].score;

        // console.log({ mouthUpperUpLeft, mouthUpperUpRight });
        // console.log({ mouthDimpleLeft, mouthDimpleRight });
        // console.log({ mouthPressLeft, mouthPressRight });

        let cheekLeft =
          cheekRangeHelpers.left.getNormalization(mouthDimpleLeft);
        cheekLeft = THREE.MathUtils.clamp(cheekLeft, 0, 1);
        let cheekRight =
          cheekRangeHelpers.right.getNormalization(mouthDimpleRight);
        cheekRight = THREE.MathUtils.clamp(cheekRight, 0, 1);

        // console.log({
        //   cheekLeft,
        //   cheekRight,
        // });

        let cheekLeftY = THREE.MathUtils.lerp(
          faceParams.pose.cheekYRange.min,
          faceParams.pose.cheekYRange.max,
          1 - cheekLeft
        );
        let cheekRightY = THREE.MathUtils.lerp(
          faceParams.pose.cheekYRange.min,
          faceParams.pose.cheekYRange.max,
          1 - cheekRight
        );
        const showLeftCheek = cheekLeft > 0.4;
        const showRightCheek = cheekRight > 0.4;

        cheekLeft *= 1.1;
        cheekRight *= 1.1;

        const cheekLineWidth = faceParams.cheekLineWidth;

        // console.log({ showLeftCheek, showRightCheek });

        if (mirrorCamera) {
          faceParams.eyes.right.cheek.position.y = cheekRightY;
          faceParams.eyes.left.cheek.position.y = cheekLeftY;

          faceParams.eyes.right.cheek.lineWidth = showRightCheek
            ? cheekLineWidth
            : 0;
          faceParams.eyes.left.cheek.lineWidth = showLeftCheek
            ? cheekLineWidth
            : 0;
        } else {
          faceParams.eyes.right.cheek.position.y = cheekLeftY;
          faceParams.eyes.left.cheek.position.y = cheekRightY;
        }

        shouldDraw = true;
      }
      if (shouldDraw) {
        draw();
      }
    }
  }

  if (faceTrackingEnabled) {
    requestAnimationFrame(() => {
      faceTrackingRenderLoop();
    });
  }
};

function getIrisOffsetXy(
  landmarks,
  centerIdx,
  leftIdx,
  rightIdx,
  topIdx,
  bottomIdx,
  roll,
  open
) {
  const center = landmarks[centerIdx];
  const left = landmarks[leftIdx];
  const right = landmarks[rightIdx];
  const top = landmarks[topIdx];
  const bottom = landmarks[bottomIdx];

  // Horizontal offset: -1 (left) to 1 (right)
  let xOffset = ((center.x - left.x) / (right.x - left.x)) * 2 - 1;

  // Vertical offset: -1 (top) to 1 (bottom)
  let yOffset = ((center.y - top.y) / (bottom.y - top.y)) * 2 - 1;

  // Apply inverse head roll
  const v = new THREE.Vector2(xOffset, yOffset);
  v.rotateAround(new THREE.Vector2(0, 0), roll); // rotate to un-tilt

  xOffset = v.x;
  xOffset *= 2;
  xOffset = THREE.MathUtils.clamp(xOffset, -1, 1);

  yOffset = v.y;
  const verticalBias = open * 0.02;
  yOffset -= verticalBias;
  yOffset *= 2;
  yOffset = THREE.MathUtils.clamp(yOffset, -1, 1);

  if (mirrorCamera) {
    xOffset *= -1;
  }

  return { x: xOffset, y: yOffset };
}
// setPreviewMode("camera");
// setMirrorCamera(true);
// setFaceTrackingEnabled(true);
// setAutoAnimate(false);
// setShowFaceTracking(false);
// setShowCanvas(false);

displayCanvasHelper.selectBitmapColor(1, 1);
displayCanvasHelper.selectBitmapColor(2, 2);
displayCanvasHelper.setBitmapScale(10);
displayCanvasHelper.setRotation(0);
displayCanvasHelper.setLineWidth(10);
displayCanvasHelper.setIgnoreFill(false);
displayCanvasHelper.setIgnoreLine(false);
// displayCanvasHelper.setFillBackground(false);
// displayCanvasHelper.selectBackgroundColor(3);
displayCanvasHelper.selectFillColor(1);
displayCanvasHelper.selectLineColor(2);
//displayCanvasHelper.setRotationCropTop(10);
//displayCanvasHelper.setCropTop(10);
// displayCanvasHelper.setVerticalAlignment("start");
displayCanvasHelper.setHorizontalAlignment("center");
// displayCanvasHelper.drawRoundRect(100, 100, 100, 100, 20);
displayCanvasHelper.setSegmentStartCap("round");
displayCanvasHelper.setSegmentStartRadius(2);
displayCanvasHelper.setSegmentEndRadius(2);
displayCanvasHelper.drawPolygon(200, 100, [
  { x: -10, y: -50 },
  { x: 50, y: -50 },
  { x: 50, y: 50 },
  { x: -50, y: 50 },
]);
// displayCanvasHelper.drawWireframe(
//   [
//     { x: 100, y: 100 },
//     { x: 150, y: 100 },
//     { x: 50, y: 100 },
//     { x: 100, y: 150 },
//     { x: 100, y: 50 },
//   ],
//   [
//     { startIndex: 0, endIndex: 1 },
//     { startIndex: 0, endIndex: 2 },
//     { startIndex: 0, endIndex: 3 },
//     { startIndex: 0, endIndex: 4 },
//     { startIndex: 1, endIndex: 2 },
//     { startIndex: 2, endIndex: 3 },
//     { startIndex: 4, endIndex: 1 },
//   ]
// );
// displayCanvasHelper.drawRegularPolygon(100, 100, 50, 5);
// displayCanvasHelper.drawSegment(100, 100, 120, 200);
// displayCanvasHelper.drawSegments([
//   { x: 100, y: 100 },
//   { x: 120, y: 200 },
//   { x: 100, y: 200 },
// ]);
// displayCanvasHelper.drawArc(100, 100, 50, 0, 360);
// displayCanvasHelper.drawEllipse(100, 100, 100, 50);
// displayCanvasHelper.drawCircle(100, 100, 50);
//displayCanvasHelper.drawRect(100, 100, 100, 100);
// displayCanvasHelper.drawBitmap(100, 100, {
//   pixels: [
//     ...new Array((10 * 10) / 2).fill(1),
//     ...new Array((10 * 10) / 2).fill(2),
//   ],
//   width: 10,
//   height: 10,
//   numberOfColors: 3,
// });
// displayCanvasHelper.drawSegments([
//   { x: 100, y: 100 },
//   { x: 200, y: 100 },
//   { x: 200, y: 200 },
//   { x: 100, y: 200 },
//   { x: 100, y: 100 },
// ]);
displayCanvasHelper.show();
