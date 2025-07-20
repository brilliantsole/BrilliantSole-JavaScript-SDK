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
displayCanvasHelper.setBrightness("veryHigh");

displayCanvasHelper.addEventListener("resize", () => {
  console.log("resize!");
  displayCanvasHelper.canvas.style.width = `${displayCanvasHelper.width}px`;
  displayCanvasHelper.canvas.style.height = `${displayCanvasHelper.height}px`;
});
displayCanvasHelper.canvas.style.width = `${displayCanvasHelper.width}px`;
displayCanvasHelper.canvas.style.height = `${displayCanvasHelper.height}px`;

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
    updateBitmapColorInputs();
    updateFillColorInputs();
    updateLineColorInputs();
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
    drawSprite();
    updateBitmapColorInputs();
    updateFillColorInputs();
    updateLineColorInputs();
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
    let enabled = selectedPalette
      ? spriteColorIndex < selectedPalette.numberOfColors
      : true;
    if (selectedSpritePaletteSwap) {
      console.log({
        spriteColorIndex,
        "selectedSpritePaletteSwap.numberOfColors":
          selectedSpritePaletteSwap.numberOfColors,
      });
      enabled =
        enabled && spriteColorIndex < selectedSpritePaletteSwap.numberOfColors;
    }
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
  updateSpriteColorIndices();

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
updateSpriteColorIndices();

