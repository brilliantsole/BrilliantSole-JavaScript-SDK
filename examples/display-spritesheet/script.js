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

// DEVICE
BS.DeviceManager.AddEventListener("deviceConnected", (event) => {
  if (event.message.device.connectionType != "client") {
    return;
  }
  if (event.message.device.isDisplayAvailable) {
    clientDevice = event.message.device;
    if (client.isScanning) {
      client.stopScan();
    }
    displayCanvasHelper.device = clientDevice;
  } else {
    console.log("display not available");
    // event.message.device.disconnect();
  }
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

    const colorIndexSpan = displayColorContainer.querySelector(".colorIndex");
    colorIndexSpan.innerText = `color #${colorIndex}`;
    const colorInput = displayColorContainer.querySelector("input");
    colorInput.addEventListener("input", () => {
      setDisplayColor(colorIndex, colorInput.value);
    });
    displayColorsContainer.appendChild(displayColorContainer);
  }
};
setupColors();
displayCanvasHelper.addEventListener("numberOfColors", () => setupColors());
displayCanvasHelper.addEventListener("color", (event) => {
  const { colorHex, colorIndex } = event.message;
  displayColorsContainer.querySelectorAll(".displayColor input")[
    colorIndex
  ].value = colorHex;
});

// OPACITIES

/** @type {HTMLTemplateElement} */
const displayColorOpacityTemplate = document.getElementById(
  "displayColorOpacityTemplate"
);
const displayColorOpacitiesContainer = document.getElementById(
  "displayColorOpacities"
);
const setDisplayColorOpacity = BS.ThrottleUtils.throttle(
  (colorIndex, opacity) => {
    console.log({ colorIndex, opacity });
    displayCanvasHelper.setColorOpacity(colorIndex, opacity, true);
  },
  100,
  true
);
const setupColorOpacities = () => {
  displayColorOpacitiesContainer.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    const displayColorOpacityContainer = displayColorOpacityTemplate.content
      .cloneNode(true)
      .querySelector(".displayColorOpacity");

    const displayColorOpacityIndex =
      displayColorOpacityContainer.querySelector(".colorIndex");
    displayColorOpacityIndex.innerText = `opacity #${colorIndex}`;
    const displayColorOpacityInput =
      displayColorOpacityContainer.querySelector("input");
    displayColorOpacityInput.addEventListener("input", () => {
      const opacity = Number(displayColorOpacityInput.value);
      setDisplayColorOpacity(colorIndex, opacity);
    });
    displayColorOpacitiesContainer.appendChild(displayColorOpacityContainer);
  }
};
displayCanvasHelper.addEventListener("numberOfColors", () =>
  setupColorOpacities()
);
setupColorOpacities();
displayCanvasHelper.addEventListener("colorOpacity", (event) => {
  const { colorIndex, opacity } = event.message;
  const displayColorOpacityContainer =
    displayColorOpacitiesContainer.querySelectorAll(".displayColorOpacity")[
      colorIndex
    ];
  displayColorOpacityContainer.querySelector("input").value = opacity;
  displayColorOpacityContainer.querySelector("span.opacity").innerText =
    Math.round(opacity * 100);
});

const displayOpacityContainer = document.getElementById("displayOpacity");
const displayOpacitySpan = displayOpacityContainer.querySelector("span");
const displayOpacityInput = displayOpacityContainer.querySelector("input");

const setDisplayOpacity = BS.ThrottleUtils.throttle(
  (opacity) => {
    console.log({ opacity });
    displayCanvasHelper.setOpacity(opacity, true);
  },
  100,
  true
);
displayOpacityInput.addEventListener("input", () => {
  const opacity = Number(displayOpacityInput.value);
  displayOpacitySpan.innerText = Math.round(opacity * 100);
  setDisplayOpacity(opacity);
  displayColorOpacitiesContainer
    .querySelectorAll(".displayColorOpacity")
    .forEach((container) => {
      const input = container.querySelector("input");
      const opacitySpan = container.querySelector(".opacity");
      input.value = opacity;
      opacitySpan.innerText = Math.round(opacity * 100);
    });
});

