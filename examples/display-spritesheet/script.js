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
    updateBitmapColorInputs();
    updateFillColorInputs();
    updateLineColorInputs();
    draw();
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
  draw();
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
      selectedPalette?.opacities?.[colorIndex] ?? 1
    );
    displayCanvasHelper.selectSpriteColor(colorIndex, colorIndex);
  }

  for (
    let spriteColorIndex = 0;
    spriteColorIndex < displayCanvasHelper.numberOfColors;
    spriteColorIndex++
  ) {
    let colorIndex = spriteColorIndex;
    if (selectedPalette && spriteColorIndex >= selectedPalette.numberOfColors) {
      colorIndex = 0;
    }
    displayCanvasHelper.selectSpriteColor(spriteColorIndex, colorIndex);
  }

  displayCanvasHelper.flushContextCommands();
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
    width: 50,
    height: 50,
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

  spriteImageInput.disabled = !selectedSprite;

  updateSelectSpritePaletteSwapSelect();

  draw();
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
  draw();
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
  draw();
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
  draw();
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

  draw();
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
  selectedSprite?.paletteSwaps?.forEach((paletteSwap, index) => {
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
  draw();
};

// DRAW SPRITE
const drawSpriteButton = document.getElementById("drawSprite");
drawSpriteButton.addEventListener("click", () => {
  draw();
});
let shouldDrawAllSprites = false;
const setShouldDrawAllSprites = (newShouldDrawAllSprites) => {
  shouldDrawAllSprites = newShouldDrawAllSprites;
  console.log({ shouldDrawAllSprites });
  draw();
};
const toggleDrawAllSpritesCheckbox = document.getElementById(
  "toggleDrawAllSprites"
);
toggleDrawAllSpritesCheckbox.addEventListener("input", () => {
  setShouldDrawAllSprites(toggleDrawAllSpritesCheckbox.checked);
});

let drawWhenReady = false;
let lastDrawTime = 0;
let draw = async () => {
  if (!displayCanvasHelper.isReady) {
    drawWhenReady = true;
    return;
  }
  const now = Date.now();
  const timeSinceLastDraw = now - lastDrawTime;
  lastDrawTime = now;
  //console.log("draw", timeSinceLastDraw);

  const {
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
    verticalAlignment,
    horizontalAlignment,
    spritesLineHeight,
    spritesSpacing,
    spritesLineSpacing,
    spritesAlignment,
    spritesLineAlignment,
    spritesDirection,
    spritesLineDirection,
    backgroundColorIndex,
  } = drawSpriteParams;

  await displayCanvasHelper.selectBackgroundColor(backgroundColorIndex);
  await displayCanvasHelper.setFillBackground(backgroundColorIndex != 0);
  await displayCanvasHelper.setRotation(rotation);
  await displayCanvasHelper.setSpriteScaleX(scaleX);
  await displayCanvasHelper.setSpriteScaleY(scaleY);
  await displayCanvasHelper.setCropTop(cropTop);
  await displayCanvasHelper.setCropRight(cropRight);
  await displayCanvasHelper.setCropBottom(cropBottom);
  await displayCanvasHelper.setCropLeft(cropLeft);
  await displayCanvasHelper.setRotationCropTop(rotationCropTop);
  await displayCanvasHelper.setRotationCropRight(rotationCropRight);
  await displayCanvasHelper.setRotationCropBottom(rotationCropBottom);
  await displayCanvasHelper.setRotationCropLeft(rotationCropLeft);
  await displayCanvasHelper.setVerticalAlignment(verticalAlignment);
  await displayCanvasHelper.setHorizontalAlignment(horizontalAlignment);

  await displayCanvasHelper.setSpritesLineHeight(spritesLineHeight);

  await displayCanvasHelper.setSpritesSpacing(spritesSpacing);
  await displayCanvasHelper.setSpritesLineSpacing(spritesLineSpacing);

  await displayCanvasHelper.setSpritesDirection(spritesDirection);
  await displayCanvasHelper.setSpritesLineDirection(spritesLineDirection);

  await displayCanvasHelper.setSpritesAlignment(spritesAlignment);
  await displayCanvasHelper.setSpritesLineAlignment(spritesLineAlignment);

  if (shouldDrawAllSprites) {
    if (useUploadedSpriteSheet) {
      await drawSprites();
    } else {
      await drawSpritesManually();
    }
  } else {
    drawSprite();
  }
};
draw = BS.ThrottleUtils.throttle(draw, 100, true);

let xSpacing = 0;
let ySpacing = 0;
const drawSpritesManually = async () => {
  let x = 0;
  let y = 0;
  let maxHeight = 0;

  for (let i = 0; i < spriteSheet.sprites.length; i++) {
    const sprite = spriteSheet.sprites[i];
    if (x + sprite.width + xSpacing > displayCanvasHelper.width) {
      x = 0;
      y += maxHeight;
      y += ySpacing;
      maxHeight = 0;
    }

    const spriteWidth = Math.abs(
      sprite.width * displayCanvasHelper.contextState.spriteScaleX
    );
    const spriteHeight = Math.abs(
      sprite.height * displayCanvasHelper.contextState.spriteScaleY
    );

    const offsetX = x + spriteWidth / 2;
    const offsetY = y + spriteHeight;

    if (useUploadedSpriteSheet) {
      await displayCanvasHelper.drawSprite(offsetX, offsetY, sprite.name);
    } else {
      displayCanvasHelper.previewSprite(offsetX, offsetY, sprite, spriteSheet);
    }

    x += spriteWidth;
    x += xSpacing;
    maxHeight = Math.max(spriteHeight, maxHeight);
  }

  await displayCanvasHelper.show();
};

const drawSprites = async () => {
  const { x, y, drawSpritesMaxNumberOfSprites, numberOfSpritesPerLine } =
    drawSpriteParams;
  if (drawSpritesText.length > 0) {
    await displayCanvasHelper.drawSpritesString(x, y, drawSpritesText);
    await displayCanvasHelper.show();
  } else {
    let _drawSpritesText = "";
    spriteSheet.sprites.forEach((sprite, index) => {
      if (
        drawSpritesMaxNumberOfSprites > 0 &&
        index >= drawSpritesMaxNumberOfSprites
      ) {
        return;
      }
      if (index % numberOfSpritesPerLine == 0) {
        _drawSpritesText += "\n";
      }
      _drawSpritesText += sprite.name;
    });
    console.log("spriteLines", _drawSpritesText);
    await displayCanvasHelper.drawSpritesString(x, y, _drawSpritesText, false);
    await displayCanvasHelper.show();
  }
};
const drawSprite = async () => {
  const { x, y } = drawSpriteParams;

  if (selectedSprite) {
    if (useUploadedSpriteSheet) {
      await displayCanvasHelper.drawSprite(x, y, selectedSprite.name);
    } else {
      displayCanvasHelper.previewSprite(x, y, selectedSprite, spriteSheet);
    }
    await displayCanvasHelper.show();
  } else {
    await displayCanvasHelper.clear();
  }
};
displayCanvasHelper.addEventListener("ready", () => {
  if (drawWhenReady) {
    drawWhenReady = false;
    draw();
  }
});

const drawSpriteParams = {
  x: 50,
  y: 50,

  rotation: 0,

  backgroundColorIndex: 0,

  verticalAlignment: "center",
  horizontalAlignment: "center",

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

  spritesLineHeight: 0,

  spritesSpacing: 0,
  spritesLineSpacing: 0,

  spritesAlignment: "end",
  spritesLineAlignment: "start",

  spritesDirection: "right",
  spritesLineDirection: "down",

  numberOfSpritesPerLine: 10,
  drawSpritesMaxNumberOfSprites: 50,
};

const drawSpriteXContainer = document.getElementById("drawSpriteX");
const drawSpriteXInput = drawSpriteXContainer.querySelector("input");
const drawSpriteXSpan = drawSpriteXContainer.querySelector(".value");
const setSpriteDrawX = (drawSpriteX) => {
  drawSpriteXInput.value = drawSpriteX;
  drawSpriteXSpan.innerText = drawSpriteX;
  drawSpriteParams.x = drawSpriteX;
  draw();
};
setSpriteDrawX(Number(drawSpriteXInput.value));
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
  draw();
};
drawSpriteYInput.addEventListener("input", () => {
  setSpriteDrawY(Number(drawSpriteYInput.value));
});
setSpriteDrawY(Number(drawSpriteYInput.value));

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
  draw();
};
drawSpriteRotationInput.addEventListener("input", () => {
  setSpriteDrawRotation(Number(drawSpriteRotationInput.value));
});

const drawSpriteHorizontalAlignmentContainer = document.getElementById(
  "drawSpriteHorizontalAlignment"
);
const drawSpriteHorizontalAlignmentSelect =
  drawSpriteHorizontalAlignmentContainer.querySelector("select");
const drawSpriteHorizontalAlignmentOptgroup =
  drawSpriteHorizontalAlignmentContainer.querySelector("optgroup");
