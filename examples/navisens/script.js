import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;

const device = new BS.Device();
window.device = device;

// CONNECTION START
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
// CONNECTION END

// NAVISENS API KEY START
let navisensApiKey = "";
const navisensApiKeyLength = 48;
const setNavisensApiKey = (newNavisensApiKey) => {
  navisensApiKey = newNavisensApiKey;
  console.log({ navisensApiKey });
  navisensApiKeyInput.value = navisensApiKey;
  toggleNavisensButton.disabled =
    !didStartNavisens && navisensApiKey.length != navisensApiKeyLength;
  saveNavisensApiKeytoLocalStorage();
};
const loadNavisensApiKeyFromLocalStorage = () => {
  const _navisensApiKey = localStorage.getItem(navisensApiKeyLocalStorageKey);
  console.log({ _navisensApiKey });
  if (_navisensApiKey) {
    setNavisensApiKey(_navisensApiKey);
  }
};
let navisensApiKeyLocalStorageKey = "navisens";
const saveNavisensApiKeytoLocalStorage = () => {
  if (navisensApiKey.length != navisensApiKeyLength) {
    return;
  }
  localStorage.setItem(navisensApiKeyLocalStorageKey, navisensApiKey);
};
window.addEventListener("beforeunload", () => {
  saveNavisensApiKeytoLocalStorage();
});
window.addEventListener("load", () => {
  loadNavisensApiKeyFromLocalStorage();

  const url = new URL(location.href);
  const { searchParams } = url;
  if (searchParams.has("apikey")) {
    setNavisensApiKey(searchParams.get("apikey"));
    searchParams.delete("apikey");
    window.history.replaceState({}, "", url.toString());
  }
});

const navisensApiKeyInput = document.getElementById("navisensApiKey");
navisensApiKeyInput.addEventListener("input", (event) => {
  setNavisensApiKey(event.target.value);
});
// NAVISENS API KEY END

// SENSOR RATE START
let sensorRate = 50;
const setSensorRate = (newSensorRate) => {
  sensorRate = newSensorRate;
  console.log({ sensorRate });
  sensorRateInput.value = sensorRate;
};
const sensorRateInput = document.getElementById("sensorRate");
sensorRateInput.addEventListener("input", (event) => {
  setSensorRate(+event.target.value);
});
// SENSOR RATE END

// SENSOR DATA START
let includeMagnetometer = false;
const setIncludeMagnetometer = (newIncludeMagnetometer) => {
  includeMagnetometer = newIncludeMagnetometer;
  console.log({ includeMagnetometer });
  includeMagnetometerCheckbox.checked = includeMagnetometer;
};
const includeMagnetometerCheckbox = document.getElementById(
  "includeMagnetometer"
);
includeMagnetometerCheckbox.addEventListener("input", (event) => {
  setIncludeMagnetometer(event.target.checked);
});

const toggleSensorData = async () => {
  latestSensorData = undefined;
  if (device.sensorConfiguration.acceleration) {
    await device.clearSensorConfiguration();
  } else {
    await device.setSensorConfiguration({
      acceleration: 20,
      gyroscope: 20,
      magnetometer: includeMagnetometer ? 20 : 0,
    });
  }
};

const toggleSensorDataButton = document.getElementById("toggleSensorData");
toggleSensorDataButton.addEventListener("click", () => {
  toggleSensorData();
});

device.addEventListener("getSensorConfiguration", () => {
  const enabled = device.sensorConfiguration.acceleration;
  includeMagnetometerCheckbox.disabled = enabled;
  toggleSensorDataButton.innerText = enabled
    ? "disable motion"
    : "enable motion";
});
device.addEventListener("isConnected", () => {
  toggleSensorDataButton.disabled = !device.isConnected;
});

const gravitySalar = 9.81;
/** @type {{acceleration: BS.Vector3, gyroscope: BS.Vector3, magnetometer?: BS.Vector3, timestamp: number}} */
let latestSensorData;
/** @type {HTMLPreElement} */
const sensorDataPre = document.getElementById("sensorData");

