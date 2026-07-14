import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

// BS.setConsoleLevelFlagsForType("DisplayManager", { log: true });
// BS.setConsoleLevelFlagsForType("DisplayCanvasHelper", { log: true });
// BS.setConsoleLevelFlagsForType("DisplayContextCommand", { log: true });
// BS.setConsoleLevelFlagsForType("DisplayContextStateHelper", { log: true });
// BS.setConsoleLevelFlagsForType("BaseServer", { log: true });
// BS.setConsoleLevelFlagsForType("WindowManagerServer", { log: true });
// BS.setConsoleLevelFlagsForType("Device", { log: true });
// BS.setConsoleLevelFlagsForType("DisplayManagerInterface", { log: true });
// BS.setConsoleLevelFlagsForType("DisplayContextCommand", { log: true });
// BS.setConsoleLevelFlagsForType("DisplayBitmapUtils", { log: true });
// BS.setConsoleLevelFlagsForType("DisplaySpriteSheetUtils", { log: true });
// BS.setConsoleLevelFlagsForType("DisplayBitmapUtils", { log: true });

// WEBSOCKET CLIENT
const client = new BS.WebSocketClient();
console.log({ client });

window.client = client;

// WEBSOCKET URL SEARCH PARAMS

const url = new URL(location);
function setUrlParam(key, value) {
  if (history.pushState) {
    let searchParams = new URLSearchParams(window.location.search);
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    let newUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      searchParams.toString();
    window.history.pushState({ path: newUrl }, "", newUrl);
  }
}
client.addEventListener("isConnected", () => {
  if (client.isConnected) {
    setUrlParam("webSocketUrl", client.webSocket.url);
    webSocketUrlInput.value = client.webSocket.url;
    webSocketUrlInput.dispatchEvent(new Event("input"));
  } else {
    setUrlParam("webSocketUrl");
  }
});

// WEBSOCKET SERVER URL

/** @type {HTMLInputElement} */
const webSocketUrlInput = document.getElementById("webSocketUrl");
webSocketUrlInput.value = url.searchParams.get("webSocketUrl") || "";
webSocketUrlInput.dispatchEvent(new Event("input"));

// WEBSOCKET CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
  if (client.isConnected) {
    client.disconnect();
  } else {
    /** @type {string?} */
    let webSocketUrl;
    if (webSocketUrlInput.value.length > 0) {
      webSocketUrl = webSocketUrlInput.value;
    }
    client.connect(webSocketUrl);
  }
});
client.addEventListener("connectionStatus", () => {
  switch (client.connectionStatus) {
    case "connected":
    case "notConnected":
      toggleConnectionButton.disabled = false;
      toggleConnectionButton.innerText = client.isConnected
        ? "disconnect"
        : "connect";
      break;
    case "connecting":
    case "disconnecting":
      toggleConnectionButton.innerText = client.connectionStatus;
      toggleConnectionButton.disabled = true;
      break;
  }
});

// ADD DEVICE

const addDeviceButton = document.getElementById("addDevice");
addDeviceButton.addEventListener("click", () => {
  BS.Device.Connect();
});

// AVAILABLE DEVICES

const availableDevicesContainer = document.getElementById(
  "availableDevicesContainer",
);
/** @type {HTMLTemplateElement} */
const availableDeviceContainerTemplate = document.getElementById(
  "availableDeviceContainerTemplate",
);
BS.DeviceManager.addEventListener("availableDevice", (event) => {
  const { availableDevice: device } = event.message;

  const availableDeviceContainer = availableDeviceContainerTemplate.content
    .cloneNode(true)
    .querySelector(".availableDeviceContainer");

  const availableDeviceNameSpan =
    availableDeviceContainer.querySelector(".name");
  device.addEventListener(
    "getName",
    () => {
      availableDeviceNameSpan.innerText = device.name;
    },
    { immediate: true },
  );

  const availableDeviceTypeSpan =
    availableDeviceContainer.querySelector(".type");
  device.addEventListener(
    "getType",
    () => {
      availableDeviceTypeSpan.innerText = device.type;
    },
    { immediate: true },
  );

  const toggleConnectionButton =
    availableDeviceContainer.querySelector(".toggleConnection");
  toggleConnectionButton.addEventListener("click", () => {
    device.toggleConnection(true);
  });

  device.addEventListener(
    "connectionStatus",
    (event) => {
      let innerText = device.connectionStatus;
      switch (device.connectionStatus) {
        case "connected":
          innerText = "disconnect";
          break;
        case "notConnected":
          innerText = "connect";
          break;
      }
      toggleConnectionButton.innerText = innerText;
    },
    {
      immediate: true,
    },
  );

  availableDevicesContainer.appendChild(availableDeviceContainer);
});

const autoConnectToAvailableDevices = false;
BS.DeviceManager.addEventListener("availableDevice", (event) => {
  const { availableDevice } = event.message;
  console.log("availableDevice", availableDevice);
  if (availableDevice.canReconnect && autoConnectToAvailableDevices) {
    availableDevice.reconnect();
  }
});

// GET DEVICES
const connectOnLoad = false;
if (connectOnLoad) {
  const devices = await BS.DeviceManager.getDevices();
  console.log("getDevices", devices);
  devices.forEach((device) => device.reconnect());
}

