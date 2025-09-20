import * as BS from "../../build/brilliantsole.module.js";

/** @typedef {import("../utils/three/three.module.min").Vector3} TVector3 */
/** @typedef {import("../utils/three/three.module.min").Quaternion} TQuaternion */
/** @typedef {import("../utils/three/three.module.min").Euler} TEuler */

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
displayCanvasHelper.setSegmentRadius(2, true);
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
displayCanvasHelper.setColor(1, "white", true);

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
const draw = async () => {
  if (isUploading) {
    return;
  }
  if (!didLoad) {
    return;
  }

  if (isDrawing) {
    //console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }
  isDrawing = true;

  switch (mode) {
    case "scene":
      await drawScene(scene);
      break;
    case "punch":
      await drawScene(punchScene);
      break;
    case "face":
      await drawFace();
      break;
    case "pose":
      await drawPose();
      break;
    case "hand":
      await drawHand();
      break;
  }

  await displayCanvasHelper.show();
};

const drawButton = document.getElementById("draw");
drawButton.addEventListener("click", () => {
  draw();
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

// SCENE MODE
const scene = document.getElementById("scene");
let _cameraRig;
window.scene = scene;
const entitiesToDraw = ["a-box", "a-plane", "a-sphere", "a-cylinder"];
/** @type {BS.DisplaySpriteSheet} */
const spriteSheet = {
  name: "scene",
  sprites: [],
};
window.spriteSheet = spriteSheet;
window.drawWireframeAsSprite = false;
const drawScene = async (scene) => {
  let entities = Array.from(scene.querySelectorAll(entitiesToDraw.join(",")));
  // entities.push(modelEntity);
  // entities = [modelEntity];
  console.log(entities);
  let wireframe;
  for (let i in entities) {
    const entity = entities[i];
    if (!entity.object3D.visible) {
      continue;
    }
    const _wireframe = getWireframe(entity);
    if (!wireframe) {
      wireframe = _wireframe;
    } else {
      wireframe = BS.mergeWireframes(wireframe, _wireframe);
    }
  }
  if (drawWireframeAsSprite) {
    spriteSheet.sprites[0] = {
      name: "wireframe",
      width: 640,
      height: 400,
      commands: [
        { type: "selectFillColor", fillColorIndex: 1 },
        { type: "setSegmentRadius", segmentRadius: 2 },
        { type: "drawWireframe", wireframe },
      ],
    };
    await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
    await displayCanvasHelper.selectSpriteSheet("scene");
    await displayCanvasHelper.selectSpriteColor(1, 1);
    await displayCanvasHelper.drawSprite(640 / 2, 400 / 2, "wireframe");
  } else {
    await displayCanvasHelper.drawWireframe(wireframe);
  }
};
window.drawScene = drawScene;
function getWireframeEdges(entity) {
  const canvas = displayCanvasHelper.canvas;
  const mesh = entity.getObject3D("mesh");
  if (!mesh || !mesh.geometry) return { points: [], edges: [] };

  const camera = entity
    .closest("a-scene")
    .querySelector("[camera]")
    .getObject3D("camera");
  if (!camera) return { points: [], edges: [] };

  const geometry = mesh.geometry.index
    ? mesh.geometry.toNonIndexed()
    : mesh.geometry;

  const edgesGeo = new THREE.EdgesGeometry(geometry);
  const pos = edgesGeo.attributes.position;

  const points = [];
  const edges = [];
  const oldToNewIndex = new Map();

  const v = new THREE.Vector3();
  const projected = new THREE.Vector3();

  // Project vertices
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.applyMatrix4(mesh.matrixWorld);
    projected.copy(v).project(camera);

    // Skip vertices behind camera
    if (projected.z < -1 || projected.z > 1) continue;

    let x, y;
    if (drawWireframeAsSprite) {
      x = (projected.x * 0.5 + 0.0) * canvas.width;
      y = (1 - (projected.y * 0.5 + 1.0)) * canvas.height;
    } else {
      x = (projected.x * 0.5 + 0.5) * canvas.width;
      y = (1 - (projected.y * 0.5 + 0.5)) * canvas.height;
    }

    oldToNewIndex.set(i, points.length);
    points.push({ x, y });
  }

  // Each consecutive pair of vertices is an edge in EdgesGeometry
  for (let i = 0; i < pos.count; i += 2) {
    if (oldToNewIndex.has(i) && oldToNewIndex.has(i + 1)) {
      edges.push({
        startIndex: oldToNewIndex.get(i),
        endIndex: oldToNewIndex.get(i + 1),
      });
    }
  }

  return { points, edges };
}
function getWireframeCulled(entity) {
  const canvas = displayCanvasHelper.canvas;
  const mesh = entity.getObject3D("mesh");
  if (!mesh || !mesh.geometry) return { points: [], edges: [] };

  const camera = entity
    .closest("a-scene")
    .querySelector("[camera]")
    .getObject3D("camera");
  if (!camera) return { points: [], edges: [] };

  const geometry = mesh.geometry.index
    ? mesh.geometry.toNonIndexed()
    : mesh.geometry;
  const pos = geometry.attributes.position;

  const points = [];
  const edgesSet = new Set();
  const oldToNewIndex = new Map();

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  camera.getWorldPosition(camPos);

  const projected = new THREE.Vector3();

  // Project vertices and store indices
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3()
      .fromBufferAttribute(pos, i)
      .applyMatrix4(mesh.matrixWorld);
    projected.copy(v).project(camera);

    if (projected.z < -1 || projected.z > 1) continue;

    let x, y;
    if (drawWireframeAsSprite) {
      x = (projected.x * 0.5 + 0.0) * canvas.width;
      y = (1 - (projected.y * 0.5 + 1.0)) * canvas.height;
    } else {
      x = (projected.x * 0.5 + 0.5) * canvas.width;
      y = (1 - (projected.y * 0.5 + 0.5)) * canvas.height;
    }

    oldToNewIndex.set(i, points.length);
    points.push({ x, y });
  }

  // Build edges for front-facing triangles
  for (let i = 0; i < pos.count; i += 3) {
    vA.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    vB.fromBufferAttribute(pos, i + 1).applyMatrix4(mesh.matrixWorld);
    vC.fromBufferAttribute(pos, i + 2).applyMatrix4(mesh.matrixWorld);

    ab.subVectors(vB, vA);
    ac.subVectors(vC, vA);
    normal.crossVectors(ab, ac).normalize();

    const toCam = camPos.clone().sub(vA);

    if (normal.dot(toCam) > 0) {
      // Add edges
      [
        [i, i + 1],
        [i + 1, i + 2],
        [i + 2, i],
      ].forEach(([a, b]) => {
        if (oldToNewIndex.has(a) && oldToNewIndex.has(b)) {
          const key =
            oldToNewIndex.get(a) < oldToNewIndex.get(b)
              ? `${oldToNewIndex.get(a)},${oldToNewIndex.get(b)}`
              : `${oldToNewIndex.get(b)},${oldToNewIndex.get(a)}`;
          edgesSet.add(key);
        }
      });
    }
  }

  const edges = Array.from(edgesSet).map((str) => {
    const [a, b] = str.split(",").map(Number);
    return { startIndex: a, endIndex: b };
  });

  return { points, edges };
}

function getWireframe(entity) {
  const culledWireframe = getWireframeCulled(entity);
  const edgesWireframe = getWireframeEdges(entity);
  // console.log(culledWireframe.points, edgesWireframe.points);
  return BS.intersectWireframes(culledWireframe, edgesWireframe);
  return culledWireframe;
}
window.getWireframe = getWireframe;

// PUNCH MODE
/** @type {HTMLIFrameElement} */
const punchIframe = document.getElementById("punch");
window.punchIframe = punchIframe;
let punchScene;
punchIframe.addEventListener("load", () => {
  punchScene = punchIframe.contentWindow.document.querySelector("a-scene");
  window.punchScene = punchScene;
  punchScene.style.width = "100%";
  punchScene.style.height = "100%";
});

// CAMERA
const cameraContainer = document.getElementById("cameraContainer");
/** @type {HTMLVideoElement} */
const cameraVideo = document.getElementById("cameraVideo");
cameraVideo.volume = 0.0001;
cameraVideo.addEventListener("loadedmetadata", () => {
  const { videoWidth, videoHeight } = cameraVideo;
  cameraVideo.removeAttribute("hidden");
  console.log({ videoWidth, videoHeight });
  cameraCanvas.width = videoWidth;
  cameraCanvas.height = videoHeight;
  if (trackingModes.includes(mode)) {
    trackingRenderLoop();
  }
});
const toggleMirrorCameraButton = document.getElementById("toggleMirrorCamera");
let mirrorCamera = false;
const setMirrorCamera = (newMirrorCamera) => {
  mirrorCamera = newMirrorCamera;
  // console.log({ mirrorCamera });
  cameraContainer.style.transform = mirrorCamera ? "scaleX(-1)" : "";
  toggleMirrorCameraButton.innerText = mirrorCamera
    ? "unmirror camera"
    : "mirror camera";
};
toggleMirrorCameraButton.addEventListener("click", () => {
  setMirrorCamera(!mirrorCamera);
});
setMirrorCamera(true);

const toggleCanvasButton = document.getElementById("toggleCanvas");
let showCanvas = true;
const setShowCanvas = (newShowCanvas) => {
  showCanvas = newShowCanvas;
  console.log({ showCanvas });
  cameraCanvas.style.display = showCanvas ? "" : "none";
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
        aspectRatio: displayCanvasHelper.aspectRatio,
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

let lastTrackingTime;
let drawingUtils;
const trackingModes = ["face", "hand", "pose"];
const landmarkers = {};
const results = {};
let isTracking = false;
const trackingRenderLoop = () => {
  if (isTracking) {
    return;
  }
  isTracking = true;
  const landMarker = landmarkers[mode];
  if (
    cameraVideo.currentTime !== lastTrackingTime &&
    cameraStream &&
    !cameraVideo.paused &&
    landMarker
  ) {
    const result = landMarker.detectForVideo(cameraVideo, performance.now());
    //console.log("result", result);
    lastTrackingTime = cameraVideo.currentTime;
    results[mode] = result;

    const context = cameraContext;
    const canvas = cameraCanvas;

    if (!drawingUtils) {
      drawingUtils = new DrawingUtils(context);
      window.drawingUtils = drawingUtils;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);

    switch (mode) {
      case "face":
        for (const landmarks of result.faceLandmarks) {
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
        break;
      case "hand":
        for (const landmarks of result.landmarks) {
          drawConnectors(context, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 3,
          });
          drawLandmarks(context, landmarks, {
            color: "#FF0000",
            lineWidth: 0,
            radius: 3,
          });
        }
        break;
      case "pose":
        for (const landmark of result.landmarks) {
          drawingUtils.drawLandmarks(landmark, {
            radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 2, 1),
          });
          drawingUtils.drawConnectors(
            landmark,
            PoseLandmarker.POSE_CONNECTIONS
          );
        }
        break;
    }

    if (autoDraw) {
      draw();
    }
  }
  isTracking = false;

  if (trackingModes.includes(mode)) {
    requestAnimationFrame(() => {
      trackingRenderLoop();
    });
  }
};
window.trackingRenderLoop = trackingRenderLoop;

// CAMERA CANVAS
/** @type {HTMLCanvasElement} */
const cameraCanvas = document.getElementById("cameraCanvas");
const cameraContext = cameraCanvas.getContext("2d");

// VISION
import {
  HandLandmarker,
  FilesetResolver,
  FaceLandmarker,
  DrawingUtils,
  PoseLandmarker,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
let runningMode = "LIVE_STREAM";
window.PoseLandmarker = PoseLandmarker;
window.FaceLandmarker = FaceLandmarker;
// HAND TRACKING MODE
let handLandmarker = undefined;

const createHandLandmarker = async () => {
  if (handLandmarker) {
    return;
  }
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: runningMode,
    numHands: 2,
    /**
     * The minimum confidence score for the hand detection to be considered successful in palm detection model.
     */
    minHandDetectionConfidence: 0.5,
    /**
     * The minimum confidence score for the hand presence score in the hand landmark detection model.
     * In Video mode and Live stream mode, if the hand presence confidence score from the hand landmark model is below this threshold,
     * Hand Landmarker triggers the palm detection model.
     * Otherwise, a lightweight hand tracking algorithm determines the location of the hand(s) for subsequent landmark detections.
     */
    minHandPresenceConfidence: 0.5,
    /**
     * The minimum confidence score for the hand tracking to be considered successful.
     * This is the bounding box IoU threshold between hands in the current frame and the last frame.
     * In Video mode and Stream mode of Hand Landmarker, if the tracking fails, Hand Landmarker triggers hand detection.
     * Otherwise, it skips the hand detection.
     */
    minTrackingConfidence: 0.5,
  });
  console.log("created handLandmarker", handLandmarker);
  landmarkers.hand = handLandmarker;
};