BS.DisplayAlignments.forEach((horizontalAlignment) => {
  drawSpriteHorizontalAlignmentOptgroup.appendChild(
    new Option(horizontalAlignment)
  );
});
drawSpriteHorizontalAlignmentSelect.value =
  drawSpriteParams.horizontalAlignment;
const setSpriteDrawHorizontalAlignment = (drawSpriteHorizontalAlignment) => {
  console.log({ drawSpriteHorizontalAlignment });
  drawSpriteHorizontalAlignmentSelect.value = drawSpriteHorizontalAlignment;
  drawSpriteParams.horizontalAlignment = drawSpriteHorizontalAlignment;
  draw();
};
drawSpriteHorizontalAlignmentSelect.addEventListener("input", () => {
  setSpriteDrawHorizontalAlignment(drawSpriteHorizontalAlignmentSelect.value);
});

const drawSpriteVerticalAlignmentContainer = document.getElementById(
  "drawSpriteVerticalAlignment"
);
const drawSpriteVerticalAlignmentSelect =
  drawSpriteVerticalAlignmentContainer.querySelector("select");
const drawSpriteVerticalAlignmentOptgroup =
  drawSpriteVerticalAlignmentContainer.querySelector("optgroup");
BS.DisplayAlignments.forEach((verticalAlignment) => {
  drawSpriteVerticalAlignmentOptgroup.appendChild(
    new Option(verticalAlignment)
  );
});
drawSpriteVerticalAlignmentSelect.value = drawSpriteParams.verticalAlignment;
const setSpriteDrawVerticalAlignment = (drawSpriteVerticalAlignment) => {
  console.log({ drawSpriteVerticalAlignment });
  drawSpriteVerticalAlignmentSelect.value = drawSpriteVerticalAlignment;
  drawSpriteParams.verticalAlignment = drawSpriteVerticalAlignment;
  draw();
};
drawSpriteVerticalAlignmentSelect.addEventListener("input", () => {
  setSpriteDrawVerticalAlignment(drawSpriteVerticalAlignmentSelect.value);
});

const drawSpriteScaleXContainer = document.getElementById("drawSpriteScaleX");
const drawSpriteScaleXInput = drawSpriteScaleXContainer.querySelector("input");
const drawSpriteScaleXSpan = drawSpriteScaleXContainer.querySelector(".value");
const setSpriteDrawScaleX = (drawSpriteScaleX) => {
  drawSpriteScaleXInput.value = drawSpriteScaleX;
  drawSpriteScaleXSpan.innerText = drawSpriteScaleX;
  drawSpriteParams.scaleX = drawSpriteScaleX;
  draw();
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
  draw();
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

  drawSpriteScaleXInput.value = drawSpriteScale;
  drawSpriteScaleXSpan.innerText = drawSpriteScale;

  drawSpriteScaleYInput.value = drawSpriteScale;
  drawSpriteScaleYSpan.innerText = drawSpriteScale;

  drawSpriteParams.scaleX = drawSpriteScale;
  drawSpriteParams.scaleY = drawSpriteScale;
  draw();
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
  draw();
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
  draw();
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
  draw();
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
  draw();
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
  draw();
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
  draw();
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
  draw();
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
  draw();
};
drawSpriteRotationCropLeftInput.addEventListener("input", () => {
  setSpriteDrawRotationCropLeft(Number(drawSpriteRotationCropLeftInput.value));
});

const drawSpriteBackgroundColorContainer = document.getElementById(
  "drawSpriteBackgroundColor"
);
const drawSpriteBackgroundColorInput =
  drawSpriteBackgroundColorContainer.querySelector("input");
const drawSpriteBackgroundColorSpan =
  drawSpriteBackgroundColorContainer.querySelector(".value");
const setSpriteDrawBackgroundColor = (drawSpriteBackgroundColor) => {
  drawSpriteBackgroundColorInput.value = drawSpriteBackgroundColor;
  drawSpriteBackgroundColorSpan.innerText = drawSpriteBackgroundColor;
  drawSpriteParams.backgroundColorIndex = drawSpriteBackgroundColor;
  draw();
};
drawSpriteBackgroundColorInput.addEventListener("input", () => {
  setSpriteDrawBackgroundColor(Number(drawSpriteBackgroundColorInput.value));
});

const drawSpritesLineHeightContainer = document.getElementById(
  "drawSpritesLineHeight"
);
const drawSpritesLineHeightInput =
  drawSpritesLineHeightContainer.querySelector("input");
const drawSpritesLineHeightSpan =
  drawSpritesLineHeightContainer.querySelector(".value");
const setSpritesLineHeight = (drawSpritesLineHeight) => {
  drawSpritesLineHeightInput.value = drawSpritesLineHeight;
  drawSpritesLineHeightSpan.innerText = drawSpritesLineHeight;
  drawSpriteParams.spritesLineHeight = drawSpritesLineHeight;
  console.log({ drawSpritesLineHeight });
  if (shouldDrawAllSprites) {
    draw();
  }
};
drawSpritesLineHeightInput.addEventListener("input", () => {
  setSpritesLineHeight(Number(drawSpritesLineHeightInput.value));
});

const drawSpritesDirectionContainer = document.getElementById(
  "drawSpritesDirection"
);
const drawSpritesDirectionSelect =
  drawSpritesDirectionContainer.querySelector("select");
const drawSpritesDirectionOptgroup =
  drawSpritesDirectionContainer.querySelector("optgroup");
BS.DisplayDirections.forEach((horizontalAlignment) => {
  drawSpritesDirectionOptgroup.appendChild(new Option(horizontalAlignment));
});
drawSpritesDirectionSelect.value = drawSpriteParams.spritesDirection;
const setSpritesDirection = (drawSpritesDirection) => {
  console.log({ drawSpritesDirection });
  drawSpritesDirectionSelect.value = drawSpritesDirection;
  drawSpriteParams.spritesDirection = drawSpritesDirection;
  if (shouldDrawAllSprites) {
    draw();
  }
};
drawSpritesDirectionSelect.addEventListener("input", () => {
  setSpritesDirection(drawSpritesDirectionSelect.value);
});

const drawSpritesLineDirectionContainer = document.getElementById(
  "drawSpritesLineDirection"
);
const drawSpritesLineDirectionSelect =
  drawSpritesLineDirectionContainer.querySelector("select");
const drawSpritesLineDirectionOptgroup =
  drawSpritesLineDirectionContainer.querySelector("optgroup");
BS.DisplayDirections.forEach((horizontalAlignment) => {
  drawSpritesLineDirectionOptgroup.appendChild(new Option(horizontalAlignment));
});
drawSpritesLineDirectionSelect.value = drawSpriteParams.spritesLineDirection;
const setSpritesLineDirection = (drawSpritesLineDirection) => {
  console.log({ drawSpritesLineDirection });
  drawSpritesLineDirectionSelect.value = drawSpritesLineDirection;
  drawSpriteParams.spritesLineDirection = drawSpritesLineDirection;
  if (shouldDrawAllSprites) {
    draw();
  }
};
drawSpritesLineDirectionSelect.addEventListener("input", () => {
  setSpritesLineDirection(drawSpritesLineDirectionSelect.value);
});

const drawSpritesAlignmentContainer = document.getElementById(
  "drawSpritesAlignment"
);
const drawSpritesAlignmentSelect =
  drawSpritesAlignmentContainer.querySelector("select");
const drawSpritesAlignmentOptgroup =
  drawSpritesAlignmentContainer.querySelector("optgroup");
BS.DisplayAlignments.forEach((horizontalAlignment) => {
  drawSpritesAlignmentOptgroup.appendChild(new Option(horizontalAlignment));
});
drawSpritesAlignmentSelect.value = drawSpriteParams.spritesAlignment;
const setSpritesAlignment = (drawSpritesAlignment) => {
  console.log({ drawSpritesAlignment });
  drawSpritesAlignmentSelect.value = drawSpritesAlignment;
  drawSpriteParams.spritesAlignment = drawSpritesAlignment;
  if (shouldDrawAllSprites) {
    draw();
  }
};
drawSpritesAlignmentSelect.addEventListener("input", () => {
  setSpritesAlignment(drawSpritesAlignmentSelect.value);
});

const drawSpritesLineAlignmentContainer = document.getElementById(
  "drawSpritesLineAlignment"
);
const drawSpritesLineAlignmentSelect =
  drawSpritesLineAlignmentContainer.querySelector("select");
const drawSpritesLineAlignmentOptgroup =
  drawSpritesLineAlignmentContainer.querySelector("optgroup");
BS.DisplayAlignments.forEach((horizontalAlignment) => {
  drawSpritesLineAlignmentOptgroup.appendChild(new Option(horizontalAlignment));
});
drawSpritesLineAlignmentSelect.value = drawSpriteParams.spritesLineAlignment;
const setSpritesLineAlignment = (drawSpritesLineAlignment) => {
  console.log({ drawSpritesLineAlignment });
  drawSpritesLineAlignmentSelect.value = drawSpritesLineAlignment;
  drawSpriteParams.spritesLineAlignment = drawSpritesLineAlignment;
  if (shouldDrawAllSprites) {
    draw();
  }
};
drawSpritesLineAlignmentSelect.addEventListener("input", () => {
  setSpritesLineAlignment(drawSpritesLineAlignmentSelect.value);
});

