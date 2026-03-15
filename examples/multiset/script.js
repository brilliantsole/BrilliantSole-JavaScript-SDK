import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

const device = new BS.Device();
window.device = device;

// CONNECTION START
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
// CONNECTION END

// MULTISET HELPER START
const setupMultiSetValueInput = (object, datasetName) => {
  return (name) => {
    const input = document.querySelector(
      `[data-multiset-${datasetName}="${name}"]`
    );
    // console.log(name, input);
    object[`${name}Input`] = input;

    const values = object[`${name}s`];
    if (values) {
      const optgroup = input.querySelector("optgroup");
      values.forEach((value) => {
        optgroup.appendChild(new Option(value));
      });
    }

    const setValue = (value, didLoad) => {
      if (typeof value == "string") {
        value = value.trim();
      }
      if (typeof value == "string" && input.type == "checkbox") {
        value = value == "true";
      }
      // console.log("setValue", { name, value, didLoad });

      const isValid = object[`${name}Valid`]?.(value) ?? true;
      object[`${name}IsValid`] = isValid;
      if (isValid) {
        // console.log({ [name]: value });
        object[name] = value;
        if (input.type == "checkbox") {
          input.checked = value;
        } else {
          input.value = value;
        }
        if (!didLoad) {
          saveToLocalStorage();
        }
      } else {
        console.error("invalid", { value, name });
      }
    };
    input.addEventListener("input", (event) => {
      const value =
        event.target.type == "checkbox"
          ? event.target.checked
          : event.target.value;
      setValue(value);
    });
    const localStorageKey = ["multiset", datasetName, name].join(".");
    const saveToLocalStorage = () => {
      const value = object[name];
      //console.log("saveToLocalStorage", { name, localStorageKey, value });
      localStorage.setItem(localStorageKey, value);
    };
    const loadFromLocalStorage = () => {
      // console.log("loadFromLocalStorage", { name, localStorageKey });
      const value = localStorage.getItem(localStorageKey);
      if (!value) {
        return;
      }
      setValue(value, true);
    };
    loadFromLocalStorage();
  };
};
// MULTISET HELPER END

// DEVICE CAMERA START
device.addEventListener("connected", () => {
  if (!device.hasCamera) {
    console.error("device does't have a camera");
    device.disconnect();
  }
});

/** @type {HTMLImageElement} */
const deviceImage = document.getElementById("deviceImage");
device.addEventListener("cameraImage", (event) => {
  const { url } = event.message;
  deviceImage.src = url;
});
deviceImage.addEventListener("load", async () => {
  if (deviceImage.hasAttribute("hidden")) {
    deviceImage.removeAttribute("hidden");
  }
  await queryMultiSet(deviceImage);
  if (multiSetDeviceCameraConfig.auto) {
    console.log("retake");
    takePicture();
  }
});

const takePicture = () => {
  device.takePicture();
};
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  takePicture();
});
const updateTakePictureButton = () => {
  takePictureButton.disabled =
    !device.isConnected || device.cameraStatus != "idle";
  takePictureButton.innerText =
    device.cameraStatus == "takingPicture" ? "taking picture" : "take picture";
};
device.addEventListener("isConnected", () => {
  updateTakePictureButton();
});
device.addEventListener("cameraStatus", () => {
  updateTakePictureButton();
});
device.addEventListener("cameraStatus", (event) => {
  const { cameraStatus, previousCameraStatus } = event.message;
  if (cameraStatus == "idle" && previousCameraStatus == "focusing") {
    takePicture();
  }
});

const focusCameraButton = document.getElementById("focusCamera");
focusCameraButton.addEventListener("click", () => {
  device.focusCamera();
});
const updateFocusCameraButton = () => {
  focusCameraButton.innerText =
    device.cameraStatus == "focusing" ? "focusing" : "focus";
  focusCameraButton.disabled =
    !device.isConnected || device.cameraStatus != "idle";
};
device.addEventListener("isConnected", () => {
  updateFocusCameraButton();
});
device.addEventListener("cameraStatus", () => {
  updateFocusCameraButton();
});

