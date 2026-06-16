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

// CAMERA

onCurrentDevice((device) => {
  if (device.hasCamera) {
  } else {
    console.error("device doesn't have camera");
    device.disconnect();
  }
});

/** @type {HTMLSpanElement} */
const cameraStatusSpan = document.getElementById("cameraStatus");
onCurrentDevice((device) => {
  device.addEventListener(
    "cameraStatus",
    () => {
      cameraStatusSpan.innerText = device.cameraStatus;
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  if (currentDevice.cameraStatus == "idle") {
    currentDevice.takePicture();
  } else {
    currentDevice.stopCamera();
  }
});
onCurrentDevice((device) => {
  updateTakePictureButton();
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      updateTakePictureButton();
    },
    { immediate: true },
  );
});
const updateTakePictureButton = () => {
  takePictureButton.disabled = !currentDevice.isConnected;
  // device.sensorConfiguration.camera == 0 ||
  // device.cameraStatus != "idle";
};
onCurrentDevice((device) => {
  updateTakePictureButton();
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      updateTakePictureButton();
    },
    { immediate: true },
  );
  device.addEventListener(
    "cameraStatus",
    () => {
      updateTakePictureButton();
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const focusCameraButton = document.getElementById("focusCamera");
focusCameraButton.addEventListener("click", () => {
  if (currentDevice.cameraStatus == "idle") {
    currentDevice.focusCamera();
  } else {
    currentDevice.stopCamera();
  }
});
onCurrentDevice((device) => {
  updateFocusCameraButton();
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      updateFocusCameraButton();
    },
    { immediate: true },
  );
});
const updateFocusCameraButton = () => {
  focusCameraButton.disabled =
    !currentDevice.isConnected ||
    currentDevice.sensorConfiguration.camera == 0 ||
    currentDevice.cameraStatus != "idle";
};
onCurrentDevice((device) => {
  device.addEventListener(
    "cameraStatus",
    (event) => {
      updateFocusCameraButton();
      if (
        device.cameraStatus == "idle" &&
        event.message.previousCameraStatus == "focusing"
      ) {
        device.takePicture();
      }
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const sleepCameraButton = document.getElementById("sleepCamera");
sleepCameraButton.addEventListener("click", () => {
  if (currentDevice.cameraStatus == "asleep") {
    currentDevice.wakeCamera();
  } else {
    currentDevice.sleepCamera();
  }
});
onCurrentDevice((device) => {
  device.addEventListener(
    "getSensorConfiguration",
    () => {
      updateSleepCameraButton();
    },
    { immediate: true },
  );
});
const updateSleepCameraButton = () => {
  let disabled = !currentDevice.isConnected || !currentDevice.hasCamera;
  switch (currentDevice.cameraStatus) {
    case "asleep":
      sleepCameraButton.innerText = "wake camera";
      break;
    case "idle":
      sleepCameraButton.innerText = "sleep camera";
      break;
    default:
      disabled = true;
      break;
  }
  sleepCameraButton.disabled = disabled;
};
onCurrentDevice((device) => {
  device.addEventListener(
    "cameraStatus",
    () => {
      updateSleepCameraButton();
    },
    { immediate: true },
  );
});

/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");
const cameraImageParent = cameraImage.parentElement;

/** @type {HTMLProgressElement} */
const cameraImageProgress = document.getElementById("cameraImageProgress");

onCurrentDevice((device) => {
  device.addEventListener("cameraImage", (event) => {
    cameraImage.src = event.message.url;
  });
  device.addEventListener("cameraImageProgress", (event) => {
    if (event.message.type == "image") {
      cameraImageProgress.value = event.message.progress;
    }
  });
});

/** @type {HTMLInputElement} */
const autoPictureCheckbox = document.getElementById("autoPicture");
autoPictureCheckbox.addEventListener("input", () => {
  currentDevice.autoPicture = autoPictureCheckbox.checked;
});
onCurrentDevice((device) => {
  device.addEventListener(
    "autoPicture",
    () => {
      autoPictureCheckbox.checked = device.autoPicture;
    },
    { immediate: true },
  );
});

/** @type {HTMLPreElement} */
const cameraConfigurationPre = document.getElementById(
  "cameraConfigurationPre",
);
onCurrentDevice((device) => {
  device.addEventListener(
    "getCameraConfiguration",
    () => {
      cameraConfigurationPre.textContent = JSON.stringify(
        device.cameraConfiguration,
        null,
        2,
      );
    },
    { immediate: true },
  );
});

const cameraConfigurationContainer = document.getElementById(
  "cameraConfiguration",
);
/** @type {HTMLTemplateElement} */
const cameraConfigurationTypeTemplate = document.getElementById(
  "cameraConfigurationTypeTemplate",
);
BS.CameraConfigurationTypes.forEach((cameraConfigurationType) => {
  const cameraConfigurationTypeContainer =
    cameraConfigurationTypeTemplate.content
      .cloneNode(true)
      .querySelector(".cameraConfigurationType");

  cameraConfigurationContainer.appendChild(cameraConfigurationTypeContainer);

  cameraConfigurationTypeContainer.querySelector(".type").innerText =
    cameraConfigurationType;

  /** @type {HTMLInputElement} */
  const input = cameraConfigurationTypeContainer.querySelector("input");

  /** @type {HTMLSpanElement} */
  const span = cameraConfigurationTypeContainer.querySelector("span");

  onCurrentDevice((device) => {
    device.addEventListener(
      "isConnected",
      () => {
        updateIsInputDisabled();
      },
      { immediate: true },
    );
    updateContainerVisibility();
    device.addEventListener(
      "cameraStatus",
      () => {
        updateIsInputDisabled();
      },
      { immediate: true },
    );
  });
  const updateIsInputDisabled = () => {
    input.disabled =
      !currentDevice.isConnected ||
      !currentDevice.hasCamera ||
      currentDevice.cameraStatus != "idle";
  };

  const updateContainerVisibility = () => {
    const isVisible =
      cameraConfigurationType in currentDevice.cameraConfiguration;
    cameraConfigurationTypeContainer.style.display = isVisible ? "" : "none";
  };

  const updateInput = () => {
    const value = currentDevice.cameraConfiguration[cameraConfigurationType];
    span.innerText = value;
    input.value = value;
  };
  onCurrentDevice((device) => {
    device.addEventListener(
      "connected",
      () => {
        if (!device.hasCamera) {
          return;
        }
        const range = device.cameraConfigurationRanges[cameraConfigurationType];
        input.min = range.min;
        input.max = range.max;

        updateInput();
      },
      { immediate: true },
    );

    device.addEventListener(
      "getCameraConfiguration",
      () => {
        updateInput();
      },
      { immediate: true },
    );
  });

  input.addEventListener("change", () => {
    const value = Number(input.value);
    // console.log(`updating ${cameraConfigurationType} to ${value}`);
    currentDevice.setCameraConfiguration({
      [cameraConfigurationType]: value,
    });
    if (takePictureAfterUpdate) {
      currentDevice.addEventListener(
        "getCameraConfiguration",
        () => {
          (setTimeout(() => currentDevice.takePicture()), 100);
        },
        { once: true },
      );
    }
  });
});

/** @type {HTMLInputElement} */
const takePictureAfterUpdateCheckbox = document.getElementById(
  "takePictureAfterUpdate",
);
let takePictureAfterUpdate = false;
takePictureAfterUpdateCheckbox.addEventListener("input", () => {
  takePictureAfterUpdate = takePictureAfterUpdateCheckbox.checked;
  console.log({ takePictureAfterUpdate });
});

/** @type {HTMLInputElement} */
const cameraWhiteBalanceInput = document.getElementById("cameraWhiteBalance");
const updateWhiteBalance = BS.ThrottleUtils.throttle(
  (config) => {
    if (currentDevice.cameraStatus != "idle") {
      return;
    }

    currentDevice.setCameraConfiguration(config);

    if (takePictureAfterUpdate) {
      currentDevice.addEventListener(
        "getCameraConfiguration",
        () => {
          (setTimeout(() => currentDevice.takePicture()), 100);
        },
        { once: true },
      );
    }
  },
  200,
  true,
);
cameraWhiteBalanceInput.addEventListener("input", () => {
  let [redGain, greenGain, blueGain] = cameraWhiteBalanceInput.value
    .replace("#", "")
    .match(/.{1,2}/g)
    .map((value) => Number(`0x${value}`))
    .map((value) => value / 255)
    .map(
      (value) => value * currentDevice.cameraConfigurationRanges.blueGain.max,
    )
    .map((value) => Math.round(value));

  updateWhiteBalance({ redGain, greenGain, blueGain });
});
const updateCameraWhiteBalanceInput = () => {
  if (!currentDevice.hasCamera) {
    return;
  }
  cameraWhiteBalanceInput.disabled =
    !currentDevice.isConnected ||
    !currentDevice.hasCamera ||
    currentDevice.cameraStatus != "idle";

  const { redGain, blueGain, greenGain } = currentDevice.cameraConfiguration;

  cameraWhiteBalanceInput.value = `#${[redGain, blueGain, greenGain]
    .map((value) => value / currentDevice.cameraConfigurationRanges.redGain.max)
    .map((value) => value * 255)
    .map((value) => Math.round(value))
    .map((value) => value.toString(16))
    .join("")}`;
};
onCurrentDevice((device) => {
  updateCameraWhiteBalanceInput();
  device.addEventListener(
    "getCameraConfiguration",
    () => {
      updateCameraWhiteBalanceInput();
    },
    { immediate: true },
  );
});

// ROTATE PICTURE

import * as three from "../utils/three/three.module.min.js";

/** @type {import("../utils/three/three.module.min")} */
const THREE = three;
window.THREE = THREE;

const orientationVector3 = new THREE.Vector3();

const euler = new THREE.Euler();
euler.order = "YXZ";
const quaternion = new THREE.Quaternion();
let cameraRoll = 0;

let rotatePicture = false;
const rotatePictureCheckbox = document.getElementById("rotatePicture");
rotatePictureCheckbox.addEventListener("input", () => {
  rotatePicture = rotatePictureCheckbox.checked;
  console.log({ rotatePicture });
  updateRotation();
});
onCurrentDevice((device) => {
  device.addEventListener(
    "isConnected",
    () => {
      const enabled =
        device.isConnected &&
        (device.hasSensorType("gameRotation") ||
          device.hasSensorType("orientation"));
      rotatePictureCheckbox.disabled = !enabled;
    },
    { immediate: true },
  );
  updateRotation();
});
const updateRotation = () => {
  if (!rotatePicture) {
    cameraImageParent.style.transform = `rotate(${0}rad)`;
  }
  if (!currentDevice.isConnected) {
    return;
  }
  /** @type {BS.SensorType} */
  const sensorType = currentDevice.hasSensorType("gameRotation")
    ? "gameRotation"
    : "orientation";
  currentDevice.setSensorConfiguration({
    [sensorType]: rotatePicture ? 40 : 0,
  });
};
onCurrentDevice((device) => {
  device.addEventListener("gameRotation", (event) => {
    quaternion.copy(event.message.gameRotation);
    euler.setFromQuaternion(quaternion);
    console.log({ cameraRoll: euler.z });
  });
  device.addEventListener("orientation", (event) => {
    const { heading, pitch, roll } = event.message.orientation;
    orientationVector3.set(pitch, heading, roll).multiplyScalar(Math.PI / 180);
    euler.setFromVector3(orientationVector3);
    console.log({ cameraRoll: euler.z });
  });

  device.addEventListener(
    "cameraStatus",
    () => {
      if (rotatePicture && device.cameraStatus == "takingPicture") {
        cameraRoll = euler.z;
        console.log({ cameraRoll });
      }
    },
    { immediate: true },
  );
});
cameraImage.addEventListener("load", () => {
  if (rotatePicture) {
    cameraImageParent.style.transform = `rotate(${-cameraRoll}rad)`;
  } else {
    cameraImageParent.style.transform = `rotate(${0}rad)`;
  }
});
