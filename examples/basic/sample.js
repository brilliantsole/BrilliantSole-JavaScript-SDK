import * as BS from "../../build/brilliantsole.module.min.js";

const device = new BS.Device();
device.connect();

device.addEventListener("isConnected", (event) => {
  if (device.isConnected) {
    device.setSensorConfiguration({
      linearAcceleration: 20,
      gameRotation: 10,
      pressure: 50,
    });
  }
});
device.addEventListener("pressure", (event) => {});