const drawSpritesSpacingContainer =
  document.getElementById("drawSpritesSpacing");
const drawSpritesSpacingInput =
  drawSpritesSpacingContainer.querySelector("input");
const drawSpritesSpacingSpan =
  drawSpritesSpacingContainer.querySelector(".value");
const setSpritesSpacing = (drawSpritesSpacing) => {
  drawSpritesSpacingInput.value = drawSpritesSpacing;
  drawSpritesSpacingSpan.innerText = drawSpritesSpacing;
  drawSpriteParams.spritesSpacing = drawSpritesSpacing;
  console.log({ drawSpritesSpacing });
  if (shouldDrawAllSprites) {
    draw();
  }
};
drawSpritesSpacingInput.addEventListener("input", () => {
  setSpritesSpacing(Number(drawSpritesSpacingInput.value));
});

const drawSpritesLineSpacingContainer = document.getElementById(
  "drawSpritesLineSpacing"
);
const drawSpritesLineSpacingInput =
  drawSpritesLineSpacingContainer.querySelector("input");
const drawSpritesLineSpacingSpan =
  drawSpritesLineSpacingContainer.querySelector(".value");
const setSpritesLineSpacing = (drawSpritesLineSpacing) => {
  drawSpritesLineSpacingInput.value = drawSpritesLineSpacing;
  drawSpritesLineSpacingSpan.innerText = drawSpritesLineSpacing;
  drawSpriteParams.spritesLineSpacing = drawSpritesLineSpacing;
  console.log({ drawSpritesLineSpacing });
  if (shouldDrawAllSprites) {
    draw();
  }
};
drawSpritesLineSpacingInput.addEventListener("input", () => {
  setSpritesLineSpacing(Number(drawSpritesLineSpacingInput.value));
});

const drawSpritesNumberOfSpritesPerLineContainer = document.getElementById(
  "drawSpritesNumberOfSpritesPerLine"
);
const drawSpritesNumberOfSpritesPerLineInput =
  drawSpritesNumberOfSpritesPerLineContainer.querySelector("input");
const drawSpritesNumberOfSpritesPerLineSpan =
  drawSpritesNumberOfSpritesPerLineContainer.querySelector(".value");
const setSpritesNumberOfSpritesPerLine = (
  drawSpritesNumberOfSpritesPerLine
) => {
  drawSpritesNumberOfSpritesPerLineInput.value =
    drawSpritesNumberOfSpritesPerLine;
  drawSpritesNumberOfSpritesPerLineSpan.innerText =
    drawSpritesNumberOfSpritesPerLine;
  drawSpriteParams.numberOfSpritesPerLine = drawSpritesNumberOfSpritesPerLine;
  console.log({ drawSpritesNumberOfSpritesPerLine });
  if (shouldDrawAllSprites) {
    draw();
  }
};
drawSpritesNumberOfSpritesPerLineInput.addEventListener("input", () => {
  setSpritesNumberOfSpritesPerLine(
    Number(drawSpritesNumberOfSpritesPerLineInput.value)
  );
});

const drawSpritesMaxNumberOfSpritesContainer = document.getElementById(
  "drawSpritesMaxNumberOfSprites"
);
const drawSpritesMaxNumberOfSpritesInput =
  drawSpritesMaxNumberOfSpritesContainer.querySelector("input");
const drawSpritesMaxNumberOfSpritesSpan =
  drawSpritesMaxNumberOfSpritesContainer.querySelector(".value");
