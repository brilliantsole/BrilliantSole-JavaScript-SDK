import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

import { registerModel } from "./utils.js";

let gestureRecognizer = undefined;
let drawingUtils;
let runningMode = "VIDEO";

registerModel(
  "gesture recognition",
  () => {
    if (!gestureRecognizer) {
      createGestureRecognizer();
    }
  },
  async (image, canvas, context, modelResultsElement) => {
    if (!gestureRecognizer) {
      console.error("gestureRecognizer not created yet");
      return;
    }

    const gestureRecognizerResult = gestureRecognizer.recognizeForVideo(
      image,
      performance.now()
    );
    console.log("gestureRecognizerResult", gestureRecognizerResult);

    if (gestureRecognizerResult.landmarks) {
      drawingUtils = drawingUtils || new DrawingUtils(context);

      for (const landmarks of gestureRecognizerResult.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          GestureRecognizer.HAND_CONNECTIONS,
          {
            color: "#00FF00",
            lineWidth: 5,
          }
        );
        drawingUtils.drawLandmarks(landmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });
      }
    }
    if (gestureRecognizerResult.gestures.length > 0) {
      const categoryName = gestureRecognizerResult.gestures[0][0].categoryName;
      const categoryScore = parseFloat(
        gestureRecognizerResult.gestures[0][0].score * 100
      ).toFixed(2);
      const handedness = gestureRecognizerResult.handednesses[0][0].displayName;
      console.log(
        `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`
      );
      modelResultsElement.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
    }
  }
);

const createGestureRecognizer = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      delegate: "GPU",
    },
    runningMode: runningMode,
    numHands: 1,

    /**
     * The minimum confidence score for the hand detection to be considered
     * successful. Defaults to 0.5.
     */
    minHandDetectionConfidence: 0.5,

    /**
     * The minimum confidence score of hand presence score in the hand landmark
     * detection.
     */
    minHandPresenceConfidence: 0.5,

    /**
     * The minimum confidence score for the hand tracking to be considered
     * successful.
     */
    minTrackingConfidence: 0.5,
  });
  console.log("created gestureRecognizer", gestureRecognizer);
};
