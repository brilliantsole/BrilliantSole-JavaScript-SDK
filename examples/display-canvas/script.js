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
  displayCanvasHelper.setSegmentEndRadius(10);
  displayCanvasHelper.setSegmentStartCap("round");
  displayCanvasHelper.setSegmentEndCap("round");
  displayCanvasHelper.setRotation(30);
  //displayCanvasHelper.drawCircle(centerX, centerY, 50);
  //displayCanvasHelper.drawSegment(50, 50, 75, 100);
  displayCanvasHelper.drawSegment(50, 50, 300, 50);
  //displayCanvasHelper.drawSegment(centerX, centerY, 300, 300);
  displayCanvasHelper.showDisplay();
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
displayCanvasHelper.setColor(skinColorIndex, "#ebbd59");

/** @type {import("../utils/three/three.module.min")} */
const THREE = window.THREE;

/** @typedef {import("../utils/three/three.module.min").Vector2} TVector2 */
/** @typedef {import("../utils/three/three.module.min").Vector3} TVector3 */
/** @typedef {import("../utils/three/three.module.min").Quaternion} TQuaternion */
/** @typedef {import("../utils/three/three.module.min").Euler} TEuler */

const faceParams = {
  position: new THREE.Vector2(0, 0),
  rotation: {
    yaw: 0,
    roll: 0,
  },
  yawXScalars: { min: -10, max: 80 },
  yawWidthScalars: { min: 0.6, max: 0.1 },
  pupilYawWidthScalars: { min: 0.4, max: 0.1 },
  eyebrowCap: {
    /** @type {BS.DisplaySegmentCap} */
    start: "round",
    /** @type {BS.DisplaySegmentCap} */
    end: "round",
  },
  eyebrowRadius: {
    start: 15,
    end: 5,
  },
  eyeLineWidth: 7,
  pupilLineWidth: 5,
  eyebrowLineWidth: 5,
  eyeTilt: 0.1,
  eyeSpacing: 215,
  eyes: {
    left: {
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
          y: -60,
        },
        rotation: 0.1,
        maxLength: 160,
      },
    },
    right: {
      open: 1,
      maxHeight: 52,
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
        rotation: 0.2,
        maxLength: 160,
      },
    },
  },
};
window.faceParams = faceParams;

