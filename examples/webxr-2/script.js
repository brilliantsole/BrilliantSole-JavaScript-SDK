import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

let runModelInBrowser = false;
const setRunModelInBrowser = (newRunMoelInBrowser) => {
  runModelInBrowser = newRunMoelInBrowser;
  console.log({ runModelInBrowser });
  if (runModelInBrowser) {
    localStorage.setItem(runModelInBrowserKey, "");
  } else {
    localStorage.removeItem(runModelInBrowserKey);
  }

  BS.DeviceManager.ConnectedDevices.forEach((device) => {
    if (device.type != "generic") {
      return;
    }

    if (runModelInBrowser) {
      device.setSensorConfiguration(sensorConfiguration);
      device.disableTfliteInferencing();
    } else {
      device.clearSensorConfiguration();
      if (device.tfliteIsReady) {
        console.log("enabling inferencing");
        device.enableTfliteInferencing();
      }
    }
  });
};

const runModelInBrowserKey = "run-model-in-browser";
const runModelInBrowserCheckbox = document.getElementById("runModelInBrowser");
runModelInBrowserCheckbox.addEventListener("input", () => {
  setRunModelInBrowser(runModelInBrowserCheckbox.checked);
});
if (localStorage.getItem(runModelInBrowserKey) != undefined) {
  runModelInBrowserCheckbox.checked = true;
  setRunModelInBrowser(true);
}

// KICK MODEL
/** @type {BS.TfliteFileConfiguration} */
const kickConfiguration = {
  name: "kick",
  task: "classification",
  sensorTypes: ["gyroscope", "linearAcceleration"],
  sampleRate: 20,
  captureDelay: 500,
  threshold: 0.65,
  classes: ["idle", "kick", "stomp"],
};
fetch("./kick2.tflite")
  .then((response) => response.arrayBuffer())
  .then((buffer) => {
    kickConfiguration.file = buffer;
    console.log("updated kickModelConfiguration", kickConfiguration);
  })
  .catch((err) => {
    console.error("Error loading kick model:", err);
  });

// CONNECT

const connectToDeviceContainers = document.getElementById(
  "connectToDeviceContainers"
);
const connectToDeviceTemplate = document.getElementById(
  "connectToDeviceTemplate"
);

let ipAddresses = ["192.168.1.180", ""];
function updateIpAddress(ipAddress, index) {
  ipAddresses[index] = ipAddress;
  const url = new URL(window.location);

  url.searchParams.set("ipAddresses", ipAddresses.join("+"));
  window.history.replaceState({}, "", url);
}
const { searchParams } = new URL(location);
if (searchParams.has("ipAddresses")) {
  ipAddresses = searchParams.get("ipAddresses").split("+");
}

for (let i = 0; i < 2; i++) {
  const container = connectToDeviceTemplate.content
    .cloneNode(true)
    .querySelector(".connectToDevice");
  connectToDeviceContainers.appendChild(container);

  const device = new BS.Device();

  const ipAddressInput = container.querySelector(".ipAddress");
  ipAddressInput.addEventListener("input", () => {
    // can disable connect button if invalid
  });

  ipAddressInput.value = ipAddresses[i];

  // FILE TRANSFER
  const toggleConnectionButton = container.querySelector(".toggleConnection");
  toggleConnectionButton.addEventListener("click", () => {
    if (device.isConnected) {
      device.disconnect();
    } else {
      device.connect({ type: "webSocket", ipAddress: ipAddressInput.value });
    }
  });

  device.addEventListener("connected", () => {
    updateIpAddress(ipAddressInput.value, i);
    setupDevice(device);
  });

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
    ipAddressInput.disabled = disabled;
  });

  // FILE TRANSFER
  device.addEventListener("connected", async () => {
    if (device.type != "generic") {
      return;
    }
    device.sendTfliteConfiguration(kickConfiguration);
  });

  // FILE TRANSFER
  /** @type {HTMLProgressElement} */
  const fileTransferProgress = container.querySelector(".fileTransferProgress");
  device.addEventListener("fileTransferStatus", (event) => {
    if (event.message.fileTransferStatus == "sending") {
      fileTransferProgress.removeAttribute("hidden");
      isModelReadyCheckbox.removeAttribute("hidden");
    }
    if (device.fileTransferStatus == "idle") {
      fileTransferProgress.value = 0;
    }
  });
  device.addEventListener("fileTransferProgress", (event) => {
    const progress = event.message.progress;
    console.log({ progress });
    fileTransferProgress.value = progress == 1 ? 0 : progress;
  });

  // MODEL
  /** @type {HTMLInputElement} */
  const isModelReadyCheckbox = container.querySelector(".isModelReady");
  device.addEventListener("getTfliteInferencingEnabled", () => {
    isModelReadyCheckbox.checked = device.tfliteInferencingEnabled;
  });

  device.addEventListener("tfliteIsReady", () => {
    console.log("tfliteIsReady?", device.tfliteIsReady, device.type);
    if (device.type != "generic") {
      return;
    }

    if (runModelInBrowser) {
      device.setSensorConfiguration(sensorConfiguration);
      device.disableTfliteInferencing();
    } else {
      device.clearSensorConfiguration();
      if (device.tfliteIsReady) {
        console.log("enabling inferencing");
        device.enableTfliteInferencing();
      }
    }
  });

  const maxClassSpan = container.querySelector(".maxClass");
  const maxClassLabel = maxClassSpan.closest("label");
  let gestureTimeout;
  device.addEventListener("tfliteInference", (event) => {
    // console.log(event);
    maxClassLabel.removeAttribute("hidden");
    maxClassSpan.innerText =
      event.message.tfliteInference.maxClass.toUpperCase() + "!";
    if (gestureTimeout) {
      clearTimeout(gestureTimeout);
    }
    gestureTimeout = setTimeout(() => {
      maxClassSpan.innerText = "";
      maxClassLabel.setAttribute("hidden", "");
    }, 600);
  });
}

