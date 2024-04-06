import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

const client = new BS.WebSocketClient();
console.log({ client });

window.client = client;

/** @typedef {import("../../build/brilliantsole.module.js").Device} Device */
/** @typedef {import("../../build/brilliantsole.module.js").SensorType} SensorType */

const devicePair = BS.DevicePair.shared;
window.devicePair = devicePair;

// SCENE SETUP

/** @type {HTMLElement} */
const desktopEntity = document.getElementById("desktop");

/** @type {Object.<string, HTMLElement>} */
const handTrackingControllers = {
    left: document.querySelector(".left.hand"),
    right: document.querySelector(".right.hand"),
};

/** @type {HTMLElement} */
const scene = document.querySelector("a-scene");

// HAND TRACKING

Object.entries(handTrackingControllers).forEach(([side, handTrackingController]) => {
    handTrackingController.addEventListener("fingertiptouchstarted", (event) => {
        const { fingerName, withEl, withFinger, onSameHand } = event.detail;
    });
    handTrackingController.addEventListener("fingertiptouchended", (event) => {
        const { fingerName, withEl, withFinger, onSameHand } = event.detail;
    });
});

// DOUBLE PINCH

class DebouncedFunction {
    /**
     * @param {()=>{}} callback
     * @param {number} interval
     */
    constructor(callback, interval) {
        this.#callback = callback;
        this.#interval = interval;
    }

    /** @type {number} */
    #interval;

    /** @type {()=>{}} */
    #callback;

    /** @type {number?} */
    #timeoutId = null;

    trigger() {
        this.cancel();
        this.#timeoutId = setTimeout(() => {
            this.#callback();
            this.#timeoutId = null;
        }, this.#interval);
    }

    cancel() {
        if (this.#timeoutId != null) {
            clearTimeout(this.#timeoutId);
            this.#timeoutId = null;
        }
    }
}

Object.entries(handTrackingControllers).forEach(([side, handTrackingController]) => {
    let numberOfPinches = 0;
    const resetNumberOfPinches = () => {
        numberOfPinches = 0;
    };
    const debouncedResetNumberOfPinches = new DebouncedFunction(resetNumberOfPinches, 1000);
    console.log({ side, handTrackingController });

    const onPinchStarted = () => {
        //console.log("throttled pinch");

        numberOfPinches++;
        //console.log({ side, numberOfPinches });
        if (numberOfPinches == 1) {
            debouncedResetNumberOfPinches.trigger();
        } else if (numberOfPinches == 2) {
            handTrackingController.dispatchEvent(new Event("doublepinch"));
            numberOfPinches = 0;
            debouncedResetNumberOfPinches.cancel();
        }
    };

    const throttledOnPinchStarted = AFRAME.utils.throttle(onPinchStarted, 300);

    handTrackingController.addEventListener("fingertiptouchstarted", (event) => {
        const { finger, withEl, withFinger, onSameHand } = event.detail;

        //console.log({ finger, withEl, withFinger, onSameHand });

        const isPinch = finger == "index" && onSameHand && withFinger == "thumb";
        if (!isPinch) {
            return;
        }

        throttledOnPinchStarted();
    });
});

// DESKTOP PLACEMENT

scene.addEventListener("ar-hit-test-select", (event) => {
    //console.log(event);
    setARHitTest(false);
});
function getIsARHitTestEnabled() {
    return scene.getAttribute("ar-hit-test").enabled;
}
const toggleARHitTest = () => {
    const isARHitTestEnabled = getIsARHitTestEnabled();
    setARHitTest(!isARHitTestEnabled);
};
/** @param {boolean} enabled */
const setARHitTest = (enabled) => {
    if (getIsARHitTestEnabled() == enabled) {
        return;
    }
    console.log("ar-hit-test", enabled);
    scene.setAttribute("ar-hit-test", "enabled", enabled);
    window.dispatchEvent(new CustomEvent("ar-hit-test", { detail: { enabled } }));
};
window.setARHitTest = setARHitTest;

handTrackingControllers.right.addEventListener("doublepinch", () => {
    console.log("double pinch");
    //toggleARHitTest();
});

