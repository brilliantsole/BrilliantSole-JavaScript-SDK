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
    handTrackingController.addEventListener("pinchstarted", () => {
        numberOfPinches++;
        console.log({ side, numberOfPinches });
        if (numberOfPinches == 1) {
            debouncedResetNumberOfPinches.trigger();
        } else if (numberOfPinches == 2) {
            handTrackingController.dispatchEvent(new Event("doublepinch"));
            numberOfPinches = 0;
            debouncedResetNumberOfPinches.cancel();
        }
    });
});

// DESKTOP PLACEMENT

let didSetInitialHitTest = false;
scene.addEventListener("ar-hit-test-select", () => {
    if (!didSetInitialHitTest) {
        toggleARHitTest();
        didSetInitialHitTest = true;
    }
});

handTrackingControllers.right.addEventListener("doublepinch", () => {
    console.log("DOUBLE PINCH");
    ///toggleARHitTest();
});

const toggleARHitTest = () => {
    const enabled = !scene.getAttribute("ar-hit-test").enabled;
    console.log("ar-hit-test", enabled);
    scene.setAttribute("ar-hit-test", "enabled", enabled);
};

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
