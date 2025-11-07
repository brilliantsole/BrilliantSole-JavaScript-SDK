import * as BS from "../../build/brilliantsole.module.js";

import * as three from "../utils/three/three.module.min.js";
/** @type {import("../utils/three/three.module.min")} */
const THREE = three;
window.THREE = THREE;

window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

let device = new BS.Device();
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

/** @param {BS.Device} connectedDevice */
function onConnectedDevice(connectedDevice) {
  device = connectedDevice;
  device.addEventListener("getSensorConfiguration", () => {
    onSensorConfiguration(device);
  });
  updateSensorRateInputs(device);
  onSensorConfiguration(device);
  addSensorDataEventListeners(device);
}

// SENSOR CONFIGURATION
/** @type {HTMLTemplateElement} */
const sensorTypeConfigurationTemplate = document.getElementById(
  "sensorTypeConfigurationTemplate"
);
BS.ContinuousSensorTypes.forEach((sensorType) => {
  const sensorTypeConfigurationContainer =
    sensorTypeConfigurationTemplate.content
      .cloneNode(true)
      .querySelector(".sensorTypeConfiguration");
  sensorTypeConfigurationContainer.querySelector(".sensorType").innerText =
    sensorType;

  /** @type {HTMLInputElement} */
  const sensorRateInput =
    sensorTypeConfigurationContainer.querySelector(".sensorRate");
  sensorRateInput.value = 0;
  sensorRateInput.max = BS.MaxSensorRate;
  sensorRateInput.step = BS.SensorRateStep;
  sensorRateInput.addEventListener("input", () => {
    const sensorRate = Number(sensorRateInput.value);
    console.log({ sensorType, sensorRate });
    device.setSensorConfiguration({ [sensorType]: sensorRate });
  });

  sensorTypeConfigurationTemplate.parentElement.appendChild(
    sensorTypeConfigurationContainer
  );
  sensorTypeConfigurationContainer.dataset.sensorType = sensorType;
});
/** @param {BS.Device} device */
function onSensorConfiguration(device) {
  BS.SensorTypes.forEach((sensorType) => {
    const sensorRate = device.sensorConfiguration[sensorType] ?? 0;

    /** @type {HTMLInputElement?} */
    const input = document.querySelector(
      `.sensorTypeConfiguration[data-sensor-type="${sensorType}"] .input`
    );
    if (input) {
      input.value = sensorRate;
    }
    const chartContainer = chartContainers[sensorType];
    if (chartContainer) {
      const _chartContainers = [chartContainer];
      switch (sensorType) {
        case "gameRotation":
        case "rotation":
          _chartContainers.push(chartContainers[`${sensorType}.euler`]);
          break;
        case "pressure":
          _chartContainers.push(chartContainers["pressureMetadata"]);
          break;
        case "linearAcceleration":
          {
            let isEnabled =
              sensorRate != 0 &&
              (device.sensorConfiguration.gameRotation ||
                device.sensorConfiguration.rotation);
            chartContainers[`${sensorType}.corrected`].style.display = isEnabled
              ? ""
              : "none";
            chartContainers[`${sensorType}.velocity`].style.display = isEnabled
              ? ""
              : "none";
            chartContainers[`${sensorType}.position`].style.display = isEnabled
              ? ""
              : "none";
          }
          break;

        case "gyroscope":
          {
            let isEnabled =
              sensorRate != 0 &&
              (device.sensorConfiguration.gameRotation ||
                device.sensorConfiguration.rotation);
            chartContainers[`${sensorType}.corrected`].style.display = isEnabled
              ? ""
              : "none";
          }
          break;
        case "magnetometer":
          {
            let isEnabled =
              sensorRate != 0 &&
              (device.sensorConfiguration.gameRotation ||
                device.sensorConfiguration.rotation);
            chartContainers[`${sensorType}.corrected`].style.display = isEnabled
              ? ""
              : "none";
          }
          break;
      }
      _chartContainers.forEach((chartContainer) => {
        const display = sensorRate == 0 ? "none" : "";
        chartContainer.style.display = display;
      });
    }
  });
}
/** @param {BS.Device} device */
function updateSensorRateInputs(device) {
  BS.SensorTypes.forEach((sensorType) => {
    /** @type {HTMLInputElement?} */
    const input = document.querySelector(
      `[data-sensor-type="${sensorType}"] .input`
    );
    if (input) {
      const containsSensorType = sensorType in device.sensorConfiguration;
      input.closest("label").style.display = containsSensorType ? "" : "none";
      input.disabled = !device.isConnected || !containsSensorType;
    }
  });
}

