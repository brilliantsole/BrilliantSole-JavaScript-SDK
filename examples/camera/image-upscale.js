import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2";

import {
  drawColorImage,
  drawGreyscaleImage,
  registerModel,
  resizeImage,
} from "./utils.js";

let upscaler = undefined;
let isRunning = false;

const createUpscaler = async () => {
  console.log("creating upscaler...");
  upscaler = await pipeline(
    "image-to-image",
    "Xenova/swin2SR-compressed-sr-x4-48",
    {
      // quantized: false, // Uncomment this line to use the quantized version
    }
  );
  console.log("created upscaler", upscaler);
};

registerModel(
  "image upscale",
  () => {
    if (!upscaler) {
      createUpscaler();
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
    if (!upscaler) {
      console.error("upscaler not created yet");
      return;
    }
    if (isRunning) {
      return;
    }
    isRunning = true;

    try {
      console.log("running upscaler...");
      const src = resizeImage(image, 256, 256);
      const output = await upscaler(src);
      console.log("upscaler output", output);

      if (output) {
        const { channels, data, height, width } = output;
        console.log({ channels, data, height, width });
        if (channels == 3) {
          generatedImageCanvas.style.display = "";
          drawColorImage(
            data,
            height,
            width,
            generatedImageCanvas,
            generatedImageContext
          );
        }
      }
    } catch (error) {
      console.error("error running upscalar", error);
    } finally {
      isRunning = false;
    }
  }
);
