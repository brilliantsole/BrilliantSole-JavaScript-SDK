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
  modelResultsElement.textContent = "";
  imageCallbacks[modelType]?.(
    cameraImage,
    imageOverlay,
    imageOverlayContext,
    modelResultsElement
  );
});

/**
 * @param {string} name
 * @param {() => void} onSelect
 * @param {(image: HTMLImageElement, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, modelResultsElement: HTMLPreElement) => void} onImage
 */
export function registerModel(name, onSelect, onImage) {
  modelTypeOptgroup.appendChild(new Option(name));
  modelTypeSelectedCallbacks[name] = onSelect;
  imageCallbacks[name] = onImage;
}

/**
 * @param {{originX: number, originY: number, width: number, height: number}} boundingBox
 * @param {HTMLImageElement} image
 * @param {HTMLCanvasElement} canvas
 * @param {RenderingContext} context
 */
export function drawBox(boundingBox, image, canvas, context) {
  const { originX, originY, width, height } = boundingBox;
  const _originX = (originX / image.naturalWidth) * canvas.width;
  const _originY = (originY / image.naturalHeight) * canvas.height;

  const _width = (width / image.naturalWidth) * canvas.width;
  const _height = (height / image.naturalHeight) * canvas.height;

  context.fillStyle = "rgba(0, 191, 255, 0.4)";
  context.fillRect(_originX, _originY, _width, _height);

  context.strokeStyle = "white";
  context.lineWidth = 2;
  context.strokeRect(_originX, _originY, _width, _height);
}

/**
 * @param {{x: number, y: number}} keypoint
 * @param {HTMLImageElement} image
 * @param {HTMLCanvasElement} canvas
 * @param {RenderingContext} context
 */
export function drawPoint(keypoint, image, canvas, context) {
  const { x, y } = keypoint;

  const _x = x * canvas.width;
  const _y = y * canvas.height;

  context.beginPath();
  context.arc(_x, _y, 3, 0, 2 * Math.PI);

  context.fillStyle = "red";
  context.fill();
}