// EDGE IMPULSE
var classifier = new EdgeImpulseClassifier();
await classifier.init();
window.classifier = classifier;

let project = classifier.getProjectInfo();
console.log(project);

/** @param {number[]} features */
function classify(features) {
  try {
    let res = classifier.classify(features);
    // console.log(res);
    const { results } = res;
    let maxValue = threshold;
    let maxIndex = -1;
    let maxLabel;
    results.forEach(({ label, value }, index) => {
      if (value > maxValue) {
        maxValue = value;
        maxIndex = index;
        maxLabel = label;
      }
    });
    // console.log({ maxLabel, maxValue, maxIndex });
    switch (maxLabel) {
      case "0_idle":
        break;
      case "1_kick":
        // FILL
        console.log("KICK", maxValue);
        lastTimeGestureRecognized = Date.now();
        break;
      case "2_stomp":
        // FILL
        console.log("STOMP", maxValue);
        lastTimeGestureRecognized = Date.now();
        break;
      default:
        break;
    }
  } catch (ex) {
    alert("Failed to classify: " + (ex.message || ex.toString()));
  }
}

// SENSOR CONFIG

const sensorRate = 20;
/** @type {BS.TfliteSensorType[]} */
const sensorTypes = ["linearAcceleration", "gyroscope"];
/** @type {BS.SensorConfiguration} */
const sensorConfiguration = {};
sensorTypes.forEach((sensorType) => {
  sensorConfiguration[sensorType] = sensorRate;
});
/** @param {BS.Device} device  */
const setupDevice = (device) => {
  console.log("setting up device");
  sensorTypes.forEach((sensorType) => {
    device.addEventListener(sensorType, (event) => {
      let data = [];
      switch (event.message.sensorType) {
        case "pressure":
          data = event.message.pressure.sensors.map(
            (sensor) => sensor.rawValue
          );
          break;
        case "linearAcceleration":
          {
            const { x, y, z } = event.message.linearAcceleration;
            data = [x, y, z];
          }
          break;
        case "gyroscope":
          {
            const { x, y, z } = event.message.gyroscope;
            data = [x, y, z];
          }
          break;
        case "magnetometer":
          {
            const { x, y, z } = event.message.magnetometer;
            data = [x, y, z];
          }
          break;
      }
      data = data.map((value) => value * sensorScalars[sensorType]);
      appendData(event.message.timestamp, sensorType, data);
    });
  });
};

const sensorScalars = {
  pressure: 1 / (2 ** 16 - 1),
  linearAcceleration: 1 / 4,
  gyroscope: 1 / 720,
  magnetometer: 1 / 2500,
};

// BUFFER
const time = 300; // ms
const numberOfSamples = time / sensorRate;
const numberOfFeaturesInEachSensorType = {};
BS.TfliteSensorTypes.forEach((sensorType) => {
  switch (sensorType) {
    case "pressure":
      numberOfFeaturesInEachSensorType[sensorType] = 8; // change to 16 for ukaton
      break;
    case "linearAcceleration":
    case "gyroscope":
    case "magnetometer":
      numberOfFeaturesInEachSensorType[sensorType] = 3;
      break;
  }
});
let numberOfFeaturesInOneSample = 0;
sensorTypes.forEach((sensorType) => {
  numberOfFeaturesInOneSample += numberOfFeaturesInEachSensorType[sensorType];
});
const numberOfFeatures = numberOfFeaturesInOneSample * numberOfSamples;
console.log({
  time,
  numberOfSamples,
  numberOfFeaturesInOneSample,
  numberOfFeatures,
});
const samples = [];
let pendingSample;
let lastTimeClassified = 0;
let lastTimeGestureRecognized = 0;
let classificationDelay = 0;
let gestureDelay = 500;
let threshold = 0.65;
let isClassifying = false;
/**
 * @param {number} timestamp
 * @param {BS.TfliteSensorType} sensorType
 * @param {number[]} data
 */
function appendData(timestamp, sensorType, data) {
  //console.log({ timestamp, sensorType, data });
  if (!pendingSample || timestamp != pendingSample.timestamp) {
    pendingSample = { timestamp };
    //console.log("pendingSample", pendingSample);
  }
  pendingSample[sensorType] = data;
  const gotAllSensorSamples = sensorTypes.every(
    (sensorType) => sensorType in pendingSample
  );
  if (gotAllSensorSamples) {
    //console.log("got all samples");
    samples.push(pendingSample);
    pendingSample = undefined;
  }

  //console.log(`collected ${samples.length} samples`);

  while (samples.length > numberOfSamples) {
    samples.shift();
  }

  if (!isClassifying && samples.length == numberOfSamples) {
    const now = Date.now();
    if (
      now - lastTimeGestureRecognized < gestureDelay ||
      now - lastTimeClassified < classificationDelay
    ) {
      return;
    }
    const features = [];
    samples.forEach((sample) => {
      const _features = [];
      sensorTypes.forEach((sensorType) => {
        _features.push(...sample[sensorType]);
        features.push(..._features);
      });
    });
    isClassifying = true;
    console.log("classifying", features);
    classify(features);
    isClassifying = false;
    lastTimeClassified = now;
  }
}
