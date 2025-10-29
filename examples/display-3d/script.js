import * as BS from "../../build/brilliantsole.module.js";
/** @typedef {import("../utils/three/three.module.min").Vector2} TVector2 */
/** @typedef {import("../utils/three/three.module.min").Vector3} TVector3 */
/** @typedef {import("../utils/three/three.module.min").Quaternion} TQuaternion */
/** @typedef {import("../utils/three/three.module.min").Euler} TEuler */

// DEVICE
const device = new BS.Device();
window.device = device;
window.BS = BS;

const rotationDevice = new BS.Device();
window.rotationDevice = rotationDevice;

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

const toggleRotationConnectionButton = document.getElementById(
  "toggleRotationConnection"
);
toggleRotationConnectionButton.addEventListener("click", () =>
  rotationDevice.toggleConnection()
);
rotationDevice.addEventListener("connectionStatus", () => {
  let disabled = false;
  let innerText = rotationDevice.connectionStatus;
  switch (rotationDevice.connectionStatus) {
    case "notConnected":
      innerText = "connect to rotator";
      break;
    case "connected":
      innerText = "disconnect from rotator";
      break;
  }
  toggleRotationConnectionButton.disabled = disabled;
  toggleRotationConnectionButton.innerText = innerText;
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

// CAMERA
const cameraEntity = document.getElementById("camera");
const cameraRigEntity = document.getElementById("cameraRig");

// MODEL
const modelEntity = document.getElementById("model");
const testEntity = document.getElementById("test");
let isTall = true;
const normalizeEntity = (entity) => {
  const object3D = entity.getObject3D("mesh");

  if (!object3D) return;

  const box = new THREE.Box3().setFromObject(object3D);
  const size = new THREE.Vector3();
  box.getSize(size);
  // isTall = size.y >= size.x;
  console.log({ isTall });
  const center = new THREE.Vector3();
  box.getCenter(center);

  object3D.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fitHeightDistance =
    1 / (2 * Math.tan(THREE.MathUtils.degToRad(50) / 2));
  const fitScreenScale = fitHeightDistance / maxDim;

  entity.object3D.scale.setScalar(fitScreenScale * 2.0);
};
let numberOfSteps = 10;
let waitTime = 5;
modelEntity.addEventListener("model-loaded", async () => {
  const modelEntity = document.querySelector("#model");
  modelEntity.object3D.scale.set(1, 1, 1);
  modelEntity.object3D.rotation.set(0, 0, 0);
  await waitForFrame();

  normalizeEntity(modelEntity);

  if (!jitRender) {
    await generateSpriteSheet(numberOfSteps, waitTime);
  }
});
testEntity.addEventListener("model-loaded", async () => {
  const testEntity = document.querySelector("#model");
  testEntity.object3D.scale.set(1, 1, 1);
  testEntity.object3D.rotation.set(0, 0, 0);
  await waitForFrame();

  normalizeEntity(testEntity);
});

const sceneEl = document.querySelector("a-scene");
const croppedCanvas = document.createElement("canvas");
const croppedCtx = croppedCanvas.getContext("2d");
const tempCanvas = document.createElement("canvas");
const tempCtx = tempCanvas.getContext("2d");
async function captureModelSnapshot(alphaThreshold = 10, reposition = true) {
  const position = cameraRigEntity.object3D.position.clone();
  if (reposition) {
    cameraRigEntity.object3D.position.set(0, 0, 3);
    cameraRigEntity.setAttribute("look-controls", { enabled: false });
    await waitForFrame();
    cameraRigEntity.object3D.rotation.set(0, 0, 0);
    await waitForFrame();
  }

  const renderer = sceneEl.renderer;
  const camera = sceneEl.camera;
  const object3D = modelEntity.getObject3D("mesh");
  if (!object3D) return null;

  // --- Step 1: project model’s bounding box into screen space ---
  const box = new THREE.Box3().setFromObject(object3D);
  const vertices = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ];

  const min = new THREE.Vector2(Infinity, Infinity);
  const max = new THREE.Vector2(-Infinity, -Infinity);

  vertices.forEach((v) => {
    v.project(camera);
    const x = (v.x * 0.5 + 0.5) * renderer.domElement.width;
    const y = (1 - (v.y * 0.5 + 0.5)) * renderer.domElement.height;
    min.x = Math.min(min.x, x);
    min.y = Math.min(min.y, y);
    max.x = Math.max(max.x, x);
    max.y = Math.max(max.y, y);
  });

  const width = Math.max(1, Math.floor(max.x - min.x));
  const height = Math.max(1, Math.floor(max.y - min.y));

  // --- Step 2: force renderer transparent ---
  const prevClearColor = new THREE.Color();
  const prevClearAlpha = renderer.getClearAlpha();
  renderer.getClearColor(prevClearColor);

  renderer.setClearColor(0x000000, 0);

  // Hide any <a-sky> entities
  const skies = sceneEl.querySelectorAll("a-sky");
  skies.forEach((sky) => (sky.object3D.visible = false));

  // --- Step 3: render scene ---
  renderer.render(sceneEl.object3D, camera);

  // --- Step 4: copy to temporary canvas ---
  tempCanvas.width = renderer.domElement.width;
  tempCanvas.height = renderer.domElement.height;
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.drawImage(renderer.domElement, 0, 0);

  // --- Step 5: crop initial bounding box ---
  croppedCanvas.width = width;
  croppedCanvas.height = height;
  croppedCtx.clearRect(0, 0, width, height);
  croppedCtx.drawImage(
    tempCanvas,
    min.x,
    min.y,
    width,
    height,
    0,
    0,
    width,
    height
  );

  // --- Step 6: pixel-level trim for zero-padding ---
  const imageData = croppedCtx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let top = height,
    bottom = 0,
    left = width,
    right = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > alphaThreshold) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  // Handle case where model is invisible
  if (right < left || bottom < top) {
    renderer.setClearColor(prevClearColor, prevClearAlpha);
    skies.forEach((sky) => (sky.object3D.visible = true));
    return null;
  }

  const finalW = right - left + 1;
  const finalH = bottom - top + 1;
  const finalCanvas = document.createElement("canvas");
  const finalCtx = finalCanvas.getContext("2d");
  finalCanvas.width = finalW;
  finalCanvas.height = finalH;
  finalCtx.clearRect(0, 0, finalW, finalH);

  const finalImageData = finalCtx.createImageData(finalW, finalH);
  for (let y = 0; y < finalH; y++) {
    const srcStart = ((y + top) * width + left) * 4;
    const destStart = y * finalW * 4;
    finalImageData.data.set(
      data.subarray(srcStart, srcStart + finalW * 4),
      destStart
    );
  }
  finalCtx.putImageData(finalImageData, 0, 0);

  // --- Step 7: restore renderer and skies ---
  renderer.setClearColor(prevClearColor, prevClearAlpha);
  skies.forEach((sky) => (sky.object3D.visible = true));

  if (reposition) {
    cameraRigEntity.setAttribute("look-controls", { enabled: true });
    cameraRigEntity.object3D.position.copy(position);
  }

  return finalCanvas; // tight transparent PNG
}
window.captureModelSnapshot = captureModelSnapshot;

