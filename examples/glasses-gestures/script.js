import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log(BS);

// MODEL
var classifier = new EdgeImpulseClassifier();
await classifier.init();
window.classifier = classifier;

let project = classifier.getProjectInfo();
document.querySelector("#title").textContent =
  project.owner +
  " / " +
  project.name +
  " (version " +
  project.deploy_version +
  ")";

const gestureTitle = document.getElementById("gesture");

let threshold = 0.5;
/** @param {number[]} features */
function classify(features) {
  try {
    let res = classifier.classify(features);
    document.querySelector("#results").textContent = JSON.stringify(
      res,
      null,
      4
    );
    res.results.forEach(({ label, value }, index) => {
      if (index == 0) {
        return;
      }
      if (value > threshold) {
        const gesture = label.split("_")[1];
        console.log({ gesture });
        if (true) {
          gestureTitle.innerText = gesture;
        } else {
          gestureTitle.innerText = `detected "${gesture}" gesture (score: ${value.toFixed(
            2
          )})`;
        }

        setTimeout(() => {
          gestureTitle.innerText = "";
        }, gestureDelay - 100);
        lastTimeGestureRecognized = Date.now();
      }
    });
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
/** @type {BS.SensorType[]} */
const sensorTypes = ["acceleration"];
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
      case "acceleration":
        {
          const { x, y, z } = event.message.acceleration;
          data = [x, y, z];
        }
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
  acceleration: 1 / 4,
  linearAcceleration: 1 / 4,
  gyroscope: 1 / 720,
  magnetometer: 1 / 2500,
};

// BUFFER
const time = 600; // ms
const numberOfSamples = time / sensorRate;
const numberOfFeaturesInEachSensorType = {};
BS.SensorTypes.forEach((sensorType) => {
  switch (sensorType) {
    case "pressure":
      numberOfFeaturesInEachSensorType[sensorType] = 8; // change to 16 for ukaton
      break;
    case "linearAcceleration":
    case "acceleration":
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
let gestureDelay = 1000;
let isClassifying = false;
/**
 * @param {number} timestamp
 * @param {BS.SensorType} sensorType
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
    //console.log("classifying", features);
    classify(features);
    isClassifying = false;
    lastTimeClassified = now;
  }
}
