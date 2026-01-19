import * as BS from "../../build/brilliantsole.module.js";
//import BS.Device from "../../src/BS.Device.js";
window.BS = BS;
console.log(BS);

BS.setAllConsoleLevelFlags({ log: false });

// DEVICE

const device = new BS.Device();
console.log({ device });
window.device = device;

// GET DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById(
  "availableDeviceTemplate"
);
const availableDevicesContainer = document.getElementById("availableDevices");
/** @param {BS.Device[]} availableDevices */
function onAvailableDevices(availableDevices) {
  availableDevicesContainer.innerHTML = "";
  if (availableDevices.length == 0) {
    availableDevicesContainer.innerText = "no devices available";
  } else {
    availableDevices.forEach((availableDevice) => {
      const availableDeviceContainer = availableDeviceTemplate.content
        .cloneNode(true)
        .querySelector(".availableDevice");
      availableDeviceContainer.querySelector(".name").innerText =
        availableDevice.name;
      availableDeviceContainer.querySelector(".type").innerText =
        availableDevice.type;

      /** @type {HTMLButtonElement} */
      const toggleConnectionButton =
        availableDeviceContainer.querySelector(".toggleConnection");
      toggleConnectionButton.addEventListener("click", () => {
        device.connectionManager = availableDevice.connectionManager;
        device.reconnect();
      });
      device.addEventListener("connectionStatus", () => {
        toggleConnectionButton.disabled =
          device.connectionStatus != "notConnected";
      });
      toggleConnectionButton.disabled =
        device.connectionStatus != "notConnected";

      availableDevicesContainer.appendChild(availableDeviceContainer);
    });
  }
}
async function getDevices() {
  const availableDevices = await BS.DeviceManager.GetDevices();
  if (!availableDevices) {
    return;
  }
  onAvailableDevices(availableDevices);
}

BS.DeviceManager.AddEventListener("availableDevices", (event) => {
  const devices = event.message.availableDevices;
  onAvailableDevices(devices);
});
getDevices();

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
  switch (device.connectionStatus) {
    case "notConnected":
      device.connect();
      break;
    case "connected":
      device.disconnect();
      break;
  }
});

/** @type {HTMLButtonElement} */
const reconnectButton = document.getElementById("reconnect");
reconnectButton.addEventListener("click", () => {
  device.reconnect();
});
device.addEventListener("connectionStatus", () => {
  reconnectButton.disabled = !device.canReconnect;
});

device.addEventListener("connectionStatus", () => {
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
      toggleConnectionButton.innerText = device.connectionStatus;
      break;
  }
});

/** @type {HTMLInputElement} */
const reconnectOnDisconnectionCheckbox = document.getElementById(
  "reconnectOnDisconnection"
);
reconnectOnDisconnectionCheckbox.addEventListener("input", () => {
  device.reconnectOnDisconnection = reconnectOnDisconnectionCheckbox.checked;
});

// DEVICE INFORMATION

/** @type {HTMLPreElement} */
const deviceInformationPre = document.getElementById("deviceInformationPre");
device.addEventListener("deviceInformation", () => {
  deviceInformationPre.textContent = JSON.stringify(
    device.deviceInformation,
    null,
    2
  );
});

/** @type {HTMLPreElement} */
const sensorConfigurationPre = document.getElementById(
  "sensorConfigurationPre"
);
device.addEventListener("getSensorConfiguration", () => {
  sensorConfigurationPre.textContent = JSON.stringify(
    device.sensorConfiguration,
    null,
    2
  );
});

/** @type {HTMLSpanElement} */
const nameSpan = document.getElementById("name");
device.addEventListener("getName", () => {
  nameSpan.innerText = device.name;
});

/** @type {HTMLSpanElement} */
const typeSpan = document.getElementById("type");
device.addEventListener("getType", () => {
  typeSpan.innerText = device.type;
});

/** @type {HTMLSpanElement} */
const batteryLevelSpan = document.getElementById("batteryLevel");
device.addEventListener("batteryLevel", () => {
  batteryLevelSpan.innerText = device.batteryLevel;
});

// SEARCH PARAMS

const url = new URL(location);
console.log({ url });
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

// PROJECT ID

/** @type {string?} */
let projectId;

/** @type {HTMLInputElement} */
const projectIdInput = document.getElementById("projectId");
projectIdInput.addEventListener("input", (event) => {
  setProjectId(event.target.value);
  setHmacKey();
});
/** @param {string} newProjectId */
function setProjectId(newProjectId) {
  projectId = newProjectId;
  console.log({ projectId });
  window.dispatchEvent(new Event("projectId"));
  projectIdInput.value = projectId;
  setUrlParam("projectId", projectId);
}
window.addEventListener("loadConfig", () => {
  if (config.projectId) {
    projectIdInput.value = config.projectId;
  }
});
window.addEventListener("load", () => {
  if (url.searchParams.has("projectId")) {
    setProjectId(url.searchParams.get("projectId"));
  }
});

// EDGE IMPULSE KEYS

/** @type {string?} */
let apiKey;

const apiKeyInput = document.getElementById("apiKey");
apiKeyInput.addEventListener("input", (event) => {
  setApiKey(event.target.value);
  setHmacKey();
});
function setApiKey(newApiKey) {
  apiKey = newApiKey;
  apiKeyInput.value = apiKey;
  console.log({ apiKey });
  window.dispatchEvent(new Event("apiKey"));
  setUrlParam("apiKey", apiKey);
}
window.addEventListener("loadConfig", () => {
  if (config.apiKey) {
    setApiKey(config.apiKey);
  }
});
window.addEventListener("load", () => {
  if (url.searchParams.has("apiKey")) {
    setApiKey(url.searchParams.get("apiKey"));
  }
});

// HmacKey

/** @type {string?} */
let hmacKey;

function setHmacKey(newHmacKey) {
  hmacKey = newHmacKey;
  console.log({ hmacKey });
  window.dispatchEvent(new Event("hmacKey"));
  updateHmacKeyButton();
  setUrlParam("hmacKey", hmacKey);
}

/** @type {HTMLButtonElement} */
const getHmacKeyButton = document.getElementById("getHmacKey");
getHmacKeyButton.addEventListener("click", async () => {
  getHmacKeyButton.innerText = "getting hmacKey...";
  getHmacKeyButton.disabled = true;
  await getHmacKey();
  updateHmacKeyButton();
});

function updateHmacKeyButton() {
  getHmacKeyButton.disabled = Boolean(hmacKey);
  getHmacKeyButton.innerText = Boolean(hmacKey) ? "got hmacKey" : "get hmacKey";
}