device.addEventListener("sensorData", (event) => {
  const { message } = event;
  const { timestamp, isLast } = message;
  latestSensorData = latestSensorData ?? {
    timestamp,
  };
  if (latestSensorData.timestamp != timestamp) {
    console.error(
      `invalid timestamp ${timestamp}, expected ${latestSensorData.timestamp}`
    );
    return;
  }
  switch (message.sensorType) {
    case "acceleration":
      latestSensorData.acceleration = message.acceleration;
      break;
    case "gyroscope":
      latestSensorData.gyroscope = message.gyroscope;
      break;
    case "magnetometer":
      latestSensorData.magnetometer = message.magnetometer;
      break;
  }
  if (isLast) {
    //console.log("latestSensorData", latestSensorData);
    const { acceleration, gyroscope, magnetometer } = latestSensorData;
    sensorDataPre.textContent = JSON.stringify(
      {
        timestamp,
        gyroscope,
        acceleration,
        magnetometer,
      },
      null,
      2
    );
    if (acceleration && gyroscope && (!includeMagnetometer || magnetometer)) {
      inputMotion(
        timestamp,
        {
          x: gyroscope.x,
          y: -gyroscope.z,
          z: gyroscope.y,
        },
        {
          x: -acceleration.x * gravitySalar,
          y: acceleration.z * gravitySalar,
          z: -acceleration.y * gravitySalar,
        },
        includeMagnetometer
          ? {
              x: -magnetometer.x,
              y: magnetometer.z,
              z: -magnetometer.y,
            }
          : undefined
      );
    } else {
      console.log("incomplete latestSensorData - skipping");
    }
    latestSensorData = undefined;
  }
});
// SENSOR DATA END

// NAVISENS START
window.Module = {
  preRun: [],
  postRun: [],

  onRuntimeInitialized: function () {
    const releaseId =
      window.Module && window.Module.__navisensReleaseId
        ? String(window.Module.__navisensReleaseId)
        : "";
    console.log({ releaseId });
  },
  print: function (text) {
    if (text) {
      console.log(text);
    }
  },
  printErr: function (text) {
    if (text) {
      console.error(text);
    }
  },
};

/**
 * @typedef {Object} NavisensMotionStats
 * @property {Object} environment
 * @property {Object} mobility
 * @property {Object} motion
 */
/**
 * @typedef {Object} NavisensStartParams
 * @property {string} developerKey
 * @property {"browser" | "external"} inputSource
 * @property {"phone" | "headmounted" | "other"} deviceType
 * @property {boolean} loggingEnabled
 * @property {number} updateIntervalMs
 * @property {boolean} slamPathEnabled
 */

/** @typedef {(timestampS: number, gyroX: number, gyroY: number, gyroZ: number, accX: number, accY: number, accZ: number, magX: number, magY: number, magZ: number) => void} NavisensInputMotionFunction */

/**
 * @typedef {Object} Navisens
 * @property {() => NavisensMotionStats} getMotionStats
 * @property {(a: number, b: number, c: number, d: number) => void} inputGlobalLocation
 * @property {NavisensInputMotionFunction} inputMotion
 * @property {(path:string) => void} locateFile
 * @property {() => void} onRuntimeInitialized
 * @property {any[]} postRun
 * @property {any[]} preRun
 * @property {(text: string) => void} print
 * @property {(text: string) => void} printErr
 * @property {() => void} reset
 * @property {(params: NavisensStartParams) => void} start
 * @property {() => void} stop
 * @property {string} __navisensDefaultLocateFile
 * @property {string} __navisensExportsHardened
 * @property {string} __navisensReleaseBase
 * @property {string} __navisensReleaseId
 */

/** @type {Navisens} */
const Navisens = window.Module;
window.Navisens = Navisens;

