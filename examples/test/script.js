import BrilliantSole from "../../src/BrilliantSole.js";
window.BrilliantSole = BrilliantSole;
console.log("BrilliantSole", BrilliantSole);

const brilliantSole = new BrilliantSole();
console.log("brilliantSole", brilliantSole);
window.brilliantSole = brilliantSole;

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
    switch (brilliantSole.connectionStatus) {
        case "not connected":
            if (false && brilliantSole.canReconnect) {
                brilliantSole.reconnect();
            } else {
                brilliantSole.connect();
            }
            break;
        case "connected":
            brilliantSole.disconnect();
            break;
    }
});

brilliantSole.addEventListener("connecting", () => {
    console.log("connecting");
    toggleConnectionButton.innerText = "connecting...";
    toggleConnectionButton.disabled = true;
});
brilliantSole.addEventListener("connected", () => {
    console.log("connected");
    toggleConnectionButton.innerText = "disconnect";
    toggleConnectionButton.disabled = false;
});
brilliantSole.addEventListener("disconnecting", () => {
    console.log("disconnecting");
    toggleConnectionButton.innerText = "disconnecting...";
    toggleConnectionButton.disabled = true;
});
brilliantSole.addEventListener("not connected", () => {
    console.log("not connected");
    toggleConnectionButton.innerText = "reconnect";
    toggleConnectionButton.disabled = false;
});

/** @type {HTMLPreElement} */
const deviceInformationElement = document.getElementById("deviceInformation");

brilliantSole.addEventListener("deviceInformation", () => {
    deviceInformationElement.textContent = JSON.stringify(brilliantSole.deviceInformation, null, 2);
});
brilliantSole.addEventListener("not connected", () => {
    deviceInformationElement.textContent = "";
});

/** @type {HTMLSpanElement} */
const batteryLevelSpan = document.getElementById("batteryLevel");
brilliantSole.addEventListener("batteryLevel", () => {
    batteryLevelSpan.innerText = `${brilliantSole.batteryLevel}%`;
});

/** @type {HTMLButtonElement} */
const triggerVibrationButton = document.getElementById("triggerVibration");
/** @type {HTMLButtonElement} */
const stopVibrationButton = document.getElementById("stopVibration");
/** @type {HTMLButtonElement} */
const setVibrationStrengthButton = document.getElementById("setVibrationStrength");

triggerVibrationButton.addEventListener("click", () => {
    console.log("starting vibration...");
    brilliantSole.triggerVibration("both", 1000);
});
stopVibrationButton.addEventListener("click", () => {
    console.log("stopping vibration...");
    brilliantSole.stopVibration("both");
});
setVibrationStrengthButton.addEventListener("click", () => {
    brilliantSole.setVibrationStrength("both", 50);
});
brilliantSole.addEventListener("isConnected", () => {
    console.log("isConnected", brilliantSole.isConnected);
    const disabled = !brilliantSole.isConnected;
    triggerVibrationButton.disabled = disabled;
    stopVibrationButton.disabled = disabled;
    setVibrationStrengthButton.disabled = disabled;
});
