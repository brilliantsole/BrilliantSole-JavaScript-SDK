import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

const client = new BS.WebSocketClient();
console.log({ client });

window.client = client;

/** @typedef {import("../../build/brilliantsole.module.js").Device} Device */

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
