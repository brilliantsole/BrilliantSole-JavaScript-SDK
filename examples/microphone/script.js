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
    currentDevice.toggleConnection();
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

// MICROPHONE

onCurrentDevice((device) => {
  if (device.hasMicrophone) {
    device.setSensorConfiguration({ microphone: 5 });
    device.setMicrophoneConfiguration({ sampleRate: "16000", bitDepth: "16" });
  } else {
    console.error("device doesn't have microphone");
    device.disconnect();
  }
});

/** @type {HTMLSpanElement} */
const microphoneStatusSpan = document.getElementById("microphoneStatus");
onCurrentDevice((device) => {
  device.addEventListener(
    "microphoneStatus",
    () => {
      microphoneStatusSpan.innerText = device.microphoneStatus;
    },
    { immediate: true },
  );
});

/** @type {HTMLPreElement} */
const microphoneConfigurationPre = document.getElementById(
  "microphoneConfigurationPre",
);
onCurrentDevice((device) => {
  device.addEventListener(
    "getMicrophoneConfiguration",
    () => {
      microphoneConfigurationPre.textContent = JSON.stringify(
        device.microphoneConfiguration,
        null,
        2,
      );
    },
    { immediate: true },
  );
});

const microphoneConfigurationContainer = document.getElementById(
  "microphoneConfiguration",
);
/** @type {HTMLTemplateElement} */
const microphoneConfigurationTypeTemplate = document.getElementById(
  "microphoneConfigurationTypeTemplate",
);
BS.MicrophoneConfigurationTypes.forEach((microphoneConfigurationType) => {
  const microphoneConfigurationTypeContainer =
    microphoneConfigurationTypeTemplate.content
      .cloneNode(true)
      .querySelector(".microphoneConfigurationType");

  microphoneConfigurationContainer.appendChild(
    microphoneConfigurationTypeContainer,
  );

  microphoneConfigurationTypeContainer.querySelector(".type").innerText =
    microphoneConfigurationType;

  /** @type {HTMLSelectElement} */
  const select = microphoneConfigurationTypeContainer.querySelector("select");
  /** @type {HTMLOptGroupElement} */
  const optgroup = select.querySelector("optgroup");
  optgroup.label = microphoneConfigurationType;

  BS.MicrophoneConfigurationValues[microphoneConfigurationType].forEach(
    (value) => {
      optgroup.appendChild(new Option(value));
    },
  );

  /** @type {HTMLSpanElement} */
  const span = microphoneConfigurationTypeContainer.querySelector("span");

  onCurrentDevice((device) => {
    device.addEventListener(
      "isConnected",
      () => {
        updateisInputDisabled();
      },
      { immediate: true },
    );
    device.addEventListener(
      "microphoneStatus",
      () => {
        updateisInputDisabled();
      },
      { immediate: true },
    );
  });

  const updateisInputDisabled = () => {
    select.disabled =
      !currentDevice.isConnected ||
      !currentDevice.hasMicrophone ||
      currentDevice.microphoneStatus != "idle";
  };

  const updateSelect = () => {
    const value =
      currentDevice.microphoneConfiguration[microphoneConfigurationType];
    span.innerText = value;
    select.value = value;
  };
  onCurrentDevice((device) => {
    device.addEventListener(
      "connected",
      () => {
        if (!device.hasMicrophone) {
          return;
        }
        updateSelect();
      },
      { immediate: true },
    );

    device.addEventListener(
      "getMicrophoneConfiguration",
      () => {
        updateSelect();
      },
      { immediate: true },
    );
  });

  select.addEventListener("input", () => {
    const value = select.value;
    // console.log(`updating ${microphoneConfigurationType} to ${value}`);
    currentDevice.setMicrophoneConfiguration({
      [microphoneConfigurationType]: value,
    });
  });
});