// FILL COLOR
const fillColorContainer = document.getElementById("fillColor");
const fillColorSelect = fillColorContainer.querySelector("select");
const fillColorOptgroup = fillColorSelect.querySelector("optgroup");
const fillColorInput = fillColorContainer.querySelector("input");
let fillColorIndex = 1;
fillColorSelect.addEventListener("input", () => {
  fillColorIndex = Number(fillColorSelect.value);
  console.log({ fillColorIndex });
  displayCanvasHelper.selectFillColor(fillColorIndex);
  updateFillColorInput();
});
const updateFillColorSelect = () => {
  fillColorOptgroup.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    fillColorOptgroup.appendChild(new Option(colorIndex));
  }
  fillColorSelect.value = fillColorIndex;
};
const updateFillColorInput = () => {
  fillColorInput.value = displayCanvasHelper.colors[fillColorIndex];
};
displayCanvasHelper.addEventListener("numberOfColors", () =>
  updateFillColorSelect()
);
displayCanvasHelper.addEventListener("color", (event) => {
  if (event.message.colorIndex == fillColorIndex) {
    updateFillColorInput();
  }
});
updateFillColorSelect();

// LINE COLOR
const lineColorContainer = document.getElementById("lineColor");
const lineColorSelect = lineColorContainer.querySelector("select");
const lineColorOptgroup = lineColorSelect.querySelector("optgroup");
const lineColorInput = lineColorContainer.querySelector("input");
let lineColorIndex = 1;
lineColorSelect.addEventListener("input", () => {
  lineColorIndex = Number(lineColorSelect.value);
  console.log({ lineColorIndex });
  displayCanvasHelper.selectLineColor(lineColorIndex);
  updateLineColorInput();
});
const updateLineColorSelect = () => {
  lineColorOptgroup.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    lineColorOptgroup.appendChild(new Option(colorIndex));
  }
  lineColorSelect.value = lineColorIndex;
};
const updateLineColorInput = () => {
  lineColorInput.value = displayCanvasHelper.colors[lineColorIndex];
};
displayCanvasHelper.addEventListener("numberOfColors", () =>
  updateLineColorSelect()
);
displayCanvasHelper.addEventListener("color", (event) => {
  if (event.message.colorIndex == lineColorIndex) {
    updateLineColorInput();
  }
});
updateLineColorSelect();

// SPRITESHEET
/** @type {BS.DisplaySpriteSheet} */
const spriteSheet = {
  name: "mySpriteSheet",
  sprites: [],
  palettes: [],
};
window.spriteSheet = spriteSheet;

/** @type {HTMLInputElement} */
const spriteSheetNameInput = document.getElementById("spriteSheetName");
spriteSheetNameInput.addEventListener("input", () => {
  let spriteSheetName = spriteSheetNameInput.value;
  // FIX - assert min/max length
  console.log({ spriteSheetName });
  spriteSheet.name = spriteSheet;
});
spriteSheetNameInput.value = spriteSheet.name;

const addSpriteButton = document.getElementById("addSprite");
addSpriteButton.addEventListener("click", () => {
  addSprite();
});

const addPaletteButton = document.getElementById("addPalette");
addPaletteButton.addEventListener("click", () => {
  addPalette();
});

// PALETTE
let selectedPaletteIndex = -1;
/** @type {BS.DisplaySpriteSheetPalette} */
let selectedPalette;
const addPalette = () => {
  //console.log("addPalette");
  spriteSheet.palettes.push({
    name: `myPalette ${Object.keys(spriteSheet.palettes).length}`,
    numberOfColors: 0,
    colors: [],
    opacities: [],
    fillColorIndex: 1,
    lineColorIndex: 1,
    numberOfBitmapColors: 0,
    bitmapColorIndices: [],
  });
  const paletteIndex = spriteSheet.palettes.length - 1;
  updateSelectPaletteSelect();
  setPaletteIndex(paletteIndex);
  setPaletteNumberOfColors(2);
};
const setPaletteIndex = (paletteIndex) => {
  selectedPaletteIndex = paletteIndex;
  console.log({ selectedPaletteIndex });
  selectedPalette = spriteSheet.palettes[selectedPaletteIndex];

  paletteNameInput.value = selectedPalette?.name ?? "";
  paletteNameInput.disabled = selectedPalette == undefined;
  selectPaletteSelect.value = selectedPaletteIndex;

  displayCanvasHelper.flushContextCommands();

  onPaletteNumberOfColorsUpdate();
};