async function captureEntityRotations(
  numberOfSteps = 10,
  waitTime = 100,
  skipPicture = false
) {
  const captures = [];
  const step = 360 / numberOfSteps;
  const minPitch = -80; // stop short of bottom pole
  const maxPitch = 80; // stop short of top pole

  //Single top pole (+90°)
  if (isTall) {
    modelEntity.object3D.rotation.set(THREE.MathUtils.degToRad(90), 0, 0);
  } else {
    modelEntity.object3D.rotation.set(Math.PI, 0, 0);
  }
  if (!skipPicture) {
    await waitForFrame();
    await BS.wait(waitTime);
    const canvas = await captureModelSnapshot();
    captures.push({
      euler: modelEntity.object3D.rotation.clone(),
      quaternion: modelEntity.object3D.quaternion.clone(),
      canvas,
    });
  }

  // Loop over pitch, skipping true poles
  for (let pitch = maxPitch; pitch >= minPitch; pitch -= step) {
    for (let i = 0; i < numberOfSteps; i++) {
      const yaw = i * step;

      // Rotate entity
      if (isTall) {
        modelEntity.object3D.rotation.set(
          THREE.MathUtils.degToRad(pitch), // X = pitch
          THREE.MathUtils.degToRad(yaw), // Y = yaw
          THREE.MathUtils.degToRad(0), // Z = roll (upright),
          "ZXY"
        );
      } else {
        modelEntity.object3D.rotation.set(
          THREE.MathUtils.degToRad(pitch + 90), // X = pitch
          THREE.MathUtils.degToRad(0), // Y = yaw
          THREE.MathUtils.degToRad(yaw), // Z = roll (upright),
          "XYZ"
        );
      }

      // Wait for next frame so rotation is applied
      await waitForFrame();
      await BS.wait(waitTime);

      if (!skipPicture) {
        // Take picture
        const canvas = await captureModelSnapshot();
        captures.push({
          euler: modelEntity.object3D.rotation.clone(),
          quaternion: modelEntity.object3D.quaternion.clone(),
          canvas,
        });
      }
    }
  }

  // Single bottom pole (-90°)
  if (isTall) {
    modelEntity.object3D.rotation.set(THREE.MathUtils.degToRad(-90), 0, 0);
  } else {
    modelEntity.object3D.rotation.set(0, 0, 0);
  }
  if (!skipPicture) {
    await waitForFrame();
    await BS.wait(waitTime);
    const canvas = await captureModelSnapshot();
    captures.push({
      euler: modelEntity.object3D.rotation.clone(),
      quaternion: modelEntity.object3D.quaternion.clone(),
      canvas,
    });
  }

  modelEntity.object3D.rotation.set(0, 0, 0);

  return captures;
}
window.captureEntityRotations = captureEntityRotations;

