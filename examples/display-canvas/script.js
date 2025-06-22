import * as BS from "../../build/brilliantsole.module.js";

// DEVICE
const device = new BS.Device();
window.device = device;

// CONNECT

const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () =>
  device.toggleConnection()
);
device.addEventListener("connectionStatus", () => {
  let disabled = false;
  let innerText = device.connectionStatus;
  switch (device.connectionStatus) {
    case "notConnected":
      innerText = "connect";
      break;
    case "connected":
      innerText = "disconnect";
      break;
  }
  toggleConnectionButton.disabled = disabled;
  toggleConnectionButton.innerText = innerText;
});

// CANVAS
/** @type {HTMLCanvasElement} */
const displayCanvas = document.getElementById("display");

// DISPLAY CANVAS HELPER
const displayCanvasHelper = new BS.DisplayCanvasHelper();
displayCanvasHelper.canvas = displayCanvas;
window.displayCanvasHelper = displayCanvasHelper;

device.addEventListener("connected", () => {
  if (device.isDisplayAvailable) {
    displayCanvasHelper.device = device;
  } else {
    console.error("device doesn't have a display");
    device.disconnect();
  }
});

window.test = (centerX, centerY, width, height) => {
  displayCanvasHelper.setLineWidth(10);
  displayCanvasHelper.setColor(1, "red");
  displayCanvasHelper.setColor(2, "blue");
  displayCanvasHelper.selectLineColor(2);
  displayCanvasHelper.setRotation(60);
  //displayCanvasHelper.setCropTop(50);
  displayCanvasHelper.setRotationCropTop(20);
  displayCanvasHelper.drawRect(centerX, centerY, width, height);
  displayCanvasHelper.showDisplay();
};
test(100, 100, 100, 100);
