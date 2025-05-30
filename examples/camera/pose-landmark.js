import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

import { registerModel } from "./utils.js";

let poseLandmarker = undefined;
let drawingUtils;
let runningMode = "VIDEO";

registerModel(
  "pose landmark",
  () => {
    if (!poseLandmarker) {
      createPoseLandmarker();
    }
  },
  async (image, canvas, context) => {
    if (!poseLandmarker) {
      console.error("poseLandmarker not created yet");
      return;
    }

    const result = poseLandmarker.detectForVideo(image, performance.now());
    console.log("poseLandmarkerResult", result);

    drawingUtils = drawingUtils || new DrawingUtils(context);

    context.save();
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const landmark of result.landmarks) {
      drawingUtils.drawLandmarks(landmark, {
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 2, 1),
      });
      drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    }
    context.restore();
  }
);

const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: "GPU",
    },
    runningMode: runningMode,
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false,
  });
  console.log("created poseLandmarker", poseLandmarker);
};
