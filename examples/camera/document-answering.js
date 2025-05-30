import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.4";

import { drawBox, registerModel } from "./utils.js";

let _pipeline = undefined;
let isRunning = false;

const createPipeline = async () => {
  _pipeline = await pipeline(
    "document-question-answering",
    "Xenova/donut-base-finetuned-docvqa"
  );
  console.log("created pipeline", _pipeline);
};

registerModel(
  "document answering",
  () => {
    if (!_pipeline) {
      createPipeline();
    }
  },
  async (image, canvas, context, mediaResultsElement) => {
    if (!_pipeline) {
      console.error("pipeline not created yet");
      return;
    }
    if (isRunning) {
      return;
    }
    isRunning = true;

    const question = "What is the invoice number?";
    console.log(`asking pipeline "${question}"`);
    const output = await _pipeline(image.src, question);
    console.log("pipeline output", output);

    isRunning = false;
  }
);
