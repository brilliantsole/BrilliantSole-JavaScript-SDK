/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");
/** @type {HTMLCanvasElement} */
const imageOverlay = document.getElementById("imageOverlay");
const imageOverlayContext = imageOverlay.getContext("2d");

/** @type {HTMLCanvasElement} */
const generatedImage = document.getElementById("generatedImage");
const generatedImageContext = generatedImage.getContext("2d");

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
  generatedImage.style.display = "none";
  imageCallbacks[modelType]?.(
    cameraImage,
    imageOverlay,
    imageOverlayContext,
    modelResultsElement,
    generatedImage,
    generatedImageContext
  );
});

/**
 * @param {string} name
 * @param {() => void} onSelect
 * @param {(image: HTMLImageElement, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, modelResultsElement: HTMLPreElement, generatedImageCanvas: HTMLCanvasElement, generatedImageContext: CanvasRenderingContext2D) => void} onImage
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
  console.log("drawBox", boundingBox);
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

/**
 * @param {Uint8Array} uint8Array
 * @param {number} width
 * @param {height} height
 * @param {HTMLCanvasElement} canvas
 * @param {RenderingContext} context
 */
export function drawGreyscaleImage(uint8Array, width, height, canvas, context) {
  console.log("drawing greyscale image...");

  canvas.width = width;
  canvas.height = height;

  const imageData = context.createImageData(width, height);
  const data = imageData.data; // this is a Uint8ClampedArray

  for (let i = 0; i < uint8Array.length; i++) {
    const gray = uint8Array[i];
    const index = i * 4;
    data[index] = gray; // R
    data[index + 1] = gray; // G
    data[index + 2] = gray; // B
    data[index + 3] = 255; // A
  }

  context.putImageData(imageData, 0, 0);
}

/**
 * @param {Uint8Array} uint8Array - Should contain RGB or RGBA data in sequence.
 * @param {number} width
 * @param {number} height
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} context
 */
export function drawColorImage(uint8Array, width, height, canvas, context) {
  console.log("drawing color image...");

  canvas.width = width;
  canvas.height = height;

  const imageData = context.createImageData(width, height);
  const data = imageData.data; // this is a Uint8ClampedArray

  const isRGBA = uint8Array.length === width * height * 4;

  for (let i = 0, j = 0; i < data.length; i += 4, j += isRGBA ? 4 : 3) {
    data[i] = uint8Array[j]; // R
    data[i + 1] = uint8Array[j + 1]; // G
    data[i + 2] = uint8Array[j + 2]; // B
    data[i + 3] = isRGBA ? uint8Array[j + 3] : 255; // A
  }

  context.putImageData(imageData, 0, 0);
}

const resizeCanvas = document.createElement("canvas");
const resizeContext = resizeCanvas.getContext("2d");
/**
 * @param {CanvasImageSource} image
 * @param {number} newWidth
 * @param {number} newHeight
 */
export function resizeImage(image, newWidth, newHeight) {
  resizeCanvas.width = newWidth;
  resizeCanvas.height = newHeight;

  resizeContext.drawImage(image, 0, 0, newWidth, newHeight);

  return resizeCanvas.toDataURL("image/png");
}