const toggleARHitTestEntity = scene.querySelector(".toggleARHitTest");
toggleARHitTestEntity.addEventListener("click", () => {
    toggleARHitTest();
});
window.addEventListener("ar-hit-test", (event) => {
    const { enabled } = event.detail;
    let text, color;
    if (enabled) {
        text = "cancel";
        color = "red";
    } else {
        text = "move";
        color = "white";
    }
    toggleARHitTestEntity.setAttribute("fingertip-button", {
        text,
        color,
    });
});

// WEBSOCKET URL SEARCH PARAMS

const url = new URL(location);
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
client.addEventListener("isConnected", () => {
    if (client.isConnected) {
        setUrlParam("webSocketUrl", client.webSocket.url);
        webSocketUrlInput.value = client.webSocket.url;
        webSocketUrlInput.dispatchEvent(new Event("input"));
    } else {
        setUrlParam("webSocketUrl");
    }
});

// WEBSOCKET SERVER URL

/** @type {HTMLInputElement} */
const webSocketUrlInput = document.getElementById("webSocketUrl");
webSocketUrlInput.value = url.searchParams.get("webSocketUrl") || "";

const toggleSetWebSocketUrlButton = scene.querySelector(".toggleSetWebSocketUrl");
client.addEventListener("isConnected", () => {
    toggleSetWebSocketUrlButton.setAttribute("fingertip-button", {
        disabled: client.isConnected,
    });
});
toggleSetWebSocketUrlButton.addEventListener("click", () => {
    webSocketUrlInput.focus();
});
webSocketUrlInput.addEventListener("input", () => {
    toggleSetWebSocketUrlButton.setAttribute("fingertip-button", {
        text: webSocketUrlInput.value || "localhost",
    });
});
webSocketUrlInput.addEventListener("focusin", () => {
    toggleSetWebSocketUrlButton.setAttribute("fingertip-button", { color: "yellow" });
});
webSocketUrlInput.addEventListener("focusout", () => {
    toggleSetWebSocketUrlButton.setAttribute("fingertip-button", { color: "white" });
});
webSocketUrlInput.dispatchEvent(new Event("input"));

// WEBSOCKET CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
    if (client.isConnected) {
        client.disconnect();
    } else {
        /** @type {string?} */
        let webSocketUrl;
        if (webSocketUrlInput.value.length > 0) {
            webSocketUrl = webSocketUrlInput.value;
        }
        client.connect(webSocketUrl);
    }
});
client.addEventListener("connectionStatus", () => {
    switch (client.connectionStatus) {
        case "connected":
        case "not connected":
            toggleConnectionButton.disabled = false;
            toggleConnectionButton.innerText = client.isConnected ? "disconnect" : "connect";
            break;
        case "connecting":
        case "disconnecting":
            toggleConnectionButton.innerText = client.connectionStatus;
            toggleConnectionButton.disabled = true;
            break;
    }
});

const toggleConnectionEntity = scene.querySelector(".toggleConnection");
client.addEventListener("connectionStatus", (event) => {
    let disabled;
    let text;

    switch (client.connectionStatus) {
        case "connected":
        case "not connected":
            text = client.isConnected ? "disconnect" : "connect";
            disabled = false;
            break;
        case "connecting":
        case "disconnecting":
            text = client.connectionStatus;
            disabled = true;
            break;
    }

    toggleConnectionEntity.setAttribute("fingertip-button", { disabled, text });
});
toggleConnectionEntity.addEventListener("click", () => {
    /** @type {string?} */
    let webSocketUrl;
    if (webSocketUrlInput.value.length > 0) {
        webSocketUrl = webSocketUrlInput.value;
    }
    client.toggleConnection(webSocketUrl);
});

// SCANNER

/** @type {HTMLInputElement} */
const isScanningAvailableCheckbox = document.getElementById("isScanningAvailable");
client.addEventListener("isScanningAvailable", () => {
    isScanningAvailableCheckbox.checked = client.isScanningAvailable;
});

/** @type {HTMLButtonElement} */
const toggleScanButton = document.getElementById("toggleScan");
toggleScanButton.addEventListener("click", () => {
    client.toggleScan();
});
client.addEventListener("isScanningAvailable", () => {
    toggleScanButton.disabled = !client.isScanningAvailable;
});
client.addEventListener("isScanning", () => {
    toggleScanButton.innerText = client.isScanning ? "stop scanning" : "scan";
});

