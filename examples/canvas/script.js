import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

// THREE
import * as three from "../utils/three/three.module.min.js";
/** @type {import("../utils/three/three.module.min")} */
const THREE = three;
window.THREE = THREE;

/** @typedef {import("../utils/three/three.module.min").Vector2} TVector2 */
/** @typedef {import("../utils/three/three.module.min").Box2} TBox2 */

// DEVICE
/** @type {BS.Device?} */
let currentDevice;

/** @param {(device: BS.Device)=>void} callback */
const onCurrentDevice = (callback) => {
  BS.DeviceManager.addEventListener("deviceConnected", (event) => {
    if (event.message.device == currentDevice) {
      callback(currentDevice);
    }
  });
};

BS.DeviceManager.addEventListener("deviceConnected", (event) => {
  const { device } = event.message;
  if (!currentDevice?.isConnected) {
    onDevice(device);
  }
});
BS.DeviceManager.addEventListener("deviceNotConnected", (event) => {
  const { device } = event.message;
  if (currentDevice == device) {
    console.log("currentDevice is gone");
    currentDevice.removeAllEventListeners();
    const nextConnectedDevice = BS.DeviceManager.connectedDevices[0];
    console.log("nextConnectedDevice", nextConnectedDevice);
    if (nextConnectedDevice) {
      onDevice(nextConnectedDevice);
    }
  }
});

/** @param {BS.Device} device */
const onDevice = (device, replaceCurrentDevice = false) => {
  if (currentDevice?.isConnected) {
    if (!replaceCurrentDevice) {
      return;
    }
    currentDevice.removeAllEventListeners();
  }
  currentDevice = device;
  console.log("currentDevice", currentDevice);
};

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", async () => {
  if (currentDevice) {
    currentDevice.toggleConnection();
  } else {
    toggleConnectionButton.innerText = "connecting...";
    await BS.Device.Connect();
    if (!currentDevice) {
      toggleConnectionButton.innerText = "connect";
    }
  }
});

onCurrentDevice((device) => {
  device.addEventListener(
    "connectionStatus",
    () => {
      switch (device.connectionStatus) {
        case "connected":
        case "notConnected":
          toggleConnectionButton.disabled = false;
          toggleConnectionButton.innerText = device.isConnected
            ? "disconnect"
            : "connect";
          break;
        case "connecting":
        case "disconnecting":
          toggleConnectionButton.disabled = true;
          toggleConnectionButton.innerText = currentDevice.connectionStatus;
          break;
      }
    },
    { immediate: true },
  );
});

// CAMERA

onCurrentDevice(async (device) => {
  if (device.hasCamera) {
    await device.setCameraConfiguration(
      { resolution: 200, qualityFactor: 60 },
      false,
    );
    await device.setSensorConfiguration({ camera: 5 });
  } else {
    console.error("device doesn't have camera");
    device.disconnect();
  }
});

/** @type {HTMLSpanElement} */
const cameraStatusSpan = document.getElementById("cameraStatus");
onCurrentDevice((device) => {
  device.addEventListener("cameraStatus", () => {
    cameraStatusSpan.innerText = device.cameraStatus;
  });
});

/** @type {HTMLButtonElement} */
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  if (currentDevice.cameraStatus == "idle") {
    currentDevice.takePicture();
  } else {
    currentDevice.stopCamera();
  }
});
onCurrentDevice((device) => {
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      updateTakePictureButton();
    },
    { immediate: true },
  );
});

