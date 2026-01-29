import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log(BS);

// MODEL
var classifier = new EdgeImpulseClassifier();
await classifier.init();
window.classifier = classifier;
console.log("classifier", classifier);

const properties = classifier.getProperties();
const { frame_sample_count, input_features_count, input_width, input_height } =
  properties;
console.log("properties", properties);
let project = classifier.getProjectInfo();
document.querySelector("h1").textContent =
  project.owner +
  " / " +
  project.name +
  " (version " +
  project.deploy_version +
  ")";

/** @param {number[]} features */
function classify(features) {
  try {
    console.log("classifying", features.length);
    let res = classifier.classify(features);
    document.querySelector("#results").textContent = JSON.stringify(
      res,
      null,
      4
    );
    console.log(res);
    return res;
  } catch (ex) {
    alert("Failed to classify: " + (ex.message || ex.toString()));
  }
}

// DEVICE

const device = new BS.Device();
console.log({ device });
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

// SENSOR CONFIG

const sensorRate = 20;
/** @type {BS.TfliteSensorType[]} */
const sensorTypes = [];
if (properties.sensor == 3) {
  sensorTypes.push("camera");
} else if (properties.sensor == 1) {
  sensorTypes.push("microphone");
} else if (properties.sensor == 6) {
  sensorTypes.push("linearAcceleration", "gyroscope");
}
console.log("sensorTypes", sensorTypes);
/** @type {BS.SensorConfiguration} */
const sensorConfiguration = {};
sensorTypes.forEach((sensorType) => {
  sensorConfiguration[sensorType] = sensorRate;
  device.addEventListener(sensorType, (event) => {
    let data = [];
    switch (event.message.sensorType) {
      case "pressure":
        data = event.message.pressure.sensors.map((sensor) => sensor.rawValue);
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

device.addEventListener("connected", () => {
  device.setSensorConfiguration(sensorConfiguration);
});

// CAMERA
const imageSideLength = 96;
/** @type {HTMLCanvasElement} */
const cameraImageCanvas = document.getElementById("cameraImage");
cameraImageCanvas.width = cameraImageCanvas.height = imageSideLength;
const cameraImageContext = cameraImageCanvas.getContext("2d");

/** @type {HTMLCanvasElement} */
const cameraImageResultsCanvas = document.getElementById("cameraImageResults");
cameraImageResultsCanvas.width = cameraImageResultsCanvas.height =
  imageSideLength;
const cameraImageResultsContext = cameraImageResultsCanvas.getContext("2d");

device.addEventListener("cameraImage", async (event) => {
  const { blob, url } = event.message;
  const imageBitmap = await createImageBitmap(blob);

  const scale = Math.max(
    imageSideLength / imageBitmap.width,
    imageSideLength / imageBitmap.height
  );

  const drawWidth = imageBitmap.width * scale;
  const drawHeight = imageBitmap.height * scale;

  const offsetX = (cameraImageCanvas.width - drawWidth) / 2;
  const offsetY = (cameraImageCanvas.height - drawHeight) / 2;

  cameraImageContext.drawImage(
    imageBitmap,
    offsetX,
    offsetY,
    drawWidth,
    drawHeight
  );

  if (sensorTypes.includes("camera")) {
    console.log("classifying image");

    // Extract pixel data (RGBA)
    const imageData = cameraImageContext.getImageData(
      0,
      0,
      cameraImageCanvas.width,
      cameraImageCanvas.height
    );
    const rgba = imageData.data;

    // Convert to hex RGB per pixel
    const features = new Array(rgba.length / 4);
    let j = 0;

    for (let i = 0; i < rgba.length; i += 4) {
      const r = rgba[i];
      const g = rgba[i + 1];
      const b = rgba[i + 2];

      features[j++] =
        "0x" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0");
    }

    const res = classify(features);
    if (res) {
      cameraImageResultsContext.clearRect(
        0,
        0,
        cameraImageResultsCanvas.width,
        cameraImageResultsCanvas.height
      );
      cameraImageResultsContext.lineWidth = 3;
      cameraImageResultsContext.strokeStyle = "red";
      res.results.forEach((result) => {
        if ("x" in result) {
          const { x, y, width, height } = result;
          cameraImageResultsContext.strokeRect(x, y, width, height);
        }
      });
    }
  }
});

const autoPictureCheckbox = document.getElementById("autoPicture");
autoPictureCheckbox.addEventListener("input", () => {
  device.autoPicture = autoPictureCheckbox.checked;
});
device.addEventListener("autoPicture", () => {
  autoPictureCheckbox.checked = device.autoPicture;
});
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  device.takePicture();
});
device.addEventListener("isConnected", () => {
  takePictureButton.disabled =
    !device.isConnected || !device.hasCamera || !sensorTypes.includes("camera");
});
device.addEventListener("connected", () => {
  if (device.hasCamera && sensorTypes.includes("camera")) {
    device.setCameraConfiguration({
      resolution: input_width,
      qualityFactor: 40,
    });
  }
});
device.addEventListener("cameraStatus", () => {
  takePictureButton.innerText =
    device.cameraStatus == "takingPicture" ? "taking picture" : "take picture";
});

// MICROPHONE
let microphoneSamples = [];
device.addEventListener("microphoneData", (event) => {
  const { samples, sampleRate, bitDepth } = event.message;
  microphoneSamples.push(
    ...Array.from(samples).map((value) =>
      Math.round(value * (value > 0 ? 32767 : 32768))
    )
  );
  if (microphoneSamples.length > frame_sample_count) {
    microphoneSamples = microphoneSamples.slice(-frame_sample_count);
  }
  if (microphoneSamples.length == frame_sample_count) {
    console.log("classify microphoneSamples", microphoneSamples);
    classify(microphoneSamples);
  }
});
const toggleMicrophoneButton = document.getElementById("toggleMicrophone");
toggleMicrophoneButton.addEventListener("click", () => {
  device.toggleMicrophone();
});
device.addEventListener("isConnected", () => {
  toggleMicrophoneButton.disabled =
    !device.isConnected ||
    !device.hasMicrophone ||
    !sensorTypes.includes("microphone");
});
device.addEventListener("microphoneStatus", () => {
  toggleMicrophoneButton.innerText =
    device.microphoneStatus == "streaming"
      ? "stop microphone"
      : "start microphone";
});

// SENSOR SCALARS
const sensorScalars = {
  pressure: 1 / (2 ** 16 - 1),
  linearAcceleration: 1 / 4,
  gyroscope: 1 / 720,
  magnetometer: 1 / 2500,
};

// BUFFER
const time = 600; // ms
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

const featuresInput = document.getElementById("features");
const runInferenceButton = document.getElementById("run-inference");
runInferenceButton.addEventListener("click", () => {
  classify(featuresInput.value.split(","));
});