const toggleScanEntity = scene.querySelector(".toggleScan");
toggleScanEntity.addEventListener("click", () => {
    client.toggleScan();
});
client.addEventListener("isScanning", () => {
    toggleScanEntity.setAttribute("fingertip-button", {
        text: client.isScanning ? "stop scan" : "scan",
    });
});
client.addEventListener("isConnected", () => {
    toggleScanEntity.setAttribute("fingertip-button", {
        disabled: !client.isConnected,
    });
});

// SCREEN

const screenEntity = scene.querySelector(".screen");
const screenTitle = screenEntity.querySelector(".title");

/** @typedef {"none" | "discoveredDevices" | "availableDevices" | "devicePair"} ScreenMode */
/** @type {ScreenMode} */
let screenMode;
/** @param {ScreenMode} newScreenMode */
function setScreenMode(newScreenMode) {
    if (screenMode == newScreenMode) {
        console.log("redundant screenMode assignment", newScreenMode);
        return;
    }
    screenMode = newScreenMode;
    window.dispatchEvent(new CustomEvent("screenMode", { detail: { screenMode } }));
}

window.addEventListener("screenMode", () => {
    let showScreen = screenMode != "none";
    screenEntity.object3D.visible = showScreen;
});
setScreenMode("none");

client.addEventListener("isConnected", () => {
    if (!client.isConnected) {
        setScreenMode("none");
    }
});

window.addEventListener("screenMode", () => {
    let text = "";

    switch (screenMode) {
        case "availableDevices":
            text = "available devices";
            break;
        case "discoveredDevices":
            text = "discovered devices";
            break;
        case "devicePair":
            text = "device pair";
            break;
    }

    screenTitle.setAttribute("value", text);
});

// DISCOVERED DEVICES

/** @typedef {import("../../build/brilliantsole.module.js").DiscoveredDevice} DiscoveredDevice */

const discoveredDevicesEntity = scene.querySelector(".discoveredDevices");
/** @type {HTMLTemplateElement} */
const discoveredDeviceEntityTemplate = discoveredDevicesEntity.querySelector(".discoveredDeviceTemplate");
/** @type {Object.<string, HTMLElement>} */
let discoveredDeviceEntities = {};

const toggleShowDiscoveredDevicesEntity = scene.querySelector(".toggleShowDiscoveredDevices");
client.addEventListener("isConnected", () => {
    toggleShowDiscoveredDevicesEntity.setAttribute("fingertip-button", {
        disabled: !client.isConnected,
    });
});

toggleShowDiscoveredDevicesEntity.addEventListener("click", () => {
    if (screenMode == "discoveredDevices") {
        setScreenMode("none");
    } else {
        setScreenMode("discoveredDevices");
    }
});

client.addEventListener("discoveredDevice", (event) => {
    /** @type {DiscoveredDevice} */
    const discoveredDevice = event.message.discoveredDevice;
    let discoveredDeviceEntity = discoveredDeviceEntities[discoveredDevice.id];
    if (!discoveredDeviceEntity) {
        discoveredDeviceEntity = discoveredDeviceEntityTemplate.content
            .cloneNode(true)
            .querySelector(".discoveredDevice");

        discoveredDeviceEntity.addEventListener("click", () => {
            let device = client.devices[discoveredDevice.id];
            console.log("discoveredDeviceEntity touch");
            if (device) {
                console.log("toggle connection", device);
                device.toggleConnection();
            } else {
                device = client.connectToDevice(discoveredDevice.id);
                console.log("created", device);
            }
            onDevice(device);
        });

        const deviceIsConnectedListener = (event) => {
            /** @type {Device} */
            const device = event.message.device;
            console.log("deviceIsConnected", device);
            if (device.id != discoveredDevice.id) {
                return;
            }
            onDevice(device);
        };
        BS.Device.AddEventListener("deviceIsConnected", deviceIsConnectedListener);

        let addedEventListeners = false;
        /** @param {Device} device */
        const onDevice = (device) => {
            if (addedEventListeners) {
                return;
            }
            addedEventListeners = true;

            console.log("onDevice", device);
            device.addEventListener("connectionStatus", () => {
                updateDiscoveredDeviceEntity(discoveredDevice);
            });
            updateDiscoveredDeviceEntity(discoveredDevice);
            BS.Device.RemoveEventListener("deviceIsConnected", deviceIsConnectedListener);
        };

        let device = client.devices[discoveredDevice.id];
        if (device) {
            onDevice(device);
        }

        discoveredDeviceEntities[discoveredDevice.id] = discoveredDeviceEntity;
        discoveredDevicesEntity.appendChild(discoveredDeviceEntity);
    }

    updateDiscoveredDeviceEntity(discoveredDevice);
});