function initNavisens() {
  const params = new URLSearchParams(window.location.search);
  const cacheBuster = params.get("cacheBuster") || params.get("v") || "";
  const publicBaseUrl = "https://www.navisens.com/web-sdk/";
  if (window.Module && cacheBuster) {
    window.Module.__navisensCacheBuster = cacheBuster;
  }

  function appendCacheBuster(url) {
    if (!cacheBuster) {
      return url;
    }
    const joiner = url.includes("?") ? "&" : "?";
    return `${url}${joiner}v=${encodeURIComponent(cacheBuster)}`;
  }

  function loadScript(url, onerror) {
    const script = document.createElement("script");
    script.async = true;
    script.src = url;
    script.onload = () => {
      console.log("waiting for navisens sdk to load");
    };
    if (onerror) {
      script.onerror = onerror;
    }
    document.body.appendChild(script);
  }

  const scriptUrl = appendCacheBuster(`${publicBaseUrl}motiondna.js`);
  loadScript(scriptUrl, () => {
    console.error("failed to load navisens sdk");
  });
}
initNavisens();
// NAVISENS END

// NAVISENS CALLBACKS START
/** @type {HTMLPreElement} */
const navisensUpdatePre = document.getElementById("navisensUpdate");

/** @type {NavisensUpdate[]} */
const navisensUpdates = [];

/**
 * @typedef {Object} NavisensPosition
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} header
 */
/**
 * @typedef {Object} NavisensUpdate
 * @property {NavisensPosition} position
 * @property {number} timestamp
 * @property {"in-place"} motion
 * @property {number?} attitude
 * @property {any?} global
 */
/** @param {NavisensUpdate} update */
const receive = (update) => {
  //console.log("receive", update);
  const { timestamp, position, motion } = update;
  navisensUpdatePre.textContent = JSON.stringify(
    {
      timestamp,
      motion,
      position,
    },
    null,
    2
  );

  navisensUpdates.push(update);
  drawNavisensPath();
};
const receivePath = (path) => {
  console.log("receivePath", { path });
};
const reportStatus = (statusCode, message) => {
  console.log("reportStatus", { statusCode, message });

  switch (statusCode) {
    case 1:
      setDidStartNavisens(false);
      break;
  }
};
Object.assign(window, { receive, receivePath, reportStatus });
// NAVISENS CALLBACKS END

// TOGGLE NAVISENS START
let didStartNavisens = false;
const setDidStartNavisens = (newDidStartNavisens) => {
  didStartNavisens = newDidStartNavisens;
  console.log({ didStartNavisens });
  toggleNavisensButton.innerText = didStartNavisens
    ? "stop navisens"
    : "start navisens";
  navisensApiKeyInput.disabled = didStartNavisens;
};
const startNavisens = () => {
  Navisens.start({
    developerKey: navisensApiKey,
    inputSource: useLocalSensorData ? "browser" : "external",
    deviceType: useLocalSensorData ? "phone" : "headmounted",
    loggingEnabled: true,
    updateIntervalMs: sensorRate,
    slamPathEnabled: false,
  });
  setDidStartNavisens(true);
};
const stopNavisens = () => {
  Navisens.stop();
  setDidStartNavisens(false);
};
const toggleNavisens = () => {
  if (didStartNavisens) {
    stopNavisens();
  } else {
    startNavisens();
  }
};
const toggleNavisensButton = document.getElementById("toggleNavisens");
toggleNavisensButton.addEventListener("click", () => toggleNavisens());
// TOGGLE NAVISENS END

// MOTION DATA START
/** @type {HTMLPreElement} */
const inputMotionPre = document.getElementById("inputMotion");

/**
 *
 * @param {number} timestampMs
 * @param {BS.Vector3} gyroscope
 * @param {BS.Vector3} acceleration
 * @param {BS.Vector3?} magnetometer
 */
const inputMotion = (timestampMs, gyroscope, acceleration, magnetometer) => {
  const timestampS = timestampMs / 1000;
  magnetometer = magnetometer ?? { x: 0, y: 0, z: 0 };
  inputMotionPre.textContent = JSON.stringify(
    {
      timestampS,
      gyroscope,
      acceleration,
      magnetometer,
    },
    null,
    2
  );
  if (didStartNavisens) {
    Navisens.inputMotion(
      timestampS,
      gyroscope.x,
      gyroscope.y,
      gyroscope.z,
      acceleration.x,
      acceleration.y,
      acceleration.z,
      magnetometer.x,
      magnetometer.y,
      magnetometer.z
    );
  }
};
// MOTION DATA END