["projectId", "apiKey", "hmacKey"].forEach((eventType) => {
  window.addEventListener(eventType, () => {
    updateHmacKeyButton();
  });
});

window.addEventListener("load", () => {
  if (url.searchParams.has("hmacKey")) {
    setHmacKey(url.searchParams.get("hmacKey"));
  }
});

// SENSOR TYPES

/** @type {BS.TfliteSensorType[]} */
let sensorTypes = [];
/** @param {BS.TfliteSensorType[]} newSensorTypes */
function setSensorTypes(newSensorTypes) {
  sensorTypes = newSensorTypes;
  console.log("sensorTypes", sensorTypes);
  window.dispatchEvent(new Event("sensorTypes"));
}

const sensorTypesContainer = document.getElementById("sensorTypes");
/** @type {HTMLTemplateElement} */
const sensorTypeTemplate = document.getElementById("sensorTypeTemplate");
/** @type {Object.<string, HTMLElement>} */
const sensorTypeContainers = {};

const TfliteSensorTypes = BS.TfliteSensorTypes.slice();
const includeAcceleration = false;
if (includeAcceleration) {
  // for testing with Frame
  TfliteSensorTypes.push("acceleration");
}

TfliteSensorTypes.forEach((sensorType) => {
  const sensorTypeContainer = sensorTypeTemplate.content
    .cloneNode(true)
    .querySelector(".sensorType");
  sensorTypeContainer.querySelector(".name").innerText = sensorType;

  /** @type {HTMLInputElement} */
  const isSensorEnabledInput = sensorTypeContainer.querySelector(".enabled");
  isSensorEnabledInput.addEventListener("input", () => {
    onSensorTypesInput();
  });

  window.addEventListener("sensorTypes", () => {
    isSensorEnabledInput.checked = sensorTypes.includes(sensorType);
  });

  sensorTypeContainers[sensorType] = sensorTypeContainer;

  sensorTypesContainer.appendChild(sensorTypeContainer);
});

function onSensorTypesInput() {
  const sensorTypes = TfliteSensorTypes.filter((sensorType) => {
    /** @type {HTMLInputElement} */
    const input = sensorTypeContainers[sensorType].querySelector(".enabled");
    return input.checked;
  });
  setSensorTypes(sensorTypes);
}

// SAMPLING

/** @type {number} */
let samplingInterval;
/** @param {number} newSamplingInterval */
function setSamplingInterval(newSamplingInterval) {
  samplingInterval = newSamplingInterval;
  console.log({ samplingInterval });
  samplingIntervalInput.value = samplingInterval;
  window.dispatchEvent(new Event("samplingInterval"));
}
/** @type {HTMLInputElement} */
const samplingIntervalInput = document.getElementById("samplingInterval");
samplingIntervalInput.addEventListener("input", (event) => {
  setSamplingInterval(Number(event.target.value));
});
setSamplingInterval(20);

/** @type {number} */
let numberOfSamples;
/** @param {number} newNumberOfSamples */
function setNumberOfSamples(newNumberOfSamples) {
  numberOfSamples = newNumberOfSamples;
  console.log({ numberOfSamples });
  numberOfSamplesInput.value = numberOfSamples;
  window.dispatchEvent(new Event("numberOfSamples"));
}
/** @type {HTMLInputElement} */
const numberOfSamplesInput = document.getElementById("numberOfSamples");
numberOfSamplesInput.addEventListener("input", (event) => {
  setNumberOfSamples(Number(event.target.value));
});
setNumberOfSamples(10);

/** @type {string} */
let label;
/** @type {HTMLInputElement} */
const labelInput = document.getElementById("label");
labelInput.addEventListener("input", (event) => {
  setLabel(event.target.value);
});
/** @param {string} newLabel */
function setLabel(newLabel) {
  label = newLabel;
  console.log({ label });
  labelInput.value = label;
  window.dispatchEvent(new Event("label"));
}
setLabel("idle");

/** @type {string} */
let path;
/** @type {HTMLInputElement} */
const pathInput = document.getElementById("path");
pathInput.addEventListener("input", (event) => {
  setPath(event.target.value);
});
/** @param {string} newPath */
function setPath(newPath) {
  path = newPath;
  console.log({ path });
  pathInput.value = path;
  window.dispatchEvent(new Event("path"));
}
setPath("/api/training/data");

/** @type {number} */
let samplingLength;
/** @param {number} newSamplingLength */
function setSamplingLength(newSamplingLength) {
  samplingLength = newSamplingLength;
  console.log({ samplingLength });
  samplingLengthInput.value = samplingLength;
  window.dispatchEvent(new Event("samplingLength"));
}
/** @type {HTMLInputElement} */
const samplingLengthInput = document.getElementById("samplingLength");

function updateSamplingLength() {
  const newSamplingLength = numberOfSamples * samplingInterval;
  setSamplingLength(newSamplingLength);
}
updateSamplingLength();

["samplingInterval", "numberOfSamples"].forEach((eventType) => {
  window.addEventListener(eventType, () => {
    updateSamplingLength();
  });
});

// SAMPLING

let isSampling = false;
/** @param {boolean} newIsSampling */
function setIsSampling(newIsSampling) {
  isSampling = newIsSampling;
  console.log({ isSampling });
  window.dispatchEvent(new Event("isSampling"));
  if (isSampling) {
    sendRemoteManagementMessage({ sampleStarted: true });
  }
}

/** @type {HTMLButtonElement} */
const toggleSamplingButton = document.getElementById("toggleSampling");
toggleSamplingButton.addEventListener("click", () => {
  sampleAndUpload();
});

function updateToggleSamplingButton() {
  const enabled =
    device.isConnected &&
    isRemoteManagementConnected() &&
    sensorTypes.length > 0 &&
    label.length > 0 &&
    !isSampling;
  toggleSamplingButton.disabled = !enabled;
  toggleSamplingButton.innerText = isSampling
    ? "sampling..."
    : "start sampling";
}

["isSampling", "remoteManagementConnection", "sensortypes", "label"].forEach(
  (eventType) => {
    window.addEventListener(eventType, () => {
      updateToggleSamplingButton();
    });
  }
);
device.addEventListener("isConnected", () => {
  updateToggleSamplingButton();
});

