import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log(BS);

// DEVICE

const device = new BS.Device();
console.log({ device });
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

// FILE TRANSFER
/** @type {HTMLProgressElement} */
const fileTransferProgress = document.getElementById("fileTransferProgress");
device.addEventListener("fileTransferProgress", (event) => {
  const progress = event.message.progress;
  console.log({ progress });
  fileTransferProgress.value = progress == 1 ? 0 : progress;
});

// MODEL
/** @type {HTMLInputElement} */
const isModelReadyCheckbox = document.getElementById("isModelReady");
device.addEventListener("getTfliteInferencingEnabled", () => {
  isModelReadyCheckbox.checked = device.tfliteInferencingEnabled;
});
device.addEventListener("fileTransferStatus", () => {
  if (device.fileTransferStatus == "idle") {
    fileTransferProgress.value = 0;
  }
});

/** @type {HTMLSpanElement} */
const maxClassSpan = document.getElementById("maxClass");
let gestureTimeout;
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

// KICK
/** @type {BS.TfliteFileConfiguration} */
const kickConfiguration = {
  name: "kick",
  task: "classification",
  sensorTypes: ["gyroscope", "linearAcceleration"],
  sampleRate: 20,
  captureDelay: 200,
  classes: ["idle", "kick", "hook", "uppercut"],
};
fetch("./kick.tflite")
  .then((response) => response.arrayBuffer())
  .then((buffer) => {
    kickConfiguration.file = buffer;
    console.log("updated kickModelConfiguration", kickConfiguration);
  })
  .catch((err) => {
    console.error("Error loading kick model:", err);
  });

device.addEventListener("connected", async () => {
  if (device.type != "generic") {
    console.error("expected generic");
    device.disconnect();
    return;
  }
  device.sendTfliteConfiguration(kickConfiguration);
});
device.addEventListener("tfliteIsReady", () => {
  if (device.tfliteIsReady) {
    device.enableTfliteInferencing();
  }
});

// GAME
device.addEventListener("tfliteInference", (event) => {
  switch (event.message.tfliteInference.maxClass) {
    case "kick":
      kick();
      break;
    case "stomp":
      stomp();
      break;
  }
});

// FILL - spawning enemies and stuff

// PHYSICS
// FILL - get entities

const forces = {
  kick: new THREE.Vector3(0, 0, -110),
  stomp: new THREE.Vector3(-30, 0, -20),
};
function kick() {
  window.force = forces.kick;
  // FILL
  triggerWaveformEffect("strongClick100");
}
function stomp() {
  window.force = forces.stomp;
  // FILL
  triggerWaveformEffect("strongBuzz100");
}

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "k":
      kick();
      break;
    case "s":
      stomp();
      break;
  }
});

// VIBRATION
/** @param {BS.VibrationWaveformEffect} waveformEffect */
function triggerWaveformEffect(waveformEffect) {
  if (!device.isConnected) {
    return;
  }
  device.triggerVibration([
    {
      type: "waveformEffect",
      locations: ["rear"],
      segments: [{ effect: waveformEffect }],
    },
  ]);
}
