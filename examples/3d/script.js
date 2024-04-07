import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: false });

/** @typedef {import("../../build/brilliantsole.module.js").Device} Device */

// GET DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById("availableDeviceTemplate");
const availableDevicesContainer = document.getElementById("availableDevices");
/** @param {Device[]} availableDevices */
function onAvailableDevices(availableDevices) {
    availableDevicesContainer.innerHTML = "";
    if (availableDevices.length == 0) {
        availableDevicesContainer.innerText = "no devices available";
    } else {
        availableDevices.forEach((availableDevice) => {
            let availableDeviceContainer = availableDeviceTemplate.content
                .cloneNode(true)
                .querySelector(".availableDevice");
            availableDeviceContainer.querySelector(".name").innerText = availableDevice.name;
            availableDeviceContainer.querySelector(".type").innerText = availableDevice.type;

            /** @type {HTMLButtonElement} */
            const toggleConnectionButton = availableDeviceContainer.querySelector(".toggleConnection");
            toggleConnectionButton.addEventListener("click", () => {
                availableDevice.toggleConnection();
            });
            const onConnectionStatusUpdate = () => {
                switch (availableDevice.connectionStatus) {
                    case "connected":
                    case "not connected":
                        toggleConnectionButton.disabled = false;
                        toggleConnectionButton.innerText = availableDevice.isConnected ? "disconnect" : "connect";
                        break;
                    case "connecting":
                    case "disconnecting":
                        toggleConnectionButton.disabled = true;
                        toggleConnectionButton.innerText = availableDevice.connectionStatus;
                        break;
                }
            };
            availableDevice.addEventListener("connectionStatus", () => onConnectionStatusUpdate());
            onConnectionStatusUpdate();
            availableDevicesContainer.appendChild(availableDeviceContainer);
        });
    }
}
async function getDevices() {
    const availableDevices = await BS.Device.GetDevices();
    if (!availableDevices) {
        return;
    }
    onAvailableDevices(availableDevices);
}

BS.Device.AddEventListener("availableDevices", (event) => {
    const devices = event.message.devices;
    onAvailableDevices(devices);
});
getDevices();

// ADD DEVICE

/** @type {HTMLButtonElement} */
const addDeviceButton = document.getElementById("addDevice");
addDeviceButton.addEventListener("click", () => {
    BS.Device.Connect();
});

const devicePair = BS.DevicePair.shared;
devicePair.addEventListener("isConnected", () => {
    addDeviceButton.disabled = devicePair.isConnected;
});

// 3D VISUALIZATION

const insolesContainer = document.getElementById("insoles");
/** @type {HTMLTemplateElement} */
const insoleTemplate = document.getElementById("insoleTemplate");

window.sensorRate = 20;
window.interpolationSmoothing = 0.4;
window.positionScalar = 0.4;