const drawHand = async () => {
  const result = results["hand"];
  if (!result) {
    return;
  }
  if (result.landmarks.length == 0) {
    return;
  }
  console.log("drawHand");
  for (const landmarks of result.landmarks) {
    // console.log("landmarks", landmarks);
    /** @type {BS.DisplayWireframe} */
    const wireframe = {
      points: [],
      edges: [],
    };
    landmarks.forEach(({ x, y, z }, index) => {
      if (mirrorCamera) {
        x = 1 - x;
      }
      x *= displayCanvasHelper.width;
      y *= displayCanvasHelper.height;
      wireframe.points.push({ x, y });
    });
    HAND_CONNECTIONS.forEach(([startIndex, endIndex]) => {
      wireframe.edges.push({ startIndex, endIndex });
    });
    await displayCanvasHelper.drawWireframe(wireframe);
  }
};

// FACE TRACKING MODE
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
    runningMode,
    numFaces: 1,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFacialTransformationMatrixes: false,
  });
  console.log("created faceLandmarker", faceLandmarker);
  landmarkers.face = faceLandmarker;
};

function subdivideArray(arr, subdivisions) {
  if (subdivisions < 1) throw new Error("subdivisions must be >= 1");
  if (arr.length < 2) return arr;

  const result = [];
  const step = (arr.length - 1) / subdivisions;

  for (let i = 0; i <= subdivisions; i++) {
    const index = Math.round(i * step);
    result.push(arr[index]);
  }

  return result;
}
const addEdgesToWireframe = (
  wireframe,
  landmarkEdges,
  intervalOrSubdivision
) => {
  const isFace = landmarkEdges == FaceLandmarker.FACE_LANDMARKS_FACE_OVAL;
  const isLips = landmarkEdges == FaceLandmarker.FACE_LANDMARKS_LIPS;
  const isLeftEyebrow =
    landmarkEdges == FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW;
  const isRightEyebrow =
    landmarkEdges == FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW;
  const isEyebrow = isLeftEyebrow || isRightEyebrow;
  const isLeftEye = landmarkEdges == FaceLandmarker.FACE_LANDMARKS_LEFT_EYE;
  const isRightEye = landmarkEdges == FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE;
  const isEye = isLeftEye || isRightEye;

  let splitLandmarkEdges = [];
  let latestSplitLandmarkEdges;
  landmarkEdges.forEach(({ start, end }) => {
    const edge = { start, end };
    if (!latestSplitLandmarkEdges) {
      latestSplitLandmarkEdges = [];
      splitLandmarkEdges.push(latestSplitLandmarkEdges);
    } else {
      const previousEdge =
        latestSplitLandmarkEdges[latestSplitLandmarkEdges.length - 1];
      if (previousEdge && previousEdge.end != edge.start) {
        latestSplitLandmarkEdges = [];
        splitLandmarkEdges.push(latestSplitLandmarkEdges);
      }
    }
    latestSplitLandmarkEdges.push(edge);
  });

  if (isLips) {
    splitLandmarkEdges = splitLandmarkEdges.filter((_, i) => i == 2 || i == 3);
  }

  let starts = [];
  let ends = [];
  splitLandmarkEdges.forEach((landmarkEdges) => {
    if (isLips || isEye || isEyebrow || isFace) {
      let points = [];
      landmarkEdges.forEach(({ start: startIndex, end: endIndex }, index) => {
        const isEnd = index == landmarkEdges.length - 1;
        points.push(startIndex);
        if (isEnd) {
          points.push(endIndex);
        }
      });
      points = subdivideArray(points, intervalOrSubdivision);
      points.forEach((pointIndex, index) => {
        const isStart = index == 0;
        const isEnd = index == points.length - 1;
        if (isStart) {
          return;
        }
        const isStartEdge = index == 1;
        const previousPointIndex = points[index - 1];
        const edge = { startIndex: previousPointIndex, endIndex: pointIndex };
        if (isStartEdge) {
          starts.push(edge);
        }
        if (isEnd) {
          ends.push(edge);
        }
        wireframe.edges.push(edge);
      });
    } else {
      landmarkEdges.forEach(({ start: startIndex, end: endIndex }, index) => {
        const isStart = index == 0;
        const isEnd = index == landmarkEdges.length - 1;
        const edge = { startIndex, endIndex };
        const skip = index % intervalOrSubdivision != 0;

        if (isStart) {
          starts.push(edge);
        }
        if (isEnd) {
          ends.push(edge);
        }

        if (skip && !isEnd) {
          return;
        }
        if (!isStart) {
          const previousEdge = wireframe.edges[wireframe.edges.length - 1];
          previousEdge.endIndex = startIndex;
        }
        if (isEnd && skip) {
          const previousEdge = wireframe.edges[wireframe.edges.length - 1];
          previousEdge.endIndex = endIndex;
          return;
        }
        wireframe.edges.push(edge);
      });
    }
  });

  if (false && isEyebrow) {
    wireframe.edges.push({
      startIndex: starts[0].startIndex,
      endIndex: starts[1].startIndex,
    });
    wireframe.edges.push({
      startIndex: ends[0].endIndex,
      endIndex: ends[1].endIndex,
    });
  }
};
const drawFace = async () => {
  const result = results["face"];
  if (!result) {
    return;
  }
  console.log("drawFace");
  for (const landmarks of result.faceLandmarks) {
    // console.log("landmarks", landmarks);
    /** @type {BS.DisplayWireframe} */
    const wireframe = {
      points: [],
      edges: [],
    };
    landmarks.forEach(({ x, y, z }, index) => {
      if (mirrorCamera) {
        x = 1 - x;
      }
      x *= displayCanvasHelper.width;
      y *= displayCanvasHelper.height;
      wireframe.points.push({ x, y });
    });
    addEdgesToWireframe(wireframe, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, 7);
    addEdgesToWireframe(wireframe, FaceLandmarker.FACE_LANDMARKS_LIPS, 3);
    addEdgesToWireframe(
      wireframe,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      2
    );
    addEdgesToWireframe(
      wireframe,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      2
    );
    addEdgesToWireframe(wireframe, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, 2);
    addEdgesToWireframe(wireframe, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, 2);

    addEdgesToWireframe(wireframe, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, 1);
    addEdgesToWireframe(wireframe, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, 1);

    console.log("face wireframe", wireframe);
    await displayCanvasHelper.drawWireframe(wireframe);
  }
};