// GRAPHING

let borderWidth = 5;

const charts = {};
window.charts = charts;

/**
 * @typedef range
 * @type {object}
 * @property {number} min
 * @property {number} max
 */

window.maxTicks = 100;
/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} title
 * @param {string[]?} axesLabels
 * @param {range} yRange
 */
function createChart(canvas, title, axesLabels, yRange) {
  const data = {
    labels: new Array(window.maxTicks).fill(0),
    datasets: [],
  };

  axesLabels?.forEach((label) => {
    data.datasets.push({
      label,
      data: new Array(window.maxTicks).fill(0),
      radius: 0,
      borderWidth,
    });
  });

  const scales = {
    y: {
      display: false,
    },
    x: {
      display: false,
    },
  };
  if (yRange) {
    Object.assign(scales.y, yRange);
  }

  const config = {
    type: "line",
    data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: {
              //size: 20,
            },
          },
        },
        title: {
          display: true,
          text: title,
          font: {
            //size: 20,
          },
        },
      },
      scales,
    },
  };

  const chart = new Chart(canvas, config);
  charts[title] = chart;

  const appendData = (timestamp, data) => {
    //console.log({ timestamp, data });
    chart.data.labels.push(timestamp);

    if (chart.data.datasets.length == 0) {
      data.forEach((_, index) => {
        chart.data.datasets.push({
          label: index,
          data: new Array(window.maxTicks).fill(0),
          radius: 0,
          borderWidth,
        });
      });
    }

    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(data[dataset.label]);
    });

    while (chart.data.labels.length > window.maxTicks) {
      chart.data.labels.shift();
      chart.data.datasets.forEach((dataset) => {
        dataset.data.shift();
      });
    }

    chart.update("none");
  };
  chart._appendData = appendData;
  return appendData;
}

const chartsContainer = document.getElementById("charts");
/** @type {Object<string, HTMLElement>} */
const chartContainers = {};
window.chartContainers = chartContainers;

