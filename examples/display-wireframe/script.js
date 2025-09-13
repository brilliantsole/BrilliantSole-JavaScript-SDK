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

  const text = textarea.value;
  console.log(`drawing "${text}"`);

  // FILL
  await displayCanvasHelper.show();
};

displayCanvasHelper.addEventListener("ready", () => {
  isDrawing = false;
  if (isWaitingToRedraw) {
    isWaitingToRedraw = false;
    draw();
  }
});

// DRAW PARAMS

const drawSpriteParams = {
  // FILL
};

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
window.scene = scene;
const entitiesToDraw = ["a-box", "a-plane", "a-sphere", "a-cylinder"];
/** @type {BS.DisplaySpriteSheet} */
const spriteSheet = {
  name: "scene",
  sprites: [],
};
let drawWireframeAsSprite = true;
const drawScene = async (scene) => {
  const entities = Array.from(scene.querySelectorAll(entitiesToDraw.join(",")));
  let wireframe;
  for (let i in entities) {
    const entity = entities[i];
    const _wireframe = getWireframe(entity);
    if (!wireframe) {
      wireframe = _wireframe;
    } else {
      wireframe = BS.mergeWireframes(wireframe, _wireframe);
    }
  }
  if (drawWireframeAsSprite) {
    spriteSheet.sprites.push({
      name: "wireframe",
      commands: [
        { type: "selectFillColor", fillColorIndex: 1 },
        { type: "setSegmentRadius", segmentRadius: 2 },
        { type: "drawWireframe", wireframe },
      ],
    });
    await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
    await displayCanvasHelper.selectSpriteSheet("scene");
    await displayCanvasHelper.selectSpriteColor(1, 1);
    await displayCanvasHelper.drawSprite(0, 0, "wireframe");
  } else {
    await displayCanvasHelper.drawWireframe(wireframe);
  }
  await displayCanvasHelper.show();
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

    const x = (projected.x * 0.5 + 0.5) * canvas.width;
    const y = (1 - (projected.y * 0.5 + 0.5)) * canvas.height;

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

    const x = (projected.x * 0.5 + 0.5) * canvas.width;
    const y = (1 - (projected.y * 0.5 + 0.5)) * canvas.height;

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
}
window.getWireframe = getWireframe;

// PUNCH MODE
// FILL

// HAND TRACKING MODE
// FILL

// FACE TRACKING MODE
// FILL

// BODY TRACKING MODE
// FILL

// MODES

const modes = ["scene", "punch", "hand", "face", "body"];
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
  console.log({ mode });
  scene.classList.add("hidden");

  switch (mode) {
    case "scene":
      scene.classList.remove("hidden");
      break;
    case "punch":
      // FILL
      break;
    case "hand":
      // FILL
      break;
    case "face":
      // FILL
      break;
    case "body":
      // FILL
      break;
  }
};
setMode(modes[0]);
