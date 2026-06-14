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

const iframeContainers = document.getElementById("iframeContainers");
/** @type {HTMLTemplateElement} */
const iframeContainerTemplate = document.getElementById(
  "iframeContainerTemplate",
);
/** @type {{name: string, url: string}[]} */
const selectUrls = [{ name: "3d", url: "../3d" }];
const createIframeContainer = () => {
  const iframeContainer = iframeContainerTemplate.content
    .cloneNode(true)
    .querySelector(".iframeContainer");

  /** @type {HTMLIFrameElement} */
  const iframe = iframeContainer.querySelector(".iframe");
  iframe.addEventListener("load", (event) => {
    console.log(`iframe loaded "${iframe.src}"`);
    urlInput.value = iframe.src;
    // urlInput.value = iframe.contentWindow.location.href;
  });

  /** @type {HTMLInputElement} */
  const urlInput = iframeContainer.querySelector(".url");
  urlInput.addEventListener("keydown", (event) => {
    //   console.log(event.key);
    switch (event.key) {
      case "Enter":
        urlGo();
        break;
    }
  });

  /** @type {HTMLSelectElement} */
  const urlSelect = iframeContainer.querySelector(".urlSelect");
  const urlOptgroup = urlSelect.querySelector("optgroup");
  selectUrls.forEach(({ name, url }) => {
    urlOptgroup.appendChild(new Option(name, url));
  });
  urlSelect.value = "none";
  urlSelect.addEventListener("input", () => {
    if (urlSelect.value == "none") {
      return;
    }
    iframe.src = urlSelect.value;
  });

  const urlGo = () => {
    console.log("urlGo");
    iframe.src = urlInput.value;
  };
  const urlGoButton = iframeContainer.querySelector(".urlGo");
  urlGoButton.addEventListener("click", () => urlGo());

  const urlRefresh = () => {
    console.log("urlRefresh");
    // iframe.contentWindow.location.reload();
    iframe.src = iframe.src;
  };
  const urlRefreshButton = iframeContainer.querySelector(".urlRefresh");
  urlRefreshButton.addEventListener("click", () => urlRefresh());

  const toggleSensorDataButton =
    iframeContainer.querySelector(".toggleSensorData");

  let allowSensorData = true;
  const setEnableSensorData = (newAllowSensorData) => {
    allowSensorData = newAllowSensorData;
    console.log({ allowSensorData });
    iframe.dataset.allowSensorData = allowSensorData;
    toggleSensorDataButton.innerText = allowSensorData
      ? "disable sensor data"
      : "allow sensor data";
  };
  setEnableSensorData(true);

  const toggleSensorData = () => {
    setEnableSensorData(!allowSensorData);
  };

  toggleSensorDataButton.addEventListener("click", () => toggleSensorData());

  iframeContainers.appendChild(iframeContainer);
};
createIframeContainer();
createIframeContainer();

BS.WindowServer.clientSensorConfigurationToDeviceGuardManager.add(
  ({ client, message, sensorType, sensorRate }) => {
    // console.log("allow sensorConfiguration?", { sensorType, sensorRate });
    return client.iframe.dataset.allowSensorData == "true";
    return true;
  },
);

BS.WindowServer.deviceSensorDataToClientGuardManager.add(
  ({ client, message, sensorType, sensorData }) => {
    // console.log("allow sensorData?", { sensorType, sensorData });
    return client.iframe.dataset.allowSensorData == "true";
    return true;
  },
);