/** @param {DiscoveredDevice} discoveredDevice */
function updateDiscoveredDeviceEntity(discoveredDevice) {
    const discoveredDeviceEntity = discoveredDeviceEntities[discoveredDevice.id];
    if (!discoveredDeviceEntity) {
        console.warn(`no discoveredDeviceEntity for device id ${discoveredDevice.id}`);
        return;
    }

    const device = client.devices[discoveredDevice.id];
    const connectionStatus = device?.connectionStatus || "not connected";
    let connectMessage;
    let disabled;
    switch (connectionStatus) {
        case "connected":
        case "not connected":
            connectMessage = device?.isConnected ? "disconnect" : "connect";
            disabled = false;
            break;
        case "connecting":
        case "disconnecting":
            connectMessage = connectionStatus;
            disabled = true;
            break;
    }

    if (screenMode != "discoveredDevices") {
        disabled = true;
    }

    const text = [
        device?.name || discoveredDevice.name,
        device?.type || discoveredDevice.deviceType,
        `rssi: ${discoveredDevice.rssi}`,
        connectMessage,
    ].join("\n");

    if (discoveredDeviceEntity.hasLoaded) {
        discoveredDeviceEntity.setAttribute("fingertip-button", { text, disabled });
    } else {
        discoveredDeviceEntity.addEventListener("loaded", () => updateDiscoveredDeviceEntity(discoveredDevice), {
            once: true,
        });
    }
}

window.addEventListener("screenMode", () => {
    const isDiscoveredDevicesMode = screenMode == "discoveredDevices";
    const text = [isDiscoveredDevicesMode ? "hide" : "show", "discovered", "devices"].join("\n");
    toggleShowDiscoveredDevicesEntity.setAttribute("fingertip-button", {
        text,
    });
    discoveredDevicesEntity.object3D.visible = isDiscoveredDevicesMode;
    Object.entries(client.discoveredDevices).forEach(([deviceId, discoveredDevice]) => {
        updateDiscoveredDeviceEntity(discoveredDevice);
    });
});

/** @param {DiscoveredDevice} discoveredDevice */
function removeDiscoveredDeviceEntity(discoveredDevice) {
    const discoveredDeviceEntity = discoveredDeviceEntities[discoveredDevice.id];
    if (!discoveredDeviceEntity) {
        console.warn(`no discoveredDeviceEntity for device id ${discoveredDevice.id}`);
        return;
    }

    discoveredDeviceEntity.remove();
    delete discoveredDeviceEntities[discoveredDevice.id];
}

client.addEventListener("expiredDiscoveredDevice", (event) => {
    /** @type {DiscoveredDevice} */
    const discoveredDevice = event.message.discoveredDevice;
    removeDiscoveredDeviceEntity(discoveredDevice);
});

function clearDiscoveredDevices() {
    discoveredDevicesEntity.querySelectorAll(".discoveredDevice").forEach((entity) => entity.remove());
    discoveredDeviceEntities = {};
}

client.addEventListener("not connected", () => {
    clearDiscoveredDevices();
});

client.addEventListener("isScanning", () => {
    if (client.isScanning) {
        clearDiscoveredDevices();
    }
});

// AVAILABLE DEVICES

const availableDevicesEntity = scene.querySelector(".availableDevices");
/** @type {HTMLTemplateElement} */
const availableDeviceEntityTemplate = availableDevicesEntity.querySelector(".availableDeviceTemplate");
/** @type {Object.<string, HTMLElement>} */
let availableDeviceEntities = {};

const toggleShowAvailableDevicesEntity = scene.querySelector(".toggleShowAvailableDevices");
client.addEventListener("isConnected", () => {
    toggleShowAvailableDevicesEntity.setAttribute("fingertip-button", {
        disabled: !client.isConnected,
    });
});

toggleShowAvailableDevicesEntity.addEventListener("click", () => {
    if (screenMode == "availableDevices") {
        setScreenMode("none");
    } else {
        setScreenMode("availableDevices");
    }
});

