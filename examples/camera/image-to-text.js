import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.4";

import { registerModel } from "./utils.js";

let captioner = undefined;
let isRunning = false;

const createCaptioner = async () => {
  console.log("creating captioner...", captioner);
  captioner = await pipeline(
    "image-to-text",
    "Xenova/vit-gpt2-image-captioning"
  );
  console.log("created captioner", captioner);
};

registerModel(
  "image to text",
  () => {
    if (!captioner) {
      createCaptioner();
    }
  },
  async (image, canvas, context, mediaResultsElement) => {
    if (!captioner) {
      console.error("captioner not created yet");
      return;
    }
    if (isRunning) {
      return;
    }
    isRunning = true;

    const output = await captioner(image.src);
    console.log("captioner output", output);

    isRunning = false;

    if (output[0]) {
      mediaResultsElement.textContent = output[0].generated_text;
    }
  }
);