devicePair.sides.forEach((side) => {
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

    /** @type {HTMLButtonElement} */
    const toggleConnectionButton = insoleContainer.querySelector(".toggleConnection");
    toggleConnectionButton.addEventListener("click", () => {
        devicePair[side].toggleConnection();
    });
    devicePair.addEventListener("deviceIsConnected", (event) => {
        /** @type {Device} */
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        if (device.isConnected) {
            toggleConnectionButton.disabled = false;
        }
        toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "reconnect";
    });

    devicePair.addEventListener("deviceConnectionStatus", (event) => {
        /** @type {Device} */
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        switch (device.connectionStatus) {
            case "connected":
            case "not connected":
                toggleConnectionButton.disabled = false;
                toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "reconnect";
                break;
            case "connecting":
            case "disconnecting":
                toggleConnectionButton.disabled = true;
                toggleConnectionButton.innerText = device.connectionStatus;
                break;
        }
    });

    /** @type {HTMLSelectElement} */
    const orientationSelect = insoleContainer.querySelector(".orientation");
    orientationSelect.addEventListener("input", () => {
        /** @type {import("../../build/brilliantsole.module.js").SensorConfiguration} */
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

        devicePair[side].setSensorConfiguration(configuration);
    });

    /** @type {HTMLButtonElement} */
    const resetOrientationButton = insoleContainer.querySelector(".resetOrientation");
    resetOrientationButton.addEventListener("click", () => {
        resetOrientation();
    });
    devicePair.addEventListener("deviceIsConnected", (event) => {
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        resetOrientationButton.disabled = !device.isConnected;
    });

    /** @type {HTMLSelectElement} */
    const positionSelect = insoleContainer.querySelector(".position");
    positionSelect.addEventListener("input", () => {
        /** @type {import("../../build/brilliantsole.module.js").SensorConfiguration} */
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

        devicePair[side].setSensorConfiguration(configuration);
    });
    devicePair.addEventListener("deviceIsConnected", (event) => {
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        orientationSelect.disabled = !device.isConnected;
        positionSelect.disabled = !device.isConnected;
    });

    /** @typedef {import("../../build/brilliantsole.module.js").SensorType} SensorType */

    devicePair.addEventListener("deviceGetSensorConfiguration", (event) => {
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        let newOrientationSelectValue = "none";
        let newPositionSelectValue = "none";

        for (const key in device.sensorConfiguration) {
            /** @type {SensorType} */
            const sensorType = key;
            if (device.sensorConfiguration[sensorType] > 0) {
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

    devicePair.addEventListener("deviceAcceleration", (event) => {
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }
        /** @type {Vector3} */
        const acceleration = event.message.acceleration;
        updatePosition(acceleration);
    });
    devicePair.addEventListener("deviceGravity", (event) => {
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        /** @type {Vector3} */
        const gravity = event.message.gravity;
        updatePosition(gravity);
    });
    devicePair.addEventListener("deviceLinearAcceleration", (event) => {
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        /** @type {Vector3} */
        const linearAcceleration = event.message.linearAcceleration;
        updatePosition(linearAcceleration);
    });

    const offsetQuaternion = new THREE.Quaternion();
    const resetOrientation = () => {
        offsetQuaternion.copy(_quaternion).invert();
    };

    const _quaternion = new THREE.Quaternion();
    const targetQuaternion = new THREE.Quaternion();
    /** @typedef {import("../../build/brilliantsole.module.js").Quaternion} Quaternion */
    /**
     * @param {Quaternion} quaternion
     * @param {boolean} applyOffset
     */
    const updateQuaternion = (quaternion, applyOffset = false) => {
        _quaternion.copy(quaternion);
        targetQuaternion.copy(_quaternion);
        if (applyOffset) {
            targetQuaternion.premultiply(offsetQuaternion);
        }
        insoleEntity.object3D.quaternion.slerp(targetQuaternion, window.interpolationSmoothing);
    };
    devicePair.addEventListener("deviceGameRotation", (event) => {
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        /** @type {Quaternion} */
        const gameRotation = event.message.gameRotation;
        updateQuaternion(gameRotation, true);
    });
    devicePair.addEventListener("deviceRotation", (event) => {
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        /** @type {Quaternion} */
        const rotation = event.message.rotation;
        updateQuaternion(rotation, true);
    });

    const gyroscopeVector3 = new THREE.Vector3();
    const gyroscopeEuler = new THREE.Euler();
    const gyroscopeQuaternion = new THREE.Quaternion();
    devicePair.addEventListener("deviceGyroscope", (event) => {
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        /** @type {Vector3} */
        const gyroscope = event.message.gyroscope;
        gyroscopeVector3.copy(gyroscope).multiplyScalar(Math.PI / 180);
        gyroscopeEuler.setFromVector3(gyroscopeVector3);
        gyroscopeQuaternion.setFromEuler(gyroscopeEuler);
        updateQuaternion(gyroscopeQuaternion);
    });
});
