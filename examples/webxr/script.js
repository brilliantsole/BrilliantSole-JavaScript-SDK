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

const toggleARHitTestButton = document.getElementById("toggleARHitTest");
const toggleARHitTestText = toggleARHitTestButton.querySelector("a-text");
const toggleARHitTestBox = toggleARHitTestButton.querySelector("a-box");
toggleARHitTestButton.addEventListener("touchstart", () => {
    toggleARHitTest();
});
window.addEventListener("ar-hit-test", (event) => {
    const { enabled } = event.detail;
    if (enabled) {
        toggleARHitTestText.setAttribute("value", "cancel");
        toggleARHitTestBox.setAttribute("color", "red");
    } else {
        toggleARHitTestText.setAttribute("value", "move");
        toggleARHitTestBox.setAttribute("color", "white");
    }
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

const toggleSetWebSocketServerUrlButton = document.getElementById("toggleSetWebSocketServerUrl");
const toggleSetWebSocketServerUrlBox = toggleSetWebSocketServerUrlButton.querySelector("a-box");
const toggleSetWebSocketServerUrlText = toggleSetWebSocketServerUrlButton.querySelector("a-text.url");
toggleSetWebSocketServerUrlButton.addEventListener("touchstart", () => {
    if (client.isConnected) {
        return;
    }
    webSocketUrlInput.focus();
});
client.addEventListener("connectionStatus", () => {
    /** @type {string} */
    let color;

    switch (client.connectionStatus) {
        case "connected":
        case "not connected":
            color = "white";
            break;
        case "connecting":
        case "disconnecting":
            color = "grey";
            break;
    }

    if (color) {
        toggleSetWebSocketServerUrlBox.setAttribute("color", color);
    }
});
webSocketUrlInput.addEventListener("input", () => {
    toggleSetWebSocketServerUrlText.setAttribute("value", webSocketUrlInput.value);
});
webSocketUrlInput.addEventListener("focusin", () => {
    toggleSetWebSocketServerUrlBox.setAttribute("color", "yellow");
});
webSocketUrlInput.addEventListener("focusout", () => {
    toggleSetWebSocketServerUrlBox.setAttribute("color", "white");
});

// WEBSOCKET CONNECTION

const toggleWebSocketConnectionButton = document.getElementById("toggleWebSocketServerConnection");
const toggleWebSocketConnectionBox = toggleWebSocketConnectionButton.querySelector("a-box");
const toggleWebSocketConnectionText = toggleWebSocketConnectionButton.querySelector("a-text");

toggleWebSocketConnectionButton.addEventListener("touchstart", () => {
    switch (client.connectionStatus) {
        case "connecting":
        case "disconnecting":
            return;
    }

    /** @type {string?} */
    let webSocketUrl;
    if (webSocketUrlInput.value.length > 0) {
        webSocketUrl = webSocketUrlInput.value;
    }
    client.toggleConnection(webSocketUrl);
});

client.addEventListener("connectionStatus", () => {
    /** @type {string} */
    let text;
    /** @type {string} */
    let color;

    switch (client.connectionStatus) {
        case "connected":
        case "not connected":
            text = client.isConnected ? "disconnect" : "connect";
            color = "white";
            break;
        case "connecting":
        case "disconnecting":
            text = client.connectionStatus;
            color = "gray";
            break;
    }

    if (text) {
        toggleWebSocketConnectionText.setAttribute("value", text);
    }
    if (color) {
        toggleWebSocketConnectionBox.setAttribute("color", color);
    }
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