const updateNumberOfPaletteColorsSelect = () => {
  numberOfPaletteColorsOptgroup.innerHTML = "";
  for (
    let colorIndex = 1;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    numberOfPaletteColorsOptgroup.appendChild(new Option(colorIndex + 1));
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
    commands: [],
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

  addSpriteCommandButton.disabled = !selectedSprite;
  updateSpriteCommands();

  spriteWidthInput.disabled = !selectedSprite;
  spriteHeightInput.disabled = !selectedSprite;
  if (selectedSprite) {
    setSpriteHeight(selectedSprite.height);
    setSpriteWidth(selectedSprite.width);
  }

  if (!selectedSprite) {
    setSpritePaletteSwapIndex(-1);
    updateSelectSpritePaletteSwapSelect();
  }

  drawSpriteButton.disabled = !selectedSprite;

  updateSelectSpritePaletteSwapSelect();

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

// SPRITE PALETTE SWAP

let selectedSpritePaletteSwapIndex = -1;
/** @type {BS.DisplaySpritePaletteSwap?} */
let selectedSpritePaletteSwap;
const addSpritePaletteSwap = () => {
  //console.log("addSpritePaletteSwap");
  selectedSprite.paletteSwaps.push({
    name: `myPaletteSwap ${Object.keys(selectedSprite.paletteSwaps).length}`,
    numberOfColors: 0,
    spriteColorIndices: [],
  });
  const spritePaletteSwapIndex = selectedSprite.paletteSwaps.length - 1;
  updateSelectSpritePaletteSwapSelect();
  setSpritePaletteSwapIndex(spritePaletteSwapIndex);
  setNumberOfSpritePaletteSwapColors(
    selectedPalette?.numberOfColors ?? displayCanvasHelper.numberOfColors
  );
};
const setSpritePaletteSwapIndex = (spritePaletteSwapIndex) => {
  selectedSpritePaletteSwapIndex = spritePaletteSwapIndex;
  console.log({ selectedSpritePaletteSwapIndex });
  selectedSpritePaletteSwap =
    selectedSprite?.paletteSwaps?.[selectedSpritePaletteSwapIndex];
  console.log("selectedSpritePaletteSwap", selectedSpritePaletteSwap);

  spritePaletteSwapNameInput.value = selectedSpritePaletteSwap?.name ?? "";
  spritePaletteSwapNameInput.disabled = !selectedSpritePaletteSwap;
  selectSpritePaletteSwapSelect.value = selectedSpritePaletteSwapIndex;

  deleteSpritePaletteSwapButton.disabled = !selectedSpritePaletteSwap;

  updateNumberOfSpritePaletteSwapColorsSelect();

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

/** @type {HTMLSelectElement} */
const numberOfSpritePaletteSwapColorsSelect = document.getElementById(
  "numberOfSpritePaletteSwapColors"
);
const numberOfSpritePaletteSwapColorsOptgroup =
  numberOfSpritePaletteSwapColorsSelect.querySelector("optgroup");
numberOfSpritePaletteSwapColorsSelect.addEventListener("input", () => {
  const numberOfSpritePaletteSwapColors = Number(
    numberOfSpritePaletteSwapColorsSelect.value
  );
  setNumberOfSpritePaletteSwapColors(numberOfSpritePaletteSwapColors);
});
const setNumberOfSpritePaletteSwapColors = (
  numberOfSpritePaletteSwapColors
) => {
  console.log({ numberOfSpritePaletteSwapColors });

  if (selectedSpritePaletteSwap) {
    selectedSpritePaletteSwap.numberOfColors = numberOfSpritePaletteSwapColors;

    selectedSpritePaletteSwap.spriteColorIndices.length =
      numberOfSpritePaletteSwapColors;
    for (
      let spriteColorIndex = 0;
      spriteColorIndex < numberOfSpritePaletteSwapColors;
      spriteColorIndex++
    ) {
      const colorIndex =
        selectedSpritePaletteSwap.spriteColorIndices[spriteColorIndex];
      if (colorIndex == undefined) {
        selectedSpritePaletteSwap.spriteColorIndices[spriteColorIndex] =
          spriteColorIndex;
      }
    }
  }

  onNumberOfSpritePaletteSwapColorsUpdate();
};
const onNumberOfSpritePaletteSwapColorsUpdate = () => {
  if (!selectedSpritePaletteSwap) {
    return;
  }

  for (
    let spriteColorIndex = 0;
    spriteColorIndex < selectedSpritePaletteSwap.numberOfColors;
    spriteColorIndex++
  ) {
    const enabled = selectedSpritePaletteSwap
      ? spriteColorIndex < selectedSpritePaletteSwap.numberOfColors
      : true;
    const spriteColorIndexContainer =
      spriteColorIndicesContainer.querySelectorAll(".spriteColorIndex")[
        spriteColorIndex
      ];
    spriteColorIndexContainer
      .querySelectorAll("option")
      .forEach((option, colorIndex) => {
        option.hidden = selectedSpritePaletteSwap
          ? colorIndex >= selectedSpritePaletteSwap.numberOfColors
          : false;
      });
    spriteColorIndexContainer.style.display = enabled ? "" : "none";
  }

  onNumberOfPaletteColorsUpdate(); // FIX
  updateNumberOfSpritePaletteSwapColorsSelect();
};
const updateNumberOfSpritePaletteSwapColorsSelect = () => {
  numberOfSpritePaletteSwapColorsOptgroup.innerHTML = "";
  for (
    let colorIndex = 1;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    numberOfSpritePaletteSwapColorsOptgroup.appendChild(
      new Option(colorIndex + 1)
    );
  }

  numberOfSpritePaletteSwapColorsSelect.disabled =
    selectedSpritePaletteSwap == undefined;
  numberOfSpritePaletteSwapColorsSelect.value =
    selectedSpritePaletteSwap?.numberOfColors ??
    selectedPalette?.numberOfColors ??
    displayCanvasHelper.numberOfColors;
};
updateNumberOfSpritePaletteSwapColorsSelect();
displayCanvasHelper.addEventListener("numberOfColors", () => {
  updateNumberOfSpritePaletteSwapColorsSelect();
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
      scale,
      cropTop,
      cropRight,
      cropBottom,
      cropLeft,
      rotationCropTop,
      rotationCropRight,
      rotationCropBottom,
      rotationCropLeft,
    } = drawSpriteParams;

    displayCanvasHelper._setCanvasContextTransform(
      x,
      y,
      selectedSprite.width,
      selectedSprite.height,
      scale,
      { top: cropTop, right: cropRight, bottom: cropBottom, left: cropLeft },
      {
        top: rotationCropTop,
        right: rotationCropRight,
        bottom: rotationCropBottom,
        left: rotationCropLeft,
      },
      rotation,
      false
    );
    displayCanvasHelper._setClearCanvasBoundingBoxOnDraw(false);
    displayCanvasHelper._setUseSpriteColorIndices(true);
    displayCanvasHelper._saveContextForSprite();
    displayCanvasHelper.runContextCommands(
      selectedSprite.commands.filter((command) => !command.hide)
    );
    displayCanvasHelper._restoreContextForSprite();
    displayCanvasHelper._setUseSpriteColorIndices(false);
    displayCanvasHelper._setClearCanvasBoundingBoxOnDraw(true);
    displayCanvasHelper._resetCanvasContextTransform();

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

  scale: 1,

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
  drawSprite();
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
  drawSprite();
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
  drawSprite();
};
drawSpriteRotationInput.addEventListener("input", () => {
  setSpriteDrawRotation(Number(drawSpriteRotationInput.value));
});

const drawSpriteScaleContainer = document.getElementById("drawSpriteScale");
const drawSpriteScaleInput = drawSpriteScaleContainer.querySelector("input");
const drawSpriteScaleSpan = drawSpriteScaleContainer.querySelector(".value");
const setSpriteDrawScale = (drawSpriteScale) => {
  drawSpriteScaleInput.value = drawSpriteScale;
  drawSpriteScaleSpan.innerText = drawSpriteScale;
  drawSpriteParams.scale = drawSpriteScale;
  drawSprite();
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
  drawSprite();
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
  drawSprite();
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
  drawSprite();
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
  drawSprite();
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
  drawSprite();
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
  drawSprite();
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
  drawSprite();
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
  drawSprite();
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

// SPRITE COMMANDS
const addSpriteCommandButton = document.getElementById("addSpriteCommand");
addSpriteCommandButton.addEventListener("click", () => {
  addSpriteCommand();
});
const addSpriteCommand = () => {
  console.log("addSpriteCommand");
  if (selectedSprite) {
    switch (spriteCommandType) {
      case "drawRect":
        selectedSprite.commands.push({
          type: "drawRect",
          centerX: 0,
          centerY: 0,
          width: 50,
          height: 25,
        });
        break;
      case "clearRect":
        selectedSprite.commands.push({
          type: "clearRect",
          x: -25,
          y: -25,
          width: 50,
          height: 25,
        });
        break;
      case "drawCircle":
        selectedSprite.commands.push({
          type: "drawCircle",
          centerX: 0,
          centerY: 0,
          radius: 25,
        });
        break;
      case "drawEllipse":
        selectedSprite.commands.push({
          type: "drawEllipse",
          centerX: 0,
          centerY: 0,
          radiusX: 50,
          radiusY: 25,
        });
        break;
      case "drawRoundRect":
        selectedSprite.commands.push({
          type: "drawRoundRect",
          centerX: 0,
          centerY: 0,
          borderRadius: 5,
          width: 50,
          height: 25,
        });
        break;
      case "drawArc":
        selectedSprite.commands.push({
          type: "drawArc",
          centerX: 0,
          centerY: 0,
          radius: 25,
          startAngle: 0,
          angleOffset: 90,
        });
        break;
      case "drawArcEllipse":
        selectedSprite.commands.push({
          type: "drawArcEllipse",
          centerX: 0,
          centerY: 0,
          radiusX: 50,
          radiusY: 25,
          startAngle: 0,
          angleOffset: 90,
        });
        break;
      case "drawPolygon":
        selectedSprite.commands.push({
          type: "drawPolygon",
          centerX: 0,
          centerY: 0,
          radius: 25,
          numberOfSides: 5,
        });
        break;
      case "drawSegment":
        selectedSprite.commands.push({
          type: "drawSegment",
          startX: 0,
          startY: 0,
          endX: 25,
          endY: 25,
        });
        break;
      case "drawSegments":
        selectedSprite.commands.push({
          type: "drawSegments",
          points: [
            { x: 0, y: 0 },
            { x: 25, y: 25 },
          ],
        });
        break;
      case "drawBitmap":
        selectedSprite.commands.push({
          type: "drawBitmap",
          centerX: 0,
          centerY: 0,
          bitmap: {
            width: 10,
            height: 10,
            pixels: new Array(100).fill(0),
            numberOfColors: 2,
          },
        });
        break;
      case "setBitmapScale":
        selectedSprite.commands.push({
          type: "setBitmapScale",
          bitmapScale: 1,
        });
        break;
      case "setBitmapScaleX":
        selectedSprite.commands.push({
          type: "setBitmapScaleX",
          bitmapScaleX: 1,
        });
        break;
      case "setBitmapScaleY":
        selectedSprite.commands.push({
          type: "setBitmapScaleY",
          bitmapScaleY: 1,
        });
        break;
      case "setRotation":
        selectedSprite.commands.push({
          type: "setRotation",
          rotation: 0,
        });
        break;
      case "setLineWidth":
        selectedSprite.commands.push({
          type: "setLineWidth",
          lineWidth: 0,
        });
        break;
      case "clearRotation":
        selectedSprite.commands.push({
          type: "clearRotation",
        });
        break;
      case "clearRotation":
      case "clearCrop":
      case "clearRotationCrop":
      case "resetBitmapScale":
        selectedSprite.commands.push({
          type: spriteCommandType,
        });
        break;
      case "selectLineColor":
        selectedSprite.commands.push({
          type: "selectLineColor",
          lineColorIndex: 1,
        });
        break;
      case "selectFillColor":
        selectedSprite.commands.push({
          type: "selectFillColor",
          fillColorIndex: 1,
        });
        break;
      case "selectBitmapColor":
        selectedSprite.commands.push({
          type: "selectBitmapColor",
          bitmapColorIndex: 1,
          colorIndex: 1,
        });
        break;
      case "selectBitmapColors":
        selectedSprite.commands.push({
          type: "selectBitmapColors",
          bitmapColorPairs: [{ bitmapColorIndex: 1, colorIndex: 1 }],
        });
        break;
      case "setCropTop":
        selectedSprite.commands.push({
          type: "setCropTop",
          cropTop: 0,
        });
        break;
      case "setCropRight":
        selectedSprite.commands.push({
          type: "setCropRight",
          cropTop: 0,
        });
        break;
      case "setCropBottom":
        selectedSprite.commands.push({
          type: "setCropBottom",
          cropTop: 0,
        });
        break;
      case "setCropLeft":
        selectedSprite.commands.push({
          type: "setCropLeft",
          cropTop: 0,
        });
        break;

      case "setRotationCropTop":
        selectedSprite.commands.push({
          type: "setRotationCropTop",
          rotationCropTop: 0,
        });
        break;
      case "setRotationCropRight":
        selectedSprite.commands.push({
          type: "setRotationCropRight",
          rotationCropTop: 0,
        });
        break;
      case "setRotationCropBottom":
        selectedSprite.commands.push({
          type: "setRotationCropBottom",
          rotationCropTop: 0,
        });
        break;
      case "setRotationCropLeft":
        selectedSprite.commands.push({
          type: "setRotationCropLeft",
          rotationCropTop: 0,
        });
        break;

      case "setSegmentRadius":
        selectedSprite.commands.push({
          type: "setSegmentRadius",
          segmentRadius: 1,
        });
        break;
      case "setSegmentStartRadius":
        selectedSprite.commands.push({
          type: "setSegmentStartRadius",
          segmentStartRadius: 1,
        });
        break;
      case "setSegmentEndRadius":
        selectedSprite.commands.push({
          type: "setSegmentEndRadius",
          segmentEndRadius: 1,
        });
        break;

      case "setSegmentCap":
        selectedSprite.commands.push({
          type: "setSegmentCap",
          segmentCap: "flat",
        });
        break;
      case "setSegmentStartCap":
        selectedSprite.commands.push({
          type: "setSegmentStartCap",
          segmentStartCap: "flat",
        });
        break;
      case "setSegmentEndCap":
        selectedSprite.commands.push({
          type: "setSegmentEndCap",
          segmentEndCap: "flat",
        });
        break;
    }
  }
  updateSpriteCommands();
  drawSprite();
};
const spriteCommandsContainer = document.getElementById("spriteCommands");
/** @type {HTMLTemplateElement} */
const spriteCommandTemplate = document.getElementById("spriteCommandTemplate");
/** @type {HTMLTemplateElement} */
const pointTemplate = document.getElementById("pointTemplate");
/** @type {HTMLTemplateElement} */
const bitmapColorPairTemplate = document.getElementById(
  "bitmapColorPairTemplate"
);
const updateSpriteCommands = () => {
  spriteCommandsContainer.innerHTML = "";
  if (selectedSprite) {
    selectedSprite?.commands.forEach((command, index) => {
      console.log(index, command);
      const spriteCommandContainer = spriteCommandTemplate.content
        .cloneNode(true)
        .querySelector(".spriteCommand");
      spriteCommandContainer.querySelector(".index").innerText = index;
      spriteCommandContainer.querySelector(".type").innerText = command.type;

      if (index > 0) {
        let newIndex = index - 1;
        const moveUpButton = spriteCommandContainer.querySelector(".moveUp");
        moveUpButton.disabled = false;
        moveUpButton.addEventListener("click", () => {
          const temp = selectedSprite.commands[newIndex];
          selectedSprite.commands[newIndex] = command;
          selectedSprite.commands[index] = temp;
          drawSprite();
          updateSpriteCommands();
        });
      }
      if (index < selectedSprite.commands.length - 1) {
        let newIndex = index + 1;
        const moveDownButton =
          spriteCommandContainer.querySelector(".moveDown");
        moveDownButton.disabled = false;
        moveDownButton.addEventListener("click", () => {
          const temp = selectedSprite.commands[newIndex];
          selectedSprite.commands[newIndex] = command;
          selectedSprite.commands[index] = temp;
          drawSprite();
          updateSpriteCommands();
        });
      }
      const removeButton = spriteCommandContainer.querySelector(".remove");
      removeButton.addEventListener("click", () => {
        selectedSprite?.commands.splice(index, 1);
        drawSprite();
        updateSpriteCommands();
      });

      const toggleButton = spriteCommandContainer.querySelector(".toggle");
      toggleButton.addEventListener("click", () => {
        const command = selectedSprite?.commands[index];
        command.hide = !command.hide;
        toggleButton.innerText = command.hide ? "show" : "hide";
        drawSprite();
      });

      const includeCenterPosition = "centerX" in command;
      if (includeCenterPosition) {
        const centerXContainer =
          spriteCommandContainer.querySelector(".centerX");
        centerXContainer.removeAttribute("hidden");
        const centerXInput = centerXContainer.querySelector("input");
        centerXInput.value = command.centerX;
        const centerXSpan = centerXContainer.querySelector(".value");
        centerXSpan.innerText = command.centerX;
        centerXContainer.addEventListener("input", () => {
          command.centerX = Number(centerXInput.value);
          centerXSpan.innerText = command.centerX;
          drawSprite();
        });

        const centerYContainer =
          spriteCommandContainer.querySelector(".centerY");
        const centerYInput = centerYContainer.querySelector("input");
        centerYInput.value = command.centerY;
        const centerYSpan = centerYContainer.querySelector(".value");
        centerYSpan.innerText = command.centerY;
        centerYContainer.removeAttribute("hidden");
        centerYContainer.addEventListener("input", () => {
          command.centerY = Number(centerYInput.value);
          centerYSpan.innerText = command.centerY;
          drawSprite();
        });
      }

      const includePosition = "x" in command;
      if (includePosition) {
        const xContainer = spriteCommandContainer.querySelector(".x");
        xContainer.removeAttribute("hidden");
        const xInput = xContainer.querySelector("input");
        xInput.value = command.x;
        const xSpan = xContainer.querySelector(".value");
        xSpan.innerText = command.x;
        xContainer.addEventListener("input", () => {
          command.x = Number(xInput.value);
          xSpan.innerText = command.x;
          drawSprite();
        });

        const yContainer = spriteCommandContainer.querySelector(".y");
        const yInput = yContainer.querySelector("input");
        yInput.value = command.y;
        const ySpan = yContainer.querySelector(".value");
        ySpan.innerText = command.y;
        yContainer.removeAttribute("hidden");
        yContainer.addEventListener("input", () => {
          command.y = Number(yInput.value);
          ySpan.innerText = command.y;
          drawSprite();
        });
      }

      const includeSize = "width" in command;
      if (includeSize) {
        const widthContainer = spriteCommandContainer.querySelector(".width");
        const widthInput = widthContainer.querySelector("input");
        widthInput.value = command.width;
        const widthSpan = widthContainer.querySelector(".value");
        widthSpan.innerText = command.width;
        widthContainer.removeAttribute("hidden");
        widthContainer.addEventListener("input", () => {
          command.width = Number(widthInput.value);
          widthSpan.innerText = command.width;
          drawSprite();
        });

        const heightContainer = spriteCommandContainer.querySelector(".height");
        const heightInput = heightContainer.querySelector("input");
        heightInput.value = command.height;
        const heightSpan = heightContainer.querySelector(".value");
        heightSpan.innerText = command.height;
        heightContainer.removeAttribute("hidden");
        heightContainer.addEventListener("input", () => {
          command.height = Number(heightInput.value);
          heightSpan.innerText = command.height;
          drawSprite();
        });
      }

      const includeRadius = "radius" in command;
      if (includeRadius) {
        const radiusContainer = spriteCommandContainer.querySelector(".radius");
        const radiusInput = radiusContainer.querySelector("input");
        radiusInput.value = command.radius;
        const radiusSpan = radiusContainer.querySelector(".value");
        radiusSpan.innerText = command.radius;
        radiusContainer.removeAttribute("hidden");
        radiusContainer.addEventListener("input", () => {
          command.radius = Number(radiusInput.value);
          radiusSpan.innerText = command.radius;
          drawSprite();
        });
      }

      const includeEllipseRadius = "radiusX" in command;
      if (includeEllipseRadius) {
        const radiusXContainer =
          spriteCommandContainer.querySelector(".radiusX");
        const radiusXInput = radiusXContainer.querySelector("input");
        radiusXInput.value = command.radiusX;
        const radiusXSpan = radiusXContainer.querySelector(".value");
        radiusXSpan.innerText = command.radiusX;
        radiusXContainer.removeAttribute("hidden");
        radiusXContainer.addEventListener("input", () => {
          command.radiusX = Number(radiusXInput.value);
          radiusXSpan.innerText = command.radiusX;
          drawSprite();
        });

        const radiusYContainer =
          spriteCommandContainer.querySelector(".radiusY");
        const radiusYInput = radiusYContainer.querySelector("input");
        radiusYInput.value = command.radiusY;
        const radiusYSpan = radiusYContainer.querySelector(".value");
        radiusYSpan.innerText = command.radiusY;
        radiusYContainer.removeAttribute("hidden");
        radiusYContainer.addEventListener("input", () => {
          command.radiusY = Number(radiusYInput.value);
          radiusYSpan.innerText = command.radiusY;
          drawSprite();
        });
      }

      const includeBorderRadius = "borderRadius" in command;
      if (includeBorderRadius) {
        const borderRadiusContainer =
          spriteCommandContainer.querySelector(".borderRadius");
        const borderRadiusInput = borderRadiusContainer.querySelector("input");
        borderRadiusInput.value = command.borderRadius;
        const borderRadiusSpan = borderRadiusContainer.querySelector(".value");
        borderRadiusSpan.innerText = command.borderRadius;
        borderRadiusContainer.removeAttribute("hidden");
        borderRadiusContainer.addEventListener("input", () => {
          command.borderRadius = Number(borderRadiusInput.value);
          borderRadiusSpan.innerText = command.borderRadius;
          drawSprite();
        });
      }

      const includeAngles = "startAngle" in command;
      if (includeAngles) {
        const startAngleContainer =
          spriteCommandContainer.querySelector(".startAngle");
        const startAngleInput = startAngleContainer.querySelector("input");
        startAngleInput.value = command.startAngle;
        const startAngleSpan = startAngleContainer.querySelector(".value");
        startAngleSpan.innerText = command.startAngle;
        startAngleContainer.removeAttribute("hidden");
        startAngleContainer.addEventListener("input", () => {
          command.startAngle = Number(startAngleInput.value);
          startAngleSpan.innerText = command.startAngle;
          drawSprite();
        });

        const angleOffsetContainer =
          spriteCommandContainer.querySelector(".angleOffset");
        const angleOffsetInput = angleOffsetContainer.querySelector("input");
        angleOffsetInput.value = command.angleOffset;
        const angleOffsetSpan = angleOffsetContainer.querySelector(".value");
        angleOffsetSpan.innerText = command.angleOffset;
        angleOffsetContainer.removeAttribute("hidden");
        angleOffsetContainer.addEventListener("input", () => {
          command.angleOffset = Number(angleOffsetInput.value);
          angleOffsetSpan.innerText = command.angleOffset;
          drawSprite();
        });
      }

      const includeNumberOfSides = "numberOfSides" in command;
      if (includeNumberOfSides) {
        const numberOfSidesContainer =
          spriteCommandContainer.querySelector(".numberOfSides");
        const numberOfSidesInput =
          numberOfSidesContainer.querySelector("input");
        numberOfSidesInput.value = command.numberOfSides;
        const numberOfSidesSpan =
          numberOfSidesContainer.querySelector(".value");
        numberOfSidesSpan.innerText = command.numberOfSides;
        numberOfSidesContainer.removeAttribute("hidden");
        numberOfSidesContainer.addEventListener("input", () => {
          command.numberOfSides = Number(numberOfSidesInput.value);
          numberOfSidesSpan.innerText = command.numberOfSides;
          drawSprite();
        });
      }

      const includeEndpoints = "startX" in command;
      if (includeEndpoints) {
        const startXContainer = spriteCommandContainer.querySelector(".startX");
        const startXInput = startXContainer.querySelector("input");
        startXInput.value = command.startX;
        const startXSpan = startXContainer.querySelector(".value");
        startXSpan.innerText = command.startX;
        startXContainer.removeAttribute("hidden");
        startXContainer.addEventListener("input", () => {
          command.startX = Number(startXInput.value);
          startXSpan.innerText = command.startX;
          drawSprite();
        });

        const startYContainer = spriteCommandContainer.querySelector(".startY");
        const startYInput = startYContainer.querySelector("input");
        startYInput.value = command.startY;
        const startYSpan = startYContainer.querySelector(".value");
        startYSpan.innerText = command.startY;
        startYContainer.removeAttribute("hidden");
        startYContainer.addEventListener("input", () => {
          command.startY = Number(startYInput.value);
          startYSpan.innerText = command.startY;
          drawSprite();
        });

        const endXContainer = spriteCommandContainer.querySelector(".endX");
        const endXInput = endXContainer.querySelector("input");
        endXInput.value = command.endX;
        const endXSpan = endXContainer.querySelector(".value");
        endXSpan.innerText = command.endX;
        endXContainer.removeAttribute("hidden");
        endXContainer.addEventListener("input", () => {
          command.endX = Number(endXInput.value);
          endXSpan.innerText = command.endX;
          drawSprite();
        });

        const endYContainer = spriteCommandContainer.querySelector(".endY");
        const endYInput = endYContainer.querySelector("input");
        endYInput.value = command.endY;
        const endYSpan = endYContainer.querySelector(".value");
        endYSpan.innerText = command.endY;
        endYContainer.removeAttribute("hidden");
        endYContainer.addEventListener("input", () => {
          command.endY = Number(endYInput.value);
          endYSpan.innerText = command.endY;
          drawSprite();
        });
      }

      const includePoints = "points" in command;
      if (includePoints) {
        const numberOfPointsContainer =
          spriteCommandContainer.querySelector(".numberOfPoints");
        const numberOfPointsInput =
          numberOfPointsContainer.querySelector("input");
        numberOfPointsInput.value = command.points.length;
        const numberOfPointsSpan =
          numberOfPointsContainer.querySelector(".value");
        numberOfPointsSpan.innerText = command.points.length;
        numberOfPointsContainer.removeAttribute("hidden");
        numberOfPointsContainer.addEventListener("input", () => {
          const numberOfPoints = Number(numberOfPointsInput.value);
          // console.log({ numberOfPoints });
          for (let i = 0; i < numberOfPoints; i++) {
            let point = command.points[i];
            if (!point) {
              command.points[i] = { x: 0, y: 0 };
            }
          }
          command.points.length = numberOfPoints;
          pointContainers.forEach((pointContainer, index) => {
            // console.log("pointContainer", pointContainer);
            pointContainer.hidden = index >= command.points.length;
          });
          numberOfPointsSpan.innerText = command.points.length;
          drawSprite();
        });

        const pointContainers = [];
        for (let i = 0; i < numberOfPointsInput.max; i++) {
          const pointContainer = pointTemplate.content
            .cloneNode(true)
            .querySelector(".point");

          const point = command.points[i];
          pointContainer.hidden = !Boolean(point);

          const xContainer = pointContainer.querySelector(".x");
          xContainer.removeAttribute("hidden");
          const xInput = xContainer.querySelector("input");
          const xSpan = xContainer.querySelector(".value");
          if (point) {
            xInput.value = point.x;
            xSpan.innerText = point.x;
          }
          xContainer.addEventListener("input", () => {
            const point = command.points[i];
            point.x = Number(xInput.value);
            xSpan.innerText = point.x;
            drawSprite();
          });

          const yContainer = pointContainer.querySelector(".y");
          const yInput = yContainer.querySelector("input");
          const ySpan = yContainer.querySelector(".value");
          if (point) {
            yInput.value = point.y;
            ySpan.innerText = point.y;
          }
          yContainer.removeAttribute("hidden");
          yContainer.addEventListener("input", () => {
            const point = command.points[i];
            point.y = Number(yInput.value);
            ySpan.innerText = point.y;
            drawSprite();
          });

          spriteCommandContainer.appendChild(pointContainer);
          pointContainers[i] = pointContainer;
        }
      }

      const includeBitmap = "bitmap" in command;
      if (includeBitmap) {
        /** @type {HTMLCanvasElement} */
        const bitmapCanvas =
          spriteCommandContainer.querySelector(".bitmapCanvas");
        bitmapCanvas.removeAttribute("hidden");
        const bitmapContext = bitmapCanvas.getContext("2d");
        const pixelLength = 10;

        const updateBitmapCanvasSize = () => {
          const { width, height } = command.bitmap;
          bitmapCanvas.width = width * pixelLength + (width - 1);
          bitmapCanvas.height = height * pixelLength + (height - 1);

          bitmapCanvas.style.height = `${bitmapCanvas.height}px`;
          bitmapCanvas.style.width = `${bitmapCanvas.width}px`;
        };

        bitmapCanvas.addEventListener("mousedown", (event) => {
          const { offsetX, offsetY } = event;
          setBitmapPixel(offsetX, offsetY);
        });
        bitmapCanvas.addEventListener("mousemove", (event) => {
          if (!isMouseDown) {
            return;
          }
          const { offsetX, offsetY } = event;
          setBitmapPixel(offsetX, offsetY);
        });
        /**
         * @param {number} offsetX
         * @param {number} offsetY
         */
        const setBitmapPixel = (offsetX, offsetY) => {
          const canvasWidth = bitmapCanvas.width;
          const canvasHeight = bitmapCanvas.height;

          const { width, height, pixels } = command.bitmap;

          console.log({
            offsetX,
            offsetY,
            canvasWidth,
            canvasHeight,
          });
          let x = offsetX / canvasWidth;
          let y = offsetY / canvasHeight;
          if (x >= 1 || y >= 1) {
            return;
          }
          // console.log({ x, y });
          const pixelX = Math.floor(x * width);
          const pixelY = Math.floor(y * height);
          console.log({ pixelX, pixelY });

          const pixelIndex = width * pixelY + pixelX;
          console.log({ pixelIndex });

          pixels[pixelIndex] = selectedBitmapColorIndex;
          updateBitmapCanvasPixels();
        };

        const updateBitmapCanvasPixels = () => {
          bitmapContext.imageSmoothingEnabled = false;

          const { width, height, pixels } = command.bitmap;

          const canvasWidth = bitmapCanvas.width;
          const canvasHeight = bitmapCanvas.height;

          bitmapContext.clearRect(0, 0, canvasWidth, canvasHeight);
          bitmapContext.fillStyle = displayCanvasHelper.spriteBitmapColors[0];
          bitmapContext.fillRect(0, 0, canvasWidth, canvasHeight);

          pixels.forEach((pixel, pixelIndex) => {
            const pixelX = pixelIndex % width;
            const pixelY = Math.floor(pixelIndex / width);
            const x = pixelX * (pixelLength + 1);
            const y = pixelY * (pixelLength + 1);
            bitmapContext.fillStyle =
              displayCanvasHelper.spriteBitmapColors[pixel];
            bitmapContext.fillRect(x, y, pixelLength, pixelLength);
          });

          bitmapContext.lineWidth = 1;
          bitmapContext.fillStyle = "gray";
          for (let row = 1; row < height; row++) {
            const y = row * (pixelLength + 1) - 1;
            bitmapContext.fillRect(0, y, canvasWidth, 1);
          }
          for (let col = 1; col < width; col++) {
            const x = col * (pixelLength + 1) - 1;
            bitmapContext.fillRect(x, 0, 1, canvasHeight);
          }
          drawSprite();
        };

        updateBitmapCanvasSize();
        updateBitmapCanvasPixels();
        const updateBitmapPixels = () => {
          const { width, height } = command.bitmap;
          command.bitmap.pixels = new Array(width * height).fill(0);
          updateBitmapCanvasSize();
          updateBitmapCanvasPixels();
        };
        const bitmapWidthContainer =
          spriteCommandContainer.querySelector(".bitmapWidth");
        bitmapWidthContainer.removeAttribute("hidden");
        const bitmapWidthInput = bitmapWidthContainer.querySelector("input");
        bitmapWidthInput.value = command.bitmap.width;
        const bitmapWidthSpan = bitmapWidthContainer.querySelector(".value");
        bitmapWidthSpan.innerText = command.bitmap.width;
        bitmapWidthContainer.addEventListener("input", () => {
          command.bitmap.width = Number(bitmapWidthInput.value);
          updateBitmapPixels();
          bitmapWidthSpan.innerText = command.bitmap.width;
          drawSprite();
        });

        const bitmapHeightContainer =
          spriteCommandContainer.querySelector(".bitmapHeight");
        bitmapHeightContainer.removeAttribute("hidden");
        const bitmapHeightInput = bitmapHeightContainer.querySelector("input");
        bitmapHeightInput.value = command.bitmap.height;
        const bitmapHeightSpan = bitmapHeightContainer.querySelector(".value");
        bitmapHeightSpan.innerText = command.bitmap.height;
        bitmapHeightContainer.addEventListener("input", () => {
          command.bitmap.height = Number(bitmapHeightInput.value);
          updateBitmapPixels();
          bitmapHeightSpan.innerText = command.bitmap.height;
          drawSprite();
        });

        let selectedBitmapColorIndex = 1;
        const bitmapSelectedColorIndexContainer =
          spriteCommandContainer.querySelector(".bitmapSelectedColorIndex");
        bitmapSelectedColorIndexContainer.removeAttribute("hidden");
        const bitmapSelectedColorIndexInput =
          bitmapSelectedColorIndexContainer.querySelector(".input");
        const bitmapSelectedColorIndexColor =
          bitmapSelectedColorIndexContainer.querySelector(".color");
        bitmapSelectedColorIndexColor.dataset.bitmapColorIndex =
          selectedBitmapColorIndex;
        bitmapSelectedColorIndexColor.updateBitmapPixels = updateBitmapPixels;
        bitmapSelectedColorIndexInput.value = selectedBitmapColorIndex;
        const bitmapSelectedColorIndexSpan =
          bitmapSelectedColorIndexContainer.querySelector(".value");
        bitmapSelectedColorIndexSpan.innerText = selectedBitmapColorIndex;
        bitmapSelectedColorIndexContainer.addEventListener("input", () => {
          const newSelectedBitmapColorIndex = Number(
            bitmapSelectedColorIndexInput.value
          );
          setBitmapSelectedColorIndex(newSelectedBitmapColorIndex);
        });
        const setBitmapSelectedColorIndex = (newSelectedBitmapColorIndex) => {
          selectedBitmapColorIndex = newSelectedBitmapColorIndex;
          console.log({ selectedBitmapColorIndex });
          bitmapSelectedColorIndexInput.value = selectedBitmapColorIndex;
          bitmapSelectedColorIndexSpan.innerText = selectedBitmapColorIndex;
          bitmapSelectedColorIndexColor.value =
            displayCanvasHelper.spriteBitmapColors[selectedBitmapColorIndex];
          bitmapSelectedColorIndexColor.dataset.bitmapColorIndex =
            selectedBitmapColorIndex;
        };
        bitmapSelectedColorIndexColor.value =
          displayCanvasHelper.spriteBitmapColors[selectedBitmapColorIndex];

        const bitmapNumberOfColorsContainer =
          spriteCommandContainer.querySelector(".bitmapNumberOfColors");
        bitmapNumberOfColorsContainer.removeAttribute("hidden");
        const bitmapNumberOfColorsInput =
          bitmapNumberOfColorsContainer.querySelector("input");
        bitmapNumberOfColorsInput.value = command.bitmap.numberOfColors;
        const bitmapNumberOfColorsSpan =
          bitmapNumberOfColorsContainer.querySelector(".value");
        bitmapNumberOfColorsSpan.innerText = command.bitmap.numberOfColors;
        bitmapNumberOfColorsInput.addEventListener("input", () => {
          const bitmapNumberOfColors = Number(bitmapNumberOfColorsInput.value);
          console.log({ bitmapNumberOfColors });
          bitmapNumberOfColorsSpan.innerText = bitmapNumberOfColors;
          command.bitmap.numberOfColors = bitmapNumberOfColors;
          command.bitmap.pixels.forEach((pixel, index) => {
            command.bitmap.pixels[index] = Math.min(
              pixel,
              bitmapNumberOfColors - 1
            );
          });
          setBitmapSelectedColorIndex(
            Math.min(selectedBitmapColorIndex, bitmapNumberOfColors - 1)
          );
          bitmapSelectedColorIndexInput.max = command.bitmap.numberOfColors - 1;
          updateBitmapPixels();
          drawSprite();
        });
        bitmapSelectedColorIndexInput.max = command.bitmap.numberOfColors - 1;

        const clearBitmapButton =
          spriteCommandContainer.querySelector(".clearBitmap");
        clearBitmapButton.removeAttribute("hidden");
        clearBitmapButton.addEventListener("click", () => {
          command.bitmap.pixels.fill(0);
          updateBitmapCanvasPixels();
        });
      }

      const includeBitmapScale = "bitmapScale" in command;
      if (includeBitmapScale) {
        const bitmapScaleContainer =
          spriteCommandContainer.querySelector(".bitmapScale");
        const bitmapScaleInput = bitmapScaleContainer.querySelector("input");
        bitmapScaleInput.value = command.bitmapScale;
        const bitmapScaleSpan = bitmapScaleContainer.querySelector(".value");
        bitmapScaleSpan.innerText = command.bitmapScale;
        bitmapScaleContainer.removeAttribute("hidden");
        bitmapScaleContainer.addEventListener("input", () => {
          command.bitmapScale = Number(bitmapScaleInput.value);
          bitmapScaleSpan.innerText = command.bitmapScale;
          drawSprite();
        });
      }

      const includeBitmapScaleX = "bitmapScaleX" in command;
      if (includeBitmapScaleX) {
        const bitmapScaleXContainer =
          spriteCommandContainer.querySelector(".bitmapScaleX");
        const bitmapScaleXInput = bitmapScaleXContainer.querySelector("input");
        bitmapScaleXInput.value = command.bitmapScaleX;
        const bitmapScaleXSpan = bitmapScaleXContainer.querySelector(".value");
        bitmapScaleXSpan.innerText = command.bitmapScaleX;
        bitmapScaleXContainer.removeAttribute("hidden");
        bitmapScaleXContainer.addEventListener("input", () => {
          command.bitmapScaleX = Number(bitmapScaleXInput.value);
          bitmapScaleXSpan.innerText = command.bitmapScaleX;
          drawSprite();
        });
      }

      const includeBitmapScaleY = "bitmapScaleY" in command;
      if (includeBitmapScaleY) {
        const bitmapScaleYContainer =
          spriteCommandContainer.querySelector(".bitmapScaleY");
        const bitmapScaleYInput = bitmapScaleYContainer.querySelector("input");
        bitmapScaleYInput.value = command.bitmapScaleY;
        const bitmapScaleYSpan = bitmapScaleYContainer.querySelector(".value");
        bitmapScaleYSpan.innerText = command.bitmapScaleY;
        bitmapScaleYContainer.removeAttribute("hidden");
        bitmapScaleYContainer.addEventListener("input", () => {
          command.bitmapScaleY = Number(bitmapScaleYInput.value);
          bitmapScaleYSpan.innerText = command.bitmapScaleY;
          drawSprite();
        });
      }

      const includeRotation = "rotation" in command;
      if (includeRotation) {
        const rotationContainer =
          spriteCommandContainer.querySelector(".rotation");
        const rotationInput = rotationContainer.querySelector("input");
        rotationInput.value = command.rotation;
        const rotationSpan = rotationContainer.querySelector(".value");
        rotationSpan.innerText = command.rotation;
        rotationContainer.removeAttribute("hidden");
        rotationContainer.addEventListener("input", () => {
          command.rotation = Number(rotationInput.value);
          rotationSpan.innerText = command.rotation;
          drawSprite();
        });
      }

      const includeLineWidth = "lineWidth" in command;
      if (includeLineWidth) {
        const lineWidthContainer =
          spriteCommandContainer.querySelector(".lineWidth");
        const lineWidthInput = lineWidthContainer.querySelector("input");
        lineWidthInput.value = command.lineWidth;
        const lineWidthSpan = lineWidthContainer.querySelector(".value");
        lineWidthSpan.innerText = command.lineWidth;
        lineWidthContainer.removeAttribute("hidden");
        lineWidthContainer.addEventListener("input", () => {
          command.lineWidth = Number(lineWidthInput.value);
          lineWidthSpan.innerText = command.lineWidth;
          drawSprite();
        });
      }

      const includeFillColorIndex = "fillColorIndex" in command;
      if (includeFillColorIndex) {
        const fillColorIndexContainer =
          spriteCommandContainer.querySelector(".fillColorIndex");
        const fillColorIndexInput =
          fillColorIndexContainer.querySelector(".input");
        fillColorIndexInput.value = command.fillColorIndex;
        const fillColorIndexSpan =
          fillColorIndexContainer.querySelector(".value");
        fillColorIndexSpan.innerText = command.fillColorIndex;
        fillColorIndexContainer.removeAttribute("hidden");
        fillColorIndexInput.addEventListener("input", () => {
          command.fillColorIndex = Number(fillColorIndexInput.value);
          fillColorIndexSpan.innerText = command.fillColorIndex;
          updateFillColorIndexColor();
          drawSprite();
        });

        const fillColorIndexColor =
          fillColorIndexContainer.querySelector(".color");
        const updateFillColorIndexColor = () => {
          console.log(
            "fillColor",
            command.fillColorIndex,
            displayCanvasHelper.spriteColors[command.fillColorIndex],
            fillColorIndexColor
          );
          fillColorIndexColor.dataset.colorIndex = command.fillColorIndex;
          fillColorIndexColor.value =
            displayCanvasHelper.spriteColors[command.fillColorIndex];
        };
        updateFillColorIndexColor();
      }

      const includeLineColorIndex = "lineColorIndex" in command;
      if (includeLineColorIndex) {
        const lineColorIndexContainer =
          spriteCommandContainer.querySelector(".lineColorIndex");
        const lineColorIndexInput =
          lineColorIndexContainer.querySelector(".input");
        lineColorIndexInput.value = command.lineColorIndex;
        const lineColorIndexSpan =
          lineColorIndexContainer.querySelector(".value");
        lineColorIndexSpan.innerText = command.lineColorIndex;
        lineColorIndexContainer.removeAttribute("hidden");
        lineColorIndexInput.addEventListener("input", () => {
          command.lineColorIndex = Number(lineColorIndexInput.value);
          lineColorIndexSpan.innerText = command.lineColorIndex;
          updateFillColorIndexColor();
          drawSprite();
        });

        const lineColorIndexColor =
          lineColorIndexContainer.querySelector(".color");
        const updateFillColorIndexColor = () => {
          console.log(
            "lineColor",
            command.lineColorIndex,
            displayCanvasHelper.spriteColors[command.lineColorIndex],
            lineColorIndexColor
          );
          lineColorIndexColor.dataset.colorIndex = command.lineColorIndex;
          lineColorIndexColor.value =
            displayCanvasHelper.spriteColors[command.lineColorIndex];
        };
        updateFillColorIndexColor();
      }

      const includeBitmapColorIndex = "bitmapColorIndex" in command;
      if (includeBitmapColorIndex) {
        const bitmapColorIndexContainer =
          spriteCommandContainer.querySelector(".selectBitmapColor");
        bitmapColorIndexContainer.removeAttribute("hidden");

        const bitmapColorIndexInput = bitmapColorIndexContainer.querySelector(
          ".bitmapColorIndex .input"
        );
        bitmapColorIndexInput.value = command.bitmapColorIndex;
        const bitmapColorIndexSpan = bitmapColorIndexContainer.querySelector(
          ".bitmapColorIndex .value"
        );
        bitmapColorIndexSpan.innerText = command.bitmapColorIndex;
        bitmapColorIndexInput.addEventListener("input", () => {
          update();
        });

        const colorIndexInput =
          bitmapColorIndexContainer.querySelector(".colorIndex .input");
        colorIndexInput.value = command.colorIndex;
        const colorIndexSpan =
          bitmapColorIndexContainer.querySelector(".colorIndex .value");
        colorIndexSpan.innerText = command.colorIndex;
        colorIndexInput.addEventListener("input", () => {
          update();
        });

        const update = () => {
          command.bitmapColorIndex = Number(bitmapColorIndexInput.value);
          bitmapColorIndexSpan.innerText = command.bitmapColorIndex;

          command.colorIndex = Number(colorIndexInput.value);
          colorIndexSpan.innerText = command.colorIndex;

          updateBitmapColorIndexColor();
          drawSprite();
        };

        const bitmapColorIndexColor =
          bitmapColorIndexContainer.querySelector(".color");
        const updateBitmapColorIndexColor = () => {
          console.log(
            "bitmapColor",
            command.bitmapColorIndex,
            displayCanvasHelper.spriteColors[command.colorIndex],
            bitmapColorIndexColor
          );
          bitmapColorIndexColor.dataset.colorIndex = command.colorIndex;
          bitmapColorIndexColor.value =
            displayCanvasHelper.spriteColors[command.colorIndex];
        };
        updateBitmapColorIndexColor();
      }

      const includeBitmapColorPairs = "bitmapColorPairs" in command;
      if (includeBitmapColorPairs) {
        const numberOfBitmapColorPairsContainer =
          spriteCommandContainer.querySelector(".numberOfBitmapColorPairs");
        const numberOfBitmapColorPairsInput =
          numberOfBitmapColorPairsContainer.querySelector("input");
        numberOfBitmapColorPairsInput.value = command.bitmapColorPairs.length;
        const numberOfBitmapColorPairsSpan =
          numberOfBitmapColorPairsContainer.querySelector(".value");
        numberOfBitmapColorPairsSpan.innerText =
          command.bitmapColorPairs.length;
        numberOfBitmapColorPairsContainer.removeAttribute("hidden");
        numberOfBitmapColorPairsContainer.addEventListener("input", () => {
          const numberOfBitmapColorPairs = Number(
            numberOfBitmapColorPairsInput.value
          );
          // console.log({ numberOfBitmapColorPairs });
          for (let i = 0; i < numberOfBitmapColorPairs; i++) {
            let bitmapColorPair = command.bitmapColorPairs[i];
            if (!bitmapColorPair) {
              command.bitmapColorPairs[i] = {
                bitmapColorIndex: i,
                colorIndex: 0,
              };
            }
          }
          command.bitmapColorPairs.length = numberOfBitmapColorPairs;
          bitmapColorPairContainers.forEach(
            (bitmapColorPairContainer, index) => {
              // console.log("bitmapColorPairContainer", bitmapColorPairContainer);
              bitmapColorPairContainer.hidden =
                index >= command.bitmapColorPairs.length;
            }
          );
          numberOfBitmapColorPairsSpan.innerText =
            command.bitmapColorPairs.length;
          drawSprite();
        });

        const bitmapColorPairContainers = [];
        for (let i = 0; i < numberOfBitmapColorPairsInput.max; i++) {
          const bitmapColorPairContainer = bitmapColorPairTemplate.content
            .cloneNode(true)
            .querySelector(".bitmapColorPair");

          const bitmapColorPair = command.bitmapColorPairs[i];
          bitmapColorPairContainer.hidden = !Boolean(bitmapColorPair);

          const bitmapColorIndexContainer =
            bitmapColorPairContainer.querySelector(".bitmapColorIndex");
          bitmapColorIndexContainer.removeAttribute("hidden");
          const bitmapColorIndexInput =
            bitmapColorIndexContainer.querySelector("input");
          const bitmapColorIndexSpan =
            bitmapColorIndexContainer.querySelector(".value");
          if (bitmapColorPair) {
            bitmapColorIndexInput.value = bitmapColorPair.bitmapColorIndex;
            bitmapColorIndexSpan.innerText = bitmapColorPair.bitmapColorIndex;
          }
          bitmapColorIndexContainer.addEventListener("input", () => {
            update();
          });

          const colorIndexContainer =
            bitmapColorPairContainer.querySelector(".colorIndex");
          colorIndexContainer.removeAttribute("hidden");
          const colorIndexInput = colorIndexContainer.querySelector("input");
          const colorIndexSpan = colorIndexContainer.querySelector(".value");
          if (bitmapColorPair) {
            colorIndexInput.value = bitmapColorPair.colorIndex;
            colorIndexSpan.innerText = bitmapColorPair.colorIndex;
          }
          colorIndexContainer.addEventListener("input", () => {
            update();
          });

          const update = () => {
            const bitmapColorPair = command.bitmapColorPairs[i];
            if (!bitmapColorPair) {
              return;
            }

            bitmapColorPair.bitmapColorIndex = Number(
              bitmapColorIndexInput.value
            );
            bitmapColorIndexSpan.innerText = bitmapColorPair.bitmapColorIndex;

            bitmapColorPair.colorIndex = Number(colorIndexInput.value);
            colorIndexSpan.innerText = bitmapColorPair.colorIndex;

            updateBitmapColorIndexColor();
            drawSprite();
          };

          const bitmapColorIndexColor =
            bitmapColorPairContainer.querySelector(".color");
          const updateBitmapColorIndexColor = () => {
            const bitmapColorPair = command.bitmapColorPairs[i];
            if (!bitmapColorPair) {
              return;
            }
            bitmapColorIndexColor.dataset.colorIndex =
              bitmapColorPair.colorIndex;
            bitmapColorIndexColor.value =
              displayCanvasHelper.spriteColors[bitmapColorPair.colorIndex];
          };
          updateBitmapColorIndexColor();

          spriteCommandContainer.appendChild(bitmapColorPairContainer);
          bitmapColorPairContainers[i] = bitmapColorPairContainer;
        }
      }

      const includeCropTop = "cropTop" in command;
      if (includeCropTop) {
        const cropTopContainer =
          spriteCommandContainer.querySelector(".cropTop");
        const cropTopInput = cropTopContainer.querySelector("input");
        cropTopInput.value = command.cropTop;
        const cropTopSpan = cropTopContainer.querySelector(".value");
        cropTopSpan.innerText = command.cropTop;
        cropTopContainer.removeAttribute("hidden");
        cropTopContainer.addEventListener("input", () => {
          command.cropTop = Number(cropTopInput.value);
          cropTopSpan.innerText = command.cropTop;
          drawSprite();
        });
      }
      const includeCropRight = "cropRight" in command;
      if (includeCropRight) {
        const cropRightContainer =
          spriteCommandContainer.querySelector(".cropRight");
        const cropRightInput = cropRightContainer.querySelector("input");
        cropRightInput.value = command.cropRight;
        const cropRightSpan = cropRightContainer.querySelector(".value");
        cropRightSpan.innerText = command.cropRight;
        cropRightContainer.removeAttribute("hidden");
        cropRightContainer.addEventListener("input", () => {
          command.cropRight = Number(cropRightInput.value);
          cropRightSpan.innerText = command.cropRight;
          drawSprite();
        });
      }
      const includeCropBottom = "cropBottom" in command;
      if (includeCropBottom) {
        const cropBottomContainer =
          spriteCommandContainer.querySelector(".cropBottom");
        const cropBottomInput = cropBottomContainer.querySelector("input");
        cropBottomInput.value = command.cropBottom;
        const cropBottomSpan = cropBottomContainer.querySelector(".value");
        cropBottomSpan.innerText = command.cropBottom;
        cropBottomContainer.removeAttribute("hidden");
        cropBottomContainer.addEventListener("input", () => {
          command.cropBottom = Number(cropBottomInput.value);
          cropBottomSpan.innerText = command.cropBottom;
          drawSprite();
        });
      }
      const includeCropLeft = "cropLeft" in command;
      if (includeCropLeft) {
        const cropLeftContainer =
          spriteCommandContainer.querySelector(".cropLeft");
        const cropLeftInput = cropLeftContainer.querySelector("input");
        cropLeftInput.value = command.cropLeft;
        const cropLeftSpan = cropLeftContainer.querySelector(".value");
        cropLeftSpan.innerText = command.cropLeft;
        cropLeftContainer.removeAttribute("hidden");
        cropLeftContainer.addEventListener("input", () => {
          command.cropLeft = Number(cropLeftInput.value);
          cropLeftSpan.innerText = command.cropLeft;
          drawSprite();
        });
      }

      const includeRotationCropTop = "rotationCropTop" in command;
      if (includeRotationCropTop) {
        const rotationCropTopContainer =
          spriteCommandContainer.querySelector(".rotationCropTop");
        const rotationCropTopInput =
          rotationCropTopContainer.querySelector("input");
        rotationCropTopInput.value = command.rotationCropTop;
        const rotationCropTopSpan =
          rotationCropTopContainer.querySelector(".value");
        rotationCropTopSpan.innerText = command.rotationCropTop;
        rotationCropTopContainer.removeAttribute("hidden");
        rotationCropTopContainer.addEventListener("input", () => {
          command.rotationCropTop = Number(rotationCropTopInput.value);
          rotationCropTopSpan.innerText = command.rotationCropTop;
          drawSprite();
        });
      }
      const includeRotationCropRight = "rotationCropRight" in command;
      if (includeRotationCropRight) {
        const rotationCropRightContainer =
          spriteCommandContainer.querySelector(".rotationCropRight");
        const rotationCropRightInput =
          rotationCropRightContainer.querySelector("input");
        rotationCropRightInput.value = command.rotationCropRight;
        const rotationCropRightSpan =
          rotationCropRightContainer.querySelector(".value");
        rotationCropRightSpan.innerText = command.rotationCropRight;
        rotationCropRightContainer.removeAttribute("hidden");
        rotationCropRightContainer.addEventListener("input", () => {
          command.rotationCropRight = Number(rotationCropRightInput.value);
          rotationCropRightSpan.innerText = command.rotationCropRight;
          drawSprite();
        });
      }
      const includeRotationCropBottom = "rotationCropBottom" in command;
      if (includeRotationCropBottom) {
        const rotationCropBottomContainer =
          spriteCommandContainer.querySelector(".rotationCropBottom");
        const rotationCropBottomInput =
          rotationCropBottomContainer.querySelector("input");
        rotationCropBottomInput.value = command.rotationCropBottom;
        const rotationCropBottomSpan =
          rotationCropBottomContainer.querySelector(".value");
        rotationCropBottomSpan.innerText = command.rotationCropBottom;
        rotationCropBottomContainer.removeAttribute("hidden");
        rotationCropBottomContainer.addEventListener("input", () => {
          command.rotationCropBottom = Number(rotationCropBottomInput.value);
          rotationCropBottomSpan.innerText = command.rotationCropBottom;
          drawSprite();
        });
      }
      const includeRotationCropLeft = "rotationCropLeft" in command;
      if (includeRotationCropLeft) {
        const rotationCropLeftContainer =
          spriteCommandContainer.querySelector(".rotationCropLeft");
        const rotationCropLeftInput =
          rotationCropLeftContainer.querySelector("input");
        rotationCropLeftInput.value = command.rotationCropLeft;
        const rotationCropLeftSpan =
          rotationCropLeftContainer.querySelector(".value");
        rotationCropLeftSpan.innerText = command.rotationCropLeft;
        rotationCropLeftContainer.removeAttribute("hidden");
        rotationCropLeftContainer.addEventListener("input", () => {
          command.rotationCropLeft = Number(rotationCropLeftInput.value);
          rotationCropLeftSpan.innerText = command.rotationCropLeft;
          drawSprite();
        });
      }

      const includeSegmentStartRadius = "segmentStartRadius" in command;
      if (includeSegmentStartRadius) {
        const segmentStartRadiusContainer =
          spriteCommandContainer.querySelector(".segmentStartRadius");
        const segmentStartRadiusInput =
          segmentStartRadiusContainer.querySelector("input");
        segmentStartRadiusInput.value = command.segmentStartRadius;
        const segmentStartRadiusSpan =
          segmentStartRadiusContainer.querySelector(".value");
        segmentStartRadiusSpan.innerText = command.segmentStartRadius;
        segmentStartRadiusContainer.removeAttribute("hidden");
        segmentStartRadiusContainer.addEventListener("input", () => {
          command.segmentStartRadius = Number(segmentStartRadiusInput.value);
          segmentStartRadiusSpan.innerText = command.segmentStartRadius;
          drawSprite();
        });
      }

      const includeSegmentEndRadius = "segmentEndRadius" in command;
      if (includeSegmentEndRadius) {
        const segmentEndRadiusContainer =
          spriteCommandContainer.querySelector(".segmentEndRadius");
        const segmentEndRadiusInput =
          segmentEndRadiusContainer.querySelector("input");
        segmentEndRadiusInput.value = command.segmentEndRadius;
        const segmentEndRadiusSpan =
          segmentEndRadiusContainer.querySelector(".value");
        segmentEndRadiusSpan.innerText = command.segmentEndRadius;
        segmentEndRadiusContainer.removeAttribute("hidden");
        segmentEndRadiusContainer.addEventListener("input", () => {
          command.segmentEndRadius = Number(segmentEndRadiusInput.value);
          segmentEndRadiusSpan.innerText = command.segmentEndRadius;
          drawSprite();
        });
      }

      const includeSegmentRadius = "segmentRadius" in command;
      if (includeSegmentRadius) {
        const segmentRadiusContainer =
          spriteCommandContainer.querySelector(".segmentRadius");
        const segmentRadiusInput =
          segmentRadiusContainer.querySelector("input");
        segmentRadiusInput.value = command.segmentRadius;
        const segmentRadiusSpan =
          segmentRadiusContainer.querySelector(".value");
        segmentRadiusSpan.innerText = command.segmentRadius;
        segmentRadiusContainer.removeAttribute("hidden");
        segmentRadiusContainer.addEventListener("input", () => {
          command.segmentRadius = Number(segmentRadiusInput.value);
          segmentRadiusSpan.innerText = command.segmentRadius;
          drawSprite();
        });
      }

      const includeSegmentCap = "segmentCap" in command;
      if (includeSegmentCap) {
        const segmentCapContainer =
          spriteCommandContainer.querySelector(".segmentCap");
        segmentCapContainer.removeAttribute("hidden");
        const segmentCapSelect = segmentCapContainer.querySelector("select");
        const segmentCapOptgroup = segmentCapSelect.querySelector("optgroup");
        BS.DisplaySegmentCaps.forEach((segmentCap) => {
          segmentCapOptgroup.appendChild(new Option(segmentCap));
        });
        segmentCapSelect.value = command.segmentCap;
        segmentCapContainer.addEventListener("input", () => {
          command.segmentCap = segmentCapSelect.value;
          drawSprite();
        });
      }

      const includeSegmentEndCap = "segmentEndCap" in command;
      if (includeSegmentEndCap) {
        const segmentEndCapContainer =
          spriteCommandContainer.querySelector(".segmentEndCap");
        segmentEndCapContainer.removeAttribute("hidden");
        const segmentEndCapSelect =
          segmentEndCapContainer.querySelector("select");
        const segmentEndCapOptgroup =
          segmentEndCapSelect.querySelector("optgroup");
        BS.DisplaySegmentCaps.forEach((segmentCap) => {
          segmentEndCapOptgroup.appendChild(new Option(segmentCap));
        });
        segmentEndCapSelect.value = command.segmentEndCap;
        segmentEndCapContainer.addEventListener("input", () => {
          command.segmentEndCap = segmentEndCapSelect.value;
          drawSprite();
        });
      }

      const includeSegmentStartCap = "segmentStartCap" in command;
      if (includeSegmentStartCap) {
        const segmentStartCapContainer =
          spriteCommandContainer.querySelector(".segmentStartCap");
        segmentStartCapContainer.removeAttribute("hidden");
        const segmentStartCapSelect =
          segmentStartCapContainer.querySelector("select");
        const segmentStartCapOptgroup =
          segmentStartCapSelect.querySelector("optgroup");
        BS.DisplaySegmentCaps.forEach((segmentCap) => {
          segmentStartCapOptgroup.appendChild(new Option(segmentCap));
        });
        segmentStartCapSelect.value = command.segmentStartCap;
        segmentStartCapContainer.addEventListener("input", () => {
          command.segmentStartCap = segmentStartCapSelect.value;
          drawSprite();
        });
      }

      spriteCommandsContainer.appendChild(spriteCommandContainer);
    });
  }
};

const updateBitmapColorInputs = () => {
  document
    .querySelectorAll(".bitmapSelectedColorIndexColor")
    .forEach((bitmapSelectedColorIndexColor) => {
      bitmapSelectedColorIndexColor.value =
        displayCanvasHelper.spriteBitmapColors[
          bitmapSelectedColorIndexColor.dataset.bitmapColorIndex
        ];
      bitmapSelectedColorIndexColor.updateBitmapPixels?.();
    });

  document.querySelectorAll(".bitmapColor").forEach((bitmapColorIndexColor) => {
    bitmapColorIndexColor.value =
      displayCanvasHelper.spriteColors[
        bitmapColorIndexColor.dataset.colorIndex
      ];
  });
};
const updateFillColorInputs = () => {
  document.querySelectorAll(".fillColor").forEach((fillColorIndexColor) => {
    fillColorIndexColor.value =
      displayCanvasHelper.spriteColors[fillColorIndexColor.dataset.colorIndex];
  });
};
const updateLineColorInputs = () => {
  document.querySelectorAll(".lineColor").forEach((lineColorIndexColor) => {
    lineColorIndexColor.value =
      displayCanvasHelper.spriteColors[lineColorIndexColor.dataset.colorIndex];
  });
};

/** @type {HTMLSelectElement} */
const spriteCommandTypeSelect = document.getElementById("spriteCommandType");
const spriteCommandTypeOptgroup =
  spriteCommandTypeSelect.querySelector("optgroup");
BS.DisplaySpriteContextCommandTypes.forEach((command) => {
  spriteCommandTypeOptgroup.appendChild(new Option(command));
});
/** @type {BS.DisplaySpriteContextCommandType} */
let spriteCommandType = spriteCommandTypeSelect.value;
spriteCommandTypeSelect.addEventListener("input", () => {
  spriteCommandType = spriteCommandTypeSelect.value;
  console.log({ spriteCommandType });
});
// console.log({ spriteCommandType });

let isMouseDown = false;
window.addEventListener("mousedown", () => {
  isMouseDown = true;
});
window.addEventListener("mouseup", () => {
  isMouseDown = false;
});