// POSE MODE
let poseLandmarker;

const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task`,
      delegate: "GPU",
    },
    runningMode: runningMode,
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false,
  });
  console.log("created poseLandmarker", poseLandmarker);
  landmarkers.pose = poseLandmarker;
};

const drawPose = async () => {
  const result = results["pose"];
  if (!result) {
    return;
  }
  console.log("drawPose");
  for (const landmarks of result.landmarks) {
    // console.log("landmarks", landmarks);
    /** @type {BS.DisplayWireframe} */
    const wireframe = {
      points: [],
      edges: [],
    };
    landmarks.forEach(({ x, y, z }, index) => {
      if (mirrorCamera) {
        x = 1 - x;
      }
      x *= displayCanvasHelper.width;
      y *= displayCanvasHelper.height;
      wireframe.points.push({ x, y });
    });
    PoseLandmarker.POSE_CONNECTIONS.forEach(({ start, end }) => {
      wireframe.edges.push({ startIndex: start, endIndex: end });
    });
    await displayCanvasHelper.drawWireframe(wireframe);
  }
};

// MODES

const modes = ["scene", "punch", "hand", "face", "pose"];
let mode = modes[0];
const modeSelect = document.getElementById("modeSelect");
const modeOptgroup = modeSelect.querySelector("optgroup");

modes.forEach((mode) => {
  modeOptgroup.appendChild(new Option(mode));
});
modeSelect.value = mode;
modeSelect.addEventListener("input", () => {
  setMode(modeSelect.value);
});
const setMode = (newMode) => {
  mode = newMode;
  modeSelect.value = mode;
  console.log({ mode });
  scene.classList.add("hidden");
  punchIframe.classList.add("hidden");
  cameraContainer.classList.add("hidden");

  switch (mode) {
    case "scene":
      scene.classList.remove("hidden");
      _cameraRig = scene.querySelector("[camera]").parentEl;
      break;
    case "punch":
      punchIframe.classList.remove("hidden");
      _cameraRig = punchScene.querySelector("[camera]");
      break;
    case "hand":
      cameraContainer.classList.remove("hidden");
      createHandLandmarker();
      break;
    case "face":
      cameraContainer.classList.remove("hidden");
      createFaceLandmarker();
      break;
    case "pose":
      cameraContainer.classList.remove("hidden");
      createPoseLandmarker();
      break;
  }

  if (trackingModes.includes(mode)) {
    trackingRenderLoop();
  }
};
scene.addEventListener("loaded", () => {
  setTimeout(() => {
    setMode(modes[0]);
  });
});

// AUTODRAW
const autoDrawInput = document.getElementById("autoDraw");
autoDrawInput.addEventListener("input", () => {
  setAutoDraw(autoDrawInput.checked);
});
let autoDraw = autoDrawInput.checked;
const setAutoDraw = (newAutoDraw) => {
  autoDraw = newAutoDraw;
  console.log({ autoDraw });
  autoDrawInput.checked = autoDraw;
  if (autoDraw) {
    draw();
  }
};

displayCanvasHelper.addEventListener("ready", () => {
  isDrawing = false;
  if (isWaitingToRedraw || autoDraw) {
    isWaitingToRedraw = false;
    draw();
  }
});

// ORIENTATION
const toggleOrientationCheckbox = document.getElementById("toggleOrientation");
toggleOrientationCheckbox.addEventListener("input", () => {
  setOrientation(toggleOrientationCheckbox.checked);
});
let orientationEnabled = false;
const orientationSensorRate = 40;
const setOrientation = (newOrientationEnabled) => {
  orientationEnabled = newOrientationEnabled;
  console.log({ orientationEnabled });
  updateOrientation();

  if (orientationEnabled) {
    _cameraRig.removeAttribute("look-controls");
  } else {
    _cameraRig.setAttribute("look-controls", "");
  }
};
device.addEventListener("connected", () => {
  updateOrientation();
});
const updateOrientation = () => {
  if (device.isConnected) {
    device.setSensorConfiguration({
      orientation: orientationEnabled ? orientationSensorRate : 0,
    });
  }
};

let orientationOffsetYaw = 0;
/** @type {TVector3} */
const orientationVector3 = new THREE.Vector3();
/** @type {TEuler} */
const orientationEuler = new THREE.Euler(0, 0, 0, "YXZ");
device.addEventListener("orientation", (event) => {
  const { orientation } = event.message;

  orientationVector3
    .set(orientation.pitch, orientation.heading, orientation.roll)
    .multiplyScalar(Math.PI / 180);
  orientationEuler.setFromVector3(orientationVector3);

  _cameraRig.object3D.rotation.set(
    orientationEuler.x,
    orientationEuler.y - orientationOffsetYaw,
    orientationEuler.z
  );
});

const calibrateOrientationButton = document.getElementById(
  "calibrateOrientation"
);
const calibrateOrientation = () => {
  orientationOffsetYaw = orientationEuler.y;
};
calibrateOrientationButton.addEventListener("click", () => {
  calibrateOrientation();
});

// ROTATOR
const rotator = new BS.Device();

const toggleRotatorConnectionButton = document.getElementById(
  "toggleRotatorConnection"
);
toggleRotatorConnectionButton.addEventListener("click", () =>
  rotator.toggleConnection()
);
rotator.addEventListener("connectionStatus", () => {
  let disabled = false;
  let innerText = rotator.connectionStatus;
  switch (rotator.connectionStatus) {
    case "notConnected":
      innerText = "connect";
      break;
    case "connected":
      innerText = "disconnect";
      break;
  }
  toggleRotatorConnectionButton.disabled = disabled;
  toggleRotatorConnectionButton.innerText = innerText;
});

const toggleRotatorCheckbox = document.getElementById("toggleRotator");
toggleRotatorCheckbox.addEventListener("input", () => {
  setRotator(toggleRotatorCheckbox.checked);
});
let rotatorEnabled = false;
const rotatorSensorRate = 20;
const setRotator = (newRotatorEnabled) => {
  rotatorEnabled = newRotatorEnabled;
  console.log({ rotatorEnabled });
  updateRotator();
};
rotator.addEventListener("connected", () => {
  updateRotator();
});
const updateRotator = () => {
  if (rotator.isConnected) {
    rotator.setSensorConfiguration({
      gameRotation: rotatorEnabled ? rotatorSensorRate : 0,
    });
  }
};

const rotatorEntity = scene.querySelector(".rotator");
/** @type {TQuaternion} */
const rotatorQuaternion = new THREE.Quaternion();
/** @type {TQuaternion} */
const rotatorOffsetQuaternion = new THREE.Quaternion();
rotator.addEventListener("gameRotation", (event) => {
  const { gameRotation } = event.message;
  rotatorQuaternion.copy(gameRotation);
  rotatorEntity.object3D.quaternion.multiplyQuaternions(
    rotatorOffsetQuaternion,
    rotatorQuaternion
  );
});

const calibrateRotatorButton = document.getElementById("calibrateRotator");
const calibrateRotator = () => {
  rotatorOffsetQuaternion.copy(rotatorQuaternion).invert();
};
calibrateRotatorButton.addEventListener("click", () => {
  calibrateRotator();
});

// DID LOAD
didLoad = true;
