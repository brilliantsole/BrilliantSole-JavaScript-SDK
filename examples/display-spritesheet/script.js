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

// BITMAP COLOR INDICES
/** @type {HTMLTemplateElement} */
const bitmapColorIndexTemplate = document.getElementById(
  "bitmapColorIndexTemplate"
);
const bitmapColorIndicesContainer =
  document.getElementById("bitmapColorIndices");
const setBitmapColorIndex = BS.ThrottleUtils.throttle(
  (bitmapColorIndex, colorIndex) => {
    //console.log({ bitmapColorIndex, colorIndex });
    displayCanvasHelper.selectBitmapColor(bitmapColorIndex, colorIndex, true);
  },
  100,
  true
);
const setupBitmapColors = () => {
  bitmapColorIndicesContainer.innerHTML = "";
  for (
    let bitmapColorIndex = 0;
    bitmapColorIndex < displayCanvasHelper.numberOfColors;
    bitmapColorIndex++
  ) {
    const bitmapColorIndexContainer = bitmapColorIndexTemplate.content
      .cloneNode(true)
      .querySelector(".bitmapColorIndex");

    const colorIndexSpan =
      bitmapColorIndexContainer.querySelector(".colorIndex");
    colorIndexSpan.innerText = `bitmap color #${bitmapColorIndex}`;
    const colorIndexSelect = bitmapColorIndexContainer.querySelector("select");
    const colorIndexOptgroup = colorIndexSelect.querySelector("optgroup");
    for (
      let colorIndex = 0;
      colorIndex < displayCanvasHelper.numberOfColors;
      colorIndex++
    ) {
      colorIndexOptgroup.appendChild(new Option(colorIndex));
    }
    colorIndexSelect.addEventListener("input", () => {
      const colorIndex = Number(colorIndexSelect.value);
      setBitmapColorIndex(bitmapColorIndex, colorIndex);
    });
    bitmapColorIndicesContainer.appendChild(bitmapColorIndexContainer);
  }
};
setupBitmapColors();
displayCanvasHelper.addEventListener("numberOfColors", () =>
  setupBitmapColors()
);
displayCanvasHelper.addEventListener("contextState", (event) => {
  const { differences } = event.message;
  if (differences.includes("bitmapColorIndices")) {
    updateBitmapColorIndices();
  }
});
displayCanvasHelper.addEventListener("color", (event) => {
  if (
    displayCanvasHelper.bitmapColorIndices.includes(event.message.colorIndex)
  ) {
    updateBitmapColorIndices();
  }
});
const updateBitmapColorIndices = () => {
  displayCanvasHelper.bitmapColorIndices.forEach(
    (colorIndex, bitmapColorIndex) => {
      if (selectedPalette) {
        selectedPalette.bitmapColorIndices[bitmapColorIndex] = colorIndex;
      }
      const bitmapColorIndexContainer =
        bitmapColorIndicesContainer.querySelectorAll(".bitmapColorIndex")[
          bitmapColorIndex
        ];
      bitmapColorIndexContainer.querySelector("select").value = colorIndex;
      bitmapColorIndexContainer.querySelector("input").value =
        displayCanvasHelper.bitmapColors[bitmapColorIndex];
    }
  );
};

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
const setSpriteSheetName = (spriteSheetName) => {
  // FIX - assert min/max length
  console.log({ spriteSheetName });
  spriteSheet.name = spriteSheetName;
  spriteSheetNameInput.value = spriteSheet.name;
};
spriteSheetNameInput.addEventListener("input", () => {
  let spriteSheetName = spriteSheetNameInput.value;
  setSpriteSheetName(spriteSheetName);
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
/** @type {BS.DisplaySpriteSheetPalette?} */
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
  setPaletteNumberOfBitmapColors(0);
};
const setPaletteIndex = (paletteIndex) => {
  selectedPaletteIndex = paletteIndex;
  console.log({ selectedPaletteIndex });
  selectedPalette = spriteSheet.palettes[selectedPaletteIndex];

  paletteNameInput.value = selectedPalette?.name ?? "";
  paletteNameInput.disabled = selectedPalette == undefined;
  selectPaletteSelect.value = selectedPaletteIndex;

  deletePaletteButton.disabled = selectedPalette == undefined;

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
    bitmapColorIndex < displayCanvasHelper.numberOfColors;
    bitmapColorIndex++
  ) {
    const enabled = selectedPalette
      ? bitmapColorIndex < selectedPalette.numberOfBitmapColors
      : true;
    const bitmapColorIndexContainer =
      bitmapColorIndicesContainer.querySelectorAll(".bitmapColorIndex")[
        bitmapColorIndex
      ];
    bitmapColorIndexContainer
      .querySelectorAll("option")
      .forEach((option, colorIndex) => {
        option.hidden = selectedPalette
          ? colorIndex >= selectedPalette.numberOfColors
          : false;
      });
    bitmapColorIndexContainer.style.display = enabled ? "" : "none";
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

  if (selectedPalette) {
    selectedPalette.numberOfBitmapColors = paletteNumberOfBitmapColors;

    selectedPalette.bitmapColorIndices.length = paletteNumberOfBitmapColors;

    for (
      let bitmapColorIndex = 0;
      bitmapColorIndex < paletteNumberOfBitmapColors;
      bitmapColorIndex++
    ) {
      const colorIndex = selectedPalette.bitmapColorIndices[bitmapColorIndex];
      if (colorIndex == undefined) {
        selectedPalette.bitmapColorIndices[colorIndex] = 0;
      }
    }
  }

  onPaletteNumberOfBitmapColorsUpdate();
};
const onPaletteNumberOfBitmapColorsUpdate = () => {
  // should refactor onPaletteNumberOfColorsUpdate and remove bitmapIndices stuff
  onPaletteNumberOfColorsUpdate();
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

const deletePaletteButton = document.getElementById("deletePalette");
deletePaletteButton.addEventListener("click", () => {
  deleteSelectedPalette();
});
const deleteSelectedPalette = () => {
  if (!selectedPalette) {
    return;
  }
  console.log("deleting palette");
  spriteSheet.palettes.splice(selectedPaletteIndex, 1);
  setPaletteIndex(-1);
  updateSelectPaletteSelect();
};

// SPRITE
let selectedSpriteIndex = -1;
/** @type {BS.DisplaySprite?} */
let selectedSprite;
const addSprite = () => {
  //console.log("addSprite");
  spriteSheet.sprites.push({
    name: `mySprite ${Object.keys(spriteSheet.sprites).length}`,
    width: 40,
    height: 40,
    displayCommandMessages: [],
  });
  const spriteIndex = spriteSheet.sprites.length - 1;
  updateSelectSpriteSelect();
  setSpriteIndex(spriteIndex);
};
const setSpriteIndex = (spriteIndex) => {
  selectedSpriteIndex = spriteIndex;
  console.log({ selectedSpriteIndex });
  selectedSprite = spriteSheet.sprites[selectedSpriteIndex];

  spriteNameInput.value = selectedSprite?.name ?? "";
  spriteNameInput.disabled = selectedSprite == undefined;
  selectSpriteSelect.value = selectedSpriteIndex;

  deleteSpriteButton.disabled = selectedSprite == undefined;

  displayCanvasHelper.flushContextCommands();
};

/** @type {HTMLSelectElement} */
const selectSpriteSelect = document.getElementById("selectSprite");
const selectSpriteOptgroup = selectSpriteSelect.querySelector("optgroup");
selectSpriteSelect.addEventListener("input", () => {
  const selectedSpriteIndex = Number(selectSpriteSelect.value);
  setSpriteIndex(selectedSpriteIndex);
});
const updateSelectSpriteSelect = () => {
  selectSpriteOptgroup.innerHTML = "";
  selectSpriteOptgroup.appendChild(new Option("none", -1));
  spriteSheet.sprites.forEach((sprite, index) => {
    selectSpriteOptgroup.appendChild(new Option(sprite.name, index));
  });
  selectSpriteSelect.value = selectedSpriteIndex;
};
updateSelectSpriteSelect();

const spriteNameInput = document.getElementById("spriteName");
spriteNameInput.addEventListener("input", () => {
  let spriteName = spriteNameInput.value;
  selectedSprite.name = spriteName;
});
spriteNameInput.addEventListener("focusout", () => {
  updateSelectSpriteSelect();
});

const deleteSpriteButton = document.getElementById("deleteSprite");
deleteSpriteButton.addEventListener("click", () => {
  deleteSelectedSprite();
});
const deleteSelectedSprite = () => {
  if (!selectedSprite) {
    return;
  }
  console.log("deleting sprite");
  spriteSheet.sprites.splice(selectedSpriteIndex, 1);
  setSpriteIndex(-1);
  updateSelectSpriteSelect();
};

// LOAD/SAVE

const onSpriteSheetString = (spriteSheetString) => {
  console.log("spriteSheetString", spriteSheetString);

  try {
    /** @type {BS.DisplaySpriteSheet} */
    const _spriteSheet = JSON.parse(spriteSheetString);
    setSpriteSheetName(_spriteSheet.name);

    spriteSheet.palettes = _spriteSheet.palettes;
    updateSelectPaletteSelect();

    spriteSheet.sprites = _spriteSheet.sprites;
    updateSelectSpriteSelect();
  } catch (error) {
    console.error("invalid spritesheet json", error);
  }
};

const localStorageKey = "BS.SpriteSheets";
const saveToLocalStorage = () => {
  console.log("saveToLocalStorage");
  localStorage.setItem(localStorageKey, JSON.stringify(spriteSheet));
};
const loadFromLocalStorage = () => {
  console.log("loadFromLocalStorage");
  const spriteSheetString = localStorage.getItem(localStorageKey);
  if (!spriteSheetString) {
    return;
  }
  onSpriteSheetString(spriteSheetString);
};
const clearLocalStorage = () => {
  console.log("clearLocalStorage");
  localStorage.removeItem(localStorageKey);
};
loadFromLocalStorage();

/** @type {HTMLInputElement} */
const autoSaveToLocalStorageCheckbox = document.getElementById(
  "autoSaveToLocalStorage"
);
let autoSaveToLocalStorage = true;
autoSaveToLocalStorageCheckbox.checked = autoSaveToLocalStorage;
const setAutoSaveToLocalStorage = (newAutoSaveToLocalStorage) => {
  autoSaveToLocalStorage = newAutoSaveToLocalStorage;
  console.log({ autoSaveToLocalStorage });
  autoSaveToLocalStorageCheckbox.checked = autoSaveToLocalStorage;
};
autoSaveToLocalStorageCheckbox.addEventListener("click", () => {
  setAutoSaveToLocalStorage(autoSaveToLocalStorageCheckbox.checked);
});

const clearLocalStorageButton = document.getElementById("clearLocalStorage");
clearLocalStorageButton.addEventListener("click", () => {
  clearLocalStorage();
  setAutoSaveToLocalStorage(false);
});

/** @type {HTMLInputElement} */
const loadSpriteSheetInput = document.getElementById("loadSpriteSheet");
loadSpriteSheetInput.addEventListener("input", () => {
  const file = loadSpriteSheetInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const spriteSheetString = event.target.result;
    onSpriteSheetString(spriteSheetString);
  };
  reader.readAsText(file);
});

const saveSpriteSheetButton = document.getElementById("saveSpriteSheet");
saveSpriteSheetButton.addEventListener("click", () => {
  saveSpriteSheet();
});
const saveSpriteSheet = () => {
  console.log("saveSpriteSheet");
  const spritesheetString = JSON.stringify(spriteSheet, null, 2);
  const blob = new Blob([spritesheetString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `spritesheet-${spriteSheet.name}.json`;
  a.click();

  URL.revokeObjectURL(url);
};

window.addEventListener("beforeunload", () => {
  if (autoSaveToLocalStorage) {
    saveToLocalStorage();
  }
});
