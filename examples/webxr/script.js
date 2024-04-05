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
toggleARHitTestEntity.addEventListener("touchstart", () => {
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
toggleSetWebSocketUrlButton.addEventListener("touchstart", () => {
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
toggleConnectionEntity.addEventListener("touchstart", () => {
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
toggleConnectionEntity.addEventListener("touchstart", () => {
    /** @type {string?} */
    let webSocketUrl;
    if (webSocketUrlInput.value.length > 0) {
        webSocketUrl = webSocketUrlInput.value;
    }
    client.toggleConnection(webSocketUrl);
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
