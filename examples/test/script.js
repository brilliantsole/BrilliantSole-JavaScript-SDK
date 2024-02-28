import BrilliantSole from "../../src/BrilliantSole.js";
window.BrilliantSole = BrilliantSole;
console.log("BrilliantSole", BrilliantSole);

const brilliantSole = new BrilliantSole();
console.log("brilliantSole", brilliantSole);
window.brilliantSole = brilliantSole;

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
    switch (brilliantSole.connectionStatus) {
        case "not connected":
            if (brilliantSole.canReconnect) {
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

// DEVICE INFORMATION

/** @type {HTMLPreElement} */
const deviceInformationElement = document.getElementById("deviceInformation");
brilliantSole.addEventListener("deviceInformation", () => {
    deviceInformationElement.textContent = JSON.stringify(brilliantSole.deviceInformation, null, 2);
});

// BATTERY LEVEL

/** @type {HTMLSpanElement} */
const batteryLevelSpan = document.getElementById("batteryLevel");
brilliantSole.addEventListener("batteryLevel", () => {
    console.log(`batteryLevel updated to ${brilliantSole.batteryLevel}%`);
    batteryLevelSpan.innerText = `${brilliantSole.batteryLevel}%`;
});

// NAME

/** @type {HTMLSpanElement} */
const nameSpan = document.getElementById("name");
brilliantSole.addEventListener("getName", () => {
    console.log(`name updated to ${brilliantSole.name}`);
    nameSpan.innerText = brilliantSole.name;
});

/** @type {HTMLInputElement} */
const setNameInput = document.getElementById("setNameInput");
setNameInput.minLength = brilliantSole.minNameLength;
setNameInput.maxLength = brilliantSole.maxNameLength;

/** @type {HTMLButtonElement} */
const setNameButton = document.getElementById("setNameButton");

brilliantSole.addEventListener("isConnected", () => {
    setNameInput.disabled = !brilliantSole.isConnected;
});
brilliantSole.addEventListener("not connected", () => {
    setNameInput.value = "";
});

setNameInput.addEventListener("input", () => {
    setNameButton.disabled = setNameInput.value.length < brilliantSole.minNameLength;
});

setNameButton.addEventListener("click", () => {
    console.log(`setting name to ${setNameInput.value}`);
    brilliantSole.setName(setNameInput.value);
    setNameInput.value = "";
    setNameButton.disabled = true;
});

// TYPE

/** @type {HTMLSpanElement} */
const typeSpan = document.getElementById("type");
brilliantSole.addEventListener("getType", () => {
    console.log(`type updated to ${brilliantSole.type}`);
    typeSpan.innerText = brilliantSole.type;
});

/** @type {HTMLButtonElement} */
const setTypeButton = document.getElementById("setTypeButton");

/** @type {HTMLSelectElement} */
const setTypeSelect = document.getElementById("setTypeSelect");
/** @type {HTMLOptGroupElement} */
const setTypeSelectOptgroup = setTypeSelect.querySelector("optgroup");
BrilliantSole.Types.forEach((type) => {
    setTypeSelectOptgroup.appendChild(new Option(type));
});

brilliantSole.addEventListener("isConnected", () => {
    setTypeSelect.disabled = !brilliantSole.isConnected;
});

brilliantSole.addEventListener("getType", () => {
    setTypeSelect.value = brilliantSole.type;
});

setTypeSelect.addEventListener("input", () => {
    setTypeButton.disabled = setTypeSelect.value == brilliantSole.type;
});

setTypeButton.addEventListener("click", () => {
    console.log(`setting type to ${setTypeSelect.value}`);
    brilliantSole.setType(setTypeSelect.value);
    setTypeButton.disabled = true;
});
