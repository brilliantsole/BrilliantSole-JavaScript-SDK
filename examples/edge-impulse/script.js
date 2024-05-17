import BS from "../../build/brilliantsole.module.js";
//import BS.Device from "../../src/BS.Device.js";
window.BS = BS;
console.log(BS);

BS.setAllConsoleLevelFlags({ log: false });

// DEVICE

/** @typedef {import("../../build/brilliantsole.module.js").Device} Device */
/** @typedef {import("../../build/brilliantsole.module.js").SensorType} SensorType */
/** @typedef {import("../../build/brilliantsole.module.js").SensorConfiguration} SensorConfiguration */

const device = new BS.Device();
console.log({ device });
window.device = device;

// GET DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById("availableDeviceTemplate");
const availableDevicesContainer = document.getElementById("availableDevices");
/** @param {Device[]} availableDevices */
function onAvailableDevices(availableDevices) {
    availableDevicesContainer.innerHTML = "";
    if (availableDevices.length == 0) {
        availableDevicesContainer.innerText = "no devices available";
    } else {
        availableDevices.forEach((availableDevice) => {
            const availableDeviceContainer = availableDeviceTemplate.content
                .cloneNode(true)
                .querySelector(".availableDevice");
            availableDeviceContainer.querySelector(".name").innerText = availableDevice.name;
            availableDeviceContainer.querySelector(".type").innerText = availableDevice.type;

            /** @type {HTMLButtonElement} */
            const toggleConnectionButton = availableDeviceContainer.querySelector(".toggleConnection");
            toggleConnectionButton.addEventListener("click", () => {
                device.connectionManager = availableDevice.connectionManager;
                device.reconnect();
            });
            device.addEventListener("connectionStatus", () => {
                toggleConnectionButton.disabled = device.connectionStatus != "not connected";
            });
            toggleConnectionButton.disabled = device.connectionStatus != "not connected";

            availableDevicesContainer.appendChild(availableDeviceContainer);
        });
    }
}
async function getDevices() {
    const availableDevices = await BS.Device.GetDevices();
    if (!availableDevices) {
        return;
    }
    onAvailableDevices(availableDevices);
}

BS.Device.AddEventListener("availableDevices", (event) => {
    const devices = event.message.devices;
    onAvailableDevices(devices);
});
getDevices();

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
    switch (device.connectionStatus) {
        case "not connected":
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
        case "not connected":
            toggleConnectionButton.disabled = false;
            toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "connect";
            break;
        case "connecting":
        case "disconnecting":
            toggleConnectionButton.disabled = true;
            toggleConnectionButton.innerText = device.connectionStatus;
            break;
    }
});

/** @type {HTMLInputElement} */
const reconnectOnDisconnectionCheckbox = document.getElementById("reconnectOnDisconnection");
reconnectOnDisconnectionCheckbox.addEventListener("input", () => {
    device.reconnectOnDisconnection = reconnectOnDisconnectionCheckbox.checked;
});

// DEVICE INFORMATION

/** @type {HTMLPreElement} */
const deviceInformationPre = document.getElementById("deviceInformationPre");
device.addEventListener("deviceInformation", () => {
    deviceInformationPre.textContent = JSON.stringify(device.deviceInformation, null, 2);
});