let createSinglePalette = false;
let skipVoidColor = false;

/** @type {import("../utils/three/three.module.min")} */
const THREE = window.THREE;

/** @type {{sprite: BS.DisplaySprite, euler: TEuler, quaternion: TQuaternion, image: HTMLImageElement}[]} */
const spriteCaptures = [];
window.spriteCaptures = spriteCaptures;
const generateSpriteSheet = async (numberOfSteps, waitTime) => {
  generateSpriteSheetButton.disabled = true;
  const captures = await captureEntityRotations(numberOfSteps, waitTime);

  let maxHeight = -Infinity;
  let maxWidth = -Infinity;
  captures.forEach(({ canvas }) => {
    maxHeight = Math.max(maxHeight, canvas.height);
    maxWidth = Math.max(maxWidth, canvas.width);
  });
  const scalar = drawInputHeight / maxHeight;
  const previewScalar = maxSpritePreviewHeight / maxHeight;

  spriteCaptures.forEach(({ image }) => image.remove());
  spriteCaptures.length = 0;

  spriteSheet = { name: "model", sprites: [] };
  if (createSinglePalette) {
    // FILL - create palette from default front angle
  }
  for (let i in captures) {
    const { canvas, euler, quaternion } = captures[i];

    const height = canvas.height * scalar;
    const width = canvas.width * scalar;

    const resizedCanvas = BS.resizeImage(canvas, width, height);

    const { sprite, blob } = await BS.canvasToSprite(
      resizedCanvas,
      i,
      skipVoidColor
        ? Math.min(
            BS.pixelDepthToNumberOfColors(pixelDepth),
            displayCanvasHelper.numberOfColors - 1
          )
        : BS.pixelDepthToNumberOfColors(pixelDepth),
      createSinglePalette ? "palette" : i,
      !createSinglePalette,
      spriteSheet,
      skipVoidColor ? 1 : 0
    );
    //console.log(sprite, blob);

    const previewHeight = canvas.height * previewScalar;
    const previewWidth = canvas.width * previewScalar;

    const image = new Image();
    image.width = previewWidth;
    image.height = previewHeight;
    image.src = URL.createObjectURL(blob);
    document.body.appendChild(image);
    spriteCaptures.push({
      sprite,
      euler,
      quaternion,
      image,
    });
  }

  checkSpriteSheetSize();

  generateSpriteSheetButton.disabled = false;
  if (uploadWholeSpriteSheet) {
    await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
    await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
  }
  await draw();
};
let maxSpritePreviewHeight = 50;
window.generateSpriteSheet = generateSpriteSheet;

