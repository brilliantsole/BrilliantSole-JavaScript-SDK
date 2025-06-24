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
  displayCanvasHelper.setLineWidth(0);
  displayCanvasHelper.setColor(1, "red");
  displayCanvasHelper.setColor(2, "blue");
  displayCanvasHelper.selectLineColor(2);
  //displayCanvasHelper.setRotation(45);
  //displayCanvasHelper.setCropTop(80);
  //displayCanvasHelper.setRotationCropTop(50);
  //displayCanvasHelper.drawRect(200, 200, 50, 50);
  displayCanvasHelper.setColor(3, "yellow");
  displayCanvasHelper.selectLineColor(3);
  //displayCanvasHelper.setCropTop(0);
  displayCanvasHelper.setRotationCropTop(5);
  displayCanvasHelper.setLineWidth(5);
  displayCanvasHelper.setSegmentStartRadius(10);
  displayCanvasHelper.setSegmentEndRadius(30);
  displayCanvasHelper.setSegmentStartCap("round");
  displayCanvasHelper.setSegmentEndCap("round");
  displayCanvasHelper.setRotation(30);
  //displayCanvasHelper.drawPolygon(centerX, centerY, width, 3);
  displayCanvasHelper.drawSegment(centerX, centerY, 300, 300);
  displayCanvasHelper.showDisplay();
};
test(100, 100, 50, 80);
