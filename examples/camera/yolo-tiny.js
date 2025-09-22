import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2";

import { drawColorImage, drawGreyscaleImage, registerModel } from "./utils.js";

let detector = undefined;
let isRunning = false;

const createDetector = async () => {
  console.log("creating detector...");
  detector = await pipeline("object-detection", "Xenova/yolos-tiny", {
    // quantized: false, // Uncomment this line to use the quantized version
  });
  console.log("created detector", detector);
};

registerModel(
  "yolo tiny",
  () => {
    if (!detector) {
      createDetector();
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
    if (!detector) {
      console.error("detector not created yet");
      return;
    }
    if (isRunning) {
      return;
    }
    isRunning = true;

    try {
      console.log("running detector...");
      const output = await detector(image.src, { threshold: 0.4 });
      console.log("detector output", output);

      if (output) {
        // FILL
      }
    } catch (error) {
      console.error("error running detector", error);
    } finally {
      isRunning = false;
    }
  }
);