/** @type {HTMLSelectElement} */
const selectPaletteSelect = document.getElementById("selectPalette");
const selectPaletteOptgroup = selectPaletteSelect.querySelector("optgroup");
selectPaletteSelect.addEventListener("input", () => {
  const selectedPaletteIndex = Number(selectPaletteSelect.value);
  setPaletteIndex(selectedPaletteIndex);
});
const updateSelectPaletteSelect = () => {
  selectPaletteOptgroup.innerHTML = "";
  selectPaletteOptgroup.appendChild(new Option("none", -1));
  spriteSheet.palettes.forEach((palette, index) => {
    selectPaletteOptgroup.appendChild(new Option(palette.name, index));
  });
  selectPaletteSelect.value = selectedPaletteIndex;
};
updateSelectPaletteSelect();

displayCanvasHelper.addEventListener("color", (event) => {
  if (!selectedPalette) {
    return;
  }
  const { colorIndex, colorHex } = event.message;
  selectedPalette.colors[colorIndex] = colorHex;
});
displayCanvasHelper.addEventListener("colorOpacity", (event) => {
  if (!selectedPalette) {
    return;
  }
  const { colorIndex, opacity } = event.message;
  selectedPalette.opacities[colorIndex] = opacity;
});
displayCanvasHelper.addEventListener("contextState", (event) => {
  if (!selectedPalette) {
    return;
  }
  const { differences, contextState } = event.message;
  if (differences.includes("fillColorIndex")) {
    selectedPalette.fillColorIndex = contextState.fillColorIndex;
  }
  if (differences.includes("lineColorIndex")) {
    selectedPalette.lineColorIndex = contextState.lineColorIndex;
  }
  if (differences.includes("bitmapColorIndices")) {
    selectedPalette.bitmapColorIndices = contextState.bitmapColorIndices;
  }
});

const paletteNameInput = document.getElementById("paletteName");
paletteNameInput.addEventListener("input", () => {
  let paletteName = paletteNameInput.value;
  selectedPalette.name = paletteName;
});
paletteNameInput.addEventListener("focusout", () => {
  updateSelectPaletteSelect();
});

/** @type {HTMLSelectElement} */
const paletteNumberOfColorsSelect = document.getElementById(
  "paletteNumberOfColors"
);
const paletteNumberOfColorsOptgroup =
  paletteNumberOfColorsSelect.querySelector("optgroup");
paletteNumberOfColorsSelect.addEventListener("input", () => {
  const paletteNumberOfColors = Number(paletteNumberOfColorsSelect.value);
  setPaletteNumberOfColors(paletteNumberOfColors);
});
const setPaletteNumberOfColors = (paletteNumberOfColors) => {
  console.log({ paletteNumberOfColors });

  if (selectedPalette) {
    selectedPalette.numberOfColors = paletteNumberOfColors;

    selectedPalette.colors.length = paletteNumberOfColors;
    selectedPalette.opacities.length = paletteNumberOfColors;
    for (let colorIndex = 0; colorIndex < paletteNumberOfColors; colorIndex++) {
      const color = selectedPalette.colors[colorIndex];
      if (color == undefined) {
        selectedPalette.colors[colorIndex] = "#000000";
      }

      const opacity = selectedPalette.opacities[colorIndex];
      if (opacity == undefined) {
        selectedPalette.opacities[colorIndex] = 1;
      }
    }
  }

  onPaletteNumberOfColorsUpdate();
};
const onPaletteNumberOfColorsUpdate = () => {
  for (
    let colorIndex = 0;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    const enabled = selectedPalette
      ? colorIndex < selectedPalette.numberOfColors
      : true;
    displayColorsContainer.querySelectorAll(".displayColor")[
      colorIndex
    ].style.display = enabled ? "" : "none";
    displayColorOpacitiesContainer.querySelectorAll(".displayColorOpacity")[
      colorIndex
    ].style.display = enabled ? "" : "none";
  }
  for (
    let bitmapColorIndex = 0;
    bitmapColorIndex < displayCanvasHelper.numberOfBitmapColors;
    bitmapColorIndex++
  ) {
    const enabled = selectedPalette
      ? colorIndex < selectedPalette.numberOfBitmapColors
      : true;
    // FILL - update bitmapColor selects
  }

  paletteNumberOfColorsSelect.disabled = selectedPalette == undefined;
  paletteNumberOfBitmapColorsSelect.disabled = selectedPalette == undefined;

  paletteNumberOfColorsSelect.value = selectedPalette?.numberOfColors ?? 2;
  paletteNumberOfBitmapColorsSelect.value =
    selectedPalette?.numberOfBitmapColors ?? 0;

  for (
    let colorIndex = 0;
    colorIndex <
    (selectedPalette?.numberOfColors ?? displayCanvasHelper.numberOfColors);
    colorIndex++
  ) {
    displayCanvasHelper.setColor(
      colorIndex,
      selectedPalette?.colors?.[colorIndex] ?? "#000000"
    );
    displayCanvasHelper.setColorOpacity(
      colorIndex,
      selectedPalette?.opacities[colorIndex] ?? 1
    );
  }

  for (
    let bitmapColorIndex = 0;
    bitmapColorIndex <
    (selectedPalette?.numberOfColors ?? displayCanvasHelper.numberOfColors);
    bitmapColorIndex++
  ) {
    displayCanvasHelper.selectBitmapColor(
      bitmapColorIndex,
      selectedPalette?.bitmapColorIndices?.[bitmapColorIndex] ?? 0
    );
  }
};
const updatePaletteNumberOfColorsSelect = () => {
  paletteNumberOfColorsOptgroup.innerHTML = "";
  for (
    let colorIndex = 2;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    paletteNumberOfColorsOptgroup.appendChild(new Option(colorIndex));
  }
};
updatePaletteNumberOfColorsSelect();
displayCanvasHelper.addEventListener("numberOfColors", () => {
  updatePaletteNumberOfColorsSelect();
});

