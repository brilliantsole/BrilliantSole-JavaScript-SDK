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

// MICROPHONE

device.addEventListener("connected", () => {
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
device.addEventListener("microphoneStatus", () => {
  microphoneStatusSpan.innerText = device.microphoneStatus;
});

/** @type {HTMLPreElement} */
const microphoneConfigurationPre = document.getElementById(
  "microphoneConfigurationPre"
);
device.addEventListener("getMicrophoneConfiguration", () => {
  microphoneConfigurationPre.textContent = JSON.stringify(
    device.microphoneConfiguration,
    null,
    2
  );
});

const microphoneConfigurationContainer = document.getElementById(
  "microphoneConfiguration"
);
/** @type {HTMLTemplateElement} */
const microphoneConfigurationTypeTemplate = document.getElementById(
  "microphoneConfigurationTypeTemplate"
);
BS.MicrophoneConfigurationTypes.forEach((microphoneConfigurationType) => {
  const microphoneConfigurationTypeContainer =
    microphoneConfigurationTypeTemplate.content
      .cloneNode(true)
      .querySelector(".microphoneConfigurationType");

  microphoneConfigurationContainer.appendChild(
    microphoneConfigurationTypeContainer
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
    }
  );

  /** @type {HTMLSpanElement} */
  const span = microphoneConfigurationTypeContainer.querySelector("span");

  device.addEventListener("isConnected", () => {
    updateisInputDisabled();
  });
  device.addEventListener("microphoneStatus", () => {
    updateisInputDisabled();
  });
  const updateisInputDisabled = () => {
    select.disabled =
      !device.isConnected ||
      !device.hasMicrophone ||
      device.microphoneStatus != "idle";
  };

  const updateSelect = () => {
    const value = device.microphoneConfiguration[microphoneConfigurationType];
    span.innerText = value;
    select.value = value;
  };

  device.addEventListener("connected", () => {
    if (!device.hasMicrophone) {
      return;
    }
    updateSelect();
  });

  device.addEventListener("getMicrophoneConfiguration", () => {
    updateSelect();
  });

  select.addEventListener("input", () => {
    const value = select.value;
    // console.log(`updating ${microphoneConfigurationType} to ${value}`);
    device.setMicrophoneConfiguration({
      [microphoneConfigurationType]: value,
    });
  });
});

/** @type {HTMLButtonElement} */
const toggleMicrophoneButton = document.getElementById("toggleMicrophone");
toggleMicrophoneButton.addEventListener("click", () => {
  device.toggleMicrophone();
});
device.addEventListener("connected", () => {
  updateToggleMicrophoneButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateToggleMicrophoneButton();
});
const updateToggleMicrophoneButton = () => {
  let disabled =
    !device.isConnected ||
    device.sensorConfiguration.microphone == 0 ||
    !device.hasMicrophone;

  switch (device.microphoneStatus) {
    case "streaming":
      toggleMicrophoneButton.innerText = "stop microphone";
      break;
    case "idle":
      toggleMicrophoneButton.innerText = "start microphone";
      break;
  }
  toggleMicrophoneButton.disabled = disabled;
};
device.addEventListener("microphoneStatus", () => {
  updateToggleMicrophoneButton();
});

/** @type {HTMLButtonElement} */
const startMicrophoneButton = document.getElementById("startMicrophone");
startMicrophoneButton.addEventListener("click", () => {
  device.startMicrophone();
});
/** @type {HTMLButtonElement} */
const stopMicrophoneButton = document.getElementById("stopMicrophone");
stopMicrophoneButton.addEventListener("click", () => {
  device.stopMicrophone();
});
/** @type {HTMLButtonElement} */
const enableMicrophoneVadButton = document.getElementById("enableMicrphoneVad");
enableMicrophoneVadButton.addEventListener("click", () => {
  device.enableMicrophoneVad();
});

const updateMicrophoneButtons = () => {
  let disabled =
    !device.isConnected ||
    device.sensorConfiguration.microphone == 0 ||
    !device.hasMicrophone;

  startMicrophoneButton.disabled =
    disabled || device.microphoneStatus == "streaming";
  stopMicrophoneButton.disabled = disabled || device.microphoneStatus == "idle";
  enableMicrophoneVadButton.disabled =
    disabled || device.microphoneStatus == "vad";
};
device.addEventListener("microphoneStatus", () => {
  updateMicrophoneButtons();
});
device.addEventListener("connected", () => {
  updateMicrophoneButtons();
});
device.addEventListener("getSensorConfiguration", () => {
  updateMicrophoneButtons();
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

device.audioContext = audioContext;
device.microphoneGainNode.gain.value = 10;

/** @type {HTMLAudioElement} */
const microphoneStreamAudioElement =
  document.getElementById("microphoneStream");
microphoneStreamAudioElement.srcObject =
  device.microphoneMediaStreamDestination.stream;

/** @type {HTMLAudioElement} */
const microphoneRecordingAudioElement = document.getElementById(
  "microphoneRecording"
);
/** @type {HTMLInputElement} */
const autoPlayMicrphoneRecordingCheckbox = document.getElementById(
  "autoPlayMicrphoneRecording"
);
let autoPlayMicrphoneRecording = autoPlayMicrphoneRecordingCheckbox.checked;
console.log("autoPlayMicrphoneRecording", autoPlayMicrphoneRecording);
autoPlayMicrphoneRecordingCheckbox.addEventListener("input", () => {
  autoPlayMicrphoneRecording = autoPlayMicrphoneRecordingCheckbox.checked;
  console.log({ autoPlayMicrphoneRecording });
});
device.addEventListener("microphoneRecording", (event) => {
  microphoneRecordingAudioElement.src = event.message.url;
  if (autoPlayMicrphoneRecording) {
    microphoneRecordingAudioElement.play();
  }
});

/** @type {HTMLButtonElement} */
const toggleMicrophoneRecordingButton = document.getElementById(
  "toggleMicrophoneRecording"
);
toggleMicrophoneRecordingButton.addEventListener("click", () => {
  device.toggleMicrophoneRecording();
});
device.addEventListener("connected", () => {
  updateToggleMicrophoneRecordingButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateToggleMicrophoneRecordingButton();
});
const updateToggleMicrophoneRecordingButton = () => {
  let disabled =
    !device.isConnected ||
    device.sensorConfiguration.microphone == 0 ||
    !device.hasMicrophone ||
    device.microphoneStatus != "streaming";

  toggleMicrophoneRecordingButton.innerText = device.isRecordingMicrophone
    ? "stop recording"
    : "start recording";

  toggleMicrophoneRecordingButton.disabled = disabled;
};
device.addEventListener("isRecordingMicrophone", () => {
  updateToggleMicrophoneRecordingButton();
  if (!device.isRecordingMicrophone) {
    device.stopMicrophone();
  }
});
device.addEventListener("microphoneStatus", () => {
  updateToggleMicrophoneRecordingButton();
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
device.microphoneGainNode.connect(analyser);
analyser.fftSize = 1024;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

const audioVisualizationTypeSelect = document.getElementById(
  "audioVisualizationType"
);
let audioVisualizationType = audioVisualizationTypeSelect.value;
audioVisualizationTypeSelect.addEventListener("input", () => {
  audioVisualizationType = audioVisualizationTypeSelect.value;
  console.log({ audioVisualizationType });
});

function draw() {
  requestAnimationFrame(draw);

  if (device.microphoneStatus != "streaming") {
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
        barHeight / 2
      );

      x += barWidth + 1;
    }
  }
}

draw();