/** @type {HTMLTemplateElement} */
const chartTemplate = document.getElementById("chartTemplate");
BS.ContinuousSensorTypes.forEach((sensorType) => {
  const chartContainer = chartTemplate.content
    .cloneNode(true)
    .querySelector(".chart");
  chartsContainer.appendChild(chartContainer);
  chartContainers[sensorType] = chartContainer;

  /** @type {string[]?} */
  let axesLabels;
  switch (sensorType) {
    case "pressure":
      break;
    case "acceleration":
    case "gravity":
    case "linearAcceleration":
    case "magnetometer":
      axesLabels = ["x", "y", "z"];
      break;
    case "gyroscope":
      axesLabels = ["x", "y", "z"];
      //axesLabels = ["pitch", "yaw", "roll"];
      break;
    case "gameRotation":
    case "rotation":
      axesLabels = ["x", "y", "z", "w"];
      break;
    case "orientation":
      axesLabels = ["heading", "pitch", "roll"];
      break;
    case "barometer":
      axesLabels = ["barometer"];
      break;
    default:
      console.warn(`uncaught sensorType "${sensorType}"`);
      return;
  }

  /** @type {range?} */
  let yRange;
  switch (sensorType) {
    case "pressure":
      yRange = { min: 0, max: 1 };
      break;
    case "acceleration":
      yRange = { min: -2, max: 2 };
      break;
    case "gravity":
      yRange = { min: -1, max: 1 };
      break;
    case "linearAcceleration":
      yRange = { min: -1, max: 1 };
      break;
    case "gyroscope":
      yRange = { min: -360, max: 360 };
      break;
    case "magnetometer":
      yRange = { min: -100, max: 100 };
      break;
    case "gameRotation":
    case "rotation":
      yRange = { min: -1, max: 1 };
      break;
    case "orientation":
      yRange = { min: -360, max: 360 };
      break;
  }

  switch (sensorType) {
    case "gameRotation":
    case "rotation":
      {
        const eulerChartContainer = chartTemplate.content
          .cloneNode(true)
          .querySelector(".chart");
        chartsContainer.appendChild(eulerChartContainer);
        chartContainers[`${sensorType}.euler`] = eulerChartContainer;
        createChart(
          eulerChartContainer.querySelector("canvas"),
          sensorType + "Euler",
          ["yaw", "pitch", "roll"],
          {
            min: -Math.PI,
            max: Math.PI,
          }
        );
      }
      break;
    case "linearAcceleration":
      {
        const correctedChartContainer = chartTemplate.content
          .cloneNode(true)
          .querySelector(".chart");
        chartsContainer.appendChild(correctedChartContainer);
        chartContainers[`${sensorType}.corrected`] = correctedChartContainer;
        createChart(
          correctedChartContainer.querySelector("canvas"),
          sensorType + "Corrected",
          ["x", "y", "z"],
          yRange
        );

        const velocityChartContainer = chartTemplate.content
          .cloneNode(true)
          .querySelector(".chart");
        chartsContainer.appendChild(velocityChartContainer);
        chartContainers[`${sensorType}.velocity`] = velocityChartContainer;
        createChart(
          velocityChartContainer.querySelector("canvas"),
          sensorType + "Velocity",
          ["x", "y", "z"],
          {
            min: -0.4,
            max: 0.4,
          }
        );

        const positionChartContainer = chartTemplate.content
          .cloneNode(true)
          .querySelector(".chart");
        chartsContainer.appendChild(positionChartContainer);
        chartContainers[`${sensorType}.position`] = positionChartContainer;
        createChart(
          positionChartContainer.querySelector("canvas"),
          sensorType + "Position",
          ["x", "y", "z"],
          {
            min: -0.1,
            max: 0.1,
          }
        );
      }
      break;
    case "gyroscope":
      {
        const correctedChartContainer = chartTemplate.content
          .cloneNode(true)
          .querySelector(".chart");
        chartsContainer.appendChild(correctedChartContainer);
        chartContainers[`${sensorType}.corrected`] = correctedChartContainer;
        createChart(
          correctedChartContainer.querySelector("canvas"),
          sensorType + "Corrected",
          ["x", "y", "z"],
          yRange
        );
      }
      break;
    case "magnetometer":
      {
        const correctedChartContainer = chartTemplate.content
          .cloneNode(true)
          .querySelector(".chart");
        chartsContainer.appendChild(correctedChartContainer);
        chartContainers[`${sensorType}.corrected`] = correctedChartContainer;
        createChart(
          correctedChartContainer.querySelector("canvas"),
          sensorType + "Corrected",
          ["x", "y", "z"],
          yRange
        );
      }
      break;
    case "pressure":
      {
        const pressureMetadataChartContainer = chartTemplate.content
          .cloneNode(true)
          .querySelector(".chart");
        chartsContainer.appendChild(pressureMetadataChartContainer);
        chartContainers["pressureMetadata"] = pressureMetadataChartContainer;
        createChart(
          pressureMetadataChartContainer.querySelector("canvas"),
          "pressureMetadata",
          ["sum", "x", "y"],
          {
            min: 0,
            max: 1,
          }
        );
      }
      break;
  }

  const quaternion = new THREE.Quaternion();
  const euler = new THREE.Euler();
  euler.reorder("YXZ");

  createChart(
    chartContainer.querySelector("canvas"),
    sensorType,
    axesLabels,
    yRange
  );
});

const quaternion = new THREE.Quaternion();
const euler = new THREE.Euler();
euler.order = "YXZ";

const latestQuaternion = new THREE.Quaternion();
const yawQuaternion = new THREE.Quaternion();
let latestPositionTimestamp = 0;
const linearAccelerationVector = new THREE.Vector3();
const linearAccelerationVelocity = new THREE.Vector3();
const linearAccelerationPosition = new THREE.Vector3();

const gyroscopeVector = new THREE.Vector3();

const magnetometerVector = new THREE.Vector3();

// thresholds for each state
const linearAccelerationTrackingThresholds = {
  idle: { min: 0.2, max: 6 },
  tracking: { min: 0.4, max: 3 },
  stopping: { min: 0.2, max: 3 },
};
window.linearAccelerationTrackingThresholds =
  linearAccelerationTrackingThresholds;
/** @typedef {"idle" | "tracking" | "stopping"} TrackingState */
/** @type {TrackingState} */
let trackingState = "idle";
let trackingStateStartTime = 0;
const getTrackingStateDuration = () => Date.now() - trackingStateStartTime;

