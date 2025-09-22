import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

import { registerModel } from "./utils.js";

let faceLandmarker = undefined;
let runningMode = "VIDEO";
let drawingUtils;

registerModel(
  "face landmark",
  () => {
    if (!faceLandmarker) {
      createFaceLandmarker();
    }
  },
  async (image, canvas, context, mediaResultsElement) => {
    if (!faceLandmarker) {
      console.error("faceLandmarker not created yet");
      return;
    }

    drawingUtils = drawingUtils || new DrawingUtils(context);

    const results = faceLandmarker.detectForVideo(image, performance.now());

    console.log("faceLandmarkerResult", results);
    const blendShapeCategories = results?.faceBlendshapes?.[0]?.categories;
    if (blendShapeCategories) {
      const blendShapeCategoriesString = {};
      blendShapeCategories.forEach(({ categoryName, score }) => {
        blendShapeCategoriesString[categoryName] = score;
      });
      mediaResultsElement.textContent = JSON.stringify(
        blendShapeCategoriesString,
        null,
        2
      );
    }

    if (results.faceLandmarks) {
      for (const landmarks of results.faceLandmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: "#C0C0C070", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          { color: "#FF3030", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
          { color: "#FF3030", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          { color: "#30FF30", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
          { color: "#30FF30", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
          { color: "#E0E0E0", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LIPS,
          { color: "#E0E0E0", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
          { color: "#FF3030", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
          { color: "#30FF30", lineWidth: 1 }
        );
      }
    }
  }
);

const createFaceLandmarker = async () => {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFacialTransformationMatrixes: false,
  });
  console.log("created faceLandmarker", faceLandmarker);
};
