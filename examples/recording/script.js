import BS from "../../build/brilliantsole.module.js";

window.BS = BS;
console.log({ BS });
BS.setAllConsoleLevelFlags({ log: true });

/** @type {HTMLButtonElement} */
const addDeviceButton = document.getElementById("addDevice");
addDeviceButton.addEventListener("click", () => {
    // FILL
});
