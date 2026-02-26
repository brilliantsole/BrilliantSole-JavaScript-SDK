let moduleReady = false;
let isRunning = false;
let hasStarted = false;
let hasOutput = false;
let awaitingBuildLine = false;
let sdkFailureSeen = false;
let sdkInitWatchdog = null;

const toggleButton = document.getElementById("toggleButton");
const runStateValue = document.getElementById("runStateValue");
const sdkStatusValue = document.getElementById("sdkStatusValue");
const sdkMessageValue = document.getElementById("sdkMessageValue");
const motionStatus = document.getElementById("motionStatus");
const buildText = document.getElementById("buildText");
const inputBrowserButton = document.getElementById("inputBrowserButton");
const inputExternalButton = document.getElementById("inputExternalButton");
const inputModeNote = document.getElementById("inputModeNote");
const developerKey = new URL(location.href).searchParams.get("apikey"); // Request a key at https://www.navisens.com/request-key
const DEFAULT_UPDATE_INTERVAL_MS = 50;
const INPUT_SOURCE = Object.freeze({
  browser: "browser",
  external: "external",
});
const INPUT_SOURCE_NOTES = Object.freeze({
  browser: "Browser mode: SDK reads device sensors directly.",
  external:
    "External mode scaffold: this demo routes raw DeviceMotionEvent values into inputMotion(...).",
});
let selectedInputSource = INPUT_SOURCE.browser;
let externalFeedCleanup = null;
let updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS;

const plotCanvas = document.getElementById("positionPlot");
const plotContext = plotCanvas.getContext("2d");
const plotState = {
  points: [],
  minX: -2.5,
  maxX: 2.5,
  minY: -2.5,
  maxY: 2.5,
  pixelWidth: 0,
  pixelHeight: 0,
};

function setRunState(state) {
  if (!runStateValue) {
    return;
  }
  runStateValue.textContent = state || "--";
}

function setSdkStatus(text) {
  if (!sdkStatusValue) {
    return;
  }
  sdkStatusValue.textContent = text || "--";
}

function setSdkMessage(text) {
  if (!sdkMessageValue) {
    return;
  }
  sdkMessageValue.textContent = text || "--";
}

function setRunningState(running) {
  isRunning = running;
  toggleButton.textContent = running ? "Stop" : "Start";
  toggleButton.classList.toggle("danger", running);
  toggleButton.classList.toggle("primary", !running);
  updateInputModeUi();
}

function updateInputModeUi() {
  if (!inputBrowserButton || !inputExternalButton || !inputModeNote) {
    return;
  }
  inputBrowserButton.classList.toggle(
    "selected",
    selectedInputSource === INPUT_SOURCE.browser
  );
  inputExternalButton.classList.toggle(
    "selected",
    selectedInputSource === INPUT_SOURCE.external
  );
  inputBrowserButton.disabled = isRunning;
  inputExternalButton.disabled = isRunning;
  inputModeNote.textContent = INPUT_SOURCE_NOTES[selectedInputSource];
}

function setInputSource(source) {
  if (isRunning) {
    return;
  }
  if (source !== INPUT_SOURCE.browser && source !== INPUT_SOURCE.external) {
    return;
  }
  selectedInputSource = source;
  updateInputModeUi();
}

function clearSdkInitWatchdog() {
  if (sdkInitWatchdog) {
    clearTimeout(sdkInitWatchdog);
    sdkInitWatchdog = null;
  }
}

function startSdkInitWatchdog() {
  clearSdkInitWatchdog();
  sdkInitWatchdog = setTimeout(() => {
    if (moduleReady) {
      return;
    }
    setRunState("Error");
    setSdkStatus("SDK load failed");
    setSdkMessage(
      "SDK runtime did not initialize. Retry with ?cacheBuster=<timestamp>."
    );
  }, 15000);
}

function handleSdkBuildLine(text) {
  if (!text) {
    return;
  }
  if (awaitingBuildLine) {
    buildText.textContent = `BUILD ${text.trim()}`;
    awaitingBuildLine = false;
    return;
  }
  if (text.includes("SDK Build:")) {
    awaitingBuildLine = true;
  }
}