const generateSpriteSheetButton = document.getElementById(
  "generateSpriteSheet"
);
generateSpriteSheetButton.addEventListener("click", () => {
  generateSpriteSheet(numberOfSteps, waitTime);
});

/** @type {HTMLInputElement} */
const modelInput = document.getElementById("modelInput");
modelInput.addEventListener("input", () => {
  const file = modelInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  loadModel(url);
  modelInput.value = "";
});
const loadModel = (url) => {
  console.log("model url", url);
  modelEntity.setAttribute("gltf-model", `url(${url})`);
  testEntity.setAttribute("gltf-model", `url(${url})`);
};

window.addEventListener(
  "keydown",
  function (e) {
    if (e.target.nodeName == "INPUT") {
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

const waitForFrame = async () => await new Promise(requestAnimationFrame);
const lookAtEntity = document.getElementById("lookAt");
async function getRelativeModelQuaternion() {
  lookAtEntity.object3D.position.copy(modelEntity.object3D.position);
  lookAtEntity.object3D.lookAt(cameraRigEntity.object3D.position);
  await waitForFrame();

  const lookAtEntityQuaternion = lookAtEntity.object3D.quaternion
    .clone()
    .invert();
  const modelEntityQuaternion = new THREE.Quaternion();
  modelEntity.object3D.getWorldQuaternion(modelEntityQuaternion);

  lookAtEntityQuaternion.multiply(modelEntityQuaternion);
  testEntity.object3D.quaternion.copy(lookAtEntityQuaternion);
  return lookAtEntityQuaternion;
}
window.getRelativeModelQuaternion = getRelativeModelQuaternion;

async function getModelScreenBoundingBox(alphaThreshold = 10) {
  sceneEl.object3D.updateMatrixWorld(true);

  const renderer = sceneEl.renderer;
  const canvas = renderer.domElement;
  const camera = sceneEl.camera;

  // drawing buffer (physical pixels)
  const dbW = canvas.width,
    dbH = canvas.height;

  // CSS pixel size (use this for UI overlays)
  const size = renderer.getSize(new THREE.Vector2());
  const cssW = size.x,
    cssH = size.y;

  const object3D = modelEntity.getObject3D("mesh");
  if (!object3D) return null;

  // --- Project 8 corners of world-space AABB ---
  const box = new THREE.Box3().setFromObject(object3D);
  if (!isFinite(box.min.x)) return null;

  const corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ];

  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;

  for (const v of corners) {
    v.project(camera); // NDC
    const x = (v.x * 0.5 + 0.5) * dbW; // -> drawing buffer pixels
    const y = (1 - (v.y * 0.5 + 0.5)) * dbH;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  // Unclamped AABB (may be <0 or >dbW/dbH)
  const unclamped = { minX, minY, maxX, maxY };

  // Clamp for safe readPixels (ROI)
  const sx0 = Math.max(0, Math.floor(minX));
  const sy0 = Math.max(0, Math.floor(minY));
  const sx1 = Math.min(dbW, Math.ceil(maxX));
  const sy1 = Math.min(dbH, Math.ceil(maxY));
  const roiW = Math.max(0, sx1 - sx0);
  const roiH = Math.max(0, sy1 - sy0);
  if (roiW === 0 || roiH === 0) return null;

  // Transparent render pass
  const prevClearColor = new THREE.Color();
  const prevClearAlpha = renderer.getClearAlpha();
  renderer.getClearColor(prevClearColor);
  renderer.setClearColor(0x000000, 0);

  const skies = sceneEl.querySelectorAll("a-sky");
  const prevSkyVis = [];
  skies.forEach(
    (sky, i) => (
      (prevSkyVis[i] = sky.object3D.visible), (sky.object3D.visible = false)
    )
  );

  if (typeof waitForFrame === "function") await waitForFrame();
  renderer.render(sceneEl.object3D, camera);

  // Read pixels in ROI (WebGL is bottom-left origin)
  const gl = renderer.getContext();
  const pixels = new Uint8Array(roiW * roiH * 4);
  gl.readPixels(sx0, dbH - sy1, roiW, roiH, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  // Alpha trim within ROI
  let left = roiW,
    right = -1,
    bottom = 0,
    topBL = roiH;
  for (let rowBL = 0; rowBL < roiH; rowBL++) {
    const rowOffset = rowBL * roiW * 4;
    for (let col = 0; col < roiW; col++) {
      const a = pixels[rowOffset + col * 4 + 3];
      if (a > alphaThreshold) {
        if (col < left) left = col;
        if (col > right) right = col;
        if (rowBL < topBL) topBL = rowBL;
        if (rowBL > bottom) bottom = rowBL;
      }
    }
  }

  // Restore renderer + skies ASAP
  renderer.setClearColor(prevClearColor, prevClearAlpha);
  skies.forEach((sky, i) => (sky.object3D.visible = prevSkyVis[i]));

  if (right < left || bottom < topBL) return null;

  // Convert ROI (bottom-left origin) to screen (top-left origin)
  const topRowTopOrigin = roiH - 1 - bottom;
  const bottomRowTopOrigin = roiH - 1 - topBL;

  const tightMinX = sx0 + left;
  const tightMaxX = sx0 + right;
  const tightMinY = sy0 + topRowTopOrigin;
  const tightMaxY = sy0 + bottomRowTopOrigin;

  // Helper: normalize a box
  const toNorm = (box, denomW, denomH) => ({
    minX: box.minX / denomW,
    minY: box.minY / denomH,
    maxX: box.maxX / denomW,
    maxY: box.maxY / denomH,
    // no +1: use continuous extents for normalized sizes
    width: (box.maxX - box.minX) / denomW,
    height: (box.maxY - box.minY) / denomH,
  });

  // Build outputs in both spaces (choose 'css' for HTML overlays)
  const tightBox = {
    minX: tightMinX,
    minY: tightMinY,
    maxX: tightMaxX,
    maxY: tightMaxY,
  };
  const aabbBox = unclamped;

  return {
    // Normalized to CSS size (recommended for DOM overlays)
    css: {
      tight: toNorm(tightBox, cssW, cssH),
      aabb: toNorm(aabbBox, cssW, cssH), // can go <0 or >1 if off-screen
    },
    // Normalized to drawing buffer (rarely what you want for UI)
    buffer: {
      tight: toNorm(tightBox, dbW, dbH),
      aabb: toNorm(aabbBox, dbW, dbH),
    },
  };
}

window.getModelScreenBoundingBox = getModelScreenBoundingBox;

async function getClosestModelSprite() {
  const _quaternion = await getRelativeModelQuaternion();
  const _euler = new THREE.Euler().setFromQuaternion(_quaternion);
  let rotation;
  if (isTall) {
    _euler.reorder("ZXY");
    rotation = -_euler.z;
    _euler.z = 0;
  } else {
    _euler.reorder("XYZ");
    rotation = -_euler.y;
    _euler.y = 0;
  }

  _quaternion.setFromEuler(_euler);
  // console.log("euler", _euler);

  let closestIndex = -1;
  let closestAngle = Infinity;
  spriteCaptures.forEach(({ quaternion, euler }, index) => {
    //euler.z = _euler.z;
    const angle = Math.abs(quaternion.angleTo(_quaternion));
    if (angle < closestAngle) {
      closestAngle = angle;
      closestIndex = index;
    }
  });
  // console.log({ closestAngle, closestIndex });

  const { sprite, image } = spriteCaptures[closestIndex];

  if (selectedImage != image) {
    if (selectedImage) {
      selectedImage.classList.remove("selected");
    }
    selectedImage = image;
    selectedImage.classList.add("selected");
  }

  return {
    sprite,
    rotation,
  };
}
let selectedImage;
window.getClosestModelSprite = getClosestModelSprite;

// DRAGOVER
window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  console.log(file);
  if (isModelFilename(file?.name)) {
    const url = URL.createObjectURL(file);
    loadModel(url);
    return;
  }
});

// REDRAW ON CHANGE
const redrawOnChangeInput = document.getElementById("redrawOnChange");
redrawOnChangeInput.addEventListener("input", () => {
  setRedrawOnChange(redrawOnChangeInput.checked);
});
let redrawOnChange = redrawOnChangeInput.checked;
const setRedrawOnChange = (newRedrawOnChange) => {
  redrawOnChange = newRedrawOnChange;
  console.log({ redrawOnChange });
  redrawOnChangeInput.checked = redrawOnChange;
};

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
  // eg https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb
  if (isModelFilename(string)) {
    console.log("pasted model url");
  }
});
const modelFileExtensions = [".glb", ".gltf"];
const isModelFilename = (string) =>
  modelFileExtensions.some((extension) => string.endsWith(extension));
