import { waitForGlobals } from "../../src/utils/cross-origin-storage-utils.js";

const { BW } = await waitForGlobals(true);

/** @typedef {import("../../../../build/brilliantwear.module.js").Device} Device */
/** @typedef {import("../../../../build/brilliantwear.module.js").DisplayManagerInterface} DisplayManagerInterface */

const isBluetoothAvailable = Boolean(
  await navigator.bluetooth?.getAvailability(),
);
// console.log({ isBluetoothAvailable });
document.documentElement.toggleAttribute(
  "data-bluetooth-available",
  isBluetoothAvailable,
);

const device = new BW.Device();
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
  device.connect();
});
device.addEventListener("connectionStatus", () => {
  let innerText = device.connectionStatus;
  switch (device.connectionStatus) {
    case "notConnected":
      innerText = "connect";
      break;
    case "connected":
      innerText = "disconnect";
      break;
  }
  toggleConnectionButton.innerText = innerText;
});

const toggleQuaternionButton = document.getElementById("toggleQuaternion");
toggleQuaternionButton.addEventListener("click", () => {
  BW.DeviceManager.connectedDevices[0].toggleSensor("gameRotation", 20);
});
const toggleOrientationButton = document.getElementById("toggleOrientation");
toggleOrientationButton.addEventListener("click", () => {
  BW.DeviceManager.connectedDevices[0].toggleSensor("orientation", 20);
});

BW.DeviceManager.addEventListener("connectedDevices", (event) => {
  toggleQuaternionButton.disabled = !BW.DeviceManager.connectedDevices.some(
    (device) => device.hasSensorType("gameRotation"),
  );
  toggleOrientationButton.disabled = !BW.DeviceManager.connectedDevices.some(
    (device) => device.hasSensorType("orientation"),
  );
});
BW.DeviceManager.addEventListener("deviceGetSensorConfiguration", (event) => {
  const { device } = event.message;
  toggleQuaternionButton.innerText =
    (device.sensorConfiguration.gameRotation ?? 0) == 0
      ? "enable quaternion"
      : "disable quaternion";
  toggleOrientationButton.innerText =
    (device.sensorConfiguration.orientation ?? 0) == 0
      ? "enable orientation"
      : "disable orientation";
});
const quaternionSpan = document.getElementById("quaternion");
BW.DeviceManager.addEventListener("deviceGameRotation", (event) => {
  if (!displayCanvasHelper.device) {
    displayCanvasHelper.drawDisplay();
  }

  quaternionSpan.innerText = JSON.stringify(
    event.message.gameRotationEuler,
    null,
    2,
  );
});

const testBackground = true;
if (testBackground) {
  BW.DeviceManager.addEventListener("deviceConnected", (event) => {
    const { device } = event.message;
    if (device.hasSensorType("tapDetector")) {
      device.setSensorConfiguration({ tapDetector: 20 });
    }
    if (device.isDisplayAvailable) {
      device.setDrawDisplayCallback(drawCallback);
      displayCanvasHelper.device = device;
      device.setSensorConfiguration({ orientation: 0 });
    }
  });

  BW.DeviceManager.addEventListener("deviceTapDetector", (event) => {
    const { device } = event.message;
    console.log("tap detected");
    device.triggerVibration([
      { type: "waveformEffect", segments: [{ effect: "buzz100" }] },
    ]);
  });

  BW.DeviceManager.addEventListener("deviceOrientation", (event) => {
    const { device } = event.message;
    if (device.displayCanvasHelper) {
      device.drawDisplay();
    }
  });
}

function getTimeOscillator(frequency = 0.5) {
  const timeInSeconds = Date.now() / 1000;
  const angle = 2 * Math.PI * frequency * timeInSeconds;
  return Math.sin(angle);
}

const displayCanvasHelper = new BW.DisplayCanvasHelper();
displayCanvasHelper.canvas = document.getElementById("displayCanvas");
/** @param {DisplayManagerInterface} displayManager */
const drawCallback = (displayManager) => {
  let x = 0;
  let orientation =
    displayManager.device?.getLatestMessage("orientation")?.orientation;
  if (orientation) {
    x = 100 + orientation.roll * 5;
  } else {
    x = getTimeOscillator() * 50;
  }
  // console.log("draw", displayManager, { isDrawing: displayManager.isDrawing });
  displayManager.setColor(1, "white");
  displayManager.selectFillColor(1);
  displayManager.drawCircle(100 + x, 100, 20);
};
displayCanvasHelper.addEventListener("device", () =>
  displayCanvasHelper.draw(),
);
displayCanvasHelper.setDrawCallback(drawCallback);
window.displayCanvasHelper = displayCanvasHelper;
console.log("displayCanvasHelper", displayCanvasHelper);
// BW.setConsoleLevelFlagsForType("DisplayCanvasHelper", { log: true });
// BW.setConsoleLevelFlagsForType("DisplayManager", { log: true });
displayCanvasHelper.draw();
