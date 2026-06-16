import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log(BS);

// DEVICE
/** @type {BS.Device?} */
let currentDevice;

/** @param {(device: BS.Device)=>void} callback */
const onCurrentDevice = (callback) => {
  BS.DeviceManager.addEventListener("deviceConnected", (event) => {
    if (event.message.device == currentDevice) {
      callback(currentDevice);
    }
  });
};

BS.DeviceManager.addEventListener("deviceConnected", (event) => {
  const { device } = event.message;
  if (!currentDevice?.isConnected) {
    onDevice(device);
  }
});
BS.DeviceManager.addEventListener("deviceNotConnected", (event) => {
  const { device } = event.message;
  if (currentDevice == device) {
    console.log("currentDevice is gone");
    currentDevice.removeAllEventListeners();
    const nextConnectedDevice = BS.DeviceManager.connectedDevices[0];
    console.log("nextConnectedDevice", nextConnectedDevice);
    if (nextConnectedDevice) {
      onDevice(nextConnectedDevice);
    }
  }
});

/** @param {BS.Device} device */
const onDevice = (device, replaceCurrentDevice = false) => {
  if (currentDevice?.isConnected) {
    if (!replaceCurrentDevice) {
      return;
    }
    currentDevice.removeAllEventListeners();
  }
  currentDevice = device;
  console.log("currentDevice", currentDevice);
};

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", async () => {
  if (currentDevice) {
    currentDevice.toggleConnection(false);
  } else {
    toggleConnectionButton.innerText = "connecting...";
    await BS.Device.Connect();
    if (!currentDevice) {
      toggleConnectionButton.innerText = "connect";
    }
  }
});

onCurrentDevice((device) => {
  device.addEventListener(
    "connectionStatus",
    () => {
      switch (device.connectionStatus) {
        case "connected":
        case "notConnected":
          toggleConnectionButton.disabled = false;
          toggleConnectionButton.innerText = device.isConnected
            ? "disconnect"
            : "connect";
          break;
        case "connecting":
        case "disconnecting":
          toggleConnectionButton.disabled = true;
          toggleConnectionButton.innerText = currentDevice.connectionStatus;
          break;
      }
    },
    { immediate: true },
  );
});

// FILE TRANSFER
/** @type {HTMLProgressElement} */
const fileTransferProgress = document.getElementById("fileTransferProgress");
onCurrentDevice((device) => {
  device.addEventListener("fileTransferProgress", (event) => {
    const progress = event.message.progress;
    console.log({ progress });
    fileTransferProgress.value = progress == 1 ? 0 : progress;
  });
});

// MODEL
/** @type {HTMLInputElement} */
const isModelReadyCheckbox = document.getElementById("isModelReady");
onCurrentDevice((device) => {
  device.addEventListener(
    "getTfliteInferencingEnabled",
    () => {
      isModelReadyCheckbox.checked = device.tfliteInferencingEnabled;
    },
    { immediate: true },
  );
  device.addEventListener(
    "fileTransferStatus",
    () => {
      if (device.fileTransferStatus == "idle") {
        fileTransferProgress.value = 0;
      }
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const maxClassSpan = document.getElementById("maxClass");
let gestureTimeout;
onCurrentDevice((device) => {
  device.addEventListener("tfliteInference", (event) => {
    maxClassSpan.innerText =
      event.message.tfliteInference.maxClass.toUpperCase() + "!";
    if (gestureTimeout) {
      clearTimeout(gestureTimeout);
    }
    gestureTimeout = setTimeout(() => {
      maxClassSpan.innerText = "";
    }, 600);
  });
});

// GLOVE
/** @type {BS.TfliteFileConfiguration} */
const punchConfiguration = {
  name: "punch",
  task: "classification",
  sensorTypes: ["gyroscope", "linearAcceleration"],
  sampleRate: 20,
  captureDelay: 200,
  classes: ["idle", "punch", "hook", "uppercut"],
};
fetch("./punch.tflite")
  .then((response) => response.arrayBuffer())
  .then((buffer) => {
    punchConfiguration.file = buffer;
    console.log("updated punchModelConfiguration", punchConfiguration);
  })
  .catch((err) => {
    console.error("Error loading punch model:", err);
  });

onCurrentDevice((device) => {
  device.addEventListener(
    "connected",
    async () => {
      if (device.type != "rightGlove") {
        console.error("expected right glove");
        device.disconnect();
        return;
      }
      device.sendTfliteConfiguration(punchConfiguration);
    },
    { immediate: true },
  );
  device.addEventListener(
    "tfliteIsReady",
    () => {
      if (device.tfliteIsReady) {
        device.enableTfliteInferencing();
      }
    },
    { immediate: true },
  );
});

// GAME
onCurrentDevice((device) => {
  device.addEventListener(
    "tfliteInference",
    (event) => {
      switch (event.message.tfliteInference.maxClass) {
        case "punch":
          punch();
          break;
        case "hook":
          hook();
          break;
        case "uppercut":
          uppercut();
          break;
      }
    },
    { immediate: true },
  );
});

// PHYSICS
const punchingBagBaseEntity = document.getElementById("punchingBagBase");
const punchingBagEntities = Array.from(
  document.querySelectorAll(".punchingBag"),
).sort((a, b) => a.dataset.section - b.dataset.section);

const forces = {
  punch: new THREE.Vector3(0, 0, -110),
  hook: new THREE.Vector3(-30, 0, -20),
  uppercut: new THREE.Vector3(-10, 0, -70),
};
function punch() {
  window.force = forces.punch;
  punchingBagEntities[1].click();
  triggerWaveformEffect("strongClick100");
}
function hook() {
  window.force = forces.hook;
  punchingBagEntities[2].click();
  triggerWaveformEffect("strongBuzz100");
}
function uppercut() {
  window.force = forces.uppercut;
  punchingBagEntities[2].click();
  triggerWaveformEffect("pulsingStrong100");
}

/** @param {BS.VibrationWaveformEffect} waveformEffect */
function triggerWaveformEffect(waveformEffect) {
  if (!currentDevice?.isConnected) {
    return;
  }
  currentDevice.triggerVibration([
    {
      type: "waveformEffect",
      locations: ["rear"],
      segments: [{ effect: waveformEffect }],
    },
  ]);
}

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "p":
      punch();
      break;
    case "h":
      hook();
      break;
    case "u":
      uppercut();
      break;
  }
});
