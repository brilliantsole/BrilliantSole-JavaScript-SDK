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
    toggleConnectionButton.innerText = brilliantSole.canReconnect ? "reconnect" : "connect";
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
    brilliantSole.triggerVibration("both", 2000);
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

var isSendingPressure = false;
/** @type {HTMLButtonElement} */
const togglePressureButton = document.getElementById("togglePressure");
togglePressureButton.addEventListener("click", () => {
    isSendingPressure = !isSendingPressure;
    const sensorDataRate = isSendingPressure ? 2 : 0;
    brilliantSole.setSensorDataRate("pressure", sensorDataRate);
    togglePressureButton.innerText = isSendingPressure ? "disable pressure" : "enable pressure";
});

var isSendingQuaternion = false;
const toggleQuaternionButton = document.getElementById("toggleQuaternion");
toggleQuaternionButton.addEventListener("click", () => {
    isSendingQuaternion = !isSendingQuaternion;
    const sensorDataRate = isSendingQuaternion ? 1 : 0;
    brilliantSole.setSensorDataRate("quaternion", sensorDataRate);
    toggleQuaternionButton.innerText = isSendingQuaternion ? "disable quaternion" : "enable quaternion";
});

var isSendingAcceleration = false;
const toggleAccelerationButton = document.getElementById("toggleAcceleration");
toggleAccelerationButton.addEventListener("click", () => {
    isSendingAcceleration = !isSendingAcceleration;
    const sensorDataRate = isSendingAcceleration ? 1 : 0;
    brilliantSole.setSensorDataRate("acceleration", sensorDataRate);
    toggleAccelerationButton.innerText = isSendingQuaternion ? "disable acceleration" : "enable acceleration";
});

var isSendingLinearAcceleration = false;
const toggleLinearAccelerationButton = document.getElementById("toggleLinearAcceleration");
toggleLinearAccelerationButton.addEventListener("click", () => {
    isSendingLinearAcceleration = !isSendingLinearAcceleration;
    const sensorDataRate = isSendingLinearAcceleration ? 1 : 0;
    brilliantSole.setSensorDataRate("linearAcceleration", sensorDataRate);
    toggleLinearAccelerationButton.innerText = isSendingQuaternion
        ? "disable linearAcceleration"
        : "enable linearAcceleration";
});

brilliantSole.addEventListener("isConnected", () => {
    const disabled = !brilliantSole.isConnected;
    togglePressureButton.disabled = disabled;
    //toggleQuaternionButton.disabled = disabled;
    toggleAccelerationButton.disabled = disabled;
    //toggleLinearAccelerationButton.disabled = disabled;
});

brilliantSole.addEventListener("pressure", (event) => {
    console.log("pressure", event.message.pressure);
});

brilliantSole.addEventListener("acceleration", (event) => {
    console.log("acceleration", event.message.acceleration);
});

brilliantSole.addEventListener("linearAcceleration", (event) => {
    console.log("linearAcceleration", event.message.linearAcceleration);
});

brilliantSole.addEventListener("quaternion", (event) => {
    console.log("quaternion", event.message.quaternion);
});
