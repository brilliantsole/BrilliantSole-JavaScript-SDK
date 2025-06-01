import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2";

import {
  drawBox,
  drawGreyscaleImage,
  registerModel,
  resizeImage,
} from "./utils.js";

let depthEstimator = undefined;
let isRunning = false;

const createDepthEstimator = async () => {
  depthEstimator = await pipeline(
    "depth-estimation",
    "onnx-community/depth-anything-v2-small"
  );
  console.log("created depthEstimator", depthEstimator);
};

registerModel(
  "depth estimator",
  () => {
    if (!depthEstimator) {
      createDepthEstimator();
    }
  },
  async (
    image,
    canvas,
    context,
    mediaResultsElement,
    generatedImageCanvas,
    generatedImageContext
  ) => {
    if (!depthEstimator) {
      console.error("depthEstimator not created yet");
      return;
    }
    if (isRunning) {
      return;
    }
    try {
      isRunning = true;

      console.log("running depthEstimator");
      const src = resizeImage(image, 128, 128);
      const output = await depthEstimator(src);
      console.log("depthEstimator output", output);

      if (output.depth) {
        const { channels, data, height, width } = output.depth;
        console.log({ channels, data, height, width });
        if (channels == 1) {
          generatedImageCanvas.style.display = "";
          drawGreyscaleImage(
            data,
            height,
            width,
            generatedImageCanvas,
            generatedImageContext
          );
        }
      }
    } catch (error) {
      console.error("error running depthEstimator", error);
    } finally {
      isRunning = false;
    }
  }
);