function formatValue(value, digits) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }
  return value.toFixed(digits);
}

function resizePlot() {
  const rect = plotCanvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  plotCanvas.width = Math.max(1, Math.round(rect.width * ratio));
  plotCanvas.height = Math.max(1, Math.round(rect.height * ratio));
  plotContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  plotState.pixelWidth = rect.width;
  plotState.pixelHeight = rect.height;
  drawPlot();
}

function updatePlotBounds(x, y) {
  if (plotState.points.length === 0) {
    plotState.minX = x;
    plotState.maxX = x;
    plotState.minY = y;
    plotState.maxY = y;
    return;
  }
  plotState.minX = Math.min(plotState.minX, x);
  plotState.maxX = Math.max(plotState.maxX, x);
  plotState.minY = Math.min(plotState.minY, y);
  plotState.maxY = Math.max(plotState.maxY, y);
}

function getPlotView() {
  const padding = 0.75;
  const width = Math.max(plotState.maxX - plotState.minX, 5);
  const height = Math.max(plotState.maxY - plotState.minY, 5);
  const size = Math.max(width, height) + padding * 2;
  const centerX = (plotState.minX + plotState.maxX) / 2;
  const centerY = (plotState.minY + plotState.maxY) / 2;
  return {
    minX: centerX - size / 2,
    maxX: centerX + size / 2,
    minY: centerY - size / 2,
    maxY: centerY + size / 2,
    size,
  };
}

function worldToCanvas(x, y, view, width, height) {
  const nx = (x - view.minX) / view.size;
  const ny = (y - view.minY) / view.size;
  return {
    x: nx * width,
    y: height - ny * height,
  };
}

function drawPlot() {
  const width = plotState.pixelWidth;
  const height = plotState.pixelHeight;
  if (!width || !height) {
    return;
  }

  plotContext.clearRect(0, 0, width, height);
  plotContext.fillStyle = "#0b0b0b";
  plotContext.fillRect(0, 0, width, height);

  const view = getPlotView();
  plotContext.save();
  plotContext.strokeStyle = "rgba(255, 255, 255, 0.12)";
  plotContext.lineWidth = 1;
  plotContext.setLineDash([6, 6]);

  const gridStartX = Math.floor(view.minX);
  const gridEndX = Math.ceil(view.maxX);
  const gridStartY = Math.floor(view.minY);
  const gridEndY = Math.ceil(view.maxY);

  for (let gx = gridStartX; gx <= gridEndX; gx += 1) {
    const start = worldToCanvas(gx, view.minY, view, width, height);
    const end = worldToCanvas(gx, view.maxY, view, width, height);
    plotContext.beginPath();
    plotContext.moveTo(start.x, start.y);
    plotContext.lineTo(end.x, end.y);
    plotContext.stroke();
  }

  for (let gy = gridStartY; gy <= gridEndY; gy += 1) {
    const start = worldToCanvas(view.minX, gy, view, width, height);
    const end = worldToCanvas(view.maxX, gy, view, width, height);
    plotContext.beginPath();
    plotContext.moveTo(start.x, start.y);
    plotContext.lineTo(end.x, end.y);
    plotContext.stroke();
  }

  plotContext.restore();

  if (plotState.points.length === 0) {
    return;
  }

  plotContext.fillStyle = "#2ecc71";
  for (let i = 0; i < plotState.points.length - 1; i++) {
    const point = plotState.points[i];
    const pos = worldToCanvas(point.x, point.y, view, width, height);
    plotContext.beginPath();
    plotContext.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
    plotContext.fill();
  }

  const latest = plotState.points[plotState.points.length - 1];
  const latestPos = worldToCanvas(latest.x, latest.y, view, width, height);
  plotContext.fillStyle = "#ff3b30";
  plotContext.beginPath();
  plotContext.arc(latestPos.x, latestPos.y, 5, 0, Math.PI * 2);
  plotContext.fill();
}

