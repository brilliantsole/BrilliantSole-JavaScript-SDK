import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });

const insole = new BS.Device();
console.log({ insole });
window.insole = insole;

const sides = ["left", "right"];
const pressureSensorElements = {
    left: Array.from(document.querySelectorAll(".insole.left [data-pressure]")),
    right: Array.from(document.querySelectorAll(".insole.left [data-pressure]")),
};

sides.forEach((side) => {
    pressureSensorElements[side] = Array.from(document.querySelectorAll(`.insole.${side} [data-pressure]`)).sort(
        (a, b) => a.dataset.pressure - b.dataset.pressure
    );
});
console.log({ pressureSensorElements });

insole.addEventListener("pressure", (event) => {
    /** @type {import("../../build/brilliantsole.module.js").BrilliantSolePressureData} */
    const pressure = event.message.pressure;
    pressure.sensors.forEach((sensor) => {});
});
