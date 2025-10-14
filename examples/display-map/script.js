import * as BS from "../../build/brilliantsole.module.js";

// DEVICE
const device = new BS.Device();
window.device = device;
window.BS = BS;

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

// CANVAS
/** @type {HTMLCanvasElement} */
const displayCanvas = document.getElementById("display");

// DISPLAY CANVAS HELPER
const displayCanvasHelper = new BS.DisplayCanvasHelper();
// displayCanvasHelper.setBrightness("veryLow");
displayCanvasHelper.canvas = displayCanvas;
window.displayCanvasHelper = displayCanvasHelper;

device.addEventListener("connected", () => {
  if (device.isDisplayAvailable) {
    displayCanvasHelper.device = device;
  } else {
    console.error("device doesn't have a display");
    device.disconnect();
  }
});
displayCanvasHelper.addEventListener("deviceUpdated", async () => {
  await draw();
});

// BRIGHTNESS
/** @type {HTMLSelectElement} */
const setDisplayBrightnessSelect = document.getElementById(
  "setDisplayBrightnessSelect"
);
/** @type {HTMLOptGroupElement} */
const setDisplayBrightnessSelectOptgroup =
  setDisplayBrightnessSelect.querySelector("optgroup");
BS.DisplayBrightnesses.forEach((displayBrightness) => {
  setDisplayBrightnessSelectOptgroup.appendChild(new Option(displayBrightness));
});
setDisplayBrightnessSelect.addEventListener("input", () => {
  displayCanvasHelper.setBrightness(setDisplayBrightnessSelect.value);
});

setDisplayBrightnessSelect.value = displayCanvasHelper.brightness;

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
  true
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
displayCanvasHelper.setColor(1, "white");
displayCanvasHelper.setColor(2, "turquoise");
displayCanvasHelper.setColor(3, "red");
displayCanvasHelper.flushContextCommands();

// DRAW
let isDrawing = false;
let isWaitingToRedraw = false;

let isUploading = false;
displayCanvasHelper.addEventListener("deviceSpriteSheetUploadStart", () => {
  isUploading = true;
});
displayCanvasHelper.addEventListener("deviceSpriteSheetUploadComplete", () => {
  isUploading = false;
});