function receive(update) {
  const position = update && update.position ? update.position : {};
  const x = Number(position.x);
  const y = Number(position.y);
  const heading = Number(position.heading);
  const timestamp = update ? Number(update.timestamp) : Number.NaN;
  const motion = update && update.motion ? update.motion : "--";

  document.getElementById("posX").textContent = formatValue(x, 2);
  document.getElementById("posY").textContent = formatValue(y, 2);
  // Web SDK reports heading in radians; convert for display.
  const headingDegrees = Number.isFinite(heading)
    ? (heading * 180) / Math.PI
    : null;
  document.getElementById("posHeading").textContent = formatValue(
    headingDegrees,
    1
  );
  document.getElementById("posTime").textContent = formatValue(timestamp, 2);
  document.getElementById("posMotion").textContent = motion || "--";

  if (Number.isFinite(x) && Number.isFinite(y)) {
    if (
      !sdkFailureSeen &&
      !hasOutput &&
      Math.abs(x) <= 0.01 &&
      Math.abs(y) <= 0.01
    ) {
      hasOutput = true;
      if (isRunning) {
        setRunState("Running");
      } else if (hasStarted) {
        setRunState("Stopped");
      }
    }
    plotState.points.push({ x, y });
    updatePlotBounds(x, y);
    if (plotState.points.length > 2000) {
      plotState.points.shift();
      plotState.minX = plotState.points[0].x;
      plotState.maxX = plotState.points[0].x;
      plotState.minY = plotState.points[0].y;
      plotState.maxY = plotState.points[0].y;
      for (const point of plotState.points) {
        updatePlotBounds(point.x, point.y);
      }
    }
    drawPlot();
  }
}