// CANVAS
/** @type {HTMLCanvasElement} */
const displayCanvas = document.getElementById("display");

// DISPLAY CANVAS HELPER
const displayCanvasHelper = new BS.DisplayCanvasHelper();
const clearDisplayCanvasHelper = async () => {
  await displayCanvasHelper.clearContext();
  await displayCanvasHelper.clear();
};
// displayCanvasHelper.setBrightness("veryLow");
displayCanvasHelper.canvas = displayCanvas;
window.displayCanvasHelper = displayCanvasHelper;

BS.DeviceManager.addEventListener("deviceConnected", async (event) => {
  const { device } = event.message;
  if (device.isGlasses && device.isDisplayAvailable) {
    displayCanvasHelper.device = device;
  }
});
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
  true,
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

    const colorInput = displayColorContainer.querySelector(".color");
    displayColorInputs[colorIndex] = colorInput;
    colorInput.addEventListener("input", () => {
      setDisplayColor(colorIndex, colorInput.value);
    });

    displayColorsContainer.appendChild(displayColorContainer);
  }
};
displayCanvasHelper.addEventListener("numberOfColors", () => setupColors());
displayCanvasHelper.addEventListener("color", (event) => {
  const { colorHex, colorIndex } = event.message;
  displayColorInputs[colorIndex].value = colorHex;
});
setupColors();

// IFRAME

const iframeContainers = document.getElementById("iframeContainers");
/** @type {HTMLTemplateElement} */
const iframeContainerTemplate = document.getElementById(
  "iframeContainerTemplate",
);
/** @type {{name: string, url: string}[]} */
const selectUrls = [
  { name: "basic", url: "../basic" },
  { name: "pressure pair", url: "../pressure" },
  { name: "3d pair", url: "../3d" },
  { name: "3d", url: "../3d-generic" },
  { name: "graph", url: "../graph" },
  { name: "recording", url: "../recording" },
  { name: "camera", url: "../camera" },
  { name: "microphone", url: "../microphone" },
  { name: "camera hand tracking", url: "../camera-hand-tracking" },
  { name: "depth anything v2", url: "../depth-anything-v2" },
  { name: "gloves", url: "../gloves" },
  { name: "punch", url: "../punch" },
  { name: "canvas", url: "../canvas" },
  { name: "display wireframe", url: "../display-wireframe" },
  { name: "display text", url: "../display-text" },
  { name: "display image", url: "../display-image" },
  { name: "display prompt", url: "../display-prompt" },
  { name: "display 3d", url: "../display-3d" },
  { name: "display pitch", url: "../display-pitch" },
  { name: "display graph", url: "../display-graph" },
  { name: "display map", url: "../display-map" },
  { name: "display midi", url: "../display-midi" },
  { name: "display music", url: "../display-music" },
  { name: "display pitch", url: "../display-pitch" },
  { name: "display toss", url: "../display-toss" },
  { name: "display workout", url: "../display-workout" },
  { name: "display face", url: "../display-face" },
  { name: "display spotify", url: "../display-spotify" },
];
const createIframeContainer = (src) => {
  const iframeContainer = iframeContainerTemplate.content
    .cloneNode(true)
    .querySelector(".iframeContainer");

  /** @type {HTMLIFrameElement} */
  const iframe = iframeContainer.querySelector(".iframe");
  iframe.src = src ?? iframe.src;
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
  urlSelect.addEventListener("input", async () => {
    if (urlSelect.value == "none") {
      return;
    }
    await clearDisplayCanvasHelper();
    iframe.src = urlSelect.value;
  });

  const urlGo = async () => {
    console.log("urlGo");
    await clearDisplayCanvasHelper();
    iframe.src = urlInput.value;
  };
  const urlGoButton = iframeContainer.querySelector(".urlGo");
  urlGoButton.addEventListener("click", () => urlGo());

  const urlRefresh = async () => {
    console.log("urlRefresh");
    // iframe.contentWindow.location.reload();
    await clearDisplayCanvasHelper();
    iframe.src = iframe.src;
  };
  const urlRefreshButton = iframeContainer.querySelector(".urlRefresh");
  urlRefreshButton.addEventListener("click", () => urlRefresh());

  const openButton = iframeContainer.querySelector(".open");
  openButton.addEventListener("click", () => {
    window.open(iframe.src, "_blank");
  });

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
createIframeContainer("../display-text");
// createIframeContainer("../display-wireframe");
// createIframeContainer("../display-prompt");
// createIframeContainer();
// createIframeContainer();
window.createIframeContainer = createIframeContainer;

BS.ServerManager.clientSensorConfigurationToDeviceGuardManager.add(
  ({ client, message, sensorType, sensorRate }) => {
    // console.log("allow sensorConfiguration?", { sensorType, sensorRate });
    return client.iframe.dataset.allowSensorData == "true";
    return true;
  },
);

BS.ServerManager.deviceSensorDataToClientGuardManager.add(
  ({ client, message, sensorType, sensorData }) => {
    // console.log("allow sensorData?", { sensorType, sensorData });
    return client.iframe.dataset.allowSensorData == "true";
    return true;
  },
);

BS.ServerManager.clientDisplayContextCommandToDeviceGuardManager.add(
  ({ client, message, displayContextCommand }) => {
    // console.log("allow displayContextCommand?", displayContextCommand);
    return true;
  },
);