/** @type {HTMLProgressElement} */
const deviceImageProgress = document.getElementById("deviceImageProgress");
device.addEventListener("cameraImageProgress", (event) => {
  if (event.message.type == "image") {
    deviceImageProgress.value = event.message.progress;
  }
});

const multiSetDeviceCameraConfig = {
  auto: false,
};
const setupMultiSetDeviceCameraInput = setupMultiSetValueInput(
  multiSetDeviceCameraConfig,
  "devicecamera"
);
window.addEventListener("load", () => {
  setupMultiSetDeviceCameraInput("auto");
});

// DEVICE CAMERA END

// MULTISET CREDENTIALS START
const multiSetCredentials = {
  clientSecret: "",
  clientSecretIsValid: false,
  clientSecretValid(clientSecret) {
    return clientSecret.length == 64;
  },

  clientId: "",
  clientIdIsValid: false,
  clientIdValid(clientId) {
    return clientId.length == 36;
  },
};
window.multiSetCredentials = multiSetCredentials;

const setupMultiSetCredentialsInput = setupMultiSetValueInput(
  multiSetCredentials,
  "credential"
);
window.addEventListener("load", () => {
  setupMultiSetCredentialsInput("clientId");
  setupMultiSetCredentialsInput("clientSecret");
});
// MULTISET CREDENTIALS END

// MULTISET AUTH START
const multiSetToken = {
  token: "",
  tokenInput: document.querySelector(`[data-multiset-token="token"]`),

  expiresOn: "",
  expiresOnInput: document.querySelector(`[data-multiset-token="expiresOn"]`),
  expiresOnDate: new Date(),
  expired: true,
};
const setMultiSetToken = ({ token, expiresOn }, didLoad) => {
  multiSetToken.token = token;
  multiSetToken.tokenInput.value = token;
  multiSetToken.expiresOn = expiresOn;
  multiSetToken.expiresOnDate = new Date(multiSetToken.expiresOn);
  multiSetToken.expiresOnInput.value = multiSetToken.expiresOnDate.toString();
  multiSetToken.expired = Date.now() > multiSetToken.expiresOnDate.getTime();
  //console.log("multiSetToken", multiSetToken);
  updateGenerateMultiSetTokenButton();
  if (!didLoad) {
    saveMultiSetTokenToLocalStorage();
  }
};
const multiSetTokenLocalStorageKey = ["multiset", "token"].join(".");
const saveMultiSetTokenToLocalStorage = () => {
  // console.log("saveMultiSetTokenToLocalStorage");
  const multiSetTokenString = JSON.stringify(multiSetToken, (key, value) => {
    switch (key) {
      case "":
      case "token":
      case "expiresOn":
        return value;
      default:
        return undefined;
    }
  });
  // console.log("multiSetTokenString", multiSetTokenString);
  localStorage.setItem(multiSetTokenLocalStorageKey, multiSetTokenString);
};
const loadMultiSetTokenFromLocalStorage = () => {
  // console.log("loadMultiSetTokenFromLocalStorage");
  const multiSetTokenString = localStorage.getItem(
    multiSetTokenLocalStorageKey
  );
  // console.log("multiSetTokenString", multiSetTokenString);
  if (!multiSetTokenString) {
    return;
  }
  try {
    const newMultiSetToken = JSON.parse(multiSetTokenString);
    // console.log("newMultiSetToken", newMultiSetToken);
    setMultiSetToken(newMultiSetToken);
  } catch (error) {
    console.error("failed to parse multiSetTokenString", {
      multiSetTokenString,
      error,
    });
  }
};
window.addEventListener("load", () => {
  loadMultiSetTokenFromLocalStorage();
});