const updateTakePictureButton = () => {
  takePictureButton.disabled = !currentDevice.isConnected;
  // device.sensorConfiguration.camera == 0 ||
  // device.cameraStatus != "idle";
};
onCurrentDevice((device) => {
  device.addEventListener(
    "cameraStatus",
    () => {
      updateTakePictureButton();
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const focusCameraButton = document.getElementById("focusCamera");
focusCameraButton.addEventListener("click", () => {
  if (currentDevice.cameraStatus == "idle") {
    currentDevice.focusCamera();
  } else {
    currentDevice.stopCamera();
  }
});
onCurrentDevice((device) => {
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      updateFocusCameraButton();
    },
    { immediate: true },
  );
});

const updateFocusCameraButton = () => {
  focusCameraButton.disabled =
    !currentDevice.isConnected || currentDevice.cameraStatus != "idle";
};
onCurrentDevice((device) => {
  device.addEventListener("cameraStatus", (event) => {
    updateFocusCameraButton();
    if (
      device.cameraStatus == "idle" &&
      event.message.previousCameraStatus == "focusing"
    ) {
      device.takePicture();
    }
  });
});

/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");
const cameraImageParent = cameraImage.parentElement;
onCurrentDevice((device) => {
  device.addEventListener("cameraImage", (event) => {
    cameraImage.src = event.message.url;
  });
});

/** @type {HTMLProgressElement} */
const cameraImageProgress = document.getElementById("cameraImageProgress");
onCurrentDevice((device) => {
  device.addEventListener("cameraImageProgress", (event) => {
    if (event.message.type == "image") {
      cameraImageProgress.value = event.message.progress;
    }
  });
});

/** @type {HTMLInputElement} */
const autoPictureCheckbox = document.getElementById("autoPicture");
autoPictureCheckbox.addEventListener("input", () => {
  currentDevice.autoPicture = autoPictureCheckbox.checked;
});
onCurrentDevice((device) => {
  device.addEventListener("autoPicture", () => {
    autoPictureCheckbox.checked = device.autoPicture;
  });
});

// CAMERA RATE
/** @type {HTMLInputElement} */
const cameraRateInput = document.getElementById("cameraRate");
cameraRateInput.addEventListener("focusout", () => {
  currentDevice.setSensorConfiguration({ camera: +cameraRateInput.value });
});
onCurrentDevice((device) => {
  device.addEventListener(
    "isConnected",
    () => {
      cameraRateInput.disabled = !device.isConnected;
    },
    { immediate: true },
  );
  device.addEventListener(
    "getSensorConfiguration",
    (event) => {
      cameraRateInput.value = device.sensorConfiguration.camera ?? 0;
    },
    { immediate: true },
  );
});

// CAMERA RESOLUTION
/** @type {HTMLInputElement} */
const cameraResolutionInput = document.getElementById("cameraResolution");
cameraResolutionInput.addEventListener("focusout", () => {
  currentDevice.setCameraConfiguration({
    resolution: +cameraResolutionInput.value,
  });
});
onCurrentDevice((device) => {
  device.addEventListener(
    "isConnected",
    () => {
      cameraResolutionInput.disabled = !device.isConnected;
    },
    { immediate: true },
  );
  device.addEventListener(
    "getCameraConfiguration",
    () => {
      cameraResolutionInput.value = device.cameraConfiguration.resolution;
    },
    { immediate: true },
  );
});

// CAMERA QUALITY
/** @type {HTMLInputElement} */
const cameraQualityInput = document.getElementById("cameraQuality");
cameraQualityInput.addEventListener("focusout", () => {
  currentDevice.setCameraConfiguration({
    qualityFactor: +cameraQualityInput.value,
  });
});
onCurrentDevice((device) => {
  device.addEventListener(
    "isConnected",
    () => {
      cameraQualityInput.disabled = !device.isConnected;
    },
    { immediate: true },
  );
  device.addEventListener(
    "getCameraConfiguration",
    () => {
      cameraQualityInput.value = device.cameraConfiguration.qualityFactor;
    },
    { immediate: true },
  );
});

// WEBCAM
const webcamSelect = document.querySelector("[data-camera]");
const webcamVideo = document.getElementById("cameraVideo");

webcamSelect.addEventListener("cameraStreamStart", (event) => {
  const { cameraStream } = event.detail;
  console.log("cameraStream", cameraStream);
  webcamVideo.srcObject = cameraStream;
  grabWebcamFrame();
  // setMirrorCamera(true);
});
webcamSelect.addEventListener("cameraStreamStop", () => {
  console.log("stopCameraStream");
  webcamVideo.srcObject = undefined;
  // setMirrorCamera(false);
});

const webcamCanvas = document.createElement("canvas");
const webcamContext = webcamCanvas.getContext("2d");
webcamVideo.addEventListener("loadedmetadata", () => {
  const { videoWidth, videoHeight } = webcamVideo;
  webcamCanvas.width = videoWidth;
  webcamCanvas.height = videoHeight;
  console.log({ videoWidth, videoHeight });
});
webcamVideo.addEventListener("emptied", () => {
  // cameraImage.src = undefined;
});

const grabWebcamFrame = () => {
  // console.log("grabWebcamFrame");
  webcamContext.drawImage(
    webcamVideo,
    0,
    0,
    webcamCanvas.width,
    webcamCanvas.height,
  );
  cameraImage.src = webcamCanvas.toDataURL("image/png");
  // console.log("cameraImage.src", cameraImage.src);
};

const imageContainer = document.getElementById("imageContainer");
const toggleMirrorCameraButton = document.getElementById("toggleMirrorCamera");
let mirrorCamera = false;
const setMirrorCamera = (newMirrorCamera) => {
  mirrorCamera = newMirrorCamera;
  // console.log({ mirrorCamera });
  imageContainer.style.transform = mirrorCamera ? "scaleX(-1)" : "";
  toggleMirrorCameraButton.innerText = mirrorCamera
    ? "unmirror camera"
    : "mirror camera";
};
toggleMirrorCameraButton.addEventListener("click", () => {
  setMirrorCamera(!mirrorCamera);
});

// CURSOR RANGE

import { BilinearQuad } from "./BilinearQuad.js";
const cursorMap = new BilinearQuad();
let useCursorMap = true;
/** @type {HTMLCanvasElement} */
const imageOverlayCanvas = document.getElementById("imageOverlay");
const imageOverlayContext = imageOverlayCanvas.getContext("2d");

let cursorMinX = 0.5 - 0.5;
let cursorMinY = 0.1 - 0.1;
let cursorMaxX = 0.9 + 0.1;
let cursorMaxY = 0.5 + 0.5;
cursorMap.addControlPoint(new THREE.Vector2(cursorMinX, cursorMinY));
cursorMap.addControlPoint(new THREE.Vector2(cursorMinX, cursorMaxY));
cursorMap.addControlPoint(new THREE.Vector2(cursorMaxX, cursorMinY));
cursorMap.addControlPoint(new THREE.Vector2(cursorMaxX, cursorMaxY));
console.log(cursorMap.getControlPoints());

const drawCursorMap = () => {
  const { width, height } = imageOverlayCanvas;
  const ctx = imageOverlayContext;
  imageOverlayContext.fillStyle = "blue";
  cursorMap.points.forEach((point) => {
    let { x, y } = point;
    if (mirrorCamera) {
      x = 1 - x;
    }
    imageOverlayContext.beginPath();
    imageOverlayContext.arc(x * width, y * height, 5, 0, Math.PI * 2);
    imageOverlayContext.fill();
  });
};

// CURSOR
const isTouchDevice = window.matchMedia("(any-pointer: coarse)").matches;
console.log({ isTouchDevice });

const drawingCursorContainer = document.getElementById("drawingCursor");
if (isTouchDevice) {
  // drawingCursorContainer.style.display = "none";
  webcamVideo.style.display = "none";
}

const setDrawingCursor = (x, y, normalized = false) => {
  // if (isTouchDevice) {
  //   return;
  // }
  if (!normalized) {
    const { width, height } = drawingCanvas;
    x /= width;
    y /= height;
  }

  // console.log("setDrawingCursor", { x, y });
  drawingCursorContainer.style.left = `${100 * x}%`;
  drawingCursorContainer.style.top = `${100 * y}%`;
};

// HAND LANDMARKER

window.addEventListener("handlandmarkerresult", () => {
  if (!webcamVideo.srcObject) {
    return;
  }
  grabWebcamFrame();
});

// CANVAS

import { getStroke } from "https://unpkg.com/perfect-freehand@1.2.2/dist/esm/index.mjs";
console.log("getStroke", getStroke);

/** @type {HTMLCanvasElement} */
const drawingCanvas = document.getElementById("drawingCanvas");
const drawingContext = drawingCanvas.getContext("2d");

/** @typedef {[x: number, y: number]} DrawPoint */
/** @typedef {{size: number, last: boolean}} DrawStrokeOptions */
/** @typedef {{fillStyle?: string, options: DrawStrokeOptions }} DrawContext */
/** @typedef {DrawContext & {points: DrawPoint[]}} DrawStroke */

/** @type {DrawContext} */
const drawContext = {
  fillStyle: "black",
  options: {
    size: 10,
    thinning: 0.3,
    last: false,
  },
};

const strokeSizeInput = document.querySelector("#strokeSize input");
strokeSizeInput.addEventListener("input", (event) => {
  setStrokeSize(+event.target.value);
});
const strokeSizeSpan = document.querySelector("#strokeSize span");

const setStrokeSize = (newStrokeSize) => {
  drawContext.options.size = newStrokeSize;
  console.log({ strokeSize: drawContext.options.size });
  strokeSizeSpan.innerText = newStrokeSize;
};
setStrokeSize(10);

const setStrokeFillStyle = (newFillStyle) => {
  drawContext.fillStyle = newFillStyle;
  console.log({ newFillStyle: drawContext.fillStyle });
  strokeFillStyleInput.value = newFillStyle;
};
const strokeFillStyleInput = document.getElementById("strokeFillStyle");
strokeFillStyleInput.addEventListener("input", (event) => {
  setStrokeFillStyle(event.target.value);
});

const colorPaletteContainer = document.getElementById("colorPalette");
const colorPalette = [
  "rgb(0, 0, 0)",
  "rgb(255, 193, 7)",
  "rgb(255, 87, 34)",
  "rgb(233, 30, 99)",
  "rgb(103, 58, 183)",
  "rgb(0, 188, 212)",
];
colorPalette.forEach((color) => {
  const colorContainer = document.createElement("div");
  colorContainer.style.backgroundColor = color;
  colorContainer.addEventListener("click", () => {
    setStrokeFillStyle(color);
  });
  colorPaletteContainer.appendChild(colorContainer);
});
setStrokeFillStyle(colorPalette[0]);

/** @type {DrawStroke[]} */
const drawStrokesStack = [];
let drawStrokesStackIndex = 0;
/** @param {DrawStroke} drawStroke */
const pushDrawStack = (drawStroke) => {
  console.log("pushDrawStack", drawStroke);
  drawStrokesStack.length = drawStrokesStackIndex;
  drawStrokesStack.push(drawStroke);
  drawStrokesStackIndex = drawStrokesStack.length;
  console.log({ drawStrokesStackIndex });
  drawStrokes();
};
const undoStroke = () => {
  if (drawStrokesStack.length == 0) {
    console.log("no strokes to undo");
    return;
  }
  if (drawStrokesStackIndex == 0) {
    console.log("already undid all strokes");
    return;
  }
  drawStrokesStackIndex--;
  console.log("undoStroke", { drawStrokesStackIndex });
  drawStrokes();
};
const redoStroke = () => {
  if (drawStrokesStack.length == 0) {
    console.log("no strokes to redo");
    return;
  }
  if (drawStrokesStackIndex == drawStrokesStack.length) {
    console.log("no strokes to redo");
    return;
  }
  drawStrokesStackIndex++;
  console.log("redoStroke", { drawStrokesStackIndex });
  drawStrokes();
};

const clearStrokes = () => {
  if (drawStrokesStack.length == 0) {
    console.log("no strokes to clear");
    return;
  }
  drawStrokesStack.length = 0;
  drawStrokesStackIndex = 0;

  console.log("clearStrokes");
  drawStrokes();
};

const redoStrokeButton = document.getElementById("redoStroke");
redoStrokeButton.addEventListener("click", () => {
  redoStroke();
});
const undoStrokeButton = document.getElementById("undoStroke");
undoStrokeButton.addEventListener("click", () => {
  undoStroke();
});
const clearStrokesButton = document.getElementById("clearStrokes");
clearStrokesButton.addEventListener("click", () => {
  clearStrokes();
});

// https://github.com/steveruizok/perfect-freehand#rendering
const average = (a, b) => (a + b) / 2;
/** @param {DrawPoint[]} points */
function getSvgPathFromStroke(points, closed = true) {
  const len = points.length;

  if (len < 4) {
    return ``;
  }

  let a = points[0];
  let b = points[1];
  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2,
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1],
  ).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2,
    )} `;
  }

  if (closed) {
    result += "Z";
  }

  return result;
}

/** @param {DrawStroke} stroke */
const drawStroke = (stroke) => {
  // console.log("drawStroke", stroke);
  const points = getStroke(
    stroke.points.map(([x, y]) => {
      return [x + drawOffset.x, y + drawOffset.y];
    }),
    stroke.options,
  );
  const pathData = getSvgPathFromStroke(points);
  const path = new Path2D(pathData);
  const ctx = drawingContext;
  ctx.fillStyle = stroke.fillStyle ?? "black";
  ctx.fill(path);
};

const drawStrokes = () => {
  // console.log("drawCanvas");

  const canvas = drawingCanvas;
  const ctx = drawingContext;
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < drawStrokesStackIndex; i++) {
    drawStroke(drawStrokesStack[i]);
  }
};

/** @type {DrawStroke?} */
let currentDrawStroke;
/** @param {PointerEvent} event */
const onPointerEvent = (event) => {
  // console.log("onPointerEvent", event);
  const canvas = drawingCanvas;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const { offsetX, offsetY } = event;

  const x = offsetX * scaleX;
  const y = offsetY * scaleY;

  setDrawingCursor(x, y);

  if (isDrawing) {
    addPoint(x, y);
  }
};

document.addEventListener("keydown", (event) => {
  if (!event.metaKey) {
    return;
  }
  let preventDefault = true;
  switch (event.key) {
    case "z":
      if (event.shiftKey) {
        redoStroke();
      } else {
        undoStroke();
      }
      break;
    case "y":
      redoStroke();
      break;
    case "Meta":
      break;
    default:
      console.log(`uncaught metaKey "${event.key}"`);
      preventDefault = false;
      break;
  }
  if (preventDefault) {
    event.preventDefault();
  }
});
/**
 * @param {number} x
 * @param {number} y
 */
const addPoint = (x, y, normalized = false) => {
  if (normalized) {
    const { width, height } = drawingCanvas;
    x *= width;
    y *= height;
  }
  // console.log("addPoint", { x, y });
  if (!currentDrawStroke) {
    currentDrawStroke = {
      points: [],
      ...structuredClone(drawContext),
    };
    pushDrawStack(currentDrawStroke);
  }
  currentDrawStroke.points.push([x - drawOffset.x, y - drawOffset.y]);
  drawStrokes();
};

let isDrawing = false;
const setIsDrawing = (newIsDrawing) => {
  if (isDrawing == newIsDrawing) {
    return;
  }

  isDrawing = newIsDrawing;
  console.log({ isDrawing });

  if (isDrawing) {
    drawingCursorContainer.classList.add("drawing");
  } else {
    drawingCursorContainer.classList.remove("drawing");
  }

  if (!isDrawing) {
    if (currentDrawStroke) {
      currentDrawStroke.options.last = true;
      currentDrawStroke = undefined;
      drawStrokes();
    }
  }
};
drawingCanvas.addEventListener("pointerdown", (event) => {
  if (isTouchDevice && device.isConnected) {
    return;
  }
  if (isDrawing) {
    return;
  }
  // console.log(event);
  drawingCanvas.setPointerCapture(event.pointerId);
  onPointerEvent(event);
  setIsDrawing(true);
});
drawingCanvas.addEventListener("pointermove", (event) => {
  if (isTouchDevice && device.isConnected) {
    const { movementX, movementY } = event;

    applyDrawOffset(movementX, movementY);
    return;
  }
  // console.log(event);
  onPointerEvent(event);
});
drawingCanvas.addEventListener("pointerup", (event) => {
  if (isTouchDevice && device.isConnected) {
    return;
  }
  if (!isDrawing) {
    return;
  }
  // console.log(event);
  drawingCanvas.releasePointerCapture(event.pointerId);
  onPointerEvent(event);
  setIsDrawing(false);
});

let drawOffset = {
  x: 0,
  y: 0,
};
const applyDrawOffset = (x, y) => {
  const canvas = drawingCanvas;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  drawOffset.x += x * scaleX;
  drawOffset.y += y * scaleY;
  // console.log("drawOffset", drawOffset);
  drawStrokes();
};
drawingCanvas.addEventListener("wheel", (event) => {
  event.preventDefault();

  const { deltaX, deltaY, offsetX, offsetY, ctrlKey: isZoom } = event;
  // console.log({ deltaX, deltaY, isZoom, offsetX, offsetY });

  if (!isZoom) {
    applyDrawOffset(-deltaX, -deltaY);
  }
});

// HAND LANDMARKER
/** @typedef {import("../utils/mediapipe/handLandmarker.js").Vector3} Vector3 */

/**
 * @param {Vector3} a
 * @param {Vector3} b
 * @returns {Vector3}
 */
const getLandmarkerCenter = (a, b, lerp = 0.5) => {
  const lerp2 = 1 - lerp;
  return {
    x: a.x * lerp + b.x * lerp2,
    y: a.y * lerp + b.y * lerp2,
    z: a.z * lerp + b.z * lerp2,
  };
};

/**
 * @param {Vector3} a
 * @param {Vector3} b
 * @returns {Vector3}
 */
const getLandmarkerDifference = (a, b) => {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
};

/**
 * @param {Vector3} a
 * @param {Vector3} b
 */
const getLandmarkerDistance = (a, b) => {
  const { x, y } = getLandmarkerDifference(a, b);
  return Math.sqrt(x ** 2 + y ** 2);
};

/** @typedef {"webcam"|"device"} CameraType */

/** @type {Record<CameraType, {min: number, max: number}>} */
const landmarkerPinchThreshold = {
  webcam: { min: 0.06, max: 0.09 },
  device: { min: 0.04, max: 0.06 },
};

const landmarkerInputBoxes = {
  webcam: new THREE.Box2({ x: 0, y: 0 }, { x: 1, y: 1 }),
  device: new THREE.Box2({ x: 0, y: 0 }, { x: 1, y: 1 }),
};
const landmarkerOutputBoxes = {
  webcam: new THREE.Box2({ x: 0, y: 0 }, { x: 1, y: 1 }),
  device: new THREE.Box2({ x: 0, y: 0 }, { x: 1, y: 1 }),
};

/**
 * @param {TBox2} box
 * @param {TVector2} point
 */
const lerpBox = (box, point, clamp = true) => {
  if (clamp) {
    box.clampPoint(point, point);
  }
  const { lerp } = THREE.MathUtils;
  point.set(
    lerp(box.min.x, box.max.x, point.x),
    lerp(box.min.y, box.max.y, point.y),
  );
};

/**
 * @param {import("three").Box2} box
 * @param {import("three").Vector2} point
 */
const inverseLerpBox = (box, point, clamp = true) => {
  const { inverseLerp } = THREE.MathUtils;

  point.set(
    inverseLerp(box.min.x, box.max.x, point.x),
    inverseLerp(box.min.y, box.max.y, point.y),
  );
  if (clamp) {
    box.clampPoint(point, point);
  }
};

/** @typedef {x: number, y: number} Vector2 */

/**
 * @param {Vector2} position
 * @param {CameraType} type
 */
const normalizeLandmarkerCenter = ({ x, y }, type) => {
  if (mirrorCamera) {
    x = 1 - x;
  }
  const inputBox = landmarkerInputBoxes[type];
  const outputBox = landmarkerOutputBoxes[type];

  const position = new THREE.Vector2(x, y);

  inverseLerpBox(inputBox, position);
  lerpBox(outputBox, position);

  return position;
};

let wasIndexPinching = false;
let wasMiddlePinching = false;
let wasRingPinching = false;
let wasPinkyPinching = false;

window.addEventListener("handlandmarkerresult", (event) => {
  /** @type {import("../utils/mediapipe/handLandmarker.js").HandLandmarkerResultEventDetail} */
  const detail = event.detail;

  const { handLandmarkerResult, HAND_LANDMARKS, HAND_LANDMARKS_MAP } = detail;

  const side = mirrorCamera || currentDevice?.isConnected ? "Right" : "Left";
  const rightHandIndex = handLandmarkerResult.handednesses.findIndex(
    (handedness) => handedness[0].displayName == side,
  );

  const landmarks = handLandmarkerResult.landmarks[rightHandIndex];
  if (!landmarks) {
    return;
  }
  // console.log("handLandmarkerResult", handLandmarkerResult);

  const thumbTip = landmarks[HAND_LANDMARKS_MAP["THUMB_TIP"]];
  const indexTip = landmarks[HAND_LANDMARKS_MAP["INDEX_FINGER_TIP"]];
  const middleTip = landmarks[HAND_LANDMARKS_MAP["MIDDLE_FINGER_TIP"]];
  const ringTip = landmarks[HAND_LANDMARKS_MAP["RING_FINGER_TIP"]];
  const pinkyTip = landmarks[HAND_LANDMARKS_MAP["PINKY_TIP"]];

  const indexThumbCenter = getLandmarkerCenter(indexTip, thumbTip);
  const middleThumbCenter = getLandmarkerCenter(middleTip, thumbTip);
  const ringThumbCenter = getLandmarkerCenter(ringTip, thumbTip);
  const pinkyThumbCenter = getLandmarkerCenter(pinkyTip, thumbTip);

  const indexThumbDistance = getLandmarkerDistance(indexTip, thumbTip);
  const middleThumbDistance = getLandmarkerDistance(middleTip, thumbTip);
  const ringThumbDistance = getLandmarkerDistance(thumbTip, thumbTip);
  const pinkyThumbDistance = getLandmarkerDistance(pinkyTip, thumbTip);

  console.log({ indexThumbDistance });

  const isWebcam = Boolean(webcamVideo.srcObject);

  const type = isWebcam ? "webcam" : "device";
  const pinchThreshold = landmarkerPinchThreshold[type];

  const isIndexPinching =
    indexThumbDistance <
    (wasIndexPinching ? pinchThreshold.max : pinchThreshold.min);
  const isMiddlePinching =
    middleThumbDistance <
    (wasMiddlePinching ? pinchThreshold.max : pinchThreshold.min);
  const isRingPinching =
    ringThumbDistance <
    (wasRingPinching ? pinchThreshold.max : pinchThreshold.min);
  const isPinkyPinching =
    pinkyThumbDistance <
    (wasPinkyPinching ? pinchThreshold.max : pinchThreshold.min);

  wasIndexPinching = isIndexPinching;
  wasMiddlePinching = isMiddlePinching;
  wasRingPinching = isRingPinching;
  wasPinkyPinching = isPinkyPinching;

  let normalizedLandmarkerCenter = normalizeLandmarkerCenter(
    indexThumbCenter,
    type,
  );
  // console.log(
  //   "normalizedLandmarkerCenter",
  //   normalizedLandmarkerCenter.toArray(),
  // );

  if (useCursorMap || device.isConnected) {
    // cursorMap.addControlPoint(normalizedLandmarkerCenter);
    drawCursorMap();
    normalizedLandmarkerCenter = cursorMap.inverseMap(
      normalizedLandmarkerCenter,
    );
  }

  setDrawingCursor(...normalizedLandmarkerCenter.toArray(), true);

  setIsDrawing(isIndexPinching);
  if (isIndexPinching) {
    const { x, y } = normalizedLandmarkerCenter;
    addPoint(x, y, true);
  }

  // FILL - pan,undo,redo
});