/** @type {HTMLButtonElement} */
const toggleMicrophoneButton = document.getElementById("toggleMicrophone");
toggleMicrophoneButton.addEventListener("click", () => {
  currentDevice.toggleMicrophone();
});
onCurrentDevice((device) => {
  updateToggleMicrophoneButton();
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      updateToggleMicrophoneButton();
    },
    { immediate: true },
  );
});
const updateToggleMicrophoneButton = () => {
  let disabled =
    !currentDevice.isConnected ||
    currentDevice.sensorConfiguration.microphone == 0 ||
    !currentDevice.hasMicrophone;

  switch (currentDevice.microphoneStatus) {
    case "streaming":
      toggleMicrophoneButton.innerText = "stop microphone";
      break;
    case "idle":
      toggleMicrophoneButton.innerText = "start microphone";
      break;
  }
  toggleMicrophoneButton.disabled = disabled;
};
onCurrentDevice((device) => {
  device.addEventListener(
    "microphoneStatus",
    () => {
      updateToggleMicrophoneButton();
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const startMicrophoneButton = document.getElementById("startMicrophone");
startMicrophoneButton.addEventListener("click", () => {
  currentDevice.startMicrophone();
});
/** @type {HTMLButtonElement} */
const stopMicrophoneButton = document.getElementById("stopMicrophone");
stopMicrophoneButton.addEventListener("click", () => {
  currentDevice.stopMicrophone();
});
/** @type {HTMLButtonElement} */
const enableMicrophoneVadButton = document.getElementById("enableMicrphoneVad");
enableMicrophoneVadButton.addEventListener("click", () => {
  currentDevice.enableMicrophoneVad();
});

const updateMicrophoneButtons = () => {
  let disabled =
    !currentDevice.isConnected ||
    currentDevice.sensorConfiguration.microphone == 0 ||
    !currentDevice.hasMicrophone;

  startMicrophoneButton.disabled =
    disabled || currentDevice.microphoneStatus == "streaming";
  stopMicrophoneButton.disabled =
    disabled || currentDevice.microphoneStatus == "idle";
  enableMicrophoneVadButton.disabled =
    disabled || currentDevice.microphoneStatus == "vad";
};
onCurrentDevice((device) => {
  device.addEventListener(
    "microphoneStatus",
    () => {
      updateMicrophoneButtons();
    },
    { immediate: true },
  );
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      updateMicrophoneButtons();
    },
    { immediate: true },
  );
});

const audioContext = new (window.AudioContext || window.webkitAudioContext)({
  sampleRate: 16_000,
  latencyHint: "interactive",
});
window.audioContext = audioContext;
const checkAudioContextState = () => {
  const { state } = audioContext;
  console.log({ audioContextState: state });
  if (state != "running") {
    document.addEventListener("click", () => audioContext.resume(), {
      once: true,
    });
  }
};
audioContext.addEventListener("statechange", () => {
  checkAudioContextState();
});
checkAudioContextState();

onCurrentDevice((device) => {
  device.audioContext = audioContext;
  device.microphoneGainNode.gain.value = 10;
});

/** @type {HTMLAudioElement} */
const microphoneStreamAudioElement =
  document.getElementById("microphoneStream");
onCurrentDevice((device) => {
  microphoneStreamAudioElement.srcObject =
    device.microphoneMediaStreamDestination.stream;
});

/** @type {HTMLAudioElement} */
const microphoneRecordingAudioElement = document.getElementById(
  "microphoneRecording",
);
/** @type {HTMLInputElement} */
const autoPlayMicrphoneRecordingCheckbox = document.getElementById(
  "autoPlayMicrphoneRecording",
);
let autoPlayMicrphoneRecording = autoPlayMicrphoneRecordingCheckbox.checked;
console.log("autoPlayMicrphoneRecording", autoPlayMicrphoneRecording);
autoPlayMicrphoneRecordingCheckbox.addEventListener("input", () => {
  autoPlayMicrphoneRecording = autoPlayMicrphoneRecordingCheckbox.checked;
  console.log({ autoPlayMicrphoneRecording });
});
onCurrentDevice((device) => {
  device.addEventListener("microphoneRecording", (event) => {
    microphoneRecordingAudioElement.src = event.message.url;
    if (autoPlayMicrphoneRecording) {
      microphoneRecordingAudioElement.play();
    }
  });
});

/** @type {HTMLButtonElement} */
const toggleMicrophoneRecordingButton = document.getElementById(
  "toggleMicrophoneRecording",
);
toggleMicrophoneRecordingButton.addEventListener("click", () => {
  currentDevice.toggleMicrophoneRecording();
});
onCurrentDevice((device) => {
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      updateToggleMicrophoneRecordingButton();
    },
    { immediate: true },
  );
});
const updateToggleMicrophoneRecordingButton = () => {
  let disabled =
    !currentDevice.isConnected ||
    currentDevice.sensorConfiguration.microphone == 0 ||
    !currentDevice.hasMicrophone ||
    currentDevice.microphoneStatus != "streaming";

  toggleMicrophoneRecordingButton.innerText =
    currentDevice.isRecordingMicrophone ? "stop recording" : "start recording";

  toggleMicrophoneRecordingButton.disabled = disabled;
};
onCurrentDevice((device) => {
  device.addEventListener(
    "isRecordingMicrophone",
    () => {
      updateToggleMicrophoneRecordingButton();
      if (!device.isRecordingMicrophone) {
        device.stopMicrophone();
      }
    },
    { immediate: true },
  );
  device.addEventListener(
    "microphoneStatus",
    () => {
      updateToggleMicrophoneRecordingButton();
    },
    { immediate: true },
  );
});

const peaksOptions = {
  zoomview: {
    container: document.getElementById("zoomview-container"),
  },
  overview: {
    container: document.getElementById("overview-container"),
  },
  mediaElement: document.getElementById("microphoneRecording"),
  webAudio: {
    audioContext: audioContext,
    scale: 128,
    multiChannel: false,
  },
};

microphoneRecordingAudioElement.addEventListener("loadeddata", () => {
  peaks.init(peaksOptions, (error, peaksInstance) => {
    if (error) {
      console.error("error initializing peaks", error);
    }
  });
});

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("audioVisualizer");
const canvasCtx = canvas.getContext("2d");

const analyser = audioContext.createAnalyser();
onCurrentDevice((device) => {
  device.microphoneGainNode.connect(analyser);
});
analyser.fftSize = 1024;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

const audioVisualizationTypeSelect = document.getElementById(
  "audioVisualizationType",
);
let audioVisualizationType = audioVisualizationTypeSelect.value;
audioVisualizationTypeSelect.addEventListener("input", () => {
  audioVisualizationType = audioVisualizationTypeSelect.value;
  console.log({ audioVisualizationType });
});

function draw() {
  requestAnimationFrame(draw);

  if (currentDevice?.microphoneStatus != "streaming") {
    return;
  }

  if (audioVisualizationType == "waveform") {
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(200 200 200)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0 0 0)";

    canvasCtx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  } else if (audioVisualizationType == "fft") {
    analyser.getByteFrequencyData(dataArray); // Fill dataArray with frequency data

    canvasCtx.fillStyle = "rgb(0, 0, 0)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];

      canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      canvasCtx.fillRect(
        x,
        canvas.height - barHeight / 2,
        barWidth,
        barHeight / 2,
      );

      x += barWidth + 1;
    }
  }
}

draw();