async function sampleAndUpload() {
  /** @type {BS.SensorConfiguration} */
  const sensorConfiguration = {};
  sensorTypes.forEach((sensorType) => {
    sensorConfiguration[sensorType] = samplingInterval;
  });
  console.log("sensorConfiguration", sensorConfiguration);
  device.setSensorConfiguration(sensorConfiguration);

  setIsSampling(true);

  const deviceData = await collectData(sensorTypes, numberOfSamples);
  await device.clearSensorConfiguration();
  console.log("deviceData", deviceData);

  sendRemoteManagementMessage?.({ sampleFinished: true });
  setIsSampling(false);

  sendRemoteManagementMessage?.({ sampleUploading: true });
  await uploadMotionData(sensorTypes, deviceData);
}

// EDGE IMPULSE API

const ingestionApi = "https://ingestion.edgeimpulse.com";
const remoteManagementEndpoint = "wss://remote-mgmt.edgeimpulse.com";
const studioEndpoint = "https://studio.edgeimpulse.com";

async function getProjects() {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("GET", `${studioEndpoint}/v1/api/projects`);
    x.onload = () => {
      if (x.status !== 200) {
        reject(
          "No projects found: " + x.status + " - " + JSON.stringify(x.response)
        );
      } else {
        if (!x.response.success) {
          reject(x.response.error);
        } else {
          const projects = x.response.projects;
          console.log("projects", projects);
          resolve(projects);
          window.dispatchEvent(
            new CustomEvent("edgeImpulseProjects", { detail: { projects } })
          );
        }
      }
    };
    x.onerror = (err) => reject(err);
    x.responseType = "json";
    x.setRequestHeader("x-api-key", apiKey);
    x.send();
  });
}

async function getProject() {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("GET", `${studioEndpoint}/v1/api/${projectId}/public-info`);
    x.onload = () => {
      if (x.status !== 200) {
        reject(
          "No projects found: " + x.status + " - " + JSON.stringify(x.response)
        );
      } else {
        if (!x.response.success) {
          reject(x.response.error);
        } else {
          const project = x.response;
          console.log("project", project);
          resolve(project);
          window.dispatchEvent(
            new CustomEvent("edgeImpulseProject", { detail: { project } })
          );
        }
      }
    };
    if (apiKey) {
      x.setRequestHeader("x-api-key", apiKey);
    }
    x.onerror = (err) => reject(err);
    x.responseType = "json";
    x.send();
  });
}

async function getHmacKey() {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("GET", `${studioEndpoint}/v1/api/${projectId}/devkeys`);
    x.onload = () => {
      if (x.status !== 200) {
        reject(
          "No development keys found: " +
            x.status +
            " - " +
            JSON.stringify(x.response)
        );
      } else {
        if (!x.response.success) {
          reject(x.response.error);
        } else {
          const { apiKey, hmacKey } = x.response;
          console.log({ apiKey, hmacKey });
          //setApiKey(apiKey);
          setHmacKey(hmacKey);
          resolve({
            apiKey,
            hmacKey,
          });
        }
      }
    };
    x.onerror = (err) => reject(err);
    x.responseType = "json";
    if (apiKey) {
      x.setRequestHeader("x-api-key", apiKey);
    }
    x.send();
  });
}

// REMOTE MANAGEMENT

/**
 * @typedef SamplingDetails
 * @type {Object}
 * @property {string} path
 * @property {string} label
 * @property {number} length ms
 * @property {number} interval ms
 * @property {string} hmacKey
 * @property {string} sensor
 */

