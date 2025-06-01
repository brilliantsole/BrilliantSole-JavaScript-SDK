import {
  ImageSegmenter,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2";

import { registerModel } from "./utils.js";

let imageSegmenter = undefined;
let runningMode = "LIVE_STREAM";
let labels;

const legendColors = [
  [255, 197, 0, 255], // Vivid Yellow
  [128, 62, 117, 255], // Strong Purple
  [255, 104, 0, 255], // Vivid Orange
  [166, 189, 215, 255], // Very Light Blue
  [193, 0, 32, 255], // Vivid Red
  [206, 162, 98, 255], // Grayish Yellow
  [129, 112, 102, 255], // Medium Gray
  [0, 125, 52, 255], // Vivid Green
  [246, 118, 142, 255], // Strong Purplish Pink
  [0, 83, 138, 255], // Strong Blue
  [255, 112, 92, 255], // Strong Yellowish Pink
  [83, 55, 112, 255], // Strong Violet
  [255, 142, 0, 255], // Vivid Orange Yellow
  [179, 40, 81, 255], // Strong Purplish Red
  [244, 200, 0, 255], // Vivid Greenish Yellow
  [127, 24, 13, 255], // Strong Reddish Brown
  [147, 170, 0, 255], // Vivid Yellowish Green
  [89, 51, 21, 255], // Deep Yellowish Brown
  [241, 58, 19, 255], // Vivid Reddish Orange
  [35, 44, 22, 255], // Dark Olive Green
  [0, 161, 194, 255], // Vivid Blue
];

registerModel(
  "image segmenter",
  () => {
    if (!imageSegmenter) {
      createImageSegmenter();
    }
  },
  async (image, canvas, context, mediaResultsElement) => {
    if (!imageSegmenter) {
      console.error("imageSegmenter not created yet");
      return;
    }

    const result = imageSegmenter.segmentForVideo(image, performance.now());

    console.log("imageSegmenter result", result);

    const { width, height } = result.categoryMask;
    let imageData = context.getImageData(0, 0, width, height).data;
    canvas.width = width;
    canvas.height = height;
    const mask = result.categoryMask.getAsUint8Array();
    for (let i in mask) {
      const legendColor = legendColors[mask[i] % legendColors.length];
      imageData[i * 4] = (legendColor[0] + imageData[i * 4]) / 2;
      imageData[i * 4 + 1] = (legendColor[1] + imageData[i * 4 + 1]) / 2;
      imageData[i * 4 + 2] = (legendColor[2] + imageData[i * 4 + 2]) / 2;
      imageData[i * 4 + 3] = (legendColor[3] + imageData[i * 4 + 3]) / 2;
    }
    const uint8Array = new Uint8ClampedArray(imageData.buffer);
    const dataNew = new ImageData(uint8Array, width, height);
    context.putImageData(dataNew, 0, 0);
  }
);

const modelAssetPaths = {
  selfieMulticlass:
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite",
  hairSegmenter:
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite",
  selfieSegmenter:
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
  deeplab:
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/latest/deeplab_v3.tflite",
};
const createImageSegmenter = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
  );

  imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: modelAssetPaths.selfieMulticlass,
      delegate: "GPU",
    },

    runningMode: runningMode,
    outputCategoryMask: true,
    outputConfidenceMasks: false,
  });
  labels = imageSegmenter.getLabels();
  console.log("created imageSegmenter", imageSegmenter, labels);
};