const generateMultiSetToken = async () => {
  generateMultiSetTokenButton.innerText = "generating token...";
  const { clientId, clientSecret } = multiSetCredentials;
  const authorization = "Basic " + btoa(`${clientId}:${clientSecret}`);
  try {
    const response = await fetch("https://api.multiset.ai/v1/m2m/token", {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
        clientSecret,
      }),
    });

    const json = await response.json();
    console.log("generateMultiSetToken response", json);
    const { error, token, expiresOn } = json;
    if (error) {
      console.error("failed to generate token", { error });
    } else {
      setMultiSetToken({ token, expiresOn });
    }
  } catch (error) {
    console.error("failed to fetch token", { error });
  }

  generateMultiSetTokenButton.innerText = "generate token";
};
window.generateMultiSetToken = generateMultiSetToken;

const generateMultiSetTokenButton = document.getElementById(
  "generateMultiSetToken"
);
const updateGenerateMultiSetTokenButton = () => {
  const enabled =
    multiSetToken.expired &&
    multiSetCredentials.clientIdValid &&
    multiSetCredentials.clientSecretValid;
  //console.log("updateGenerateMultiSetTokenButton", { enabled });
  generateMultiSetTokenButton.disabled = !enabled;
};
generateMultiSetTokenButton.addEventListener("click", () => {
  generateMultiSetToken();
});
const clearMultiSetTokenButton = document.getElementById("clearMultiSetToken");
clearMultiSetTokenButton.addEventListener("click", () => {
  multiSetToken.expired = true;

  updateGenerateMultiSetTokenButton();
});
// MULTISET AUTH END

// MULTISET CONFIG START
/** @typedef {"object" | "map"} MultiSetType */
/** @typedef {"single" | "multi"} MultiSetQueryType */

const multiSetConfig = {
  /** @type {MultiSetType[]} */
  types: ["map", "object"],
  /** @type {MultiSetType} */
  type: "map",
  typeValid(type) {
    return this.types.includes(type);
  },

  /** @type {MultiSetQueryType} */
  queryType: "single",
  /** @type {MultiSetQueryType[]} */
  queryTypes: ["single", "multi"],
  queryTypeValid(queryType) {
    return this.queryTypes.includes(queryType);
  },

  mapCode: "",
  mapCodeIsValid: false,
  mapCodeValid(mapCode) {
    return mapCode.startsWith("MAP_") && mapCode.length == 16;
  },

  objectCode: "",
  objectCodeIsValid: false,
  objectCodeValid(objectCode) {
    return objectCode.startsWith("OBJ_") && objectCode.length == 16;
  },
};
window.multiSetConfig = multiSetConfig;

const setupMultiSetConfigType = setupMultiSetValueInput(
  multiSetConfig,
  "config"
);
window.addEventListener("load", () => {
  setupMultiSetConfigType("type");
  setupMultiSetConfigType("queryType");
  setupMultiSetConfigType("mapCode");
  setupMultiSetConfigType("objectCode");
});
// MULTISET CONFIG END

// CAMERA START
const cameraSelect = document.querySelector("[data-camera]");
/** @type {HTMLVideoElement} */
const cameraVideo = document.getElementById("cameraVideo");
/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");

cameraSelect.addEventListener("cameraStreamStart", (event) => {
  const { cameraStream } = event.detail;
  console.log("cameraStream", cameraStream);
  cameraVideo.srcObject = cameraStream;
});
cameraSelect.addEventListener("cameraStreamStop", () => {
  console.log("stopCameraStream");
  cameraVideo.srcObject = undefined;
});

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
cameraVideo.addEventListener("loadedmetadata", () => {
  canvas.width = cameraVideo.videoWidth;
  canvas.height = cameraVideo.videoHeight;
});
const grabVideoFrame = () => {
  context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
  cameraImage.src = canvas.toDataURL("image/png");
};
const grabVideoFrameButton = document.getElementById("grabVideoFrame");
grabVideoFrameButton.addEventListener("click", () => {
  grabVideoFrame();
});
cameraVideo.addEventListener("loadedmetadata", () => {
  grabVideoFrameButton.disabled = false;
});
cameraVideo.addEventListener("emptied", () => {
  grabVideoFrameButton.disabled = true;
});