/** @param {{x:number,y:number,z:number}} target */
const lookAt = (target) => {
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

const faceYawInput = document.getElementById("faceYaw");
faceYawInput.addEventListener("input", () => {
  const yaw = Number(faceYawInput.value);
  faceParams.rotation.yaw = yaw;
  throttledDraw();
});
const lookAtVector = { x: 0, y: 0, z: 0.3 };
const faceXInput = document.getElementById("faceX");
faceXInput.addEventListener("input", () => {
  const x = Number(faceXInput.value);
  lookAtVector.x = x;
  lookAt(lookAtVector);
  throttledDraw();
});
const faceYInput = document.getElementById("faceY");
faceYInput.addEventListener("input", () => {
  const y = Number(faceYInput.value);
  lookAtVector.y = y;
  lookAt(lookAtVector);
  throttledDraw();
});
const faceZInput = document.getElementById("faceZ");
faceZInput.addEventListener("input", () => {
  const z = Number(faceZInput.value);
  lookAtVector.z = z;
  lookAt(lookAtVector);
  throttledDraw();
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
const drawEye = (side, center) => {
  const { pitch, roll, yaw } = faceParams.rotation;
  const { maxHeight, maxWidth, open, topCrop, bottomCrop } =
    faceParams.eyes[side];

  const isLeft = side == "left";
  const eyePosition = getEyePosition(side, center);
  eyePosition.rotateAround(center, roll);
  ctx.selectFillColor(backgroundColorIndex);
  ctx.selectLineColor(whiteColorIndex);
  ctx.setLineWidth(faceParams.eyeLineWidth);
  ctx.setRotationCropTop(topCrop);
  ctx.setRotationCropBottom(bottomCrop);
  ctx.setRotation(faceParams.eyeTilt * (isLeft ? 1 : -1) + roll, true);

  const widthScalar = 1 - getYawInterpolation(side, faceParams.yawWidthScalars);

  ctx.drawEllipse(
    eyePosition.x,
    eyePosition.y,
    maxWidth * widthScalar,
    maxHeight * open
  );
  ctx.clearRotationCrop();
};
/**
 * @param {Side} side
 * @param {TVector2} center
 */
const drawPupil = (side, center) => {
  const { open, pupil, maxWidth, maxHeight } = faceParams.eyes[side];
  const { maxRadius, position } = pupil;
  const isLeft = side == "left";

  // FIX
  if (open < 0.3) {
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

  ctx.selectFillColor(backgroundColorIndex);
  ctx.selectLineColor(pupilOutlineColorIndex);
  ctx.setLineWidth(faceParams.pupilLineWidth);

  ctx.drawEllipse(
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
const drawEyebrow = (side, center) => {
  const { eyebrowCap, eyebrowLineWidth, eyebrowRadius, eyes } = faceParams;
  const { open, eyebrow } = eyes[side];
  const { position, rotation, maxLength } = eyebrow;

  const isLeft = side == "left";
  const eyePosition = getEyePosition(side, center);

  const eyebrowPosition = new THREE.Vector2(position.x, position.y);
  eyebrowPosition.add(eyePosition);
  const eyebrowLength = maxLength;

  const sign = isLeft ? 1 : -1;
  const eyebrowStartPosition = new THREE.Vector2((sign * eyebrowLength) / 2, 0);
  const eyebrowEndPosition = new THREE.Vector2((-sign * eyebrowLength) / 2, 0);

  const eyebrowMidpoint = new THREE.Vector2()
    .addVectors(eyebrowStartPosition, eyebrowEndPosition)
    .multiplyScalar(0.5);
  eyebrowStartPosition.rotateAround(eyebrowMidpoint, rotation);
  eyebrowEndPosition.rotateAround(eyebrowMidpoint, rotation);

  const widthScalar = 1 - getYawInterpolation(side, faceParams.yawWidthScalars);

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

  ctx.selectFillColor(hairColorIndex);
  ctx.selectLineColor(hairOutlineColorIndex);
  ctx.setLineWidth(eyebrowLineWidth);

  ctx.setSegmentStartCap(eyebrowCap.start);
  ctx.setSegmentEndCap(eyebrowCap.end);
  ctx.setSegmentStartRadius(eyebrowRadius.start);
  ctx.setSegmentEndRadius(eyebrowRadius.end);

  ctx.drawSegment(
    eyebrowStartPosition.x,
    eyebrowStartPosition.y,
    eyebrowEndPosition.x,
    eyebrowEndPosition.y
  );
};
const draw = () => {
  const { width, height } = ctx;
  const center = new THREE.Vector2(
    width / 2 + faceParams.position.x,
    height / 2 + faceParams.position.y
  );

  drawEye("left", center);
  drawEye("right", center);
  drawPupil("left", center);
  drawPupil("right", center);
  drawEyebrow("left", center);
  drawEyebrow("right", center);

  ctx.showDisplay();
};
let interval = 100;
const updateInterval = (newInterval) => {
  interval = newInterval;
  startDrawing();
};
window.updateInterval = updateInterval;
let intervalId;
const startDrawing = () => {
  stopDrawing();
  setInterval(() => {
    const now = Date.now();
    const timeSinceLastDrawTime = now - lastDrawTime;
    lastDrawTime = now;

    // FILL - eye saccades

    draw();
  }, interval);
};
const stopDrawing = () => {
  if (intervalId != undefined) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
};
const throttledDraw = BS.ThrottleUtils.throttle(draw, 100, true);
if (true) {
  draw();
} else {
  startDrawing();
}
window.draw = draw;
