import {
  ObjectDetector,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2";

import { drawBox, registerModel } from "./utils.js";

let objectDetector = undefined;
let runningMode = "VIDEO";

registerModel(
  "object detection",
  () => {
    if (!objectDetector) {
      createObjectDetector();
    }
  },
  async (image, canvas, context, mediaResultsElement) => {
    if (!objectDetector) {
      console.error("objectDetector not created yet");
      return;
    }

    const results = objectDetector.detectForVideo(image, performance.now());
    console.log("objectDetectorResults", results);

    let categoriesStringObject = [];
    results.detections.forEach((detection, index) => {
      const { boundingBox, categories } = detection;
      drawBox(boundingBox, image, canvas, context);
      const category = categories[0];
      if (category) {
        const { score, categoryName } = category;
        categoriesStringObject.push({ score, categoryName });
      }
    });

    mediaResultsElement.textContent = JSON.stringify(
      categoriesStringObject,
      null,
      2
    );
  }
);

const createObjectDetector = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
  );
  objectDetector = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
      delegate: "GPU",
    },
    scoreThreshold: 0.5,
    runningMode: runningMode,
  });
  console.log("created objectDetector", objectDetector);
};

const sampleResult = {
  detections: [
    {
      categories: [
        {
          score: 0.8662109375,
          index: -1,
          categoryName: "clock",
          displayName: "",
        },
      ],
      keypoints: [],
      boundingBox: {
        originX: 333,
        originY: 309,
        width: 244,
        height: 240,
      },
    },
    {
      categories: [
        {
          score: 0.53125,
          index: -1,
          categoryName: "person",
          displayName: "",
        },
      ],
      keypoints: [],
      boundingBox: {
        originX: 43,
        originY: 572,
        width: 189,
        height: 146,
      },
    },
  ],
};
