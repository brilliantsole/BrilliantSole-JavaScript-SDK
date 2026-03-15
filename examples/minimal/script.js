import * as BS from "../../build/brilliantsole.module.js";

const device = new BS.Device();
const connectButton = document.getElementById("connect");
connectButton.addEventListener("click", () => {
  device.connect();
});
device.addEventListener("isConnected", () => {
  connectButton.innerText = device.isConnected ? "disconnect" : "connect";
});
device.addEventListener("connected", () => {
  device.setSensorConfiguration({ gameRotation: 20 });
});
const quaternionSpan = document.getElementById("quaternion");
device.addEventListener("gameRotation", (event) => {
  quaternionSpan.innerText = JSON.stringify(
    event.message.gameRotationEuler,
    null,
    2
  );
});