/** @param {Blob} blob */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result is a data URL: "data:image/png;base64,...."
      resolve(reader.result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** @param {string} string */
const lowercaseFirstLetter = (string) =>
  string[0].toLowerCase() + string.slice(1);

/** @type {SamplingDetails?} */
let microphoneSamplingDetails;

/** @type {WebSocket?} */
let remoteManagementWebSocket;
/** @type {(message: object)=>{}?} */
let sendRemoteManagementMessage;
async function connectToRemoteManagement() {
  remoteManagementWebSocket?.close();

  /** @type {number?} */
  let intervalId;

  const ws = new WebSocket(remoteManagementEndpoint);
  remoteManagementWebSocket = ws;

  sendRemoteManagementMessage = (message) => {
    console.log("sending message", message);
    ws.send(JSON.stringify(message));
  };
  ws.addEventListener("open", () => {
    console.log("remoteManagementWebSocket.open");
    window.dispatchEvent(new Event("remoteManagementConnection"));
    sendRemoteManagementMessage(remoteManagementHelloMessage());
    intervalId = setInterval(() => {
      //console.log("ping");
      ws.send("ping");
    }, 3000);
  });
  ws.addEventListener("close", () => {
    console.log("remoteManagementWebSocket.close");
    window.dispatchEvent(new Event("remoteManagementConnection"));
    clearInterval(intervalId);
    if (reconnectRemoteManagementOnDisconnection && !ws.dontReconnect) {
      window.setTimeout(() => {
        if (!reconnectRemoteManagementOnDisconnection) {
          return;
        }
        connectToRemoteManagement();
      }, 2000);
    }
  });
  ws.addEventListener("error", (event) => {
    console.log("remoteManagementWebSocket.error", event);
    window.dispatchEvent(new Event("remoteManagementConnection"));
  });
  ws.addEventListener("message", async (event) => {
    //console.log("remoteManagementWebSocket.message", event.data);

    const data = await parseRemoteManagementMessage(event);
    if (!data) {
      return;
    }

    console.log({ data });

    if ("hello" in data) {
      const isConnected = data.hello;
      console.log({ isConnected });
      if (isConnected) {
        ws._isConnected = true;
        window.dispatchEvent(new Event("remoteManagementConnection"));
      }
    }

    if ("sample" in data) {
      /** @type {SamplingDetails} */
      const samplingDetails = data.sample;
      console.log("samplingDetails", samplingDetails);

      let cameraResolution;

      /** @type {BS.TfliteSensorType[]} */
      const sensorTypes = samplingDetails.sensor
        .split(sensorCombinationSeparator)
        .map((sensorType) => {
          if (sensorType.startsWith("Camera")) {
            cameraResolution = sensorType
              .split(" ")[1]
              ?.slice(1, -1)
              ?.split("x")
              ?.map(Number);
            console.log("cameraResolution", cameraResolution);
            return "camera";
          } else if (sensorType.startsWith("Microphone")) {
            return "microphone";
          }
          return sensorType;
        });
      console.log("samplingDetails sensorTypes", sensorTypes);

      const allowedTfliteSensorTypes = device.allowedTfliteSensorTypes;
      if (includeAcceleration) {
        allowedTfliteSensorTypes.push("acceleration");
      }
      const invalidSensors = sensorTypes.filter(
        (sensorType) => !allowedTfliteSensorTypes.includes(sensorType)
      );
      if (invalidSensors.length > 0) {
        console.error("invalid sensorTypes", invalidSensors);
        return;
      }
      setSensorTypes(sensorTypes);

      setLabel(samplingDetails.label);
      setHmacKey(samplingDetails.hmacKey);
      setPath(samplingDetails.path);

      const isCamera = sensorTypes.includes("camera");
      const isMicrophone = sensorTypes.includes("microphone");
      console.log({ isCamera, isMicrophone });

      sendRemoteManagementMessage({ sample: true });

      if (isCamera) {
        setSamplingInterval(20);
        await device.takePicture();
      } else if (isMicrophone) {
        microphoneSamplingDetails = samplingDetails;
        setSamplingInterval(20);
        /** @type {BS.MicrophoneSampleRate} */
        const sampleRate = 1000 / samplingDetails.interval;
        console.log({ sampleRate });
        await device.setMicrophoneConfiguration({ sampleRate });
        console.log("starting microphone...");
        await device.startMicrophone();
      } else {
        const numberOfSamples =
          samplingDetails.length / samplingDetails.interval;
        setNumberOfSamples(numberOfSamples);
        setSamplingInterval(samplingDetails.interval);
        setSamplingLength(samplingDetails.length);

        sampleAndUpload();
      }

      // /** @type {SensorConfiguration} */
      // const sensorConfiguration = {};
      // sensorTypes.forEach((sensorType) => {
      //     sensorConfiguration[sensorType] = samplingDetails.interval;
      // });
      // console.log("sensorConfiguration", sensorConfiguration);
      // device.setSensorConfiguration(sensorConfiguration);

      // setIsSampling(true);

      // const deviceData = await collectData(sensorTypes, numberOfSamples);
      // await device.clearSensorConfiguration();
      // console.log("deviceData", deviceData);

      // sendRemoteManagementMessage?.({ sampleFinished: true });
      // setIsSampling(false);

      // sendRemoteManagementMessage?.({ sampleUploading: true });
      // await uploadData(samplingDetails, sensorTypes, deviceData);
    }
  });
}

device.addEventListener("cameraStatus", (event) => {
  const { cameraStatus, previousCameraStatus } = event.message;
  switch (cameraStatus) {
    case "takingPicture":
      setIsSampling(true);
      break;
    case "idle":
      if (previousCameraStatus == "takingPicture") {
        sendRemoteManagementMessage?.({ sampleFinished: true });
        setIsSampling(false);
      }
      break;
  }
});
let cropSquare = false;
async function normalizeJpeg(blob) {
  const img = await createImageBitmap(blob);

  const canvas = document.createElement("canvas");
  canvas.width = cropSquare ? img.height : img.width;
  canvas.height = img.height;

  let x = 0;
  if (cropSquare) {
    x = (img.width - img.height) / 2;
  }

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, -x, 0);

  return await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 1)
  );
}
device.addEventListener("cameraImage", async (event) => {
  let { blob } = event.message;
  blob = await normalizeJpeg(blob);
  if (cropSquare) {
    const url = URL.createObjectURL(blob);
    cameraImage.src = url;
  }

  sendRemoteManagementMessage?.({ sampleFinished: true });
  sendRemoteManagementMessage?.({ sampleUploading: true });
  const imageString = await blobToBase64(blob);
  sendRemoteManagementMessage?.({ snapshotFrame: imageString });

  const form = new FormData();
  form.append("data", blob, "image.jpg");

  await fetch("https://ingestion.edgeimpulse.com/api/training/files", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "x-label": label,
    },
    body: form,
  });
});

/**
 * @param {Float32Array} float32Array
 * @returns {Int16Array}
 */
function convertFloat32ToPCM(float32Array) {
  const pcmArray = new Int16Array(float32Array.length);

  for (let i = 0; i < float32Array.length; i++) {
    const clampedValue = Math.max(-1, Math.min(1, float32Array[i]));

    pcmArray[i] =
      clampedValue < 0 ? clampedValue * 0x8000 : clampedValue * 0x7fff;
  }

  return pcmArray;
}
device.addEventListener("microphoneStatus", async (event) => {
  // console.log("microphoneStatus", event.message);
  const { microphoneStatus, previousMicrophoneStatus } = event.message;
  switch (microphoneStatus) {
    case "streaming":
      setIsSampling(true);
      if (microphoneSamplingDetails) {
        device.startRecordingMicrophone();
        await BS.wait(microphoneSamplingDetails.length);
        device.stopRecordingMicrophone();
        microphoneSamplingDetails = undefined;
        await device.stopMicrophone();
      }
      break;
    case "idle":
      if (previousMicrophoneStatus == "streaming") {
        sendRemoteManagementMessage?.({ sampleFinished: true });
        setIsSampling(false);
      }
      break;
  }
});
device.addEventListener("microphoneRecording", async (event) => {
  // console.log("microphoneRecording", event.message);

  const { blob } = event.message;

  sendRemoteManagementMessage?.({ sampleFinished: true });
  sendRemoteManagementMessage?.({ sampleUploading: true });

  const form = new FormData();
  form.append("data", blob, "sound.wav");

  await fetch("https://ingestion.edgeimpulse.com/api/training/files", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "x-label": label,
    },
    body: form,
  });
});

async function parseRemoteManagementMessage(event) {
  if (event.data instanceof Blob) {
    return await event.data.text();
  } else if (typeof event.data === "string") {
    if (event.data === "pong") return null;
    return JSON.parse(event.data);
  }
  return null;
}

const sensorCombinationSeparator = " + ";

// ChatGPT
/** @param {string[]} array */
function generateSubarrays(array) {
  /** @type {string[][]} */
  const results = [];

  /**
   * @param {number} start
   * @param {string[]} subArray
   */
  function helper(start, subArray) {
    results.push(subArray);

    for (let i = start; i < array.length; i++) {
      helper(i + 1, subArray.concat(array[i]));
    }
  }

  helper(0, []);

  return results
    .sort((a, b) => a.length - b.length)
    .filter((subArray) => subArray.length > 0)
    .map((subArray) => subArray.join(sensorCombinationSeparator));
}

const getDeviceId = () => `${device.name}.${device.type}.${device.id}`;

