import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

// ADD DEVICE

const addDeviceButton = document.getElementById("addDevice");
addDeviceButton.addEventListener("click", () => {
  BS.Device.Connect();
});

// DEVICES

const devicesContainer = document.getElementById("devicesContainer");
/** @type {HTMLTemplateElement} */
const deviceContainerTemplate = document.getElementById(
  "deviceContainerTemplate",
);
BS.DeviceManager.addEventListener("deviceConnected", (event) => {
  const { device } = event.message;

  const deviceContainer = deviceContainerTemplate.content
    .cloneNode(true)
    .querySelector(".deviceContainer");

  const deviceNameSpan = deviceContainer.querySelector(".name");
  device.addEventListener(
    "getName",
    () => {
      deviceNameSpan.innerText = device.name;
    },
    { immediate: true },
  );

  const deviceTypeSpan = deviceContainer.querySelector(".type");
  device.addEventListener(
    "getType",
    () => {
      deviceTypeSpan.innerText = device.type;
    },
    { immediate: true },
  );
  const disconnectButton = deviceContainer.querySelector(".disconnect");
  disconnectButton.addEventListener("click", () => {
    device.disconnect();
  });

  devicesContainer.appendChild(deviceContainer);

  device.addEventListener(
    "notConnected",
    () => {
      devicesContainer.removeChild(deviceContainer);
    },
    { once: true },
  );
});

const connectOnLoad = true;
if (connectOnLoad) {
  const devices = await BS.DeviceManager.getDevices();
  console.log(devices);
  // FIX
  devices.forEach((device) => {
    console.log(device.name);
  });
  // devices.forEach((device) => device.connect());
}

// IFRAME

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