/** @type {HTMLPreElement} */
const sensorConfigurationPre = document.getElementById("sensorConfigurationPre");
device.addEventListener("getSensorConfiguration", () => {
    sensorConfigurationPre.textContent = JSON.stringify(device.sensorConfiguration, null, 2);
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

/** @type {SensorType[]} */
let sensorTypes = [];
/** @param {SensorType[]} newSensorTypes */
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

BS.Device.TfliteSensorTypes.forEach((sensorType) => {
    const sensorTypeContainer = sensorTypeTemplate.content.cloneNode(true).querySelector(".sensorType");
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
    const sensorTypes = BS.Device.TfliteSensorTypes.filter((sensorType) => {
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
    toggleSamplingButton.innerText = isSampling ? "sampling..." : "start sampling";
}

["isSampling", "remoteManagementConnection", "sensortypes", "label"].forEach((eventType) => {
    window.addEventListener(eventType, () => {
        updateToggleSamplingButton();
    });
});
device.addEventListener("isConnected", () => {
    updateToggleSamplingButton();
});

async function sampleAndUpload() {
    /** @type {SensorConfiguration} */
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
    await uploadData(sensorTypes, deviceData);
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
                reject("No projects found: " + x.status + " - " + JSON.stringify(x.response));
            } else {
                if (!x.response.success) {
                    reject(x.response.error);
                } else {
                    const projects = x.response.projects;
                    console.log("projects", projects);
                    resolve(projects);
                    window.dispatchEvent(new CustomEvent("edgeImpulseProjects", { detail: { projects } }));
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
                reject("No projects found: " + x.status + " - " + JSON.stringify(x.response));
            } else {
                if (!x.response.success) {
                    reject(x.response.error);
                } else {
                    const project = x.response;
                    console.log("project", project);
                    resolve(project);
                    window.dispatchEvent(new CustomEvent("edgeImpulseProject", { detail: { project } }));
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
                reject("No development keys found: " + x.status + " - " + JSON.stringify(x.response));
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
            console.log("ping");
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
        console.log("remoteManagementWebSocket.message", event.data);

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

            /** @type {SensorType[]} */
            const sensorTypes = samplingDetails.sensor.split(sensorCombinationSeparator);
            console.log("sensorTypes", sensorTypes);

            const invalidSensors = sensorTypes.filter(
                (sensorType) => !device.allowedTfliteSensorTypes.includes(sensorType)
            );
            if (invalidSensors.length > 0) {
                console.error("invalid sensorTypes", invalidSensors);
                return;
            }

            const numberOfSamples = samplingDetails.length / samplingDetails.interval;
            setNumberOfSamples(numberOfSamples);
            setSensorTypes(sensorTypes);
            setSamplingInterval(samplingDetails.interval);
            setSamplingLength(samplingDetails.length);
            setLabel(samplingDetails.label);
            setHmacKey(samplingDetails.hmacKey);
            setPath(samplingDetails.path);

            sampleAndUpload();

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

async function parseRemoteManagementMessage(event) {
    if (event.data instanceof Blob) {
        return await readFile(event.data);
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
    const sensors = device.allowedTfliteSensorTypes;
    const sensorCombinations = generateSubarrays(sensors);
    console.log("sensorCombinations", sensorCombinations);
    return {
        hello: {
            version: 3,
            apiKey: apiKey,
            deviceId: getDeviceId(),
            deviceType: "BrilliantSole",
            connection: "ip",
            sensors: sensorCombinations.map((sensorCombination) => {
                return {
                    name: sensorCombination,
                    maxSampleLengthS: 1 * 60,
                    frequencies: [50.0, 25.0, 12.5], // 20ms, 40ms, 80ms
                };
            }),
            supportsSnapshotStreaming: false,
        },
    };
}

function isRemoteManagementConnected() {
    return remoteManagementWebSocket?.readyState == WebSocket.OPEN && remoteManagementWebSocket?._isConnected;
}

/** @type {HTMLButtonElement} */
const toggleRemoteManagementConnectionButton = document.getElementById("toggleRemoteManagementConnection");
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
reconnectRemoteManagementOnDisconnectionInput.addEventListener("input", (event) => {
    setReconnectRemoteManagementOnDisconnection(event.target.checked);
});
reconnectRemoteManagementOnDisconnectionInput.checked = reconnectRemoteManagementOnDisconnection;
/** @param {boolean} newReconnectRemoteManagementOnDisconnection */
function setReconnectRemoteManagementOnDisconnection(newReconnectRemoteManagementOnDisconnection) {
    reconnectRemoteManagementOnDisconnection = newReconnectRemoteManagementOnDisconnection;
    console.log({ reconnectRemoteManagementOnDisconnection });
    dispatchEvent(new Event("reconnectRemoteManagementOnDisconnection"));
}

// DATA COLLECTION

const scalars = {
    pressure: 1 / (2 ** 16 - 1),
    linearAcceleration: 1 / 4,
    gyroscope: 1 / 720,
    magnetometer: 1 / 2500,
};

/** @typedef {Object.<string, number>} SensorData */
/** @typedef {Object.<string, SensorData[]>} DeviceData */

/**
 * @param {SensorType[]} sensorTypes
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
            /** @type {SensorType} */
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
 * @param {SensorType[]} sensorTypes
 * @param {DeviceData} deviceData
 */
async function uploadData(sensorTypes, deviceData) {
    const sensors = sensorTypes.flatMap((sensorType) => {
        let names = [];
        let units;
        switch (sensorType) {
            case "linearAcceleration":
            case "gyroscope":
            case "magnetometer":
                names = ["x", "y", "z"].map((component) => `${sensorType}.${component}`);
                switch (sensorType) {
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
                case "linearAcceleration":
                case "gyroscope":
                case "magnetometer":
                    ["x", "y", "z"].forEach((component) => {
                        value.push(sensorSamples[sampleIndex][component] * scalar);
                    });
                    break;
                case "pressure":
                    for (let pressureIndex = 0; pressureIndex < device.numberOfPressureSensors; pressureIndex++) {
                        value.push(sensorSamples[sampleIndex].sensors[pressureIndex].rawValue * scalar);
                    }
                    break;
                default:
                    throw `uncaught sensorType ${sensorType}`;
            }
        });

        values.push(value);
    }

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
    formData.append("message", new Blob([JSON.stringify(data)], { type: "application/json" }), "message.json");

    return new Promise((resolve, reject) => {
        let xml = new XMLHttpRequest();
        xml.onload = () => {
            if (xml.status === 200) {
                resolve(xml.responseText);
            } else {
                reject("Failed to upload (status code " + xml.status + "): " + xml.responseText);
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
    const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(JSON.stringify(data)));
    // Convert back to Hex
    const b = new Uint8Array(signature);
    return Array.prototype.map.call(b, (x) => ("00" + x.toString(16)).slice(-2)).join("");
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
        !loadedConfig || Object.entries(loadedConfig).some(([key, value]) => config[key] != value);
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
