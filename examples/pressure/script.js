import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

const insolesContainer = document.getElementById("insoles");
/** @type {HTMLTemplateElement} */
const insoleTemplate = document.getElementById("insoleTemplate");

BS.Device.InsoleSides.forEach((side) => {
    /** @type {HTMLElement} */
    const insoleContainer = insoleTemplate.content.cloneNode(true).querySelector(".insole");
    insoleContainer.classList.add(side);
    insolesContainer.appendChild(insoleContainer);

    /** @type {HTMLElement[]} */
    const pressureSensorElements = Array.from(insoleContainer.querySelectorAll("[data-pressure]"));
    const insole = new BS.Device();

    /** @type {HTMLButtonElement} */
    const toggleConnectionButton = insoleContainer.querySelector(".toggleConnection");
    toggleConnectionButton.addEventListener("click", () => {
        if (insole.isConnected) {
            insole.disconnect();
        } else {
            insole.connect();
        }
    });
    insole.addEventListener("connected", () => {
        if (insole.insoleSide != side) {
            console.error(`wrong insole side - insole must be "${side}", got "${insole.insoleSide}"`);
            insole.disconnect();
        }
    });
    insole.addEventListener("connectionStatus", () => {
        switch (insole.connectionStatus) {
            case "connected":
                toggleConnectionButton.innerHTML = "disconnect";
                toggleConnectionButton.disabled = false;
                break;
            case "not connected":
                toggleConnectionButton.innerHTML = "connect";
                toggleConnectionButton.disabled = false;
                break;
            case "connecting":
            case "disconnecting":
                toggleConnectionButton.innerHTML = insole.connectionStatus;
                toggleConnectionButton.disabled = true;
                break;
        }
    });

    /** @type {HTMLButtonElement} */
    const togglePressureDataButton = insoleContainer.querySelector(".togglePressureData");
    togglePressureDataButton.addEventListener("click", () => {
        const isPressureDataEnabled = insole.sensorConfiguration.pressure > 0;
        if (isPressureDataEnabled) {
            insole.setSensorConfiguration({ pressure: 0 });
            togglePressureDataButton.innerText = "disabling pressure data...";
        } else {
            insole.setSensorConfiguration({ pressure: 20 });
            togglePressureDataButton.innerText = "enabling pressure data...";
        }
        togglePressureDataButton.disabled = true;
    });
    insole.addEventListener("getSensorConfiguration", () => {
        const isPressureDataEnabled = insole.sensorConfiguration.pressure > 0;
        if (isPressureDataEnabled) {
            togglePressureDataButton.innerText = "disable pressure data";
        } else {
            togglePressureDataButton.innerText = "enable pressure data";
        }
        togglePressureDataButton.disabled = false;
    });

    insole.addEventListener("pressure", (event) => {
        /** @type {import("../../build/brilliantsole.module.js").PressureData} */
        const pressure = event.message.pressure;
        pressure.sensors.forEach((sensor, index) => {
            pressureSensorElements[index].style.opacity = sensor.normalizedValue;
        });
    });
});
