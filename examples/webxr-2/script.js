import * as BS from "../../build/brilliantsole.module.js";

let runModelInBrowser = false;
const setRunModelInBrowser = (newRunMoelInBrowser) => {
  runModelInBrowser = newRunMoelInBrowser;
  console.log({ newRunMoelInBrowser });
  if (runModelInBrowser) {
    localStorage.setItem(runModelInBrowserKey, "");
  } else {
    localStorage.removeItem(runModelInBrowserKey);
  }

  BS.DeviceManager.ConnectedDevices.forEach((device) => {
    if (device.type != "generic") {
      return;
    }

    if (runModelInBrowser) {
      if (device.tfliteIsReady && !runModelInBrowserCheckbox.checked) {
        console.log("enabling inferencing");
        device.enableTfliteInferencing();
      }
    } else {
      device.disableTfliteInferencing();
    }
  });
};

const runModelInBrowserKey = "run-model-in-browser";
const runModelInBrowserCheckbox = document.getElementById("runModelInBrowser");
runModelInBrowserCheckbox.addEventListener("input", () => {
  setRunModelInBrowser(runModelInBrowserCheckbox.checked);
});
if (localStorage.getItem(runModelInBrowserKey) != undefined) {
  runModelInBrowserCheckbox.checked = true;
  setRunModelInBrowser(true);
}

// KICK MODEL
/** @type {BS.TfliteFileConfiguration} */
const kickConfiguration = {
  name: "kick",
  task: "classification",
  sensorTypes: ["gyroscope", "linearAcceleration"],
  sampleRate: 20,
  captureDelay: 500,
  threshold: 0.7,
  classes: ["idle", "kick", "stomp"],
};
fetch("./kick2.tflite")
  .then((response) => response.arrayBuffer())
  .then((buffer) => {
    kickConfiguration.file = buffer;
    console.log("updated kickModelConfiguration", kickConfiguration);
  })
  .catch((err) => {
    console.error("Error loading kick model:", err);
  });

// CONNECT

const connectToDeviceContainers = document.getElementById(
  "connectToDeviceContainers"
);
const connectToDeviceTemplate = document.getElementById(
  "connectToDeviceTemplate"
);

let ipAddresses = ["192.168.4.23", ""];
function updateIpAddress(ipAddress, index) {
  ipAddresses[index] = ipAddress;
  const url = new URL(window.location);

  url.searchParams.set("ipAddresses", ipAddresses.join("+"));
  window.history.replaceState({}, "", url);
}
const { searchParams } = new URL(location);
if (searchParams.has("ipAddresses")) {
  ipAddresses = searchParams.get("ipAddresses").split("+");
}

for (let i = 0; i < 2; i++) {
  const container = connectToDeviceTemplate.content
    .cloneNode(true)
    .querySelector(".connectToDevice");
  connectToDeviceContainers.appendChild(container);

  const device = new BS.Device();

  const ipAddressInput = container.querySelector(".ipAddress");
  ipAddressInput.addEventListener("input", () => {
    // can disable connect button if invalid
  });

  ipAddressInput.value = ipAddresses[i];

  // FILE TRANSFER
  const toggleConnectionButton = container.querySelector(".toggleConnection");
  toggleConnectionButton.addEventListener("click", () => {
    if (device.isConnected) {
      device.disconnect();
    } else {
      device.connect({ type: "webSocket", ipAddress: ipAddressInput.value });
    }
  });

  device.addEventListener("connected", () => {
    updateIpAddress(ipAddressInput.value, i);
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
    ipAddressInput.disabled = disabled;
  });

  // FILE TRANSFER
  device.addEventListener("connected", async () => {
    if (device.type != "generic") {
      return;
    }
    device.sendTfliteConfiguration(kickConfiguration);
  });

  // FILE TRANSFER
  /** @type {HTMLProgressElement} */
  const fileTransferProgress = container.querySelector(".fileTransferProgress");
  device.addEventListener("fileTransferStatus", (event) => {
    if (event.message.fileTransferStatus == "sending") {
      fileTransferProgress.removeAttribute("hidden");
      isModelReadyCheckbox.removeAttribute("hidden");
    }
    if (device.fileTransferStatus == "idle") {
      fileTransferProgress.value = 0;
    }
  });
  device.addEventListener("fileTransferProgress", (event) => {
    const progress = event.message.progress;
    console.log({ progress });
    fileTransferProgress.value = progress == 1 ? 0 : progress;
  });

  // MODEL
  /** @type {HTMLInputElement} */
  const isModelReadyCheckbox = container.querySelector(".isModelReady");
  device.addEventListener("getTfliteInferencingEnabled", () => {
    isModelReadyCheckbox.checked = device.tfliteInferencingEnabled;
  });

  device.addEventListener("tfliteIsReady", () => {
    console.log("tfliteIsReady?", device.tfliteIsReady, device.type);
    if (device.type != "generic") {
      return;
    }
    if (device.tfliteIsReady && !runModelInBrowserCheckbox.checked) {
      console.log("enabling inferencing");
      device.enableTfliteInferencing();
    }
  });

  const maxClassSpan = container.querySelector(".maxClass");
  const maxClassLabel = maxClassSpan.closest("label");
  let gestureTimeout;
  device.addEventListener("tfliteInference", (event) => {
    // console.log(event);
    maxClassLabel.removeAttribute("hidden");
    maxClassSpan.innerText =
      event.message.tfliteInference.maxClass.toUpperCase() + "!";
    if (gestureTimeout) {
      clearTimeout(gestureTimeout);
    }
    gestureTimeout = setTimeout(() => {
      maxClassSpan.innerText = "";
      maxClassLabel.setAttribute("hidden", "");
    }, 600);
  });
}
