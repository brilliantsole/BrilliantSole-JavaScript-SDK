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
device.addEventListener("tfliteInference", (event) => {
  maxClassSpan.innerText = event.message.tfliteInference.maxClass;
  setTimeout(() => {
    maxClassSpan.innerText = "";
  }, punchConfiguration.captureDelay - 50);
});

// GLOVE
/** @type {BS.TfliteFileConfiguration} */
const punchConfiguration = {
  name: "punch",
  task: "classification",
  sensorTypes: ["gyroscope", "linearAcceleration"],
  sampleRate: 20,
  captureDelay: 500,
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

device.addEventListener("connected", async () => {
  if (device.type != "rightGlove") {
    console.error("expected right glove");
    device.disconnect();
    return;
  }
  device.sendTfliteConfiguration(punchConfiguration);
});
device.addEventListener("tfliteIsReady", () => {
  if (device.tfliteIsReady) {
    device.enableTfliteInferencing();
  }
});

// GAME
device.addEventListener("tfliteInference", (event) => {
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
});

// PHYSICS
const punchingBagBaseEntity = document.getElementById("punchingBagBase");
const punchingBagEntities = Array.from(
  document.querySelectorAll(".punchingBag")
).sort((a, b) => a.dataset.section - b.dataset.section);

const forces = {
  punch: new THREE.Vector3(0, 0, -110),
  hook: new THREE.Vector3(-30, 0, -20),
  uppercut: new THREE.Vector3(-10, 0, -70),
};
function punch() {
  window.force = forces.punch;
  punchingBagEntities[1].click();
}
function hook() {
  window.force = forces.hook;
  punchingBagEntities[2].click();
}
function uppercut() {
  window.force = forces.uppercut;
  punchingBagEntities[2].click();
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
