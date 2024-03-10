import BS from "../../build/brilliantsole.module.js";
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

/** @type {HTMLPreElement} */
const sensorConfigurationPre = document.getElementById("sensorConfigurationPre");
insole.addEventListener("getSensorConfiguration", () => {
    sensorConfigurationPre.textContent = JSON.stringify(insole.sensorConfiguration, null, 2);
});

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

const charts = [];

window.maxTicks = 500;
/**
 * @param {HTMLCanvasElement} canvas
 * @param {SensorType} sensorType
 */
function createChart(canvas, sensorType) {
    const data = {
        labels: new Array(window.maxTicks).fill(0),
        datasets: [],
    };
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

    if (!axesLabels) {
        console.warn(`no axesLabels defined for sensorType "${sensorType}"`);
        return;
    }

    axesLabels.forEach((label) => {
        data.datasets.push({
            label,
            data: new Array(window.maxTicks).fill(0),
            radius: 0,
            borderWidth: 2,
        });
    });

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
                    text: sensorType,
                    font: {
                        //size: 20,
                    },
                },
            },
            scales: {
                y: { display: false },
                x: { display: false },
            },
        },
    };

    const chart = new Chart(canvas, config);
    charts.push(chart);

    const appendData = (sensorDataEvent) => {
        const { timestamp, [sensorType]: data } = sensorDataEvent.message;

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
    chartContainer.dataset.sensorType = sensorType;
    chartsContainer.appendChild(chartContainer);
    const appendData = createChart(chartContainer.querySelector("canvas"), sensorType);
    insole.addEventListener(sensorType, (event) => appendData(event));
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
        charts[1]._appendData({
            message: {
                timestamp,
                acceleration: {
                    x: randomValueBetween(-1, 1),
                    y: randomValueBetween(-1, 1),
                    z: randomValueBetween(-1, 1),
                },
            },
        });

        timestamp += interval;
    }, interval);