BS.Device.AddEventListener("availableDevices", (event) => {
    /** @type {Device[]} */
    const availableDevices = event.message.devices;
    console.log({ availableDevices });

    availableDevices.forEach((device) => {
        if (device.connectionType != "webSocketClient" || !device.id) {
            return;
        }

        let availableDeviceEntity = availableDeviceEntities[device.id];
        if (!availableDeviceEntity) {
            availableDeviceEntity = availableDeviceEntityTemplate.content
                .cloneNode(true)
                .querySelector(".availableDevice");

            availableDeviceEntity.addEventListener("click", () => {
                console.log("availableDeviceEntity", "click", device);
                device.toggleConnection();
            });

            device.addEventListener("connectionStatus", () => {
                updateAvailableDeviceEntity(device);
            });

            availableDeviceEntities[device.id] = availableDeviceEntity;
            availableDevicesEntity.appendChild(availableDeviceEntity);
        }

        updateAvailableDeviceEntity(device);
    });
});

/** @param {Device} device */
function updateAvailableDeviceEntity(device) {
    const availableDeviceEntity = availableDeviceEntities[device.id];
    if (!availableDeviceEntity) {
        console.warn(`no availableDeviceEntity for device id ${device.id}`);
        return;
    }

    console.log("updateAvailableDeviceEntity", device);

    let connectMessage;
    let disabled;
    switch (device.connectionStatus) {
        case "connected":
        case "not connected":
            connectMessage = device.isConnected ? "disconnect" : "connect";
            disabled = false;
            break;
        case "connecting":
        case "disconnecting":
            connectMessage = device.connectionStatus;
            disabled = true;
            break;
    }

    if (screenMode != "availableDevices") {
        disabled = true;
    }

    const text = [device.name, device.type, connectMessage].filter(Boolean).join("\n");

    if (availableDeviceEntity.hasLoaded) {
        availableDeviceEntity.setAttribute("fingertip-button", { text, disabled });
    } else {
        availableDeviceEntity.addEventListener("loaded", () => updateAvailableDeviceEntity(device), { once: true });
    }
}

window.addEventListener("screenMode", () => {
    const isAvailableDevicesMode = screenMode == "availableDevices";
    const text = [isAvailableDevicesMode ? "hide" : "show", "available", "devices"].join("\n");
    toggleShowAvailableDevicesEntity.setAttribute("fingertip-button", {
        text,
    });
    availableDevicesEntity.object3D.visible = isAvailableDevicesMode;
    BS.Device.AvailableDevices.forEach((availableDevice) => {
        updateAvailableDeviceEntity(availableDevice);
    });
});

function clearAvailableDevices() {
    availableDevicesEntity.querySelectorAll(".availableDevice").forEach((entity) => entity.remove());
    availableDeviceEntities = {};
}

client.addEventListener("not connected", () => {
    clearAvailableDevices();
});

// DEVICE PAIR

const devicePairEntity = scene.querySelector(".devicePair");

/** @type {SensorType[]} */
const sensorTypes = ["pressure", "acceleration", "gravity", "linearAcceleration", "gameRotation"];
/** @type {HTMLTemplateElement} */
const toggleSensorTypeEntityTemplate = devicePairEntity.querySelector(".toggleSensorTypeTemplate");

/** @type {Map.<SensorType, HTMLElement>} */
const toggleSensorTypeEntities = new Map();

const vibrateDevicePairEntity = devicePairEntity.querySelector(".vibrate");
vibrateDevicePairEntity.addEventListener("click", () => {
    devicePair.triggerVibration({
        type: "waveformEffect",
        waveformEffect: { segments: [{ effect: "strongBuzz100" }] },
    });
});

sensorTypes.forEach((sensorType) => {
    const toggleSensorTypeEntity = toggleSensorTypeEntityTemplate.content
        .cloneNode(true)
        .querySelector(".toggleSensorType");
    toggleSensorTypeEntities.set(sensorType, toggleSensorTypeEntity);
    updateToggleSensorTypeEntity(sensorType);
    devicePairEntity.appendChild(toggleSensorTypeEntity);
});