let didLoad = false;
let drawSpriteAsIs = false;
const mapLocation = {
  isRelative: true,
  x: 0.5,
  y: 0.5,
};
const cursorOffset = {
  x: 0,
  y: 70,
};
const compassPadding = {
  x: 140,
  y: 0,
};
const mapSize = { isRelative: false, width: 300, height: 200 };
const draw = async () => {
  if (isUploading) {
    console.log("busy uploading");
    return;
  }
  if (!didLoad) {
    console.log("hasn't loaded yet");
    return;
  }

  if (isDrawing) {
    //console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }
  isDrawing = true;

  //console.log("drawing...");

  if (mapData) {
    await displayCanvasHelper.saveContext();

    // console.log("drawing map...");
    const x = mapLocation.isRelative
      ? displayCanvasHelper.width * mapLocation.x
      : mapLocation.x;
    const y = mapLocation.isRelative
      ? displayCanvasHelper.height * mapLocation.y
      : mapLocation.y;
    const width = mapSize.isRelative
      ? displayCanvasHelper.width * mapSize.width
      : mapSize.width;
    const height = mapSize.isRelative
      ? displayCanvasHelper.height * mapSize.height
      : mapSize.height;
    //console.log({ x, y, width, height });
    await displayCanvasHelper.saveContext();
    await displayCanvasHelper.setIgnoreFill(true);
    await displayCanvasHelper.setLineWidth(3);
    await displayCanvasHelper.drawRoundRect(x, y, width + 10, height + 10, 10);
    await displayCanvasHelper.restoreContext();

    if (!drawSpriteAsIs) {
      await displayCanvasHelper.selectSpriteColor(1, 1);
      await displayCanvasHelper.selectSpriteColor(2, 2);
      await displayCanvasHelper.selectSpriteColor(3, 3);
      await displayCanvasHelper.startSprite(x, y, width, height);
    }
    await displayCanvasHelper.selectSpriteSheet("map");
    await displayCanvasHelper.setSpriteScale(scale);
    await displayCanvasHelper.setRotation(heading, false);
    if (!drawSpriteAsIs) {
      const [x, y] = project(latitude, longitude);
      const [cx, cy] = project(latestMapDataLatitude, latestMapDataLongitude);
      const dx = (x - cx) * scale;
      const dy = (y - cy) * scale;
      const headingRad = degreesToRadians(heading);
      const offsetX = dx * Math.cos(headingRad) - dy * Math.sin(headingRad);
      const offsetY = dx * Math.sin(headingRad) + dy * Math.cos(headingRad);
      // console.log({ dx, dy });
      await displayCanvasHelper.drawSprite(
        -offsetX + cursorOffset.x,
        -offsetY + cursorOffset.y,
        "map"
      );
      await displayCanvasHelper.saveContext();
      await displayCanvasHelper.setLineWidth(0);
      await displayCanvasHelper.selectFillColor(3);
      await displayCanvasHelper.drawCircle(cursorOffset.x, cursorOffset.y, 10);
      await displayCanvasHelper.restoreContext();
    } else {
      await displayCanvasHelper.selectSpriteColor(1, 1);
      await displayCanvasHelper.selectSpriteColor(2, 2);
      await displayCanvasHelper.selectSpriteColor(3, 3);
      await displayCanvasHelper.drawSprite(x, y, "map");
    }
    if (!drawSpriteAsIs) {
      await displayCanvasHelper.endSprite();
    }
    await displayCanvasHelper.restoreContext();
    await displayCanvasHelper.resetSpriteColors();
  }

  {
    await displayCanvasHelper.saveContext();
    await displayCanvasHelper.selectSpriteColor(1, 1);
    await displayCanvasHelper.selectSpriteSheet("english");
    await displayCanvasHelper.setVerticalAlignment("center");
    await displayCanvasHelper.setHorizontalAlignment("center");
    const _heading = (heading + 45) % 360;
    const sign =
      headingSigns.find((headingSign) => {
        const { min, max } = headingRanges[headingSign];
        return _heading >= min && _heading <= max;
      }) ?? headingSigns[0];
    // console.log({ sign, heading });
    const { min, max } = headingRanges[sign];
    const interpolation = (_heading - min) / (max - min);
    // console.log({ sign, interpolation, _heading, min, max });
    const x =
      interpolation * (displayCanvasHelper.width - compassPadding.x * 2) +
      compassPadding.x;
    const sinInterpolation = Math.sin(interpolation * Math.PI);
    // console.log({ sinInterpolation });
    const y = sinInterpolation * -30;
    await displayCanvasHelper.setRotation(
      Math.sign(interpolation - 0.5) * (1 - sinInterpolation) * 20,
      false
    );
    await displayCanvasHelper.setSpriteScale(0.5 + 0.5 * sinInterpolation);
    await displayCanvasHelper.drawSprite(x, y + 80, sign);

    await displayCanvasHelper.restoreContext();
  }

  await displayCanvasHelper.show();
};
window.draw = draw;

displayCanvasHelper.addEventListener("ready", () => {
  isDrawing = false;
  if (isWaitingToRedraw) {
    isWaitingToRedraw = false;
    draw();
  }
});

// PROGRESS

/** @type {HTMLProgressElement} */
const fileTransferProgress = document.getElementById("fileTransferProgress");

device.addEventListener("fileTransferProgress", (event) => {
  const progress = event.message.progress;
  //console.log({ progress });
  fileTransferProgress.value = progress == 1 ? 0 : progress;
});
device.addEventListener("fileTransferStatus", () => {
  if (device.fileTransferStatus == "idle") {
    fileTransferProgress.value = 0;
  }
});

// URL

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// GPS

let mapData;
const places = [];
let placeDistanceThreshold = 300; // m
let placeRelativeAngleThreshold = 10; // degrees
let selectedPlace;
let previouslySelectedPlace;
const selectPlace = (newSelectedPlace) => {
  if (selectedPlace == newSelectedPlace) {
    return;
  }
  previouslySelectedPlace = selectedPlace;
  selectedPlace = newSelectedPlace;
  console.log("selectedPlace", selectedPlace);
};
const updateClosestPlace = () => {
  let closestPlace;
  let closestPlaceDistance = placeDistanceThreshold;
  let closestPlaceAbsRelativeAngle = placeRelativeAngleThreshold;
  if (mapData && places.length) {
    const [cx, cy] = project(latitude, longitude);
    places.forEach((place) => {
      const { type, tags } = place;
      const { name } = tags;
      if (type == "node") {
        const { lat, lon } = place;
        const [x, y] = project(lat, lon);
        const dx = x - cx;
        const dy = y - cy;
        const angle = radiansToDegrees(Math.atan2(-dy, dx) - Math.PI / 2);
        let relativeAngle = normalizeDegrees(angle - heading);
        if (relativeAngle > 180) {
          relativeAngle -= 360;
        }
        const absRelativeAngle = Math.abs(relativeAngle);
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        //console.log(name, { dx, dy, angle, relativeAngle, distance });
        if (
          distance <= closestPlaceDistance &&
          absRelativeAngle <= closestPlaceAbsRelativeAngle
        ) {
          //console.log("updated closest place", tags.name);
          closestPlace = place;
          closestPlaceDistance = distance;
          closestPlaceAbsRelativeAngle = absRelativeAngle;
        }
      } else if (type == "way") {
        const { nodes: nodeIndices } = place;
        const nodes = nodeIndices.map((nodeIndex) => allNodes[nodeIndex]);
        //console.log("nodes", nodes);
        const nodePositions = nodes.map((node) => {
          const [x, y] = project(node.lat, node.lon);
          return { x, y };
        });
        //console.log("nodePositions", nodePositions);
        let distance = Infinity;
        const angleRange = new BS.RangeHelper();
        nodePositions.forEach((position) => {
          const { x, y } = position;
          const dx = x - cx;
          const dy = y - cy;
          const angle = radiansToDegrees(Math.atan2(-dy, dx) - Math.PI / 2);
          let relativeAngle = normalizeDegrees(angle - heading);
          if (relativeAngle > 180) {
            relativeAngle -= 360;
          }
          // console.log({ relativeAngle });
          angleRange.update(relativeAngle);
          const _distance = Math.sqrt(dx ** 2 + dy ** 2);
          distance = Math.min(distance, _distance);
        });
        //console.log(name, { distance }, angleRange.min, angleRange.max);
        let absRelativeAngle;
        const minAbsRelativeAngle = Math.min(
          Math.abs(angleRange.min),
          Math.abs(angleRange.max)
        );
        if (
          Math.sign(angleRange.min) != Math.sign(angleRange.max) &&
          minAbsRelativeAngle < 120
        ) {
          absRelativeAngle = 0;
        } else {
          absRelativeAngle = minAbsRelativeAngle;
        }

        if (
          distance <= closestPlaceDistance &&
          absRelativeAngle <= closestPlaceAbsRelativeAngle
        ) {
          //console.log("updated closest place", tags.name);
          closestPlace = place;
          closestPlaceDistance = distance;
          closestPlaceAbsRelativeAngle = absRelativeAngle;
        }
      }
    });
  }
  // console.log(
  //   "closestPlace",
  //   closestPlace?.tags.name,
  //   {
  //     closestPlaceDistance,
  //     closestPlaceAbsRelativeAngle,
  //   },
  //   closestPlace?.tags
  // );

  if (selectedPlace != closestPlace) {
    selectPlace(closestPlace);
  }
};

let longitude;
const longitudeInput = document.getElementById("longitude");
longitudeInput.addEventListener("input", async () => {
  setLongitude(Number(longitudeInput.value));
  await fetchMapData();
  await draw();
});
const setLongitude = async (newLongitude) => {
  longitude = newLongitude;
  //console.log({ longitude });
  longitudeInput.value = longitude;
  updateClosestPlace();
};

let latitude;
const latitudeInput = document.getElementById("latitude");
latitudeInput.addEventListener("input", async () => {
  setLatitude(Number(latitudeInput.value));
  await fetchMapData();
  await draw();
});
const setLatitude = async (newLatitude) => {
  latitude = newLatitude;
  //console.log({ latitude });
  latitudeInput.value = latitude;
  updateClosestPlace();
};

let radius;
const radiusInput = document.getElementById("radius");
radiusInput.addEventListener("input", () => {
  setRadius(Number(radiusInput.value));
});
const setRadius = async (newRadius) => {
  radius = newRadius;
  console.log({ radius });
  radiusInput.value = radius;
};

let heading;
const headingSigns = ["N", "W", "S", "E"];
const headingRanges = {};
headingSigns.forEach((sign, index) => {
  const angle = index * 90;
  const min = angle - 0;
  const max = angle + 90;
  // console.log({ angle, min, max });
  headingRanges[sign] = { min, max };
});
console.log(headingRanges);
const headingContainer = document.getElementById("heading");
const headingInput = headingContainer.querySelector("input");
const headingSpan = headingContainer.querySelector(".value");
headingInput.addEventListener("input", () => {
  setHeading(Number(headingInput.value));
});
const setHeading = async (newHeading) => {
  heading = newHeading;
  heading %= 360;
  while (heading < 0) {
    heading += 360;
  }
  //console.log({ heading });
  headingInput.value = heading;
  headingSpan.innerText = Math.round(heading);
  updateClosestPlace();
  await draw();
};

setLatitude(37.79735730522437);
setLongitude(-122.39422864517492);
setRadius(500);
setHeading(0);

let scale;
const scaleContainer = document.getElementById("scale");
const scaleInput = scaleContainer.querySelector("input");
const scaleSpan = scaleContainer.querySelector(".value");
scaleInput.addEventListener("input", () => {
  setScale(Number(scaleInput.value));
});
const setScale = async (newScale) => {
  scale = Math.min(Math.max(0.5, newScale), 2);
  //console.log({ scale });
  scaleInput.value = scale;
  scaleSpan.innerText = scale.toFixed(1);
  await draw();
};
setScale(1);

const toggleGeolocationButton = document.getElementById("toggleGeolocation");
toggleGeolocationButton.disabled = !navigator.geolocation;
let watchId;
const getIsWatchingPosition = () => watchId != undefined;
toggleGeolocationButton.addEventListener("click", () => toggleGeolocation());
/** @param {GeolocationPosition} position */
const geolocationSuccessCallback = (position) => {
  //console.log("geolocation", position);
  const { latitude, longitude, heading, speed } = position.coords;
  console.log({ latitude, longitude, heading, speed });
  setLatitude(latitude);
  setLongitude(longitude);
  if (heading != null) {
    setHeading(heading);
  }
  fetchMapData();
};
/** @param {GeolocationPositionError} positionError */
const geolocationErrorCallback = (positionError) => {
  console.error("geolocation error", positionError);
};
const toggleGeolocation = () => {
  if (!getIsWatchingPosition()) {
    watchId = navigator.geolocation.watchPosition(
      geolocationSuccessCallback,
      geolocationErrorCallback,
      { enableHighAccuracy: true }
    );
    console.log({ watchId });
  } else {
    navigator.geolocation.clearWatch(watchId);
    watchId = undefined;
  }
  toggleGeolocationButton.innerText = !getIsWatchingPosition()
    ? "enable geolocation"
    : "disable geolocation";
};

const toggleDeviceHeadingButton = document.getElementById(
  "toggleDeviceHeading"
);
toggleDeviceHeadingButton.addEventListener("click", () =>
  toggleDeviceHeading()
);
const orientationSensorRate = 20;
const toggleDeviceHeading = () => {
  if (!device.isConnected) {
    return;
  }
  const newOrientationSensorRate =
    device.sensorConfiguration.orientation == 0 ? orientationSensorRate : 0;
  console.log({ newOrientationSensorRate });
  device.setSensorConfiguration({ orientation: newOrientationSensorRate });
};
const updateToggleDeviceHeadingButton = () => {
  toggleDeviceHeadingButton.disabled = !device.isConnected;

  const isOrientationEnabled =
    device.isConnected && device.sensorConfiguration.orientation != 0;
  toggleDeviceHeadingButton.innerText = isOrientationEnabled
    ? "disable device heading"
    : "enable device heading";
};

device.addEventListener("isConnected", () => {
  updateToggleDeviceHeadingButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateToggleDeviceHeadingButton();
});

device.addEventListener("orientation", (event) => {
  const { heading } = event.message.orientation;
  //console.log({ heading });
  setHeading(heading);
});

// OSM
const degreesToRadians = (degrees) => {
  const radians = (degrees * Math.PI) / 180;
  return normalizeRadians(radians);
};
const radiansToDegrees = (radians) => {
  const degrees = (radians * 180) / Math.PI;
  return normalizeDegrees(degrees);
};
const normalizeValue = (value, maxValue) => {
  while (value < 0) {
    value += maxValue;
  }
  return value;
};
const normalizeDegrees = (degrees) => {
  return normalizeValue(degrees, 360);
};
const normalizeRadians = (radians) => {
  return normalizeValue(radians, 2 * Math.PI);
};
function project(lat, lon, applyHeading = false, scale = 300000) {
  let x = (lon - longitude) * Math.cos((latitude * Math.PI) / 180);
  let y = lat - latitude;
  const headingRad = applyHeading ? degreesToRadians(heading) : 0;
  //console.log({ headingRad, applyHeading });
  const cosH = Math.cos(headingRad);
  const sinH = Math.sin(headingRad);
  const rx = x * cosH - y * sinH;
  const ry = x * sinH + y * cosH;
  // console.log("project", { lat, lon, latitude, longitude, rx, ry });
  return [rx * scale, -ry * scale]; // flip y for canvas
}

function distanceBetween(lat1, lon1, lat2, lon2) {
  const [x, y] = project(lat1, lon1);
  const [cx, cy] = project(lat2, lon2);
  const dx = x - cx;
  const dy = y - cy;
  const distance = Math.sqrt(dx ** 2 + dy ** 2);
  return distance;
}

let mapDataDistanceThreshold = radius / 4;
let latestMapDataLatitude;
let latestMapDataLongitude;
let latestRadius;
let isFetchingMapData = false;
const mapDataLocalStorageKey = "mapData";
const fetchMapData = async () => {
  if (!didLoad) {
    return;
  }
  if (isFetchingMapData) {
    return;
  }
  if (isUploading) {
    return;
  }
  if (longitude == undefined || latitude == undefined) {
    return;
  }
  if (mapData) {
    const distance = distanceBetween(
      latitude,
      longitude,
      latestMapDataLatitude,
      latestMapDataLongitude
    );
    if (latestRadius == radius && distance < mapDataDistanceThreshold) {
      // console.log(
      //   `distance ${distance}m is already close to original center (max ${mapDataDistanceThreshold}m) and same radius ${radius}`
      // );
      return;
    }
  }
  isFetchingMapData = true;
  console.log("fetching data...", {
    radius,
    latitude,
    longitude,
    radius,
  });

  const query = `
    [out:json];
    (
      way["highway"](around:${radius}, ${latitude}, ${longitude});
      way["building"](around:${radius}, ${latitude}, ${longitude});
      node["building"](around:${radius}, ${latitude}, ${longitude});
      node["shop"](around:${radius}, ${latitude}, ${longitude});
      way["shop"](around:${radius}, ${latitude}, ${longitude});
      node["amenity"](around:${radius}, ${latitude}, ${longitude});
      way["amenity"](around:${radius}, ${latitude}, ${longitude});
    );
    (._;>;);
    out;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });
    const newMapData = await res.json();
    console.log("newMapData", longitude, latitude, newMapData);
    await setMapData(newMapData, longitude, latitude, radius);
    await draw();
  } catch (error) {
    console.error(error);
  }
  isFetchingMapData = false;
};

/** @type {BS.DisplaySpriteSheet} */
const mapSpriteSheet = {
  name: "map",
  sprites: [],
};
const setMapData = async (newMapData, lon, lat, rad, save = true) => {
  if (newMapData.elements.length == 0) {
    return;
  }
  mapData = newMapData;
  console.log("mapData", mapData);
  setLatitude(lat);
  setLongitude(lon);
  setRadius(rad);
  latestMapDataLatitude = latitude;
  latestMapDataLongitude = longitude;
  latestRadius = radius;
  if (save) {
    console.log("saving", { latitude, longitude });
    localStorage.setItem(
      mapDataLocalStorageKey,
      JSON.stringify({ latitude, longitude, mapData, radius })
    );
  }
  await createMapDataSprites();
  updateClosestPlace();
};

const isRoad = (tags) => {
  return (
    tags.highway &&
    [
      "motorway",
      "trunk",
      "primary",
      "secondary",
      "tertiary",
      "residential",
      "unclassified",
      // "service",
    ].includes(tags.highway)
  );
};

let useCurves = false;
let allNodes = {};
const createMapDataSprites = async () => {
  if (!mapData) {
    return;
  }

  allNodes = {};
  mapData.elements.forEach((el) => {
    if (el.type === "node") allNodes[el.id] = el;
  });
  //console.log("nodes", nodes);

  /** @typedef {{nodes: number[]}} Way */
  /** @type {Record<string, Way[]}} */
  const allWays = {};
  mapData.elements.forEach((el) => {
    if (el.type === "way" && el.nodes) {
      const tags = el.tags || {};
      if (isRoad(tags)) {
        allWays[tags.name] = allWays[tags.name] ?? [];
        allWays[tags.name].push(el);
      }
    }
  });

  /** @type {Way[][]} */
  const allMergedWays = [];
  for (const name in allWays) {
    const ways = allWays[name];
    if (ways.length == 1) {
      allMergedWays.push(ways);
    } else {
      /** @type {Way[][]} */
      const mergedWays = [];
      ways.forEach((way) => {
        if (useCurves || mergedWays.length == 0) {
          mergedWays.push([way]);
        } else {
          const isNewNode = !mergedWays.some((mergedWay) => {
            const addToBeginning = way.nodes.at(-1) == mergedWay[0].nodes[0];
            const addToEnd = way.nodes[0] == mergedWay.at(-1).nodes.at(-1);
            if (addToBeginning) {
              mergedWay.unshift(way);
            } else if (addToEnd) {
              mergedWay.push(way);
            }
            return addToBeginning || addToEnd;
          });
          if (isNewNode) {
            mergedWays.push([way]);
          }
        }
      });
      let didMergeWays = false;
      do {
        if (useCurves) {
          break;
        }
        didMergeWays = mergedWays.some((mergedWay) => {
          return mergedWays.some((_mergedWay) => {
            if (mergedWay == _mergedWay) {
              return;
            }
            let addToBeginning =
              mergedWay.at(-1).nodes.at(-1) == _mergedWay[0].nodes[0];
            let addToEnd =
              mergedWay[0].nodes[0] == _mergedWay.at(-1).nodes.at(-1);
            if (!useCurves && !addToBeginning && !addToEnd) {
              const addToBeginningReversed =
                mergedWay[0].nodes[0] == _mergedWay[0].nodes[0];
              const addToEndReversed =
                mergedWay.at(-1).nodes.at(-1) == _mergedWay.at(-1).nodes.at(-1);

              if (addToBeginningReversed) {
                addToBeginning = true;
              } else if (addToEndReversed) {
                addToEnd = true;
              }
              if (addToBeginningReversed || addToEndReversed) {
                mergedWay.forEach((mergedWay) => mergedWay.nodes.reverse());
                mergedWay.reverse();
              }
            }
            if (addToBeginning) {
              _mergedWay.unshift(...mergedWay);
            } else if (addToEnd) {
              _mergedWay.push(...mergedWay);
            }
            if (addToBeginning || addToEnd) {
              mergedWays.splice(mergedWays.indexOf(mergedWay), 1);
              return true;
            }
          });
        });
      } while (didMergeWays);

      allMergedWays.push(...mergedWays);
    }
  }
  let didMergeWays = false;
  do {
    if (useCurves) {
      break;
    }
    didMergeWays = allMergedWays.some((mergedWay) => {
      return allMergedWays.some((_mergedWay) => {
        if (mergedWay == _mergedWay) {
          return;
        }
        let addToBeginning =
          mergedWay.at(-1).nodes.at(-1) == _mergedWay[0].nodes[0];
        let addToEnd = mergedWay[0].nodes[0] == _mergedWay.at(-1).nodes.at(-1);
        if (!useCurves && !addToBeginning && !addToEnd) {
          const addToBeginningReversed =
            mergedWay[0].nodes[0] == _mergedWay[0].nodes[0];
          const addToEndReversed =
            mergedWay.at(-1).nodes.at(-1) == _mergedWay.at(-1).nodes.at(-1);

          if (addToBeginningReversed) {
            addToBeginning = true;
          } else if (addToEndReversed) {
            addToEnd = true;
          }
          if (addToBeginningReversed || addToEndReversed) {
            mergedWay.forEach((mergedWay) => mergedWay.nodes.reverse());
            mergedWay.reverse();
          }
        }
        if (addToBeginning) {
          _mergedWay.unshift(...mergedWay);
        } else if (addToEnd) {
          _mergedWay.push(...mergedWay);
        }
        if (addToBeginning || addToEnd) {
          allMergedWays.splice(allMergedWays.indexOf(mergedWay), 1);
          return true;
        }
      });
    });
  } while (didMergeWays);

  /** @type {BS.DisplayContextCommand[]} */
  const drawRoadCommands = [];
  allMergedWays.forEach((mergedWay) => {
    const nodeIndices = mergedWay.flatMap((way) => way.nodes);
    const nodes = nodeIndices.map((nodeIndex) => allNodes[nodeIndex]);
    //console.log("nodes", nodes);
    const points = nodes.map((node) => {
      const [x, y] = project(node.lat, node.lon);
      return { x, y };
    });
    //console.log("points", points);
    if (useCurves) {
      drawRoadCommands.push({
        type: "drawCubicBezierCurves",
        controlPoints: BS.simplifyPointsAsCubicCurveControlPoints(points),
      });
    } else {
      drawRoadCommands.push({
        type: "drawSegments",
        points: BS.simplifyPoints(points, 1),
      });
    }
  });

  console.log("drawRoadCommands", drawRoadCommands);

  /** @type {BS.DisplayContextCommand[]} */
  const drawBuildingCommands = [];
  mapData.elements.forEach((el) => {
    if (el.type === "way" && el.nodes) {
      const tags = el.tags || {};

      if (tags.building) {
        const nodes = el.nodes
          .map((nodeIndex) => allNodes[nodeIndex])
          .filter(
            (nodeIndex, index, nodes) => nodes.indexOf(nodeIndex) == index
          );
        const points = nodes.map((node) => {
          const [x, y] = project(node.lat, node.lon);
          return { x, y };
        });
        drawBuildingCommands.push({
          type: "drawPolygon",
          points: BS.simplifyPoints(points),
        });
      }
    }
  });
  console.log("drawBuildingCommands", drawBuildingCommands);

  places.length = 0;
  mapData.elements.forEach((el) => {
    const tags = el.tags || {};
    if (!isRoad(tags) && tags.name) {
      //console.log(tags.name, el);
      places.push(el);
    }
  });
  console.log("places", places);

  const maxLength = 1000;
  mapSpriteSheet.sprites[0] = {
    name: "map",
    width: maxLength,
    height: maxLength,
    commands: [
      { type: "setSegmentRadius", segmentRadius: 2 },
      { type: "setSegmentCap", segmentCap: "round" },
      { type: "selectFillColor", fillColorIndex: 1 },
      ...drawRoadCommands,
      { type: "setIgnoreFill", ignoreFill: true },
      { type: "setLineWidth", lineWidth: 3 },
      { type: "selectLineColor", lineColorIndex: 2 },
      ...drawBuildingCommands,
    ],
  };
  await displayCanvasHelper.uploadSpriteSheet(mapSpriteSheet);
};

let cachedMapDataString = localStorage.getItem("mapData");
if (cachedMapDataString) {
  try {
    const {
      longitude: lon,
      latitude: lat,
      radius: rad,
      mapData: cachedMapData,
    } = JSON.parse(cachedMapDataString);
    console.log({ lon, lat, rad, cachedMapData });
    await setMapData(cachedMapData, lon, lat, rad, false);
    await draw();
  } catch (error) {
    console.error(error);
  }
}

// SIZE

const checkSpriteSheetSizeButton = document.getElementById(
  "checkSpriteSheetSize"
);
const checkSpriteSheetSize = () => {
  const arrayBuffer = displayCanvasHelper.serializeSpriteSheet(mapSpriteSheet);
  checkSpriteSheetSizeButton.innerText = `size: ${(
    arrayBuffer.byteLength / 1024
  ).toFixed(2)}kb`;
  if (displayCanvasHelper.device?.isConnected) {
    checkSpriteSheetSizeButton.innerText += ` (max ${(
      displayCanvasHelper.device.maxFileLength / 1024
    ).toFixed(2)}kb)`;
  }
};
checkSpriteSheetSizeButton.addEventListener("click", () => {
  checkSpriteSheetSize();
});

// KEYBOARD CONTROLS
const keyDownTimerInterval = 50;
const keyDownHeadingScalar = 200 / keyDownTimerInterval;
const keyDownScaleScalar = 2 / keyDownTimerInterval;
const keyDownMoveScalar = 0.001 / keyDownTimerInterval;
const takeStep = async (offsetHeading, stepScalar = keyDownMoveScalar) => {
  offsetHeading += heading;
  const offsetHeadingRad = -degreesToRadians(offsetHeading);
  const offsetLatitude = stepScalar * Math.cos(offsetHeadingRad);
  const offsetLongitude = stepScalar * Math.sin(offsetHeadingRad);
  //console.log({ offsetLatitude, offsetLongitude });
  setLatitude(latitude + offsetLatitude);
  setLongitude(longitude + offsetLongitude);
  await fetchMapData();
  await draw();
};
const validKeys = [
  "ArrowRight",
  "ArrowLeft",
  "ArrowUp",
  "ArrowDown",
  "w",
  "a",
  "s",
  "d",
];
const keyDownCallback = () => {
  downKeys.forEach((key) => {
    switch (key) {
      case "w":
        takeStep(0);
        break;
      case "a":
        takeStep(90);
        break;
      case "s":
        takeStep(180);
        break;
      case "d":
        takeStep(270);
        break;
      case "ArrowRight":
        setHeading(heading - keyDownHeadingScalar);
        break;
      case "ArrowLeft":
        setHeading(heading + keyDownHeadingScalar);
        break;
      case "ArrowUp":
        setScale(scale + keyDownScaleScalar);
        break;
      case "ArrowDown":
        setScale(scale - keyDownScaleScalar);
        break;
      default:
        console.error(`uncaught key "${key}"`);
        break;
    }
  });
};
/** @type {Set<string>} */
const downKeys = new Set();
const keyDownTimer = new BS.Timer(keyDownCallback, keyDownTimerInterval);
/** @param {KeyboardEvent} event */
const onKey = (event) => {
  const { key, type } = event;
  const isDown = type == "keydown";
  //console.log({ key, isDown });

  let preventDefault = false;
  if (validKeys.includes(key)) {
    preventDefault = true;
    if (isDown) {
      downKeys.add(key);
    } else {
      downKeys.delete(key);
    }
  }

  if (preventDefault) {
    event.preventDefault();
  }

  if (downKeys.size > 0) {
    keyDownTimer.start(true);
  } else {
    keyDownTimer.stop();
  }
};
window.addEventListener("keydown", onKey);
window.addEventListener("keyup", onKey);

const wheelScaleScalar = -0.01;
displayCanvasHelper.canvas.addEventListener(
  "wheel",
  (event) => {
    const { deltaX, deltaY, offsetX, offsetY, ctrlKey: isZoom } = event;
    //console.log({ offsetX, offsetY, deltaX, deltaY, isZoom });
    if (isZoom) {
      setScale(scale + deltaY * wheelScaleScalar);
    } else {
      const scalar = Math.sqrt(deltaX ** 2 + deltaY ** 2) * 0.000002;
      const radians = Math.atan2(deltaY, -deltaX) + Math.PI / 2;
      const degrees = radiansToDegrees(radians);
      // console.log({ degrees });
      takeStep(degrees, scalar);
    }
    event.preventDefault();
  },
  { passive: false }
);

// FONT

/** @type {HTMLInputElement} */
const loadFontInput = document.getElementById("loadFont");
loadFontInput.addEventListener("input", async () => {
  for (let i = 0; i < loadFontInput.files.length; i++) {
    const file = loadFontInput.files[i];
    if (!file) {
      continue;
    }
    const arrayBuffer = await file.arrayBuffer();
    await loadFont(arrayBuffer);
  }
  loadFontInput.value = "";
});

let fontScale = 0.9;
const fontScaleContainer = document.getElementById("fontScale");
const fontScaleInput = fontScaleContainer.querySelector("input");
const fontScaleSpan = fontScaleContainer.querySelector(".value");
fontScaleInput.addEventListener("input", () => {
  setFontScale(Number(fontScaleInput.value));
});
const setFontScale = (newFontScale) => {
  fontScale = newFontScale;
  console.log({ fontScale });
  fontScaleSpan.innerText = fontScale;
  fontScaleInput.value = fontScale;
};

const loadFont = async (arrayBuffer) => {
  if (!arrayBuffer) {
    return;
  }
  const font = await BS.parseFont(arrayBuffer);
  if (font) {
    await addFont(font);
  }
};

const validFontExtensions = loadFontInput.accept.split(",");
function isGoogleFontsUrl(string) {
  try {
    const url = new URL(string);
    return (
      url.hostname === "fonts.googleapis.com" &&
      (url.pathname.startsWith("/css") || url.pathname.startsWith("/css2"))
    );
  } catch {
    return false;
  }
}
async function getGoogleFontUrls(cssUrl, isEnglish = true) {
  const filterFn = isEnglish ? (r) => /U\+0000-00FF/i.test(r) : undefined;

  const res = await fetch(cssUrl);
  if (!res.ok) throw new Error(`Failed to fetch CSS: ${res.status}`);
  const cssText = await res.text();

  // Capture url and unicode-range
  const regex = /src:\s*url\(([^)]+\.woff2)\)[^}]*unicode-range:\s*([^;]+);/gi;
  const results = [];
  let match;

  while ((match = regex.exec(cssText)) !== null) {
    const url = match[1].replace(/["']/g, "");
    const range = match[2].trim();

    if (!filterFn || filterFn(range)) {
      results.push(url);
    }
  }

  return [...new Set(results)];
}
const loadFontUrl = async (string, isEnglish = true) => {
  if (!isValidUrl(string)) {
    return;
  }

  if (isGoogleFontsUrl(string)) {
    const googleFontUrls = await getGoogleFontUrls(string, isEnglish);
    for (const index in googleFontUrls) {
      const response = await fetch(googleFontUrls[index]);
      const arrayBuffer = await response.arrayBuffer();
      await loadFont(arrayBuffer);
    }
  } else {
    if (validFontExtensions.every((extension) => !string.endsWith(extension))) {
      return;
    }
    const response = await fetch(string);
    const arrayBuffer = await response.arrayBuffer();
    await loadFont(arrayBuffer);
  }
};
window.addEventListener("paste", (event) => {
  const string = event.clipboardData.getData("text");
  loadFontUrl(string);
});
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log("item.type", item.type);
    if (item.type.startsWith("font/")) {
      const file = item.getAsFile();
      const arrayBuffer = await file.arrayBuffer();
      await loadFont(arrayBuffer);
    }
  }
});

window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    console.log(file.type);
    if (
      file.type.startsWith("font/") ||
      file.type.includes("font") ||
      file.name.endsWith("woff2")
    ) {
      const arrayBuffer = await file.arrayBuffer();
      await loadFont(arrayBuffer);
    }
  }
});

/** @type {Record<string, BS.Font[]>} */
const fonts = {};
const fontSize = 42;
/** @type {Record<string, BS.DisplaySpriteSheet>} */
const fontSpriteSheets = {};
window.fonts = fonts;
/** @param {BS.Font} font */
const addFont = async (font) => {
  const fullName = font.getEnglishName("fullName");

  fonts[fullName] = fonts[fullName] || [];
  fonts[fullName].push(font);

  console.log(`added font "${fullName}"`);

  const spriteSheet = await BS.fontToSpriteSheet(font, fontSize, "english", {
    usePath: true,
    englishOnly: true,
  });
  fontSpriteSheets[fullName] = spriteSheet;
  await updateFontSelect();
  await selectFont(fullName);
};

/** @type {HTMLSelectElement} */
const selectFontSelect = document.getElementById("selectFont");
const selectFontOptgroup = selectFontSelect.querySelector("optgroup");
const updateFontSelect = async () => {
  selectFontOptgroup.innerHTML = "";
  for (const fullName in fonts) {
    selectFontOptgroup.appendChild(new Option(fullName));
  }
};

selectFontSelect.addEventListener("input", async () => {
  const fontName = selectFontSelect.value;
  await selectFont(fontName);
});

/** @type {BS.Font?} */
let selectedFont;
let spritesLineHeight = 0;
const selectFont = async (newFontName) => {
  const newFont = fonts[newFontName][0];
  selectedFont = newFont;

  if (didLoad) {
    console.log(`selected font "${newFontName}"`, selectedFont);
    //console.log(`selected fonts`, selectedFonts);
  }
  selectFontSelect.value = newFontName;
  const spriteSheet = fontSpriteSheets[newFontName];
  await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
  spritesLineHeight = BS.getFontMaxHeight(selectedFont, fontSize);
  //console.log({ spritesLineHeight }, selectedFont, fontSize);
  await displayCanvasHelper.setSpritesLineHeight(spritesLineHeight);
};

await loadFontUrl("https://fonts.googleapis.com/css2?family=Roboto");

didLoad = true;
draw();

const mapDataLocationLocalStorageKey = "mapDataLocation";
window.addEventListener("beforeunload", () => {
  localStorage.setItem(
    mapDataLocationLocalStorageKey,
    JSON.stringify({ latitude, longitude, heading, scale })
  );
});
let cachedMapDataLocationString = localStorage.getItem("mapDataLocation");
if (cachedMapDataLocationString) {
  try {
    const {
      longitude: lon,
      latitude: lat,
      heading: head,
      scale: _scale,
    } = JSON.parse(cachedMapDataLocationString);
    console.log({ lon, lat });
    setLongitude(lon);
    setLatitude(lat);
    setHeading(head);
    setScale(_scale);
    await draw();
  } catch (error) {
    console.error(error);
  }
}
