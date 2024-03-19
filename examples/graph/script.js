import BS from "../../build/brilliantsole.module.js";
import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.162.0/three.module.min.js";

window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

const insole = new BS.Device();
console.log({ insole });
window.insole = insole;

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
    switch (insole.connectionStatus) {
        case "not connected":
            insole.connect();
            break;
        case "connected":
            insole.disconnect();
            break;
    }
});
insole.addEventListener("connectionStatus", () => {
    switch (insole.connectionStatus) {
        case "connected":
        case "not connected":
            toggleConnectionButton.disabled = false;
            toggleConnectionButton.innerText = insole.isConnected ? "disconnect" : "connect";
            break;
        case "connecting":
        case "disconnecting":
            toggleConnectionButton.disabled = true;
            toggleConnectionButton.innerText = insole.connectionStatus;
            break;
    }
});

// SENSOR CONFIGURATION

/** @type {HTMLTemplateElement} */
const sensorTypeConfigurationTemplate = document.getElementById("sensorTypeConfigurationTemplate");
BS.Device.SensorTypes.forEach((sensorType) => {
    const sensorTypeConfigurationContainer = sensorTypeConfigurationTemplate.content
        .cloneNode(true)
        .querySelector(".sensorTypeConfiguration");
    sensorTypeConfigurationContainer.querySelector(".sensorType").innerText = sensorType;

    /** @type {HTMLInputElement} */
    const sensorRateInput = sensorTypeConfigurationContainer.querySelector(".sensorRate");
    sensorRateInput.value = 0;
    sensorRateInput.max = BS.Device.MaxSensorRate;
    sensorRateInput.step = BS.Device.SensorRateStep;
    sensorRateInput.addEventListener("input", () => {
        const sensorRate = Number(sensorRateInput.value);
        console.log({ sensorType, sensorRate });
        insole.setSensorConfiguration({ [sensorType]: sensorRate });
    });

    sensorTypeConfigurationTemplate.parentElement.appendChild(sensorTypeConfigurationContainer);
    sensorTypeConfigurationContainer.dataset.sensorType = sensorType;
});
insole.addEventListener("getSensorConfiguration", () => {
    for (const sensorType in insole.sensorConfiguration) {
        document.querySelector(`.sensorTypeConfiguration[data-sensor-type="${sensorType}"] input`).value =
            insole.sensorConfiguration[sensorType];
    }
});
insole.addEventListener("isConnected", () => {
    for (const sensorType in insole.sensorConfiguration) {
        document.querySelector(`[data-sensor-type="${sensorType}"] input`).disabled = !insole.isConnected;
    }
});

// GRAPHING

/** @typedef {import("../../build/brilliantsole.module.js").SensorType} SensorType */

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
 * @param {string[]} axesLabels
 * @param {range} yRange
 */
function createChart(canvas, title, axesLabels, yRange) {
    const data = {
        labels: new Array(window.maxTicks).fill(0),
        datasets: [],
    };

    axesLabels.forEach((label) => {
        data.datasets.push({
            label,
            data: new Array(window.maxTicks).fill(0),
            radius: 0,
            borderWidth: 2,
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

/** @type {HTMLTemplateElement} */
const chartTemplate = document.getElementById("chartTemplate");
BS.Device.SensorTypes.forEach((sensorType) => {
    const chartContainer = chartTemplate.content.cloneNode(true).querySelector(".chart");
    chartsContainer.appendChild(chartContainer);

    /** @type {string[]} */
    let axesLabels;
    switch (sensorType) {
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
        case "pressure":
            axesLabels = BS.Device.PressureSensorNames.slice();
            break;
        default:
            console.warn(`uncaught sensorType "${sensorType}"`);
            return;
    }

    /** @type {range?} */
    let yRange;
    switch (sensorType) {
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
            // FILL
            break;
        case "gameRotation":
        case "rotation":
            yRange = { min: -1, max: 1 };
            break;
    }

    switch (sensorType) {
        case "gameRotation":
        case "rotation":
            {
                const eulerChartContainer = chartTemplate.content.cloneNode(true).querySelector(".chart");
                chartsContainer.appendChild(eulerChartContainer);
                createChart(
                    eulerChartContainer.querySelector("canvas"),
                    sensorType + "Euler",
                    ["yaw", "pitch", "roll"],
                    { min: -Math.PI, max: Math.PI }
                );
            }
            break;
        case "pressure":
            {
                const pressureMetadataChartContainer = chartTemplate.content.cloneNode(true).querySelector(".chart");
                chartsContainer.appendChild(pressureMetadataChartContainer);
                createChart(
                    pressureMetadataChartContainer.querySelector("canvas"),
                    "pressureMetadata",
                    ["sum", "x", "y"],
                    { min: 0, max: 1 }
                );
            }
            break;
    }

    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    euler.reorder("YXZ");

    const appendData = createChart(chartContainer.querySelector("canvas"), sensorType, axesLabels, yRange);
    insole.addEventListener(sensorType, (event) => {
        let { timestamp, [sensorType]: data } = event.message;
        if (sensorType == "pressure") {
            data = data.sensors;
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
                /** @type {import("../../build/brilliantsole.module.js").PressureData} */
                const pressure = event.message.pressure;
                charts.pressureMetadata._appendData(timestamp, {
                    sum: pressure.normalizedSum,
                    x: pressure.calibratedCenter.x,
                    y: pressure.calibratedCenter.y,
                });
                break;
        }
    });
});

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