cameraImage.addEventListener("load", async () => {
  grabVideoFrameButton.disabled = true;
  if (cameraImage.hasAttribute("hidden")) {
    cameraImage.removeAttribute("hidden");
  }
  await queryMultiSet(cameraImage);
  if (multiSetGrabVideoFrameConfig.auto) {
    grabVideoFrame();
  }
  grabVideoFrameButton.disabled = false;
});

const multiSetGrabVideoFrameConfig = {
  auto: false,
};
const setupMultiSetGrabVideoFrameInput = setupMultiSetValueInput(
  multiSetGrabVideoFrameConfig,
  "grabvideoframe"
);
window.addEventListener("load", () => {
  setupMultiSetGrabVideoFrameInput("auto");
});
// CAMERA END

// CAMERA INTRINSIC START
const multiSetCameraIntrinsics = {
  fx: 1000,
  fy: 1000,
  px: 1280 / 2,
  py: 720 / 2,
  overwriteP: true,
};
window.multiSetCameraIntrinsics = multiSetCameraIntrinsics;

const setupMultiSetCameraIntrinsicInput = setupMultiSetValueInput(
  multiSetCameraIntrinsics,
  "camera-intrinsic"
);
window.addEventListener("load", () => {
  setupMultiSetCameraIntrinsicInput("fx");
  setupMultiSetCameraIntrinsicInput("fy");
  setupMultiSetCameraIntrinsicInput("px");
  setupMultiSetCameraIntrinsicInput("py");
});
// CAMERA INTRINSIC END

// MULTISET QUERY START
/**
 * @typedef {Object} MultiSetBaseQuery
 * @property {number} fx Camera intrinsic parameter fx (focal length x-axis) (Example: 1000.0)
 * @property {number} fy Camera intrinsic parameter fy (focal length y-axis) (Example: 1000.0)
 * @property {number} px Camera intrinsic parameter px (principal point x-coordinate) (Example: 640.0)
 * @property {number} py Camera intrinsic parameter py (principal point y-coordinate) (Example: 480.0)
 * @property {boolean} isRightHanded Specifies whether the coordinate system is right-handed
 * @property {number} width The width (in pixels) of the input image (Example: 1280)
 * @property {number} height The height (in pixels) of the input image (Example: 720)
 * @property {string} queryImage The image file to query against the object
 */

/**
 * @typedef {Object} MultiSetObjectBaseQuery
 * @property {string} objectCode The code of the VPS object (Example: OBJ-001)
 */

/**
 * @typedef {Object} MultiSetMapBaseQuery
 * @property {string} mapCode The code of the VPS map (Example: MAP-X2P23E7Q35VD)
 * @property {number[]?} hintPosition (Example: [2.5, 0.1, 8])
 * @property {number[]?} geoHint (Example: [ 37.7749, -122.4194, 10])
 * @property {boolean} convertToGeoCoordinates
 */

/**
 * @typedef {Object} MultiSetMapMultiBaseQuery
 * @property {null} queryImage
 * @property {string} image1
 * @property {string?} image2
 * @property {string?} image3
 * @property {string?} image4
 */

/** @typedef {MultiSetBaseQuery & MultiSetObjectBaseQuery} MultiSetObjectQuery */
/** @typedef {MultiSetBaseQuery & MultiSetMapBaseQuery} MultiSetMapQuery */
/** @typedef {MultiSetMapBaseQuery & MultiSetMapMultiBaseQuery} MultiSetMapMultiQuery */

