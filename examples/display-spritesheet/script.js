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

// SPRITE COLORS

/** @type {HTMLTemplateElement} */
const spriteColorIndexTemplate = document.getElementById(
  "spriteColorIndexTemplate"
);
const spriteColorIndicesContainer =
  document.getElementById("spriteColorIndices");
const setSpriteColorIndex = BS.ThrottleUtils.throttle(
  (spriteColorIndex, colorIndex) => {
    //console.log({ spriteColorIndex, colorIndex });
    displayCanvasHelper.selectSpriteColor(spriteColorIndex, colorIndex, true);
  },
  100,
  true
);
const setupSpriteColors = () => {
  spriteColorIndicesContainer.innerHTML = "";
  for (
    let spriteColorIndex = 0;
    spriteColorIndex < displayCanvasHelper.numberOfColors;
    spriteColorIndex++
  ) {
    const spriteColorIndexContainer = spriteColorIndexTemplate.content
      .cloneNode(true)
      .querySelector(".spriteColorIndex");

    const colorIndexSpan =
      spriteColorIndexContainer.querySelector(".colorIndex");
    colorIndexSpan.innerText = `sprite color #${spriteColorIndex}`;
    const colorIndexSelect = spriteColorIndexContainer.querySelector("select");
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
      setSpriteColorIndex(spriteColorIndex, colorIndex);
    });
    spriteColorIndicesContainer.appendChild(spriteColorIndexContainer);
  }
};
setupSpriteColors();
displayCanvasHelper.addEventListener("numberOfColors", () =>
  setupSpriteColors()
);
displayCanvasHelper.addEventListener("contextState", (event) => {
  const { differences } = event.message;
  if (differences.includes("spriteColorIndices")) {
    updateSpriteColorIndices();
  }
});
displayCanvasHelper.addEventListener("color", (event) => {
  if (
    displayCanvasHelper.spriteColorIndices.includes(event.message.colorIndex)
  ) {
    updateSpriteColorIndices();
  }
});
const updateSpriteColorIndices = () => {
  displayCanvasHelper.spriteColorIndices.forEach(
    (colorIndex, spriteColorIndex) => {
      if (selectedPalette) {
        selectedPalette.spriteColorIndices[spriteColorIndex] = colorIndex;
      }
      const spriteColorIndexContainer =
        spriteColorIndicesContainer.querySelectorAll(".spriteColorIndex")[
          spriteColorIndex
        ];
      spriteColorIndexContainer.querySelector("select").value = colorIndex;
      spriteColorIndexContainer.querySelector("input").value =
        displayCanvasHelper.spriteColors[spriteColorIndex];
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

/** @type {HTMLButtonElement} */
const addSpriteButton = document.getElementById("addSprite");
addSpriteButton.addEventListener("click", () => {
  addSprite();
});

/** @type {HTMLButtonElement} */
const addPaletteButton = document.getElementById("addPalette");
addPaletteButton.addEventListener("click", () => {
  addPalette();
});

/** @type {HTMLButtonElement} */
const addSpritePaletteSwapButton = document.getElementById(
  "addSpritePaletteSwap"
);
addSpritePaletteSwapButton.addEventListener("click", () => {
  addSpritePaletteSwap();
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
    spriteColorIndices: [],
  });
  const paletteIndex = spriteSheet.palettes.length - 1;
  updateSelectPaletteSelect();
  setPaletteIndex(paletteIndex);
  setNumberOfPaletteColors(2);
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

  onNumberOfPaletteColorsUpdate();
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
  if (differences.includes("spriteColorIndices")) {
    selectedPalette.spriteColorIndices = contextState.spriteColorIndices;
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
const numberOfPaletteColorsSelect = document.getElementById(
  "numberOfPaletteColors"
);
const numberOfPaletteColorsOptgroup =
  numberOfPaletteColorsSelect.querySelector("optgroup");
numberOfPaletteColorsSelect.addEventListener("input", () => {
  const numberOfPaletteColors = Number(numberOfPaletteColorsSelect.value);
  setNumberOfPaletteColors(numberOfPaletteColors);
});
const setNumberOfPaletteColors = (numberOfPaletteColors) => {
  console.log({ numberOfPaletteColors });

  if (selectedPalette) {
    selectedPalette.numberOfColors = numberOfPaletteColors;

    selectedPalette.colors.length = numberOfPaletteColors;
    selectedPalette.opacities.length = numberOfPaletteColors;
    for (let colorIndex = 0; colorIndex < numberOfPaletteColors; colorIndex++) {
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

  onNumberOfPaletteColorsUpdate();
};
const onNumberOfPaletteColorsUpdate = () => {
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
    let spriteColorIndex = 0;
    spriteColorIndex < displayCanvasHelper.numberOfColors;
    spriteColorIndex++
  ) {
    const enabled = selectedPalette
      ? spriteColorIndex < selectedPalette.numberOfColors
      : true;
    const spriteColorIndexContainer =
      spriteColorIndicesContainer.querySelectorAll(".spriteColorIndex")[
        spriteColorIndex
      ];
    spriteColorIndexContainer
      .querySelectorAll("option")
      .forEach((option, colorIndex) => {
        option.hidden = selectedPalette
          ? colorIndex >= selectedPalette.numberOfColors
          : false;
      });
    spriteColorIndexContainer.style.display = enabled ? "" : "none";
  }

  numberOfPaletteColorsSelect.disabled = selectedPalette == undefined;
  numberOfPaletteColorsSelect.value = selectedPalette?.numberOfColors ?? 2;

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
};
const updateNumberOfPaletteColorsSelect = () => {
  numberOfPaletteColorsOptgroup.innerHTML = "";
  for (
    let colorIndex = 2;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    numberOfPaletteColorsOptgroup.appendChild(new Option(colorIndex));
  }
};
updateNumberOfPaletteColorsSelect();
displayCanvasHelper.addEventListener("numberOfColors", () => {
  updateNumberOfPaletteColorsSelect();
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
    paletteSwaps: [],
  });
  const spriteIndex = spriteSheet.sprites.length - 1;
  updateSelectSpriteSelect();
  setSpriteIndex(spriteIndex);
};
const setSpriteIndex = (spriteIndex) => {
  selectedSpriteIndex = spriteIndex;
  console.log({ selectedSpriteIndex });
  selectedSprite = spriteSheet.sprites[selectedSpriteIndex];
  console.log("selectedSprite", selectedSprite);

  spriteNameInput.value = selectedSprite?.name ?? "";
  spriteNameInput.disabled = !selectedSprite;
  selectSpriteSelect.value = selectedSpriteIndex;

  deleteSpriteButton.disabled = !selectedSprite;

  selectSpritePaletteSwapSelect.disabled = !selectedSprite;
  addSpritePaletteSwapButton.disabled = !selectedSprite;

  spriteWidthInput.disabled = !selectedSprite;
  spriteHeightInput.disabled = !selectedSprite;
  if (selectedSprite) {
    setSpriteHeight(selectedSprite.height);
    setSpriteWidth(selectedSprite.width);
  }

  drawSpriteButton.disabled = !selectedSprite;

  drawSprite();
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
  drawSprite();
};

const spriteWidthContainer = document.getElementById("spriteWidth");
const spriteWidthInput = spriteWidthContainer.querySelector("input");
const spriteWidthSpan = spriteWidthContainer.querySelector("span");
spriteWidthInput.addEventListener("input", () => {
  setSpriteWidth(Number(spriteWidthInput.value));
});
const setSpriteWidth = (spriteWidth) => {
  console.log({ spriteWidth });
  if (selectedSprite) {
    selectedSprite.width = spriteWidth;
  }
  spriteWidthInput.value = spriteWidth;
  spriteWidthSpan.innerText = spriteWidth;
  drawSprite();
};

const spriteHeightContainer = document.getElementById("spriteHeight");
const spriteHeightInput = spriteHeightContainer.querySelector("input");
const spriteHeightSpan = spriteHeightContainer.querySelector("span");
spriteHeightInput.addEventListener("input", () => {
  setSpriteHeight(Number(spriteHeightInput.value));
});
const setSpriteHeight = (spriteHeight) => {
  console.log({ spriteHeight });
  if (selectedSprite) {
    selectedSprite.height = spriteHeight;
  }
  spriteHeightInput.value = spriteHeight;
  spriteHeightSpan.innerText = spriteHeight;
  drawSprite();
};

// PALETTE SWAP

let selectedSpritePaletteSwapIndex = -1;
/** @type {BS.DisplaySpritePaletteSwap?} */
let selectedSpritePaletteSwap;
const addSpritePaletteSwap = () => {
  //console.log("addSpritePaletteSwap");
  selectedSprite.paletteSwaps.push({
    name: `myPaletteSwap ${Object.keys(selectedSprite.paletteSwaps).length}`,
  });
  const spritePaletteSwapIndex = selectedSprite.paletteSwaps.length - 1;
  updateSelectSpritePaletteSwapSelect();
  setSpritePaletteSwapIndex(spritePaletteSwapIndex);
};
const setSpritePaletteSwapIndex = (spritePaletteSwapIndex) => {
  selectedSpritePaletteSwapIndex = spritePaletteSwapIndex;
  console.log({ selectedSpritePaletteSwapIndex });
  selectedSpritePaletteSwap =
    selectedSprite.paletteSwaps[selectedSpritePaletteSwapIndex];
  console.log("selectedSpritePaletteSwap", selectedSpritePaletteSwap);

  spritePaletteSwapNameInput.value = selectedSpritePaletteSwap?.name ?? "";
  spritePaletteSwapNameInput.disabled = !selectedSpritePaletteSwap;
  selectSpritePaletteSwapSelect.value = selectedSpritePaletteSwapIndex;

  deleteSpritePaletteSwapButton.disabled = !selectedSpritePaletteSwap;

  drawSprite();
};

/** @type {HTMLSelectElement} */
const selectSpritePaletteSwapSelect = document.getElementById(
  "selectSpritePaletteSwap"
);
const selectSpritePaletteSwapOptgroup =
  selectSpritePaletteSwapSelect.querySelector("optgroup");
selectSpritePaletteSwapSelect.addEventListener("input", () => {
  const selectedSpritePaletteSwapIndex = Number(
    selectSpritePaletteSwapSelect.value
  );
  setSpritePaletteSwapIndex(selectedSpritePaletteSwapIndex);
});
const updateSelectSpritePaletteSwapSelect = () => {
  selectSpritePaletteSwapOptgroup.innerHTML = "";
  selectSpritePaletteSwapOptgroup.appendChild(new Option("none", -1));
  selectedSprite?.paletteSwaps.forEach((paletteSwap, index) => {
    selectSpritePaletteSwapOptgroup.appendChild(
      new Option(paletteSwap.name, index)
    );
  });
  selectSpritePaletteSwapSelect.value = selectedSpritePaletteSwapIndex;
};
updateSelectSpritePaletteSwapSelect();

const spritePaletteSwapNameInput = document.getElementById(
  "spritePaletteSwapName"
);
spritePaletteSwapNameInput.addEventListener("input", () => {
  let spritePaletteSwapName = spritePaletteSwapNameInput.value;
  selectedSpritePaletteSwap.name = spritePaletteSwapName;
});
spritePaletteSwapNameInput.addEventListener("focusout", () => {
  updateSelectSpritePaletteSwapSelect();
});

const deleteSpritePaletteSwapButton = document.getElementById(
  "deleteSpritePaletteSwap"
);
deleteSpritePaletteSwapButton.addEventListener("click", () => {
  deleteSelectedSpritePaletteSwap();
});
const deleteSelectedSpritePaletteSwap = () => {
  if (!selectedSpritePaletteSwap) {
    return;
  }
  console.log("deleting spritePaletteSwap");
  selectedSprite.paletteSwaps.splice(selectedSpritePaletteSwapIndex, 1);
  setSpritePaletteSwapIndex(-1);
  updateSelectSpritePaletteSwapSelect();
  drawSprite();
};

// DRAW SPRITE
const drawSpriteButton = document.getElementById("drawSprite");
drawSpriteButton.addEventListener("click", () => {
  drawSprite();
});
let drawWhenReady = false;
let drawSprite = () => {
  if (!displayCanvasHelper.isReady) {
    drawWhenReady = true;
    return;
  }
  console.log("drawSprite");

  if (selectedSprite) {
    const {
      x,
      y,
      rotation,
      scaleX,
      scaleY,
      cropTop,
      cropRight,
      cropBottom,
      cropLeft,
      rotationCropTop,
      rotationCropRight,
      rotationCropBottom,
      rotationCropLeft,
    } = drawSpriteParams;

    displayCanvasHelper.setRotation(rotation, false);

    displayCanvasHelper.setCropTop(cropTop);
    displayCanvasHelper.setCropRight(cropRight);
    displayCanvasHelper.setCropBottom(cropBottom);
    displayCanvasHelper.setCropLeft(cropLeft);

    displayCanvasHelper.setRotationCropTop(rotationCropTop);
    displayCanvasHelper.setRotationCropRight(rotationCropRight);
    displayCanvasHelper.setRotationCropBottom(rotationCropBottom);
    displayCanvasHelper.setRotationCropLeft(rotationCropLeft);

    displayCanvasHelper.setSpriteScaleX(scaleX);
    displayCanvasHelper.setSpriteScaleY(scaleY);
    displayCanvasHelper.drawSprite(x, y, selectedSprite, selectedPalette);
    displayCanvasHelper.show();
  } else {
    displayCanvasHelper.clear();
  }
};
displayCanvasHelper.addEventListener("ready", () => {
  if (drawWhenReady) {
    drawWhenReady = false;
    drawSprite();
  }
});

const drawSpriteParams = {
  x: 50,
  y: 50,

  rotation: 0,

  scaleX: 1,
  scaleY: 1,

  cropTop: 0,
  cropRight: 0,
  cropBottom: 0,
  cropLeft: 0,

  rotationCropTop: 0,
  rotationCropRight: 0,
  rotationCropBottom: 0,
  rotationCropLeft: 0,
};

const drawSpriteXContainer = document.getElementById("drawSpriteX");
const drawSpriteXInput = drawSpriteXContainer.querySelector("input");
const drawSpriteXSpan = drawSpriteXContainer.querySelector(".value");
const setSpriteDrawX = (drawSpriteX) => {
  drawSpriteXInput.value = drawSpriteX;
  drawSpriteXSpan.innerText = drawSpriteX;
  drawSpriteParams.x = drawSpriteX;
};
drawSpriteXInput.addEventListener("input", () => {
  setSpriteDrawX(Number(drawSpriteXInput.value));
});

const drawSpriteYContainer = document.getElementById("drawSpriteY");
const drawSpriteYInput = drawSpriteYContainer.querySelector("input");
const drawSpriteYSpan = drawSpriteYContainer.querySelector(".value");
const setSpriteDrawY = (drawSpriteY) => {
  drawSpriteYInput.value = drawSpriteY;
  drawSpriteYSpan.innerText = drawSpriteY;
  drawSpriteParams.y = drawSpriteY;
};
drawSpriteYInput.addEventListener("input", () => {
  setSpriteDrawY(Number(drawSpriteYInput.value));
});

const drawSpriteRotationContainer =
  document.getElementById("drawSpriteRotation");
const drawSpriteRotationInput =
  drawSpriteRotationContainer.querySelector("input");
const drawSpriteRotationSpan =
  drawSpriteRotationContainer.querySelector(".value");
const setSpriteDrawRotation = (drawSpriteRotation) => {
  drawSpriteRotationInput.value = drawSpriteRotation;
  drawSpriteRotationSpan.innerText = drawSpriteRotation;
  drawSpriteParams.rotation = drawSpriteRotation;
};
drawSpriteRotationInput.addEventListener("input", () => {
  setSpriteDrawRotation(Number(drawSpriteRotationInput.value));
});

const drawSpriteScaleXContainer = document.getElementById("drawSpriteScaleX");
const drawSpriteScaleXInput = drawSpriteScaleXContainer.querySelector("input");
const drawSpriteScaleXSpan = drawSpriteScaleXContainer.querySelector(".value");
const setSpriteDrawScaleX = (drawSpriteScaleX) => {
  drawSpriteScaleXInput.value = drawSpriteScaleX;
  drawSpriteScaleXSpan.innerText = drawSpriteScaleX;
  drawSpriteParams.scaleX = drawSpriteScaleX;
};
drawSpriteScaleXInput.addEventListener("input", () => {
  setSpriteDrawScaleX(Number(drawSpriteScaleXInput.value));
});

const drawSpriteScaleYContainer = document.getElementById("drawSpriteScaleY");
const drawSpriteScaleYInput = drawSpriteScaleYContainer.querySelector("input");
const drawSpriteScaleYSpan = drawSpriteScaleYContainer.querySelector(".value");
const setSpriteDrawScaleY = (drawSpriteScaleY) => {
  drawSpriteScaleYInput.value = drawSpriteScaleY;
  drawSpriteScaleYSpan.innerText = drawSpriteScaleY;
  drawSpriteParams.scaleY = drawSpriteScaleY;
};
drawSpriteScaleYInput.addEventListener("input", () => {
  setSpriteDrawScaleY(Number(drawSpriteScaleYInput.value));
});

const drawSpriteScaleContainer = document.getElementById("drawSpriteScale");
const drawSpriteScaleInput = drawSpriteScaleContainer.querySelector("input");
const drawSpriteScaleSpan = drawSpriteScaleContainer.querySelector(".value");
const setSpriteDrawScale = (drawSpriteScale) => {
  drawSpriteScaleInput.value = drawSpriteScale;
  drawSpriteScaleSpan.innerText = drawSpriteScale;
  setSpriteDrawScaleX(drawSpriteScale);
  setSpriteDrawScaleY(drawSpriteScale);
};
drawSpriteScaleInput.addEventListener("input", () => {
  setSpriteDrawScale(Number(drawSpriteScaleInput.value));
});

const drawSpriteCropTopContainer = document.getElementById("drawSpriteCropTop");
const drawSpriteCropTopInput =
  drawSpriteCropTopContainer.querySelector("input");
const drawSpriteCropTopSpan =
  drawSpriteCropTopContainer.querySelector(".value");
const setSpriteDrawCropTop = (drawSpriteCropTop) => {
  drawSpriteCropTopInput.value = drawSpriteCropTop;
  drawSpriteCropTopSpan.innerText = drawSpriteCropTop;
  drawSpriteParams.cropTop = drawSpriteCropTop;
};
drawSpriteCropTopInput.addEventListener("input", () => {
  setSpriteDrawCropTop(Number(drawSpriteCropTopInput.value));
});

const drawSpriteCropRightContainer = document.getElementById(
  "drawSpriteCropRight"
);
const drawSpriteCropRightInput =
  drawSpriteCropRightContainer.querySelector("input");
const drawSpriteCropRightSpan =
  drawSpriteCropRightContainer.querySelector(".value");
const setSpriteDrawCropRight = (drawSpriteCropRight) => {
  drawSpriteCropRightInput.value = drawSpriteCropRight;
  drawSpriteCropRightSpan.innerText = drawSpriteCropRight;
  drawSpriteParams.cropRight = drawSpriteCropRight;
};
drawSpriteCropRightInput.addEventListener("input", () => {
  setSpriteDrawCropRight(Number(drawSpriteCropRightInput.value));
});

const drawSpriteCropBottomContainer = document.getElementById(
  "drawSpriteCropBottom"
);
const drawSpriteCropBottomInput =
  drawSpriteCropBottomContainer.querySelector("input");
const drawSpriteCropBottomSpan =
  drawSpriteCropBottomContainer.querySelector(".value");
const setSpriteDrawCropBottom = (drawSpriteCropBottom) => {
  drawSpriteCropBottomInput.value = drawSpriteCropBottom;
  drawSpriteCropBottomSpan.innerText = drawSpriteCropBottom;
  drawSpriteParams.cropBottom = drawSpriteCropBottom;
};
drawSpriteCropBottomInput.addEventListener("input", () => {
  setSpriteDrawCropBottom(Number(drawSpriteCropBottomInput.value));
});

const drawSpriteCropLeftContainer =
  document.getElementById("drawSpriteCropLeft");
const drawSpriteCropLeftInput =
  drawSpriteCropLeftContainer.querySelector("input");
const drawSpriteCropLeftSpan =
  drawSpriteCropLeftContainer.querySelector(".value");
const setSpriteDrawCropLeft = (drawSpriteCropLeft) => {
  drawSpriteCropLeftInput.value = drawSpriteCropLeft;
  drawSpriteCropLeftSpan.innerText = drawSpriteCropLeft;
  drawSpriteParams.cropLeft = drawSpriteCropLeft;
};
drawSpriteCropLeftInput.addEventListener("input", () => {
  setSpriteDrawCropLeft(Number(drawSpriteCropLeftInput.value));
});

const drawSpriteRotationCropTopContainer = document.getElementById(
  "drawSpriteRotationCropTop"
);
const drawSpriteRotationCropTopInput =
  drawSpriteRotationCropTopContainer.querySelector("input");
const drawSpriteRotationCropTopSpan =
  drawSpriteRotationCropTopContainer.querySelector(".value");
const setSpriteDrawRotationCropTop = (drawSpriteRotationCropTop) => {
  drawSpriteRotationCropTopInput.value = drawSpriteRotationCropTop;
  drawSpriteRotationCropTopSpan.innerText = drawSpriteRotationCropTop;
  drawSpriteParams.rotationCropTop = drawSpriteRotationCropTop;
};
drawSpriteRotationCropTopInput.addEventListener("input", () => {
  setSpriteDrawRotationCropTop(Number(drawSpriteRotationCropTopInput.value));
});

const drawSpriteRotationCropRightContainer = document.getElementById(
  "drawSpriteRotationCropRight"
);
const drawSpriteRotationCropRightInput =
  drawSpriteRotationCropRightContainer.querySelector("input");
const drawSpriteRotationCropRightSpan =
  drawSpriteRotationCropRightContainer.querySelector(".value");
const setSpriteDrawRotationCropRight = (drawSpriteRotationCropRight) => {
  drawSpriteRotationCropRightInput.value = drawSpriteRotationCropRight;
  drawSpriteRotationCropRightSpan.innerText = drawSpriteRotationCropRight;
  drawSpriteParams.rotationCropRight = drawSpriteRotationCropRight;
};
drawSpriteRotationCropRightInput.addEventListener("input", () => {
  setSpriteDrawRotationCropRight(
    Number(drawSpriteRotationCropRightInput.value)
  );
});

const drawSpriteRotationCropBottomContainer = document.getElementById(
  "drawSpriteRotationCropBottom"
);
const drawSpriteRotationCropBottomInput =
  drawSpriteRotationCropBottomContainer.querySelector("input");
const drawSpriteRotationCropBottomSpan =
  drawSpriteRotationCropBottomContainer.querySelector(".value");
const setSpriteDrawRotationCropBottom = (drawSpriteRotationCropBottom) => {
  drawSpriteRotationCropBottomInput.value = drawSpriteRotationCropBottom;
  drawSpriteRotationCropBottomSpan.innerText = drawSpriteRotationCropBottom;
  drawSpriteParams.rotationCropBottom = drawSpriteRotationCropBottom;
};
drawSpriteRotationCropBottomInput.addEventListener("input", () => {
  setSpriteDrawRotationCropBottom(
    Number(drawSpriteRotationCropBottomInput.value)
  );
});

const drawSpriteRotationCropLeftContainer = document.getElementById(
  "drawSpriteRotationCropLeft"
);
const drawSpriteRotationCropLeftInput =
  drawSpriteRotationCropLeftContainer.querySelector("input");
const drawSpriteRotationCropLeftSpan =
  drawSpriteRotationCropLeftContainer.querySelector(".value");
const setSpriteDrawRotationCropLeft = (drawSpriteRotationCropLeft) => {
  drawSpriteRotationCropLeftInput.value = drawSpriteRotationCropLeft;
  drawSpriteRotationCropLeftSpan.innerText = drawSpriteRotationCropLeft;
  drawSpriteParams.rotationCropLeft = drawSpriteRotationCropLeft;
};
drawSpriteRotationCropLeftInput.addEventListener("input", () => {
  setSpriteDrawRotationCropLeft(Number(drawSpriteRotationCropLeftInput.value));
});

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
