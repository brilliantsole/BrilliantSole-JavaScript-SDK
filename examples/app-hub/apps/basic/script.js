import { waitForGlobals } from "../../src/utils/cross-origin-storage-utils.js";

const { BW } = await waitForGlobals(true);

const isBluetoothAvailable = Boolean(
  await navigator.bluetooth?.getAvailability(),
);
console.log({ isBluetoothAvailable });
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
BW.DeviceManager.addEventListener("connectedDevices", (event) => {
  toggleQuaternionButton.disabled =
    BW.DeviceManager.connectedDevices.length == 0;
});
BW.DeviceManager.addEventListener("deviceGetSensorConfiguration", (event) => {
  const { device } = event.message;
  toggleQuaternionButton.innerText =
    device.sensorConfiguration.gameRotation == 0
      ? "enable quaternion"
      : "disable quaternion";
});
const quaternionSpan = document.getElementById("quaternion");
BW.DeviceManager.addEventListener("deviceGameRotation", (event) => {
  quaternionSpan.innerText = JSON.stringify(
    event.message.gameRotationEuler,
    null,
    2,
  );
});