function remoteManagementHelloMessage() {
  const allowedTfliteSensorTypes = device.allowedTfliteSensorTypes.slice();
  if (includeAcceleration) {
    allowedTfliteSensorTypes.push("acceleration");
  }
  const sensorCombinations = generateSubarrays(
    allowedTfliteSensorTypes.filter((sensorType) => {
      switch (sensorType) {
        case "camera":
        case "microphone":
        case "pressure":
          return false;
        default:
          return true;
      }
    })
  );
  const singleTliteSensorTypes = allowedTfliteSensorTypes.filter(
    (sensorType) => {
      switch (sensorType) {
        case "camera":
        case "microphone":
        case "pressure":
          return true;
        default:
          return false;
      }
    }
  );
  sensorCombinations.push(...singleTliteSensorTypes);

  console.log("sensorCombinations", sensorCombinations);
  return {
    hello: {
      version: 3,
      apiKey: apiKey,
      deviceId: getDeviceId(),
      deviceType: "BrilliantSole",
      connection: "ip",
      sensors: sensorCombinations.map((sensorCombination) => {
        switch (sensorCombination) {
          case "camera":
            return {
              name: "Camera",
              frequencies: [],
              maxSampleLengthS: 1 * 60,
              units: "jpg",
            };
          case "microphone":
            return {
              name: "Microphone",
              frequencies: BS.MicrophoneSampleRates,
              maxSampleLengthS: 1 * 60,
              units: "wav",
            };
          default:
            return {
              name: sensorCombination,
              maxSampleLengthS: 1 * 60,
              frequencies: [100.0, 50.0, 25.0, 12.5], // 10ms, 20ms, 40ms, 80ms
            };
        }
      }),
      supportsSnapshotStreaming: true,
    },
  };
}

function isRemoteManagementConnected() {
  return (
    remoteManagementWebSocket?.readyState == WebSocket.OPEN &&
    remoteManagementWebSocket?._isConnected
  );
}

/** @type {HTMLButtonElement} */
const toggleRemoteManagementConnectionButton = document.getElementById(
  "toggleRemoteManagementConnection"
);
toggleRemoteManagementConnectionButton.addEventListener("click", () => {
  if (isRemoteManagementConnected()) {
    remoteManagementWebSocket.dontReconnect = true;
    remoteManagementWebSocket.close();
    toggleRemoteManagementConnectionButton.innerText = "disconnecting...";
    toggleRemoteManagementConnectionButton.disabled = true;
  } else {
    connectToRemoteManagement();
    toggleRemoteManagementConnectionButton.innerText = "connecting...";
  }
});

window.addEventListener("remoteManagementConnection", () => {
  if (isRemoteManagementConnected()) {
    toggleRemoteManagementConnectionButton.innerText = "disconnect";
    toggleRemoteManagementConnectionButton.disabled = false;
  } else {
    toggleRemoteManagementConnectionButton.innerText = "connect";
    toggleRemoteManagementConnectionButton.disabled = false;
  }
});

function updateToggleRemoteManagementConnectionButton() {
  const enabled = device.isConnected;
  toggleRemoteManagementConnectionButton.disabled = !enabled;
}
device.addEventListener("isConnected", () => {
  updateToggleRemoteManagementConnectionButton();
});

let reconnectRemoteManagementOnDisconnection = false;
/** @type {HTMLInputElement} */
const reconnectRemoteManagementOnDisconnectionInput = document.getElementById(
  "reconnectRemoteManagementOnDisconnection"
);
reconnectRemoteManagementOnDisconnectionInput.addEventListener(
  "input",
  (event) => {
    setReconnectRemoteManagementOnDisconnection(event.target.checked);
  }
);
reconnectRemoteManagementOnDisconnectionInput.checked =
  reconnectRemoteManagementOnDisconnection;
/** @param {boolean} newReconnectRemoteManagementOnDisconnection */
function setReconnectRemoteManagementOnDisconnection(
  newReconnectRemoteManagementOnDisconnection
) {
  reconnectRemoteManagementOnDisconnection =
    newReconnectRemoteManagementOnDisconnection;
  console.log({ reconnectRemoteManagementOnDisconnection });
  dispatchEvent(new Event("reconnectRemoteManagementOnDisconnection"));
}

// DATA COLLECTION

const scalars = {
  pressure: 1 / (2 ** 16 - 1),
  acceleration: 1 / 4,
  linearAcceleration: 1 / 4,
  gyroscope: 1 / 720,
  magnetometer: 1 / 2500,
};

/** @typedef {Object.<string, number>} SensorData */
/** @typedef {Object.<string, SensorData[]>} DeviceData */

/**
 * @param {BS.TfliteSensorType[]} sensorTypes
 * @param {number} numberOfSamples
 * @returns {Promise<DeviceData>}
 */
async function collectData(sensorTypes, numberOfSamples) {
  return new Promise((resolve) => {
    /** @type {DeviceData} */
    const deviceData = {};

    sensorTypes.forEach((sensorType) => {
      deviceData[sensorType] = [];
    });

    console.log("deviceData", deviceData);

    const onDeviceSensorData = (event) => {
      /** @type {BS.TfliteSensorType} */
      const sensorType = event.message.sensorType;

      if (!(sensorType in deviceData)) {
        return;
      }

      const didFinishCollectingDeviceData = Object.values(deviceData).every(
        (sensorData) => sensorData.length >= numberOfSamples
      );

      if (didFinishCollectingDeviceData) {
        console.log("finished collecting data for device", deviceData);
        device.removeEventListener("sensorData", onDeviceSensorData);
        resolve(deviceData);
        return;
      }

      if (deviceData[sensorType].length == numberOfSamples) {
        console.log(`finished collecting ${sensorType} data for device`);
        return;
      }

      const { [sensorType]: data } = event.message;
      deviceData[sensorType].push(data);
    };

    device.addEventListener("sensorData", onDeviceSensorData);
  });
}

// DATA UPLOAD

const emptySignature = Array(64).fill("0").join("");

/**
 * @param {BS.TfliteSensorType[]} sensorTypes
 * @param {DeviceData} deviceData
 */