// LOCAL MOTION DATA START
const isDeviceMotionAvailable =
  typeof DeviceMotionEvent.requestPermission == "function";

let didGetLocalSensorDataPermission = false;
const getLocalSensorDataPermission = async () => {
  if (didGetLocalSensorDataPermission) {
    return;
  }
  const permission = await DeviceMotionEvent.requestPermission();
  didGetLocalSensorDataPermission = permission == "granted";
  console.log({ didGetLocalSensorDataPermission });
  setUseLocalSensorData(false);
};

let useLocalSensorData = false;
const setUseLocalSensorData = async (newUseLocalSensorData) => {
  useLocalSensorData = newUseLocalSensorData;
  console.log({ useLocalSensorData });
  useLocalSensorDataCheckbox.checked = useLocalSensorData;

  if (useLocalSensorData) {
    getLocalSensorDataPermission();
  }

  if (useLocalSensorData) {
    window.addEventListener("devicemotion", onDeviceMotion);
  } else {
    window.removeEventListener("devicemotion", onDeviceMotion);
  }
};
const useLocalSensorDataCheckbox =
  document.getElementById("useLocalSensorData");
useLocalSensorDataCheckbox.addEventListener("input", (event) => {
  setUseLocalSensorData(event.target.checked);
});
useLocalSensorDataCheckbox.disabled = !isDeviceMotionAvailable;

/** @type {HTMLPreElement} */
const localSensorDataPre = document.getElementById("localSensorData");

/** @param {DeviceMotionEvent} event */
const onDeviceMotion = (event) => {
  const { rotationRate, accelerationIncludingGravity } = event;
  if (!accelerationIncludingGravity || !rotationRate) {
    return;
  }
  const timestamp = Date.now();
  localSensorDataPre.textContent = JSON.stringify(
    {
      timestamp,
      rotationRate,
      accelerationIncludingGravity,
    },
    null,
    2
  );
  const { alpha, beta, gamma } = rotationRate;
  inputMotion(
    timestamp,
    { x: alpha, y: beta, z: gamma },
    accelerationIncludingGravity
  );
};
// LOCAL MOTION DATA END

// NAVISENS PATH START
/** @type {HTMLCanvasElement} */
const navisensPathCanvas = document.getElementById("navisensPath");
const navisensPathContext = navisensPathCanvas.getContext("2d");
const navisensPathOptions = {
  size: { width: 20, height: 20 },
  center: { x: 0, y: 0 },
  path: {
    color: "white",
    lineWidth: 5,
  },
  marker: {
    color: "red",
    radius: 6,
  },
  /** @param {NavisensUpdate} update */
  getCanvasPosition(update) {
    const { x, y } = update.position;
    const canvasPosition = {
      x:
        ((x - this.center.x) / this.size.width + 0.5) *
        navisensPathCanvas.width,
      y:
        ((-y - this.center.y) / this.size.height + 0.5) *
        navisensPathCanvas.height,
    };
    //console.log("getCanvasPosition", update, canvasPosition);
    return canvasPosition;
  },
};
const drawNavisensPath = () => {
  const canvas = navisensPathCanvas;
  const ctx = navisensPathContext;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (navisensUpdates.length == 0) {
    return;
  }
  ctx.strokeStyle = navisensPathOptions.path.color;
  ctx.lineWidth = navisensPathOptions.path.lineWidth;
  ctx.beginPath();
  navisensUpdates.forEach((update) => {
    const { x, y } = navisensPathOptions.getCanvasPosition(update);
    ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = navisensPathOptions.marker.color;
  ctx.beginPath();
  const markerPosition = navisensPathOptions.getCanvasPosition(
    navisensUpdates.at(-1)
  );
  ctx.arc(
    markerPosition.x,
    markerPosition.y,
    navisensPathOptions.marker.radius,
    0,
    2 * Math.PI
  );
  ctx.fill();
};
// NAVISENS PATH END