window.addEventListener("paste", (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind == "file") {
      const file = item.getAsFile();
      if (isModelFilename(file.name)) {
        const url = URL.createObjectURL(file);
        loadModel(url);
        return;
      }
    }
  }
});

// DRAW PARAMS

const drawXContainer = document.getElementById("drawX");
const drawXInput = drawXContainer.querySelector("input");
const drawXSpan = drawXContainer.querySelector("span.value");
let drawX = Number(drawXInput.value);

drawXInput.addEventListener("input", () => {
  setDrawX(Number(drawXInput.value));
  if (redrawOnChange) {
    draw();
  }
});
const setDrawX = (newDrawX) => {
  drawX = newDrawX;
  drawXInput.value = drawX;
  // console.log({ drawX });
  drawXSpan.innerText = Math.round(drawX);
};

const drawYContainer = document.getElementById("drawY");
const drawYInput = drawYContainer.querySelector("input");
const drawYSpan = drawYContainer.querySelector("span.value");
let drawY = Number(drawYInput.value);

drawYInput.addEventListener("input", () => {
  setDrawY(Number(drawYInput.value));
  if (redrawOnChange) {
    draw();
  }
});
const setDrawY = (newDrawY) => {
  drawY = newDrawY;
  drawYInput.value = drawY;
  // console.log({ drawY });
  drawYSpan.innerText = Math.round(drawY);
};

