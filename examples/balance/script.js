import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

const balanceContainer = document.getElementById("balanceContainer");
/** @type {HTMLTemplateElement} */
const balanceSideTemplate = document.getElementById("balanceSideTemplate");

const balanceSideElements = {};
window.balanceSideElements = balanceSideElements;

BS.Device.InsoleSides.forEach((side) => {
    /** @type {HTMLElement} */
    const balanceSideContainer = balanceSideTemplate.content.cloneNode(true).querySelector(".balanceSide");
    balanceSideContainer.classList.add(side);
    balanceContainer.appendChild(balanceSideContainer);
    const target = balanceSideContainer.querySelector(".target");
    const fill = balanceSideContainer.querySelector(".fill");
    balanceSideElements[side] = { target, fill };
});

const devicePair = new BS.DevicePair();
console.log({ devicePair });
window.devicePair = devicePair;

const devices = BS.DevicePair.Sides.map(() => {
    const device = new BS.Device();

    device.addEventListener("connected", () => {
        console.log("connected to device", device);
        if (device.isInsole) {
            const oldDevice = devicePair.assignInsole(device);
            oldDevice?.disconnect();
        } else {
            console.warn("device is not an insole. disconnecting now...");
            device.disconnect();
        }
    });
    return device;
});

/** @type {HTMLButtonElement} */
const addDeviceButton = document.getElementById("addDevice");
devicePair.addEventListener("isConnected", () => {
    addDeviceButton.disabled = devicePair.isConnected;
});
addDeviceButton.addEventListener("click", () => {
    const device = devices.find((device) => !device.isConnected);
    if (device) {
        device.connect();
    } else {
        console.warn("all devices are connected");
    }
});

let isPressureDataEnabled = false;

/** @type {HTMLButtonElement} */
const togglePressureDataButton = document.getElementById("togglePressureData");
devicePair.addEventListener("isConnected", () => {
    togglePressureDataButton.disabled = devicePair.isConnected;
});
togglePressureDataButton.addEventListener("click", () => {
    isPressureDataEnabled = !isPressureDataEnabled;
    console.log({ isPressureDataEnabled });
    devicePair.setSensorConfiguration({ pressure: isPressureDataEnabled ? 20 : 0 });
});

/** @type {HTMLButtonElement} */
const resetPressureRangeButton = document.getElementById("resetPressureRange");
devicePair.addEventListener("isConnected", () => {
    resetPressureRangeButton.disabled = devicePair.isConnected;
});
resetPressureRangeButton.addEventListener("click", () => {
    devicePair.resetPressureRange();
});

/** @typedef {import("../../build/brilliantsole.module.js").CenterOfPressure} CenterOfPressure */

/** @param {CenterOfPressure} center  */
function updateUIOnCenterOfPressure(center) {
    devicePair.sides.forEach((side) => {
        let height = center.x;
        if (side == "left") {
            height = 1 - height;
        }
        balanceSideElements[side].fill.style.height = `${height * 100}%`;
    });
}
window.updateUIOnCenterOfPressure = updateUIOnCenterOfPressure;

let isPlayingGame = false;

/** @type {HTMLButtonElement} */
const toggleGameButton = document.getElementById("toggleGame");
devicePair.addEventListener("isConnected", () => {
    toggleGameButton.disabled = devicePair.isConnected;
});
toggleGameButton.addEventListener("click", () => {
    isPlayingGame = !isPlayingGame;
    toggleGameButton.innerText = isPlayingGame ? "stop game" : "start game";

    if (isPlayingGame) {
        target.reset();
        balanceContainer.classList.add("game");
    } else {
        balanceContainer.classList.remove("game");
    }
});

/**
 * @param {number} min
 * @param {number} max
 */
function randomValueBetween(min, max) {
    const range = max - min;
    return min + Math.random() * range;
}

const target = {
    height: 0,
    start: 0,

    /** @param {CenterOfPressure} center  */
    isInside(center) {
        console.log(center, this);
        return center.x >= this.start && center.x <= this.start + this.height;
    },

    reset() {
        balanceContainer.classList.remove("hover");

        this.height = randomValueBetween(0.1, 0.2);
        this.start = randomValueBetween(0, 1 - this.height);

        devicePair.sides.forEach((side) => {
            let bottom = this.start;
            if (side == "left") {
                bottom = 1 - bottom - this.height;
            }
            balanceSideElements[side].target.style.bottom = `${bottom * 100}%`;
            balanceSideElements[side].target.style.height = `${this.height * 100}%`;
        });
    },
};

/** @typedef {import("../../build/brilliantsole.module.js").DevicePairPressureData} DevicePairPressureData */

let isCenterOfPressureInsideTarget = false;
let insideTargetTimeoutId;

devicePair.addEventListener("pressure", (event) => {
    /** @type {DevicePairPressureData} */
    const pressure = event.message.pressure;
    console.log({ pressure });
    onCenterOfPressure(pressure.calibratedCenter);
});

/** @param {CenterOfPressure} center */
function onCenterOfPressure(center) {
    updateUIOnCenterOfPressure(center);

    if (isPlayingGame) {
        isCenterOfPressureInsideTarget = target.isInside(center);
        console.log({ isCenterOfPressureInsideTarget });
        if (isCenterOfPressureInsideTarget) {
            if (insideTargetTimeoutId == undefined) {
                balanceContainer.classList.add("hover");
                insideTargetTimeoutId = setTimeout(() => {
                    target.reset();
                }, 3000);
            }
        } else {
            if (insideTargetTimeoutId != undefined) {
                balanceContainer.classList.remove("hover");
                clearTimeout(insideTargetTimeoutId);
                insideTargetTimeoutId = undefined;
            }
        }
    }
}
window.onCenterOfPressure = onCenterOfPressure; // for manual testing