/** @type {HTMLSelectElement} */
const paletteNumberOfBitmapColorsSelect = document.getElementById(
  "paletteNumberOfBitmapColors"
);
const paletteNumberOfBitmapColorsOptgroup =
  paletteNumberOfBitmapColorsSelect.querySelector("optgroup");
paletteNumberOfBitmapColorsSelect.addEventListener("input", () => {
  const paletteNumberOfBitmapColors = Number(
    paletteNumberOfBitmapColorsSelect.value
  );
  setPaletteNumberOfBitmapColors(paletteNumberOfBitmapColors);
});
const setPaletteNumberOfBitmapColors = (paletteNumberOfBitmapColors) => {
  console.log({ paletteNumberOfBitmapColors });
  selectedPalette.numberOfBitmapColors = paletteNumberOfBitmapColors;

  for (
    let bitmapColorIndex = 0;
    bitmapColorIndex < selectedPalette.numberOfBitmapColors;
    bitmapColorIndex++
  ) {
    // FILL - create selects
  }

  paletteNumberOfBitmapColorsSelect.disabled = selectedPalette == undefined;
};
const updatePaletteNumberOfBitmapColorsSelect = () => {
  paletteNumberOfBitmapColorsOptgroup.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    paletteNumberOfBitmapColorsOptgroup.appendChild(new Option(colorIndex));
  }
};
updatePaletteNumberOfBitmapColorsSelect();
displayCanvasHelper.addEventListener("numberOfColors", () => {
  updatePaletteNumberOfBitmapColorsSelect();
});

// SPRITE
const addSprite = () => {
  console.log("addSprite");
  // FILL
};

// LOAD/SAVE

const localStorageKey = "BS.SpriteSheets";
const saveToLocalStorage = () => {
  console.log("saveToLocalStorage");
  // FILL
};
const loadFromLocalStorage = () => {
  console.log("loadFromLocalStorage");
  // FILL
};

/** @type {HTMLInputElement} */
const loadSpriteSheetInput = document.getElementById("loadSpriteSheet");
loadSpriteSheetInput.addEventListener("input", () => {
  const file = loadSpriteSheetInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target.result);
      loadSpriteSheet(json);
    } catch (error) {
      console.error("invalid json", error);
    }
  };
  reader.readAsText(file);
});
/** @param {string} json */
const loadSpriteSheet = (json) => {
  console.log("loadSpriteSheet", json);
};

const saveSpriteSheetButton = document.getElementById("saveSpriteSheet");
saveSpriteSheetButton.addEventListener("click", () => {
  saveSpriteSheet();
});
const saveSpriteSheet = () => {
  console.log("saveSpriteSheet");
  // FILL - save json as file
};
