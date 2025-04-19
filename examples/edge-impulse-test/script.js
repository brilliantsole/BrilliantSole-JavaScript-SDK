import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log(BS);

// MODEL
var classifier = new EdgeImpulseClassifier();
await classifier.init();
window.classifier = classifier;

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
    let res = classifier.classify(features);
    document.querySelector("#results").textContent = JSON.stringify(
      res,
      null,
      4
    );
    console.log(res);
    const didPinch = res.results[1].value > 0.5;
    if (didPinch) {
      console.log("PINCH!");
      lastTimeGestureRecognized = Date.now();
    }
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
const sensorTypes = ["linearAcceleration", "gyroscope"];
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