const setSpritesMaxNumberOfSprites = (drawSpritesMaxNumberOfSprites) => {
  drawSpritesMaxNumberOfSpritesInput.value = drawSpritesMaxNumberOfSprites;
  drawSpritesMaxNumberOfSpritesSpan.innerText = drawSpritesMaxNumberOfSprites;
  drawSpriteParams.drawSpritesMaxNumberOfSprites =
    drawSpritesMaxNumberOfSprites;
  console.log({ drawSpritesMaxNumberOfSprites });
  if (shouldDrawAllSprites) {
    draw();
  }
};
drawSpritesMaxNumberOfSpritesInput.addEventListener("input", () => {
  setSpritesMaxNumberOfSprites(
    Number(drawSpritesMaxNumberOfSpritesInput.value)
  );
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
          offsetX: 0,
          offsetY: 0,
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
          offsetX: 0,
          offsetY: 0,
          radius: 25,
        });
        break;
      case "drawEllipse":
        selectedSprite.commands.push({
          type: "drawEllipse",
          offsetX: 0,
          offsetY: 0,
          radiusX: 50,
          radiusY: 25,
        });
        break;
      case "drawRoundRect":
        selectedSprite.commands.push({
          type: "drawRoundRect",
          offsetX: 0,
          offsetY: 0,
          borderRadius: 5,
          width: 50,
          height: 25,
        });
        break;
      case "drawArc":
        selectedSprite.commands.push({
          type: "drawArc",
          offsetX: 0,
          offsetY: 0,
          radius: 25,
          startAngle: 0,
          angleOffset: 90,
        });
        break;
      case "drawArcEllipse":
        selectedSprite.commands.push({
          type: "drawArcEllipse",
          offsetX: 0,
          offsetY: 0,
          radiusX: 50,
          radiusY: 25,
          startAngle: 0,
          angleOffset: 90,
        });
        break;
      case "drawPolygon":
        selectedSprite.commands.push({
          type: "drawPolygon",
          offsetX: 0,
          offsetY: 0,
          points: [
            { x: 0, y: 0 },
            { x: 0, y: 25 },
            { x: 25, y: 25 },
            { x: 25, y: 0 },
          ],
        });
        break;
      case "drawRegularPolygon":
        selectedSprite.commands.push({
          type: "drawRegularPolygon",
          offsetX: 0,
          offsetY: 0,
          radius: 25,
          numberOfSides: 5,
        });
        break;
      case "drawWireframe":
        selectedSprite.commands.push({
          type: "drawWireframe",
          wireframe: {
            points: [
              { x: 0, y: 0 },
              { x: 0, y: -25 },
              { x: 25, y: 25 },
              { x: -25, y: 25 },
            ],
            edges: [
              { startIndex: 0, endIndex: 1 },
              { startIndex: 0, endIndex: 2 },
              { startIndex: 0, endIndex: 3 },
            ],
          },
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
          offsetX: 0,
          offsetY: 0,
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
      case "resetSpriteScale":
      case "resetSpriteColors":
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
      case "selectBackgroundColor":
        selectedSprite.commands.push({
          type: "selectBackgroundColor",
          backgroundColorIndex: 0,
        });
        break;
      case "setFillBackground":
        selectedSprite.commands.push({
          type: "setFillBackground",
          fillBackground: false,
        });
        break;
      case "setIgnoreFill":
        selectedSprite.commands.push({
          type: "setIgnoreFill",
          ignoreFill: false,
        });
        break;
      case "setIgnoreLine":
        selectedSprite.commands.push({
          type: "setIgnoreLine",
          ignoreLine: false,
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
          cropRight: 0,
        });
        break;
      case "setCropBottom":
        selectedSprite.commands.push({
          type: "setCropBottom",
          cropBottom: 0,
        });
        break;
      case "setCropLeft":
        selectedSprite.commands.push({
          type: "setCropLeft",
          cropLeft: 0,
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
          rotationCropRight: 0,
        });
        break;
      case "setRotationCropBottom":
        selectedSprite.commands.push({
          type: "setRotationCropBottom",
          rotationCropBottom: 0,
        });
        break;
      case "setRotationCropLeft":
        selectedSprite.commands.push({
          type: "setRotationCropLeft",
          rotationCropLeft: 0,
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

      case "setHorizontalAlignment":
        selectedSprite.commands.push({
          type: "setHorizontalAlignment",
          horizontalAlignment: "center",
        });
        break;
      case "setVerticalAlignment":
        selectedSprite.commands.push({
          type: "setVerticalAlignment",
          verticalAlignment: "center",
        });
        break;

      case "drawSprite":
        const sprite = spriteSheet.sprites.find(
          (sprite) => sprite != selectedSprite
        );
        if (sprite) {
          selectedSprite.commands.push({
            type: "drawSprite",
            spriteIndex: spriteSheet.sprites.indexOf(sprite),
            offsetX: 0,
            offsetY: 0,
          });
        }
        break;

      case "setSpriteScale":
        selectedSprite.commands.push({
          type: "setSpriteScale",
          spriteScale: 1,
        });
        break;
      case "setSpriteScaleX":
        selectedSprite.commands.push({
          type: "setSpriteScaleX",
          spriteScaleX: 1,
        });
        break;
      case "setSpriteScaleY":
        selectedSprite.commands.push({
          type: "setSpriteScaleY",
          spriteScaleY: 1,
        });
        break;
      case "selectSpriteColor":
        selectedSprite.commands.push({
          type: "selectSpriteColor",
          spriteColorIndex: 1,
          colorIndex: 1,
        });
        break;
      case "selectSpriteColors":
        selectedSprite.commands.push({
          type: "selectSpriteColors",
          spriteColorPairs: [{ colorIndex: 1, spriteColorIndex: 1 }],
        });
        break;
      case "drawCubicBezierCurve":
        selectedSprite.commands.push({
          type: "drawCubicBezierCurve",
          controlPoints: [
            { x: -50, y: 0 },
            { x: -25, y: 50 },
            { x: 25, y: -50 },
            { x: 50, y: 0 },
          ],
        });
        break;
      case "drawQuadraticBezierCurve":
        selectedSprite.commands.push({
          type: "drawQuadraticBezierCurve",
          controlPoints: [
            { x: -50, y: 0 },
            { x: 0, y: 50 },
            { x: 50, y: 0 },
          ],
        });
        break;
      case "drawPath":
        selectedSprite.commands.push({
          type: "drawPath",
          curves: [],
        });
        break;
      case "drawClosedPath":
        selectedSprite.commands.push({
          type: "drawClosedPath",
          curves: [],
        });
        break;
      default:
        console.error(`uncaught spriteCommandType ${spriteCommandType}`);
        break;
    }
  }
  updateSpriteCommands();
  draw();
};
const spriteCommandsContainer = document.getElementById("spriteCommands");
/** @type {HTMLTemplateElement} */
const spriteCommandTemplate = document.getElementById("spriteCommandTemplate");
/** @type {HTMLTemplateElement} */
const pointTemplate = document.getElementById("pointTemplate");
/** @type {HTMLTemplateElement} */
const edgeTemplate = document.getElementById("edgeTemplate");
/** @type {HTMLTemplateElement} */
const curveTemplate = document.getElementById("curveTemplate");
/** @type {HTMLTemplateElement} */
const bitmapColorPairTemplate = document.getElementById(
  "bitmapColorPairTemplate"
);
/** @type {HTMLTemplateElement} */
const spriteColorPairTemplate = document.getElementById(
  "spriteColorPairTemplate"
);
const updateSpriteCommands = () => {
  spriteCommandsContainer.innerHTML = "";
  if (selectedSprite) {
    selectedSprite?.commands.forEach((command, index) => {
      /** @type {HTMLElement} */
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
          draw();
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
          draw();
          updateSpriteCommands();
        });
      }
      const removeButton = spriteCommandContainer.querySelector(".remove");
      removeButton.addEventListener("click", () => {
        selectedSprite?.commands.splice(index, 1);
        draw();
        updateSpriteCommands();
      });

      const toggleButton = spriteCommandContainer.querySelector(".toggle");
      toggleButton.innerText = command.hide ? "show" : "hide";
      toggleButton.addEventListener("click", () => {
        const command = selectedSprite?.commands[index];
        command.hide = !command.hide;
        toggleButton.innerText = command.hide ? "show" : "hide";
        draw();
      });

      const includeCenterPosition = "offsetX" in command;
      // console.log("includeCenterPosition", includeCenterPosition, command);
      if (includeCenterPosition) {
        const offsetXContainer =
          spriteCommandContainer.querySelector(".offsetX");
        offsetXContainer.removeAttribute("hidden");
        const offsetXInput = offsetXContainer.querySelector("input");
        offsetXInput.value = command.offsetX;
        const offsetXSpan = offsetXContainer.querySelector(".value");
        offsetXSpan.innerText = command.offsetX;
        offsetXContainer.addEventListener("input", () => {
          command.offsetX = Number(offsetXInput.value);
          offsetXSpan.innerText = command.offsetX;
          draw();
        });

        const offsetYContainer =
          spriteCommandContainer.querySelector(".offsetY");
        const offsetYInput = offsetYContainer.querySelector("input");
        offsetYInput.value = command.offsetY;
        const offsetYSpan = offsetYContainer.querySelector(".value");
        offsetYSpan.innerText = command.offsetY;
        offsetYContainer.removeAttribute("hidden");
        offsetYContainer.addEventListener("input", () => {
          command.offsetY = Number(offsetYInput.value);
          offsetYSpan.innerText = command.offsetY;
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
        });
      }

      // FIX - include command.wireframe.points
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
          draw();
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
            draw();
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
            draw();
          });

          spriteCommandContainer.appendChild(pointContainer);
          pointContainers[i] = pointContainer;
        }
      }

      const includeEdges =
        "wireframe" in command && "edges" in command.wireframe;
      if (includeEdges) {
        const numberOfEdgesContainer =
          spriteCommandContainer.querySelector(".numberOfEdges");
        const numberOfEdgesInput =
          numberOfEdgesContainer.querySelector("input");
        numberOfEdgesInput.value = command.wireframe.edges.length;
        const numberOfEdgesSpan =
          numberOfEdgesContainer.querySelector(".value");
        numberOfEdgesSpan.innerText = command.wireframe.edges.length;
        numberOfEdgesContainer.removeAttribute("hidden");
        numberOfEdgesContainer.addEventListener("input", () => {
          const numberOfEdges = Number(numberOfEdgesInput.value);
          // console.log({ numberOfEdges });
          for (let i = 0; i < numberOfEdges; i++) {
            let edge = command.wireframe.edges[i];
            if (!edge) {
              command.wireframe.edges[i] = { startIndex: 0, endIndex: 1 };
            }
          }
          command.wireframe.edges.length = numberOfEdges;
          edgeContainers.forEach((edgeContainer, index) => {
            // console.log("edgeContainer", edgeContainer);
            edgeContainer.hidden = index >= command.wireframe.edges.length;
          });
          numberOfEdgesSpan.innerText = command.wireframe.edges.length;
          draw();
        });

        const edgeContainers = [];
        for (let i = 0; i < numberOfEdgesInput.max; i++) {
          const edgeContainer = edgeTemplate.content
            .cloneNode(true)
            .querySelector(".edge");

          const edge = command.wireframe.edges[i];
          edgeContainer.hidden = !Boolean(edge);

          const startIndexContainer =
            edgeContainer.querySelector(".startIndex");
          startIndexContainer.removeAttribute("hidden");
          const startIndexInput = startIndexContainer.querySelector("input");
          startIndexInput.max = command.points.length - 1;
          const startIndexSpan = startIndexContainer.querySelector(".value");
          if (edge) {
            startIndexInput.value = edge.startIndex;
            startIndexSpan.innerText = edge.startIndex;
          }
          startIndexContainer.addEventListener("input", () => {
            const edge = command.wireframe.edges[i];
            edge.startIndex = Number(startIndexInput.value);
            startIndexSpan.innerText = edge.startIndex;
            draw();
          });

          const endIndexContainer = edgeContainer.querySelector(".endIndex");
          const endIndexInput = endIndexContainer.querySelector("input");
          endIndexInput.max = command.points.length - 1;
          const endIndexSpan = endIndexContainer.querySelector(".value");
          if (edge) {
            endIndexInput.value = edge.endIndex;
            endIndexSpan.innerText = edge.endIndex;
          }
          endIndexContainer.removeAttribute("hidden");
          endIndexContainer.addEventListener("input", () => {
            const edge = command.wireframe.edges[i];
            edge.endIndex = Number(endIndexInput.value);
            endIndexSpan.innerText = edge.endIndex;
            draw();
          });

          spriteCommandContainer.appendChild(edgeContainer);
          edgeContainers[i] = edgeContainer;
        }
      }

      const includeControlPoints = "controlPoints" in command;
      if (includeControlPoints) {
        //console.log(command.controlPoints);
        command.controlPoints.forEach((controlPoint, index) => {
          const pointContainer = pointTemplate.content
            .cloneNode(true)
            .querySelector(".point");
          pointContainer.hidden = false;

          const xContainer = pointContainer.querySelector(".x");
          xContainer.removeAttribute("hidden");
          const xInput = xContainer.querySelector("input");
          const xSpan = xContainer.querySelector(".value");
          xInput.value = controlPoint.x;
          xSpan.innerText = controlPoint.x;
          xContainer.addEventListener("input", () => {
            controlPoint.x = Number(xInput.value);
            xSpan.innerText = controlPoint.x;
            draw();
          });

          const yContainer = pointContainer.querySelector(".y");
          const yInput = yContainer.querySelector("input");
          const ySpan = yContainer.querySelector(".value");
          yInput.value = controlPoint.y;
          ySpan.innerText = controlPoint.y;
          yContainer.removeAttribute("hidden");
          yContainer.addEventListener("input", () => {
            controlPoint.y = Number(yInput.value);
            ySpan.innerText = controlPoint.y;
            draw();
          });

          spriteCommandContainer.appendChild(pointContainer);
        });
      }

      const includeCurves = "curves" in command;
      if (includeCurves) {
        const numberOfCurvesContainer =
          spriteCommandContainer.querySelector(".numberOfCurves");
        const numberOfCurvesInput =
          numberOfCurvesContainer.querySelector("input");
        numberOfCurvesInput.value = command.curves.length;
        const numberOfCurvesSpan =
          numberOfCurvesContainer.querySelector(".value");
        numberOfCurvesSpan.innerText = command.curves.length;
        numberOfCurvesContainer.removeAttribute("hidden");
        numberOfCurvesContainer.addEventListener("input", () => {
          const numberOfCurves = Number(numberOfCurvesInput.value);
          //console.log({ numberOfCurves });
          for (let curveIndex = 0; curveIndex < numberOfCurves; curveIndex++) {
            let curve = command.curves[curveIndex];
            if (!curve) {
              const curve = {
                type: "quadratic",
                controlPoints: [
                  { x: -50, y: 0 },
                  { x: 0, y: 50 },
                  { x: 50, y: 0 },
                ],
              };
              if (curveIndex != 0) {
                curve.controlPoints = curve.controlPoints.slice(0, -1);
              }
              command.curves[curveIndex] = curve;
            }
          }
          command.curves.length = numberOfCurves;
          curveContainers.forEach((curveContainer, index) => {
            // console.log("curveContainer", curveContainer);
            curveContainer.hidden = index >= command.curves.length;
          });
          numberOfCurvesSpan.innerText = command.curves.length;
          draw();
          updateSpriteCommands();
        });

        const curveContainers = [];
        for (
          let curveIndex = 0;
          curveIndex < numberOfCurvesInput.max;
          curveIndex++
        ) {
          const curveContainer = curveTemplate.content
            .cloneNode(true)
            .querySelector(".curve");

          const curve = command.curves[curveIndex];
          curveContainer.hidden = !Boolean(curve);

          const typeContainer = curveContainer.querySelector(".type");
          const typeSelect = typeContainer.querySelector("select");
          const typeOptgroup = typeSelect.querySelector("optgroup");
          BS.DisplayBezierCurveTypes.forEach((curveType) => {
            typeOptgroup.appendChild(new Option(curveType));
          });
          const typeSpan = typeContainer.querySelector(".value");
          if (curve) {
            typeSelect.value = curve.type;
            typeSpan.innerText = curve.type;
          }
          typeContainer.removeAttribute("hidden");
          typeContainer.addEventListener("input", () => {
            const curve = command.curves[curveIndex];
            curve.type = typeSelect.value;
            let numberOfControlPoints =
              BS.displayCurveTypeToNumberOfControlPoints[curve.type];
            if (curveIndex != 0) {
              numberOfControlPoints -= 1;
            }
            curve.controlPoints.length = numberOfControlPoints;
            controlPointContainers.forEach((controlPointContainer) => {
              controlPointContainer.hidden = true;
            });
            controlPointContainers.length = numberOfControlPoints;
            for (
              let controlPointIndex = 0;
              controlPointIndex < numberOfControlPoints;
              controlPointIndex++
            ) {
              let controlPoint = curve.controlPoints[controlPointIndex];
              if (!controlPoint) {
                controlPoint = { x: 0, y: 0 };
                curve.controlPoints[controlPointIndex] = controlPoint;
              }

              const controlPointContainer =
                controlPointContainers[controlPointIndex];
              if (controlPointContainer) {
                controlPointContainer.hidden = false;
              } else {
                addControlPointContainer(controlPointIndex);
              }
            }
            typeSpan.innerText = curve.type;
            draw();
          });

          const controlPointContainers = [];
          const addControlPointContainer = (controlPointIndex) => {
            const controlPointContainer = pointTemplate.content
              .cloneNode(true)
              .querySelector(".point");
            controlPointContainers.push(controlPointContainer);

            const curve = command.curves[curveIndex];
            const controlPoint = curve.controlPoints[controlPointIndex];
            controlPointContainer.hidden = !Boolean(controlPoint);
            // console.log(
            //   { controlPointIndex },
            //   controlPoint,
            //   controlPointContainer.hidden
            // );

            const xContainer = controlPointContainer.querySelector(".x");
            xContainer.removeAttribute("hidden");
            const xInput = xContainer.querySelector("input");
            const xSpan = xContainer.querySelector(".value");
            if (controlPoint) {
              xInput.value = controlPoint.x;
              xSpan.innerText = controlPoint.x;
            }
            xContainer.addEventListener("input", () => {
              const controlPoint =
                command.curves[curveIndex].controlPoints[controlPointIndex];
              controlPoint.x = Number(xInput.value);
              xSpan.innerText = controlPoint.x;
              draw();
            });

            const yContainer = controlPointContainer.querySelector(".y");
            const yInput = yContainer.querySelector("input");
            const ySpan = yContainer.querySelector(".value");
            if (controlPoint) {
              yInput.value = controlPoint.y;
              ySpan.innerText = controlPoint.y;
            }
            yContainer.removeAttribute("hidden");
            yContainer.addEventListener("input", () => {
              const controlPoint =
                command.curves[curveIndex].controlPoints[controlPointIndex];
              controlPoint.y = Number(yInput.value);
              ySpan.innerText = controlPoint.y;
              draw();
            });

            curveContainer.appendChild(controlPointContainer);
            controlPointContainers[controlPointIndex] = controlPointContainer;
          };

          if (curve) {
            curve.controlPoints.forEach((controlPoint, controlPointIndex) => {
              addControlPointContainer(controlPointIndex);
            });
          }

          spriteCommandContainer.appendChild(curveContainer);
          curveContainers[curveIndex] = curveContainer;
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

        const maxBitmapWidth = 400;
        const updateBitmapCanvasSize = () => {
          const { width, height } = command.bitmap;
          bitmapCanvas.width = width * pixelLength + (width - 1);
          bitmapCanvas.height = height * pixelLength + (height - 1);

          const aspectRatio = bitmapCanvas.width / bitmapCanvas.height;
          const bitmapStyleWidth = Math.min(bitmapCanvas.width, maxBitmapWidth);

          bitmapCanvas.style.width = `${bitmapStyleWidth}px`;
          bitmapCanvas.style.height = `${bitmapStyleWidth / aspectRatio}px`;
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

        const updateBitmapCanvasPixels = (dontRedraw) => {
          bitmapContext.imageSmoothingEnabled = false;

          const { width, height, pixels } = command.bitmap;

          const canvasWidth = bitmapCanvas.width;
          const canvasHeight = bitmapCanvas.height;

          bitmapContext.clearRect(0, 0, canvasWidth, canvasHeight);
          bitmapContext.fillStyle = displayCanvasHelper.spriteColors[0];
          bitmapContext.fillRect(0, 0, canvasWidth, canvasHeight);

          pixels.forEach((pixel, pixelIndex) => {
            const pixelX = pixelIndex % width;
            const pixelY = Math.floor(pixelIndex / width);
            const x = pixelX * (pixelLength + 1);
            const y = pixelY * (pixelLength + 1);
            bitmapContext.fillStyle = displayCanvasHelper.spriteColors[pixel];
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
          if (!dontRedraw) {
            draw();
          }
        };

        updateBitmapCanvasSize();
        updateBitmapCanvasPixels();
        const updateBitmapPixels = (dontRedraw) => {
          const { width, height } = command.bitmap;
          const numberOfPixels = width * height;
          if (command.bitmap.pixels.length != numberOfPixels) {
            command.bitmap.pixels = new Array(width * height).fill(0);
          }
          updateBitmapCanvasSize();
          updateBitmapCanvasPixels(dontRedraw);
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
          draw();
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
          draw();
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
            displayCanvasHelper.spriteColors[selectedBitmapColorIndex];
          bitmapSelectedColorIndexColor.dataset.bitmapColorIndex =
            selectedBitmapColorIndex;
        };
        bitmapSelectedColorIndexColor.value =
          displayCanvasHelper.spriteColors[selectedBitmapColorIndex];

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
          draw();
        });
        bitmapSelectedColorIndexInput.max = command.bitmap.numberOfColors - 1;

        const clearBitmapButton =
          spriteCommandContainer.querySelector(".clearBitmap");
        clearBitmapButton.removeAttribute("hidden");
        clearBitmapButton.addEventListener("click", () => {
          command.bitmap.pixels.fill(0);
          updateBitmapCanvasPixels();
        });

        /** @type {HTMLInputElement} */
        const bitmapImageInput =
          spriteCommandContainer.querySelector(".bitmapImageInput");
        bitmapImageInput.addEventListener("input", () => {
          quantizeBitmapImage();
        });
        bitmapImageInput.removeAttribute("hidden");
        /** @type {HTMLButtonElement} */
        const quantizeBitmapImageButton = spriteCommandContainer.querySelector(
          ".quantizeBitmapImage"
        );
        quantizeBitmapImageButton.removeAttribute("hidden");
        quantizeBitmapImageButton.addEventListener("click", () => {
          quantizeBitmapImage();
        });
        const quantizeBitmapImage = () => {
          const file = bitmapImageInput.files[0];
          if (!file) {
            return;
          }
          const reader = new FileReader();
          reader.onload = function (e) {
            bitmapImage.style.display = "";
            bitmapImage.src = e.target.result;
          };
          reader.readAsDataURL(file);
        };
        const bitmapImage = new Image();
        bitmapImage.addEventListener("load", async () => {
          const { colorIndices } = await BS.resizeAndQuantizeImage(
            bitmapImage,
            command.bitmap.width,
            command.bitmap.height,
            displayCanvasHelper.spriteColors.slice(
              0,
              command.bitmap.numberOfColors
            )
          );

          command.bitmap.pixels = colorIndices;
          updateBitmapCanvasPixels();
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          updateLineColorIndexColor();
          draw();
        });

        const lineColorIndexColor =
          lineColorIndexContainer.querySelector(".color");
        const updateLineColorIndexColor = () => {
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
        updateLineColorIndexColor();
      }

      const includeBackgroundColorIndex = "backgroundColorIndex" in command;
      if (includeBackgroundColorIndex) {
        const backgroundColorIndexContainer =
          spriteCommandContainer.querySelector(".backgroundColorIndex");
        const backgroundColorIndexInput =
          backgroundColorIndexContainer.querySelector(".input");
        backgroundColorIndexInput.value = command.backgroundColorIndex;
        const backgroundColorIndexSpan =
          backgroundColorIndexContainer.querySelector(".value");
        backgroundColorIndexSpan.innerText = command.backgroundColorIndex;
        backgroundColorIndexContainer.removeAttribute("hidden");
        backgroundColorIndexInput.addEventListener("input", () => {
          command.backgroundColorIndex = Number(
            backgroundColorIndexInput.value
          );
          backgroundColorIndexSpan.innerText = command.backgroundColorIndex;
          updateBackgroundColorIndexColor();
          draw();
        });

        const backgroundColorIndexColor =
          backgroundColorIndexContainer.querySelector(".color");
        const updateBackgroundColorIndexColor = () => {
          console.log(
            "backgroundColor",
            command.backgroundColorIndex,
            displayCanvasHelper.spriteColors[command.backgroundColorIndex],
            backgroundColorIndexColor
          );
          backgroundColorIndexColor.dataset.colorIndex =
            command.backgroundColorIndex;
          backgroundColorIndexColor.value =
            displayCanvasHelper.spriteColors[command.backgroundColorIndex];
        };
        updateBackgroundColorIndexColor();
      }

      const includeSetFillBackground = "fillBackground" in command;
      if (includeSetFillBackground) {
        const setFillBackgroundCommandContainer =
          spriteCommandContainer.querySelector(".setFillBackground");
        setFillBackgroundCommandContainer.removeAttribute("hidden");

        const setFillBackgroundInput =
          setFillBackgroundCommandContainer.querySelector(" .input");
        setFillBackgroundInput.checked = command.fillBackground;
        setFillBackgroundInput.addEventListener("input", () => {
          command.fillBackground = setFillBackgroundInput.checked;
          draw();
        });
      }

      const includeSetIgnoreFill = "ignoreFill" in command;
      if (includeSetIgnoreFill) {
        const setIgnoreFillCommandContainer =
          spriteCommandContainer.querySelector(".setIgnoreFill");
        setIgnoreFillCommandContainer.removeAttribute("hidden");

        const setIgnoreFillInput =
          setIgnoreFillCommandContainer.querySelector(" .input");
        setIgnoreFillInput.checked = command.ignoreFill;
        setIgnoreFillInput.addEventListener("input", () => {
          command.ignoreFill = setIgnoreFillInput.checked;
          draw();
        });
      }

      const includeSetIgnoreLine = "ignoreLine" in command;
      if (includeSetIgnoreLine) {
        const setIgnoreLineCommandContainer =
          spriteCommandContainer.querySelector(".setIgnoreLine");
        setIgnoreLineCommandContainer.removeAttribute("hidden");

        const setIgnoreLineInput =
          setIgnoreLineCommandContainer.querySelector(" .input");
        setIgnoreLineInput.checked = command.ignoreLine;
        setIgnoreLineInput.addEventListener("input", () => {
          command.ignoreLine = setIgnoreLineInput.checked;
          draw();
        });
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
          draw();
        };

        const bitmapColorIndexColor =
          bitmapColorIndexContainer.querySelector(".color");
        bitmapColorIndexColor.dataset.colorIndex = command.colorIndex;
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
          //console.log({ numberOfBitmapColorPairs });
          for (let i = 0; i < numberOfBitmapColorPairs; i++) {
            let bitmapColorPair = command.bitmapColorPairs[i];
            if (!bitmapColorPair) {
              command.bitmapColorPairs[i] = {
                bitmapColorIndex: i,
                colorIndex: i,
              };
            }
          }
          command.bitmapColorPairs.length = numberOfBitmapColorPairs;
          bitmapColorPairContainers.forEach(
            (bitmapColorPairContainer, index) => {
              console.log("bitmapColorPairContainer", bitmapColorPairContainer);
              bitmapColorPairContainer.hidden =
                index >= command.bitmapColorPairs.length;
              bitmapColorPairContainer._update();
            }
          );
          updateBitmapColorInputs();
          numberOfBitmapColorPairsSpan.innerText =
            command.bitmapColorPairs.length;
          draw();
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
          bitmapColorIndexContainer.addEventListener("input", () => {
            update();
          });

          const colorIndexContainer =
            bitmapColorPairContainer.querySelector(".colorIndex");
          colorIndexContainer.removeAttribute("hidden");
          const colorIndexInput = colorIndexContainer.querySelector("input");
          const colorIndexSpan = colorIndexContainer.querySelector(".value");
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
            bitmapColorPair.colorIndex = Number(colorIndexInput.value);

            bitmapColorPairContainer._update();
            draw();
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

          bitmapColorPairContainer._update = () => {
            const bitmapColorPair = command.bitmapColorPairs[i];
            if (!bitmapColorPair) {
              return;
            }
            colorIndexInput.value = bitmapColorPair.colorIndex;
            colorIndexSpan.innerText = bitmapColorPair.colorIndex;

            bitmapColorIndexInput.value = bitmapColorPair.bitmapColorIndex;
            bitmapColorIndexSpan.innerText = bitmapColorPair.bitmapColorIndex;

            updateBitmapColorIndexColor();
          };
          bitmapColorPairContainer._update();

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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
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
          draw();
        });
      }

      const includeDrawSprite = "spriteName" in command;
      if (includeDrawSprite) {
        const drawSpriteContainer =
          spriteCommandContainer.querySelector(".drawSprite");
        drawSpriteContainer.removeAttribute("hidden");
        const spriteNameSelect = drawSpriteContainer.querySelector("select");
        const spriteNameOptgroup = spriteNameSelect.querySelector("optgroup");
        spriteSheet.sprites.forEach((sprite) => {
          if (selectedSprite == sprite) {
            return;
          }
          spriteNameOptgroup.appendChild(new Option(sprite.name));
        });
        spriteNameSelect.value = command.spriteName;
        spriteNameSelect.addEventListener("input", () => {
          command.spriteName = spriteNameSelect.value;
          spriteName();
        });
      }

      const includeHorizontalAlignment = "horizontalAlignment" in command;
      if (includeHorizontalAlignment) {
        const horizontalAlignmentContainer =
          spriteCommandContainer.querySelector(".horizontalAlignment");
        horizontalAlignmentContainer.removeAttribute("hidden");
        const horizontalAlignmentSelect =
          horizontalAlignmentContainer.querySelector("select");
        const horizontalAlignmentOptgroup =
          horizontalAlignmentSelect.querySelector("optgroup");
        BS.DisplayAlignments.forEach((alignment) => {
          horizontalAlignmentOptgroup.appendChild(new Option(alignment));
        });
        horizontalAlignmentSelect.value = command.horizontalAlignment;
        horizontalAlignmentContainer.addEventListener("input", () => {
          command.horizontalAlignment = horizontalAlignmentSelect.value;
          draw();
        });
      }

      const includeVerticalAlignment = "verticalAlignment" in command;
      if (includeVerticalAlignment) {
        const verticalAlignmentContainer =
          spriteCommandContainer.querySelector(".verticalAlignment");
        verticalAlignmentContainer.removeAttribute("hidden");
        const verticalAlignmentSelect =
          verticalAlignmentContainer.querySelector("select");
        const verticalAlignmentOptgroup =
          verticalAlignmentSelect.querySelector("optgroup");
        BS.DisplayAlignments.forEach((alignment) => {
          verticalAlignmentOptgroup.appendChild(new Option(alignment));
        });
        verticalAlignmentSelect.value = command.verticalAlignment;
        verticalAlignmentContainer.addEventListener("input", () => {
          command.verticalAlignment = verticalAlignmentSelect.value;
          draw();
        });
      }

      const includeSpriteScale = "spriteScale" in command;
      if (includeSpriteScale) {
        const spriteScaleContainer =
          spriteCommandContainer.querySelector(".spriteScale");
        const spriteScaleInput = spriteScaleContainer.querySelector("input");
        spriteScaleInput.value = command.spriteScale;
        const spriteScaleSpan = spriteScaleContainer.querySelector(".value");
        spriteScaleSpan.innerText = command.spriteScale;
        spriteScaleContainer.removeAttribute("hidden");
        spriteScaleContainer.addEventListener("input", () => {
          command.spriteScale = Number(spriteScaleInput.value);
          spriteScaleSpan.innerText = command.spriteScale;
          draw();
        });
      }

      const includeSpriteScaleX = "spriteScaleX" in command;
      if (includeSpriteScaleX) {
        const spriteScaleXContainer =
          spriteCommandContainer.querySelector(".spriteScaleX");
        const spriteScaleXInput = spriteScaleXContainer.querySelector("input");
        spriteScaleXInput.value = command.spriteScaleX;
        const spriteScaleXSpan = spriteScaleXContainer.querySelector(".value");
        spriteScaleXSpan.innerText = command.spriteScaleX;
        spriteScaleXContainer.removeAttribute("hidden");
        spriteScaleXContainer.addEventListener("input", () => {
          command.spriteScaleX = Number(spriteScaleXInput.value);
          spriteScaleXSpan.innerText = command.spriteScaleX;
          draw();
        });
      }

      const includeSpriteScaleY = "spriteScaleY" in command;
      if (includeSpriteScaleY) {
        const spriteScaleYContainer =
          spriteCommandContainer.querySelector(".spriteScaleY");
        const spriteScaleYInput = spriteScaleYContainer.querySelector("input");
        spriteScaleYInput.value = command.spriteScaleY;
        const spriteScaleYSpan = spriteScaleYContainer.querySelector(".value");
        spriteScaleYSpan.innerText = command.spriteScaleY;
        spriteScaleYContainer.removeAttribute("hidden");
        spriteScaleYContainer.addEventListener("input", () => {
          command.spriteScaleY = Number(spriteScaleYInput.value);
          spriteScaleYSpan.innerText = command.spriteScaleY;
          draw();
        });
      }

      const includeSpriteIndex = "spriteIndex" in command;
      if (includeSpriteIndex) {
        const spriteIndexContainer =
          spriteCommandContainer.querySelector(".spriteIndex");
        const spriteIndexSelect = spriteIndexContainer.querySelector("select");
        const spriteIndexOptgroup = spriteIndexSelect.querySelector("optgroup");
        spriteSheet.sprites.forEach((sprite, index) => {
          spriteIndexOptgroup.appendChild(new Option(sprite.name, index));
        });
        spriteIndexSelect.value = command.spriteIndex;
        spriteIndexContainer.removeAttribute("hidden");
        spriteIndexContainer.addEventListener("input", () => {
          command.spriteIndex = Number(spriteIndexSelect.value);
          draw();
        });
      }

      const includeSpriteColorIndex = "spriteColorIndex" in command;
      if (includeSpriteColorIndex) {
        const spriteColorIndexContainer =
          spriteCommandContainer.querySelector(".selectSpriteColor");
        spriteColorIndexContainer.removeAttribute("hidden");

        const spriteColorIndexInput = spriteColorIndexContainer.querySelector(
          ".spriteColorIndex .input"
        );
        spriteColorIndexInput.value = command.spriteColorIndex;
        const spriteColorIndexSpan = spriteColorIndexContainer.querySelector(
          ".spriteColorIndex .value"
        );
        spriteColorIndexSpan.innerText = command.spriteColorIndex;
        spriteColorIndexInput.addEventListener("input", () => {
          update();
        });

        const colorIndexInput =
          spriteColorIndexContainer.querySelector(".colorIndex .input");
        colorIndexInput.value = command.colorIndex;
        const colorIndexSpan =
          spriteColorIndexContainer.querySelector(".colorIndex .value");
        colorIndexSpan.innerText = command.colorIndex;
        colorIndexInput.addEventListener("input", () => {
          update();
        });

        const update = () => {
          command.spriteColorIndex = Number(spriteColorIndexInput.value);
          spriteColorIndexSpan.innerText = command.spriteColorIndex;

          command.colorIndex = Number(colorIndexInput.value);
          colorIndexSpan.innerText = command.colorIndex;

          updateSpriteColorIndexColor();
          draw();
        };

        const spriteColorIndexColor =
          spriteColorIndexContainer.querySelector(".color");
        spriteColorIndexColor.dataset.colorIndex = command.colorIndex;
        const updateSpriteColorIndexColor = () => {
          console.log(
            "spriteColor",
            command.spriteColorIndex,
            displayCanvasHelper.spriteColors[command.colorIndex],
            spriteColorIndexColor
          );
          spriteColorIndexColor.dataset.colorIndex = command.colorIndex;
          spriteColorIndexColor.value =
            displayCanvasHelper.spriteColors[command.colorIndex];
        };
        updateSpriteColorIndexColor();
      }

      const includeSpriteColorPairs = "spriteColorPairs" in command;
      if (includeSpriteColorPairs) {
        const numberOfSpriteColorPairsContainer =
          spriteCommandContainer.querySelector(".numberOfSpriteColorPairs");
        const numberOfSpriteColorPairsInput =
          numberOfSpriteColorPairsContainer.querySelector("input");
        numberOfSpriteColorPairsInput.value = command.spriteColorPairs.length;
        const numberOfSpriteColorPairsSpan =
          numberOfSpriteColorPairsContainer.querySelector(".value");
        numberOfSpriteColorPairsSpan.innerText =
          command.spriteColorPairs.length;
        numberOfSpriteColorPairsContainer.removeAttribute("hidden");
        numberOfSpriteColorPairsContainer.addEventListener("input", () => {
          const numberOfSpriteColorPairs = Number(
            numberOfSpriteColorPairsInput.value
          );
          //console.log({ numberOfSpriteColorPairs });
          for (let i = 0; i < numberOfSpriteColorPairs; i++) {
            let spriteColorPair = command.spriteColorPairs[i];
            if (!spriteColorPair) {
              command.spriteColorPairs[i] = {
                spriteColorIndex: i,
                colorIndex: i,
              };
            }
          }
          command.spriteColorPairs.length = numberOfSpriteColorPairs;
          spriteColorPairContainers.forEach(
            (spriteColorPairContainer, index) => {
              console.log("spriteColorPairContainer", spriteColorPairContainer);
              spriteColorPairContainer.hidden =
                index >= command.spriteColorPairs.length;
              spriteColorPairContainer._update();
            }
          );
          updateBitmapColorInputs();
          numberOfSpriteColorPairsSpan.innerText =
            command.spriteColorPairs.length;
          draw();
        });

        const spriteColorPairContainers = [];
        for (let i = 0; i < numberOfSpriteColorPairsInput.max; i++) {
          const spriteColorPairContainer = spriteColorPairTemplate.content
            .cloneNode(true)
            .querySelector(".spriteColorPair");

          const spriteColorPair = command.spriteColorPairs[i];
          spriteColorPairContainer.hidden = !Boolean(spriteColorPair);

          const spriteColorIndexContainer =
            spriteColorPairContainer.querySelector(".spriteColorIndex");
          spriteColorIndexContainer.removeAttribute("hidden");
          const spriteColorIndexInput =
            spriteColorIndexContainer.querySelector("input");
          const spriteColorIndexSpan =
            spriteColorIndexContainer.querySelector(".value");
          spriteColorIndexContainer.addEventListener("input", () => {
            update();
          });

          const colorIndexContainer =
            spriteColorPairContainer.querySelector(".colorIndex");
          colorIndexContainer.removeAttribute("hidden");
          const colorIndexInput = colorIndexContainer.querySelector("input");
          const colorIndexSpan = colorIndexContainer.querySelector(".value");
          colorIndexContainer.addEventListener("input", () => {
            update();
          });

          const update = () => {
            const spriteColorPair = command.spriteColorPairs[i];
            if (!spriteColorPair) {
              return;
            }

            spriteColorPair.spriteColorIndex = Number(
              spriteColorIndexInput.value
            );
            spriteColorPair.colorIndex = Number(colorIndexInput.value);

            spriteColorPairContainer._update();
            draw();
          };

          const spriteColorIndexColor =
            spriteColorPairContainer.querySelector(".color");
          const updateSpriteColorIndexColor = () => {
            const spriteColorPair = command.spriteColorPairs[i];
            if (!spriteColorPair) {
              return;
            }
            spriteColorIndexColor.dataset.colorIndex =
              spriteColorPair.colorIndex;
            spriteColorIndexColor.value =
              displayCanvasHelper.spriteColors[spriteColorPair.colorIndex];
          };
          updateSpriteColorIndexColor();

          spriteColorPairContainer._update = () => {
            const spriteColorPair = command.spriteColorPairs[i];
            if (!spriteColorPair) {
              return;
            }
            colorIndexInput.value = spriteColorPair.colorIndex;
            colorIndexSpan.innerText = spriteColorPair.colorIndex;

            spriteColorIndexInput.value = spriteColorPair.spriteColorIndex;
            spriteColorIndexSpan.innerText = spriteColorPair.spriteColorIndex;

            updateSpriteColorIndexColor();
          };
          spriteColorPairContainer._update();

          spriteCommandContainer.appendChild(spriteColorPairContainer);
          spriteColorPairContainers[i] = spriteColorPairContainer;
        }
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
      bitmapSelectedColorIndexColor.updateBitmapPixels?.(true);
    });

  document.querySelectorAll(".bitmapColor").forEach((bitmapColorIndexColor) => {
    bitmapColorIndexColor.value =
      displayCanvasHelper.spriteColors[
        bitmapColorIndexColor.dataset.colorIndex
      ];
  });
  document.querySelectorAll(".spriteColor").forEach((spriteColorIndexColor) => {
    spriteColorIndexColor.value =
      displayCanvasHelper.colors[spriteColorIndexColor.dataset.colorIndex];
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

const uploadSpriteSheetButton = document.getElementById("uploadSpriteSheet");
displayCanvasHelper.addEventListener("deviceIsConnected", (event) => {
  updateUploadSpriteSheetButton();
});
displayCanvasHelper.addEventListener("device", (event) => {
  updateUploadSpriteSheetButton();
});
const updateUploadSpriteSheetButton = () => {
  uploadSpriteSheetButton.disabled = !(
    displayCanvasHelper.device?.isConnected == true
  );
};
displayCanvasHelper.addEventListener("deviceSpriteSheetUploadStart", () => {
  uploadSpriteSheetButton.innerText = "uploading spritesheet";
});
displayCanvasHelper.addEventListener(
  "deviceSpriteSheetUploadProgress",
  (event) => {
    const { progress } = event.message;
    uploadSpriteSheetProgress.value = progress;
    uploadSpriteSheetButton.innerText = `uploading spritesheet ${Math.round(
      progress * 100
    )}%`;
  }
);
displayCanvasHelper.addEventListener("deviceSpriteSheetUploadComplete", () => {
  uploadSpriteSheetProgress.value = 0;
  uploadSpriteSheetButton.innerText = "upload spritesheet";
  displayCanvasHelper.selectSpriteSheet(spriteSheet.name, true);
});
uploadSpriteSheetButton.addEventListener("click", () => {
  displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  updateToggleUseUploadedSpriteSheetButton();
});
const uploadSpriteSheetProgress = document.getElementById(
  "uploadSpriteSheetProgress"
);

let useUploadedSpriteSheet = false;
const setUseUploadedSpriteSheet = (newUseUploadedSpriteSheet) => {
  useUploadedSpriteSheet = newUseUploadedSpriteSheet;
  console.log({ useUploadedSpriteSheet });
  draw();
};
const toggleUseUploadedSpriteSheetButton = document.getElementById(
  "toggleUseUploadedSpriteSheet"
);
toggleUseUploadedSpriteSheetButton.addEventListener("click", () => {
  setUseUploadedSpriteSheet(toggleUseUploadedSpriteSheetButton.checked);
});
displayCanvasHelper.addEventListener("deviceSpriteSheetUploadComplete", () => {
  updateToggleUseUploadedSpriteSheetButton();
});
displayCanvasHelper.addEventListener("deviceIsConnected", () => {
  updateToggleUseUploadedSpriteSheetButton();
});
const updateToggleUseUploadedSpriteSheetButton = () => {
  let enabled = true;
  if (displayCanvasHelper.device) {
    enabled =
      !displayCanvasHelper.device.isConnected ||
      spriteSheet.name in displayCanvasHelper.device.displaySpriteSheets;
  }
  toggleUseUploadedSpriteSheetButton.disabled = !enabled;
  if (enabled) {
    displayCanvasHelper.selectSpriteSheet(spriteSheet.name, true);
  } else {
    setUseUploadedSpriteSheet(false);
  }
};

/** @type {HTMLInputElement} */
const paletteImageInput = document.getElementById("paletteImageInput");
paletteImageInput.addEventListener("input", () => {
  const file = paletteImageInput.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    paletteImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
  paletteImageInput.value = "";
});
const paletteImage = new Image();
paletteImage.addEventListener("load", async () => {
  const { colors, colorIndices } = await BS.quantizeImage(
    paletteImage,
    paletteImage.naturalWidth,
    paletteImage.naturalHeight,
    selectedPalette?.numberOfColors || displayCanvasHelper.numberOfColors
  );

  colors.forEach((color, colorIndex) => {
    displayCanvasHelper.setColor(colorIndex, color);
    displayCanvasHelper.selectSpriteColor(colorIndex, colorIndex);
  });
  displayCanvasHelper.flushContextCommands();
});

/** @type {HTMLInputElement} */
const spriteImageInput = document.getElementById("spriteImageInput");
spriteImageInput.addEventListener("input", () => {
  const file = spriteImageInput.files[0];
  if (!file) {
    return;
  }
  if (selectedSprite && selectedPalette) {
    const reader = new FileReader();
    reader.onload = function (e) {
      spriteImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  spriteImageInput.value = "";
});
const spriteImage = new Image();
spriteImage.addEventListener("load", async () => {
  if (!selectedSprite) {
    return;
  }
  if (!selectedPalette) {
    return;
  }
  const { name, width, height } = selectedSprite;
  await BS.imageToSprite(
    spriteImage,
    name,
    width,
    height,
    selectedPalette.numberOfColors,
    selectedPalette.name,
    spriteImageOverridePalette,
    spriteSheet,
    0
  );
  setSpriteIndex(selectedSpriteIndex);
  setPaletteIndex(selectedPaletteIndex);
});

let spriteImageOverridePalette = true;
const setSpriteImageOverridePalette = (newSpriteImageOverridePalette) => {
  spriteImageOverridePalette = newSpriteImageOverridePalette;
  console.log({ spriteImageOverridePalette });
  spriteImageOverridePaletteCheckbox.checked = spriteImageOverridePalette;
};
const spriteImageOverridePaletteCheckbox = document.getElementById(
  "spriteImageOverridePalette"
);
spriteImageOverridePaletteCheckbox.addEventListener("input", () => {
  setSpriteImageOverridePalette(spriteImageOverridePaletteCheckbox.checked);
});
setSpriteImageOverridePalette(spriteImageOverridePalette);

const checkSpriteSheetSizeButton = document.getElementById(
  "checkSpriteSheetSize"
);
checkSpriteSheetSizeButton.addEventListener("click", () => {
  const arrayBuffer = displayCanvasHelper.serializeSpriteSheet(spriteSheet);
  checkSpriteSheetSizeButton.innerText = `size: ${(
    arrayBuffer.byteLength / 1024
  ).toFixed(2)}kb`;
  if (displayCanvasHelper.device?.isConnected) {
    checkSpriteSheetSizeButton.innerText += ` (max ${(
      displayCanvasHelper.device.maxFileLength / 1024
    ).toFixed(2)}kb)`;
  }
});

/** @type {HTMLInputElement} */
const loadFontInput = document.getElementById("loadFont");
loadFontInput.addEventListener("input", async () => {
  const file = loadFontInput.files[0];
  if (!file) return;
  const arrayBuffer = await file.arrayBuffer();
  const font = await BS.parseFont(arrayBuffer);
  const fontSpriteSheet = await displayCanvasHelper.fontToSpriteSheet(
    font,
    fontSize,
    undefined,
    { usePath: fontUsePath }
  );
  setSpriteSheetName(fontSpriteSheet.name);
  spriteSheet.sprites = fontSpriteSheet.sprites;
  setSpriteIndex(0);
  console.log("fontSpriteSheet", fontSpriteSheet);
  loadFontInput.value = "";
  updateSelectSpriteSelect();
});

let fontSize = 36;
const fontSizeInput = document.getElementById("fontSize");
const fontSizeSpan = document.getElementById("fontSizeSpan");
fontSizeInput.addEventListener("input", () => {
  setFontSize(Number(fontSizeInput.value));
});
const setFontSize = (newFontSize) => {
  fontSize = newFontSize;
  // console.log({ fontSize });
  fontSizeSpan.innerText = fontSize;
  fontSizeInput.value = fontSize;
  setSpritesLineHeight(fontSize);
};
setFontSize(fontSize);

const setFontUsePath = (newFontUsePath) => {
  fontUsePath = newFontUsePath;
  console.log({ fontUsePath });
};
const fontUsePathInput = document.getElementById("fontUsePath");
fontUsePathInput.addEventListener("input", () => {
  setFontUsePath(fontUsePathInput.checked);
});
let fontUsePath = fontUsePathInput.checked;

// DRAW SPRITES

/** @type {HTMLTextAreaElement} */
const drawSpritesTextArea = document.getElementById("drawSpritesText");
let drawSpritesText = "";
drawSpritesTextArea.addEventListener("input", () => {
  drawSpritesText = drawSpritesTextArea.value;
  if (shouldDrawAllSprites) {
    draw();
  }
});