/** @param {TrackingState} newTrackingState */
const setTrackingState = (newTrackingState) => {
  if (newTrackingState == trackingState) {
    return;
  }
  trackingStateStartTime = Date.now();

  trackingState = newTrackingState;
  console.log({ trackingState });

  switch (trackingState) {
    case "idle":
      break;
    case "tracking":
      linearAccelerationVelocity.setScalar(0);
      linearAccelerationPosition.setScalar(0);
      break;
    case "stopping":
      break;
  }
};

/** @typedef {"below" | "middle" | "above"} ThresholdState */
/** @type {ThresholdState} */
let thresholdState = "below";
let thresholdStateStartTime = 0;
const getThresholdStateDuration = () => Date.now() - thresholdStateStartTime;

/** @param {ThresholdState} newThresholdState */
const setThresholdState = (newThresholdState) => {
  if (newThresholdState != thresholdState) {
    thresholdStateStartTime = Date.now();
    console.log({ thresholdState: newThresholdState });
  }
  thresholdState = newThresholdState;

  const thresholdDuration = getThresholdStateDuration();
  const stateDuration = getTrackingStateDuration();

  switch (trackingState) {
    case "idle":
      if (thresholdState != "below") {
        setTrackingState("tracking");
      }
      break;
    case "tracking":
      if (
        (thresholdState == "below" && thresholdDuration > 200) ||
        (thresholdState == "above" && stateDuration > 300)
      ) {
        setTrackingState("stopping");
      }
      break;
    case "stopping":
      if (thresholdState == "below" && thresholdDuration > 500) {
        setTrackingState("idle");
      }
      break;
  }
};

let shouldResetLinearAccelerationPosition = false;
window.resetLinearAccelerationPosition = () => {
  console.log("resetLinearAccelerationPosition");
  shouldResetLinearAccelerationPosition = true;
};

let shouldResetQuaternionYaw = false;
window.resetQuaternionYaw = () => {
  console.log("shouldResetQuaternionYaw");
  shouldResetQuaternionYaw = true;
};

document.addEventListener("keypress", (event) => {
  switch (event.key) {
    case "c":
      resetLinearAccelerationPosition();
      break;
    case "y":
      resetQuaternionYaw();
      break;
  }
});

