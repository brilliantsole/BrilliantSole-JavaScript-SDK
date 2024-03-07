import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
BS.setAllConsoleLevelFlags({ log: false });

const insolesContainer = document.getElementById("insoles");
/** @type {HTMLTemplateElement} */
const insoleTemplate = document.getElementById("insoleTemplate");

window.sensorRate = 20;
window.interpolationSmoothing = 0.4;
window.positionScalar = 0.4;

window.insoles = {};

BS.Device.InsoleSides.forEach((side) => {
    /** @type {HTMLElement} */
    const insoleContainer = insoleTemplate.content.cloneNode(true).querySelector(".insole");
    insoleContainer.classList.add(side);
    const scene = insoleContainer.querySelector("a-scene");
    const insoleEntity = scene.querySelector(".insole");
    scene.addEventListener("loaded", () => {
        if (side == "right") {
            insoleEntity.object3D.scale.x = -1;
        }
    });
    insolesContainer.appendChild(insoleContainer);

    const insole = new BS.Device();
    window.insoles[side] = insole;

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

    /** @type {HTMLSelectElement} */
    const orientationSelect = insoleContainer.querySelector(".orientation");
    orientationSelect.addEventListener("input", () => {
        /** @type {import("../../build/brilliantsole.module.js").BrilliantSoleSensorConfiguration} */
        const configuration = { gameRotation: 0, rotation: 0, gyroscope: 0 };

        switch (orientationSelect.value) {
            case "none":
                break;
            case "gameRotation":
                configuration.gameRotation = sensorRate;
                break;
            case "rotation":
                configuration.rotation = sensorRate;
                break;
            case "gyroscope":
                configuration.gyroscope = sensorRate;
                break;
            default:
                console.error(`uncaught orientationSelect value "${orientationSelect.value}"`);
                break;
        }

        console.log({ configuration });

        insole.setSensorConfiguration(configuration);
    });

    /** @type {HTMLButtonElement} */
    const resetOrientationButton = insoleContainer.querySelector(".resetOrientation");
    resetOrientationButton.addEventListener("click", () => {
        resetOrientation();
    });
    insole.addEventListener("isConnected", () => {
        resetOrientationButton.disabled = !insole.isConnected;
    });

    /** @type {HTMLSelectElement} */
    const positionSelect = insoleContainer.querySelector(".position");
    positionSelect.addEventListener("input", () => {
        /** @type {import("../../build/brilliantsole.module.js").BrilliantSoleSensorConfiguration} */
        const configuration = { acceleration: 0, gravity: 0, linearAcceleration: 0 };

        switch (positionSelect.value) {
            case "none":
                break;
            case "acceleration":
                configuration.acceleration = sensorRate;
                break;
            case "gravity":
                configuration.gravity = sensorRate;
                break;
            case "linearAcceleration":
                configuration.linearAcceleration = sensorRate;
                break;
            default:
                console.error(`uncaught positionSelect value "${positionSelect.value}"`);
                break;
        }

        console.log({ configuration });

        insole.setSensorConfiguration(configuration);
    });
    insole.addEventListener("isConnected", () => {
        orientationSelect.disabled = !insole.isConnected;
        positionSelect.disabled = !insole.isConnected;
    });

    /** @typedef {import("../../build/brilliantsole.module.js").BrilliantSoleSensorType} BrilliantSoleSensorType */

    insole.addEventListener("getSensorConfiguration", () => {
        let newOrientationSelectValue = "none";
        let newPositionSelectValue = "none";

        for (const key in insole.sensorConfiguration) {
            /** @type {BrilliantSoleSensorType} */
            const sensorType = key;
            if (insole.sensorConfiguration[sensorType] > 0) {
                switch (sensorType) {
                    case "gameRotation":
                    case "rotation":
                    case "gyroscope":
                        newOrientationSelectValue = sensorType;
                        break;
                    case "acceleration":
                    case "gravity":
                    case "linearAcceleration":
                        newPositionSelectValue = sensorType;
                        break;
                }
            }
        }

        orientationSelect.value = newOrientationSelectValue;
        positionSelect.value = newPositionSelectValue;
    });

    /** @typedef {import("../../build/brilliantsole.module.js").Vector3} Vector3 */

    const _position = new THREE.Vector3();

    /** @param {Vector3} position */
    const updatePosition = (position) => {
        _position.copy(position).multiplyScalar(window.positionScalar);
        insoleEntity.object3D.position.lerp(_position, window.interpolationSmoothing);
    };

    insole.addEventListener("acceleration", (event) => {
        /** @type {Vector3} */
        const acceleration = event.message.acceleration;
        updatePosition(acceleration);
    });
    insole.addEventListener("gravity", (event) => {
        /** @type {Vector3} */
        const gravity = event.message.gravity;
        updatePosition(gravity);
    });
    insole.addEventListener("linearAcceleration", (event) => {
        /** @type {Vector3} */
        const linearAcceleration = event.message.linearAcceleration;
        linearAcceleration;
        let x, y, z;
        if (insole.type == "leftInsole") {
            x = linearAcceleration.y;
            y = linearAcceleration.z;
            z = linearAcceleration.x;
        } else {
            x = -linearAcceleration.y;
            y = -linearAcceleration.z;
            z = linearAcceleration.x;
        }
        updatePosition(linearAcceleration);
    });

    const offsetQuaternion = new THREE.Quaternion();
    const resetOrientation = () => {
        offsetQuaternion.copy(_quaternion).invert();
    };

    const _quaternion = new THREE.Quaternion();
    /** @typedef {import("../../build/brilliantsole.module.js").Quaternion} Quaternion */
    /**
     * @param {Quaternion} quaternion
     * @param {boolean} applyOffset
     */
    const updateQuaternion = (quaternion, applyOffset = false) => {
        _quaternion.copy(quaternion);
        if (applyOffset) {
            _quaternion.multiply(offsetQuaternion); // premultiply?
        }
        insoleEntity.object3D.quaternion.slerp(_quaternion, window.interpolationSmoothing);
    };
    insole.addEventListener("gameRotation", (event) => {
        /** @type {Quaternion} */
        const gameRotation = event.message.gameRotation;
        updateQuaternion(gameRotation, true);
    });
    insole.addEventListener("rotation", (event) => {
        /** @type {Quaternion} */
        const rotation = event.message.rotation;
        updateQuaternion(rotation, true);
    });

    const gyroscopeVector3 = new THREE.Vector3();
    const gyroscopeEuler = new THREE.Euler();
    const gyroscopeQuaternion = new THREE.Quaternion();
    insole.addEventListener("gyroscope", (event) => {
        /** @type {Vector3} */
        const gyroscope = event.message.gyroscope;
        gyroscopeVector3.copy(gyroscope).multiplyScalar(Math.PI / 180);
        gyroscopeEuler.setFromVector3(gyroscopeVector3);
        gyroscopeQuaternion.setFromEuler(gyroscopeEuler);
        updateQuaternion(gyroscopeQuaternion);
    });
});
