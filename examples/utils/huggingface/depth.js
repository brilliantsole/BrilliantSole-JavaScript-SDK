import { pipeline } from "./transformers.js";

console.log("pipeline", pipeline);

/**
 *  @typedef {{
 *    depth: import("@huggingface/transformers").RawImage;
 *    predicted_depth: import("@huggingface/transformers").Tensor;
 *}} DepthEstimatorResult
 */
/** @typedef {{depthEstimatorResult:DepthEstimatorResult}} DepthEstimatorResultEventDetail */

const useWebGpu = true && Boolean(navigator.gpu);
const depthEstimator = await pipeline(
  "depth-estimation",
  //   "Xenova/depth-anything-small-hf",
  "onnx-community/depth-anything-v2-small",
  // "onnx-community/DepthPro-ONNX",
  //   "onnx-community/depth-anything-v2-small-ONNX",
  {
    dtype: useWebGpu ? "fp32" : "q4", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
    device: useWebGpu ? "webgpu" : "wasm", // Options: "wasm", "webgpu" (web) or "cpu" (node). If using "webgpu", we recommend using dtype="fp32".
  },
);

window.depthEstimator = depthEstimator;
console.log("created depthEstimator", depthEstimator);

window.dispatchEvent(
  new CustomEvent("createddepthestimator", {
    detail: { depthEstimator },
  }),
);

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas[data-depth-estimator]");
const context = canvas.getContext("2d");

/** @type {HTMLImageElement} */
const image = document.querySelector("img[data-depth-estimator]");

let isBusy = false;
let waitUntilDone = false;
const estimateDepth = async () => {
  if (!depthEstimator) {
    console.log("depthEstimator not created yet");
    return;
  }
  if (isBusy) {
    waitUntilDone = true;
    return;
  }
  isBusy = true;

  //   console.log("await depthEstimator...");
  /** @type {DepthEstimatorResult} */
  const depthEstimatorResult = await depthEstimator(image.src);
  //   console.log("depthEstimatorResult", depthEstimatorResult);

  const { depth, predicted_depth } = depthEstimatorResult;
  //   console.log("depth", depth);

  if (canvas.width != depth.width) {
    canvas.width = depth.width;
  }
  if (canvas.height != depth.height) {
    canvas.height = depth.height;
  }
  const imageData = new ImageData(depth.rgba().data, depth.width, depth.height);
  context.putImageData(imageData, 0, 0);

  window.dispatchEvent(
    new CustomEvent("depthestimatorresult", {
      detail: { depthEstimatorResult },
    }),
  );
  isBusy = false;
  if (waitUntilDone) {
    waitUntilDone = false;
  }
};
image.addEventListener("load", () => {
  estimateDepth();
});