/** @param {HTMLImageElement} image */
const queryMultiSet = async (image) => {
  if (multiSetToken.expired) {
    return;
  }
  //console.log("queryMultiSet", image);
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  context.drawImage(image, 0, 0);

  const imageBlob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );

  /** @type {MultiSetBaseQuery} */
  const query = {
    queryImage: imageBlob,
    width: canvas.width,
    height: canvas.height,
    px: multiSetCameraIntrinsics.overwriteP
      ? canvas.width / 2
      : multiSetCameraIntrinsics.px,
    py: multiSetCameraIntrinsics.overwriteP
      ? canvas.height / 2
      : multiSetCameraIntrinsics.py,
    fx: multiSetCameraIntrinsics.fx,
    fy: multiSetCameraIntrinsics.fy,
    isRightHanded: true,
  };

  switch (multiSetConfig.type) {
    case "object":
      await queryMultiSetObject(query);
      break;
    case "map":
      switch (multiSetConfig.queryType) {
        case "single":
          await queryMultiSetMap(query);
          break;
        case "multi":
          await queryMultiSetMapMulti(query);
          break;
      }
      break;
  }
};

/** @param {MultiSetObjectQuery} query */
const queryMultiSetObject = async (query) => {
  //console.log("queryMultiSetObject", query);
  query.objectCode = multiSetConfig.objectCode;
  await fetchMultiSetQuery(
    query,
    "https://api.multiset.ai/v1/vps/object/query"
  );
};
/** @param {MultiSetMapQuery} query */
const queryMultiSetMap = async (query) => {
  //console.log("queryMultiSetMap", query);
  query.mapCode = multiSetConfig.mapCode;
  query.convertToGeoCoordinates = false;
  await fetchMultiSetQuery(
    query,
    "https://api.multiset.ai/v1/vps/map/query-form"
  );
};
/** @param {MultiSetMapMultiQuery} query */
const queryMultiSetMapMulti = async (query) => {
  // requires pictures to have existing generic positions/orientations (relative to session, e.g. ARKit or 8thWall)
  // so we'll just ignore it unless we integrate 8thwall into this demo as an option
  if (true) {
    await queryMultiSetMap(query);
  } else {
    //console.log("queryMultiSetMapMulti", query);
    query.mapCode = multiSetConfig.mapCode;
    query.convertToGeoCoordinates = false;
    // FILL - store the last n images? How does this work?
    delete query.queryImage;
    // FILL - append to query
    await fetchMultiSetQuery(
      query,
      "https://api.multiset.ai/v1/vps/map/multi-image-query"
    );
  }
};

/**
 * @typedef {Object} MultiSetPoseErrorResponse
 * @property {string} error
 * @property {undefined} poseFound
 */

/**
 * @typedef {Object} MultiSetPoseFoundResponse
 * @property {true} poseFound
 * @property {number} confidence [0,1]
 * @property {string[]?} objectCodes
 * @property {string[]?} mapCodes
 * @property {string[]?} mapIds
 * @property {BS.Quaternion} rotation
 * @property {BS.Vector3} position
 * @property {string?} message
 */

/**
 * @typedef {Object} MultiSetPoseNotFoundResponse
 * @property {false} poseFound
 * @property {string} errorCode
 * @property {string} errorMessage
 */

/** @typedef {MultiSetPoseErrorResponse | MultiSetPoseFoundResponse | MultiSetPoseNotFoundResponse} MultiSetPoseResponse  */

/** @type {HTMLPreElement} */
const multiSetPoseResponsePre = document.getElementById("multiSetPoseResponse");

/** @param {MultiSetPoseResponse} response */
const onMultiSetPoseResponse = (response) => {
  console.log("onMultiSetPoseResponse", response);
  if (response.poseFound == undefined) {
    const { error } = response;
    console.error("failed to query multiSet", { error });
    multiSetPoseResponsePre.innerText = error;
  } else if (response.poseFound) {
    const { position, rotation, objectCodes, mapCodes, mapIds } = response;
    multiSetPoseResponsePre.innerText = JSON.stringify(response, null, 2);
    onMultiSetPose(position, rotation);
  } else {
    const { errorCode, errorMessage } = response;
    console.log("pose not found", { errorCode, errorMessage });
    multiSetPoseResponsePre.innerText = JSON.stringify(response, null, 2);
  }
};

/**
 * @param {MultiSetBaseQuery} query
 * @param {string} path
 */
