import * as BS from "../../build/brilliantsole.module.js";

import * as three from "../utils/three/three.module.min.js";

/** @type {import("../utils/three/three.module.min")} */
const THREE = three;
window.THREE = THREE;

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

device.addEventListener("connected", async () => {
  if (device.isDisplayAvailable) {
    displayCanvasHelper.device = device;
    await device.setSensorConfiguration({ camera: 5 });
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
    //console.log({ colorIndex, colorString });
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
displayCanvasHelper.setColor(displayCanvasHelper.numberOfColors - 1, "white");
displayCanvasHelper.selectSpriteColor(
  displayCanvasHelper.numberOfColors - 1,
  displayCanvasHelper.numberOfColors - 1
);
displayCanvasHelper.flushContextCommands();

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

/**
 * @param {number} t
 * @param {"smoothstep" | "smootherstep" | "easeInOutSine" | "easeInOutCubic" | "easeIn" | "easeOut" | "circle"} type
 */
function ease(t, type = "smoothstep") {
  t = Math.min(Math.max(t, 0), 1); // clamp to [0,1]

  switch (type) {
    case "smoothstep":
      return t * t * (3 - 2 * t);

    case "smootherstep":
      return t * t * t * (t * (t * 6 - 15) + 10);

    case "easeInOutSine":
      return 0.5 - 0.5 * Math.cos(Math.PI * t);

    case "easeInOutCubic":
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // ✨ smoother easeIn (cubic)
    case "easeIn":
      return t * t * t; // cubic ease-in

    // ✨ smoother easeOut (cubic)
    case "easeOut":
      return 1 - Math.pow(1 - t, 3); // cubic ease-out

    // circular ease-in-out
    case "circle":
      return t < 0.5
        ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2
        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;

    default:
      console.warn(`Unknown easing type: ${type}, using smoothstep.`);
      return t * t * (3 - 2 * t);
  }
}

let didLoad = false;
/** @typedef {"idle" | "scanning" | "profile"} State */
/** @type {State} */
let state = "idle";
/** @type {State?} */
let nextState;
/** @type {State} */
let previousState = "idle";
let stateAnimationEndTime = 0;
let isAnimatingState = false;
/** @type {Record<State, number>} */
window.animationDuration = 700;
/** @param {State} newState */
const setState = async (newState) => {
  if (state == newState) {
    return;
  }
  previousState = state;
  state = newState;
  const now = Date.now();
  stateAnimationEndTime = now + window.animationDuration;
  isAnimatingState = true;
  console.log({ previousState, state, stateAnimationEndTime });
  Object.assign(startYPositons, latestYPositions);
  await draw();
};
const startYPositons = {
  profile: 0,
  profileImage: 0,
  scanning: 0,
};
const latestYPositions = {
  profile: 0,
  profileImage: 0,
  scanning: 0,
};
const yPositions = {
  profile: { start: 0, end: 0 },
  profileImage: { start: 0, end: 0 },
  scanning: { start: 0, end: 0 },
};
const imagePadding = 10;
const textPadding = 10;
const useInterests = false;
const updateYPositions = () => {
  const profileHeight =
    spritesLineHeight * (useInterests ? 2 : 1) + textPadding;
  const profileImageHeight = profileHeight + imagePadding + imageHeight;
  const scanningHeight = spritesLineHeight + textPadding;

  const { height } = displayCanvasHelper;

  yPositions.profile.start =
    height + profileHeight - textPadding + imageHeight + imagePadding;
  yPositions.profile.end = height - textPadding;

  yPositions.profileImage.start = height + imageHeight + imagePadding;
  yPositions.profileImage.end = height - profileHeight - imagePadding;

  yPositions.scanning.start = height + scanningHeight - textPadding;
  yPositions.scanning.end = height - textPadding;

  startYPositons.profile = yPositions.profile.start;
  startYPositons.profileImage = yPositions.profileImage.start;
  startYPositons.scanning = yPositions.scanning.start;

  latestYPositions.profile = startYPositons.profile;
  latestYPositions.profileImage = startYPositons.profileImage;
  latestYPositions.scanning = startYPositons.scanning;

  console.log("yPositions", yPositions);
  console.log("startYPositons", startYPositons);
};
displayCanvasHelper.addEventListener("resize", () => {
  updateYPositions();
});
let paddingX = 10;
const draw = async () => {
  if (isUploading) {
    return;
  }
  if (!didLoad) {
    console.log("hasn't loaded yet");
    return;
  }

  if (isDrawing) {
    //console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }
  isDrawing = true;

  let didFinishAnimating = false;
  if (isAnimatingState) {
    const now = Date.now();

    const timeUntilAnimationEnds = stateAnimationEndTime - now;
    let interpolation = THREE.MathUtils.inverseLerp(
      animationDuration,
      0,
      timeUntilAnimationEnds
    );
    interpolation = THREE.MathUtils.clamp(interpolation, 0, 1);
    if (interpolation >= 1) {
      isAnimatingState = false;
      didFinishAnimating = true;
    }

    //console.log({ interpolation });

    await displayCanvasHelper.setVerticalAlignment("end");

    const isDrawingProfile = [state, previousState].includes("profile");
    if (isDrawingProfile) {
      const isMovingIn = state == "profile";
      const easedInterpolation = ease(interpolation, "easeInOutSine");

      let profile = isMovingIn ? selectedProfile : previouslySelectedProfile;
      profile = profile || selectedProfile || previouslySelectedProfile;
      // console.log({
      //   state,
      //   isMovingIn,
      //   profile,
      //   selectedProfile,
      //   previouslySelectedProfile,
      // });

      const endProfileY = isMovingIn
        ? yPositions.profile.end
        : yPositions.profile.start;
      // console.log(
      //   `moving profile from ${startYPositons.profile} to ${endProfileY}`
      // );
      const profileY = THREE.MathUtils.lerp(
        startYPositons.profile,
        endProfileY,
        easedInterpolation
      );

      const endProfileImageY = isMovingIn
        ? yPositions.profileImage.end
        : yPositions.profileImage.start;
      // console.log(
      //   `moving profileImage from ${startYPositons.profileImage} to ${endProfileImageY}`
      // );
      const profileImageY = THREE.MathUtils.lerp(
        startYPositons.profileImage,
        endProfileImageY,
        easedInterpolation
      );

      // console.log({ profileY, profileImageY });

      await displayCanvasHelper.setHorizontalAlignment("start");

      await displayCanvasHelper.selectSpriteSheet("english");
      await displayCanvasHelper.selectSpriteColor(
        1,
        displayCanvasHelper.numberOfColors - 1
      );
      const string = [
        `${profile.name} - ${profile.title}`,
        `${profile.interests}`,
      ]
        .slice(0, useInterests ? 2 : 1)
        .join("\n");
      await displayCanvasHelper.setSpriteScale(fontScale);
      await displayCanvasHelper.drawSpritesString(paddingX, profileY, string);

      await displayCanvasHelper.setSpriteScale(1);
      await displayCanvasHelper.selectSpriteSheet(profile.id);
      await displayCanvasHelper.selectSpriteSheetPalette(profile.id, 0, true);
      await displayCanvasHelper.drawSprite(paddingX, profileImageY, "image");
      await displayCanvasHelper.selectSpriteSheetPalette(profile.id, 0);

      latestYPositions.profile = profileY;
      latestYPositions.profileImage = profileImageY;
    }
    const isDrawingScanning = [state, previousState].includes("scanning");
    if (isDrawingScanning) {
      const isMovingIn = state == "scanning";
      const easedInterpolation = ease(interpolation, "circle");

      await displayCanvasHelper.setHorizontalAlignment("end");

      const endScanningY = isMovingIn
        ? yPositions.scanning.end
        : yPositions.scanning.start;
      // console.log(
      //   `moving profile from ${startYPositons.scanning} to ${endScanningY}`
      // );
      const scanningY = THREE.MathUtils.lerp(
        startYPositons.scanning,
        endScanningY,
        easedInterpolation
      );

      await displayCanvasHelper.selectSpriteSheet("english");
      await displayCanvasHelper.selectSpriteColor(
        1,
        displayCanvasHelper.numberOfColors - 1
      );
      await displayCanvasHelper.setSpriteScale(fontScale);
      await displayCanvasHelper.drawSpritesString(
        displayCanvasHelper.width - paddingX,
        scanningY,
        "scanning..."
      );

      latestYPositions.scanning = scanningY;
    }
  } else {
    isDrawing = false;
  }

  if (didFinishAnimating && nextState) {
    console.log({ nextState });
    setState(nextState);
    nextState = undefined;
  }

  await displayCanvasHelper.show();
};

displayCanvasHelper.addEventListener("ready", () => {
  isDrawing = false;
  if (isWaitingToRedraw || isAnimatingState) {
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

// INDEXEDDB

const dbName = "SocialAreaNetwork";
const dbVersion = 1;
let db = null; // cached instance

async function openDB() {
  if (db) return db; // return cached DB

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("profile")) {
        const store = db.createObjectStore("profile", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("name", "name", { unique: true });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => reject(event.target.error);
  });
}
await openDB();
console.log("db", db);

/** @typedef {{id: number, name: string, title: string, interests: string[], imageBlob: Blob?, embeddings: number[][], averageEmbedding: number[]}} Profile */

/**
 * @param {Profile} profile
 * @returns {Promise<number>}
 */
async function addProfile(profile) {
  const db = await openDB();
  const tx = db.transaction("profile", "readwrite");
  const store = tx.objectStore("profile");
  return new Promise((resolve, reject) => {
    const request = store.add(profile);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * @param {Profile} profile
 * @param {Partial<Profile>} updates
 * @returns {Promise<Profile>}
 */
async function updateProfile(profile, updates) {
  const db = await openDB();
  const updatedProfile = await new Promise((resolve, reject) => {
    const tx = db.transaction("profile", "readwrite");
    const store = tx.objectStore("profile");

    // Get the existing profile first
    const getRequest = store.get(profile.id);
    getRequest.onsuccess = () => {
      const profile = getRequest.result;
      if (!profile) {
        reject(new Error(`Profile with id ${profile.id} not found`));
        return;
      }

      console.log("updating profile", profile, updates);

      // Apply updates
      const updatedProfile = { ...profile, ...updates };

      // Put the updated profile back in the store
      const putRequest = store.put(updatedProfile);
      putRequest.onsuccess = () => resolve(updatedProfile);
      putRequest.onerror = (e) => reject(e.target.error);
    };

    getRequest.onerror = (e) => reject(e.target.error);
  });

  Object.assign(profile, updatedProfile);
  console.log("updated profile", profile);
  return profile;
}

/** @returns {Promise<Profile[]>} */
async function getAllProfiles() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("profile", "readonly");
    const store = tx.objectStore("profile");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function deleteProfile(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("profile", "readwrite");
    const store = tx.objectStore("profile");
    const request = store.delete(id);

    request.onsuccess = () => resolve(true); // successfully deleted
    request.onerror = (e) => reject(e.target.error);
  });
}

/** @type {Profile[]} */
let profiles = [];
const updateProfiles = async () => {
  profiles = await getAllProfiles();
  console.log("profiles", profiles);
  profiles.forEach((profile) => {
    addProfileImage(profile, profile.imageBlob);
  });
  updateProfilesSelect();
};

// HUMAN

import * as Human from "https://cdn.jsdelivr.net/npm/@vladmandic/human@latest/dist/human.esm.js";

const human = new Human.Human({
  modelBasePath: "https://cdn.jsdelivr.net/npm/@vladmandic/human/models",
  cacheSensitivity: 0.01,
  filter: { enabled: true, equalization: true }, // lets run with histogram equilizer
  //debug: true,
  face: {
    enabled: true,
    detector: { rotation: true, return: true, mask: false }, // return tensor is used to get detected face image
    title: { enabled: true }, // default model for face descriptor extraction is faceres
    // mobilefacenet: { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/mobilefacenet.json' }, // alternative model
    // insightface: { enabled: true, modelPath: 'https://vladmandic.github.io/insightface/models/insightface-mobilenet-swish.json' }, // alternative model
    iris: { enabled: false }, // needed to determine gaze direction
    emotion: { enabled: false }, // not needed
    antispoof: { enabled: false }, // enable optional antispoof module
    liveness: { enabled: false }, // enable optional liveness module
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: false }, // parses face and iris gestures
});

await human.load();
await human.warmup();
console.log("human", human);

async function getEmbeddingFromImage(img) {
  const result = await human.detect(img);
  const embedding = result.face?.[0]?.embedding || null;
  //console.log("embedding", embedding);
  return embedding;
}

function cosineSimilarity(a, b) {
  //console.log("cosineSimilarity", a, b);
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (normA * normB);
}

/**
 * @param {Blob} imageBlob
 * @param {number} threshold
 * @returns {Promise<Profile?>}
 */
async function getClosestProfile(imageBlob, threshold = 0.6) {
  const imageBitmap = await createImageBitmap(imageBlob);
  const embedding = await getEmbeddingFromImage(imageBitmap);
  if (!embedding) {
    console.log("no face detected");
    return;
  }
  let closestProfile;
  let closestScore = -1;
  for (const profile of profiles) {
    const score = cosineSimilarity(embedding, profile.averageEmbedding);
    if (score > closestScore) {
      closestProfile = profile;
      closestScore = score;
    }
  }
  if (closestScore < threshold) {
    return;
  }
  console.log("closestProfile", closestProfile, { closestScore });
  return closestProfile;
}

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

const testImagesCheckbox = document.getElementById("testImages");
let testImages = false;
const setTestImages = (newTestImages) => {
  testImages = newTestImages;
  console.log({ testImages });
  testImagesCheckbox.checked = testImages;
  updateProfileImageInput();

  if (!testImages) {
    setState(selectedProfile ? "profile" : "idle");
  }
};
testImagesCheckbox.addEventListener("input", () => {
  setTestImages(testImagesCheckbox.checked);
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
        width: { ideal: 1280 },
        height: { ideal: 1280 },
      },
    });

    cameraVideo.srcObject = cameraStream;
    console.log("got cameraStream", deviceId, cameraStream);
  }
  updateAddCameraImageButton();
  updateTestCameraImageButton();
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

const addCameraImageButton = document.getElementById("addCameraImage");
addCameraImageButton.addEventListener("click", async () => {
  const imageBlob = await getMediaElementBlob(cameraVideo);
  onImageBlob(imageBlob);
});
const updateAddCameraImageButton = () => {
  const enabled = selectedProfile && cameraStream;
  addCameraImageButton.disabled = !enabled;
};

const testCameraImageButton = document.getElementById("testCameraImage");
testCameraImageButton.addEventListener("click", async () => {
  if (!cameraStream) {
    return;
  }
  const imageBlob = await getMediaElementBlob(cameraVideo);
  if (!imageBlob) {
    return;
  }
  testImageBlob(imageBlob);
});
const updateTestCameraImageButton = () => {
  const enabled = cameraStream;
  console.log({ enabled });
  testCameraImageButton.disabled = !enabled;
};

// DEVICE CAMERA

/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");
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

/** @type {HTMLInputElement} */
const autoImageCheckbox = document.getElementById("autoImage");
let autoImage = autoImageCheckbox.checked;
autoImageCheckbox.addEventListener("input", () => {
  autoImage = autoImageCheckbox.checked;
  if (autoImage) {
    setTestImages(true);
  }
  console.log({ autoImage });
});
device.addEventListener("cameraImage", async (event) => {
  const imageBlob = event.message.blob;
  if (testImages) {
    await testImageBlob(imageBlob);
  } else {
    addProfileImage(imageBlob);
  }
});

device.addEventListener("connected", async () => {
  if (device.hasCamera) {
    console.log("setting camera configuration");
    await device.setCameraConfiguration({ resolution: 512 });
  }
});

/** @type {HTMLButtonElement} */
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  if (device.cameraStatus == "idle") {
    setState("scanning");
    device.takePicture();
  }
});
device.addEventListener("connected", () => {
  updateTakePictureButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateTakePictureButton();
});
const updateTakePictureButton = () => {
  takePictureButton.disabled = !device.isConnected;
  // device.sensorConfiguration.camera == 0 ||
  // device.cameraStatus != "idle";
};
device.addEventListener("cameraStatus", () => {
  updateTakePictureButton();
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
    !device.isConnected ||
    device.sensorConfiguration.camera == 0 ||
    device.cameraStatus != "idle";
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
  device.addEventListener("cameraStatus", () => {
    updateisInputDisabled();
  });
  const updateisInputDisabled = () => {
    input.disabled =
      !device.isConnected || !device.hasCamera || device.cameraStatus != "idle";
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

// PROFILES

/** @type {Profile?} */
let selectedProfile;
/** @type {Profile?} */
let previouslySelectedProfile;
const selectProfile = async (selectedProfileId) => {
  const newSelectedProfile = profiles.find(
    (profile) => profile.id == selectedProfileId
  );
  if (selectedProfile == newSelectedProfile) {
    //console.log("redundant profile selection", newSelectedProfile);
    return;
  }
  previouslySelectedProfile = selectedProfile;
  selectedProfile = newSelectedProfile;
  console.log("selectedProfile", selectedProfile);
  updateDeleteProfileButton();
  updateProfileNameInput();
  updateProfileTitleInput();
  updateProfileInterestsInput();
  updateProfileImageInput();
  updateProfileImages();
  updateAddCameraImageButton();
  updateTestCameraImageButton();
  selectProfileSelect.value = selectedProfile?.id ?? "none";

  if (selectedProfile) {
    const spriteSheet = await createProfileImageSpriteSheet(selectedProfile);
    await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  } else {
  }

  if (selectedProfile) {
    switch (state) {
      case "idle":
      case "scanning":
        setState("profile");
        break;
      case "profile":
        setState("idle");
        nextState = "profile";
        break;
    }
  } else {
    if (testImages) {
      setState("scanning");
    } else {
      setState("idle");
    }
  }

  await draw();
};

const addProfileButton = document.getElementById("addProfile");
addProfileButton.addEventListener("click", async () => {
  const id = await addProfile({
    name: "Person Nameson",
    title: "",
    interests: [],
    embeddings: [],
    averageEmbedding: [],
    imageBlob: null,
  });
  await updateProfiles();
  selectProfile(id);
});
const deleteProfileButton = document.getElementById("deleteProfile");
deleteProfileButton.addEventListener("click", async () => {
  if (!selectedProfile) {
    return;
  }
  await deleteProfile(selectedProfile.id);
  selectProfile();
  await updateProfiles();
});
const updateDeleteProfileButton = () => {
  deleteProfileButton.disabled = !Boolean(selectedProfile);
};

/** @type {HTMLSelectElement} */
const selectProfileSelect = document.getElementById("selectProfile");
selectProfileSelect.addEventListener("input", () => {
  const value = selectProfileSelect.value;
  if (value == "none") {
    selectProfile();
  } else {
    selectProfile(Number(value));
  }
});
const selectProfileOptgroup = selectProfileSelect.querySelector("optgroup");
const updateProfilesSelect = () => {
  selectProfileOptgroup.innerHTML = "";
  selectProfileOptgroup.appendChild(new Option("none"));
  profiles.forEach((profile) => {
    selectProfileOptgroup.appendChild(new Option(profile.name, profile.id));
  });
  selectProfileSelect.disabled = profiles.length == 0;
  if (selectedProfile) {
    selectProfileSelect.value = selectedProfile.id;
  } else {
    selectProfileSelect.value = "none";
  }
};

/** @type {HTMLInputElement} */
const profileNameInput = document.getElementById("profileName");
profileNameInput.addEventListener("change", async () => {
  const name = profileNameInput.value;
  console.log({ name });
  await updateProfile(selectedProfile, { name });
  updateProfilesSelect();
});
const updateProfileNameInput = () => {
  if (selectedProfile) {
    profileNameInput.value = selectedProfile.name;
  } else {
    profileNameInput.value = "";
  }
  profileNameInput.disabled = !Boolean(selectedProfile);
};

/** @type {HTMLInputElement} */
const profileTitleInput = document.getElementById("profileTitle");
profileTitleInput.addEventListener("change", async () => {
  const title = profileTitleInput.value;
  console.log({ title });
  await updateProfile(selectedProfile, { title });
});
const updateProfileTitleInput = () => {
  if (selectedProfile) {
    profileTitleInput.value = selectedProfile.title;
  } else {
    profileTitleInput.value = "";
  }
  profileTitleInput.disabled = !Boolean(selectedProfile);
};

/** @type {HTMLInputElement} */
const profileInterestsInput = document.getElementById("profileInterests");
profileInterestsInput.addEventListener("change", async () => {
  const interests = profileInterestsInput.value.split(",");
  console.log("interests", interests);
  await updateProfile(selectedProfile, { interests });
});
const updateProfileInterestsInput = () => {
  if (selectedProfile) {
    profileInterestsInput.value = selectedProfile.interests.join(",");
  } else {
    profileInterestsInput.value = "";
  }
  profileInterestsInput.disabled = !Boolean(selectedProfile);
};

/** @type {HTMLInputElement} */
const profileImagesInput = document.getElementById("profileImageInput");
profileImagesInput.addEventListener("input", async () => {
  const files = profileImagesInput.files;
  for (const file of files) {
    await onImageBlob(file);
  }
  profileImagesInput.value = "";
});
async function resizeImageBlob(blob, maxHeight = 512) {
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

/** @param {Blob} imageBlob */
const onImageBlob = async (imageBlob) => {
  if (testImages) {
    await testImageBlob(imageBlob);
  } else {
    await uploadImageBlob(imageBlob);
  }
};
/** @param {Blob} imageBlob */
const testImageBlob = async (imageBlob) => {
  setState("scanning");
  const profile = await getClosestProfile(imageBlob);
  selectProfile(profile?.id);
  if (autoImage && !profile) {
    if (device.isConnected) {
      console.log("taking another picture");
      await device.takePicture();
    } else {
      testCameraImageButton.click();
    }
  }
};
/** @param {number[][]} embeddings */
const getAverageEmbedding = (embeddings) => {
  if (embeddings.length == 0) {
    return;
  }
  const averageEmbedding = new Array(embeddings[0].length).fill(0);
  embeddings.forEach((embedding) => {
    embedding.forEach((value, index) => {
      averageEmbedding[index] = value / embeddings.length;
    });
  });
  //console.log("averageEmbedding", averageEmbedding);
  return averageEmbedding;
};
/**
 * @param {number[]} embedding
 * @param {number[][]} embeddings
 */
const findEmbeddingIndex = (embedding, embeddings) => {
  return embeddings.findIndex(
    (_embedding) => cosineSimilarity(_embedding, embedding) == 1
  );
};
/**
 * @param {number[]} embedding
 * @param {number[][]} embeddings
 */
const includesEmbedding = (embedding, embeddings) => {
  return findEmbeddingIndex(embedding, embeddings) != -1;
};
/** @param {Blob} imageBlob */
const uploadImageBlob = async (imageBlob) => {
  if (!selectedProfile) {
    return;
  }
  imageBlob = await resizeImageBlob(imageBlob);
  console.log("uploadImage", imageBlob);
  if (imageBlob.type.endsWith("/svg")) {
    console.log("svg not supported");
    return;
  }
  const imageBitmap = await createImageBitmap(imageBlob);
  console.log("imageBitmap", imageBitmap);
  const embedding = await getEmbeddingFromImage(imageBitmap);
  if (!embedding) {
    return;
  }

  const { embeddings } = selectedProfile;
  const isEmbeddingUnique = !includesEmbedding(embedding, embeddings);
  if (isEmbeddingUnique) {
    embeddings.push(embedding);
    const averageEmbedding = getAverageEmbedding(embeddings);
    const profileUpdates = {
      embeddings,
      averageEmbedding,
    };
    if (!selectedProfile.imageBlob) {
      profileUpdates.imageBlob = imageBlob;
    }
    await updateProfile(selectedProfile, profileUpdates);
  } else {
    console.log("duplicate found");
  }

  addProfileImage(selectedProfile, imageBlob);
  updateProfileImages();
};
const updateProfileImageInput = () => {
  const enabled = Boolean(selectedProfile) || testImages;
  profileImagesInput.disabled = !enabled;
};

const profileImagesContainer = document.getElementById("profileImages");
/**
 * @param {Profile} profile
 * @param {Blob} imageBlob
 */
const addProfileImage = (profile, imageBlob) => {
  if (!imageBlob) {
    return;
  }
  allProfileImages[profile.id] = allProfileImages[profile.id] || [];
  const profileImages = allProfileImages[profile.id];
  const doesImageExist = profileImages.some(
    (image) => image.imageBlob == imageBlob
  );
  if (doesImageExist) {
    console.log("image already loaded", image);
    return;
  }
  const image = new Image();
  image.imageBlob = imageBlob;
  if (image.imageBlob == profile.imageBlob) {
    image.classList.add("selected");
  }
  const url = URL.createObjectURL(imageBlob);
  image.src = url;
  image.addEventListener("click", (event) => {
    if (event.altKey) {
      removeProfileImage(profile, image, imageBlob);
    } else {
      selectProfileImage(profile, image, imageBlob);
    }
  });
  //console.log("image", image);
  profileImages.push(image);
};

/**
 * @param {Profile} profile
 * @param {HTMLImageElement} image
 * @param {Blob} imageBlob
 */
const removeProfileImage = async (profile, image, imageBlob) => {
  console.log("removeProfileImage", profile, image);
  const profileImages = allProfileImages[profile.id];
  if (profileImages.includes(image)) {
    console.log("removing profile image");
    profileImages.splice(profileImages.indexOf(image), 1);
  }
  const imageBitmap = await createImageBitmap(imageBlob);
  const embedding = await getEmbeddingFromImage(imageBitmap);
  let { embeddings } = profile;
  embeddings = embeddings.filter(
    (_embedding) => cosineSimilarity(embedding, _embedding) != 1
  );
  const averageEmbedding = getAverageEmbedding(embeddings);
  await updateProfile(profile, { embeddings, averageEmbedding });

  const newImage = profileImages[0];
  if (newImage) {
    await selectProfileImage(profile, newImage, newImage.imageBlob);
  } else {
    await updateProfile(profile, { imageBlob: null });
  }
  updateProfileImages();
};

/**
 * @param {Profile} profile
 * @param {HTMLImageElement} image
 * @param {Blob} imageBlob
 */
const selectProfileImage = async (profile, image, imageBlob) => {
  const profileImages = allProfileImages[profile.id];
  profileImages.forEach((_image) => {
    if (_image == image) {
      _image.classList.add("selected");
    } else {
      _image.classList.remove("selected");
    }
  });
  if (profile.imageBlob != imageBlob) {
    await updateProfile(profile, { imageBlob });
  }
};
/** @type {Record<number, HTMLImageElement[]>} */
const allProfileImages = {};
const updateProfileImages = () => {
  profileImagesContainer.innerHTML = "";

  if (selectedProfile) {
    const profileImages = allProfileImages[selectedProfile.id];
    //console.log("profileImages", profileImages);
    profileImages?.forEach((image) => {
      profileImagesContainer.appendChild(image);
    });
  }
};

await updateProfiles();

// IMAGE UTILS

async function getMediaElementBlob(
  element,
  type = "image/png",
  maxHeight = 512
) {
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

let fontScale = 0.9;
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
  updateYPositions();
};

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
const fontSize = 36;
/** @type {Record<string, BS.DisplaySpriteSheet>} */
const fontSpriteSheets = {};
window.fonts = fonts;
/** @param {BS.Font} font */
const addFont = async (font) => {
  const fullName = font.getEnglishName("fullName");

  fonts[fullName] = fonts[fullName] || [];
  fonts[fullName].push(font);

  console.log(`added font "${fullName}"`);

  const spriteSheet = await BS.fontToSpriteSheet(font, fontSize, "english", {
    usePath: true,
    englishOnly: true,
  });
  fontSpriteSheets[fullName] = spriteSheet;
  await updateFontSelect();
  await selectFont(fullName);
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
const selectFont = async (newFontName) => {
  const newFont = fonts[newFontName][0];
  selectedFont = newFont;

  if (didLoad) {
    console.log(`selected font "${newFontName}"`, selectedFont);
    //console.log(`selected fonts`, selectedFonts);
  }
  selectFontSelect.value = newFontName;
  const spriteSheet = fontSpriteSheets[newFontName];
  await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
  spritesLineHeight = BS.getFontMaxHeight(selectedFont, fontSize);
  console.log({ spritesLineHeight }, selectedFont, fontSize);
  await displayCanvasHelper.setSpritesLineHeight(spritesLineHeight);
  await draw();
};

await loadFontUrl("https://fonts.googleapis.com/css2?family=Roboto");

// IMAGES
const imageHeight = 150;
/** @type {Record<number, {spriteSheet: BS.DisplaySpriteSheet, profileImage: HTMLImageElement}>} */
const profileImageSpriteSheets = {};
/** @param {Profile} profile */
const createProfileImageSpriteSheet = async (profile) => {
  const profileImages = allProfileImages[profile.id];
  if (!profileImages) {
    return;
  }
  const profileImage = profileImages.find((profileImage) =>
    profileImage.classList.contains("selected")
  );
  if (!profileImage) {
    console.log("no profileImage found");
    return;
  }
  if (profileImageSpriteSheets[profile.id]?.profileImage == profileImage) {
    console.log("already made profile spriteSheet");
    return profileImageSpriteSheets[profile.id].spriteSheet;
  }
  const aspectRatio = profileImage.naturalWidth / profileImage.naturalHeight;
  let spriteSheet;
  if (true) {
    console.log("size", imageHeight * aspectRatio, imageHeight);
    const roundProfileImage = await imageToRoundedCanvas(
      profileImage,
      imageHeight * aspectRatio,
      imageHeight,
      25
    );
    console.log("roundProfileImage", roundProfileImage);
    spriteSheet = await BS.canvasToSpriteSheet(
      roundProfileImage,
      profile.id,
      displayCanvasHelper.numberOfColors - 1,
      profile.id
    );
    console.log("spriteSheet", spriteSheet);
  } else {
    spriteSheet = await BS.imageToSpriteSheet(
      profileImage,
      profile.id,
      imageHeight * aspectRatio,
      imageHeight,
      displayCanvasHelper.numberOfColors - 1,
      profile.id
    );
  }
  spriteSheet.palettes[0].colors[0] = "black";
  console.log("profile spriteSheet", profile, spriteSheet);
  profileImageSpriteSheets[profile.id] = { spriteSheet, profileImage };
  return spriteSheet;
};

async function imageToRoundedCanvas(src, width, height, radius) {
  // get source dimensions
  const srcW =
    src instanceof HTMLVideoElement
      ? src.videoWidth
      : src.naturalWidth || src.width;
  const srcH =
    src instanceof HTMLVideoElement
      ? src.videoHeight
      : src.naturalHeight || src.height;

  if (!srcW || !srcH) {
    throw new Error("Source image has no dimensions.");
  }

  // devicePixelRatio for crispness
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  const ctx = canvas.getContext("2d");

  // --- normalize radius ---
  let borderRadius = { tl: radius, tr: radius, br: radius, bl: radius };
  // clamp to half size
  borderRadius.tl = Math.min(borderRadius.tl, width / 2, height / 2);
  borderRadius.tr = Math.min(borderRadius.tr, width / 2, height / 2);
  borderRadius.br = Math.min(borderRadius.br, width / 2, height / 2);
  borderRadius.bl = Math.min(borderRadius.bl, width / 2, height / 2);

  // --- draw rounded rect path and clip ---
  function roundedRectPath(ctx, x, y, w, h, rad) {
    ctx.beginPath();
    ctx.moveTo(x + rad.tl, y);
    ctx.lineTo(x + w - rad.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad.tr);
    ctx.lineTo(x + w, y + h - rad.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad.br, y + h);
    ctx.lineTo(x + rad.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad.bl);
    ctx.lineTo(x, y + rad.tl);
    ctx.quadraticCurveTo(x, y, x + rad.tl, y);
    ctx.closePath();
  }

  roundedRectPath(ctx, 0, 0, width, height, borderRadius);
  ctx.clip();

  // --- compute draw parameters based on fit mode ---
  const imgW = srcW;
  const imgH = srcH;

  ctx.drawImage(src, 0, 0, imgW, imgH, 0, 0, width, height);

  return canvas;
}

didLoad = true;
updateYPositions();
setFontScale(fontScale);
