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

// BRIGHTNESS
/** @type {HTMLSelectElement} */
const setDisplayBrightnessSelect = document.getElementById(
  "setDisplayBrightnessSelect"
);
/** @type {HTMLOptGroupElement} */
const setDisplayBrightnessSelectOptgroup =
  setDisplayBrightnessSelect.querySelector("optgroup");
BS.DisplayBrightnesses.forEach((displayBrightness) => {
  setDisplayBrightnessSelectOptgroup.appendChild(new Option(displayBrightness));
});
setDisplayBrightnessSelect.addEventListener("input", () => {
  displayCanvasHelper.setBrightness(setDisplayBrightnessSelect.value);
});

setDisplayBrightnessSelect.value = displayCanvasHelper.brightness;

// COLORS

/** @type {HTMLTemplateElement} */
const displayColorTemplate = document.getElementById("displayColorTemplate");
const displayColorsContainer = document.getElementById("displayColors");
const setDisplayColor = BS.ThrottleUtils.throttle(
  (colorIndex, colorString) => {
    console.log({ colorIndex, colorString });
    displayCanvasHelper.setColor(colorIndex, colorString, true);
  },
  100,
  true
);
/** @type {HTMLInputElement[]} */
const displayColorInputs = [];
const setupColors = () => {
  displayColorsContainer.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    const displayColorContainer = displayColorTemplate.content
      .cloneNode(true)
      .querySelector(".displayColor");

    const colorIndexSpan = displayColorContainer.querySelector(".colorIndex");
    colorIndexSpan.innerText = `color #${colorIndex}`;
    const colorInput = displayColorContainer.querySelector("input");
    displayColorInputs[colorIndex] = colorInput;
    colorInput.addEventListener("input", () => {
      setDisplayColor(colorIndex, colorInput.value);
    });
    displayColorsContainer.appendChild(displayColorContainer);
  }
};
setupColors();
displayCanvasHelper.addEventListener("numberOfColors", () => setupColors());
displayCanvasHelper.addEventListener("color", (event) => {
  const { colorHex, colorIndex } = event.message;
  displayColorInputs[colorIndex].value = colorHex;
});

// OPACITIES

/** @type {HTMLTemplateElement} */
const displayColorOpacityTemplate = document.getElementById(
  "displayColorOpacityTemplate"
);
const displayColorOpacitiesContainer = document.getElementById(
  "displayColorOpacities"
);
const setDisplayColorOpacity = BS.ThrottleUtils.throttle(
  (colorIndex, opacity) => {
    console.log({ colorIndex, opacity });
    displayCanvasHelper.setColorOpacity(colorIndex, opacity, true);
  },
  100,
  true
);
const setupColorOpacities = () => {
  displayColorOpacitiesContainer.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    const displayColorOpacityContainer = displayColorOpacityTemplate.content
      .cloneNode(true)
      .querySelector(".displayColorOpacity");

    const displayColorOpacityIndex =
      displayColorOpacityContainer.querySelector(".colorIndex");
    displayColorOpacityIndex.innerText = `color opacity #${colorIndex}`;
    const displayColorOpacityInput =
      displayColorOpacityContainer.querySelector("input");
    const displayColorOpacitySpan =
      displayColorOpacityContainer.querySelector("span");
    displayColorOpacityInput.addEventListener("input", () => {
      const opacity = Number(displayColorOpacityInput.value);
      displayColorOpacitySpan.innerText = Math.round(opacity * 100);
      setDisplayColorOpacity(colorIndex, opacity);
    });
    displayColorOpacitiesContainer.appendChild(displayColorOpacityContainer);
  }
};
displayCanvasHelper.addEventListener("numberOfColors", () =>
  setupColorOpacities()
);
setupColorOpacities();

const displayOpacityContainer = document.getElementById("displayOpacity");
const displayOpacitySpan = displayOpacityContainer.querySelector("span");
const displayOpacityInput = displayOpacityContainer.querySelector("input");

const setDisplayOpacity = BS.ThrottleUtils.throttle(
  (opacity) => {
    console.log({ opacity });
    displayCanvasHelper.setOpacity(opacity, true);
  },
  100,
  true
);
displayOpacityInput.addEventListener("input", () => {
  const opacity = Number(displayOpacityInput.value);
  displayOpacitySpan.innerText = Math.round(opacity * 100);
  setDisplayOpacity(opacity);
  displayColorOpacitiesContainer
    .querySelectorAll(".displayColorOpacity")
    .forEach((container) => {
      const input = container.querySelector("input");
      const span = container.querySelector("span");
      input.value = opacity;
      span.innerText = Math.round(opacity * 100);
    });
});

// TEST

window.test = (centerX, centerY, width, height) => {
  displayCanvasHelper.setLineWidth(0);
  displayCanvasHelper.setColor(0, "black");
  displayCanvasHelper.setColor(1, "red");
  displayCanvasHelper.setColor(2, "blue");
  displayCanvasHelper.selectLineColor(2);
  //displayCanvasHelper.setRotation(45);
  //displayCanvasHelper.setCropTop(80);
  //displayCanvasHelper.setRotationCropTop(50);
  //displayCanvasHelper.drawRect(200, 200, 50, 50);
  displayCanvasHelper.setColor(3, "yellow");
  displayCanvasHelper.selectLineColor(3);
  displayCanvasHelper.setCropTop(0);
  displayCanvasHelper.setRotationCropTop(0);
  displayCanvasHelper.setLineWidth(5);
  displayCanvasHelper.setSegmentStartRadius(30);
  displayCanvasHelper.setSegmentEndRadius(0);
  displayCanvasHelper.setSegmentStartCap("round");
  displayCanvasHelper.setSegmentEndCap("round");
  displayCanvasHelper.setRotation(30);
  displayCanvasHelper.drawCircle(centerX, centerY, 50);
  displayCanvasHelper.drawSegment(centerX, centerY, 300, 300);
  displayCanvasHelper.showDisplay();
};
test(100, 100, 50, 80);