function updateToggleSensorTypeEntity(sensorType) {
    const toggleSensorTypeEntity = toggleSensorTypeEntities.get(sensorType);
    if (!toggleSensorTypeEntity) {
        console.log(`no toggleSensorTypeEntity found for sensorType "${sensorType}"`);
        return;
    }

    const isSensorTypeEnabled = false; // FILL
    const sensorTypeStrings = sensorType.split(/(?=[A-Z])/g).map((string) => string.toLowerCase());
    const text = [isSensorTypeEnabled ? "disable" : "enable", ...sensorTypeStrings].join("\n");

    const disabled = screenMode != "devicePair" || !devicePair.isPartiallyConnected;

    console.log({ sensorType, disabled });

    if (toggleSensorTypeEntity.hasLoaded) {
        toggleSensorTypeEntity.setAttribute("fingertip-button", {
            text,
            disabled,
        });
    } else {
        toggleSensorTypeEntity.addEventListener("loaded", () => updateToggleSensorTypeEntity(sensorType), {
            once: true,
        });
    }
}

function updateToggleSensorTypeEntities() {
    toggleSensorTypeEntities.forEach((toggleSensorTypeEntity, sensorType) => {
        updateToggleSensorTypeEntity(sensorType);
    });
}
function updateVibrateEntity() {
    vibrateDevicePairEntity.setAttribute("fingertip-button", {
        disabled: screenMode != "devicePair" || !devicePair.isPartiallyConnected,
    });
}

devicePair.addEventListener("deviceIsConnected", () => {
    updateToggleSensorTypeEntities();
    updateVibrateEntity();
});

const toggleShowDevicePairEntity = scene.querySelector(".toggleShowDevicePair");
client.addEventListener("isConnected", () => {
    toggleShowDevicePairEntity.setAttribute("fingertip-button", {
        disabled: !client.isConnected,
    });
});

toggleShowDevicePairEntity.addEventListener("click", () => {
    if (screenMode == "devicePair") {
        setScreenMode("none");
    } else {
        setScreenMode("devicePair");
    }
});

window.addEventListener("screenMode", () => {
    const isDevicePairMode = screenMode == "devicePair";
    const text = [isDevicePairMode ? "hide" : "show", "device", "pair"].join("\n");
    toggleShowDevicePairEntity.setAttribute("fingertip-button", {
        text,
    });
    devicePairEntity.object3D.visible = isDevicePairMode;
    updateToggleSensorTypeEntities();
    updateVibrateEntity();
});

// MOTION

/** @type {HTMLElement} */
const insoleMotionTemplate = document.getElementById("insoleMotionTemplate");
devicePair.sides.forEach((side) => {
    /** @type {HTMLElement} */
    const insoleMotionEntity = insoleMotionTemplate.content.cloneNode(true).querySelector(".insole.motion");
    insoleMotionEntity.classList.add(side);

    let scale = "1 1 1";
    let position = "0 0 0";

    switch (side) {
        case "left":
            position = "-0.1 0 0";
            break;
        case "right":
            position = "0.1 0 0";
            scale = "-1 1 1";
            break;
    }

    insoleMotionEntity.querySelector(".model").setAttribute("scale", scale);
    insoleMotionEntity.querySelector(".positionOffset").setAttribute("position", position);

    desktopEntity.appendChild(insoleMotionEntity);
});

devicePair.addEventListener("deviceSensorData", (event) => {
    /** @type {Device} */
    const device = event.message.device;

    /** @type {SensorType} */
    const sensorType = event.message.sensorType;

    // FILL

    switch (sensorType) {
        case "acceleration":
            break;
        case "gravity":
            break;
        case "linearAcceleration":
            break;
        case "gyroscope":
            break;
        case "gameRotation":
            break;
        case "rotation":
            break;
    }
});

// PRESSURE

/** @type {HTMLElement} */
const insolePressureTemplate = document.getElementById("insolePressureTemplate");

devicePair.sides.forEach((side) => {
    /** @type {HTMLElement} */
    const insolePressureEntity = insolePressureTemplate.content.cloneNode(true).querySelector(".insole.pressure");
    insolePressureEntity.classList.add(side);

    // FILL

    desktopEntity.appendChild(insolePressureEntity);
});

devicePair.addEventListener("devicePressure", (event) => {
    /** @type {Device} */
    const device = event.message.device;

    /** @type {import("../../build/brilliantsole.module.js").PressureData} */
    const pressure = event.message.pressure;

    // FILL

    pressure.sensors.forEach((sensor, index) => {
        //pressureSensorElementsContainers[device.insoleSide][index].style.opacity = sensor.normalizedValue;
    });
});