async function uploadMotionData(sensorTypes, deviceData) {
  const sensors = sensorTypes.flatMap((sensorType) => {
    let names = [];
    let units;
    switch (sensorType) {
      case "acceleration":
      case "linearAcceleration":
      case "gyroscope":
      case "magnetometer":
        names = ["x", "y", "z"].map(
          (component) => `${sensorType}.${component}`
        );
        switch (sensorType) {
          case "acceleration":
          case "linearAcceleration":
            units = "g/s";
            break;
          case "gyroscope":
            units = "deg/s";
            break;
          case "magnetometer":
            units = "uT";
            break;
        }
        break;
      case "pressure":
        for (let index = 0; index < device.numberOfPressureSensors; index++) {
          names.push(`${sensorType}.${index}`);
        }
        units = "pressure";
        break;
      default:
        throw `uncaught sensorType ${sensorType}`;
    }

    return names.map((name) => ({
      name,
      units,
    }));
  });

  console.log("sensors", sensors);

  const values = [];
  for (let sampleIndex = 0; sampleIndex < numberOfSamples; sampleIndex++) {
    const value = [];

    sensorTypes.forEach((sensorType) => {
      const scalar = scalars[sensorType];
      const sensorSamples = deviceData[sensorType];

      switch (sensorType) {
        case "acceleration":
        case "linearAcceleration":
        case "gyroscope":
        case "magnetometer":
          ["x", "y", "z"].forEach((component) => {
            value.push(sensorSamples[sampleIndex][component] * scalar);
          });
          break;
        case "pressure":
          for (
            let pressureIndex = 0;
            pressureIndex < device.numberOfPressureSensors;
            pressureIndex++
          ) {
            value.push(
              sensorSamples[sampleIndex].sensors[pressureIndex].rawValue *
                scalar
            );
          }
          break;
        default:
          throw `uncaught sensorType ${sensorType}`;
      }
    });

    values.push(value);
  }

  uploadData(values, sensors);
}

/**
 * @param {number[]} values
 * @param {{name: string, units: string}[]} sensors
 * @returns
 */
async function uploadData(values, sensors) {
  console.log("values", values);
  const data = {
    protected: {
      ver: "v1",
      alg: "HS256",
      iat: Math.floor(Date.now() / 1000),
    },
    signature: emptySignature,
    payload: {
      device_name: getDeviceId(),
      device_type: "BrilliantSole",
      interval_ms: samplingInterval,
      sensors,
      values,
    },
  };

  console.log("data", data);

  data.signature = await createSignature(hmacKey, data);

  console.log("signature", data.signature);

  const formData = new FormData();
  formData.append(
    "message",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
    "message.json"
  );

  return new Promise((resolve, reject) => {
    let xml = new XMLHttpRequest();
    xml.onload = () => {
      if (xml.status === 200) {
        resolve(xml.responseText);
      } else {
        reject(
          "Failed to upload (status code " +
            xml.status +
            "): " +
            xml.responseText
        );
      }
    };
    xml.onerror = () => reject(undefined);
    xml.open("post", ingestionApi + path);
    xml.setRequestHeader("x-api-key", apiKey);
    xml.setRequestHeader("x-file-name", encodeLabel(label));
    xml.send(formData);
  });
}

function encodeLabel(header) {
  let encodedHeader;
  try {
    encodedHeader = encodeURIComponent(header);
  } catch (ex) {
    encodedHeader = header;
  }

  return encodedHeader;
}

const textEncoder = new TextEncoder();

/**
 * @param {string} hmacKey
 * @param {object} data
 */