function receivePath(path) {
  if (!Array.isArray(path) || path.length === 0) {
    return;
  }
  plotState.points = path
    .map((point) => ({
      x: Number(point.x),
      y: Number(point.y),
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (plotState.points.length === 0) {
    return;
  }
  plotState.minX = plotState.points[0].x;
  plotState.maxX = plotState.points[0].x;
  plotState.minY = plotState.points[0].y;
  plotState.maxY = plotState.points[0].y;
  for (const point of plotState.points) {
    updatePlotBounds(point.x, point.y);
  }
  drawPlot();
}

function reportStatus(statusCode, message) {
  const code = Number(statusCode);
  const hasCode = Number.isFinite(code);
  const text = message ? String(message).trim() : "";
  const normalized = text.toLowerCase();
  const looksError = /fail|error|denied|invalid|expired|restricted/.test(
    normalized
  );

  let statusLabel = "";
  if (hasCode && code === 0) {
    statusLabel = "OK";
  } else if (normalized.includes("expired")) {
    statusLabel = "SDK expired";
  } else if (normalized.includes("permission")) {
    statusLabel = "Permissions failed";
  } else if (normalized.includes("missing sensor")) {
    statusLabel = "Missing sensor";
  } else if (
    normalized.includes("sensor timing") ||
    normalized.includes("timing issue")
  ) {
    statusLabel = "Sensor timing";
  } else if (
    normalized.includes("restricted") ||
    normalized.includes("disallowed host") ||
    normalized.includes("authentication") ||
    normalized.includes("auth failed")
  ) {
    statusLabel = "Auth failed";
  } else if (hasCode && code !== 0) {
    statusLabel = `SDK error (code ${code})`;
  } else if (text) {
    statusLabel = "SDK error";
  }
  if (statusLabel) {
    setSdkStatus(statusLabel);
  }

  if (text) {
    setSdkMessage(text);
  } else if (hasCode && code === 0) {
    setSdkMessage("None");
  }

  const isSdkFailureCode = hasCode && code !== 0;
  if (isSdkFailureCode || looksError) {
    sdkFailureSeen = true;
    setRunState("Error");
    if (isRunning) {
      setRunningState(false);
    }
  }
}

async function requestMotionPermission() {
  if (typeof DeviceMotionEvent === "undefined") {
    motionStatus.textContent = "Unavailable";
    return false;
  }
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    try {
      const result = await DeviceMotionEvent.requestPermission();
      motionStatus.textContent = result === "granted" ? "Granted" : "Denied";
      return result === "granted";
    } catch (error) {
      motionStatus.textContent = "Denied";
      return false;
    }
  }
  motionStatus.textContent = "Granted";
  return true;
}

function callSdk(method, args = []) {
  if (!window.Module) {
    console.error("SDK Module is not available.");
    setRunState("Error");
    setSdkStatus("SDK error");
    setSdkMessage("SDK module is not loaded");
    return null;
  }
  const direct = Module[method];
  if (typeof direct === "function") {
    try {
      return direct.apply(Module, args);
    } catch (error) {
      console.error(error);
      setRunState("Error");
      setSdkStatus("SDK error");
      setSdkMessage(
        error && error.message ? error.message : `Module.${method} failed`
      );
      return null;
    }
  }
  console.error("SDK method not available: " + method);
  setRunState("Error");
  setSdkStatus("SDK error");
  setSdkMessage(`SDK method not available: ${method}`);
  return null;
}

function stopExternalImuFeed() {
  if (typeof externalFeedCleanup === "function") {
    externalFeedCleanup();
  }
  externalFeedCleanup = null;
}

function startExternalImuFeedScaffold() {
  stopExternalImuFeed();

  if (!window.Module || typeof window.Module.inputMotion !== "function") {
    setRunState("Error");
    setSdkStatus("SDK error");
    setSdkMessage("SDK Module.inputMotion is not available for external mode.");
    return false;
  }

  const inputMotion = window.Module.inputMotion.bind(window.Module);
  const onMotion = (event) => {
    if (!isRunning || selectedInputSource !== INPUT_SOURCE.external) {
      return;
    }

    const rotationRate = event.rotationRate || {};
    const accel = event.accelerationIncludingGravity || {};
    const timestampSec = Date.now() / 1000;
    const rotationRateAlpha = Number.isFinite(rotationRate.alpha)
      ? rotationRate.alpha
      : 0;
    const rotationRateBeta = Number.isFinite(rotationRate.beta)
      ? rotationRate.beta
      : 0;
    const rotationRateGamma = Number.isFinite(rotationRate.gamma)
      ? rotationRate.gamma
      : 0;
    const accelerationIncludingGravityX = Number.isFinite(accel.x)
      ? accel.x
      : 0;
    const accelerationIncludingGravityY = Number.isFinite(accel.y)
      ? accel.y
      : 0;
    const accelerationIncludingGravityZ = Number.isFinite(accel.z)
      ? accel.z
      : 0;

    try {
      // This scaffold does not provide magnetometer input; magX/Y/Z are set to 0.
      inputMotion(
        timestampSec,
        rotationRateAlpha,
        rotationRateBeta,
        rotationRateGamma,
        accelerationIncludingGravityX,
        accelerationIncludingGravityY,
        accelerationIncludingGravityZ,
        0,
        0,
        0
      );
    } catch (error) {
      console.error(error);
      setRunState("Error");
      setSdkStatus("SDK error");
      setSdkMessage(
        "Module.inputMotion failed while feeding external samples."
      );
      setRunningState(false);
      stopExternalImuFeed();
      callSdk("stop");
    }
  };

  window.addEventListener("devicemotion", onMotion);
  externalFeedCleanup = () => {
    window.removeEventListener("devicemotion", onMotion);
  };

  // Replace the scaffold above with your own external sampling pipeline as needed:
  // const stopExternalSampler = yourExternalSampler((sample) => {
  //   Module.inputMotion(sample.timestamp,
  //     sample.rotationRateAlpha, sample.rotationRateBeta, sample.rotationRateGamma,
  //     sample.accelerationIncludingGravityX, sample.accelerationIncludingGravityY, sample.accelerationIncludingGravityZ,
  //     sample.magX ?? 0, sample.magY ?? 0, sample.magZ ?? 0);
  // });
  // externalFeedCleanup = () => stopExternalSampler();

  return true;
}

function parseUpdateIntervalMs(params) {
  if (!params) {
    return DEFAULT_UPDATE_INTERVAL_MS;
  }
  const raw = params.get("updateMs") || params.get("updateIntervalMs");
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_UPDATE_INTERVAL_MS;
  }
  return Math.min(Math.max(Math.round(value), 10), 1000);
}

async function startRun() {
  if (!moduleReady) {
    setRunState("Loading");
    return;
  }
  if (!developerKey || developerKey === "<developer-key>") {
    setRunState("Stopped");
    setSdkStatus("Missing key");
    setSdkMessage(
      "Request a developer key at https://www.navisens.com/request-key"
    );
    return;
  }

  sdkFailureSeen = false;
  hasOutput = false;
  setRunState("Starting");
  setSdkStatus("Starting...");
  setSdkMessage("None");
  const granted = await requestMotionPermission();
  if (!granted) {
    setRunState("Stopped");
    setSdkStatus("Permissions failed");
    setSdkMessage("Motion permission denied");
    return;
  }
  if (!Module || typeof Module.start !== "function") {
    setRunState("Error");
    setSdkStatus("SDK error");
    setSdkMessage("SDK Module.start is not available");
    return;
  }

  hasStarted = true;
  setRunningState(true);

  try {
    const sdkInputSource =
      selectedInputSource === INPUT_SOURCE.external ? "external" : "browser";
    Module.start({
      developerKey,
      inputSource: sdkInputSource,
      deviceType: "phone",
      loggingEnabled: false,
      updateIntervalMs,
      slamPathEnabled: false,
    });
  } catch (error) {
    console.error(error);
    setRunningState(false);
    setRunState("Error");
    setSdkStatus("SDK error");
    setSdkMessage(
      error && error.message ? error.message : "Module.start failed"
    );
    return;
  }

  if (selectedInputSource === INPUT_SOURCE.external) {
    if (!startExternalImuFeedScaffold()) {
      setRunningState(false);
      callSdk("stop");
      return;
    }
  } else {
    stopExternalImuFeed();
  }

  if (sdkFailureSeen) {
    return;
  }

  if (hasOutput) {
    setRunState("Running");
  } else {
    setRunState("Loading");
  }
}

function stopRun() {
  if (!moduleReady) {
    return;
  }
  stopExternalImuFeed();
  callSdk("stop");
  setRunningState(false);
  setRunState("Stopped");
}

if (inputBrowserButton) {
  inputBrowserButton.addEventListener("click", () =>
    setInputSource(INPUT_SOURCE.browser)
  );
}
if (inputExternalButton) {
  inputExternalButton.addEventListener("click", () =>
    setInputSource(INPUT_SOURCE.external)
  );
}
updateInputModeUi();

toggleButton.addEventListener("click", async () => {
  if (isRunning) {
    stopRun();
    return;
  }
  await startRun();
});

window.addEventListener("resize", () => {
  window.requestAnimationFrame(resizePlot);
});

window.requestAnimationFrame(resizePlot);

window.Module = {
  preRun: [],
  postRun: [],
  onRuntimeInitialized: function () {
    clearSdkInitWatchdog();
    moduleReady = true;
    setSdkStatus("Loaded");
    setSdkMessage("None");
    const releaseId =
      window.Module && window.Module.__navisensReleaseId
        ? String(window.Module.__navisensReleaseId)
        : "";
    if (releaseId && buildText && buildText.textContent.trim() === "BUILD --") {
      buildText.textContent = `BUILD ${releaseId}`;
    }
    if (!hasStarted && !hasOutput) {
      setRunState("Ready");
    }
  },
  print: function (text) {
    if (text) {
      handleSdkBuildLine(text);
      console.log(text);
    }
  },
  printErr: function (text) {
    if (text) {
      console.error(text);
    }
  },
};

(function () {
  const params = new URLSearchParams(window.location.search);
  const cacheBuster = params.get("cacheBuster") || params.get("v") || "";
  updateIntervalMs = parseUpdateIntervalMs(params);
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
      startSdkInitWatchdog();
    };
    if (onerror) {
      script.onerror = onerror;
    }
    document.body.appendChild(script);
  }

  const scriptUrl = appendCacheBuster(`${publicBaseUrl}motiondna.js`);
  loadScript(scriptUrl, () => {
    setRunState("Error");
    setSdkStatus("SDK load failed");
    setSdkMessage("Failed to load SDK loader from navisens.com.");
  });
})();