const fetchMultiSetQuery = async (query, path) => {
  //console.log("fetchMultiSetQuery", query, { path });
  const formData = new FormData();

  Object.entries(query).forEach(([key, value]) => {
    switch (typeof value) {
      case "string":
        break;
      case "object":
        break;
      default:
        value = value.toString();
        break;
    }
    //console.log("formData", { key, value });
    formData.append(key, value);
  });
  //console.log("formData", ...Array.from(formData.entries()));

  const authorization = `Bearer ${multiSetToken.token}`;
  //console.log({ authorization });

  try {
    console.log({ authorization, path });
    const response = await fetch(path, {
      method: "POST",
      headers: {
        Authorization: authorization,
      },
      body: formData,
    });

    /** @type {MultiSetPoseResponse} */
    const multiSetPoseResponse = await response.json();
    console.log("fetchMultiSetQuery response", multiSetPoseResponse);
    onMultiSetPoseResponse(multiSetPoseResponse);
  } catch (error) {
    console.error("failed to fetch multiSetQuery", { error });
    onMultiSetPoseResponse({ error });
  }
};
// MULTISET CONFIG END

// THREE START
/** @type {import("three")} */
const THREE = window.THREE;
/** @typedef {import("three").Object3D} Object3D */
// THREE END

// AFRAME START
const sceneEntity = document.getElementById("scene");
const cameraEntity = document.getElementById("camera");
const multiSetPoseEntity = document.getElementById("multiSetPose");
const modelEntity = document.getElementById("model");

const multiSetAframeConfig = {
  moveCamera: false,
};

/**
 * @param {BS.Vector3} position
 * @param {BS.Quaternion} rotation
 */
const onMultiSetPose = (position, rotation) => {
  console.log("onMultiSetPose", position, rotation);
  const entity = multiSetAframeConfig.moveCamera
    ? cameraEntity
    : multiSetPoseEntity;

  /** @type {Object3D} */
  const object3D = entity.object3D;
  object3D.position.copy(position);
  object3D.quaternion.copy(rotation);
};

document.addEventListener("keydown", (event) => {
  let preventDefault = false;
  switch (event.key) {
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp":
    case "ArrowDown":
      preventDefault = true;
      break;
    default:
      break;
  }
  if (preventDefault) {
    event.preventDefault();
  }
});
// AFRAME END

// AFRAME INSPECTOR START
const getIsInspectorOpen = () => {
  return AFRAME.INSPECTOR?.opened;
};
const toggleInspector = () => {
  if (AFRAME.INSPECTOR) {
    AFRAME.INSPECTOR.toggle();
  } else {
    AFRAME.scenes[0].components.inspector.openInspector();
  }
};
const openInspectorButton = document.getElementById("openInspector");
openInspectorButton.addEventListener("click", () => {
  toggleInspector();
});
// AFRAME INSPECTOR END

// FILE UPLOAD START
window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  //console.log("dropped file", file);
  if (file) {
    await onFile(file);
  }
});

const acceptedFileTypes = ["glb", "gltf"];
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    //console.log("pasted item", item);
    const file = item.getAsFile();
    if (!file) {
      return;
    }
    //console.log("pasted file", file);
    await onFile(file);
  }
});

const modelFileInput = document.getElementById("modelFile");
modelFileInput.addEventListener("input", async () => {
  for (let i = 0; i < modelFileInput.files.length; i++) {
    const file = modelFileInput.files[i];
    if (!file) {
      continue;
    }
    //console.log("input file", file);
    await onFile(file);
  }
  modelFileInput.value = "";
});

/** @param {File} file */
const onFile = async (file) => {
  if (acceptedFileTypes.includes(file.name.split(".")[1])) {
    await loadModelFile(file);
  }
};
/** @param {File} file */
const loadModelFile = async (file) => {
  //console.log("loadModelFile", file);
  const src = URL.createObjectURL(file);
  modelEntity.setAttribute("gltf-model", src);
};
// FILE UPLOAD STOP