async function createSignature(hmacKey, data) {
  // encoder to convert string to Uint8Array
  const key = await crypto.subtle.importKey(
    "raw", // raw format of the key - should be Uint8Array
    textEncoder.encode(hmacKey),
    {
      // algorithm details
      name: "HMAC",
      hash: {
        name: "SHA-256",
      },
    },
    false, // export = false
    ["sign", "verify"] // what this key can do
  );
  // Create signature for encoded input data
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(JSON.stringify(data))
  );
  // Convert back to Hex
  const b = new Uint8Array(signature);
  return Array.prototype.map
    .call(b, (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

// EDGE IMPULSE CONFIG

const configLocalStorageKey = "EdgeImpulse";

let config = {
  projectId,
  apiKey,
  hmacKey,
};
/** @type {object?} */
let loadedConfig;
console.log("config", config);
function loadConfigFromLocalStorage() {
  const configString = localStorage.getItem(configLocalStorageKey);
  if (!configString) {
    return;
  }
  loadedConfig = JSON.parse(configString);
  console.log("loaded config", loadedConfig);
  Object.assign(config, loadedConfig);
  console.log("updated config", config);
  window.dispatchEvent(new Event("loadConfig"));
}
loadConfigFromLocalStorage();

function saveConfigToLocalStorage() {
  const isConfigDifferent =
    !loadedConfig ||
    Object.entries(loadedConfig).some(([key, value]) => config[key] != value);
  if (!isConfigDifferent) {
    return;
  }
  console.log("saving config", config);
  localStorage.setItem(configLocalStorageKey, JSON.stringify(config));
  loadedConfig = config;
}

Object.keys(config).forEach((type) => {
  window.addEventListener(type, () => {
    config = {
      projectId,
      apiKey,
      hmacKey,
    };
    saveConfigToLocalStorage();
  });
});

// CAMERA
const cameraContainer = document.getElementById("camera");
device.addEventListener("connected", () => {
  if (!device.hasCamera) {
    cameraContainer.setAttribute("hidden", "");
  } else {
    cameraContainer.removeAttribute("hidden");
  }
});
/** @type {HTMLSpanElement} */
const isCameraAvailableSpan = document.getElementById("isCameraAvailable");
device.addEventListener("connected", () => {
  isCameraAvailableSpan.innerText = device.hasCamera;
});

/** @type {HTMLSpanElement} */
const cameraStatusSpan = document.getElementById("cameraStatus");
device.addEventListener("cameraStatus", () => {
  cameraStatusSpan.innerText = device.cameraStatus;
});

/** @type {HTMLButtonElement} */
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  if (device.cameraStatus == "idle") {
    device.takePicture();
  } else {
    device.stopCamera();
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
    //device.sensorConfiguration.camera == 0 ||
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

/** @type {HTMLButtonElement} */
const sleepCameraButton = document.getElementById("sleepCamera");
sleepCameraButton.addEventListener("click", () => {
  if (device.cameraStatus == "asleep") {
    device.wakeCamera();
  } else {
    device.sleepCamera();
  }
});
device.addEventListener("connected", () => {
  updateSleepCameraButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateSleepCameraButton();
});
const updateSleepCameraButton = () => {
  let disabled = !device.isConnected || !device.hasCamera;
  switch (device.cameraStatus) {
    case "asleep":
      sleepCameraButton.innerText = "wake camera";
      break;
    case "idle":
      sleepCameraButton.innerText = "sleep camera";
      break;
    default:
      disabled = true;
      break;
  }
  sleepCameraButton.disabled = disabled;
};
device.addEventListener("cameraStatus", () => {
  updateSleepCameraButton();
});

/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");
device.addEventListener("cameraImage", (event) => {
  if (!cropSquare) {
    cameraImage.src = event.message.url;
  }
});

/** @type {HTMLProgressElement} */
const cameraImageProgress = document.getElementById("cameraImageProgress");
device.addEventListener("cameraImageProgress", (event) => {
  if (event.message.type == "image") {
    cameraImageProgress.value = event.message.progress;
  }
});

/** @type {HTMLInputElement} */
const autoPictureCheckbox = document.getElementById("autoPicture");
autoPictureCheckbox.addEventListener("input", () => {
  device.autoPicture = autoPictureCheckbox.checked;
});
device.addEventListener("autoPicture", () => {
  autoPictureCheckbox.checked = device.autoPicture;
});

/** @type {HTMLPreElement} */
const cameraConfigurationPre = document.getElementById(
  "cameraConfigurationPre"
);
device.addEventListener("getCameraConfiguration", () => {
  cameraConfigurationPre.textContent = JSON.stringify(
    device.cameraConfiguration,
    null,
    2
  );
});

const cameraConfigurationContainer = document.getElementById(
  "cameraConfiguration"
);
/** @type {HTMLTemplateElement} */
const cameraConfigurationTypeTemplate = document.getElementById(
  "cameraConfigurationTypeTemplate"
);
BS.CameraConfigurationTypes.forEach((cameraConfigurationType) => {
  const cameraConfigurationTypeContainer =
    cameraConfigurationTypeTemplate.content
      .cloneNode(true)
      .querySelector(".cameraConfigurationType");

  cameraConfigurationContainer.appendChild(cameraConfigurationTypeContainer);

  cameraConfigurationTypeContainer.querySelector(".type").innerText =
    cameraConfigurationType;

  /** @type {HTMLInputElement} */
  const input = cameraConfigurationTypeContainer.querySelector("input");

  /** @type {HTMLSpanElement} */
  const span = cameraConfigurationTypeContainer.querySelector("span");

  device.addEventListener("isConnected", () => {
    updateIsInputDisabled();
  });
  device.addEventListener("connected", () => {
    updateContainerVisibility();
  });
  device.addEventListener("cameraStatus", () => {
    updateIsInputDisabled();
  });
  const updateIsInputDisabled = () => {
    input.disabled =
      !device.isConnected || !device.hasCamera || device.cameraStatus != "idle";
  };

  const updateContainerVisibility = () => {
    const isVisible = cameraConfigurationType in device.cameraConfiguration;
    cameraConfigurationTypeContainer.style.display = isVisible ? "" : "none";
  };
  const updateInput = () => {
    const value = device.cameraConfiguration[cameraConfigurationType];
    span.innerText = value;
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
    // console.log(`updating ${cameraConfigurationType} to ${value}`);
    device.setCameraConfiguration({
      [cameraConfigurationType]: value,
    });
    if (takePictureAfterUpdate) {
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

/** @type {HTMLInputElement} */
const takePictureAfterUpdateCheckbox = document.getElementById(
  "takePictureAfterUpdate"
);
let takePictureAfterUpdate = false;
takePictureAfterUpdateCheckbox.addEventListener("input", () => {
  takePictureAfterUpdate = takePictureAfterUpdateCheckbox.checked;
  console.log({ takePictureAfterUpdate });
});

/** @type {HTMLInputElement} */
const cameraWhiteBalanceInput = document.getElementById("cameraWhiteBalance");
const updateWhiteBalance = BS.ThrottleUtils.throttle(
  (config) => {
    if (device.cameraStatus != "idle") {
      return;
    }

    device.setCameraConfiguration(config);

    if (takePictureAfterUpdate) {
      device.addEventListener(
        "getCameraConfiguration",
        () => {
          setTimeout(() => device.takePicture()), 100;
        },
        { once: true }
      );
    }
  },
  200,
  true
);
cameraWhiteBalanceInput.addEventListener("input", () => {
  let [redGain, greenGain, blueGain] = cameraWhiteBalanceInput.value
    .replace("#", "")
    .match(/.{1,2}/g)
    .map((value) => Number(`0x${value}`))
    .map((value) => value / 255)
    .map((value) => value * device.cameraConfigurationRanges.blueGain.max)
    .map((value) => Math.round(value));

  updateWhiteBalance({ redGain, greenGain, blueGain });
});
const updateCameraWhiteBalanceInput = () => {
  if (!device.hasCamera) {
    return;
  }
  cameraWhiteBalanceInput.disabled =
    !device.isConnected || !device.hasCamera || device.cameraStatus != "idle";

  const { redGain, blueGain, greenGain } = device.cameraConfiguration;
  const cameraWhiteBalanceHex = `#${[redGain, blueGain, greenGain]
    .map((value) => value / device.cameraConfigurationRanges.redGain.max)
    .map((value) => value * 255)
    .map((value) => Math.round(value))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
  console.log({ cameraWhiteBalanceHex });
  cameraWhiteBalanceInput.value = cameraWhiteBalanceHex;
};
device.addEventListener("connected", () => {
  updateCameraWhiteBalanceInput();
});
device.addEventListener("getCameraConfiguration", () => {
  updateCameraWhiteBalanceInput();
});

// MICROPHONE
const microphoneContainer = document.getElementById("microphone");
device.addEventListener("connected", () => {
  if (!device.hasMicrophone) {
    microphoneContainer.setAttribute("hidden", "");
  } else {
    microphoneContainer.removeAttribute("hidden");
  }
});

/** @type {HTMLSpanElement} */
const isMicrophoneAvailableSpan = document.getElementById(
  "isMicrophoneAvailable"
);
device.addEventListener("connected", () => {
  isMicrophoneAvailableSpan.innerText = device.hasMicrophone;
});

/** @type {HTMLSpanElement} */
const microphoneStatusSpan = document.getElementById("microphoneStatus");
device.addEventListener("microphoneStatus", () => {
  microphoneStatusSpan.innerText = device.microphoneStatus;
});

/** @type {HTMLPreElement} */
const microphoneConfigurationPre = document.getElementById(
  "microphoneConfigurationPre"
);
device.addEventListener("getMicrophoneConfiguration", () => {
  microphoneConfigurationPre.textContent = JSON.stringify(
    device.microphoneConfiguration,
    null,
    2
  );
});

const microphoneConfigurationContainer = document.getElementById(
  "microphoneConfiguration"
);
/** @type {HTMLTemplateElement} */
const microphoneConfigurationTypeTemplate = document.getElementById(
  "microphoneConfigurationTypeTemplate"
);
BS.MicrophoneConfigurationTypes.forEach((microphoneConfigurationType) => {
  const microphoneConfigurationTypeContainer =
    microphoneConfigurationTypeTemplate.content
      .cloneNode(true)
      .querySelector(".microphoneConfigurationType");

  microphoneConfigurationContainer.appendChild(
    microphoneConfigurationTypeContainer
  );

  microphoneConfigurationTypeContainer.querySelector(".type").innerText =
    microphoneConfigurationType;

  /** @type {HTMLSelectElement} */
  const select = microphoneConfigurationTypeContainer.querySelector("select");
  /** @type {HTMLOptGroupElement} */
  const optgroup = select.querySelector("optgroup");
  optgroup.label = microphoneConfigurationType;

  BS.MicrophoneConfigurationValues[microphoneConfigurationType].forEach(
    (value) => {
      optgroup.appendChild(new Option(value));
    }
  );

  /** @type {HTMLSpanElement} */
  const span = microphoneConfigurationTypeContainer.querySelector("span");

  device.addEventListener("isConnected", () => {
    updateisInputDisabled();
  });
  device.addEventListener("microphoneStatus", () => {
    updateisInputDisabled();
  });
  const updateisInputDisabled = () => {
    select.disabled =
      !device.isConnected ||
      !device.hasMicrophone ||
      device.microphoneStatus != "idle";
  };

  const updateSelect = () => {
    const value = device.microphoneConfiguration[microphoneConfigurationType];
    span.innerText = value;
    select.value = value;
  };

  device.addEventListener("connected", () => {
    if (!device.hasMicrophone) {
      return;
    }
    updateSelect();
  });

  device.addEventListener("getMicrophoneConfiguration", () => {
    updateSelect();
  });

  select.addEventListener("input", () => {
    const value = select.value;
    // console.log(`updating ${microphoneConfigurationType} to ${value}`);
    device.setMicrophoneConfiguration({
      [microphoneConfigurationType]: value,
    });
  });
});

/** @type {HTMLButtonElement} */
const toggleMicrophoneButton = document.getElementById("toggleMicrophone");
toggleMicrophoneButton.addEventListener("click", () => {
  device.toggleMicrophone();
});
device.addEventListener("connected", () => {
  updateToggleMicrophoneButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateToggleMicrophoneButton();
});
const updateToggleMicrophoneButton = () => {
  let disabled =
    !device.isConnected ||
    device.sensorConfiguration.microphone == 0 ||
    !device.hasMicrophone;

  switch (device.microphoneStatus) {
    case "streaming":
      toggleMicrophoneButton.innerText = "stop microphone";
      break;
    case "idle":
      toggleMicrophoneButton.innerText = "start microphone";
      break;
  }
  toggleMicrophoneButton.disabled = disabled;
};
device.addEventListener("microphoneStatus", () => {
  updateToggleMicrophoneButton();
});

/** @type {HTMLButtonElement} */
const startMicrophoneButton = document.getElementById("startMicrophone");
startMicrophoneButton.addEventListener("click", () => {
  device.startMicrophone();
});
/** @type {HTMLButtonElement} */
const stopMicrophoneButton = document.getElementById("stopMicrophone");
stopMicrophoneButton.addEventListener("click", () => {
  device.stopMicrophone();
});
/** @type {HTMLButtonElement} */
const enableMicrophoneVadButton = document.getElementById(
  "enableMicrophoneVad"
);
enableMicrophoneVadButton.addEventListener("click", () => {
  device.enableMicrophoneVad();
});

const updateMicrophoneButtons = () => {
  let disabled = !device.isConnected || !device.hasMicrophone;

  startMicrophoneButton.disabled =
    disabled || device.microphoneStatus == "streaming";
  stopMicrophoneButton.disabled = disabled || device.microphoneStatus == "idle";
  enableMicrophoneVadButton.disabled =
    disabled || device.microphoneStatus == "vad";
};
device.addEventListener("microphoneStatus", () => {
  updateMicrophoneButtons();
});
device.addEventListener("connected", () => {
  updateMicrophoneButtons();
});
device.addEventListener("getSensorConfiguration", () => {
  updateMicrophoneButtons();
});

const audioContext = new (window.AudioContext || window.webkitAudioContext)({
  sampleRate: 16_000,
  latencyHint: "interactive",
});
const checkAudioContextState = () => {
  const { state } = audioContext;
  console.log({ audioContextState: state });
  if (state != "running") {
    document.addEventListener("click", () => audioContext.resume(), {
      once: true,
    });
  }
};
audioContext.addEventListener("statechange", () => {
  checkAudioContextState();
});
checkAudioContextState();

device.audioContext = audioContext;

/** @type {HTMLAudioElement} */
const microphoneStreamAudioElement =
  document.getElementById("microphoneStream");
microphoneStreamAudioElement.srcObject =
  device.microphoneMediaStreamDestination.stream;

/** @type {HTMLAudioElement} */
const microphoneRecordingAudioElement = document.getElementById(
  "microphoneRecording"
);
/** @type {HTMLInputElement} */
const autoPlayMicrophoneRecordingCheckbox = document.getElementById(
  "autoPlayMicrophoneRecording"
);
let autoPlayMicrophoneRecording = autoPlayMicrophoneRecordingCheckbox.checked;
console.log("autoPlayMicrophoneRecording", autoPlayMicrophoneRecording);
autoPlayMicrophoneRecordingCheckbox.addEventListener("input", () => {
  autoPlayMicrophoneRecording = autoPlayMicrophoneRecordingCheckbox.checked;
  console.log({ autoPlayMicrophoneRecording });
});
device.addEventListener("microphoneRecording", (event) => {
  microphoneRecordingAudioElement.src = event.message.url;
  if (autoPlayMicrophoneRecording) {
    microphoneRecordingAudioElement.play();
  }
});

/** @type {HTMLButtonElement} */
const toggleMicrophoneRecordingButton = document.getElementById(
  "toggleMicrophoneRecording"
);
toggleMicrophoneRecordingButton.addEventListener("click", () => {
  device.toggleMicrophoneRecording();
});
device.addEventListener("connected", () => {
  updateToggleMicrophoneRecordingButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateToggleMicrophoneRecordingButton();
});
const updateToggleMicrophoneRecordingButton = () => {
  let disabled =
    !device.isConnected ||
    device.sensorConfiguration.microphone == 0 ||
    !device.hasMicrophone ||
    device.microphoneStatus != "streaming";

  toggleMicrophoneRecordingButton.innerText = device.isRecordingMicrophone
    ? "stop recording"
    : "start recording";

  toggleMicrophoneRecordingButton.disabled = disabled;
};
device.addEventListener("isRecordingMicrophone", () => {
  updateToggleMicrophoneRecordingButton();
});
device.addEventListener("microphoneStatus", () => {
  updateToggleMicrophoneRecordingButton();
});