/** @param {BS.Device} device */
function addSensorDataEventListeners(device) {
  BS.ContinuousSensorTypes.forEach((sensorType) => {
    const chart = charts[sensorType];
    if (!chart) {
      return;
    }
    const appendData = chart._appendData;
    device.addEventListener(sensorType, (event) => {
      let { timestamp, [sensorType]: data } = event.message;

      if (sensorType == "pressure") {
        /** @type {BS.PressureData} */
        let pressure = data;
        data = pressure.sensors.map((sensor) => sensor.normalizedValue);
      }

      appendData(timestamp, data);

      switch (sensorType) {
        case "gameRotation":
        case "rotation":
          quaternion.copy(data);
          euler.setFromQuaternion(quaternion);
          charts[sensorType + "Euler"]._appendData(timestamp, {
            pitch: euler.x,
            yaw: euler.y,
            roll: euler.z,
          });

          if (shouldResetQuaternionYaw) {
            shouldResetQuaternionYaw = false;
            euler.x = euler.z = 0;
            yawQuaternion.setFromEuler(euler).invert();
          }
          latestQuaternion.copy(quaternion).multiply(yawQuaternion);

          break;
        case "pressure":
          {
            /** @type {BS.PressureData} */
            let pressure = event.message.pressure;
            charts.pressureMetadata._appendData(timestamp, {
              sum: pressure.normalizedSum,
              x: pressure.normalizedCenter?.x || 0,
              y: pressure.normalizedCenter?.y || 0,
            });
          }
          break;
        case "linearAcceleration":
          {
            if (
              device.sensorConfiguration.gameRotation ||
              device.sensorConfiguration.rotation
            ) {
              if (shouldResetLinearAccelerationPosition) {
                shouldResetLinearAccelerationPosition = false;
                linearAccelerationVector.setScalar(0);
                linearAccelerationVelocity.setScalar(0);
                linearAccelerationPosition.setScalar(0);
              }

              linearAccelerationVector.copy(data);
              linearAccelerationVector.applyQuaternion(latestQuaternion);

              //console.log("linearAccelerationVector", linearAccelerationVector);

              const timestampDifference =
                latestPositionTimestamp == 0
                  ? device.sensorConfiguration.linearAcceleration
                  : timestamp - latestPositionTimestamp;
              latestPositionTimestamp = timestamp;
              const timestampDifferenceScalar = timestampDifference / 1000;

              const linearAccelerationLength =
                linearAccelerationVector.length();
              const { min, max } =
                linearAccelerationTrackingThresholds[trackingState];
              const belowMin = linearAccelerationLength < min;
              const aboveMax = linearAccelerationLength > max;
              setThresholdState(
                belowMin ? "below" : aboveMax ? "above" : "middle"
              );

              if (trackingState == "tracking") {
                linearAccelerationVelocity.addScaledVector(
                  linearAccelerationVector,
                  timestampDifferenceScalar
                );
                linearAccelerationPosition.addScaledVector(
                  linearAccelerationVelocity,
                  timestampDifferenceScalar
                );
              }

              charts[sensorType + "Corrected"]._appendData(timestamp, {
                x: linearAccelerationVector.x,
                y: linearAccelerationVector.y,
                z: linearAccelerationVector.z,
              });
              if (trackingState == "tracking") {
                charts[sensorType + "Velocity"]._appendData(timestamp, {
                  x: linearAccelerationVelocity.x,
                  y: linearAccelerationVelocity.y,
                  z: linearAccelerationVelocity.z,
                });
                charts[sensorType + "Position"]._appendData(timestamp, {
                  x: linearAccelerationPosition.x,
                  y: linearAccelerationPosition.y,
                  z: linearAccelerationPosition.z,
                });
              }

              //console.log({ timestampDifference, timestampDifferenceScalar });
            }
          }
          break;
        case "gyroscope":
          {
            if (
              device.sensorConfiguration.gameRotation ||
              device.sensorConfiguration.rotation
            ) {
              gyroscopeVector.copy(data);
              gyroscopeVector.applyQuaternion(latestQuaternion);

              //console.log("gyroscopeVector", gyroscopeVector);

              charts[sensorType + "Corrected"]._appendData(timestamp, {
                x: gyroscopeVector.x,
                y: gyroscopeVector.y,
                z: gyroscopeVector.z,
              });
            }
          }
          break;
        case "magnetometer":
          {
            if (
              device.sensorConfiguration.gameRotation ||
              device.sensorConfiguration.rotation
            ) {
              magnetometerVector.copy(data);
              magnetometerVector.applyQuaternion(latestQuaternion);

              //console.log("magnetometerVector", magnetometerVector);

              charts[sensorType + "Corrected"]._appendData(timestamp, {
                x: magnetometerVector.x,
                y: magnetometerVector.y,
                z: magnetometerVector.z,
              });
            }
          }
          break;
      }
    });
  });
}

// TESTING

/**
 * @param {number} min
 * @param {number} max
 */
function randomValueBetween(min, max) {
  const range = max - min;
  return min + Math.random() * range;
}

let interval = 10;
let timestamp = 0;
if (false)
  window.setInterval(() => {
    charts.acceleration._appendData(timestamp, {
      x: randomValueBetween(-1, 1),
      y: randomValueBetween(-1, 1),
      z: randomValueBetween(-1, 1),
    });

    timestamp += interval;
  }, interval);

// SERVER

const websocketClient = new BS.WebSocketClient();
/** @type {HTMLButtonElement} */
const toggleServerConnectionButton = document.getElementById(
  "toggleServerConnection"
);
toggleServerConnectionButton.addEventListener("click", () => {
  websocketClient.toggleConnection();
});
websocketClient.addEventListener("isConnected", () => {
  toggleServerConnectionButton.innerText = websocketClient.isConnected
    ? "disconnect from server"
    : "connect to server";
});
websocketClient.addEventListener("connectionStatus", () => {
  let disabled;
  switch (websocketClient.connectionStatus) {
    case "notConnected":
    case "connected":
      disabled = false;
      break;
    case "connecting":
    case "disconnecting":
      disabled = true;
      break;
  }
  toggleServerConnectionButton.disabled = disabled;
});

BS.DeviceManager.AddEventListener("connectedDevices", (event) => {
  const { connectedDevices } = event.message;
  const connectedDevice = connectedDevices[0];
  if (!connectedDevice) {
    return;
  }
  onConnectedDevice(connectedDevice);
});
