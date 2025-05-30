import * as BS from "../../build/brilliantsole.module.js";
import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.162.0/three.module.min.js";

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
    console.log({ timestamp, data });
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
