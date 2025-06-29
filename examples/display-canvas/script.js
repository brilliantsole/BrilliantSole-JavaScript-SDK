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
  displayPlaneEntity.setAttribute("height", displayPlaneEntityHeight);
};
let displayPlaneEntityHeight = 0.3;
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
  lookAt: { x: 0, y: 0, z: 0.3 },
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
  blink: {
    isBlinking: false,
    lastUpdateTime: 0,
    offset: 0,
    offsetRange: { min: 15, max: 15 },
    /** @type {Side} */
    dominantSide: "left",
    nextTime: 0,
    timeRange: { min: 1000, max: 3500 },
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
    lastUpdateTime: 0,
    nextTime: 0,
    timeRange: { min: 3000, max: 5000 },
    duration: 0,
    durationRange: { min: 3, max: 3 },
    isMoving: false,
    cheekYRange: { min: 0, max: 0 },
    cheekYRotation: { min: -0.1, max: 0.1 },
    startPose: {
      cheeks: {
        left: { y: 0, rotation: 0 },
        right: { y: 0, rotation: 0 },
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
        left: { y: 0, rotation: 0 },
        right: { y: 0, rotation: 0 },
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
          y: 60,
        },
        maxHeight: 30,
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
          y: 60,
        },
        maxHeight: 30,
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
const faceXInput = document.getElementById("faceX");
faceXInput.addEventListener("input", () => {
  const x = Number(faceXInput.value);
  faceParams.lookAt.x = x;
  updateLookAt();
  throttledDraw();
});
const faceYInput = document.getElementById("faceY");
faceYInput.addEventListener("input", () => {
  const y = Number(faceYInput.value);
  faceParams.lookAt.y = y;
  updateLookAt();
  throttledDraw();
});
const faceZInput = document.getElementById("faceZ");
faceZInput.addEventListener("input", () => {
  const z = Number(faceZInput.value);
  faceParams.lookAt.z = z;
  updateLookAt();
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

  if (open < 0.5) {
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
  const { isBlinking } = faceParams.blink;
  let { position, rotation, maxLength } = eyebrow;

  const isLeft = side == "left";
  const eyePosition = getEyePosition(side, center);

  const blinkInterpolation = 1 - open; // FIX

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
/**
 * @param {Side} side
 * @param {TVector2} center
 */
const drawCheek = (side, center) => {
  const { roll } = faceParams.rotation;
  const { open, cheek, maxWidth } = faceParams.eyes[side];
  const { position, maxHeight } = cheek;

  const isLeft = side == "left";
  const eyePosition = getEyePosition(side, center);
  const cheekPosition = new THREE.Vector2(position.x, position.y);
  cheekPosition.add(eyePosition);
  cheekPosition.rotateAround(center, roll);

  const widthScalar = 1 - getYawInterpolation(side, faceParams.yawWidthScalars);
  const width = maxWidth * widthScalar * 1.5;

  // FILL - just draw line

  ctx.selectFillColor(backgroundColorIndex);
  ctx.selectLineColor(skinColorIndex);
  ctx.setLineWidth(faceParams.cheekLineWidth);
  ctx.setRotationCropLeft(width - maxWidth);
  ctx.setRotationCropRight(width - maxWidth);
  ctx.setRotationCropBottom(maxHeight * 1.5);
  ctx.setRotation(faceParams.eyeTilt * (isLeft ? 1 : -1) + roll, true);

  ctx.drawEllipse(cheekPosition.x, cheekPosition.y, width, maxHeight);
  ctx.clearRotationCrop();
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
  //drawCheek("left", center);
  //drawCheek("right", center);

  ctx.showDisplay();
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
          throttleInterval *
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
        ) * throttleInterval;

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
        ) * throttleInterval;

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
        return;
      }

      rotation.yaw = THREE.MathUtils.lerp(
        startRotation.yaw,
        targetRotation.yaw,
        interpolation
      );
      rotation.roll = THREE.MathUtils.lerp(
        startRotation.roll,
        targetRotation.roll,
        interpolation
      );
    }
  }

  const { pose } = faceParams;
  {
    let { timeRange, nextTime, isMoving, durationRange } = pose;
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
        ) * throttleInterval;

      pose.isMoving = true;

      const { eyebrows } = pose.targetPose;
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

      // FILL - cheeks
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

        // FILL - cheeks
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

      // FILL - cheeks
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
let throttleInterval = 120;
const updateInterval = (newInterval) => {
  throttleInterval = newInterval;
  startDrawing();
};
window.updateInterval = updateInterval;
let intervalId;
const startDrawing = () => {
  stopDrawing();
  setInterval(() => {
    tick();
    throttledDraw();
  }, throttleInterval);
};
const stopDrawing = () => {
  if (intervalId != undefined) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
};
const throttledDraw = BS.ThrottleUtils.throttle(draw, throttleInterval, true);
if (false) {
  draw();
} else {
  startDrawing();
}
window.draw = draw;
