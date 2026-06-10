import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

// DEVICE

const device = new BS.Device();
window.device = device;

// CONNECT

const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
  device.toggleConnection(false);
});
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

// URL

/** @type {HTMLIFrameElement} */
const iframe = document.querySelector("iframe");
iframe.addEventListener("load", (event) => {
  console.log(`iframe loaded "${iframe.src}"`);
  urlInput.value = iframe.src;
  // urlInput.value = iframe.contentWindow.location.href;
});

/** @type {HTMLInputElement} */
const urlInput = document.getElementById("url");
urlInput.addEventListener("keydown", (event) => {
  //   console.log(event.key);
  switch (event.key) {
    case "Enter":
      urlGo();
      break;
  }
});

const urlGo = () => {
  console.log("urlGo");
  iframe.src = urlInput.value;
};
const urlGoButton = document.getElementById("urlGo");
urlGoButton.addEventListener("click", () => urlGo());

const urlRefresh = () => {
  console.log("urlRefresh");
  // iframe.contentWindow.location.reload();
  iframe.src = iframe.src;
};
const urlRefreshButton = document.getElementById("urlRefresh");
urlRefreshButton.addEventListener("click", () => urlRefresh());

window.allowGameRotationConfig = true;
BS.WindowServer.clientSensorConfigurationToDeviceGuardManager.add(
  ({ client, message, sensorType, sensorRate }) => {
    console.log("allow sensorConfiguration?", { sensorType, sensorRate });
    if (sensorType == "gameRotation") {
      return window.allowGameRotationConfig;
    }
    return true;
  },
);

window.allowGameRotationData = true;
BS.WindowServer.deviceSensorDataToClientGuardManager.add(
  ({ client, message, sensorType, sensorData }) => {
    console.log("allow sensorData?", { sensorType, sensorData });
    if (sensorType == "gameRotation") {
      return window.allowGameRotationData;
    }
    return true;
  },
);