const drawRotationContainer = document.getElementById("drawRotation");
const drawRotationInput = drawRotationContainer.querySelector("input");
const drawRotationSpan = drawRotationContainer.querySelector("span.value");
let drawRotation = Number(drawRotationInput.value);

drawRotationInput.addEventListener("input", () => {
  // console.log({ drawRotation });
  setDrawRotation(Number(drawRotationInput.value));
  if (redrawOnChange) {
    draw();
  }
});
const setDrawRotation = (newDrawRotation) => {
  drawRotation = newDrawRotation;
  drawRotationSpan.innerText = Math.round(newDrawRotation);
  drawRotationInput.value = drawRotation;
};

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
  setDrawOutputHeight(Number(drawOutputHeightInput.value));
  if (redrawOnChange) {
    draw();
  }
});
const setDrawOutputHeight = (newDrawOutputHeight) => {
  drawOutputHeight = newDrawOutputHeight;
  // console.log({ drawOutputHeight });

  drawOutputHeightSpan.innerText = Math.round(drawOutputHeight);
  drawOutputHeightInput.value = drawOutputHeight;
};

// PIXEL DEPTH

let pixelDepth = BS.DisplayPixelDepths[1];
const setPixelDepth = (newPixelDepth) => {
  pixelDepth = newPixelDepth;
  // console.log({ pixelDepth });
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
let defaultMaxFileLength = 14 * 1024; // 14kb
let isDrawing = false;
/** @type {BS.DisplaySpriteSheet} */
let spriteSheet;
let uploadWholeSpriteSheet = true;
let jitRender = false;
let drawWhenReady = false;

window.bbScalar = 1;
const draw = async () => {
  if (isDrawing) {
    console.log("busy drawing");
    drawWhenReady = true;
    return;
  }
  if (!spriteSheet && !jitRender) {
    console.error("no sprite sheet");
    return;
  }
  isDrawing = true;

  const boundingBox = await getModelScreenBoundingBox();
  if (boundingBox) {
    let { minX, maxX, maxY, minY, width, height } = boundingBox.buffer.aabb;
    const widthScalar = displayCanvasHelper.width;
    const heightScalar = displayCanvasHelper.height;

    height *= heightScalar * bbScalar;
    width *= widthScalar * bbScalar;

    setDrawX((widthScalar * (minX + maxX)) / 2);
    setDrawY((heightScalar * (minY + maxY)) / 2);

    // await displayCanvasHelper.setRotation(0);
    // await displayCanvasHelper.drawRect(drawX, drawY, width, height);

    if (jitRender) {
      setDrawOutputHeight(height);
      let spriteScale = drawOutputHeight / drawInputHeight;
      await displayCanvasHelper.setSpriteScale(spriteScale);

      const canvas = await captureModelSnapshot(10, false);
      const width = canvas.width * (drawInputHeight / canvas.height);

      const resizedCanvas = BS.resizeImage(canvas, width, drawInputHeight);
      const maxFileLength = displayCanvasHelper.device?.isConnected
        ? displayCanvasHelper.device.maxFileLength
        : defaultMaxFileLength;

      spriteSheet = await BS.canvasToSpriteSheet(
        resizedCanvas,
        "model",
        "model",
        skipVoidColor
          ? Math.min(
              BS.pixelDepthToNumberOfColors(pixelDepth),
              displayCanvasHelper.numberOfColors - 1
            )
          : BS.pixelDepthToNumberOfColors(pixelDepth),
        "palette",
        maxFileLength
      );
      checkSpriteSheetSize();
      await displayCanvasHelper.drawSpriteFromSpriteSheet(
        drawX,
        drawY,
        spriteSheet.sprites[0].name,
        spriteSheet,
        "palette"
      );
    } else {
      const { sprite, rotation } = await getClosestModelSprite();

      setDrawRotation(rotation);
      await displayCanvasHelper.setRotation(drawRotation, true);

      const innerBox = innerBoxSize(
        width,
        height,
        rotation,
        sprite.height / sprite.width
      );

      let spriteScale = innerBox.height / sprite.height;
      await displayCanvasHelper.setSpriteScale(spriteScale);

      if (uploadWholeSpriteSheet) {
        console.log("drawing sprite");
        await displayCanvasHelper.drawSprite(drawX, drawY, sprite.name);
        if (!createSinglePalette) {
          await displayCanvasHelper.selectSpriteSheetPalette(sprite.name);
        }
      } else {
        console.log("uploadng whole sprite");
        await displayCanvasHelper.drawSpriteFromSpriteSheet(
          drawX,
          drawY,
          sprite.name,
          spriteSheet,
          createSinglePalette ? "model" : sprite.name
        );
      }
    }
  }
  await displayCanvasHelper.show();
};

function innerBoxSize(W, H, theta, aspectRatio) {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const absCos = Math.abs(cos);
  const absSin = Math.abs(sin);

  const w1 = W / (absCos + aspectRatio * absSin);
  const w2 = H / (absSin + aspectRatio * absCos);

  const w = Math.min(w1, w2);
  const h = aspectRatio * w;

  return { width: w, height: h };
}

const saveSpriteSheet = () => {
  console.log("saveSpriteSheet");
  const spritesheetString = JSON.stringify(spriteSheet, null, 2);
  const blob = new Blob([spritesheetString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `spritesheet-${spriteSheet.name}.json`;
  a.click();

  URL.revokeObjectURL(url);
};
window.saveSpriteSheet = saveSpriteSheet;

const redrawButton = document.getElementById("draw");
redrawButton.addEventListener("click", () => {
  draw();
});

displayCanvasHelper.addEventListener("ready", () => {
  isDrawing = false;
  if (drawWhenReady || autoDraw) {
    drawWhenReady = false;
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

const checkSpriteSheetSizeButton = document.getElementById(
  "checkSpriteSheetSize"
);
const checkSpriteSheetSize = () => {
  const arrayBuffer = displayCanvasHelper.serializeSpriteSheet(spriteSheet);
  checkSpriteSheetSizeButton.innerText = `size: ${(
    arrayBuffer.byteLength / 1024
  ).toFixed(2)}kb`;
  if (displayCanvasHelper.device?.isConnected) {
    checkSpriteSheetSizeButton.innerText += ` (max ${(
      displayCanvasHelper.device.maxFileLength / 1024
    ).toFixed(2)}kb)`;
  }
};
checkSpriteSheetSizeButton.addEventListener("click", () => {
  checkSpriteSheetSize();
});

// ROTATOR
const toggleRotationInput = document.getElementById("toggleRotation");
toggleRotationInput.addEventListener("input", () => {
  setToggleRotation(toggleRotationInput.checked);
});
let rotationEnabled = toggleRotationInput.checked;
const setToggleRotation = (newRotationEnabled) => {
  rotationEnabled = newRotationEnabled;
  console.log({ rotationEnabled });
  toggleRotationInput.checked = rotationEnabled;
  if (rotationDevice.isConnected) {
    updateSensorConfig();
  }
};
rotationDevice.addEventListener("connected", () => {
  updateSensorConfig();
});
const updateSensorConfig = () => {
  if (rotationDevice.isConnected) {
    let sensorRate = rotationEnabled ? 20 : 0;
    rotationDevice.setSensorConfiguration({
      gameRotation: sensorRate,
      linearAcceleration: sensorRate,
    });
  }
};

/** @type {TQuaternion} */
const _quaternion = new THREE.Quaternion();
/** @type {TQuaternion} */
const targetQuaternion = new THREE.Quaternion();
/**
 * @param {BS.Quaternion} quaternion
 * @param {boolean} applyOffset
 */
const updateQuaternion = (quaternion, applyOffset = false) => {
  _quaternion.copy(quaternion);
  targetQuaternion.copy(_quaternion);
  if (applyOffset) {
    targetQuaternion.premultiply(offsetQuaternion);
  }
  targetRotationEntity.object3D.quaternion.slerp(
    targetQuaternion,
    window.interpolationSmoothing
  );
};
rotationDevice.addEventListener("gameRotation", (event) => {
  let gameRotation = event.message.gameRotation;
  updateQuaternion(gameRotation, true);
});
rotationDevice.addEventListener("rotation", (event) => {
  const rotation = event.message.rotation;
  updateQuaternion(rotation, true);
});

window.sensorRate = 20;
window.interpolationSmoothing = 0.4;
window.positionScalar = 0.2;

/** @type {TVector3} */
const _position = new THREE.Vector3();

/** @param {BS.Vector3} position */
const updatePosition = (position) => {
  _position.copy(position).multiplyScalar(window.positionScalar);
  targetPositionEntity.object3D.position.lerp(
    _position,
    window.interpolationSmoothing
  );
};

rotationDevice.addEventListener("acceleration", (event) => {
  const acceleration = event.message.acceleration;
  updatePosition(acceleration);
});
rotationDevice.addEventListener("gravity", () => {
  const gravity = event.message.gravity;
  updatePosition(gravity);
});
rotationDevice.addEventListener("linearAcceleration", (event) => {
  const linearAcceleration = event.message.linearAcceleration;
  updatePosition(linearAcceleration);
});

/** @type {TQuaternion} */
const offsetQuaternion = new THREE.Quaternion();
const resetOrientation = () => {
  offsetQuaternion.copy(_quaternion).invert();
};

const targetPositionEntity = document.getElementById("position");
const targetRotationEntity = document.getElementById("rotation");

/** @type {HTMLButtonElement} */
const resetOrientationButton = document.getElementById("resetOrientation");
resetOrientationButton.addEventListener("click", () => {
  resetOrientation();
});
