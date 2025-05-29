/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");
/** @type {HTMLCanvasElement} */
const imageOverlay = document.getElementById("imageOverlay");
const imageOverlayContext = imageOverlay.getContext("2d");

const modelResultsElement = document.getElementById("modelResults");

/** @type {HTMLSelectElement} */
const modelTypeSelect = document.getElementById("modelType");
/** @type {HTMLOptGroupElement} */
const modelTypeOptgroup = modelTypeSelect.querySelector("optgroup");

const modelTypeSelectedCallbacks = {};

let modelType = modelTypeSelect.value;
modelTypeSelect.addEventListener("input", () => {
  modelType = modelTypeSelect.value;
  console.log({ modelType });
  modelTypeSelectedCallbacks[modelType]?.();
});

const imageCallbacks = {};
cameraImage.addEventListener("load", () => {
  imageOverlayContext.clearRect(0, 0, imageOverlay.width, imageOverlay.height);
  modelResultsElement.innerText = "";
  imageCallbacks[modelType]?.(
    cameraImage,
    imageOverlay,
    imageOverlayContext,
    modelResultsElement
  );
});

export function registerModel(name, onSelect, onImage) {
  modelTypeOptgroup.appendChild(new Option(name));
  modelTypeSelectedCallbacks[name] = onSelect;
  imageCallbacks[name] = onImage;
}
